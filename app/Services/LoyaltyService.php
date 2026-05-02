<?php

namespace App\Services;

use App\Models\LoyaltyTier;
use App\Models\Order;
use App\Models\Promotion;
use App\Models\User;

class LoyaltyService
{
    /**
     * Calculate the best discount for an order (loyalty or promo code).
     * Returns an array with discount details.
     */
    public function calculateBestDiscount(User $user, float $orderTotal, ?Promotion $promotion = null, array $productIds = []): array
    {
        $loyaltyDiscount = 0.00;
        $promoDiscount = 0.00;
        $useLoyaltyDiscount = false;
        $appliedDiscount = 0.00;
        $discountSource = null;
        $discountMessage = null;

        // Calculate loyalty discount if user has a tier
        if ($user->hasLoyaltyTier()) {
            $loyaltyDiscount = $user->loyaltyTier->calculateDiscount($orderTotal);
        }

        // Calculate promo code discount if promotion is provided and valid
        if ($promotion && $promotion->isValid()) {
            $promoDiscount = $promotion->calculateDiscount($orderTotal, $productIds);
        }

        // Choose the better discount
        if ($loyaltyDiscount > 0 && $promoDiscount > 0) {
            // Both discounts available - use the higher one
            if ($loyaltyDiscount >= $promoDiscount) {
                $appliedDiscount = $loyaltyDiscount;
                $useLoyaltyDiscount = true;
                $discountSource = 'loyalty';
                $discountMessage = "Loyalty discount applied ({$user->getLoyaltyDiscountDisplay()}) - Better than promo code";
            } else {
                $appliedDiscount = $promoDiscount;
                $discountSource = 'promo';
                $discountMessage = "Promo code discount applied - Better than loyalty discount";
            }
        } elseif ($loyaltyDiscount > 0) {
            $appliedDiscount = $loyaltyDiscount;
            $useLoyaltyDiscount = true;
            $discountSource = 'loyalty';
            $discountMessage = "Loyalty discount applied ({$user->getLoyaltyDiscountDisplay()})";
        } elseif ($promoDiscount > 0) {
            $appliedDiscount = $promoDiscount;
            $discountSource = 'promo';
            $discountMessage = "Promo code discount applied";
        }

        return [
            'discount_amount' => $appliedDiscount,
            'loyalty_discount' => $loyaltyDiscount,
            'promo_discount' => $promoDiscount,
            'use_loyalty_discount' => $useLoyaltyDiscount,
            'discount_source' => $discountSource,
            'discount_message' => $discountMessage,
            'final_amount' => $orderTotal - $appliedDiscount,
        ];
    }

    /**
     * Calculate loyalty points for an order.
     */
    public function calculatePointsForOrder(float $orderAmount): int
    {
        return User::calculatePointsForOrder($orderAmount);
    }

    /**
     * Award loyalty points for a completed order.
     */
    public function awardPointsForOrder(Order $order): void
    {
        $user = $order->user;

        if (! $user->isRetailer()) {
            return; // Only retailers get loyalty points
        }

        // Calculate points based on final amount paid (after discounts)
        $finalAmount = $order->total_amount - $order->discount_amount - $order->loyalty_discount_amount;
        
        if ($finalAmount <= 0) {
            return;
        }

        $points = $this->calculatePointsForOrder($finalAmount);

        if ($points > 0) {
            $user->addLoyaltyPoints($points);
        }
    }

