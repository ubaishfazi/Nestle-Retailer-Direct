<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'approval_status',
        'approved_at',
        'approved_by',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'approved_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Get the shop profile for this user (retailers).
     */
    public function shopProfile(): HasOne
    {
        return $this->hasOne(ShopProfile::class);
    }

    /**
     * Get the distributor profile for this user.
     */
    public function distributorProfile(): HasOne
    {
        return $this->hasOne(DistributorProfile::class);
    }

    /**
     * Get all orders for this user.
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Get retailer inventory for this user.
     */
    public function retailerInventory(): HasMany
    {
        return $this->hasMany(RetailerInventory::class);
    }

    /**
     * Get invoices for this user.
     */
    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    /**
     * Check if the user is an admin.
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Check if the user is a retailer.
     */
    public function isRetailer(): bool
    {
        return $this->role === 'retailer';
    }

    /**
     * Check if the user is a distributor.
     */
    public function isDistributor(): bool
    {
        return $this->role === 'distributor';
    }

    /**
     * Get the role name for display purposes.
     */
    public function getRoleName(): string
    {
        return ucfirst($this->role);
    }

    /**
     * Check if the user is pending approval.
     */
    public function isPending(): bool
    {
        return $this->approval_status === 'pending';
    }

    /**
     * Check if the user is approved.
     */
    public function isApproved(): bool
    {
        return $this->approval_status === 'approved';
    }

    /**
     * Check if the user is rejected.
     */
    public function isRejected(): bool
    {
        return $this->approval_status === 'rejected';
    }

    /**
     * Get the approval status label.
     */
    public function getApprovalStatusLabel(): string
    {
        return ucfirst($this->approval_status ?? 'Pending');
    }

    /**
     * Get the admin who approved this user.
     */
    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
