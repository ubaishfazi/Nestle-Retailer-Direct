import { Head, router } from '@inertiajs/react';
import {
    ShoppingCart,
    Package,
    DollarSign,
    Clock,
    User,
    Mail,
    CheckCircle,
    XCircle,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface OrderItem {
    product_name: string;
    product_image: string | null;
    quantity: number;
    price: number;
    subtotal: number;
}

interface OrderUser {
    id: number;
    name: string;
    email: string;
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
        total_revenue: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
    },
    {
        title: 'Retailer Orders',
        href: '/dashboard/orders',
    },
];

function getStatusBadgeVariant(
    status: string,
): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (status) {
        case 'pending':
            return 'secondary'; // yellow/amber
        case 'approved':
            return 'default'; // green
        case 'rejected':
            return 'destructive'; // red
        case 'completed':
            return 'outline';
        default:
            return 'outline';
    }
}

function getStatusBadgeClass(status: string): string {
    switch (status) {
        case 'pending':
            return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
        case 'approved':
            return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
        case 'rejected':
            return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        default:
            return '';
    }
}

export default function Orders({ orders, stats }: Props) {
    const { toast } = useToast();
    console.log('Orders page received:', { orders, stats });

    const handleApprove = (orderId: number) => {
        router.post(
            `/dashboard/orders/${orderId}/approve`,
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
            `/dashboard/orders/${orderId}/reject`,
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
                        View and manage all retailer orders
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Orders
                            </CardTitle>
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.total_orders}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                All time orders
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Pending Orders
                            </CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.pending_orders}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Awaiting review
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Revenue
                            </CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                LKR {stats.total_revenue.toFixed(2)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                All time revenue
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Orders List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {orders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Package className="mb-4 h-12 w-12 text-muted-foreground" />
                                <h3 className="text-lg font-semibold">
                                    No orders yet
                                </h3>
                                <p className="text-muted-foreground">
                                    Orders from retailers will appear here
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {orders.map((order) => (
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
                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                        <Mail className="h-3 w-3" />
                                                        {order.user.email}
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
                                                            {item.product_image && (
                                                                <img
                                                                    src={
                                                                        item.product_image
                                                                    }
                                                                    alt={
                                                                        item.product_name
                                                                    }
                                                                    className="h-6 w-6 rounded object-cover"
                                                                />
                                                            )}
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
                                                    Approve Order
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() =>
                                                        handleReject(order.id)
                                                    }
                                                >
                                                    <XCircle className="mr-1 h-4 w-4" />
                                                    Reject Order
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
