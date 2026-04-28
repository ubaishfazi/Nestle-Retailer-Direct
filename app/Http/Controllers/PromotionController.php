<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Promotion;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PromotionController extends Controller
{
    /**
     * Display a listing of promotions.
     */
    public function index()
    {
        $promotions = Promotion::withCount('products')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($promotion) {
                return $this->transformPromotion($promotion);
            });

        $stats = [
            'total' => Promotion::count(),
            'active' => Promotion::where('is_active', true)->count(),
            'expired' => Promotion::where('expiry_date', '<', Carbon::now())->count(),
            'scheduled' => Promotion::where('start_date', '>', Carbon::now())->count(),
        ];

        return inertia('admin/promotions/index', [
            'promotions' => $promotions,
            'stats' => $stats,
        ]);
    }

    /**
     * Show the form for creating a new promotion.
     */
    public function create()
    {
        $products = Product::select('id', 'name', 'price')
            ->orderBy('name')
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'price' => (float) $product->price,
                ];
            });

        return inertia('admin/promotions/create', [
            'products' => $products,
        ]);
    }

    /**
     * Store a newly created promotion in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'promo_code' => 'required|string|unique:promotions,promo_code',
            'discount_type' => 'required|in:percentage,fixed',
            'discount_value' => 'required|numeric|min:0',
            'minimum_order_amount' => 'nullable|numeric|min:0',
            'maximum_discount_amount' => 'nullable|numeric|min:0',
            'start_date' => 'required|date',
            'expiry_date' => 'required|date|after:start_date',
            'is_active' => 'boolean',
            'usage_limit' => 'nullable|integer|min:1',
            'product_ids' => 'nullable|array',
            'product_ids.*' => 'integer|exists:products,id',
        ]);

        $promotion = Promotion::create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'promo_code' => strtoupper($validated['promo_code']),
            'discount_type' => $validated['discount_type'],
            'discount_value' => $validated['discount_value'],
            'minimum_order_amount' => $validated['minimum_order_amount'] ?? null,
            'maximum_discount_amount' => $validated['maximum_discount_amount'] ?? null,
            'start_date' => Carbon::parse($validated['start_date']),
            'expiry_date' => Carbon::parse($validated['expiry_date']),
            'is_active' => $validated['is_active'] ?? true,
            'usage_limit' => $validated['usage_limit'] ?? null,
        ]);

        if (! empty($validated['product_ids'])) {
            $promotion->products()->attach($validated['product_ids']);
        }

        return redirect()->route('admin.promotions.index')
            ->with('success', 'Promotion created successfully.');
    }

    /**
     * Show the form for editing the specified promotion.
     */
    public function edit(Promotion $promotion)
    {
        $promotion->load('products');

        $products = Product::select('id', 'name', 'price')
            ->orderBy('name')
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'price' => (float) $product->price,
                ];
            });

        $promotionData = $this->transformPromotion($promotion);
        $promotionData['selected_product_ids'] = $promotion->products->pluck('id')->toArray();

        return inertia('admin/promotions/edit', [
            'promotion' => $promotionData,
            'products' => $products,
        ]);
    }

    /**
     * Update the specified promotion in storage.
     */
    public function update(Request $request, Promotion $promotion)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'promo_code' => 'required|string|unique:promotions,promo_code,'.$promotion->id,
            'discount_type' => 'required|in:percentage,fixed',
            'discount_value' => 'required|numeric|min:0',
            'minimum_order_amount' => 'nullable|numeric|min:0',
            'maximum_discount_amount' => 'nullable|numeric|min:0',
            'start_date' => 'required|date',
            'expiry_date' => 'required|date|after:start_date',
            'is_active' => 'boolean',
            'usage_limit' => 'nullable|integer|min:1',
            'product_ids' => 'nullable|array',
            'product_ids.*' => 'integer|exists:products,id',
        ]);

        $promotion->update([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'promo_code' => strtoupper($validated['promo_code']),
            'discount_type' => $validated['discount_type'],
            'discount_value' => $validated['discount_value'],
            'minimum_order_amount' => $validated['minimum_order_amount'] ?? null,
            'maximum_discount_amount' => $validated['maximum_discount_amount'] ?? null,
            'start_date' => Carbon::parse($validated['start_date']),
            'expiry_date' => Carbon::parse($validated['expiry_date']),
            'is_active' => $validated['is_active'] ?? true,
            'usage_limit' => $validated['usage_limit'] ?? null,
        ]);

        if (! empty($validated['product_ids'])) {
            $promotion->products()->sync($validated['product_ids']);
        } else {
            $promotion->products()->detach();
        }

        return redirect()->route('admin.promotions.index')
            ->with('success', 'Promotion updated successfully.');
    }

    /**
     * Remove the specified promotion from storage.
     */
    public function destroy(Promotion $promotion)
    {
        $promotion->delete();

        return redirect()->route('admin.promotions.index')
            ->with('success', 'Promotion deleted successfully.');
    }

    /**
     * Validate and apply promo code.
     */
    public function validatePromoCode(Request $request)
    {
        $validated = $request->validate([
            'promo_code' => 'required|string',
            'product_ids' => 'required|array',
            'product_ids.*' => 'integer',
            'order_total' => 'required|numeric|min:0',
        ]);

        $promotion = Promotion::where('promo_code', strtoupper($validated['promo_code']))->first();

        if (! $promotion) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid promo code.',
            ], 422);
        }

        if (! $promotion->isValid()) {
            $message = 'This promotion is ';
            if (! $promotion->is_active) {
                $message .= 'no longer active.';
            } elseif (Carbon::now()->lt($promotion->start_date)) {
                $message .= 'not yet started. It will begin on '.$promotion->start_date->format('M d, Y');
            } elseif (Carbon::now()->gt($promotion->expiry_date)) {
                $message .= 'expired. It expired on '.$promotion->expiry_date->format('M d, Y');
            } else {
                $message .= 'no longer available.';
            }

            return response()->json([
                'success' => false,
                'message' => $message,
            ], 422);
        }

        $discount = $promotion->calculateDiscount(
            $validated['order_total'],
            $validated['product_ids']
        );

        if ($discount <= 0) {
            return response()->json([
                'success' => false,
                'message' => 'This promotion does not apply to your order.',
            ], 422);
        }

        return response()->json([
            'success' => true,
            'promotion' => [
                'id' => $promotion->id,
                'title' => $promotion->title,
                'promo_code' => $promotion->promo_code,
                'discount_type' => $promotion->discount_type,
                'discount_value' => (float) $promotion->discount_value,
                'discount_amount' => $discount,
            ],
        ]);
    }

    /**
     * Generate a unique promo code.
     */
    public function generatePromoCode()
    {
        $prefix = 'NESTLE';
        $random = strtoupper(Str::random(6));
        $promoCode = $prefix.$random;

        // Ensure uniqueness
        while (Promotion::where('promo_code', $promoCode)->exists()) {
            $random = strtoupper(Str::random(6));
            $promoCode = $prefix.$random;
        }

        return response()->json([
            'promo_code' => $promoCode,
        ]);
    }

    /**
     * Get active promotions for retailer homepage.
     */
    public function activePromotions()
    {
        $promotions = Promotion::valid()
            ->with('products:id,name')
            ->orderBy('start_date', 'asc')
            ->get()
            ->map(function ($promotion) {
                return [
                    'id' => $promotion->id,
                    'title' => $promotion->title,
                    'description' => $promotion->description,
                    'promo_code' => $promotion->promo_code,
                    'discount_type' => $promotion->discount_type,
                    'discount_value' => (float) $promotion->discount_value,
                    'minimum_order_amount' => $promotion->minimum_order_amount ? (float) $promotion->minimum_order_amount : null,
                    'start_date' => $promotion->start_date->format('Y-m-d'),
                    'expiry_date' => $promotion->expiry_date->format('Y-m-d'),
                    'products' => $promotion->products->map(function ($product) {
                        return [
                            'id' => $product->id,
                            'name' => $product->name,
                        ];
                    }),
                    'days_remaining' => Carbon::now()->diffInDays($promotion->expiry_date, false),
                ];
            });

        return response()->json([
            'promotions' => $promotions,
        ]);
    }

    /**
     * Retailer promotions page
     */
    public function retailerPromotions()
    {
        return inertia('retailer/promotions');
    }

    /**
     * Transform promotion data for frontend.
     */
    private function transformPromotion($promotion)
    {
        $now = Carbon::now();
        $status = 'inactive';

        if (! $promotion->is_active) {
            $status = 'inactive';
        } elseif ($now->lt($promotion->start_date)) {
            $status = 'scheduled';
        } elseif ($now->gt($promotion->expiry_date)) {
            $status = 'expired';
        } else {
            $status = 'active';
        }

        return [
            'id' => $promotion->id,
            'title' => $promotion->title,
            'description' => $promotion->description,
            'promo_code' => $promotion->promo_code,
            'discount_type' => $promotion->discount_type,
            'discount_value' => (float) $promotion->discount_value,
            'minimum_order_amount' => $promotion->minimum_order_amount ? (float) $promotion->minimum_order_amount : null,
            'maximum_discount_amount' => $promotion->maximum_discount_amount ? (float) $promotion->maximum_discount_amount : null,
            'start_date' => $promotion->start_date->format('Y-m-d H:i'),
            'expiry_date' => $promotion->expiry_date->format('Y-m-d H:i'),
            'is_active' => $promotion->is_active,
            'usage_limit' => $promotion->usage_limit,
            'usage_count' => $promotion->usage_count,
            'products_count' => $promotion->products_count ?? 0,
            'status' => $status,
            'days_remaining' => $status === 'active' ? $now->diffInDays($promotion->expiry_date, false) : null,
            'created_at' => $promotion->created_at->format('Y-m-d H:i'),
        ];
    }
}
