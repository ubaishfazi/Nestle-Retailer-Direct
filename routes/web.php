<?php

use App\Http\Controllers\ComplaintController;
use App\Http\Controllers\Dashboard\AccountsController;
use App\Http\Controllers\DistributorController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\LoyaltyController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PayPalController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\PromotionController;
use App\Http\Controllers\QuickReorderController;
use App\Http\Controllers\RetailerInventoryController;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\SurveyController;
use App\Http\Controllers\UserApprovalsController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

// Home route - redirects based on user role
Route::get('/', function () {
    if (Auth::check()) {
        if (Auth::user()->isDistributor()) {
            return redirect()->route('distributor.home');
        }
        if (Auth::user()->isAdmin()) {
            return redirect()->route('dashboard');
        }

        // Retailers stay on the home page (nestle-system-analysis)
        return inertia('nestle-system-analysis', [
            'canRegister' => Features::enabled(Features::registration()),
        ]);
    }

    // Redirect to login for unauthenticated users
    return redirect()->route('login');
})->name('home');

// Clear approval status session (used after admin approval)
Route::post('/clear-approval-status', function (Request $request) {
    $request->session()->forget(['status', 'email_for_approval_check']);

    return redirect()->route('login');
})->name('clear-approval-status');

// Settings routes (must be before admin/distributor routes)
require __DIR__.'/settings.php';

// Distributor routes
Route::middleware(['auth', 'verified', 'distributor'])->group(function () {
    Route::get('/distributor/home', [DistributorController::class, 'home'])->name('distributor.home');
    Route::get('/distributor/orders', [DistributorController::class, 'orders'])->name('distributor.orders');
    Route::get('/distributor/retailer-orders', [DistributorController::class, 'retailerOrders'])->name('distributor.retailer-orders');
    Route::get('/distributor/incoming-orders', [DistributorController::class, 'incomingOrders'])->name('distributor.incoming-orders');
    Route::post('/distributor/orders/{order}/approve', [DistributorController::class, 'approveOrder'])->name('distributor.orders.approve');
    Route::post('/distributor/orders/{order}/reject', [DistributorController::class, 'rejectOrder'])->name('distributor.orders.reject');
    Route::post('/distributor/retailer-orders/{order}/approve', [DistributorController::class, 'approveRetailerOrder'])->name('distributor.retailer-orders.approve');
    Route::post('/distributor/retailer-orders/{order}/reject', [DistributorController::class, 'rejectRetailerOrder'])->name('distributor.retailer-orders.reject');
    Route::post('/distributor/retailer-orders/{order}/invoice', [DistributorController::class, 'generateInvoice'])->name('distributor.retailer-orders.invoice');
    Route::post('/distributor/incoming-orders/{order}/approve', [DistributorController::class, 'approveIncomingOrder'])->name('distributor.incoming-orders.approve');
    Route::post('/distributor/incoming-orders/{order}/reject', [DistributorController::class, 'rejectIncomingOrder'])->name('distributor.incoming-orders.reject');
    Route::post('/distributor/incoming-orders/{order}/invoice', [DistributorController::class, 'generateInvoice'])->name('distributor.incoming-orders.invoice');
    Route::post('/distributor/incoming-orders/delete-approved', [DistributorController::class, 'deleteApprovedOrders'])->name('distributor.incoming-orders.delete-approved');
    Route::post('/distributor/orders/{order}/status', [DistributorController::class, 'updateOrderStatus'])->name('distributor.orders.status');
    Route::get('/distributor/delivery', [DistributorController::class, 'delivery'])->name('distributor.delivery');
    Route::get('/distributor/statistics', [DistributorController::class, 'statistics'])->name('distributor.statistics');
    Route::get('/distributor/schedule', [DistributorController::class, 'schedule'])->name('distributor.schedule');
    Route::get('/distributor/retailers', [DistributorController::class, 'retailers'])->name('distributor.retailers');
    Route::get('/distributor/dashboard', [DistributorController::class, 'dashboard'])->name('distributor.dashboard');
    Route::get('/distributor/notifications', [DistributorController::class, 'notifications'])->name('distributor.notifications');
    Route::get('/distributor/warehouse-inventory', [DistributorController::class, 'warehouseInventory'])->name('distributor.warehouse-inventory');
    Route::post('/distributor/warehouse-inventory/{product}/restock', [DistributorController::class, 'restock'])->name('distributor.warehouse-inventory.restock');

    // Distributor complaints routes
    Route::get('/distributor/complaints', [ComplaintController::class, 'distributorIndex'])->name('distributor.complaints.index');
    Route::get('/distributor/complaints/{complaint}', [ComplaintController::class, 'distributorShow'])->name('distributor.complaints.show');

// Distributor survey routes (read-only)
Route::middleware(['auth', 'verified', 'distributor'])->group(function () {
    Route::get('/distributor/surveys', [SurveyController::class, 'index'])->name('distributor.surveys.index');
    Route::get('/distributor/surveys/{survey}', [SurveyController::class, 'show'])->name('distributor.surveys.show');
    Route::get('/api/distributor/surveys/stats', [SurveyController::class, 'stats'])->name('api.distributor.surveys.stats');
});
});

