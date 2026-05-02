<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LoyaltyTier extends Model
{
    protected $fillable = [
        'name',
        'color',
        'min_points',
        'max_points',
        'discount_type',
        'discount_value',
        'max_discount_amount',
        'description',
        'benefits',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'discount_value' => 'decimal:2',
        'max_discount_amount' => 'decimal:2',
        'min_points' => 'integer',
        'max_points' => 'integer',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    /**
     * Get all users in this loyalty tier.
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'loyalty_tier_id');
    }

    /**
     * Check if this tier is currently active.
     */
    public function isActive(): bool
    {
        return $this->is_active;
    }

    /**
     * Calculate discount amount for an order.
     */
    public function calculateDiscount(float $orderTotal): float
    {
        if (! $this->isActive()) {
            return 0.00;
        }

        $discount = 0.00;

        if ($this->discount_type === 'percentage') {
            $discount = ($orderTotal * $this->discount_value) / 100;

            // Apply maximum discount cap if set
            if ($this->max_discount_amount !== null && $discount > $this->max_discount_amount) {
                $discount = $this->max_discount_amount;
            }
        } else {
            // Fixed discount
            $discount = $this->discount_value;
        }

        // Don't allow discount to exceed order total
        return min($discount, $orderTotal);
    }

    /**
     * Check if a retailer with given points qualifies for this tier.
     */
    public function qualifiesForTier(int $points): bool
    {
        if ($points < $this->min_points) {
            return false;
        }

        if ($this->max_points !== null && $points > $this->max_points) {
            return false;
        }

        return true;
    }

    /**
     * Get the next tier (if any).
     */
    public function getNextTier(): ?self
    {
        return self::where('is_active', true)
            ->where('min_points', '>', $this->min_points)
            ->orderBy('min_points', 'asc')
            ->first();
    }

    /**
     * Get points needed to reach next tier.
     */
    public function pointsToNextTier(int $currentPoints): ?int
    {
        $nextTier = $this->getNextTier();
        
        if (! $nextTier) {
            return null; // No next tier (highest tier)
        }

        return max(0, $nextTier->min_points - $currentPoints);
    }

    /**
     * Get progress percentage to next tier.
     */
    public function progressToNextTier(int $currentPoints): ?float
    {
        $nextTier = $this->getNextTier();
        
        if (! $nextTier) {
            return 100.0; // Already at highest tier
        }

        if ($currentPoints >= $nextTier->min_points) {
            return 100.0;
        }

        $range = $nextTier->min_points - $this->min_points;
        $progress = $currentPoints - $this->min_points;

        return $range > 0 ? ($progress / $range) * 100 : 100.0;
    }

    /**
     * Scope for active tiers.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope ordered by sort order.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order', 'asc');
    }

    /**
     * Get tier by points (finds the appropriate tier for given points).
     */
    public static function getTierForPoints(int $points): ?self
    {
        return self::active()
            ->ordered()
            ->where('min_points', '<=', $points)
            ->where(function ($q) use ($points) {
                $q->whereNull('max_points')
                    ->orWhere('max_points', '>=', $points);
            })
            ->first();
    }
}