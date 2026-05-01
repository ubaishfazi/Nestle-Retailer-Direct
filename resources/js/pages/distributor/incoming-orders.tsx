import { Head, router, Link } from '@inertiajs/react';
import { useState } from 'react';
import {
    Package,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    ArrowRight,
    Sparkles,
    Trash2,
    Checkbox,
    ArrowLeft,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface OrderItem {
    product_name: string;
    quantity: number;
    price: number;
    subtotal: number;
}

interface OrderUser {
    id: number;
    name: string;
    email: string;
    shop_name: string | null;
    phone: string | null;
    address: string | null;
}

function formatAddress(address: string | null): string {
    if (!address) return '';
    // Truncate long addresses for display
    return address.length > 60 ? address.substring(0, 60) + '...' : address;
}

function formatPhone(phone: string | null): string {
    if (!phone) return '';
    return phone;
}

interface Order {
    id: number;
    status: string;
    total_amount: number;
    created_at: string;
    user: OrderUser;
    items: OrderItem[];
}

interface Props {
    orders: Order[];
    stats: {
        total_orders: number;
        pending_orders: number;
        approved_orders: number;
        rejected_orders: number;
    };
}

function getStatusBadgeClass(status: string): string {
    switch (status) {
        case 'pending':
            return 'bg-amber-500 text-white';
        case 'approved':
            return 'bg-emerald-500 text-white';
        case 'rejected':
            return 'bg-red-500 text-white';
        default:
            return 'bg-gray-500 text-white';
    }
}

export default function IncomingOrders({ orders, stats }: Props) {
    const { toast } = useToast();
    const [filter, setFilter] = useState('all');
    const [selectedOrders, setSelectedOrders] = useState<number[]>([]);

    const handleApprove = (orderId: number) => {
        router.post(
            `/distributor/incoming-orders/${orderId}/approve`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast({
                        title: 'Order approved!',
                        description: 'The retailer order has been approved.',
                    });
                },
                onError: () => {
                    toast({
                        title: 'Failed to approve',
                        description: 'There was an error approving the order.',
                        variant: 'destructive',
                    });
                },
            },
        );
    };

    const handleReject = (orderId: number) => {
        router.post(
            `/distributor/incoming-orders/${orderId}/reject`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast({
                        title: 'Order rejected',
                        description: 'The retailer order has been rejected.',
                    });
                },
                onError: () => {
                    toast({
                        title: 'Failed to reject',
                        description: 'There was an error rejecting the order.',
                        variant: 'destructive',
                    });
                },
            },
        );
    };

    const handleDeleteApprovedOrders = () => {
        if (selectedOrders.length === 0) return;

        router.post(
            '/distributor/incoming-orders/delete-approved',
            {
                order_ids: selectedOrders,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast({
                        title: 'Orders deleted!',
                        description: `${selectedOrders.length} approved order(s) have been deleted.`,
                    });
                    setSelectedOrders([]);
                },
                onError: () => {
                    toast({
                        title: 'Failed to delete',
                        description: 'There was an error deleting the orders.',
                        variant: 'destructive',
                    });
                },
            },
        );
    };

    const toggleOrderSelection = (orderId: number) => {
        setSelectedOrders((prev) =>
            prev.includes(orderId)
                ? prev.filter((id) => id !== orderId)
                : [...prev, orderId],
        );
    };

    const toggleSelectAllApproved = () => {
        const approvedOrderIds = otherOrders
            .filter((o) => o.status === 'approved')
            .map((o) => o.id);

        if (selectedOrders.length === approvedOrderIds.length) {
            setSelectedOrders([]);
        } else {
            setSelectedOrders(approvedOrderIds);
        }
    };

    const filteredOrders =
        filter === 'all' ? orders : orders.filter((o) => o.status === filter);
    const pendingOrders = filteredOrders.filter((o) => o.status === 'pending');
    const otherOrders = filteredOrders.filter((o) => o.status !== 'pending');

    return (
        <div className="flex min-h-screen items-start justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 px-3 py-4 md:py-8">
            <Head title="Incoming Orders" />

            {/* Decorative Background Elements */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-[#00447C]/5 blur-3xl md:h-96 md:w-96"></div>
                <div className="absolute right-1/4 bottom-0 h-64 w-64 rounded-full bg-blue-400/5 blur-3xl md:h-80 md:w-80"></div>
                <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-[#00447C]/3 via-transparent to-transparent blur-3xl md:h-[800px] md:w-[800px]"></div>
            </div>

            {/* Main Container */}
            <div className="relative mx-auto w-full max-w-5xl">
                {/* Header */}
                <header className="relative sticky top-0 z-50 rounded-t-2xl border-b border-slate-200/50 bg-white/80 backdrop-blur-xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#00447C]/5 via-transparent to-[#00447C]/5"></div>
                    <div className="relative px-4 py-4 md:px-6">
                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                            <div className="flex items-center gap-3">
                                <Link
                                    href="/distributor/home"
                                    className="rounded-full p-2 transition-colors hover:bg-slate-100"
                                >
                                    <ArrowLeft className="h-5 w-5 text-slate-600" />
                                </Link>
                                <div className="relative flex-shrink-0">
                                    <div className="absolute inset-0 rounded-xl bg-[#00447C]/20 blur-md"></div>
                                    <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#00447C] to-[#003d6f] shadow-lg md:h-11 md:w-11">
                                        <Package className="h-4 w-4 text-white md:h-5 md:w-5" />
                                    </div>
                                </div>
                                <div className="min-w-0">
                                    <h1 className="truncate text-lg font-bold tracking-tight text-slate-900 md:text-xl">
                                        Incoming Orders
                                    </h1>
                                    <p className="hidden text-xs font-medium text-slate-500 sm:block">
                                        Review and manage retailer orders
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
                                <div className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1.5 sm:gap-2 md:px-3">
                                    <Clock className="h-3.5 w-3.5 text-amber-600" />
                                    <span className="text-xs font-semibold whitespace-nowrap text-amber-700 sm:text-sm">
                                        {stats.pending_orders} Pending
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="relative border-x border-slate-200/50 bg-white/60 px-4 py-6 pb-40 backdrop-blur-sm md:px-6 md:py-8">
                    <div className="flex flex-col gap-6 md:gap-8">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
                            <div className="group relative">
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 opacity-20 blur-lg transition-opacity group-hover:opacity-30 md:rounded-2xl"></div>
                                <div className="relative rounded-xl border border-slate-200/50 bg-white p-3 shadow-sm transition-shadow hover:shadow-md md:rounded-2xl md:p-5">
                                    <div className="mb-2 flex items-center justify-between md:mb-3">
                                        <span className="text-[10px] font-semibold tracking-wide text-slate-500 uppercase md:text-xs">
                                            Total
                                        </span>
                                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 md:h-9 md:w-9">
                                            <Package className="h-3.5 w-3.5 text-white md:h-4 md:w-4" />
                                        </div>
                                    </div>
                                    <div className="bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-2xl font-bold text-transparent md:text-4xl">
                                        {stats.total_orders}
                                    </div>
                                </div>
                            </div>
                            <div className="group relative">
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 opacity-20 blur-lg transition-opacity group-hover:opacity-30 md:rounded-2xl"></div>
                                <div className="relative rounded-xl border border-slate-200/50 bg-white p-3 shadow-sm transition-shadow hover:shadow-md md:rounded-2xl md:p-5">
                                    <div className="mb-2 flex items-center justify-between md:mb-3">
                                        <span className="text-[10px] font-semibold tracking-wide text-slate-500 uppercase md:text-xs">
                                            Pending
                                        </span>
                                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 md:h-9 md:w-9">
                                            <Clock className="h-3.5 w-3.5 text-white md:h-4 md:w-4" />
                                        </div>
                                    </div>
                                    <div className="bg-gradient-to-br from-amber-600 to-amber-500 bg-clip-text text-2xl font-bold text-transparent md:text-4xl">
                                        {stats.pending_orders}
                                    </div>
                                </div>
                            </div>
                            <div className="group relative">
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 opacity-20 blur-lg transition-opacity group-hover:opacity-30 md:rounded-2xl"></div>
                                <div className="relative rounded-xl border border-slate-200/50 bg-white p-3 shadow-sm transition-shadow hover:shadow-md md:rounded-2xl md:p-5">
                                    <div className="mb-2 flex items-center justify-between md:mb-3">
                                        <span className="text-[10px] font-semibold tracking-wide text-slate-500 uppercase md:text-xs">
                                            Approved
                                        </span>
                                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 md:h-9 md:w-9">
                                            <CheckCircle className="h-3.5 w-3.5 text-white md:h-4 md:w-4" />
                                        </div>
                                    </div>
                                    <div className="bg-gradient-to-br from-emerald-600 to-emerald-500 bg-clip-text text-2xl font-bold text-transparent md:text-4xl">
                                        {stats.approved_orders}
                                    </div>
                                </div>
                            </div>
                            <div className="group relative">
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-red-500 to-red-600 opacity-20 blur-lg transition-opacity group-hover:opacity-30 md:rounded-2xl"></div>
                                <div className="relative rounded-xl border border-slate-200/50 bg-white p-3 shadow-sm transition-shadow hover:shadow-md md:rounded-2xl md:p-5">
                                    <div className="mb-2 flex items-center justify-between md:mb-3">
                                        <span className="text-[10px] font-semibold tracking-wide text-slate-500 uppercase md:text-xs">
                                            Rejected
                                        </span>
                                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-red-600 md:h-9 md:w-9">
                                            <XCircle className="h-3.5 w-3.5 text-white md:h-4 md:w-4" />
                                        </div>
                                    </div>
                                    <div className="bg-gradient-to-br from-red-600 to-red-500 bg-clip-text text-2xl font-bold text-transparent md:text-4xl">
                                        {stats.rejected_orders}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Filter Tabs - Scrollable on mobile */}
                        <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
                            <div className="flex w-fit min-w-max gap-2 rounded-xl border border-slate-200/50 bg-white p-1.5 shadow-sm">
                                {['all', 'pending', 'approved', 'rejected'].map(
                                    (status) => (
                                        <button
                                            key={status}
                                            onClick={() => setFilter(status)}
                                            className={`rounded-lg px-3 py-2 text-xs font-medium whitespace-nowrap transition-all duration-300 md:px-4 md:text-sm ${
                                                filter === status
                                                    ? 'bg-gradient-to-r from-[#00447C] to-[#003d6f] text-white shadow-md'
                                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                            }`}
                                        >
                                            {status.charAt(0).toUpperCase() +
                                                status.slice(1)}
                                        </button>
                                    ),
                                )}
                            </div>
                        </div>

                        {/* Pending Orders Section */}
                        {pendingOrders.length > 0 ? (
                            <div className="relative">
                                <div className="absolute top-0 bottom-0 -left-4 hidden w-1 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 md:block"></div>
                                <div className="mb-4 flex flex-col gap-2 pl-0 sm:mb-6 sm:flex-row sm:items-center sm:gap-3 sm:pl-4">
                                    <div className="relative flex-shrink-0">
                                        <div className="absolute inset-0 rounded-full bg-amber-400/30 blur-md"></div>
                                        <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 sm:h-10 sm:w-10">
                                            <AlertCircle className="h-4 w-4 text-white sm:h-5 sm:w-5" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-base font-bold text-slate-900 sm:text-lg">
                                            Pending Approval
                                        </h2>
                                        <p className="text-xs font-medium text-slate-500">
                                            Requires your attention
                                        </p>
                                    </div>
                                    <Badge className="self-start bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md sm:self-center">
                                        <Sparkles className="mr-1 h-3 w-3" />
                                        {pendingOrders.length}
                                    </Badge>
                                </div>
                                <div className="grid gap-3 md:gap-4">
                                    {pendingOrders.map((order, index) => (
                                        <div
                                            key={order.id}
                                            className="group relative"
                                            style={{
                                                animationDelay: `${index * 100}ms`,
                                            }}
                                        >
                                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-500/10 to-amber-600/5 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100"></div>
                                            <div className="relative overflow-hidden rounded-2xl border border-amber-200/50 bg-white shadow-sm transition-all duration-300 hover:shadow-lg">
                                                {/* Top accent bar */}
                                                <div className="h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600"></div>

                                                <div className="p-4 md:p-5">
                                                    <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between md:mb-4">
                                                        <div className="flex flex-1 items-center gap-3 md:gap-4">
                                                            <div className="relative flex-shrink-0">
                                                                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 opacity-50 blur-md"></div>
                                                                <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-lg font-bold text-white shadow-lg md:h-14 md:w-14 md:text-xl">
                                                                    {order.user.name
                                                                        .charAt(
                                                                            0,
                                                                        )
                                                                        .toUpperCase()}
                                                                </div>
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <div className="truncate text-base font-bold text-slate-900 md:text-lg">
                                                                    {
                                                                        order
                                                                            .user
                                                                            .name
                                                                    }
                                                                </div>
                                                                <div className="truncate text-xs font-medium text-slate-600 sm:text-sm">
                                                                    {order.user
                                                                        .shop_name ||
                                                                        order
                                                                            .user
                                                                            .email}
                                                                </div>
                                                                <div className="mt-1.5 space-y-0.5 text-xs text-slate-500">
                                                                    {order.user
                                                                        .phone && (
                                                                        <div className="flex items-center gap-1">
                                                                            <svg
                                                                                className="h-3 w-3"
                                                                                fill="none"
                                                                                stroke="currentColor"
                                                                                viewBox="0 0 24 24"
                                                                            >
                                                                                <path
                                                                                    strokeLinecap="round"
                                                                                    strokeLinejoin="round"
                                                                                    strokeWidth={
                                                                                        2
                                                                                    }
                                                                                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                                                                />
                                                                            </svg>
                                                                            <span>
                                                                                {
                                                                                    order
                                                                                        .user
                                                                                        .phone
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                    {order.user
                                                                        .address && (
                                                                        <div className="flex items-start gap-1">
                                                                            <svg
                                                                                className="mt-0.5 h-3 w-3 flex-shrink-0"
                                                                                fill="none"
                                                                                stroke="currentColor"
                                                                                viewBox="0 0 24 24"
                                                                            >
                                                                                <path
                                                                                    strokeLinecap="round"
                                                                                    strokeLinejoin="round"
                                                                                    strokeWidth={
                                                                                        2
                                                                                    }
                                                                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                                                                />
                                                                                <path
                                                                                    strokeLinecap="round"
                                                                                    strokeLinejoin="round"
                                                                                    strokeWidth={
                                                                                        2
                                                                                    }
                                                                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                                                                />
                                                                            </svg>
                                                                            <span className="break-words">
                                                                                {
                                                                                    order
                                                                                        .user
                                                                                        .address
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                    <div className="flex items-center gap-1 pt-0.5">
                                                                        <Clock className="h-3 w-3" />
                                                                        <span>
                                                                            {
                                                                                order.created_at
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <Badge
                                                            className={getStatusBadgeClass(
                                                                order.status,
                                                            )}
                                                            variant="outline"
                                                        >
                                                            {order.status
                                                                .charAt(0)
                                                                .toUpperCase() +
                                                                order.status.slice(
                                                                    1,
                                                                )}
                                                        </Badge>
                                                    </div>

                                                    {/* Order Items */}
                                                    <div className="mb-3 rounded-xl border border-slate-200/50 bg-gradient-to-br from-slate-50 to-slate-100/50 p-3 md:mb-4 md:p-4">
                                                        <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-700 md:mb-3">
                                                            <Package className="h-3.5 w-3.5" />
                                                            Order Items
                                                        </div>
                                                        <div className="space-y-1.5 md:space-y-2">
                                                            {order.items.map(
                                                                (
                                                                    item,
                                                                    itemIndex,
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            itemIndex
                                                                        }
                                                                        className="flex flex-col gap-1 rounded-lg border border-slate-200/50 bg-white/50 p-2 text-xs sm:flex-row sm:items-center sm:justify-between"
                                                                    >
                                                                        <span className="font-medium break-words text-slate-700">
                                                                            {
                                                                                item.product_name
                                                                            }
                                                                        </span>
                                                                        <div className="flex-shrink-0 text-right">
                                                                            <span className="text-slate-600">
                                                                                {
                                                                                    item.quantity
                                                                                }{' '}
                                                                                ×
                                                                                LKR{' '}
                                                                                {item.price.toFixed(
                                                                                    2,
                                                                                )}
                                                                            </span>
                                                                            <span className="ml-2 font-bold text-slate-900">
                                                                                =
                                                                                LKR{' '}
                                                                                {item.subtotal.toFixed(
                                                                                    2,
                                                                                )}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                ),
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Total and Actions */}
                                                    <div className="flex flex-col gap-3 border-t border-slate-200/50 pt-3 sm:flex-row sm:items-center sm:justify-between md:pt-4">
                                                        <div>
                                                            <div className="mb-0.5 text-xs font-medium text-slate-500">
                                                                Total Amount
                                                            </div>
                                                            <div className="bg-gradient-to-br from-slate-900 to-slate-700 bg-clip-text text-xl font-bold text-transparent md:text-2xl">
                                                                LKR{' '}
                                                                {order.total_amount.toFixed(
                                                                    2,
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-shrink-0 gap-2">
                                                            <Button
                                                                onClick={() =>
                                                                    handleReject(
                                                                        order.id,
                                                                    )
                                                                }
                                                                variant="outline"
                                                                size="sm"
                                                                className="flex-1 border-red-200 text-red-600 transition-all duration-300 hover:border-red-300 hover:bg-red-50 hover:text-red-700 sm:flex-none"
                                                            >
                                                                <XCircle className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                                                <span className="ml-1 md:ml-1.5">
                                                                    Reject
                                                                </span>
                                                            </Button>
                                                            <Button
                                                                onClick={() =>
                                                                    handleApprove(
                                                                        order.id,
                                                                    )
                                                                }
                                                                size="sm"
                                                                className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md transition-all duration-300 hover:from-emerald-600 hover:to-emerald-700 hover:shadow-lg sm:flex-none"
                                                            >
                                                                <CheckCircle className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                                                <span className="ml-1 hidden sm:inline md:ml-1.5">
                                                                    Approve
                                                                </span>
                                                                <span className="ml-1 sm:hidden md:ml-1.5">
                                                                    OK
                                                                </span>
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : filter === 'pending' ? (
                            <div className="relative overflow-hidden rounded-2xl border border-slate-200/50 bg-white shadow-sm">
                                <div className="absolute inset-0 bg-gradient-to-br from-amber-50/30 to-transparent"></div>
                                <div className="relative flex flex-col items-center justify-center px-6 py-16 text-center">
                                    <div className="relative mb-6">
                                        <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-xl"></div>
                                        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-amber-200">
                                            <AlertCircle className="h-10 w-10 text-amber-400" />
                                        </div>
                                    </div>
                                    <h3 className="mb-2 text-xl font-bold text-slate-900">
                                        No pending orders
                                    </h3>
                                    <p className="max-w-sm text-slate-500">
                                        There are no orders awaiting your
                                        approval at the moment.
                                    </p>
                                </div>
                            </div>
                        ) : null}

                        {/* Other Orders Section */}
                        {otherOrders.length > 0 ? (
                            <div className="mt-4">
                                <div className="mb-4 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-center sm:gap-3">
                                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-400 to-slate-600 sm:h-10 sm:w-10">
                                        <Package className="h-4 w-4 text-white sm:h-5 sm:w-5" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-base font-bold text-slate-900 sm:text-lg">
                                            Processed Orders
                                        </h2>
                                        <p className="text-xs font-medium text-slate-500">
                                            Completed decisions
                                        </p>
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className="flex-shrink-0 self-start sm:self-center"
                                    >
                                        {otherOrders.length}
                                    </Badge>
                                </div>

                                {/* Bulk Delete Action Bar */}
                                {selectedOrders.length > 0 && (
                                    <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-3">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-red-600" />
                                            <span className="text-sm font-medium text-red-700">
                                                {selectedOrders.length} approved
                                                order(s) selected
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    setSelectedOrders([])
                                                }
                                                className="text-red-600 hover:bg-red-100"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                variant="default"
                                                size="sm"
                                                onClick={
                                                    handleDeleteApprovedOrders
                                                }
                                                className="bg-red-600 text-white hover:bg-red-700"
                                            >
                                                <Trash2 className="mr-1 h-4 w-4" />
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Select All Header */}
                                {otherOrders.some(
                                    (o) => o.status === 'approved',
                                ) && (
                                    <div className="mb-2 flex items-center gap-3 px-1">
                                        <button
                                            onClick={toggleSelectAllApproved}
                                            className="flex-shrink-0"
                                        >
                                            <div
                                                className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-all ${
                                                    selectedOrders.length ===
                                                        otherOrders.filter(
                                                            (o) =>
                                                                o.status ===
                                                                'approved',
                                                        ).length &&
                                                    selectedOrders.length > 0
                                                        ? 'border-red-600 bg-red-600'
                                                        : 'border-slate-300 bg-white hover:border-red-400'
                                                }`}
                                            >
                                                {selectedOrders.length ===
                                                    otherOrders.filter(
                                                        (o) =>
                                                            o.status ===
                                                            'approved',
                                                    ).length &&
                                                    selectedOrders.length >
                                                        0 && (
                                                        <CheckCircle className="h-3.5 w-3.5 text-white" />
                                                    )}
                                            </div>
                                        </button>
                                        <span className="text-sm text-slate-600">
                                            Select all approved orders
                                        </span>
                                    </div>
                                )}

                                <div className="grid gap-3">
                                    {otherOrders.map((order) => (
                                        <div
                                            key={order.id}
                                            className={`group relative overflow-hidden rounded-xl border shadow-sm transition-all duration-300 hover:shadow-md ${
                                                order.status === 'approved'
                                                    ? 'border-emerald-200/50 bg-gradient-to-br from-emerald-50/50 to-emerald-100/30'
                                                    : 'border-red-200/50 bg-gradient-to-br from-red-50/50 to-red-100/30'
                                            }`}
                                        >
                                            <div
                                                className={`h-0.5 bg-gradient-to-r ${
                                                    order.status === 'approved'
                                                        ? 'from-emerald-400 via-emerald-500 to-emerald-600'
                                                        : 'from-red-400 via-red-500 to-red-600'
                                                }`}
                                            ></div>
                                            <div className="p-4">
                                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                    <div className="flex flex-1 items-center gap-3">
                                                        {order.status ===
                                                            'approved' && (
                                                            <button
                                                                onClick={() =>
                                                                    toggleOrderSelection(
                                                                        order.id,
                                                                    )
                                                                }
                                                                className="mt-1 flex-shrink-0 sm:mt-0"
                                                            >
                                                                <div
                                                                    className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-all ${
                                                                        selectedOrders.includes(
                                                                            order.id,
                                                                        )
                                                                            ? 'border-red-600 bg-red-600'
                                                                            : 'border-slate-300 bg-white hover:border-red-400'
                                                                    }`}
                                                                >
                                                                    {selectedOrders.includes(
                                                                        order.id,
                                                                    ) && (
                                                                        <CheckCircle className="h-3.5 w-3.5 text-white" />
                                                                    )}
                                                                </div>
                                                            </button>
                                                        )}
                                                        <div
                                                            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg font-bold text-white sm:h-11 sm:w-11 ${
                                                                order.status ===
                                                                'approved'
                                                                    ? 'bg-gradient-to-br from-emerald-400 to-emerald-600'
                                                                    : 'bg-gradient-to-br from-red-400 to-red-600'
                                                            }`}
                                                        >
                                                            {order.user.name
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="truncate font-semibold text-slate-900">
                                                                {
                                                                    order.user
                                                                        .name
                                                                }
                                                            </div>
                                                            <div className="truncate text-xs text-slate-600">
                                                                {order.user
                                                                    .shop_name ||
                                                                    order.user
                                                                        .email}
                                                            </div>
                                                            <div className="mt-1 space-y-0.5 text-xs text-slate-500">
                                                                {order.user
                                                                    .phone && (
                                                                    <div className="flex items-center gap-1">
                                                                        <svg
                                                                            className="h-3 w-3"
                                                                            fill="none"
                                                                            stroke="currentColor"
                                                                            viewBox="0 0 24 24"
                                                                        >
                                                                            <path
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                                strokeWidth={
                                                                                    2
                                                                                }
                                                                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                                                            />
                                                                        </svg>
                                                                        <span className="truncate">
                                                                            {formatPhone(
                                                                                order
                                                                                    .user
                                                                                    .phone,
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                {order.user
                                                                    .address && (
                                                                    <div className="flex items-start gap-1">
                                                                        <svg
                                                                            className="mt-0.5 h-3 w-3 flex-shrink-0"
                                                                            fill="none"
                                                                            stroke="currentColor"
                                                                            viewBox="0 0 24 24"
                                                                        >
                                                                            <path
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                                strokeWidth={
                                                                                    2
                                                                                }
                                                                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                                                            />
                                                                            <path
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                                strokeWidth={
                                                                                    2
                                                                                }
                                                                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                                                            />
                                                                        </svg>
                                                                        <span className="break-words">
                                                                            {formatAddress(
                                                                                order
                                                                                    .user
                                                                                    .address,
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-shrink-0 items-center gap-3">
                                                        <Badge
                                                            className={getStatusBadgeClass(
                                                                order.status,
                                                            )}
                                                        >
                                                            {order.status
                                                                .charAt(0)
                                                                .toUpperCase() +
                                                                order.status.slice(
                                                                    1,
                                                                )}
                                                        </Badge>
                                                        <div className="text-right">
                                                            <div className="text-sm font-bold text-slate-900">
                                                                LKR{' '}
                                                                {order.total_amount.toFixed(
                                                                    2,
                                                                )}
                                                            </div>
                                                            <div className="text-xs text-slate-500">
                                                                {
                                                                    order.items
                                                                        .length
                                                                }{' '}
                                                                items
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : filter === 'approved' || filter === 'rejected' ? (
                            <div className="relative mt-4 overflow-hidden rounded-2xl border border-slate-200/50 bg-white shadow-sm">
                                <div
                                    className={`absolute inset-0 bg-gradient-to-br to-transparent ${
                                        filter === 'approved'
                                            ? 'from-emerald-50/30'
                                            : 'from-red-50/30'
                                    }`}
                                ></div>
                                <div className="relative flex flex-col items-center justify-center px-6 py-12 text-center md:py-16">
                                    <div className="relative mb-4 md:mb-6">
                                        <div
                                            className={`absolute inset-0 rounded-full blur-xl ${
                                                filter === 'approved'
                                                    ? 'bg-emerald-400/20'
                                                    : 'bg-red-400/20'
                                            }`}
                                        ></div>
                                        <div
                                            className={`relative flex h-16 w-16 items-center justify-center rounded-full md:h-20 md:w-20 ${
                                                filter === 'approved'
                                                    ? 'bg-gradient-to-br from-emerald-100 to-emerald-200'
                                                    : 'bg-gradient-to-br from-red-100 to-red-200'
                                            }`}
                                        >
                                            {filter === 'approved' ? (
                                                <CheckCircle className="h-8 w-8 text-emerald-400 md:h-10 md:w-10" />
                                            ) : (
                                                <XCircle className="h-8 w-8 text-red-400 md:h-10 md:w-10" />
                                            )}
                                        </div>
                                    </div>
                                    <h3 className="mb-2 text-lg font-bold text-slate-900 md:text-xl">
                                        No {filter} orders
                                    </h3>
                                    <p className="max-w-sm px-4 text-sm text-slate-500 md:text-base">
                                        {filter === 'approved'
                                            ? 'There are no approved orders yet.'
                                            : 'There are no rejected orders yet.'}
                                    </p>
                                </div>
                            </div>
                        ) : null}

                        {/* Empty State for All Filter */}
                        {filter === 'all' && filteredOrders.length === 0 && (
                            <div className="relative overflow-hidden rounded-2xl border border-slate-200/50 bg-white shadow-sm">
                                <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 to-transparent"></div>
                                <div className="relative flex flex-col items-center justify-center px-6 py-12 text-center md:py-16">
                                    <div className="relative mb-4 md:mb-6">
                                        <div className="absolute inset-0 rounded-full bg-slate-400/20 blur-xl"></div>
                                        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-300 md:h-20 md:w-20">
                                            <Package className="h-8 w-8 text-slate-400 md:h-10 md:w-10" />
                                        </div>
                                    </div>
                                    <h3 className="mb-2 text-lg font-bold text-slate-900 md:text-xl">
                                        No orders yet
                                    </h3>
                                    <p className="max-w-sm px-4 text-sm text-slate-500 md:text-base">
                                        There are no orders in the system yet.
                                        Orders from retailers will appear here.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </main>

                {/* Footer border */}
                <div className="relative h-2 rounded-b-2xl border-t border-slate-200/50 bg-white/80 backdrop-blur-xl"></div>
            </div>
        </div>
    );
}
