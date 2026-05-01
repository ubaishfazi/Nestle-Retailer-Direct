<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user() || ! $request->user()->isAdmin()) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Unauthorized.'], 401);
            }

            // Redirect users to their appropriate dashboard based on role
            if ($request->user()) {
                if ($request->user()->isDistributor()) {
                    return redirect()->route('distributor.home');
                }

                if ($request->user()->isRetailer()) {
                    return redirect()->route('home');
                }
            }

            // For unauthenticated users, redirect to login
            return redirect()->route('login');
        }

        return $next($request);
    }
}
