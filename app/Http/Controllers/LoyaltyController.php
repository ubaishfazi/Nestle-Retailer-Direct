<?php

namespace App\Http\Controllers;

use App\Services\LoyaltyService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class LoyaltyController extends Controller
{
    public function __construct(
        private LoyaltyService $loyaltyService
    ) {}

    /**
     * Get current user's loyalty status.
     */
    public function status(Request $request)
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'message' => 'Unauthenticated',
            ], 401);
        }

        $loyaltyStatus = $this->loyaltyService->getLoyaltyStatus($user);

        return response()->json([
            'loyalty' => $loyaltyStatus,
        ]);
    }

    /**
     * Calculate discount for cart (for preview before order).
     */
    public function calculateDiscount(Request $request)
    {
        $request->validate([
            'cart_total' => 'required|numeric|min:0',
            'promo_code' => 'nullable|string',
            'product_ids' => 'nullable|array',
        ]);

        $user = $request->user();

        if (! $user) {
            return response()->json([
                'discount_amount' => 0,
                'final_amount' => $request->cart_total,
                'message' => 'Please login to see your loyalty discount',
            ]);
        }

        $promotion = null;
        
        // If promo code is provided, try to find it
        if ($request->promo_code) {
            $promotion = \App\Models\Promotion::where('promo_code', $request->promo_code)
                ->first();
        }

        $result = $this->loyaltyService->calculateBestDiscount(
            $user,
            (float) $request->cart_total,
            $promotion,
            $request->product_ids ?? []
        );

        return response()->json($result);
    }

    /**
     * Get all loyalty tiers (for display purposes).
     */
    public function tiers()
    {
        $tiers = $this->loyaltyService->getAllTiers();

        return response()->json([
            'tiers' => $tiers,
        ]);
    }

    /**
     * Admin: View loyalty program management page.
     */
    public function adminIndex()
    {
        $tiers = $this->loyaltyService->getAllTiers();
        $stats = $this->loyaltyService->getLoyaltyStats();

        return Inertia::render('Admin/Loyalty/Index', [
            'tiers' => $tiers,
            'stats' => $stats,
        ]);
    }

    /**
     * Admin: Get loyalty statistics.
     */
    public function adminStats()
    {
        $stats = $this->loyaltyService->getLoyaltyStats();

        return response()->json([
            'stats' => $stats,
        ]);
    }
}