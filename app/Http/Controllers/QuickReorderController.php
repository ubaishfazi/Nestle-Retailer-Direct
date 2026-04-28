<?php

namespace App\Http\Controllers;

use App\Models\DistributorInventory;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\RetailerInventory;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class QuickReorderController extends Controller
{
    public function index()
    {
        $retailerId = auth()->id();

        // Get only APPROVED distributors with their stock quantities
        $distributors = User::where('role', 'distributor')
            ->where('approval_status', 'approved')
            ->with('distributorProfile')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'company_name' => $user->distributorProfile?->company_name ?? null,
                    'company_city' => $user->distributorProfile?->company_city ?? null,
                ];
            })->values();

        // Get all distributor inventory data
        $distributorInventory = DistributorInventory::with('product')->get();

        $products = Product::all()->map(function ($product) use ($retailerId, $distributorInventory) {
            // Get retailer's personal inventory quantity
            $retailerInventory = RetailerInventory::where('user_id', $retailerId)
                ->where('product_id', $product->id)
                ->first();

            $retailerQuantity = $retailerInventory ? $retailerInventory->stock_quantity : 0;

            // Get total warehouse quantity across all distributors
            $warehouseQuantity = $distributorInventory
                ->where('product_id', $product->id)
                ->sum('stock_quantity');

            return [
                'id' => $product->id,
                'name' => $product->name,
                'description' => $product->description,
                'price' => (float) $product->price,
                'image' => $product->image_url ?? '/images/placeholder-product.png',
                'stock_quantity' => $retailerQuantity,
                'warehouse_quantity' => $warehouseQuantity,
            ];
        })->values();

        return inertia('quick-reorder', [
            'products' => $products,
            'distributors' => $distributors,
        ]);
    }

    /**
     * Store a new order with payment method.
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
            'payment_method' => 'required|in:cod,paypal',
        ], [
            'items.required' => 'Please select at least one item to order.',
            'items.min' => 'Please select at least one item to order.',
            'distributor_id.required' => 'Please select a distributor to place your order.',
            'payment_method.required' => 'Please select a payment method.',
        ]);

        // Validate that order quantity doesn't exceed distributor warehouse stock
        foreach ($validated['items'] as $item) {
            if (! empty($item['product_id']) && ! empty($validated['distributor_id'])) {
                $distributorInventory = DistributorInventory::where('user_id', $validated['distributor_id'])
                    ->where('product_id', $item['product_id'])
                    ->first();

                $availableQuantity = $distributorInventory ? $distributorInventory->stock_quantity : 0;

                if ($item['quantity'] > $availableQuantity) {
                    $product = Product::find($item['product_id']);

                    return back()->withErrors([
                        'items' => "Only {$availableQuantity} units of {$product->name} available in warehouse.",
                    ])->withInput();
                }
            }
        }

        \Log::info('Validated data:', $validated);

        $totalAmount = 0;
        foreach ($validated['items'] as $item) {
            $totalAmount += $item['quantity'] * $item['price'];
        }

        // If PayPal, store order data in session and redirect to PayPal (don't create order yet)
        if ($validated['payment_method'] === 'paypal') {
            session([
                'pending_paypal_order' => [
                    'distributor_id' => $validated['distributor_id'],
                    'payment_method' => $validated['payment_method'],
                    'items' => $validated['items'],
                    'total_amount' => $totalAmount,
                ],
            ]);

            return redirect()->route('paypal.process');
        }

        // For COD (Cash on Delivery), create the order
        $order = Order::create([
            'user_id' => Auth::id(),
            'distributor_id' => $validated['distributor_id'],
            'status' => 'pending',
            'total_amount' => $totalAmount,
            'payment_method' => $validated['payment_method'],
            'payment_status' => 'pending',
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

        // For COD, redirect to my-orders with success
        return redirect()->route('my-orders')->with('success', 'Order placed successfully!');
    }

    /**
     * Get distributor inventory for API.
     */
    public function getDistributorInventory($distributorId)
    {
        $inventory = DistributorInventory::where('user_id', $distributorId)
            ->with('product')
            ->get()
            ->map(function ($item) {
                return [
                    'product_id' => $item->product_id,
                    'stock_quantity' => $item->stock_quantity,
                ];
            })->values();

        return response()->json($inventory);
    }
}
