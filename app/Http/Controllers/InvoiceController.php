<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Order;
use App\Services\InvoiceService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class InvoiceController extends Controller
{
    protected $invoiceService;

    public function __construct(InvoiceService $invoiceService)
    {
        $this->invoiceService = $invoiceService;
        $this->middleware('auth');
    }

     /**
      * Display invoices list for authenticated user.
      */
     public function index()
     {
         $invoices = Invoice::with(['order.items.product', 'distributor'])
             ->where('user_id', Auth::id())
             ->latest()
             ->get()
             ->map(function ($invoice) {
                 return [
                     'id' => $invoice->id,
                     'invoice_number' => $invoice->invoice_number,
                     'order_id' => $invoice->order_id,
                     'invoice_date' => $invoice->invoice_date->format('M d, Y'),
                     'total_amount' => (float) $invoice->total_amount,
                     'discount_amount' => (float) $invoice->discount_amount,
                     'payment_status' => $invoice->payment_status,
                     'status' => $invoice->status,
                     'distributor_name' => $invoice->distributor->name ?? 'N/A',
                     'items' => $invoice->order->items->map(function ($item) {
                         return [
                             'product_name' => $item->product_name,
                             'quantity' => $item->quantity,
                         ];
                     })->toArray(),
                 ];
             });

         $stats = [
             'total_invoices' => (int) Invoice::where('user_id', Auth::id())->count(),
             'total_spent' => (float) Invoice::where('user_id', Auth::id())->sum('total_amount'),
             'paid_invoices' => (int) Invoice::where('user_id', Auth::id())->where('payment_status', 'paid')->count(),
         ];

         return Inertia::render('InvoiceArchive', [
             'invoices' => $invoices,
             'stats' => $stats,
         ]);
     }

    /**
     * Download invoice PDF.
     */
    public function download(Invoice $invoice)
    {
        // Verify user has access (invoice owner, associated distributor, or admin)
        $user = Auth::user();
        if ($invoice->user_id !== $user->id && $invoice->distributor_id !== $user->id && ! $user->isAdmin()) {
            abort(403, 'Unauthorized access to invoice.');
        }

        return $this->invoiceService->downloadPdf($invoice);
    }

    /**
     * Stream invoice PDF for viewing.
     */
    public function view(Invoice $invoice)
    {
        // Verify user has access (invoice owner, associated distributor, or admin)
        $user = Auth::user();
        if ($invoice->user_id !== $user->id && $invoice->distributor_id !== $user->id && ! $user->isAdmin()) {
            abort(403, 'Unauthorized access to invoice.');
        }

        return $this->invoiceService->streamPdf($invoice);
    }

    /**
     * Generate invoice for an order (admin only).
     */
    public function generateForOrder(Order $order)
    {
        // Verify user has access (admin or distributor)
        if (! Auth::user()->isAdmin() && ! Auth::user()->isDistributor()) {
            abort(403, 'Unauthorized to generate invoice.');
        }

        // Check if invoice already exists
        if ($order->invoice) {
            return redirect()->back()->with('error', 'Invoice already exists for this order.');
        }

        // Generate invoice
        $invoice = $this->invoiceService->generateInvoice($order);

        return redirect()->back()->with('success', "Invoice #{$invoice->invoice_number} generated successfully.");
    }
}
