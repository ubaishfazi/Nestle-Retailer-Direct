import { Head, router, Link } from '@inertiajs/react';
import {
    Plus,
    Tag,
    Calendar,
    TrendingUp,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Eye,
    Pencil,
    Trash2,
    QrCode,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';
import type { BreadcrumbItem, Promotion } from '@/types';
import { useToast } from '@/hooks/use-toast';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useState } from 'react';

interface Props {
    promotions: Promotion[];
    stats: {
        total: number;
        active: number;
        expired: number;
        scheduled: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
    },
    {
        title: 'Promotions',
        href: '/promotions',
    },
];

function getStatusBadge(status: string) {
    switch (status) {
        case 'active':
            return (
                <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Active
                </Badge>
            );
        case 'expired':
            return (
                <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                    <XCircle className="mr-1 h-3 w-3" />
                    Expired
                </Badge>
            );
        case 'scheduled':
            return (
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    <Clock className="mr-1 h-3 w-3" />
                    Scheduled
                </Badge>
            );
        case 'inactive':
            return (
                <Badge variant="secondary">
                    <XCircle className="mr-1 h-3 w-3" />
                    Inactive
                </Badge>
            );
        default:
            return <Badge variant="outline">Unknown</Badge>;
    }
}

export default function PromotionsIndex({ promotions, stats }: Props) {
    const { toast } = useToast();
    const [qrDialogOpen, setQrDialogOpen] = useState(false);
    const [selectedPromo, setSelectedPromo] = useState<Promotion | null>(null);

    const handleDelete = (promotion: Promotion) => {
        if (!confirm(`Are you sure you want to delete "${promotion.title}"?`)) {
            return;
        }

        router.delete(`/promotions/${promotion.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast({
                    title: 'Promotion deleted',
                    description: 'The promotion has been successfully deleted.',
                });
            },
            onError: () => {
                toast({
                    title: 'Error',
                    description: 'Failed to delete the promotion.',
                    variant: 'destructive',
                });
            },
        });
    };

    const handleShowQR = (promotion: Promotion) => {
        setSelectedPromo(promotion);
        setQrDialogOpen(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Promotions Management" />
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Promotions
                        </h1>
                        <p className="text-muted-foreground">
                            Manage promotional offers and discounts
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/promotions/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Promotion
                        </Link>
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total
                            </CardTitle>
                            <Tag className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.total}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Active
                            </CardTitle>
                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600">
                                {stats.active}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Expired
                            </CardTitle>
                            <XCircle className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">
                                {stats.expired}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Scheduled
                            </CardTitle>
                            <Clock className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">
                                {stats.scheduled}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Promotions Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Promotions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {promotions.length === 0 ? (
                            <div className="py-12 text-center">
                                <Tag className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-4 text-lg font-semibold">
                                    No promotions yet
                                </h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Create your first promotion to get started.
                                </p>
                                <Button asChild className="mt-4">
                                    <Link href="/promotions/create">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create Promotion
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="px-4 py-3 text-left font-medium">
                                                Title
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium">
                                                Promo Code
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium">
                                                Discount
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium">
                                                Status
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium">
                                                Valid Period
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium">
                                                Usage
                                            </th>
                                            <th className="px-4 py-3 text-right font-medium">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {promotions.map((promotion) => (
                                            <tr
                                                key={promotion.id}
                                                className="border-b hover:bg-muted/50"
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="font-medium">
                                                        {promotion.title}
                                                    </div>
                                                    {promotion.products_count >
                                                        0 && (
                                                        <div className="text-xs text-muted-foreground">
                                                            {
                                                                promotion.products_count
                                                            }{' '}
                                                            product(s)
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <code className="rounded bg-muted px-2 py-1 font-mono text-sm">
                                                        {promotion.promo_code}
                                                    </code>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="font-medium">
                                                        {promotion.discount_type ===
                                                        'percentage'
                                                            ? `${promotion.discount_value}%`
                                                            : `LKR ${promotion.discount_value.toFixed(2)}`}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {getStatusBadge(
                                                        promotion.status,
                                                    )}
                                                    {promotion.days_remaining !==
                                                        null &&
                                                        promotion.status ===
                                                            'active' && (
                                                            <div className="mt-1 text-xs text-muted-foreground">
                                                                {Math.floor(
                                                                    promotion.days_remaining,
                                                                )}{' '}
                                                                days left
                                                            </div>
                                                        )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="text-sm">
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            <span>
                                                                {new Date(
                                                                    promotion.start_date,
                                                                ).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            <span>
                                                                {new Date(
                                                                    promotion.expiry_date,
                                                                ).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="text-sm">
                                                        <span className="font-medium">
                                                            {
                                                                promotion.usage_count
                                                            }
                                                        </span>
                                                        {' / '}
                                                        {promotion.usage_limit ??
                                                            '∞'}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleShowQR(
                                                                    promotion,
                                                                )
                                                            }
                                                            title="View QR Code"
                                                        >
                                                            <QrCode className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            asChild
                                                            title="Edit"
                                                        >
                                                            <Link
                                                                href={`/promotions/${promotion.id}/edit`}
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    promotion,
                                                                )
                                                            }
                                                            title="Delete"
                                                            className="text-red-600 hover:text-red-700"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* QR Code Dialog */}
            <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Promotion QR Code</DialogTitle>
                        <DialogDescription>
                            Scan this QR code to apply the promotion "
                            {selectedPromo?.title}"
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center gap-4 py-4">
                        {selectedPromo && (
                            <>
                                <div className="text-center">
                                    <p className="text-sm font-medium">
                                        Promo Code:
                                    </p>
                                    <code className="mt-1 rounded bg-muted px-3 py-2 font-mono text-lg">
                                        {selectedPromo.promo_code}
                                    </code>
                                </div>
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