// Retailer inventory routes
Route::middleware(['auth', 'verified', 'retailer'])->group(function () {
    Route::get('/retailer/inventory', [RetailerInventoryController::class, 'index'])->name('retailer.inventory');
    Route::get('/retailer/promotions', [PromotionController::class, 'retailerPromotions'])->name('retailer.promotions.index');

    // Retailer survey routes
    Route::get('/retailer/surveys', [SurveyController::class, 'retailerIndex'])->name('retailer.surveys.index');
    Route::get('/survey/{survey}', [SurveyController::class, 'showSurvey'])->name('retailer.survey.show');
    Route::post('/survey/{survey}/submit', [SurveyController::class, 'submitResponse'])->name('retailer.survey.submit');

    // Retailer complaint routes
    Route::get('/complaints/create', [ComplaintController::class, 'create'])->name('complaints.create');
    Route::post('/complaints', [ComplaintController::class, 'store'])->name('complaints.store');
    Route::get('/complaints', [ComplaintController::class, 'index'])->name('complaints.index');
});

Route::middleware(['auth', 'verified'])->group(function () {
    // Invoice routes (digital invoice archive)
    Route::get('/invoices', [InvoiceController::class, 'index'])->name('invoices.index');
    Route::get('/invoices/{invoice}/download', [InvoiceController::class, 'download'])->name('invoices.download');
    Route::get('/invoices/{invoice}/view', [InvoiceController::class, 'view'])->name('invoices.view');
});

Route::middleware(['auth', 'verified', 'retailer'])->group(function () {
    Route::get('/quick-reorder', [QuickReorderController::class, 'index'])->name('quick-reorder');
    Route::get('/api/distributor/{distributorId}/inventory', [QuickReorderController::class, 'getDistributorInventory']);
});

// Stock/Inventory routes (not related to dashboard)
Route::middleware(['auth'])->get('/stock', [StockController::class, 'index'])->name('stock.index');
Route::middleware(['auth'])->put('/stock/{product}', [StockController::class, 'update'])->name('stock.update');

// Logout route (GET for link, POST for form)
Route::get('/logout', function () {
    Auth::logout();

    return redirect()->route('home');
})->name('logout');

Route::post('/logout', function () {
    Auth::logout();

    return redirect()->route('home');
});

// Re-login page for non-admin users
Route::middleware(['auth'])->get('/re-login', function () {
    return inertia('re-login');
})->name('re-login');

