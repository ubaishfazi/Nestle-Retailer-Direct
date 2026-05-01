import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    Package,
    DollarSign,
    Clock,
    CheckCircle,
    XCircle,
    Truck,
    Eye,
} from 'lucide-react';
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
    user: OrderUser;
    items: OrderItem[];
}

interface Props {
    orders: Order[];
    stats: {
        total_orders: number;
        pending_orders: number;
        approved_orders: number;
        in_transit: number;
        delivered: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Distributor',
        href: '/distributor/home',
    },
    {
        title: 'Orders',
        href: '/distributor/orders',
    },
];

function getStatusBadgeClass(status: string): string {
    switch (status) {
        case 'pending':
            return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
        case 'approved':
            return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
        case 'in_transit':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
        case 'delivered':
            return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
        case 'rejected':
            return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
}

export default function DistributorOrders({ orders, stats }: Props) {
    const { toast } = useToast();
    const [filter, setFilter] = useState('all');

    const handleApprove = (orderId: number) => {
        router.post(
            `/distributor/orders/${orderId}/approve`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast({
                        title: 'Order approved!',
                        description:
                            'The order status has been updated to approved.',
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
            `/distributor/orders/${orderId}/reject`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast({
                        title: 'Order rejected',
                        description: 'The order has been rejected.',
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

    const handleStatusUpdate = (orderId: number, status: string) => {
        router.post(
            `/distributor/orders/${orderId}/status`,
            { status },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast({
                        title: 'Status updated!',
                        description: `Order status updated to ${status}.`,
                    });
                },
            },
        );
    };

    const filteredOrders =
        filter === 'all' ? orders : orders.filter((o) => o.status === filter);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Distributor Orders" />

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
                <div className="grid gap-4 md:grid-cols-5">
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
                                In Transit
                            </CardTitle>
                            <Truck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.in_transit}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Delivered
                            </CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.delivered}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2">
                    {[
                        'all',
                        'pending',
                        'approved',
                        'in_transit',
                        'delivered',
                        'rejected',
                    ].map((status) => (
                        <Button
                            key={status}
                            variant={filter === status ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFilter(status)}
                        >
                            {status.replace('_', ' ').charAt(0).toUpperCase() +
                                status.replace('_', ' ').slice(1)}
                        </Button>
                    ))}
                </div>

                {/* Orders List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Orders</CardTitle>
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
                                                    {order.user.name
                                                        .charAt(0)
                                                        .toUpperCase()}
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
                                                        .replace('_', ' ')
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        order.status
                                                            .replace('_', ' ')
                                                            .slice(1)}
                                                </Badge>
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

                                        {/* Status Update for Approved Orders */}
                                        {order.status === 'approved' && (
                                            <div className="mt-3 flex gap-2 border-t pt-3">
                                                <Button
                                                    size="sm"
                                                    onClick={() =>
                                                        handleStatusUpdate(
                                                            order.id,
                                                            'in_transit',
                                                        )
                                                    }
                                                >
                                                    <Truck className="mr-1 h-4 w-4" />
                                                    Mark In Transit
                                                </Button>
                                            </div>
                                        )}

                                        {/* Status Update for In Transit Orders */}
                                        {order.status === 'in_transit' && (
                                            <div className="mt-3 flex gap-2 border-t pt-3">
                                                <Button
                                                    size="sm"
                                                    onClick={() =>
                                                        handleStatusUpdate(
                                                            order.id,
                                                            'delivered',
                                                        )
                                                    }
                                                    className="bg-purple-600 hover:bg-purple-700"
                                                >
                                                    <CheckCircle className="mr-1 h-4 w-4" />
                                                    Mark Delivered
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
