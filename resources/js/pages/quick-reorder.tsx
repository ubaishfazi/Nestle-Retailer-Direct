import { Head, Link, router } from '@inertiajs/react';
import {
    ChevronLeft,
    Plus,
    Minus,
    ShoppingCart,
    Users,
    ChevronDown,
    CreditCard,
    DollarSign,
    Warehouse,
    Banknote,
    Tag,
    X,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect, useRef } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

// Credit card input formatting utilities
function formatCardNumber(value: string): string {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    // Limit to 16 digits
    const limited = digits.slice(0, 16);
    // Add space every 4 digits
    return limited.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

function formatExpiryDate(value: string): string {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    // Limit to 4 digits (MMYY)
    const limited = digits.slice(0, 4);

    if (limited.length >= 2) {
        const month = limited.slice(0, 2);
        const year = limited.slice(2);

        // Restrict month to 01-12
        let validMonth = month;
        const monthNum = parseInt(month, 10);
        if (monthNum > 12) {
            validMonth = '12';
        } else if (monthNum === 0) {
            validMonth = '01';
        }

        return validMonth + (year ? '/' + year : '');
    }
    return limited;
}

function validateCardNumber(value: string): boolean {
    const digits = value.replace(/\D/g, '');
    return digits.length === 16;
}

function validateExpiryDate(value: string): boolean {
    const match = value.match(/^(\d{2})\/(\d{2})$/);
    if (!match) return false;

    const month = parseInt(match[1], 10);
    const year = parseInt(match[2], 10);

    // Validate month (01-12)
    if (month < 1 || month > 12) return false;

    // Validate year (not in the past)
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
        return false;
    }

    return true;
}

function validateCVV(value: string): boolean {
    return /^\d{3}$/.test(value);
}

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string;
    stock_quantity: number;
    warehouse_quantity: number;
}

interface OrderItem extends Product {
    status: string;
    statusColor: string;
    quantity: number;
    warehouse_status?: string;
    warehouse_statusColor?: string;
}

interface Distributor {
    id: number;
    name: string;
    company_name: string | null;
    company_city: string | null;
}

interface DistributorInventory {
    product_id: number;
    stock_quantity: number;
}

function getStockStatus(stockQuantity: number | undefined): {
    status: string;
    statusColor: string;
} {
    const quantity = stockQuantity || 0;
    if (quantity === 0) {
        return { status: 'Out of Stock', statusColor: 'text-red-600' };
    }
    if (quantity <= 20) {
        return { status: 'Low Stock', statusColor: 'text-amber-600' };
    }
    return { status: 'In Stock', statusColor: 'text-emerald-600' };
}

function getWarehouseStockStatus(stockQuantity: number | undefined): {
    status: string;
    statusColor: string;
} {
    const quantity = stockQuantity || 0;
    if (quantity === 0) {
        return { status: 'Out of Stock', statusColor: 'text-red-600' };
    }
    if (quantity <= 20) {
        return { status: 'Low Stock', statusColor: 'text-amber-600' };
    }
    return { status: 'In Stock', statusColor: 'text-emerald-600' };
}

interface Props {
    products?: Product[] | null;
    distributors?: Distributor[] | null;
}

