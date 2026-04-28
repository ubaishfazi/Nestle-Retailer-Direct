<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice - {{ $invoice->invoice_number }}</title>
    <style>
        @page {
            margin: 20mm;
            size: A4;
        }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 12px;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 100%;
            margin: 0 auto;
        }
        .header {
            border-bottom: 3px solid #00447C;
            padding-bottom: 20px;
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        }
        .company-info h1 {
            margin: 0;
            color: #00447C;
            font-size: 24px;
        }
        .company-info p {
            margin: 5px 0;
            color: #666;
        }
        .invoice-info {
            text-align: right;
        }
        .invoice-info h2 {
            margin: 0 0 10px 0;
            color: #00447C;
            font-size: 18px;
        }
        .invoice-number {
            font-size: 14px;
            color: #666;
        }
        .section-title {
            font-size: 14px;
            font-weight: bold;
            color: #00447C;
            margin: 20px 0 10px 0;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
        }
        .party-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
        }
        .party-box {
            flex: 0 0 48%;
        }
        .party-label {
            font-weight: bold;
            color: #00447C;
            margin-bottom: 5px;
        }
        .party-details {
            background: #f5f5f5;
            padding: 10px;
            border-left: 3px solid #00447C;
        }
        .party-details p {
            margin: 3px 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        th {
            background-color: #00447C;
            color: white;
            padding: 10px;
            text-align: left;
            font-weight: bold;
        }
        td {
            padding: 10px;
            border-bottom: 1px solid #ddd;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .totals {
            margin-top: 30px;
            text-align: right;
        }
        .totals table {
            width: 300px;
            margin-left: auto;
        }
        .totals td {
            padding: 8px 10px;
        }
        .total-row {
            font-size: 14px;
            font-weight: bold;
            color: #00447C;
            background-color: #f0f8ff !important;
        }
        .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            color: #666;
            font-size: 10px;
        }
        .note {
            background-color: #fff3cd;
            border-left: 3px solid #ffc107;
            padding: 10px;
            margin: 15px 0;
            font-size: 11px;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="company-info">
                <h1>NESTLE RETAILER DIRECT</h1>
                <p>123 Business District</p>
                <p>Colombo, Sri Lanka</p>
                <p>Phone: +94 112 345 678</p>
                <p>Email: support@nestle-retailer.com</p>
            </div>
            <div class="invoice-info">
                <h2>TAX INVOICE</h2>
                <div class="invoice-number">Invoice #: {{ $invoice->invoice_number }}</div>
                <div>Date: {{ $date }}</div>
                <div>Status: {{ ucfirst($invoice->status) }}</div>
                @if($invoice->promo_code)
                    <div style="color: #00447C; font-weight: bold; margin-top: 5px;">
                        Promo Code: {{ $invoice->promo_code }}
                    </div>
                @endif
            </div>
        </div>

        <!-- Party Information -->
        <div class="party-info">
            <div class="party-box">
                <div class="party-label">BILL TO</div>
                <div class="party-details">
                    <p><strong>{{ $user->name }}</strong></p>
                    <p>Email: {{ $user->email }}</p>
                    @if($user->shopProfile)
                        <p>Shop: {{ $user->shopProfile->shop_name ?? 'N/A' }}</p>
                        <p>Address: {{ $user->shopProfile->shop_address ?? 'N/A' }}</p>
                        <p>City: {{ $user->shopProfile->shop_city ?? 'N/A' }}</p>
                        <p>Phone: {{ $user->shopProfile->shop_phone ?? 'N/A' }}</p>
                    @endif
                </div>
            </div>
            <div class="party-box">
                <div class="party-label">DISTRIBUTOR</div>
                <div class="party-details">
                    <p><strong>{{ $distributor->name }}</strong></p>
                    <p>Email: {{ $distributor->email }}</p>
                    @if($distributor->distributorProfile)
                        <p>Company: {{ $distributor->distributorProfile->company_name ?? 'N/A' }}</p>
                        <p>Address: {{ $distributor->distributorProfile->company_address ?? 'N/A' }}</p>
                        <p>City: {{ $distributor->distributorProfile->company_city ?? 'N/A' }}</p>
                        <p>Phone: {{ $distributor->distributorProfile->company_phone ?? 'N/A' }}</p>
                    @endif
                </div>
            </div>
        </div>

        <!-- Order Items -->
        <div class="section-title">ORDER ITEMS</div>
        <table>
            <thead>
                <tr>
                    <th style="width: 50px;">#</th>
                    <th>Product Name</th>
                    <th style="width: 80px;">Quantity</th>
                    <th style="width: 100px;">Unit Price (LKR)</th>
                    <th style="width: 100px;">Subtotal (LKR)</th>
                </tr>
            </thead>
            <tbody>
                @foreach($order->items as $index => $item)
                    <tr>
                        <td>{{ $index + 1 }}</td>
                        <td>{{ $item->product_name }}</td>
                        <td style="text-align: center;">{{ $item->quantity }}</td>
                        <td style="text-align: right;">{{ number_format($item->price, 2) }}</td>
                        <td style="text-align: right;">{{ number_format($item->subtotal, 2) }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        <!-- Totals -->
        <div class="totals">
            <table>
                <tr>
                    <td>Subtotal:</td>
                    <td style="text-align: right;">LKR {{ number_format($invoice->subtotal, 2) }}</td>
                </tr>
                @if($invoice->discount_amount > 0)
                    <tr>
                        <td>Discount (-):</td>
                        <td style="text-align: right; color: #28a745;">- LKR {{ number_format($invoice->discount_amount, 2) }}</td>
                    </tr>
                @endif
                <tr class="total-row">
                    <td>Grand Total:</td>
                    <td style="text-align: right;">LKR {{ number_format($invoice->total_amount, 2) }}</td>
                </tr>
                <tr>
                    <td>Payment Method:</td>
                    <td style="text-align: right;">{{ ucfirst(str_replace('_', ' ', $invoice->payment_method ?? 'N/A')) }}</td>
                </tr>
                <tr>
                    <td>Payment Status:</td>
                    <td style="text-align: right; color: {{ $invoice->payment_status == 'paid' ? '#28a745' : '#ffc107' }};">
                        {{ ucfirst($invoice->payment_status ?? 'N/A') }}
                    </td>
                </tr>
            </table>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p><strong>Terms & Conditions:</strong> Payment is due within 30 days of invoice date. Late payments may incur additional charges.</p>
            <p style="margin-top: 15px;">Thank you for your business! | Generated on {{ $date }}</p>
        </div>
    </div>
</body>
</html>