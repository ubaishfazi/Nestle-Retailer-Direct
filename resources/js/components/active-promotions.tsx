import { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Tag,
    Calendar,
    Percent,
    DollarSign,
    Copy,
    QrCode,
    X,
} from 'lucide-react';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import type { ActivePromotion } from '@/types';

interface ActivePromotionsProps {
    compact?: boolean;
}

export default function ActivePromotions({
    compact = false,
}: ActivePromotionsProps) {
    const { toast } = useToast();
    const [promotions, setPromotions] = useState<ActivePromotion[]>([]);
    const [loading, setLoading] = useState(true);
    const [qrDialogOpen, setQrDialogOpen] = useState(false);
    const [selectedPromo, setSelectedPromo] = useState<ActivePromotion | null>(
        null,
    );
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/promotions/active')
            .then((res) => res.json())
            .then((data) => {
                setPromotions(data.promotions || []);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    }, []);

    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
        toast({
            title: 'Copied!',
            description: `Promo code "${code}" copied to clipboard`,
        });
    };

    const handleShowQR = (promotion: ActivePromotion) => {
        setSelectedPromo(promotion);
        setQrDialogOpen(true);
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Tag className="h-5 w-5" />
                        Active Promotions
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="py-8 text-center text-muted-foreground">
                        Loading promotions...
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (promotions.length === 0) {
        return null;
    }

    if (compact) {
        return (
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Tag className="h-5 w-5" />
                        Active Promotions
                    </CardTitle>
                    <CardDescription>
                        Current offers just for you
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {promotions.slice(0, 3).map((promotion) => (
                            <div
                                key={promotion.id}
                                className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-sm font-medium">
                                            {promotion.title}
                                        </h4>
                                        <Badge
                                            variant="secondary"
                                            className="text-xs"
                                        >
                                            {promotion.discount_type ===
                                            'percentage'
                                                ? `${promotion.discount_value}% OFF`
                                                : `LKR ${promotion.discount_value.toFixed(2)} OFF`}
                                        </Badge>
                                    </div>
                                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                        <Calendar className="h-3 w-3" />
                                        <span>
                                            {Math.floor(
                                                promotion.days_remaining,
                                            )}{' '}
                                            days remaining
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <code className="rounded bg-muted px-2 py-1 font-mono text-xs">
                                        {promotion.promo_code}
                                    </code>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                            handleCopyCode(promotion.promo_code)
                                        }
                                        className="h-7 w-7 p-0"
                                    >
                                        <Copy className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {promotions.length > 3 && (
                            <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="w-full"
                            >
                                <a href="/retailer/promotions">
                                    View All Promotions ({promotions.length})
                                </a>
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="flex items-center gap-2 text-2xl font-bold">
                        <Tag className="h-6 w-6" />
                        Active Promotions
                    </h2>
                    <p className="text-muted-foreground">
                        Exclusive offers and discounts for you
                    </p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {promotions.map((promotion) => (
                    <Card
                        key={promotion.id}
                        className="transition-shadow hover:shadow-lg"
                    >
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <CardTitle className="text-lg">
                                        {promotion.title}
                                    </CardTitle>
                                    <CardDescription className="mt-1">
                                        {promotion.description ||
                                            'Special offer'}
                                    </CardDescription>
                                </div>
                                <Badge
                                    variant="secondary"
                                    className="ml-2 flex items-center gap-1"
                                >
                                    {promotion.discount_type ===
                                    'percentage' ? (
                                        <Percent className="h-3 w-3" />
                                    ) : (
                                        <DollarSign className="h-3 w-3" />
                                    )}
                                    {promotion.discount_type === 'percentage'
                                        ? `${promotion.discount_value}%`
                                        : `LKR ${promotion.discount_value.toFixed(2)}`}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {promotion.minimum_order_amount && (
                                <p className="text-sm text-muted-foreground">
                                    Minimum order: LKR{' '}
                                    {promotion.minimum_order_amount.toFixed(2)}
                                </p>
                            )}

                            {promotion.products.length > 0 && (
                                <div>
                                    <p className="mb-1 text-sm font-medium">
                                        Applicable Products:
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                        {promotion.products
                                            .slice(0, 3)
                                            .map((product) => (
                                                <Badge
                                                    key={product.id}
                                                    variant="outline"
                                                    className="text-xs"
                                                >
                                                    {product.name}
                                                </Badge>
                                            ))}
                                        {promotion.products.length > 3 && (
                                            <Badge
                                                variant="outline"
                                                className="text-xs"
                                            >
                                                +{promotion.products.length - 3}{' '}
                                                more
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>
                                    {Math.floor(promotion.days_remaining)} days
                                    remaining
                                </span>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() =>
                                        handleCopyCode(promotion.promo_code)
                                    }
                                >
                                    <Copy className="mr-1 h-3 w-3" />
                                    {copiedCode === promotion.promo_code
                                        ? 'Copied!'
                                        : 'Copy Code'}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleShowQR(promotion)}
                                >
                                    <QrCode className="h-4 w-4" />
                                </Button>
                            </div>

                            <code className="block rounded bg-muted px-3 py-2 text-center font-mono text-sm">
                                {promotion.promo_code}
                            </code>
                        </CardContent>
                    </Card>
                ))}
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
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-2"
                                        onClick={() =>
                                            handleCopyCode(
                                                selectedPromo.promo_code,
                                            )
                                        }
                                    >
                                        <Copy className="mr-1 h-3 w-3" />
                                        {copiedCode === selectedPromo.promo_code
                                            ? 'Copied!'
                                            : 'Copy Code'}
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
