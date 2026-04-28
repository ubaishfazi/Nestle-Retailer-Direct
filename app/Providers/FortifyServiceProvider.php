<?php

namespace App\Providers;

use App\Actions\Fortify\CreateNewUser;
use App\Actions\Fortify\ResetUserPassword;
use App\Models\User;
use Illuminate\Auth\Events\Login;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Laravel\Fortify\Contracts\RegisterResponse;
use Laravel\Fortify\Features;
use Laravel\Fortify\Fortify;
use Laravel\Fortify\Http\Responses\LoginResponse;

class FortifyServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureActions();
        $this->configureViews();
        $this->configureRateLimiting();
        $this->configureRegistrationResponse();
    }

    /**
     * Configure Fortify actions.
     */
    private function configureActions(): void
    {
        Fortify::resetUserPasswordsUsing(ResetUserPassword::class);
        Fortify::createUsersUsing(CreateNewUser::class);

        // Custom authentication callback with approval status check
        Fortify::authenticateUsing(function (Request $request) {
            $credentials = $request->only(Fortify::username(), 'password');

            // First verify credentials without logging in
            if (! Auth::attempt($credentials, false)) {
                return null;
            }

            $user = Auth::user();

            // Check if user is pending approval
            if ($user && $user->isPending()) {
                Auth::logout();
                // Store email and show pending message
                $request->session()->put('email_for_approval_check', $user->email);
                $request->session()->put('status', 'Your account is pending admin approval. Please wait for approval before logging in.');

                return null;
            }

            // Check if user is rejected
            if ($user && $user->isRejected()) {
                Auth::logout();
                $request->session()->put('status', 'Your account has been rejected. Please contact support for more information.');

                return null;
            }

            // Now actually log in
            Auth::attempt($credentials, $request->boolean('remember'));
            $request->session()->regenerate();
            event(new Login(Auth::guard('web'), $user, true));

            return $user;
        });

        // Bind custom LoginResponse for role-based redirect
        $this->app->singleton(LoginResponseContract::class, function ($app) {
            return new class implements LoginResponseContract
            {
                public function toResponse($request)
                {
                    $user = Auth::user();

                    if ($user && $user->isAdmin()) {
                        return redirect()->intended('/dashboard');
                    }

                    if ($user && $user->isDistributor()) {
                        return redirect()->intended('/distributor/home');
                    }

                    if ($user && $user->isRetailer()) {
                        return redirect()->intended('/');
                    }

                    return redirect()->intended('/');
                }
            };
        });
    }

    /**
     * Configure Fortify views.
     */
    private function configureViews(): void
    {
        Fortify::loginView(fn (Request $request) => Inertia::render('auth/login', [
            'canResetPassword' => Features::enabled(Features::resetPasswords()),
            'canRegister' => Features::enabled(Features::registration()),
            'status' => $this->getLoginStatusMessage($request),
        ]));

        Fortify::resetPasswordView(fn (Request $request) => Inertia::render('auth/reset-password', [
            'email' => $request->email,
            'token' => $request->route('token'),
        ]));

        Fortify::requestPasswordResetLinkView(fn (Request $request) => Inertia::render('auth/forgot-password', [
            'status' => $request->session()->get('status'),
        ]));

        Fortify::verifyEmailView(fn (Request $request) => Inertia::render('auth/verify-email', [
            'status' => $request->session()->get('status'),
        ]));

        Fortify::registerView(fn (Request $request) => Inertia::render('auth/register', [
            'status' => $request->session()->get('status'),
        ]));

        Fortify::confirmPasswordView(fn () => Inertia::render('auth/confirm-password'));
    }

    /**
     * Configure rate limiting.
     */
    private function configureRateLimiting(): void
    {
        RateLimiter::for('login', function (Request $request) {
            $throttleKey = Str::transliterate(Str::lower($request->input(Fortify::username())).'|'.$request->ip());

            return Limit::perMinute(5)->by($throttleKey);
        });
    }

    /**
     * Get the appropriate status message for the login page.
     * Checks if the user's approval status has changed since registration.
     */
    private function getLoginStatusMessage(Request $request): ?string
    {
        $sessionStatus = $request->session()->get('status');
        $email = $request->session()->get('email_for_approval_check');

        // If there's a session status about pending approval, check if user was since approved
        if ($sessionStatus && str_contains($sessionStatus, 'pending admin approval')) {
            if ($email) {
                $user = User::where('email', $email)->first();

                if ($user && $user->isApproved()) {
                    // User has been approved, show success message instead
                    // Persist so refresh keeps showing it until user clicks proceed
                    $request->session()->put('status', 'Admin approved success! You can now login with your credentials.');

                    return 'Admin approved success! You can now login with your credentials.';
                }

                if ($user && $user->isRejected()) {
                    // User has been rejected
                    $request->session()->put('status', 'Your account has been rejected. Please contact support for more information.');
                    $request->session()->forget('email_for_approval_check');

                    return 'Your account has been rejected. Please contact support for more information.';
                }

                // Still pending - persist the status so refresh keeps showing it
                $request->session()->put('status', $sessionStatus);

                return $sessionStatus;
            }

            // No email in session, just return the status
            return $sessionStatus;
        }

        // If status is the approved message, persist it
        if ($sessionStatus && str_contains($sessionStatus, 'Admin approved success')) {
            $request->session()->put('status', $sessionStatus);

            return $sessionStatus;
        }

        // If status is the rejected message, persist it
        if ($sessionStatus && str_contains($sessionStatus, 'has been rejected')) {
            $request->session()->put('status', $sessionStatus);

            return $sessionStatus;
        }

        // If status is the "Account created successfully" message (from registration), persist it
        if ($sessionStatus && str_contains($sessionStatus, 'Account created successfully')) {
            $request->session()->put('status', $sessionStatus);

            return $sessionStatus;
        }

        return $sessionStatus;
    }

    /**
     * Configure registration response to redirect to login with pending message.
     */
    private function configureRegistrationResponse(): void
    {
        $this->app->singleton(RegisterResponse::class, function () {
            return new class implements RegisterResponse
            {
                public function toResponse($request)
                {
                    // Logout the user after registration (Fortify auto-logs in)
                    auth()->logout();

                    // Store the email for approval status checking on login page
                    $request->session()->put('email_for_approval_check', $request->input('email'));

                    // Store status in session (not flash, so it persists on refresh)
                    $request->session()->put('status', 'Account created successfully! Your account is pending admin approval. You will be able to login once approved.');

                    // Redirect to login page
                    return redirect()->route('login');
                }
            };
        });
    }
}