Route::middleware(['auth', 'verified', 'admin'])->group(function () {
    Route::get('/dashboard', function () {
        return inertia('dashboard');
    })->name('dashboard');
    Route::get('dashboard/accounts', [AccountsController::class, 'index'])->name('dashboard.accounts');
    Route::get('dashboard/orders', [OrderController::class, 'index'])->name('dashboard.orders');
    Route::post('dashboard/orders/{order}/approve', [OrderController::class, 'approve'])->name('dashboard.orders.approve');
    Route::post('dashboard/orders/{order}/reject', [OrderController::class, 'reject'])->name('dashboard.orders.reject');

    // User Approvals routes
    Route::get('dashboard/user-approvals', [UserApprovalsController::class, 'index'])->name('dashboard.user-approvals');
    Route::post('dashboard/user-approvals/{user}/approve', [UserApprovalsController::class, 'approve'])->name('dashboard.user-approvals.approve');
    Route::post('dashboard/user-approvals/{user}/reject', [UserApprovalsController::class, 'reject'])->name('dashboard.user-approvals.reject');

    // Products routes
    Route::get('products', [ProductController::class, 'index'])->name('products.index');

    // Promotions routes
    Route::get('promotions', [PromotionController::class, 'index'])->name('admin.promotions.index');
    Route::get('promotions/create', [PromotionController::class, 'create'])->name('admin.promotions.create');
    Route::post('promotions', [PromotionController::class, 'store'])->name('admin.promotions.store');
    Route::get('promotions/{promotion}/edit', [PromotionController::class, 'edit'])->name('admin.promotions.edit');
    Route::put('promotions/{promotion}', [PromotionController::class, 'update'])->name('admin.promotions.update');
    Route::delete('promotions/{promotion}', [PromotionController::class, 'destroy'])->name('admin.promotions.destroy');
    Route::get('promotions/generate-code', [PromotionController::class, 'generatePromoCode'])->name('admin.promotions.generate-code');

    // Survey Management routes (admin only - full CRUD)
    Route::get('surveys', [SurveyController::class, 'adminIndex'])->name('admin.surveys.index');
    Route::get('surveys/create', [SurveyController::class, 'create'])->name('admin.surveys.create');
    Route::post('surveys', [SurveyController::class, 'store'])->name('admin.surveys.store');
    Route::get('surveys/{survey}', [SurveyController::class, 'adminShow'])->name('admin.surveys.show');
    Route::get('surveys/{survey}/edit', [SurveyController::class, 'adminEdit'])->name('admin.surveys.edit');
    Route::put('surveys/{survey}', [SurveyController::class, 'adminUpdate'])->name('admin.surveys.update');
    Route::delete('surveys/{survey}', [SurveyController::class, 'adminDestroy'])->name('admin.surveys.destroy');
});

// Promo code validation routes (authenticated users)
Route::middleware(['auth'])->post('/api/promo-code/validate', [PromotionController::class, 'validatePromoCode'])->name('api.promo-code.validate');
Route::middleware(['auth'])->get('/api/promotions/active', [PromotionController::class, 'activePromotions'])->name('api.promotions.active');

// Loyalty routes (authenticated users)
Route::middleware(['auth'])->get('/api/loyalty/status', [LoyaltyController::class, 'status'])->name('api.loyalty.status');
Route::middleware(['auth'])->post('/api/loyalty/calculate-discount', [LoyaltyController::class, 'calculateDiscount'])->name('api.loyalty.calculate-discount');
Route::get('/api/loyalty/tiers', [LoyaltyController::class, 'tiers'])->name('api.loyalty.tiers');

// Admin loyalty routes
Route::middleware(['auth', 'verified', 'admin'])->group(function () {
    Route::get('loyalty', [LoyaltyController::class, 'adminIndex'])->name('admin.loyalty.index');
    Route::get('api/loyalty/stats', [LoyaltyController::class, 'adminStats'])->name('admin.loyalty.stats');
});

// Survey API routes
Route::middleware(['auth'])->get('/api/surveys/active', [SurveyController::class, 'active'])->name('api.surveys.active');

// Distributor inventory for admin product selection (used in survey create/edit)
Route::middleware(['auth'])->get('/api/distributor/inventory', [ProductController::class, 'distributorInventory'])->name('api.distributor.inventory');

Route::middleware(['auth'])->post('/orders', [OrderController::class, 'store'])->name('orders.store');
Route::middleware(['auth'])->get('/my-orders', [OrderController::class, 'myOrders'])->name('my-orders');
Route::middleware(['auth'])->get('/user/profile', [OrderController::class, 'userProfile'])->name('user.profile');
Route::middleware(['auth'])->put('/user/profile-information', [ProfileController::class, 'update'])->name('user.profile-information.update');
Route::middleware(['auth'])->put('/user/password', [PasswordController::class, 'update'])->name('user.password.update');

// PayPal payment routes
Route::middleware(['auth'])->group(function () {
    Route::match(['get', 'post'], '/paypal/process', [PayPalController::class, 'processPayment'])->name('paypal.process');
    Route::get('/paypal/success', [PayPalController::class, 'success'])->name('paypal.success');
    Route::get('/paypal/cancel', [PayPalController::class, 'cancel'])->name('paypal.cancel');
    Route::post('/paypal/notify', [PayPalController::class, 'notify'])->name('paypal.notify');
});