export default function QuickReorder({ products, distributors }: Props) {
    const { toast } = useToast();

    // Safe array conversion
    const safeProducts = Array.isArray(products) ? products : [];
    const safeDistributors = Array.isArray(distributors) ? distributors : [];

    // Extract unique cities from distributors
    const uniqueCities = [
        ...new Set(safeDistributors.map((d) => d.company_city).filter(Boolean)),
    ].sort() as string[];

    const [selectedCity, setSelectedCity] = useState<string>('');
    const [selectedDistributor, setSelectedDistributor] =
        useState<Distributor | null>(null);

    // Filter distributors by selected city
    const filteredDistributors = selectedCity
        ? safeDistributors.filter((d) => d.company_city === selectedCity)
        : safeDistributors;
    const [distributorInventory, setDistributorInventory] = useState<
        DistributorInventory[]
    >([]);
    const [orderItems, setOrderItems] = useState<OrderItem[]>(
        safeProducts
            .filter((p) => p && p.id)
            .map((product) => ({
                ...product,
                ...getStockStatus(product.stock_quantity),
                quantity: 0,
                warehouse_quantity: 0, // Reset to 0 until distributor is selected
                warehouse_status: 'Out of Stock',
                warehouse_statusColor: 'text-gray-500',
            })),
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCityOpen, setIsCityOpen] = useState(false);
    const [isDistributorOpen, setIsDistributorOpen] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showCreditCardModal, setShowCreditCardModal] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
        'cod' | 'paypal' | 'credit_card'
    >('cod');

    // Promo code state
    const [promoCode, setPromoCode] = useState('');
    const [appliedPromo, setAppliedPromo] = useState<{
        id: number;
        title: string;
        promo_code: string;
        discount_type: string;
        discount_value: number;
        discount_amount: number;
    } | null>(null);
    const [promoError, setPromoError] = useState<string | null>(null);
    const [validatingPromo, setValidatingPromo] = useState(false);

    // Credit card form state
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvv, setCardCvv] = useState('');
    const [cardName, setCardName] = useState('');
    const cardNumberRef = useRef<HTMLInputElement>(null);

    // Promo code validation
    const handleValidatePromoCode = async () => {
        if (!promoCode.trim()) {
            setPromoError('Please enter a promo code');
            return;
        }

        setValidatingPromo(true);
        setPromoError(null);

        const itemsToOrder = orderItems.filter(
            (item) => item && item.quantity > 0,
        );
        const orderTotal = itemsToOrder.reduce(
            (sum, item) => sum + item.quantity * item.price,
            0,
        );

        try {
            const response = await fetch('/api/promo-code/validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    promo_code: promoCode.toUpperCase(),
                    product_ids: itemsToOrder
                        .map((item) => item.id)
                        .filter(Boolean),
                    order_total: orderTotal,
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setAppliedPromo(data.promotion);
                setPromoError(null);
                toast({
                    title: 'Promo Applied!',
                    description: `${data.promotion.title} - Discount applied to your order`,
                });
            } else {
                setAppliedPromo(null);
                setPromoError(data.message || 'Invalid promo code');
                toast({
                    title: 'Invalid Promo Code',
                    description:
                        data.message ||
                        'This promo code is invalid or expired.',
                    variant: 'destructive',
                });
            }
        } catch (err) {
            setPromoError('Failed to validate promo code');
            toast({
                title: 'Error',
                description: 'Failed to validate promo code. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setValidatingPromo(false);
        }
    };

    const handleRemovePromo = () => {
        setPromoCode('');
        setAppliedPromo(null);
        setPromoError(null);
        toast({
            title: 'Promo Removed',
            description: 'Promo code has been removed from your order.',
        });
    };

    // Fetch distributor inventory when distributor is selected
    useEffect(() => {
        if (selectedDistributor) {
            fetch(`/api/distributor/${selectedDistributor.id}/inventory`)
                .then((res) => res.json())
                .then((data) => {
                    setDistributorInventory(data);
                    // Update order items with distributor-specific warehouse quantities
                    setOrderItems((prev) =>
                        prev.map((item) => {
                            const inv = data.find(
                                (d: DistributorInventory) =>
                                    d.product_id === item.id,
                            );
                            const warehouseQty = inv ? inv.stock_quantity : 0;
                            const warehouseStatus =
                                getWarehouseStockStatus(warehouseQty);
                            return {
                                ...item,
                                warehouse_quantity: warehouseQty,
                                warehouse_status: warehouseStatus.status,
                                warehouse_statusColor:
                                    warehouseStatus.statusColor,
                            };
                        }),
                    );
                })
                .catch((err) => {
                    console.error(
                        'Failed to fetch distributor inventory:',
                        err,
                    );
                    setDistributorInventory([]);
                });
        } else {
            setDistributorInventory([]);
            // Reset warehouse quantities when no distributor is selected
            setOrderItems((prev) =>
                prev.map((item) => ({
                    ...item,
                    warehouse_quantity: 0,
                    warehouse_status: 'Out of Stock',
                    warehouse_statusColor: 'text-gray-500',
                })),
            );
        }
    }, [selectedDistributor]);

    // Clear distributor when city changes
    useEffect(() => {
        if (selectedCity) {
            setSelectedDistributor(null);
            setDistributorInventory([]);
            setOrderItems((prev) =>
                prev.map((item) => ({
                    ...item,
                    warehouse_quantity: 0,
                    warehouse_status: 'Out of Stock',
                    warehouse_statusColor: 'text-gray-500',
                })),
            );
        }
    }, [selectedCity]);

    const handleQuantityChange = (id: number, delta: number) => {
        setOrderItems((prev) =>
            prev.map((order) => {
                if (order && order.id === id) {
                    const maxQuantity = order.warehouse_quantity || 0;
                    const newQuantity = Math.max(
                        0,
                        Math.min(maxQuantity, order.quantity + delta),
                    );
                    return { ...order, quantity: newQuantity };
                }
                return order;
            }),
        );
    };

    const handleDirectQuantityChange = (id: number, value: string) => {
        const parsedValue = parseInt(value) || 0;
        setOrderItems((prev) =>
            prev.map((order) => {
                if (order && order.id === id) {
                    const maxQuantity = order.warehouse_quantity || 0;
                    const newQuantity = Math.max(
                        0,
                        Math.min(maxQuantity, parsedValue),
                    );
                    return { ...order, quantity: newQuantity };
                }
                return order;
            }),
        );
    };

    const handleReorder = () => {
        const itemsToOrder = orderItems.filter(
            (item) => item && item.quantity > 0,
        );

        if (itemsToOrder.length === 0) {
            toast({
                title: 'No items selected',
                description: 'Please add at least one item to your order.',
                variant: 'destructive',
            });
            return;
        }

        if (!selectedDistributor) {
            toast({
                title: 'No distributor selected',
                description: 'Please select a distributor to place your order.',
                variant: 'destructive',
            });
            setIsDistributorOpen(true);
            return;
        }

        // Validate quantities against warehouse stock
        const overStockItems = itemsToOrder.filter(
            (item) => item.quantity > item.warehouse_quantity,
        );
        if (overStockItems.length > 0) {
            toast({
                title: 'Insufficient warehouse stock',
                description: 'Some items exceed available warehouse quantity.',
                variant: 'destructive',
            });
            return;
        }

        setShowPaymentModal(true);
    };

    const handlePaymentConfirm = () => {
        const itemsToOrder = orderItems.filter(
            (item) => item && item.quantity > 0,
        );

        if (!selectedDistributor) {
            toast({
                title: 'Error',
                description: 'Please select a distributor',
                variant: 'destructive',
            });
            return;
        }

        // If credit card is selected, show credit card form
        if (selectedPaymentMethod === 'credit_card') {
            setShowPaymentModal(false);
            setShowCreditCardModal(true);
            return;
        }

        const orderData = {
            distributor_id: selectedDistributor.id,
            payment_method: selectedPaymentMethod,
            promo_code: appliedPromo ? appliedPromo.promo_code : null,
            items: itemsToOrder.map((item) => ({
                product_id: item.id,
                product_name: item.name,
                product_image: item.image,
                quantity: item.quantity,
                price: item.price,
            })),
        };

        setIsSubmitting(true);

        if (selectedPaymentMethod === 'paypal') {
            // First, submit order to /orders to get order data validated
            const csrfToken =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute('content') || '';

            fetch('/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    Accept: 'application/json',
                    'X-Inertia': 'false',
                },
                body: JSON.stringify(orderData),
                credentials: 'same-origin',
            })
                .then((res) => res.json())
                .then((data) => {
                    setIsSubmitting(false);
                    if (data.success && data.redirectUrl) {
                        // Don't show success toast yet - wait for PayPal payment to complete
                        // Redirect to PayPal process endpoint with order data
                        const paypalUrl = data.redirectUrl;

                        // Create a form and submit order data to PayPal endpoint via POST
                        const form = document.createElement('form');
                        form.method = 'POST';
                        form.action = paypalUrl;

                        // Add CSRF token
                        const csrfInput = document.createElement('input');
                        csrfInput.type = 'hidden';
                        csrfInput.name = '_token';
                        csrfInput.value = csrfToken;
                        form.appendChild(csrfInput);

                        // Add order data
                        const dataInput = document.createElement('input');
                        dataInput.type = 'hidden';
                        dataInput.name = 'order_data';
                        dataInput.value = JSON.stringify(data.orderData);
                        form.appendChild(dataInput);

                        document.body.appendChild(form);
                        form.submit();
                    } else {
                        throw new Error('Invalid response from server');
                    }
                })
                .catch((err) => {
                    setIsSubmitting(false);
                    toast({
                        title: 'Order failed',
                        description:
                            err.message ||
                            'There was an error placing your order.',
                        variant: 'destructive',
                    });
                });
        } else {
            // For COD, submit directly
            router.post('/orders', orderData, {
                preserveScroll: true,
                onSuccess: () => {
                    toast({
                        title: 'Order placed successfully!',
                        description: 'Your order has been submitted.',
                    });
                    window.location.href = '/my-orders';
                },
                onError: (errors) => {
                    setIsSubmitting(false);
                    const errorMessages = Object.values(errors).join(' ');
                    toast({
                        title: 'Order failed',
                        description:
                            errorMessages ||
                            'There was an error placing your order.',
                        variant: 'destructive',
                    });
                },
            });
        }
    };

    const handleCreditCardSubmit = () => {
        const itemsToOrder = orderItems.filter(
            (item) => item && item.quantity > 0,
        );

        if (!selectedDistributor) {
            toast({
                title: 'Error',
                description: 'Please select a distributor',
                variant: 'destructive',
            });
            return;
        }

        // Debug logging
        console.log('Card validation debug:', {
            cardNumber,
            cardNumberLength: cardNumber.replace(/\D/g, '').length,
            cardExpiry,
            cardCvv,
            cardName,
        });

        // Validate card details
        if (!validateCardNumber(cardNumber)) {
            const digits = cardNumber.replace(/\D/g, '');
            toast({
                title: 'Invalid Card Number',
                description: `Please enter a valid 16-digit card number. Current: ${digits.length} digits`,
                variant: 'destructive',
            });
            console.error('Card number validation failed:', digits);
            cardNumberRef.current?.focus();
            return;
        }

        if (!validateExpiryDate(cardExpiry)) {
            const currentYear = new Date().getFullYear() % 100;
            const currentMonth = new Date().getMonth() + 1;
            toast({
                title: 'Invalid Expiry Date',
                description: `Please enter a valid expiry date (MM/YY). Current: ${currentMonth}/${currentYear}`,
                variant: 'destructive',
            });
            console.error(
                'Expiry validation failed:',
                cardExpiry,
                'Current:',
                `${currentMonth}/${currentYear}`,
            );
            return;
        }

        if (!validateCVV(cardCvv)) {
            toast({
                title: 'Invalid CVV',
                description: 'Please enter a valid 3-digit CVV',
                variant: 'destructive',
            });
            console.error('CVV validation failed:', cardCvv);
            return;
        }

        if (!cardName.trim()) {
            toast({
                title: 'Cardholder Name Required',
                description: 'Please enter the cardholder name',
                variant: 'destructive',
            });
            return;
        }

        const orderData = {
            distributor_id: selectedDistributor.id,
            payment_method: 'credit_card',
            promo_code: appliedPromo ? appliedPromo.promo_code : null,
            items: itemsToOrder.map((item) => ({
                product_id: item.id,
                product_name: item.name,
                product_image: item.image,
                quantity: item.quantity,
                price: item.price,
            })),
        };

        setIsSubmitting(true);

        // Submit credit card order directly (mock payment - instant success)
        const csrfToken =
            document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute('content') || '';

        fetch('/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken,
                Accept: 'application/json',
                'X-Inertia': 'false',
            },
            body: JSON.stringify(orderData),
            credentials: 'same-origin',
        })
            .then((res) => res.json())
            .then((data) => {
                setIsSubmitting(false);
                if (data.success) {
                    toast({
                        title: 'Order Successful!',
                        description:
                            'Your credit card payment was processed successfully.',
                    });
                    window.location.href = '/my-orders';
                } else {
                    throw new Error('Invalid response from server');
                }
            })
            .catch((err) => {
                setIsSubmitting(false);
                toast({
                    title: 'Payment Failed',
                    description:
                        err.message ||
                        'There was an error processing your payment.',
                    variant: 'destructive',
                });
            });
    };

    // Safe reduce with null checks
    const totalItems = orderItems
        .filter((item) => item != null)
        .reduce((acc, item) => acc + (item?.quantity || 0), 0);

    const totalAmount = orderItems
        .filter((item) => item != null)
        .reduce(
            (acc, item) => acc + (item?.quantity || 0) * (item?.price || 0),
            0,
        );

    // Calculate discounted total
    const discountAmount = appliedPromo ? appliedPromo.discount_amount : 0;
    const discountedTotal = totalAmount - discountAmount;

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f5f7fa] to-[#e8ecf1]">
            <Head title="Quick Reorder" />

            {/* Header */}
            <header className="sticky top-0 z-50 bg-gradient-to-r from-[#00447C] via-[#003d6f] to-[#00284a] shadow-lg">
                <div className="container flex h-16 items-center justify-between px-4">
                    <Link href="/" className="flex items-center gap-2">
                        <ChevronLeft className="h-6 w-6 text-white" />
                    </Link>
                    <h1 className="text-base font-bold tracking-widest text-white uppercase">
                        Quick Reorder
                    </h1>
                    <div className="w-6"></div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container pb-32 md:py-6">
                {/* City and Distributors Dropdown */}
                {safeDistributors.length > 0 && (
                    <Card className="mx-auto mb-6 max-w-2xl border-0 bg-white/90 shadow-lg backdrop-blur-sm">
                        <CardContent className="p-3 md:p-4">
                            <div className="space-y-3">
                                {/* City Dropdown */}
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex min-w-0 items-center gap-1.5 md:gap-2">
                                        <Users className="h-4 w-4 flex-shrink-0 text-[#00447C] md:h-5 md:w-5" />
                                        <h2 className="text-xs font-semibold whitespace-nowrap text-gray-900 md:text-sm">
                                            Select City
                                        </h2>
                                    </div>
                                    <DropdownMenu
                                        open={isCityOpen}
                                        onOpenChange={setIsCityOpen}
                                    >
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="h-8 w-[140px] justify-between text-xs md:h-10 md:w-[200px] md:text-sm"
                                            >
                                                {selectedCity ? (
                                                    <span className="truncate">
                                                        {selectedCity}
                                                    </span>
                                                ) : (
                                                    <span className="truncate">
                                                        Select City
                                                    </span>
                                                )}
                                                <ChevronDown className="h-3 w-3 flex-shrink-0 md:h-4 md:w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            align="end"
                                            className="w-[140px] md:w-[200px]"
                                        >
                                            {uniqueCities.map((city) => (
                                                <DropdownMenuItem
                                                    key={city}
                                                    onClick={() =>
                                                        setSelectedCity(city)
                                                    }
                                                >
                                                    <span className="text-xs font-medium md:text-sm">
                                                        {city}
                                                    </span>
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                {/* Distributor Dropdown - shown only when city is selected */}
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex min-w-0 items-center gap-1.5 md:gap-2">
                                        <Users className="h-4 w-4 flex-shrink-0 text-[#00447C] md:h-5 md:w-5" />
                                        <h2 className="text-xs font-semibold whitespace-nowrap text-gray-900 md:text-sm">
                                            Distributors
                                        </h2>
                                    </div>
                                    <DropdownMenu
                                        open={isDistributorOpen}
                                        onOpenChange={setIsDistributorOpen}
                                        disabled={!selectedCity}
                                    >
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="h-8 w-[140px] justify-between text-xs md:h-10 md:w-[200px] md:text-sm"
                                                disabled={!selectedCity}
                                            >
                                                {selectedDistributor ? (
                                                    <span className="truncate">
                                                        {selectedDistributor.company_name ||
                                                            selectedDistributor.name}
                                                    </span>
                                                ) : (
                                                    <span className="truncate">
                                                        {selectedCity
                                                            ? 'Select Distributor'
                                                            : 'Select city first'}
                                                    </span>
                                                )}
                                                <ChevronDown className="h-3 w-3 flex-shrink-0 md:h-4 md:w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            align="end"
                                            className="w-[140px] md:w-[200px]"
                                        >
                                            {filteredDistributors
                                                .filter((d) => d && d.id)
                                                .map((distributor) => (
                                                    <DropdownMenuItem
                                                        key={distributor.id}
                                                        onClick={() =>
                                                            setSelectedDistributor(
                                                                distributor,
                                                            )
                                                        }
                                                    >
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="text-xs font-medium md:text-sm">
                                                                {distributor.company_name ||
                                                                    distributor.name}
                                                            </span>
                                                            {distributor.company_city && (
                                                                <span className="text-[10px] text-gray-500 md:text-xs">
                                                                    {
                                                                        distributor.company_city
                                                                    }
                                                                </span>
                                                            )}
                                                        </div>
                                                    </DropdownMenuItem>
                                                ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Products List */}
                <Card className="mx-auto mb-32 max-w-2xl border-0 bg-white/90 shadow-xl backdrop-blur-sm">
                    <CardContent className="p-0">
                        <div className="flex items-center justify-between border-b border-gray-100 p-4">
                            <div className="flex items-center gap-2">
                                <ShoppingCart className="h-5 w-5 text-[#00447C]" />
                                <h2 className="font-semibold text-gray-900">
                                    Frequent Orders
                                </h2>
                            </div>
                            <span className="text-xs text-gray-500">
                                {orderItems.length} items
                            </span>
                        </div>

                        <div className="divide-y divide-gray-100">
                            {orderItems
                                .filter((item) => item && item.id)
                                .map((order) => (
                                    <div
                                        key={order.id}
                                        className="flex items-center gap-3 p-3 transition-colors hover:bg-gray-50/80"
                                    >
                                        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                                            <img
                                                src={order.image}
                                                alt={order.name}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <h3 className="truncate text-sm font-semibold text-gray-900">
                                                {order.name}
                                            </h3>
                                            <p
                                                className={`mt-0.5 text-xs font-medium ${order.statusColor}`}
                                            >
                                                Your Stock:{' '}
                                                {order.stock_quantity} units
                                            </p>
                                            {selectedDistributor && (
                                                <div className="mt-0.5 flex items-center gap-1">
                                                    <Warehouse className="h-3 w-3 text-[#00447C]" />
                                                    <p
                                                        className={`text-xs font-medium ${order.warehouse_statusColor || 'text-gray-500'}`}
                                                    >
                                                        Warehouse:{' '}
                                                        {order.warehouse_quantity ||
                                                            0}{' '}
                                                        units
                                                    </p>
                                                </div>
                                            )}
                                            {!selectedDistributor && (
                                                <p className="mt-0.5 text-xs font-medium text-amber-600">
                                                    Select a distributor to see
                                                    warehouse stock
                                                </p>
                                            )}
                                            <p className="mt-0.5 text-xs text-gray-500">
                                                LKR{' '}
                                                {order.price?.toFixed(2) ||
                                                    '0.00'}{' '}
                                                each
                                            </p>
                                        </div>

                                        <div className="flex flex-col items-center gap-1">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() =>
                                                        handleQuantityChange(
                                                            order.id,
                                                            -1,
                                                        )
                                                    }
                                                    disabled={
                                                        order.quantity === 0
                                                    }
                                                    className="rounded-md border border-gray-200 p-1.5 hover:border-[#00447C] disabled:opacity-50"
                                                >
                                                    <Minus className="h-3.5 w-3.5 text-gray-600" />
                                                </button>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max={
                                                        selectedDistributor
                                                            ? order.warehouse_quantity ||
                                                              0
                                                            : 0
                                                    }
                                                    value={order.quantity}
                                                    onChange={(e) =>
                                                        handleDirectQuantityChange(
                                                            order.id,
                                                            e.target.value,
                                                        )
                                                    }
                                                    disabled={
                                                        !selectedDistributor
                                                    }
                                                    className="w-16 rounded-md border border-gray-200 py-1.5 text-center text-sm font-semibold focus:border-[#00447C] focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100"
                                                />
                                                <button
                                                    onClick={() =>
                                                        handleQuantityChange(
                                                            order.id,
                                                            1,
                                                        )
                                                    }
                                                    disabled={
                                                        !selectedDistributor ||
                                                        order.quantity >=
                                                            (order.warehouse_quantity ||
                                                                0)
                                                    }
                                                    className="rounded-md border border-[#00447C] bg-[#00447C] p-1.5 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <Plus className="h-3.5 w-3.5 text-white" />
                                                </button>
                                            </div>
                                            {selectedDistributor && (
                                                <span className="text-[10px] text-gray-400">
                                                    Max:{' '}
                                                    {order.warehouse_quantity ||
                                                        0}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </CardContent>
                </Card>
            </main>

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm md:items-center md:p-4">
                    <div className="mb-0 max-h-[80vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white shadow-2xl md:mb-0 md:rounded-2xl">
                        <div className="sticky top-0 z-10 bg-gradient-to-r from-[#00447C] to-[#00284a] px-4 py-3 md:px-6 md:py-4">
                            <h3 className="flex items-center gap-2 text-base font-bold text-white md:text-lg">
                                <CreditCard className="h-4 w-4 md:h-5 md:w-5" />
                                Select Payment Method
                            </h3>
                        </div>

                        <div className="space-y-3 p-4 md:p-5">
                            <div className="rounded-lg bg-gray-50 p-3 md:p-4">
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="text-xs text-gray-600 md:text-sm">
                                        Total Items
                                    </span>
                                    <span className="text-sm font-semibold md:text-base">
                                        {totalItems}
                                    </span>
                                </div>
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="text-xs text-gray-600 md:text-sm">
                                        Subtotal
                                    </span>
                                    <span className="text-sm font-semibold md:text-base">
                                        LKR {totalAmount.toFixed(2)}
                                    </span>
                                </div>
                                {appliedPromo && (
                                    <div className="mb-2 flex items-center justify-between text-emerald-600">
                                        <span className="text-xs md:text-sm">
                                            Discount (
                                            {appliedPromo.discount_type ===
                                            'percentage'
                                                ? `${appliedPromo.discount_value}%`
                                                : `LKR ${appliedPromo.discount_value.toFixed(2)}`}
                                            )
                                        </span>
                                        <span className="text-sm font-semibold md:text-base">
                                            - LKR {discountAmount.toFixed(2)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between border-t pt-2">
                                    <span className="text-sm font-semibold md:text-base">
                                        Total Amount
                                    </span>
                                    <span className="text-lg font-bold text-[#00447C] md:text-xl">
                                        LKR {discountedTotal.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {/* Promo Code Input */}
                            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 md:p-4">
                                <div className="mb-2 flex items-center gap-2">
                                    <Tag className="h-4 w-4 text-[#00447C]" />
                                    <span className="text-sm font-semibold text-[#00447C]">
                                        Promo Code
                                    </span>
                                </div>
                                {!appliedPromo ? (
                                    <div className="space-y-2">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={promoCode}
                                                onChange={(e) => {
                                                    setPromoCode(
                                                        e.target.value.toUpperCase(),
                                                    );
                                                    setPromoError(null);
                                                }}
                                                placeholder="Enter promo code"
                                                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm uppercase focus:ring-2 focus:ring-[#00447C] focus:outline-none"
                                                disabled={validatingPromo}
                                            />
                                            <button
                                                onClick={
                                                    handleValidatePromoCode
                                                }
                                                disabled={
                                                    validatingPromo ||
                                                    !promoCode.trim()
                                                }
                                                className="rounded-lg bg-[#00447C] px-4 py-2 text-sm font-semibold text-white hover:bg-[#003d6f] disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {validatingPromo
                                                    ? 'Checking...'
                                                    : 'Apply'}
                                            </button>
                                        </div>
                                        {promoError && (
                                            <p className="flex items-center gap-1 text-xs text-red-600">
                                                <X className="h-3 w-3" />
                                                {promoError}
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 p-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-semibold text-emerald-800">
                                                    {appliedPromo.title}
                                                </span>
                                                <span className="rounded-full bg-emerald-200 px-2 py-0.5 text-xs text-emerald-800">
                                                    {appliedPromo.discount_type ===
                                                    'percentage'
                                                        ? `${appliedPromo.discount_value}% OFF`
                                                        : `LKR ${appliedPromo.discount_value.toFixed(2)} OFF`}
                                                </span>
                                            </div>
                                            <code className="font-mono text-xs text-emerald-700">
                                                {appliedPromo.promo_code}
                                            </code>
                                        </div>
                                        <button
                                            onClick={handleRemovePromo}
                                            className="rounded p-1 text-red-600 hover:bg-red-100"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <button
                                    onClick={() =>
                                        setSelectedPaymentMethod('paypal')
                                    }
                                    className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 ${
                                        selectedPaymentMethod === 'paypal'
                                            ? 'border-[#00447C] bg-blue-50'
                                            : 'border-gray-200'
                                    }`}
                                >
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-600">
                                        <CreditCard className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="min-w-0 flex-1 text-left">
                                        <div className="text-sm font-semibold">
                                            PayPal
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            Pay securely online
                                        </div>
                                    </div>
                                </button>

                                <button
                                    onClick={() =>
                                        setSelectedPaymentMethod('credit_card')
                                    }
                                    className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 ${
                                        selectedPaymentMethod === 'credit_card'
                                            ? 'border-[#00447C] bg-blue-50'
                                            : 'border-gray-200'
                                    }`}
                                >
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-purple-600">
                                        <Banknote className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="min-w-0 flex-1 text-left">
                                        <div className="text-sm font-semibold">
                                            Credit Card
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            Visa, Mastercard, etc.
                                        </div>
                                    </div>
                                </button>

                                <button
                                    onClick={() =>
                                        setSelectedPaymentMethod('cod')
                                    }
                                    className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 ${
                                        selectedPaymentMethod === 'cod'
                                            ? 'border-[#00447C] bg-blue-50'
                                            : 'border-gray-200'
                                    }`}
                                >
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-600">
                                        <DollarSign className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="min-w-0 flex-1 text-left">
                                        <div className="text-sm font-semibold">
                                            Cash on Delivery
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            Pay when you receive
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>

                        <div className="sticky bottom-0 flex gap-2 border-t border-gray-100 bg-white p-4 pt-0">
                            <button
                                onClick={() => setShowPaymentModal(false)}
                                disabled={isSubmitting}
                                className="flex-1 rounded-xl border border-gray-300 px-3 py-2.5 text-sm font-semibold hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePaymentConfirm}
                                disabled={isSubmitting}
                                className="flex-1 rounded-xl bg-gradient-to-r from-[#00447C] to-[#003d6f] px-3 py-2.5 text-sm font-semibold text-white"
                            >
                                {isSubmitting
                                    ? 'Processing...'
                                    : selectedPaymentMethod === 'paypal'
                                      ? 'Pay with PayPal'
                                      : 'Place Order'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Credit Card Modal */}
            {showCreditCardModal && (
                <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm md:items-center md:p-4">
                    <div className="mb-0 max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white shadow-2xl md:mb-0 md:rounded-2xl">
                        <div className="sticky top-0 z-10 bg-gradient-to-r from-purple-600 to-purple-800 px-4 py-3 md:px-6 md:py-4">
                            <h3 className="flex items-center gap-2 text-base font-bold text-white md:text-lg">
                                <Banknote className="h-4 w-4 md:h-5 md:w-5" />
                                Credit Card Payment
                            </h3>
                        </div>

                        <div className="space-y-4 p-4 md:p-5">
                            <div className="rounded-lg bg-gray-50 p-3 md:p-4">
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="text-xs text-gray-600 md:text-sm">
                                        Total Items
                                    </span>
                                    <span className="text-sm font-semibold md:text-base">
                                        {totalItems}
                                    </span>
                                </div>
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="text-xs text-gray-600 md:text-sm">
                                        Subtotal
                                    </span>
                                    <span className="text-sm font-semibold md:text-base">
                                        LKR {totalAmount.toFixed(2)}
                                    </span>
                                </div>
                                {appliedPromo && (
                                    <div className="mb-2 flex items-center justify-between text-emerald-600">
                                        <span className="text-xs md:text-sm">
                                            Discount (
                                            {appliedPromo.discount_type ===
                                            'percentage'
                                                ? `${appliedPromo.discount_value}%`
                                                : `LKR ${appliedPromo.discount_value.toFixed(2)}`}
                                            )
                                        </span>
                                        <span className="text-sm font-semibold md:text-base">
                                            - LKR {discountAmount.toFixed(2)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between border-t pt-2">
                                    <span className="text-sm font-semibold md:text-base">
                                        Total Amount
                                    </span>
                                    <span className="text-lg font-bold text-purple-600 md:text-xl">
                                        LKR {discountedTotal.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Card Number
                                    </label>
                                    <input
                                        ref={cardNumberRef}
                                        type="text"
                                        id="card_number"
                                        value={cardNumber}
                                        onChange={(e) =>
                                            setCardNumber(
                                                formatCardNumber(
                                                    e.target.value,
                                                ),
                                            )
                                        }
                                        placeholder="1234 5678 9012 3456"
                                        className="w-full rounded-xl border border-gray-300 px-3 py-2.5 font-mono text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                                        maxLength={19}
                                        autoComplete="cc-number"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Cardholder Name
                                    </label>
                                    <input
                                        type="text"
                                        id="card_name"
                                        value={cardName}
                                        onChange={(e) =>
                                            setCardName(e.target.value)
                                        }
                                        placeholder="John Doe"
                                        className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                                        autoComplete="cc-name"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">
                                            Expiry Date
                                        </label>
                                        <input
                                            type="text"
                                            id="card_expiry"
                                            value={cardExpiry}
                                            onChange={(e) =>
                                                setCardExpiry(
                                                    formatExpiryDate(
                                                        e.target.value,
                                                    ),
                                                )
                                            }
                                            placeholder="MM/YY"
                                            className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-center font-mono text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                                            maxLength={5}
                                            autoComplete="cc-exp"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">
                                            CVV
                                        </label>
                                        <input
                                            type="text"
                                            id="card_cvv"
                                            value={cardCvv}
                                            onChange={(e) =>
                                                setCardCvv(
                                                    e.target.value
                                                        .replace(/\D/g, '')
                                                        .slice(0, 3),
                                                )
                                            }
                                            placeholder="123"
                                            className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-center font-mono text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                                            maxLength={3}
                                            autoComplete="cc-csc"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="sticky bottom-0 flex gap-2 border-t border-gray-100 bg-white p-4 pt-0">
                            <button
                                onClick={() => {
                                    setShowCreditCardModal(false);
                                    setShowPaymentModal(true);
                                    // Reset form
                                    setCardNumber('');
                                    setCardExpiry('');
                                    setCardCvv('');
                                    setCardName('');
                                }}
                                disabled={isSubmitting}
                                className="flex-1 rounded-xl border border-gray-300 px-3 py-2.5 text-sm font-semibold hover:bg-gray-50"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleCreditCardSubmit}
                                disabled={isSubmitting}
                                className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 px-3 py-2.5 text-sm font-semibold text-white"
                            >
                                {isSubmitting
                                    ? 'Processing...'
                                    : `Pay LKR ${totalAmount.toFixed(2)}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className="fixed right-0 bottom-0 left-0 z-50 bg-gradient-to-r from-[#00447C] via-[#003d6f] to-[#00284a]">
                <div className="container px-4 py-4">
                    <button
                        onClick={handleReorder}
                        disabled={isSubmitting || totalItems === 0}
                        className="mx-auto block w-full max-w-xs rounded-xl bg-white px-6 py-3 font-bold text-[#00447C] hover:bg-gray-100 disabled:opacity-50"
                    >
                        REORDER NOW ({totalItems} items) - LKR{' '}
                        {totalAmount.toFixed(2)}
                    </button>
                </div>
            </footer>
        </div>
    );
}
