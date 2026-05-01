import { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { CheckCircle2, Lock, CreditCard, ArrowLeft } from 'lucide-react';

interface MockPaypalData {
    orderId: number;
    amount: number;
    returnUrl: string;
    cancelUrl: string;
}

function MockPaypalStandalone() {
    const [data, setData] = useState<MockPaypalData | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [email, setEmail] = useState('buyer@sandbox.paypal.com');
    const [password, setPassword] = useState('');
    const [paymentStep, setPaymentStep] = useState<
        'login' | 'confirm' | 'processing' | 'success'
    >('login');

    useEffect(() => {
        const mockData = (window as any).mockPaypalData as MockPaypalData;
        if (mockData) {
            setData(mockData);
        }
    }, []);

    if (!data) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 p-4">
                <Card className="w-full max-w-md shadow-2xl">
                    <CardContent className="py-12 text-center">
                        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
                        <p className="mt-4 text-gray-600">
                            Loading PayPal checkout...
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (email && password) {
            setIsProcessing(true);
            setTimeout(() => {
                setIsProcessing(false);
                setPaymentStep('confirm');
            }, 1500);
        }
    };

    const handlePayment = () => {
        setIsProcessing(true);
        setPaymentStep('processing');

        setTimeout(() => {
            setPaymentStep('success');
            setTimeout(() => {
                window.location.href = data.returnUrl;
            }, 2000);
        }, 2500);
    };

    const handleCancel = () => {
        window.location.href = data.cancelUrl;
    };

    const renderLoginStep = () => (
        <Card className="w-full max-w-md shadow-2xl">
            <CardHeader className="text-center">
                <div className="mb-4 flex justify-center">
                    <div className="rounded-full bg-blue-600 p-3">
                        <Lock className="h-8 w-8 text-white" />
                    </div>
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                    PayPal Checkout
                </CardTitle>
                <CardDescription className="text-gray-600">
                    Secure payment for Order #{data.orderId}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <p className="mb-1 text-sm font-medium text-blue-800">
                        Payment Amount
                    </p>
                    <p className="text-2xl font-bold text-blue-900">
                        LKR {data.amount.toFixed(2)}
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                            placeholder="buyer@sandbox.paypal.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                    <Button
                        type="submit"
                        className="w-full bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700"
                        disabled={isProcessing}
                    >
                        {isProcessing ? (
                            <span className="flex items-center justify-center">
                                <svg
                                    className="mr-3 -ml-1 h-5 w-5 animate-spin text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                                Logging in...
                            </span>
                        ) : (
                            'Log In'
                        )}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="mx-auto flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Cancel and return to merchant
                    </button>
                </div>

                <div className="mt-6 border-t border-gray-200 pt-6">
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                        <Lock className="h-3 w-3" />
                        <span>Secure SSL Encryption</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    const renderConfirmStep = () => (
        <Card className="w-full max-w-md shadow-2xl">
            <CardHeader className="text-center">
                <div className="mb-4 flex justify-center">
                    <div className="rounded-full bg-green-600 p-3">
                        <CheckCircle2 className="h-8 w-8 text-white" />
                    </div>
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                    Confirm Your Payment
                </CardTitle>
                <CardDescription className="text-gray-600">
                    Review and confirm your payment details
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
                    <div className="mb-4 flex items-center gap-3 border-b border-gray-200 pb-4">
                        <div className="rounded-full bg-blue-100 p-2">
                            <CreditCard className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900">
                                PayPal Balance
                            </p>
                            <p className="text-xs text-gray-500">{email}</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Payment to:</span>
                            <span className="font-medium text-gray-900">
                                Nestle Retailer Direct
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Order #:</span>
                            <span className="font-medium text-gray-900">
                                {data.orderId}
                            </span>
                        </div>
                        <div className="flex justify-between border-t border-gray-200 pt-3 text-lg font-semibold">
                            <span className="text-gray-900">Total:</span>
                            <span className="text-green-600">
                                LKR {data.amount.toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <Button
                        onClick={handlePayment}
                        className="w-full bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700"
                        disabled={isProcessing}
                    >
                        {isProcessing ? (
                            <span className="flex items-center justify-center">
                                <svg
                                    className="mr-3 -ml-1 h-5 w-5 animate-spin text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                                Processing Payment...
                            </span>
                        ) : (
                            `Pay LKR ${data.amount.toFixed(2)}`
                        )}
                    </Button>

                    <Button
                        variant="outline"
                        onClick={handleCancel}
                        className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                        disabled={isProcessing}
                    >
                        Cancel Payment
                    </Button>
                </div>

                <div className="mt-6 border-t border-gray-200 pt-6">
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                        <Lock className="h-3 w-3" />
                        <span>
                            Your payment is protected by PayPal Buyer Protection
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    const renderProcessingStep = () => (
        <Card className="w-full max-w-md shadow-2xl">
            <CardContent className="py-12 text-center">
                <div className="mb-6 flex justify-center">
                    <div className="relative">
                        <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-200"></div>
                        <div className="absolute top-0 left-0 h-16 w-16 animate-spin rounded-full border-t-4 border-blue-600"></div>
                    </div>
                </div>
                <h2 className="mb-2 text-2xl font-bold text-gray-900">
                    Processing Payment
                </h2>
                <p className="text-gray-600">
                    Please wait while we process your payment of LKR{' '}
                    {data.amount.toFixed(2)}
                </p>
            </CardContent>
        </Card>
    );

    const renderSuccessStep = () => (
        <Card className="w-full max-w-md shadow-2xl">
            <CardContent className="py-12 text-center">
                <div className="mb-6 flex justify-center">
                    <div className="rounded-full bg-green-600 p-4">
                        <CheckCircle2 className="h-12 w-12 text-white" />
                    </div>
                </div>
                <h2 className="mb-2 text-2xl font-bold text-gray-900">
                    Payment Successful!
                </h2>
                <p className="mb-4 text-gray-600">
                    Your payment of LKR {data.amount.toFixed(2)} has been
                    processed
                </p>
                <p className="text-sm text-gray-500">
                    Redirecting you back to the merchant...
                </p>
            </CardContent>
        </Card>
    );

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 p-4">
            {paymentStep === 'login' && renderLoginStep()}
            {paymentStep === 'confirm' && renderConfirmStep()}
            {paymentStep === 'processing' && renderProcessingStep()}
            {paymentStep === 'success' && renderSuccessStep()}
        </div>
    );
}

// Mount the component
const root = createRoot(document.getElementById('app')!);
root.render(<MockPaypalStandalone />);
