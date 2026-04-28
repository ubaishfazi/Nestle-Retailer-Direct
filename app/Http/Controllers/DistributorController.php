<?php

namespace App\Http\Controllers;

use App\Models\DistributorInventory;
use App\Models\Order;
use App\Models\Product;
use App\Models\RetailerInventory;
use App\Models\User;
use App\Services\InvoiceService;
use Illuminate\Http\Request;

class DistributorController extends Controller
{
    /**
     * Display distributor home page.
     */
    public function home()
    {
        $user = auth()->user();
        $distributorProfile = $user->distributorProfile;
        $distributorId = $user->id;

        // Get quick stats
        $stats = [
            'pending_orders' => Order::where('distributor_id', $distributorId)->where('status', 'pending')->count(),
            'total_retailers' => User::where('role', 'retailer')->count(),
            'in_transit' => Order::where('distributor_id', $distributorId)->where('status', 'in_transit')->count(),
        ];

        return inertia('distributor-home', [
            'name' => $user->name,
            'companyName' => $distributorProfile?->company_name ?? 'Distributor',
            'stats' => $stats,
        ]);
    }

    /**
     * Display distributor orders (DF04, DF05).
     */
    public function orders(Request $request)
    {
        $query = Order::with(['user', 'items']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $orders = $query->latest()->get()->map(function ($order) {
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
                    'shop_name' => $order->user->shopProfile?->shop_name,
                ],
                'items' => $order->items->map(function ($item) {
                    return [
                        'product_name' => $item->product_name,
                        'quantity' => (int) $item->quantity,
                        'price' => (float) $item->price,
                        'subtotal' => (float) $item->subtotal,
                    ];
                })->toArray(),
            ];
        })->toArray();

