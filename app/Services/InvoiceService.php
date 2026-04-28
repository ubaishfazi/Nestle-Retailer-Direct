<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\Order;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;

class InvoiceService
{
    /**
     * Generate an invoice for an order.
     */
    public function generateInvoice(Order $order): Invoice
    {
        // Generate invoice number
        $invoiceNumber = $this->generateInvoiceNumber($order);

        // Create invoice record
        $invoice = Invoice::create([
            'invoice_number' => $invoiceNumber,
            'order_id' => $order->id,
            'user_id' => $order->user_id,
            'distributor_id' => $order->distributor_id,
            'subtotal' => $order->total_amount + $order->discount_amount,
            'discount_amount' => $order->discount_amount,
            'total_amount' => $order->total_amount,
            'payment_method' => $order->payment_method,
            'payment_status' => $order->payment_status,
            'status' => 'paid',
            'promo_code' => $order->promo_code,
            'invoice_date' => Carbon::now(),
        ]);

        return $invoice;
    }

    /**
     * Generate a unique invoice number.
     */
    protected function generateInvoiceNumber(Order $order): string
    {
        $prefix = 'INV';
        $year = Carbon::now()->format('Y');
        $sequence = str_pad($order->id, 6, '0', STR_PAD_LEFT);

        return "{$prefix}-{$year}-{$sequence}";
    }

    /**
     * Generate PDF for an invoice.
     */
    public function generatePdf(Invoice $invoice): \Barryvdh\DomPDF\PDF
    {
        $order = $invoice->load(['order.items', 'user', 'distributor']);

        $data = [
            'invoice' => $invoice,
            'order' => $order->order,
            'user' => $invoice->user,
            'distributor' => $invoice->distributor,
            'date' => Carbon::now()->format('F d, Y'),
        ];

        return Pdf::loadView('invoices.template', $data);
    }

    /**
     * Save PDF to storage.
     */
    public function savePdf(Invoice $invoice): string
    {
        $pdf = $this->generatePdf($invoice);
        $filename = "invoice-{$invoice->invoice_number}.pdf";
        $path = "invoices/{$filename}";

        Storage::put($path, $pdf->output());

        return $path;
    }

    /**
     * Stream invoice PDF for download.
     */
    public function streamPdf(Invoice $invoice)
    {
        $pdf = $this->generatePdf($invoice);
        $filename = "invoice-{$invoice->invoice_number}.pdf";

        return $pdf->stream($filename);
    }

    /**
     * Download invoice PDF.
     */
    public function downloadPdf(Invoice $invoice)
    {
        $pdf = $this->generatePdf($invoice);
        $filename = "invoice-{$invoice->invoice_number}.pdf";

        return $pdf->download($filename);
    }
}
