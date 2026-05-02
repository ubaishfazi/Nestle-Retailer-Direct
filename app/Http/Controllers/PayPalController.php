<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Promotion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Srmklive\PayPal\Services\PayPal as PayPalClient;

class PayPalController extends Controller
{
    /**
     * Process PayPal payment for an order.
     * Stores order data in session, creates order only after payment succeeds.
     */
    public function processPayment(Request $request)
    {
        $orderData = null;

        // Check if order data comes from POST request (quick-reorder.tsx)
        $orderDataJson = $request->input('order_data');
        if ($orderDataJson) {
            $orderData = json_decode($orderDataJson, true);
            if (! $orderData) {
                return redirect()->back()->withErrors(['paypal' => 'Invalid order data.']);
            }
        }
        // Check if order data already in session (QuickReorderController redirect)
        elseif (session()->has('pending_paypal_order')) {
            $orderData = session('pending_paypal_order');
        }

        if (! $orderData) {
            return redirect()->back()->withErrors(['paypal' => 'No order data provided.']);
        }

        // Additional validation for order data structure
        if (empty($orderData['distributor_id']) || empty($orderData['items'])) {
            return redirect()->back()->withErrors(['paypal' => 'Invalid order data.']);
        }

        // Calculate total amount from items
        $totalAmount = 0;
        foreach ($orderData['items'] as $item) {
            $totalAmount += $item['quantity'] * $item['price'];
        }

        // Use discount data computed by OrderController
        $discountAmount = $orderData['discount_amount'] ?? 0;
        $promotionId = $orderData['promotion_id'] ?? null;
        $loyaltyDiscountAmount = $orderData['loyalty_discount_amount'] ?? 0;
        $usedLoyaltyDiscount = $orderData['used_loyalty_discount'] ?? false;
        $promoCode = $orderData['promo_code'] ?? null;

        // Subtract the discount from total
        $totalAmount -= $discountAmount;
        $totalAmount = max(0, $totalAmount);

        // Store order data in session for later creation after payment success
        session([
            'pending_paypal_order' => [
                'distributor_id' => $orderData['distributor_id'],
                'payment_method' => $orderData['payment_method'] ?? 'paypal',
                'items' => $orderData['items'],
                'total_amount' => $totalAmount,
                'promotion_id' => $promotionId,
                'discount_amount' => $discountAmount,
                'loyalty_discount_amount' => $loyaltyDiscountAmount,
                'used_loyalty_discount' => $usedLoyaltyDiscount,
                'promo_code' => $promoCode,
            ],
        ]);

        // Check if PayPal credentials are configured
        $paypalConfig = config('paypal');
        $useMockPayment = empty($paypalConfig['sandbox']['username']) || empty($paypalConfig['sandbox']['password']);

        // If credentials are configured, use real PayPal
        if (! $useMockPayment) {
            try {
                $provider = new PayPalClient;
                $provider->setApiCredentials($paypalConfig);
                $provider->getAccessToken();

                $response = $provider->createOrder([
                    'intent' => 'CAPTURE',
                    'purchase_units' => [
                        [
                            'amount' => [
                                'currency_code' => 'USD',
                                'value' => number_format($totalAmount, 2, '.', ''),
                                'breakdown' => [
                                    'item_total' => [
                                        'currency_code' => 'USD',
                                        'value' => number_format($totalAmount, 2, '.', ''),
                                    ],
                                ],
                            ],
                            'description' => 'Quick Reorder Order',
                             'items' => collect($orderData['items'])->map(function ($item) {
                                return [
                                    'name' => $item['product_name'],
                                    'quantity' => (string) $item['quantity'],
                                    'unit_amount' => [
                                        'currency_code' => 'USD',
                                        'value' => number_format($item['price'], 2, '.', ''),
                                    ],
                                ];
                            })->toArray(),
                        ],
                    ],
                    'application_context' => [
                        'return_url' => route('paypal.success'),
                        'cancel_url' => route('paypal.cancel'),
                    ],
                ]);

                if (isset($response['id']) && $response['id']) {
                    // Redirect to PayPal
                    foreach ($response['links'] as $link) {
                        if ($link['rel'] === 'approve') {
                            return redirect()->away($link['href']);
                        }
                    }
                }

                return redirect()->back()->withErrors(['paypal' => 'Failed to create PayPal payment.']);
            } catch (\Exception $e) {
                \Log::error('PayPal API Error: '.$e->getMessage());

                return redirect()->back()->withErrors(['paypal' => 'PayPal API error: '.$e->getMessage()]);
            }
        }

        // MOCK PAYPAL MODE: Render mock PayPal checkout page using Blade view
        return view('paypal.mock', [
            'orderId' => 0, // No order ID yet - order will be created after payment
            'amount' => (float) $totalAmount,
            'returnUrl' => route('paypal.success'),
            'cancelUrl' => route('paypal.cancel'),
        ]);
    }

