<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class Retailer
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! Auth::check() || ! Auth::user()->isRetailer()) {
            // For AJAX/API requests, return JSON response instead of redirect
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Unauthorized.'], 401);
            }

            // Redirect users to their appropriate dashboard based on role
            if (Auth::check()) {
                $user = Auth::user();

                if ($user->isAdmin()) {
                    return redirect()->route('dashboard');
                }

                if ($user->isDistributor()) {
                    return redirect()->route('distributor.home');
                }
            }

            // For unauthenticated users, redirect to login
            return redirect()->route('login');
        }

        return $next($request);
    }
}
