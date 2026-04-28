<?php

namespace App\Http\Controllers;

use App\Models\Complaint;
use App\Models\ComplaintItem;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ComplaintController extends Controller
{
    /**
     * Display complaint form page for retailers.
     */
    public function create()
    {
        $orders = Order::with(['items.product', 'distributor'])
            ->where('user_id', Auth::id())
            ->whereIn('status', ['approved', 'completed'])
            ->latest()
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'status' => $order->status,
                    'total_amount' => (float) $order->total_amount,
                    'created_at' => $order->created_at->format('M d, Y'),
                    'distributor_name' => $order->distributor->name ?? 'N/A',
                    'items' => $order->items->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'product_id' => $item->product_id,
                            'product_name' => $item->product_name,
                            'product_image' => $item->product_image,
                            'quantity' => (int) $item->quantity,
                            'price' => (float) $item->price,
                        ];
                    })->toArray(),
                ];
            })->toArray();

        return inertia('complaints/create', [
            'orders' => $orders,
        ]);
    }

    /**
     * Store a new complaint.
     */
    public function store(Request $request)
    {
        // Log all incoming data for debugging
        \Log::info('=== COMPLAINT SUBMISSION DEBUG ===');
        \Log::info('Request data keys:', array_keys($request->all()));
        \Log::info('Has files:', array_keys($request->allFiles()));

        // Log each product's proof_image field
        if ($request->has('products')) {
            $products = $request->input('products');
            foreach ($products as $index => $product) {
                $hasFile = $request->hasFile("products.{$index}.proof_image") ? 'YES' : 'NO';
                \Log::info("Product {$index} - hasFile: {$hasFile}");
            }
        }

        $validated = $request->validate([
            'order_id' => 'required|integer|exists:orders,id',
            'products' => 'required|array|min:1',
            'products.*.product_id' => 'nullable|integer|exists:products,id',
            'products.*.product_name' => 'required|string',
            'products.*.product_image' => 'nullable|string',
            'products.*.quantity' => 'required|integer|min:1',
            'description' => 'required|string|max:1000',
            'products.*.proof_image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ], [
            'order_id.required' => 'Please select an order.',
            'products.required' => 'Please select at least one product.',
            'products.min' => 'Please select at least one product.',
            'products.*.product_name.required' => 'Product name is required.',
            'products.*.quantity.required' => 'Quantity is required for all products.',
            'products.*.quantity.min' => 'Quantity must be at least 1 for all products.',
            'description.required' => 'Please provide a description of the damage.',
            'description.max' => 'Description must not exceed 1000 characters.',
            'products.*.proof_image.required' => 'Please upload a proof image for each product.',
            'products.*.proof_image.image' => 'Please upload valid image files for proof.',
            'products.*.proof_image.max' => 'Each image size must not exceed 2MB.',
        ]);

        // Verify the order belongs to the authenticated user
        $order = Order::where('id', $validated['order_id'])
            ->where('user_id', Auth::id())
            ->firstOrFail();

        DB::beginTransaction();

        try {
            $complaint = Complaint::create([
                'user_id' => Auth::id(),
                'order_id' => $validated['order_id'],
                'product_name' => count($validated['products']).' products',
                'quantity' => array_sum(array_column($validated['products'], 'quantity')),
                'description' => $validated['description'],
                'status' => 'pending',
                'distributor_id' => $order->distributor_id,
            ]);

            // Create complaint items with their proof images
            foreach ($validated['products'] as $index => $product) {
                $proofImagePath = null;

                // Check if proof_image file was uploaded
                if ($request->hasFile("products.{$index}.proof_image")) {
                    $file = $request->file("products.{$index}.proof_image");
                    $proofImagePath = $file->store('complaints/proofs', 'public');
                    \Log::info("✓ File stored for product {$index}: {$proofImagePath}");
                } else {
                    \Log::warning("✗ No proof_image file uploaded for product {$index}");
                }

                $item = ComplaintItem::create([
                    'complaint_id' => $complaint->id,
                    'product_id' => $product['product_id'] ?? null,
                    'product_name' => $product['product_name'],
                    'product_image' => $product['product_image'] ?? null,
                    'quantity' => $product['quantity'],
                    'proof_image_path' => $proofImagePath,
                ]);

                \Log::info("Created complaint item {$item->id} with proof_image_path: ".($proofImagePath ?? 'NULL'));
            }

            DB::commit();

            return redirect()->route('complaints.index')
                ->with('success', 'Complaint submitted successfully! Your complaint ID is: '.$complaint->complaint_id);
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Complaint store error: '.$e->getMessage());
            \Log::error('Stack trace: '.$e->getTraceAsString());
            throw $e;
        }
    }

    /**
     * Display complaint history for the authenticated retailer.
     */
    public function index()
    {
        $complaints = Complaint::with(['order.distributor', 'items'])
            ->where('user_id', Auth::id())
            ->latest()
            ->get()
            ->map(function ($complaint) {
                $items = $complaint->items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'product_id' => $item->product_id,
                        'product_name' => $item->product_name,
                        'product_image' => $item->product_image,
                        'quantity' => (int) $item->quantity,
                        'proof_image_path' => $item->proof_image_path ? Storage::url($item->proof_image_path) : null,
                    ];
                })->toArray();

                return [
                    'id' => $complaint->id,
                    'complaint_id' => $complaint->complaint_id,
                    'status' => $complaint->status,
                    'items' => $items,
                    'product_name' => $complaint->product_name,
                    'quantity' => (int) $complaint->quantity,
                    'description' => $complaint->description,
                    'distributor_response' => $complaint->distributor_response,
                    'created_at' => $complaint->created_at->format('M d, Y'),
                    'resolved_at' => $complaint->resolved_at ? $complaint->resolved_at->format('M d, Y') : null,
                    'distributor_name' => $complaint->order->distributor->name ?? 'N/A',
                    'order_id' => $complaint->order_id,
                ];
            })->toArray();

        $stats = [
            'total_complaints' => (int) Complaint::where('user_id', Auth::id())->count(),
            'pending_complaints' => (int) Complaint::where('user_id', Auth::id())->where('status', 'pending')->count(),
            'approved_complaints' => (int) Complaint::where('user_id', Auth::id())->where('status', 'approved')->count(),
            'rejected_complaints' => (int) Complaint::where('user_id', Auth::id())->where('status', 'rejected')->count(),
        ];

        return inertia('complaints/index', [
            'complaints' => $complaints,
            'stats' => $stats,
        ]);
    }

    /**
     * Display all complaints for distributor (incoming complaints).
     */
    public function distributorIndex()
    {
        $complaints = Complaint::with(['user', 'order', 'items'])
            ->where('distributor_id', Auth::id())
            ->latest()
            ->get()
            ->map(function ($complaint) {
                $items = $complaint->items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'product_id' => $item->product_id,
                        'product_name' => $item->product_name,
                        'product_image' => $item->product_image,
                        'quantity' => (int) $item->quantity,
                        'proof_image_path' => $item->proof_image_path ? Storage::url($item->proof_image_path) : null,
                    ];
                })->toArray();

                return [
                    'id' => $complaint->id,
                    'complaint_id' => $complaint->complaint_id,
                    'status' => $complaint->status,
                    'items' => $items,
                    'product_name' => $complaint->product_name,
                    'quantity' => (int) $complaint->quantity,
                    'description' => $complaint->description,
                    'distributor_response' => $complaint->distributor_response,
                    'created_at' => $complaint->created_at->format('M d, Y'),
                    'resolved_at' => $complaint->resolved_at ? $complaint->resolved_at->format('M d, Y') : null,
                    'retailer_name' => $complaint->user->name ?? 'N/A',
                    'retailer_email' => $complaint->user->email ?? 'N/A',
                    'order_id' => $complaint->order_id,
                ];
            })->toArray();

        $stats = [
            'total_complaints' => (int) Complaint::where('distributor_id', Auth::id())->count(),
            'pending_complaints' => (int) Complaint::where('distributor_id', Auth::id())->where('status', 'pending')->count(),
            'approved_complaints' => (int) Complaint::where('distributor_id', Auth::id())->where('status', 'approved')->count(),
            'rejected_complaints' => (int) Complaint::where('distributor_id', Auth::id())->where('status', 'rejected')->count(),
        ];

        return inertia('distributor/complaints', [
            'complaints' => $complaints,
            'stats' => $stats,
        ]);
    }

    /**
     * Display a specific complaint for distributor review.
     */
    public function distributorShow(Complaint $complaint)
    {
        // Verify the complaint belongs to the authenticated distributor
        if ($complaint->distributor_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        $complaint->load(['user', 'order', 'order.items', 'items']);

        $complaintData = [
            'id' => $complaint->id,
            'complaint_id' => $complaint->complaint_id,
            'status' => $complaint->status,
            'items' => $complaint->items->map(function ($item) {
                return [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'product_name' => $item->product_name,
                    'product_image' => $item->product_image,
                    'quantity' => (int) $item->quantity,
                    'proof_image_path' => $item->proof_image_path ? Storage::url($item->proof_image_path) : null,
                ];
            })->toArray(),
            'product_name' => $complaint->product_name,
            'quantity' => (int) $complaint->quantity,
            'description' => $complaint->description,
            'distributor_response' => $complaint->distributor_response,
            'created_at' => $complaint->created_at->format('M d, Y H:i'),
            'resolved_at' => $complaint->resolved_at ? $complaint->resolved_at->format('M d, Y H:i') : null,
            'retailer_name' => $complaint->user->name ?? 'N/A',
            'retailer_email' => $complaint->user->email ?? 'N/A',
            'order_id' => $complaint->order_id,
            'order' => $complaint->order ? [
                'id' => $complaint->order->id,
                'status' => $complaint->order->status,
                'total_amount' => (float) $complaint->order->total_amount,
                'created_at' => $complaint->order->created_at->format('M d, Y'),
                'items' => $complaint->order->items->map(function ($item) {
                    return [
                        'product_name' => $item->product_name,
                        'product_image' => $item->product_image,
                        'quantity' => (int) $item->quantity,
                        'price' => (float) $item->price,
                    ];
                })->toArray(),
            ] : null,
        ];

        return inertia('distributor/complaint-review', [
            'complaint' => $complaintData,
        ]);
    }

    /**
     * Approve a complaint.
     */
    public function distributorApprove(Request $request, Complaint $complaint)
    {
        // Verify the complaint belongs to the authenticated distributor
        if ($complaint->distributor_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'response' => 'nullable|string|max:1000',
        ]);

        $complaint->approve($validated['response'] ?? 'Replacement process initiated.');

        return redirect()->route('distributor.complaints.index')
            ->with('success', 'Complaint approved successfully!');
    }

    /**
     * Reject a complaint.
     */
    public function distributorReject(Request $request, Complaint $complaint)
    {
        // Verify the complaint belongs to the authenticated distributor
        if ($complaint->distributor_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'reason' => 'required|string|max:1000',
        ]);

        $complaint->reject($validated['reason']);

        return redirect()->route('distributor.complaints.index')
            ->with('success', 'Complaint rejected.');
    }

    /**
     * Mark a complaint as pending.
     */
    public function distributorMarkPending(Complaint $complaint)
    {
        // Verify the complaint belongs to the authenticated distributor
        if ($complaint->distributor_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        $complaint->markPending();

        return redirect()->route('distributor.complaints.index')
            ->with('success', 'Complaint marked as pending.');
    }
}
