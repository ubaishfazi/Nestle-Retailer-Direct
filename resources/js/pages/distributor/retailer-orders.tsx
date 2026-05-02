import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Package, Clock, CheckCircle, XCircle, User, FileText } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { BreadcrumbItem } from '@/types';

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
}

interface Order {
    id: number;
    status: string;
    total_amount: number;
    created_at: string;
    created_date: string;
    has_invoice: boolean;
    invoice_number: string | null;
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

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Distributor',
        href: '/distributor/home',
    },
    {
        title: 'Retailer Orders',
        href: '/distributor/retailer-orders',
    },
];

function getStatusBadgeClass(status: string): string {
    switch (status) {
        case 'pending':
            return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
        case 'approved':
            return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
        case 'rejected':
            return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
}

export default function RetailerOrders({ orders, stats }: Props) {
    const { toast } = useToast();
    const [filter, setFilter] = useState('all');

    const handleApprove = (orderId: number) => {
        router.post(
            `/distributor/retailer-orders/${orderId}/approve`,
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
            `/distributor/retailer-orders/${orderId}/reject`,
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

    const handleGenerateInvoice = (orderId: number) => {
        router.post(
            `/distributor/retailer-orders/${orderId}/invoice`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast({
                        title: 'Invoice generated!',
                        description: 'The invoice has been generated successfully.',
                    });
                },
                onError: () => {
                    toast({
                        title: 'Failed to generate',
                        description: 'There was an error generating the invoice.',
                        variant: 'destructive',
                    });
                },
            },
        );
    };

    const filteredOrders =
        filter === 'all' ? orders : orders.filter((o) => o.status === filter);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Retailer Orders" />

            <div className="flex flex-col gap-6 p-6">
                {/* Page Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Retailer Orders
                    </h1>
                    <p className="mt-1 text-muted-foreground">
                        View and manage incoming retailer orders
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total
                            </CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.total_orders}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Pending
                            </CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.pending_orders}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Approved
                            </CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.approved_orders}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Rejected
                            </CardTitle>
                            <XCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.rejected_orders}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2">
                    {['all', 'pending', 'approved', 'rejected'].map(
                        (status) => (
                            <Button
                                key={status}
                                variant={
                                    filter === status ? 'default' : 'outline'
                                }
                                size="sm"
                                onClick={() => setFilter(status)}
                            >
                                {status.charAt(0).toUpperCase() +
                                    status.slice(1)}
                            </Button>
                        ),
                    )}
                </div>

                {/* Orders List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Incoming Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {filteredOrders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Package className="mb-4 h-12 w-12 text-muted-foreground" />
                                <h3 className="text-lg font-semibold">
                                    No orders found
                                </h3>
                                <p className="text-muted-foreground">
                                    No orders match the selected filter
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredOrders.map((order) => (
                                    <div
                                        key={order.id}
                                        className="rounded-lg border border-border p-4 transition-colors hover:bg-muted/30"
                                    >
                                        <div className="mb-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#00447C] to-[#003d6f] font-semibold text-white">
                                                    <User className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <div className="font-medium">
                                                        {order.user.name}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {order.user.shop_name ||
                                                            order.user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        <div className="flex items-center gap-4">
                                                <Badge
                                                    className={getStatusBadgeClass(
                                                        order.status,
                                                    )}
                                                >
                                                    {order.status
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        order.status.slice(1)}
                                                </Badge>
                                                {order.has_invoice && order.invoice_number && (
                                                    <a
                                                        href={`/invoices/${order.invoice_number!}/view`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 rounded border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-600 hover:bg-amber-100"
                                                        title="View Invoice"
                                                    >
                                                        <svg
                                                            className="h-3 w-3"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                            />
                                                        </svg>
                                                        Invoice
                                                    </a>
                                                )}
                                                {order.status === 'approved' && !order.has_invoice && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            handleGenerateInvoice(order.id)
                                                        }
                                                        className="border-amber-200 text-amber-600 hover:bg-amber-50"
                                                    >
                                                        <FileText className="mr-1 h-3 w-3" />
                                                        Generate Invoice
                                                    </Button>
                                                )}
                                                <div className="text-right">
                                                    <div className="font-semibold">
                                                        LKR{' '}
                                                        {order.total_amount.toFixed(
                                                            2,
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {order.created_at}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Order Items */}
                                        <div className="border-t pt-3">
                                            <div className="mb-2 text-xs font-medium text-muted-foreground">
                                                Order Items:
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {order.items.map(
                                                    (item, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center gap-2 rounded-md bg-muted/50 px-2 py-1.5"
                                                        >
                                                            <div>
                                                                <div className="text-xs font-medium">
                                                                    {
                                                                        item.product_name
                                                                    }
                                                                </div>
                                                                <div className="text-[10px] text-muted-foreground">
                                                                    Qty:{' '}
                                                                    {
                                                                        item.quantity
                                                                    }{' '}
                                                                    × LKR{' '}
                                                                    {item.price.toFixed(
                                                                        2,
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        </div>

                                        {/* Action Buttons for Pending Orders */}
                                        {order.status === 'pending' && (
                                            <div className="mt-3 flex gap-2 border-t pt-3">
                                                <Button
                                                    size="sm"
                                                    onClick={() =>
                                                        handleApprove(order.id)
                                                    }
                                                    className="bg-emerald-600 hover:bg-emerald-700"
                                                >
                                                    <CheckCircle className="mr-1 h-4 w-4" />
                                                    Approve
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() =>
                                                        handleReject(order.id)
                                                    }
                                                >
                                                    <XCircle className="mr-1 h-4 w-4" />
                                                    Reject
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
