<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model
{
    protected $fillable = [
        'user_id',
        'distributor_id',
        'status',
        'total_amount',
        'notes',
        'payment_method',
        'payment_status',
        'paypal_transaction_id',
        'promotion_id',
        'discount_amount',
        'promo_code',
        'loyalty_discount_amount',
        'used_loyalty_discount',
    ];

    protected $casts = [
        'loyalty_discount_amount' => 'decimal:2',
        'used_loyalty_discount' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function distributor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'distributor_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function promotion(): BelongsTo
    {
        return $this->belongsTo(Promotion::class);
    }

    public function invoice(): HasOne
    {
        return $this->hasOne(Invoice::class);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }
}
