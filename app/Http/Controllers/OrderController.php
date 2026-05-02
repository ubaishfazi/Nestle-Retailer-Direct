<?php

namespace App\Http\Controllers;

use App\Models\DistributorInventory;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Promotion;
use App\Models\RetailerInventory;
use App\Models\User;
use App\Services\InvoiceService;
use App\Services\LoyaltyService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class OrderController extends Controller
{
    /**
     * Store a new order.
     */
    public function store(Request $request)
    {
        \Log::info('Order request data:', $request->all());

        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'nullable|integer|exists:products,id',
            'items.*.product_name' => 'required|string',
            'items.*.product_image' => 'nullable|string',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'distributor_id' => 'required|integer|exists:users,id',
            'payment_method' => 'nullable|in:cod,paypal,credit_card',
            'promo_code' => 'nullable|string',
        ], [
            'items.required' => 'Please select at least one item to order.',
            'items.min' => 'Please select at least one item to order.',
            'distributor_id.required' => 'Please select a distributor to place your order.',
        ]);

        // Validate that the selected distributor is approved
        $distributor = User::where('id', $validated['distributor_id'])
            ->where('role', 'distributor')
            ->where('approval_status', 'approved')
            ->first();

        if (! $distributor) {
            return response()->json([
                'success' => false,
                'errors' => ['distributor_id' => 'Selected distributor is not available.'],
            ], 422);
        }

        // Validate that order quantity doesn't exceed distributor warehouse stock
        foreach ($validated['items'] as $item) {
            if (! empty($item['product_id']) && ! empty($validated['distributor_id'])) {
                $distributorInventory = DistributorInventory::where('user_id', $validated['distributor_id'])
                    ->where('product_id', $item['product_id'])
                    ->first();

                $availableQuantity = $distributorInventory ? $distributorInventory->stock_quantity : 0;

                if ($item['quantity'] > $availableQuantity) {
                    $product = Product::find($item['product_id']);

                    // Return JSON error for AJAX requests
                    if ($request->expectsJson() || $request->header('X-Inertia')) {
                        return response()->json([
                            'success' => false,
                            'errors' => ['items' => "Only {$availableQuantity} units of {$product->name} available in warehouse."],
                        ], 422);
                    }

                    return back()->withErrors([
                        'items' => "Only {$availableQuantity} units of {$product->name} available in warehouse.",
                    ])->withInput();
                }
            }
        }

        \Log::info('Validated data:', $validated);

        // Calculate total amount
        $totalAmount = 0;
        foreach ($validated['items'] as $item) {
            $totalAmount += $item['quantity'] * $item['price'];
        }

        // Calculate best discount (loyalty or promo code)
        $loyaltyService = new LoyaltyService();
        $promotion = null;
        $discountAmount = 0;
        $loyaltyDiscountAmount = 0;
        $usedLoyaltyDiscount = false;
        $promotionId = null;

        // Get promotion if promo code is provided
        if (! empty($validated['promo_code'])) {
            $promotion = Promotion::where('promo_code', strtoupper($validated['promo_code']))->first();
        }

        // Calculate best discount using loyalty service
        $productIds = array_filter(array_column($validated['items'], 'product_id'));
        $discountResult = $loyaltyService->calculateBestDiscount(
            Auth::user(),
            $totalAmount,
            $promotion,
            $productIds
        );

        $discountAmount = $discountResult['discount_amount'];
        $loyaltyDiscountAmount = $discountResult['use_loyalty_discount'] ? $discountResult['loyalty_discount'] : 0;
        $usedLoyaltyDiscount = $discountResult['use_loyalty_discount'];

        if ($discountAmount > 0) {
            $totalAmount -= $discountAmount;
            $totalAmount = max(0, $totalAmount); // Ensure total doesn't go negative

            if ($usedLoyaltyDiscount) {
                $promotionId = null; // No promo code used
                \Log::info('Loyalty discount applied:', [
                    'discount_amount' => $loyaltyDiscountAmount,
                    'new_total' => $totalAmount,
                ]);
            } elseif ($promotion) {
                $promotionId = $promotion->id;
                \Log::info('Promotion applied:', [
                    'promo_code' => $promotion->promo_code,
                    'discount_amount' => $discountAmount,
                    'new_total' => $totalAmount,
                ]);
            }
        }

        // For PayPal payment, redirect to PayPal controller with order data (don't create order yet)
        if ($validated['payment_method'] === 'paypal') {
            // Return JSON with redirect URL to PayPal process endpoint
            return response()->json([
                'success' => true,
                'redirectUrl' => route('paypal.process'),
                'orderData' => [
                    'distributor_id' => $validated['distributor_id'],
                    'payment_method' => $validated['payment_method'],
                    'items' => $validated['items'],
                    'promotion_id' => $promotionId,
                    'discount_amount' => $discountAmount,
                    'loyalty_discount_amount' => $loyaltyDiscountAmount,
                    'used_loyalty_discount' => $usedLoyaltyDiscount,
                    'promo_code' => $validated['promo_code'] ?? null,
                ],
            ]);
        }

        // For Credit Card payment, process immediately (mock payment - instant success)
        if ($validated['payment_method'] === 'credit_card') {
            $order = Order::create([
                'user_id' => Auth::id(),
                'distributor_id' => $validated['distributor_id'],
                'status' => 'pending',
                'total_amount' => $totalAmount,
                'payment_method' => 'credit_card',
                'payment_status' => 'paid',
                'promotion_id' => $promotionId,
                'discount_amount' => $discountAmount,
                'loyalty_discount_amount' => $loyaltyDiscountAmount,
                'used_loyalty_discount' => $usedLoyaltyDiscount,
                'promo_code' => $validated['promo_code'] ?? null,
            ]);

            foreach ($validated['items'] as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product_id'] ?? null,
                    'product_name' => $item['product_name'],
                    'product_image' => $item['product_image'] ?? null,
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'subtotal' => $item['quantity'] * $item['price'],
                ]);
            }

            // Increment promotion usage count
            if ($promotion) {
                $promotion->incrementUsage();
            }

            return response()->json([
                'success' => true,
            ]);
        }

        // For COD, create the order
        $order = Order::create([
            'user_id' => Auth::id(),
            'distributor_id' => $validated['distributor_id'],
            'status' => 'pending',
            'total_amount' => $totalAmount,
            'payment_method' => $validated['payment_method'] ?? 'cod',
            'payment_status' => 'pending',
            'promotion_id' => $promotionId,
            'discount_amount' => $discountAmount,
            'loyalty_discount_amount' => $loyaltyDiscountAmount,
            'used_loyalty_discount' => $usedLoyaltyDiscount,
            'promo_code' => $validated['promo_code'] ?? null,
        ]);

        foreach ($validated['items'] as $item) {
            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $item['product_id'] ?? null,
                'product_name' => $item['product_name'],
                'product_image' => $item['product_image'] ?? null,
                'quantity' => $item['quantity'],
                'price' => $item['price'],
                'subtotal' => $item['quantity'] * $item['price'],
            ]);
        }

        // Increment promotion usage count
        if ($promotion) {
            $promotion->incrementUsage();
        }

        // For COD, redirect to my-orders
        return redirect()->route('my-orders')->with('success', 'Order placed successfully!');
    }

    /**
     * Display all orders for admin dashboard.
     */
    public function index()
    {
        $orders = Order::with(['user', 'items'])
            ->latest()
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'status' => $order->status,
                    'total_amount' => (float) $order->total_amount,
                    'created_at' => $order->created_at->diffForHumans(),
                    'created_date' => $order->created_at->format('M d, Y'),
                    'user' => [
                        'id' => $order->user->id,
                        'name' => $order->user->name,
                        'email' => $order->user->email,
                    ],
                    'items' => $order->items->map(function ($item) {
                        return [
                            'product_name' => $item->product_name,
                            'product_image' => $item->product_image,
                            'quantity' => (int) $item->quantity,
                            'price' => (float) $item->price,
                            'subtotal' => (float) $item->subtotal,
                        ];
                    })->toArray(),
                ];
            })->toArray();

        $stats = [
            'total_orders' => (int) Order::count(),
            'pending_orders' => (int) Order::where('status', 'pending')->count(),
            'total_revenue' => (float) Order::sum('total_amount'),
        ];

        \Log::info('Orders data sent to frontend:', ['orders' => $orders, 'stats' => $stats]);

        return inertia('dashboard/orders', [
            'orders' => $orders,
            'stats' => $stats,
        ]);
    }

    /**
     * Approve an order.
     */
    public function approve(Order $order)
    {
        // Load order items
        $order->load('items');

        $order->update(['status' => 'approved']);

        // Get the retailer (user who placed the order)
        $retailerId = $order->user_id;

        // Process each order item
        foreach ($order->items as $item) {
            if (! empty($item->product_id)) {
                // Decrease stock from distributor warehouse
                $product = Product::find($item->product_id);
                if ($product) {
                    $newWarehouseQuantity = $product->stock_quantity - $item->quantity;
                    $product->update(['stock_quantity' => max(0, $newWarehouseQuantity)]);
                }

                // Increase stock in retailer inventory
                $retailerInventory = RetailerInventory::where('user_id', $retailerId)
                    ->where('product_id', $item->product_id)
                    ->first();

                if ($retailerInventory) {
                    // Update existing inventory
                    $retailerInventory->increment('stock_quantity', $item->quantity);
                } else {
                    // Create new inventory record
                    RetailerInventory::create([
                        'user_id' => $retailerId,
                        'product_id' => $item->product_id,
                        'stock_quantity' => $item->quantity,
                    ]);
                }
            }
        }

        // Generate invoice automatically after order approval (digital invoice archive)
        if (! $order->invoice) {
            try {
                $invoice = app(InvoiceService::class)->generateInvoice($order);
                \Log::info('Invoice generated automatically for order', [
                    'order_id' => $order->id,
                    'invoice_number' => $invoice->invoice_number,
                ]);
            } catch (\Exception $e) {
                \Log::error('Failed to generate invoice for order', [
                    'order_id' => $order->id,
                    'error' => $e->getMessage(),
                ]);
                // Don't fail the approval if invoice generation fails
            }
        } else {
            \Log::info('Invoice already exists for order, skipping generation', [
                'order_id' => $order->id,
            ]);
        }

        return redirect()->back()->with('success', 'Order approved successfully! Invoice has been generated.');
    }

    /**
     * Reject an order.
     */
    public function reject(Order $order)
    {
        $order->update(['status' => 'rejected']);

        return redirect()->back()->with('success', 'Order rejected.');
    }

    /**
     * Display all orders for the authenticated user.
     */
    public function myOrders()
    {
        $orders = Order::with(['items', 'distributor', 'invoice'])
            ->where('user_id', Auth::id())
            ->latest()
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'status' => $order->status,
                    'total_amount' => (float) $order->total_amount,
                    'discount_amount' => (float) $order->discount_amount,
                    'promo_code' => $order->promo_code,
                    'created_at' => $order->created_at->diffForHumans(),
                    'created_date' => $order->created_at->format('M d, Y'),
                    'distributor_name' => $order->distributor->name ?? 'N/A',
                    'has_invoice' => $order->invoice !== null,
                    'invoice_number' => $order->invoice?->invoice_number,
                    'items' => $order->items->map(function ($item) {
                        return [
                            'product_name' => $item->product_name,
                            'product_image' => $item->product_image,
                            'quantity' => (int) $item->quantity,
                            'price' => (float) $item->price,
                            'subtotal' => (float) $item->subtotal,
                        ];
                    })->toArray(),
                ];
            })->toArray();

        $stats = [
            'total_orders' => (int) Order::where('user_id', Auth::id())->count(),
            'pending_orders' => (int) Order::where('user_id', Auth::id())->where('status', 'pending')->count(),
            'completed_orders' => (int) Order::where('user_id', Auth::id())->whereIn('status', ['approved', 'completed'])->count(),
            'total_spent' => (float) Order::where('user_id', Auth::id())->whereIn('status', ['approved', 'completed'])->sum('total_amount'),
        ];

        return inertia('myorderrecords', [
            'orders' => $orders,
            'stats' => $stats,
        ]);
    }

    /**
     * Display user profile page.
     */
    public function userProfile()
    {
        $user = Auth::user()->load(['shopProfile', 'distributorProfile']);

        $phone = null;
        $address = null;
        $city = null;
        $shopName = null;
        $companyName = null;

        if ($user->isRetailer() && $user->shopProfile) {
            $phone = $user->shopProfile->shop_phone;
            $address = $user->shopProfile->shop_address;
            $city = $user->shopProfile->shop_city;
            $shopName = $user->shopProfile->shop_name;
        } elseif ($user->isDistributor() && $user->distributorProfile) {
            $phone = $user->distributorProfile->company_phone;
            $address = $user->distributorProfile->company_address;
            $city = $user->distributorProfile->company_city;
            $companyName = $user->distributorProfile->company_name;
        }

        return inertia('UserProfile', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $phone,
                'address' => $address,
                'city' => $city,
                'shopName' => $shopName,
                'companyName' => $companyName,
                'created_at' => $user->created_at,
            ],
        ]);
    }
}
