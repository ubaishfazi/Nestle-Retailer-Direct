import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    ArrowLeft,
    Save,
    Tag,
    Calendar,
    Percent,
    DollarSign,
    QrCode,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { dashboard } from '@/routes';
import type { BreadcrumbItem, Promotion, Product } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface ProductOption {
    id: number;
    name: string;
    price: number;
}

interface Props {
    promotion?: Promotion;
    products: ProductOption[];
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

export default function PromotionForm({ promotion, products }: Props) {
    const { toast } = useToast();
    const isEditing = !!promotion;

    // Form state
    const [title, setTitle] = useState(promotion?.title || '');
    const [description, setDescription] = useState(
        promotion?.description || '',
    );
    const [promoCode, setPromoCode] = useState(promotion?.promo_code || '');
    const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>(
        promotion?.discount_type || 'percentage',
    );
    const [discountValue, setDiscountValue] = useState(
        promotion?.discount_value?.toString() || '',
    );
    const [minimumOrderAmount, setMinimumOrderAmount] = useState(
        promotion?.minimum_order_amount?.toString() || '',
    );
    const [maximumDiscountAmount, setMaximumDiscountAmount] = useState(
        promotion?.maximum_discount_amount?.toString() || '',
    );
    const [startDate, setStartDate] = useState(
        promotion?.start_date
            ? promotion.start_date.split(' ')[0]
            : new Date().toISOString().split('T')[0],
    );
    const [startTime, setStartTime] = useState(
        promotion?.start_date
            ? promotion.start_date.split(' ')[1] || '00:00'
            : '00:00',
    );
    const [expiryDate, setExpiryDate] = useState(
        promotion?.expiry_date ? promotion.expiry_date.split(' ')[0] : '',
    );
    const [expiryTime, setExpiryTime] = useState(
        promotion?.expiry_date
            ? promotion.expiry_date.split(' ')[1] || '23:59'
            : '23:59',
    );
    const [isActive, setIsActive] = useState(promotion?.is_active ?? true);
    const [usageLimit, setUsageLimit] = useState(
        promotion?.usage_limit?.toString() || '',
    );
    const [selectedProductIds, setSelectedProductIds] = useState<number[]>(
        promotion?.selected_product_ids || [],
    );
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showQR, setShowQR] = useState(false);

    const handleGeneratePromoCode = () => {
        fetch('/promotions/generate-code')
            .then((res) => res.json())
            .then((data) => {
                setPromoCode(data.promo_code);
            })
            .catch(() => {
                toast({
                    title: 'Error',
                    description: 'Failed to generate promo code.',
                    variant: 'destructive',
                });
            });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        const formData = {
            title,
            description,
            promo_code: promoCode,
            discount_type: discountType,
            discount_value: parseFloat(discountValue),
            minimum_order_amount: minimumOrderAmount
                ? parseFloat(minimumOrderAmount)
                : null,
            maximum_discount_amount: maximumDiscountAmount
                ? parseFloat(maximumDiscountAmount)
                : null,
            start_date: `${startDate} ${startTime}`,
            expiry_date: `${expiryDate} ${expiryTime}`,
            is_active: isActive,
            usage_limit: usageLimit ? parseInt(usageLimit) : null,
            product_ids: selectedProductIds,
        };

        const url = isEditing ? `/promotions/${promotion!.id}` : '/promotions';
        const method = isEditing ? 'put' : 'post';

        router[method](url, formData, {
            preserveScroll: true,
            onError: (errors) => {
                setErrors(errors as Record<string, string>);
                toast({
                    title: 'Validation Error',
                    description: 'Please check the form for errors.',
                    variant: 'destructive',
                });
            },
            onSuccess: () => {
                toast({
                    title: isEditing
                        ? 'Promotion updated'
                        : 'Promotion created',
                    description: isEditing
                        ? 'The promotion has been successfully updated.'
                        : 'The promotion has been successfully created.',
                });
            },
        });
    };