    /**
     * Handle PayPal success/capture payment.
     * Creates the order only after payment succeeds.
     */
    public function success(Request $request)
    {
        // Get pending order data from session
        $orderData = session('pending_paypal_order');

        if (! $orderData) {
            return redirect()->route('quick-reorder')->withErrors(['paypal' => 'No pending order found. Please place your order again.']);
        }

        // Check if using mock PayPal (no credentials configured)
        $paypalConfig = config('paypal');
        $useMockPayment = empty($paypalConfig['sandbox']['username']) || empty($paypalConfig['sandbox']['password']);

        if ($useMockPayment) {
            // Mock PayPal - create the order now
            $order = Order::create([
                'user_id' => Auth::id(),
                'distributor_id' => $orderData['distributor_id'],
                'status' => 'pending',
                'total_amount' => $orderData['total_amount'],
                'payment_method' => $orderData['payment_method'],
                'payment_status' => 'paid',
                'paypal_transaction_id' => 'MOCK-'.strtoupper(uniqid()),
                'promotion_id' => $orderData['promotion_id'] ?? null,
                'discount_amount' => $orderData['discount_amount'] ?? 0,
                'loyalty_discount_amount' => $orderData['loyalty_discount_amount'] ?? 0,
                'used_loyalty_discount' => $orderData['used_loyalty_discount'] ?? false,
                'promo_code' => $orderData['promo_code'] ?? null,
            ]);

            // Create order items
            foreach ($orderData['items'] as $item) {
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
            if (isset($orderData['promotion_id'])) {
                $promotion = Promotion::find($orderData['promotion_id']);
                if ($promotion) {
                    $promotion->incrementUsage();
                }
            }

            // Clear session data
            session()->forget('pending_paypal_order');

            return redirect()->route('my-orders')->with('success', 'PayPal payment completed successfully!');
        }

        // Real PayPal - capture the payment first
        $token = $request->get('token');

        try {
            $provider = new PayPalClient;
            $provider->setApiCredentials($paypalConfig);
            $provider->getAccessToken();

            $response = $provider->capturePaymentOrder($token);

            if (isset($response['status']) && $response['status'] === 'COMPLETED') {
                // Create the order now
                $order = Order::create([
                    'user_id' => Auth::id(),
                    'distributor_id' => $orderData['distributor_id'],
                    'status' => 'pending',
                    'total_amount' => $orderData['total_amount'],
                    'payment_method' => $orderData['payment_method'],
                    'payment_status' => 'paid',
                    'paypal_transaction_id' => $response['id'] ?? null,
                    'promotion_id' => $orderData['promotion_id'] ?? null,
                    'discount_amount' => $orderData['discount_amount'] ?? 0,
                    'loyalty_discount_amount' => $orderData['loyalty_discount_amount'] ?? 0,
                    'used_loyalty_discount' => $orderData['used_loyalty_discount'] ?? false,
                    'promo_code' => $orderData['promo_code'] ?? null,
                ]);

                // Create order items
                foreach ($orderData['items'] as $item) {
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
                if (isset($orderData['promotion_id'])) {
                    $promotion = Promotion::find($orderData['promotion_id']);
                    if ($promotion) {
                        $promotion->incrementUsage();
                    }
                }

                // Clear session data
                session()->forget('pending_paypal_order');

                return redirect()->route('my-orders')->with('success', 'PayPal payment completed successfully!');
            }

            return redirect()->back()->withErrors(['paypal' => 'Payment capture failed.']);
        } catch (\Exception $e) {
            \Log::error('PayPal capture error: '.$e->getMessage());

            return redirect()->back()->withErrors(['paypal' => 'Payment capture failed: '.$e->getMessage()]);
        }
    }

    /**
     * Handle PayPal cancel.
     * Clears session data without creating any order.
     */
    public function cancel(Request $request)
    {
        // Clear pending order data from session - no order is created
        session()->forget('pending_paypal_order');

        // Redirect back to quick-reorder page
        return redirect()->route('quick-reorder')->withErrors(['paypal' => 'Payment was cancelled. No order was created.']);
    }

    /**
     * Handle PayPal IPN notifications.
     */
    public function notify(Request $request)
    {
        $provider = new PayPalClient;
        $provider->setApiCredentials(config('paypal'));
        $provider->getAccessToken();

        $response = $provider->verifyIPN($request->all());

        if ($response) {
            // Handle IPN notification
            $transactionId = $request->input('resource.supplementary_data.related_ids.order_id')
                ?? $request->input('resource.id');

            $order = Order::where('paypal_transaction_id', $transactionId)->first();

            if ($order) {
                $eventType = $request->input('event_type');

                if ($eventType === 'PAYMENT.CAPTURE.COMPLETED') {
                    $order->update([
                        'payment_status' => 'paid',
                    ]);
                } elseif ($eventType === 'PAYMENT.CAPTURE.DENIED' || $eventType === 'PAYMENT.CAPTURE.REFUNDED') {
                    $order->update([
                        'payment_status' => 'refunded',
                    ]);
                }
            }
        }

        return response()->json(['status' => 'success']);
    }
}
