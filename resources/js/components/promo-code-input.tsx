import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tag, Check, X, Loader2, QrCode, ScanLine } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { ValidatedPromotion } from '@/types';

interface PromoCodeInputProps {
    orderTotal: number;
    productIds: number[];
    onPromoApplied: (promotion: ValidatedPromotion | null) => void;
}

export default function PromoCodeInput({
    orderTotal,
    productIds,
    onPromoApplied,
}: PromoCodeInputProps) {
    const { toast } = useToast();
    const [promoCode, setPromoCode] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [appliedPromotion, setAppliedPromotion] =
        useState<ValidatedPromotion | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleValidatePromo = async () => {
        if (!promoCode.trim()) {
            toast({
                title: 'Error',
                description: 'Please enter a promo code',
                variant: 'destructive',
            });
            return;
        }

        setIsValidating(true);
        setError(null);

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
                    product_ids: productIds,
                    order_total: orderTotal,
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setAppliedPromotion(data.promotion);
                onPromoApplied(data.promotion);
                toast({
                    title: 'Promo Applied!',
                    description: `${data.promotion.title} - ${data.promotion.discount_type === 'percentage' ? `${data.promotion.discount_value}%` : `LKR ${data.promotion.discount_value.toFixed(2)}`} discount applied`,
                });
            } else {
                setError(data.message || 'Invalid promo code');
                setAppliedPromotion(null);
                onPromoApplied(null);
                toast({
                    title: 'Invalid Promo Code',
                    description:
                        data.message ||
                        'This promo code is invalid or expired.',
                    variant: 'destructive',
                });
            }
        } catch (err) {
            setError('Failed to validate promo code');
            toast({
                title: 'Error',
                description: 'Failed to validate promo code. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsValidating(false);
        }
    };

    const handleRemovePromo = () => {
        setPromoCode('');
        setAppliedPromotion(null);
        setError(null);
        onPromoApplied(null);
        toast({
            title: 'Promo Removed',
            description: 'Promo code has been removed from your order.',
        });
    };

    return (
        <Card>
            <CardContent className="pt-4">
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <h3 className="font-medium">Promo Code</h3>
                    </div>

                    {!appliedPromotion ? (
                        <div className="space-y-2">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Enter promo code"
                                    value={promoCode}
                                    onChange={(e) => {
                                        setPromoCode(
                                            e.target.value.toUpperCase(),
                                        );
                                        setError(null);
                                    }}
                                    className="flex-1 uppercase"
                                    disabled={isValidating}
                                />
                                <Button
                                    onClick={handleValidatePromo}
                                    disabled={isValidating || !promoCode.trim()}
                                    size="sm"
                                >
                                    {isValidating ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Check className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                            {error && (
                                <p className="flex items-center gap-1 text-sm text-red-500">
                                    <X className="h-3 w-3" />
                                    {error}
                                </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                Have a QR code? You can scan it to auto-fill the
                                promo code.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between rounded-lg border bg-emerald-50 p-3 dark:bg-emerald-950/20">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                                            <Check className="mr-1 h-3 w-3" />
                                            Applied
                                        </Badge>
                                        <span className="font-medium">
                                            {appliedPromotion.title}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {appliedPromotion.discount_type ===
                                        'percentage'
                                            ? `${appliedPromotion.discount_value}% discount`
                                            : `LKR ${appliedPromotion.discount_value.toFixed(2)} discount`}
                                        {appliedPromotion.discount_amount >
                                            0 && (
                                            <span className="ml-2 font-semibold text-emerald-600">
                                                (-LKR $
                                                {appliedPromotion.discount_amount.toFixed(
                                                    2,
                                                )}
                                                )
                                            </span>
                                        )}
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleRemovePromo}
                                    className="text-red-600 hover:text-red-700"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
