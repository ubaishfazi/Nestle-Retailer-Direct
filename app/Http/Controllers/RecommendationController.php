<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Support\Facades\DB;

class RecommendationController extends Controller
{
    public function index()
    {
        $userId = auth()->id();

        $allOrderIds = Order::where('user_id', $userId)
            ->orderBy('created_at')
            ->pluck('id');

        $total = $allOrderIds->count();

        if ($total < 4) {
            return response()->json(['recommendation' => null]);
        }

        $completedBatches = intdiv($total, 4);

        $lastCompleteBatchEnd = $completedBatches * 4;
        $lastCompleteBatchStart = $lastCompleteBatchEnd - 4;

        $batchIds = $allOrderIds->slice($lastCompleteBatchStart, 4);

        $topProduct = OrderItem::whereIn('order_id', $batchIds)
            ->select('product_id', DB::raw('COUNT(*) as order_count'), DB::raw('SUM(quantity) as total_quantity'))
            ->groupBy('product_id')
            ->orderBy('order_count', 'desc')
            ->orderBy('total_quantity', 'desc')
            ->with('product')
            ->first();

        if (!$topProduct || !$topProduct->product) {
            return response()->json(['recommendation' => null]);
        }

        $product = $topProduct->product;

        $afterBatchIds = $allOrderIds->slice($lastCompleteBatchEnd);

        $hasReordered = OrderItem::whereIn('order_id', $afterBatchIds)
            ->where('product_id', $product->id)
            ->exists();

        if ($hasReordered) {
            return response()->json(['recommendation' => null]);
        }

        return response()->json([
            'recommendation' => [
                'id' => $product->id,
                'name' => $product->name,
                'price' => (float) $product->price,
                'image' => $product->image_url ?? '/images/placeholder-product.png',
                'order_count' => (int) $topProduct->order_count,
                'total_quantity' => (int) $topProduct->total_quantity,
                'discount_percent' => 5,
            ],
        ]);
    }
}
