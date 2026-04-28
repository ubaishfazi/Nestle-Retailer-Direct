<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class Distributor
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user() || ! $request->user()->isDistributor()) {
            // Redirect users to their appropriate dashboard based on role
            if ($request->user()) {
                if ($request->user()->isAdmin()) {
                    return redirect()->route('dashboard');
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