    const toggleProduct = (productId: number) => {
        setSelectedProductIds((prev) =>
            prev.includes(productId)
                ? prev.filter((id) => id !== productId)
                : [...prev, productId],
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEditing ? 'Edit Promotion' : 'Create Promotion'} />
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <a href="/promotions">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Promotions
                        </a>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {isEditing
                                ? 'Edit Promotion'
                                : 'Create New Promotion'}
                        </h1>
                        <p className="text-muted-foreground">
                            {isEditing
                                ? 'Update the promotion details'
                                : 'Add a new promotional offer for retailers'}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                                <CardDescription>
                                    Enter the promotion title and description
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="title">Title *</Label>
                                    <Input
                                        id="title"
                                        value={title}
                                        onChange={(e) =>
                                            setTitle(e.target.value)
                                        }
                                        placeholder="e.g., Summer Sale 2026"
                                        required
                                    />
                                    {errors.title && (
                                        <p className="text-sm text-red-500">
                                            {errors.title}
                                        </p>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="description">
                                        Description
                                    </Label>
                                    <Textarea
                                        id="description"
                                        value={description}
                                        onChange={(e) =>
                                            setDescription(e.target.value)
                                        }
                                        placeholder="Describe the promotion details..."
                                        rows={3}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Promo Code */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Tag className="h-5 w-5" />
                                    Promo Code
                                </CardTitle>
                                <CardDescription>
                                    Unique code that retailers will use to apply
                                    this promotion
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="promo_code">
                                        Promo Code *
                                    </Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="promo_code"
                                            value={promoCode}
                                            onChange={(e) =>
                                                setPromoCode(
                                                    e.target.value.toUpperCase(),
                                                )
                                            }
                                            placeholder="e.g., SUMMER2026"
                                            className="uppercase"
                                            required
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleGeneratePromoCode}
                                        >
                                            Generate
                                        </Button>
                                    </div>
                                    {errors.promo_code && (
                                        <p className="text-sm text-red-500">
                                            {errors.promo_code}
                                        </p>
                                    )}
                                </div>

                                {/* QR Code Preview */}
                                {promoCode && (
                                    <div className="mt-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setShowQR(!showQR)}
                                        >
                                            <QrCode className="mr-2 h-4 w-4" />
                                            {showQR ? 'Hide' : 'Show'} QR Code
                                        </Button>
                                        {showQR && (
                                            <div className="mt-4 flex flex-col items-center gap-3 rounded-lg border p-6">
                                                <code className="rounded bg-muted px-3 py-2 font-mono text-lg">
                                                    {promoCode}
                                                </code>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Discount Settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Percent className="h-5 w-5" />
                                    Discount Settings
                                </CardTitle>
                                <CardDescription>
                                    Configure the discount type and amount
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="discount_type">
                                        Discount Type *
                                    </Label>
                                    <Select
                                        value={discountType}
                                        onValueChange={(
                                            value: 'percentage' | 'fixed',
                                        ) => setDiscountType(value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select discount type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="percentage">
                                                Percentage (%)
                                            </SelectItem>
                                            <SelectItem value="fixed">
                                                Fixed Amount (LKR)
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="discount_value">
                                        Discount Value *
                                    </Label>
                                    <div className="relative">
                                        {discountType === 'percentage' ? (
                                            <Percent className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                                        ) : (
                                            <span className="absolute top-3 left-3 text-sm text-muted-foreground">
                                                LKR
                                            </span>
                                        )}
                                        <Input
                                            id="discount_value"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={discountValue}
                                            onChange={(e) =>
                                                setDiscountValue(e.target.value)
                                            }
                                            placeholder={
                                                discountType === 'percentage'
                                                    ? 'e.g., 20'
                                                    : 'e.g., 50.00'
                                            }
                                            className="pl-10"
                                            required
                                        />
                                    </div>
                                    {errors.discount_value && (
                                        <p className="text-sm text-red-500">
                                            {errors.discount_value}
                                        </p>
                                    )}
                                    {discountType === 'percentage' && (
                                        <p className="text-xs text-muted-foreground">
                                            Enter a value between 0 and 100
                                        </p>
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="minimum_order_amount">
                                        Minimum Order Amount (Optional)
                                    </Label>
                                    <div className="relative">
                                        <span className="absolute top-3 left-3 text-sm text-muted-foreground">
                                            LKR
                                        </span>
                                        <Input
                                            id="minimum_order_amount"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={minimumOrderAmount}
                                            onChange={(e) =>
                                                setMinimumOrderAmount(
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="e.g., 100.00"
                                            className="pl-10"
                                        />
                                    </div>
                                    {errors.minimum_order_amount && (
                                        <p className="text-sm text-red-500">
                                            {errors.minimum_order_amount}
                                        </p>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        Leave empty to apply discount on any
                                        order amount
                                    </p>
                                </div>

                                {discountType === 'percentage' && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="maximum_discount_amount">
                                            Maximum Discount Cap (Optional)
                                        </Label>
                                        <div className="relative">
                                            <span className="absolute top-3 left-3 text-sm text-muted-foreground">
                                                LKR
                                            </span>
                                            <Input
                                                id="maximum_discount_amount"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={maximumDiscountAmount}
                                                onChange={(e) =>
                                                    setMaximumDiscountAmount(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="e.g., 100.00"
                                                className="pl-10"
                                            />
                                        </div>
                                        {errors.maximum_discount_amount && (
                                            <p className="text-sm text-red-500">
                                                {errors.maximum_discount_amount}
                                            </p>
                                        )}
                                        <p className="text-xs text-muted-foreground">
                                            Maximum discount amount for
                                            percentage-based discounts
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Validity Period */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Validity Period
                                </CardTitle>
                                <CardDescription>
                                    Set the start and expiry dates for this
                                    promotion
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label>Start Date & Time *</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) =>
                                                setStartDate(e.target.value)
                                            }
                                            required
                                        />
                                        <Input
                                            type="time"
                                            value={startTime}
                                            onChange={(e) =>
                                                setStartTime(e.target.value)
                                            }
                                            required
                                        />
                                    </div>
                                    {errors.start_date && (
                                        <p className="text-sm text-red-500">
                                            {errors.start_date}
                                        </p>
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    <Label>Expiry Date & Time *</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Input
                                            type="date"
                                            value={expiryDate}
                                            onChange={(e) =>
                                                setExpiryDate(e.target.value)
                                            }
                                            min={startDate}
                                            required
                                        />
                                        <Input
                                            type="time"
                                            value={expiryTime}
                                            onChange={(e) =>
                                                setExpiryTime(e.target.value)
                                            }
                                            required
                                        />
                                    </div>
                                    {errors.expiry_date && (
                                        <p className="text-sm text-red-500">
                                            {errors.expiry_date}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Applicable Products */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Applicable Products</CardTitle>
                                <CardDescription>
                                    Select which products this promotion applies
                                    to. Leave empty to apply to all products.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid max-h-60 gap-3 overflow-y-auto">
                                    {products.map((product) => (
                                        <div
                                            key={product.id}
                                            className="flex items-center space-x-3 rounded-lg border p-3"
                                        >
                                            <Checkbox
                                                id={`product-${product.id}`}
                                                checked={selectedProductIds.includes(
                                                    product.id,
                                                )}
                                                onCheckedChange={() =>
                                                    toggleProduct(product.id)
                                                }
                                            />
                                            <Label
                                                htmlFor={`product-${product.id}`}
                                                className="flex flex-1 cursor-pointer items-center justify-between"
                                            >
                                                <span>{product.name}</span>
                                                <span className="text-sm text-muted-foreground">
                                                    LKR{' '}
                                                    {product.price.toFixed(2)}
                                                </span>
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                                {selectedProductIds.length > 0 && (
                                    <div className="mt-4">
                                        <p className="text-sm font-medium">
                                            Selected Products (
                                            {selectedProductIds.length}):
                                        </p>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {selectedProductIds.map((id) => {
                                                const product = products.find(
                                                    (p) => p.id === id,
                                                );
                                                return product ? (
                                                    <Badge
                                                        key={id}
                                                        variant="secondary"
                                                    >
                                                        {product.name}
                                                    </Badge>
                                                ) : null;
                                            })}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Usage Limit & Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Usage Limit & Status</CardTitle>
                                <CardDescription>
                                    Set usage limits and control promotion
                                    status
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="usage_limit">
                                        Usage Limit (Optional)
                                    </Label>
                                    <Input
                                        id="usage_limit"
                                        type="number"
                                        min="1"
                                        value={usageLimit}
                                        onChange={(e) =>
                                            setUsageLimit(e.target.value)
                                        }
                                        placeholder="e.g., 100 (leave empty for unlimited)"
                                    />
                                    {errors.usage_limit && (
                                        <p className="text-sm text-red-500">
                                            {errors.usage_limit}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_active"
                                        checked={isActive}
                                        onCheckedChange={(checked) =>
                                            setIsActive(checked as boolean)
                                        }
                                    />
                                    <Label htmlFor="is_active">
                                        Active (promotion will be visible to
                                        retailers)
                                    </Label>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Submit Button */}
                        <div className="flex items-center justify-end gap-2">
                            <Button variant="outline" asChild>
                                <a href="/promotions">Cancel</a>
                            </Button>
                            <Button type="submit">
                                <Save className="mr-2 h-4 w-4" />
                                {isEditing
                                    ? 'Update Promotion'
                                    : 'Create Promotion'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
