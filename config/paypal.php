<?php

return [
    'mode' => env('PAYPAL_MODE', 'sandbox'),
    'sandbox' => [
        'username' => env('PAYPAL_SANDBOX_API_USERNAME', ''),
        'password' => env('PAYPAL_SANDBOX_API_PASSWORD', ''),
        'secret' => env('PAYPAL_SANDBOX_API_SECRET', ''),
        'certificate' => env('PAYPAL_SANDBOX_API_CERTIFICATE', ''),
        'app_id' => 'APP-80W284485P519543T',
    ],
    'live' => [
        'username' => env('PAYPAL_LIVE_API_USERNAME', ''),
        'password' => env('PAYPAL_LIVE_API_PASSWORD', ''),
        'secret' => env('PAYPAL_LIVE_API_SECRET', ''),
        'certificate' => env('PAYPAL_LIVE_API_CERTIFICATE', ''),
        'app_id' => env('PAYPAL_LIVE_APP_ID', ''),
    ],
    'payment_action' => 'Sale',
    'currency' => 'USD',
    'notify_url' => env('PAYPAL_PAYMENT_NOTIFY_URL', ''),
    'locale' => 'en_US',
    'validate_ssl' => true,
];
