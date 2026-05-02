<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        
        // Share loyalty data for retailers
        $loyaltyData = null;
        if ($user && $user->isRetailer()) {
            $loyaltyService = new \App\Services\LoyaltyService();
            $loyaltyData = $loyaltyService->getLoyaltyStatus($user);
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'csrf_token' => csrf_token(),
            'flash' => [
                'success' => $request->session()->get('success'),
                'status' => $request->session()->get('status'),
                'error' => $request->session()->get('error'),
            ],
            'auth' => [
                'user' => $user,
                'role' => $user?->role ?? null,
                'isAdmin' => $user?->isAdmin() ?? false,
                'isDistributor' => $user?->isDistributor() ?? false,
                'isRetailer' => $user?->isRetailer() ?? false,
            ],
            'loyalty' => $loyaltyData,
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