        return inertia('distributor/orders', [
            'orders' => $orders,
            'stats' => [
                'total_orders' => Order::count(),
                'pending_orders' => Order::where('status', 'pending')->count(),
                'approved_orders' => Order::where('status', 'approved')->count(),
                'in_transit' => Order::where('status', 'in_transit')->count(),
                'delivered' => Order::where('status', 'delivered')->count(),
            ],
        ]);
    }

    /**
     * Display retailer orders assigned to this distributor.
     */
    public function retailerOrders(Request $request)
    {
        $distributorId = auth()->id();

        $query = Order::with(['user', 'items'])
            ->where('distributor_id', $distributorId);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $orders = $query->latest()->get()->map(function ($order) {
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
                    'shop_name' => $order->user->shopProfile?->shop_name,
                ],
                'items' => $order->items->map(function ($item) {
                    return [
                        'product_name' => $item->product_name,
                        'quantity' => (int) $item->quantity,
                        'price' => (float) $item->price,
                        'subtotal' => (float) $item->subtotal,
                    ];
                })->toArray(),
            ];
        })->toArray();

        return inertia('distributor/retailer-orders', [
            'orders' => $orders,
            'stats' => [
                'total_orders' => Order::where('distributor_id', $distributorId)->count(),
                'pending_orders' => Order::where('distributor_id', $distributorId)->where('status', 'pending')->count(),
                'approved_orders' => Order::where('distributor_id', $distributorId)->where('status', 'approved')->count(),
                'rejected_orders' => Order::where('distributor_id', $distributorId)->where('status', 'rejected')->count(),
            ],
        ]);
    }

    /**
     * Display incoming orders (new UI).
     */
    public function incomingOrders(Request $request)
    {
        $distributorId = auth()->id();

        $query = Order::with(['user.shopProfile', 'items'])
            ->where('distributor_id', $distributorId);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $orders = $query->latest()->get()->map(function ($order) {
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
                    'shop_name' => $order->user->shopProfile?->shop_name,
                    'phone' => $order->user->shopProfile?->shop_phone,
                    'address' => $order->user->shopProfile?->shop_address,
                ],
                'items' => $order->items->map(function ($item) {
                    return [
                        'product_name' => $item->product_name,
                        'quantity' => (int) $item->quantity,
                        'price' => (float) $item->price,
                        'subtotal' => (float) $item->subtotal,
                    ];
                })->toArray(),
            ];
        })->toArray();

        return inertia('distributor/incoming-orders', [
            'orders' => $orders,
            'stats' => [
                'total_orders' => Order::where('distributor_id', $distributorId)->count(),
                'pending_orders' => Order::where('distributor_id', $distributorId)->where('status', 'pending')->count(),
                'approved_orders' => Order::where('distributor_id', $distributorId)->where('status', 'approved')->count(),
                'rejected_orders' => Order::where('distributor_id', $distributorId)->where('status', 'rejected')->count(),
            ],
        ]);
    }

    /**
     * Approve an incoming order.
     */
    public function approveIncomingOrder(Order $order)
    {
        // Verify the order belongs to this distributor
        if ($order->distributor_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        // Load order items
        $order->load('items');

        $order->update(['status' => 'approved']);

        // Get the retailer (user who placed the order)
        $retailerId = $order->user_id;
        // Get the distributor who approved (current user)
        $distributorId = auth()->id();

        // Process each order item
        foreach ($order->items as $item) {
            if (! empty($item->product_id)) {
                // Decrease stock from distributor warehouse
                $distributorInventory = DistributorInventory::where('user_id', $distributorId)
                    ->where('product_id', $item->product_id)
                    ->first();

                if ($distributorInventory) {
                    $distributorInventory->decrement('stock_quantity', $item->quantity);
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
        try {
            app(InvoiceService::class)->generateInvoice($order);
            \Log::info('Invoice generated automatically for order', [
                'order_id' => $order->id,
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to generate invoice for order', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);
            // Don't fail the approval if invoice generation fails
        }

        return redirect()->back()->with('success', 'Order approved successfully! Invoice has been generated.');
    }

    /**
     * Reject an incoming order.
     */
    public function rejectIncomingOrder(Order $order)
    {
        // Verify the order belongs to this distributor
        if ($order->distributor_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        $order->update(['status' => 'rejected']);

        return redirect()->back()->with('success', 'Order rejected.');
    }

    /**
     * Approve an order (DF04).
     */
    public function approveOrder(Order $order)
    {
        // Load order items
        $order->load('items');

        $order->update(['status' => 'approved']);

        // Get the retailer (user who placed the order)
        $retailerId = $order->user_id;
        // Get the distributor who approved (current user)
        $distributorId = auth()->id();

        // Process each order item
        foreach ($order->items as $item) {
            if (! empty($item->product_id)) {
                // Decrease stock from distributor warehouse
                $distributorInventory = DistributorInventory::where('user_id', $distributorId)
                    ->where('product_id', $item->product_id)
                    ->first();

                if ($distributorInventory) {
                    $distributorInventory->decrement('stock_quantity', $item->quantity);
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
        try {
            app(InvoiceService::class)->generateInvoice($order);
            \Log::info('Invoice generated automatically for order', [
                'order_id' => $order->id,
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to generate invoice for order', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);
            // Don't fail the approval if invoice generation fails
        }

        return redirect()->back()->with('success', 'Order approved successfully! Invoice has been generated.');
    }

    /**
     * Reject an order (DF04).
     */
    public function rejectOrder(Order $order)
    {
        $order->update(['status' => 'rejected']);

        return redirect()->back()->with('success', 'Order rejected.');
    }

    /**
     * Approve a retailer order.
     */
    public function approveRetailerOrder(Order $order)
    {
        // Verify the order belongs to this distributor
        if ($order->distributor_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        // Load order items
        $order->load('items');

        $order->update(['status' => 'approved']);

        // Get the retailer (user who placed the order)
        $retailerId = $order->user_id;
        // Get the distributor who approved (current user)
        $distributorId = auth()->id();

        // Process each order item
        foreach ($order->items as $item) {
            if (! empty($item->product_id)) {
                // Decrease stock from distributor warehouse
                $distributorInventory = DistributorInventory::where('user_id', $distributorId)
                    ->where('product_id', $item->product_id)
                    ->first();

                if ($distributorInventory) {
                    $distributorInventory->decrement('stock_quantity', $item->quantity);
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
        try {
            app(InvoiceService::class)->generateInvoice($order);
            \Log::info('Invoice generated automatically for order', [
                'order_id' => $order->id,
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to generate invoice for order', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);
            // Don't fail the approval if invoice generation fails
        }

        return redirect()->back()->with('success', 'Order approved successfully! Invoice has been generated.');
    }

    /**
     * Reject a retailer order.
     */
    public function rejectRetailerOrder(Order $order)
    {
        // Verify the order belongs to this distributor
        if ($order->distributor_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        $order->update(['status' => 'rejected']);

        return redirect()->back()->with('success', 'Order rejected.');
    }

    /**
     * Update order status (DF05).
     */
    public function updateOrderStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'required|in:approved,in_transit,delivered',
        ]);

        $order->update(['status' => $validated['status']]);

        return redirect()->back()->with('success', 'Order status updated successfully!');
    }

    /**
     * Display delivery tracking (DF07, DF09).
     */
    public function delivery()
    {
        $orders = Order::with(['user'])
            ->whereIn('status', ['approved', 'in_transit'])
            ->latest()
            ->get();

        return inertia('distributor/delivery', [
            'orders' => $orders,
        ]);
    }

    /**
     * Display statistics (DF08).
     */
    public function statistics()
    {
        $stats = [
            'total_orders' => Order::count(),
            'total_revenue' => Order::sum('total_amount'),
            'total_retailers' => User::where('role', 'retailer')->count(),
            'orders_by_status' => Order::selectRaw('status, count(*) as count')
                ->groupBy('status')
                ->get()
                ->pluck('count', 'status')
                ->toArray(),
        ];

        return inertia('distributor/statistics', [
            'stats' => $stats,
        ]);
    }

    /**
     * Display delivery schedule (DF07).
     */
    public function schedule()
    {
        return inertia('distributor/schedule');
    }

    /**
     * Display retailers management (DF08).
     */
    public function retailers()
    {
        $retailers = User::where('role', 'retailer')
            ->with(['shopProfile', 'orders'])
            ->get()
            ->map(function ($retailer) {
                return [
                    'id' => $retailer->id,
                    'name' => $retailer->name,
                    'email' => $retailer->email,
                    'shop_name' => $retailer->shopProfile?->shop_name,
                    'shop_city' => $retailer->shopProfile?->shop_city,
                    'total_orders' => $retailer->orders->count(),
                    'total_spent' => $retailer->orders->sum('total_amount'),
                ];
            });

        return inertia('distributor/retailers', [
            'retailers' => $retailers,
        ]);
    }

    /**
     * Display tracking dashboard (DF09).
     */
    public function dashboard()
    {
        $stats = [
            'pending_orders' => Order::where('status', 'pending')->count(),
            'approved_orders' => Order::where('status', 'approved')->count(),
            'in_transit' => Order::where('status', 'in_transit')->count(),
            'delivered' => Order::where('status', 'delivered')->count(),
            'rejected_orders' => Order::where('status', 'rejected')->count(),
        ];

        return inertia('distributor/dashboard', [
            'stats' => $stats,
        ]);
    }

    /**
     * Display notifications.
     */
    public function notifications()
    {
        return inertia('distributor/notifications');
    }

    /**
     * Display warehouse inventory.
     */
    public function warehouseInventory()
    {
        $distributorId = auth()->id();

        // Get distributor's inventory for all products
        $products = Product::all()->map(function ($product) use ($distributorId) {
            $distributorInventory = DistributorInventory::where('user_id', $distributorId)
                ->where('product_id', $product->id)
                ->first();

            $quantity = $distributorInventory ? $distributorInventory->stock_quantity : 0;

            return [
                'id' => $product->id,
                'name' => $product->name,
                'description' => $product->description,
                'price' => (float) $product->price,
                'image' => $product->image_url ?? '/images/placeholder-product.png',
                'stock_status' => $quantity > 20 ? 'in_stock' : ($quantity > 0 ? 'low_stock' : 'out_of_stock'),
                'stock_quantity' => $quantity,
            ];
        });

        $stats = [
            'total_products' => $products->count(),
            'in_stock' => $products->filter(fn ($p) => $p['stock_status'] === 'in_stock')->count(),
            'low_stock' => $products->filter(fn ($p) => $p['stock_status'] === 'low_stock')->count(),
            'out_of_stock' => $products->filter(fn ($p) => $p['stock_status'] === 'out_of_stock')->count(),
        ];

        return inertia('distributor/warehouse-inventory', [
            'products' => $products,
            'stats' => $stats,
        ]);
    }

    /**
     * Restock warehouse inventory.
     */
    public function restock(Request $request, Product $product)
    {
        $distributorId = auth()->id();
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        // Update distributor's inventory
        $distributorInventory = DistributorInventory::where('user_id', $distributorId)
            ->where('product_id', $product->id)
            ->first();

        if ($distributorInventory) {
            $distributorInventory->stock_quantity = $distributorInventory->stock_quantity + $validated['quantity'];
            $distributorInventory->save();
        } else {
            DistributorInventory::create([
                'user_id' => $distributorId,
                'product_id' => $product->id,
                'stock_quantity' => $validated['quantity'],
            ]);
        }

        // Redirect back to warehouse inventory page
        return redirect()->route('distributor.warehouse-inventory');
    }

    /**
     * Delete multiple approved orders.
     */
    public function deleteApprovedOrders(Request $request)
    {
        $validated = $request->validate([
            'order_ids' => 'required|array|min:1',
            'order_ids.*' => 'required|integer|exists:orders,id',
        ]);

        // Delete only approved orders
        Order::whereIn('id', $validated['order_ids'])
            ->where('status', 'approved')
            ->delete();

        return redirect()->back()->with('success', 'Orders deleted successfully!');
    }
}