    /**
     * Get user's loyalty status for display.
     */
    public function getLoyaltyStatus(User $user): ?array
    {
        if (! $user->hasLoyaltyTier()) {
            // Check if user has any points
            if ($user->loyalty_points > 0) {
                $nextTier = LoyaltyTier::active()
                    ->ordered()
                    ->where('min_points', '>', $user->loyalty_points)
                    ->first();

                return [
                    'has_tier' => false,
                    'points' => $user->loyalty_points,
                    'next_tier' => $nextTier ? [
                        'name' => $nextTier->name,
                        'min_points' => $nextTier->min_points,
                        'points_needed' => $nextTier->min_points - $user->loyalty_points,
                        'discount' => $nextTier->discount_type === 'percentage' 
                            ? "{$nextTier->discount_value}%" 
                            : "LKR " . number_format($nextTier->discount_value, 2),
                    ] : null,
                ];
            }

            return null;
        }

        $tier = $user->loyaltyTier;
        $pointsToNext = $tier->pointsToNextTier($user->loyalty_points);
        $progress = $tier->progressToNextTier($user->loyalty_points);

        return [
            'has_tier' => true,
            'tier' => [
                'id' => $tier->id,
                'name' => $tier->name,
                'color' => $tier->color,
                'discount' => $user->getLoyaltyDiscountDisplay(),
                'discount_type' => $tier->discount_type,
                'discount_value' => (float) $tier->discount_value,
                'max_discount_amount' => $tier->max_discount_amount ? (float) $tier->max_discount_amount : null,
                'description' => $tier->description,
                'benefits' => $tier->benefits,
            ],
            'points' => $user->loyalty_points,
            'next_tier' => $pointsToNext !== null ? [
                'points_needed' => $pointsToNext,
                'progress' => round($progress, 1),
            ] : null,
            'is_max_tier' => $pointsToNext === null,
        ];
    }

    /**
     * Get all active loyalty tiers for display.
     */
    public function getAllTiers(): array
    {
        $tiers = LoyaltyTier::active()
            ->ordered()
            ->get();

        return $tiers->map(function ($tier) {
            return [
                'id' => $tier->id,
                'name' => $tier->name,
                'color' => $tier->color,
                'min_points' => $tier->min_points,
                'max_points' => $tier->max_points,
                'discount' => $tier->discount_type === 'percentage' 
                    ? "{$tier->discount_value}%" 
                    : "LKR " . number_format($tier->discount_value, 2),
                'discount_type' => $tier->discount_type,
                'discount_value' => (float) $tier->discount_value,
                'max_discount_amount' => $tier->max_discount_amount ? (float) $tier->max_discount_amount : null,
                'description' => $tier->description,
                'benefits' => $tier->benefits,
                'user_count' => $tier->users()->count(),
            ];
        })->toArray();
    }

    /**
     * Check if a user qualifies for a specific tier.
     */
    public function qualifiesForTier(User $user, LoyaltyTier $tier): bool
    {
        return $tier->qualifiesForTier($user->loyalty_points);
    }

    /**
     * Update all users' tiers based on their current points.
     * Useful for when tier thresholds change.
     */
    public function updateAllUserTiers(): int
    {
        $users = User::where('role', 'retailer')
            ->whereNotNull('loyalty_tier_id')
            ->get();

        $updated = 0;

        foreach ($users as $user) {
            $newTier = LoyaltyTier::getTierForPoints($user->loyalty_points);
            
            if ($newTier && $newTier->id !== $user->loyalty_tier_id) {
                $user->loyalty_tier_id = $newTier->id;
                $user->save();
                $updated++;
            }
        }

        return $updated;
    }

    /**
     * Get loyalty statistics for admin dashboard.
     */
    public function getLoyaltyStats(): array
    {
        $totalRetailers = User::where('role', 'retailer')->count();
        $retailersWithTier = User::where('role', 'retailer')
            ->whereNotNull('loyalty_tier_id')
            ->count();
        
        $tierDistribution = LoyaltyTier::active()
            ->ordered()
            ->get()
            ->map(function ($tier) {
                return [
                    'tier_name' => $tier->name,
                    'tier_color' => $tier->color,
                    'user_count' => $tier->users()->where('role', 'retailer')->count(),
                ];
            });

        $totalPointsIssued = User::where('role', 'retailer')
            ->sum('loyalty_points');

        return [
            'total_retailers' => $totalRetailers,
            'retailers_with_tier' => $retailersWithTier,
            'retailers_without_tier' => $totalRetailers - $retailersWithTier,
            'tier_distribution' => $tierDistribution,
            'total_points_issued' => $totalPointsIssued,
        ];
    }
}