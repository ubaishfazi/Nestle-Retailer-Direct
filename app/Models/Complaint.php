<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Complaint extends Model
{
    protected $fillable = [
        'user_id',
        'order_id',
        'product_id',
        'product_name',
        'product_image',
        'quantity',
        'description',
        'image_path',
        'complaint_id',
        'status',
        'distributor_response',
        'distributor_id',
        'resolved_at',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'resolved_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($complaint) {
            $complaint->complaint_id = 'CMP-'.strtoupper(uniqid());
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function distributor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'distributor_id');
    }

    public function items()
    {
        return $this->hasMany(ComplaintItem::class);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    public function approve(?string $response = null): void
    {
        $this->update([
            'status' => 'approved',
            'distributor_response' => $response,
            'resolved_at' => now(),
        ]);
    }

    public function reject(string $reason): void
    {
        $this->update([
            'status' => 'rejected',
            'distributor_response' => $reason,
            'resolved_at' => now(),
        ]);
    }

    public function markPending(): void
    {
        $this->update([
            'status' => 'pending',
        ]);
    }
}
