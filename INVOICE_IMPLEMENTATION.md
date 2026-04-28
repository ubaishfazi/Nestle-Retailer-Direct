# Digital Invoice Archive Implementation - Sprint 3

## Overview
This implementation adds a complete digital invoice archive system with automatic invoice generation after order acceptance. The system generates professional PDF invoices for all approved orders and provides a searchable archive for retailers.

## Features Implemented

### 1. Database Schema (`invoices` table)
- **invoice_number**: Unique invoice identifier (format: INV-YEAR-ORDERID)
- **order_id**: Foreign key to orders table
- **user_id**: Foreign key to users (retailer)
- **distributor_id**: Foreign key to users (distributor)
- **subtotal**: Order subtotal before discount
- **discount_amount**: Any promotional discount applied
- **total_amount**: Final invoice amount
- **payment_method**: COD, PayPal, Credit Card
- **payment_status**: paid, pending, refunded, failed
- **status**: paid, pending, refunded, cancelled
- **promo_code**: Applied promotional code (if any)
- **invoice_date**: Date of invoice generation

### 2. Models

#### Invoice Model (`app/Models/Invoice.php`)
- Relationships: Order, User, Distributor
- Fillable fields for mass assignment
- Casts for date handling

#### Order Model (`app/Models/Order.php`)
- Added `invoice()` relationship (hasOne)

#### User Model (`app/Models/User.php`)
- Added `invoices()` relationship (hasMany)

### 3. Services

#### InvoiceService (`app/Services/InvoiceService.php`)
Handles all invoice operations:
- **generateInvoice()**: Creates invoice record from order
- **generateInvoiceNumber()**: Generates unique invoice numbers
- **generatePdf()**: Creates PDF from invoice data
- **savePdf()**: Saves PDF to storage
- **streamPdf()**: Streams PDF for browser viewing
- **downloadPdf()**: Forces PDF download

### 4. Controllers

#### InvoiceController (`app/Http/Controllers/InvoiceController.php`)
- **index()**: Display all invoices with stats
- **download()**: Download invoice PDF
- **view()**: Stream invoice PDF for viewing
- **generateForOrder()**: Manually generate invoice (admin)

#### OrderController (`app/Http/Controllers/OrderController.php`)
- **approve()**: Auto-generate invoice after approval
- **myOrders()**: Include invoice info in order list

#### DistributorController (`app/Http/Controllers/DistributorController.php`)
- **approveOrder()**: Auto-generate invoice
- **approveRetailerOrder()**: Auto-generate invoice
- **approveIncomingOrder()**: Auto-generate invoice

### 5. PDF Template

**Resources/views/invoices/template.blade.php**
Professional invoice template featuring:
- Company header information
- Invoice details and date
- Biller and payee sections
- Itemized order list
- Discount and total calculations
- Payment and status information
- Terms and conditions

### 6. Frontend Components

#### InvoiceArchive Page (`resources/js/pages/InvoiceArchive.tsx`)
- Invoice list with filtering (all, paid, pending, refunded, failed)
- Statistics cards (total invoices, paid count, total spent, average)
- Individual invoice cards with details
- View and download PDF buttons
- Responsive design with animations

#### MyOrderRecords Page (`resources/js/pages/myorderrecords.tsx`)
- Added "Invoice" badge for orders with invoices
- Link to view invoice directly

### 7. Routes

```php
// Invoice routes (digital invoice archive)
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/invoices', [InvoiceController::class, 'index'])->name('invoices.index');
    Route::get('/invoices/{invoice}/download', [InvoiceController::class, 'download'])->name('invoices.download');
    Route::get('/invoices/{invoice}/view', [InvoiceController::class, 'view'])->name('invoices.view');
});
```

## How It Works

### Automatic Invoice Generation
When an order is approved (by admin or distributor):
1. Order status changes to "approved"
2. Stock is adjusted (warehouse → retailer inventory)
3. Invoice is automatically generated via InvoiceService
4. Invoice record is saved to database
5. Success message confirms invoice generation

### Invoice Number Format
`INV-{YYYY}-{ORDER_ID}` (e.g., INV-2026-000123)

### PDF Generation
- Uses Laravel DomPDF library
- Professional template with company branding
- Includes all order details, pricing, and totals
- Supports download and browser viewing

### Access Control
- Retailers can view their own invoices only
- Admins and distributors can view all invoices
- Invoice generation restricted to authorized roles

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/invoices` | List all invoices |
| GET | `/invoices/{id}/download` | Download invoice PDF |
| GET | `/invoices/{id}/view` | View invoice PDF in browser |
| POST | `/dashboard/orders/{id}/approve` | Approve order + auto-generate invoice |
| POST | `/distributor/orders/{id}/approve` | Approve order + auto-generate invoice |

## Database Migration

Run: `php artisan migrate`

Creates the `invoices` table with all necessary fields and foreign key constraints.

## Dependencies

Added to `composer.json`:
- `barryvdh/laravel-dompdf`: PDF generation library

## Testing

### Manual Testing
1. Place an order as retailer
2. Approve order as admin or distributor
3. Verify invoice is generated in database
4. Navigate to `/invoices`
5. View and download invoice PDF

### Code Quality
- All files pass PHP linter (pint)
- Proper error handling with try-catch blocks
- Logging for invoice generation failures
- Graceful degradation (order approved even if invoice fails)

## Error Handling

- Invoice generation wrapped in try-catch
- Failures logged but don't block order approval
- User notified of invoice generation success
- Admin can manually generate invoices if needed

## Future Enhancements

1. Email invoice delivery
2. Invoice payment tracking
3. Multi-currency support
4. Custom invoice templates per distributor
5. Bulk invoice download (ZIP)
6. Invoice search and filtering
7. Export to CSV/Excel

## Files Modified

### New Files
- `app/Models/Invoice.php`
- `app/Services/InvoiceService.php`
- `app/Http/Controllers/InvoiceController.php`
- `database/migrations/2026_04_28_172716_create_invoices_table.php`
- `resources/views/invoices/template.blade.php`
- `resources/js/pages/InvoiceArchive.tsx`

### Modified Files
- `app/Models/Order.php` (added invoice relationship)
- `app/Models/User.php` (added invoices relationship)
- `app/Http/Controllers/OrderController.php` (auto-generate on approve)
- `app/Http/Controllers/DistributorController.php` (auto-generate on approve)
- `routes/web.php` (added invoice routes)
- `resources/js/pages/myorderrecords.tsx` (invoice badge)
- `composer.json` (added dompdf dependency)
