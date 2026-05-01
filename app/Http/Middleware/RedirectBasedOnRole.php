<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RedirectBasedOnRole
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::check()) {
            $user = Auth::user();
            $currentRoute = $request->route()->getName();

            // Define route prefixes for each role
            $adminRoutes = ['dashboard', 'dashboard.'];
            $distributorRoutes = ['distributor', 'distributor.'];
            $retailerRoutes = ['retailer', 'retailer.', 'my-orders', 'products', 'stock', 'quick-reorder'];

            // Check if user is trying to access a route for a different role
            $isAdminRoute = false;
            $isDistributorRoute = false;
            $isRetailerRoute = false;

            foreach ($adminRoutes as $prefix) {
                if (str_starts_with($currentRoute, $prefix)) {
                    $isAdminRoute = true;
                    break;
                }
            }

            foreach ($distributorRoutes as $prefix) {
                if (str_starts_with($currentRoute, $prefix)) {
                    $isDistributorRoute = true;
                    break;
                }
            }

            foreach ($retailerRoutes as $prefix) {
                if (str_starts_with($currentRoute, $prefix) || $currentRoute === $prefix) {
                    $isRetailerRoute = true;
                    break;
                }
            }

            // Redirect based on role mismatch
            if ($user->isAdmin() && ($isDistributorRoute || $isRetailerRoute)) {
                if ($request->expectsJson()) {
                    return response()->json(['message' => 'Unauthorized.'], 401);
                }
                return redirect()->route('dashboard');
            }

            if ($user->isDistributor() && ($isAdminRoute || $isRetailerRoute)) {
                if ($request->expectsJson()) {
                    return response()->json(['message' => 'Unauthorized.'], 401);
                }
                return redirect()->route('distributor.home');
            }

            if ($user->isRetailer() && ($isAdminRoute || $isDistributorRoute)) {
                if ($request->expectsJson()) {
                    return response()->json(['message' => 'Unauthorized.'], 401);
                }
                return redirect()->route('home');
            }

            // If user is trying to access the home route, redirect based on role
            if ($currentRoute === 'home') {
                if ($user->isDistributor()) {
                    return redirect()->route('distributor.home');
                }

                if ($user->isAdmin()) {
                    return redirect()->route('dashboard');
                }

                // Retailers stay on home (nestle-system-analysis page)
            }
        }

        return $next($request);
    }
}
