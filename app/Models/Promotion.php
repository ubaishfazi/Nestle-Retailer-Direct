<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Promotion extends Model
{
    protected $fillable = [
        'title',
        'description',
        'promo_code',
        'discount_type',
        'discount_value',
        'minimum_order_amount',
        'maximum_discount_amount',
        'start_date',
        'expiry_date',
        'is_active',
        'usage_limit',
        'usage_count',
    ];

    protected $casts = [
        'discount_value' => 'decimal:2',
        'minimum_order_amount' => 'decimal:2',
        'maximum_discount_amount' => 'decimal:2',
        'start_date' => 'datetime',
        'expiry_date' => 'datetime',
        'is_active' => 'boolean',
        'usage_limit' => 'integer',
        'usage_count' => 'integer',
    ];

    /**
     * Get the products this promotion applies to.
     */
    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'promotion_products');
    }

    /**
     * Check if promotion is currently valid (active and within date range).
     */
    public function isValid(): bool
    {
        if (! $this->is_active) {
            return false;
        }

        $now = Carbon::now();

        if ($now->lt($this->start_date) || $now->gt($this->expiry_date)) {
            return false;
        }

        if ($this->usage_limit !== null && $this->usage_count >= $this->usage_limit) {
            return false;
        }

        return true;
    }

    /**
     * Check if promotion applies to specific product IDs.
     */
    public function appliesToProducts(array $productIds): bool
    {
        // If no products are specified, applies to all
        if ($this->products()->count() === 0) {
            return true;
        }

        $promotionProductIds = $this->products()->pluck('products.id')->toArray();

        return ! empty(array_intersect($productIds, $promotionProductIds));
    }

    /**
     * Calculate discount amount for an order.
     */
    public function calculateDiscount(float $orderTotal, array $productIds = []): float
    {
        if (! $this->isValid()) {
            return 0.00;
        }

        // Check minimum order amount
        if ($this->minimum_order_amount !== null && $orderTotal < $this->minimum_order_amount) {
            return 0.00;
        }

        // Check if applies to products
        if (! empty($productIds) && ! $this->appliesToProducts($productIds)) {
            return 0.00;
        }

        $discount = 0.00;

        if ($this->discount_type === 'percentage') {
            $discount = ($orderTotal * $this->discount_value) / 100;

            // Apply maximum discount cap if set
            if ($this->maximum_discount_amount !== null && $discount > $this->maximum_discount_amount) {
                $discount = $this->maximum_discount_amount;
            }
        } else {
            // Fixed discount
            $discount = $this->discount_value;
        }

        // Don't allow discount to exceed order total
        return min($discount, $orderTotal);
    }

    /**
     * Increment the usage count.
     */
    public function incrementUsage(): void
    {
        $this->increment('usage_count');
    }

    /**
     * Scope for active promotions.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for valid promotions (within date range and not expired).
     */
    public function scopeValid($query)
    {
        $now = Carbon::now();

        return $query->where('is_active', true)
            ->where('start_date', '<=', $now)
            ->where('expiry_date', '>=', $now)
            ->where(function ($q) {
                $q->whereNull('usage_limit')
                    ->orWhereColumn('usage_count', '<', 'usage_limit');
            });
    }
}
