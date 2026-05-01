import { Head, router, usePage } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
    ChevronRight,
    Plus,
    Upload,
    Package,
    Calendar,
    DollarSign,
    Trash2,
    X,
} from 'lucide-react';

interface Order {
    id: number;
    status: string;
    total_amount: number;
    created_at: string;
    distributor_name: string;
    items: Array<{
        id: number;
        product_id: number | null;
        product_name: string;
        product_image: string | null;
        quantity: number;
        price: number;
    }>;
}

interface ComplaintProduct {
    id: string; // Temporary ID for UI
    product_id: number | null;
    product_name: string;
    product_image: string | null;
    quantity: string;
    proof_image: File | null;
    proof_image_preview: string | null;
    max_quantity: number;
}

interface PageProps {
    orders: Order[];
    [key: string]: any;
}

export default function CreateComplaint({ orders }: PageProps) {
    const { toast } = useToast();
    const { flash } = usePage().props;
    const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>(
        {},
    );

    const [selectedOrderId, setSelectedOrderId] = useState('');
    const [complaintProducts, setComplaintProducts] = useState<
        ComplaintProduct[]
    >([]);
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const selectedOrder = orders.find(
        (o) => o.id.toString() === selectedOrderId,
    );
    const orderProducts = selectedOrder?.items || [];

    const addProduct = () => {
        const newProduct: ComplaintProduct = {
            id: `temp_${Date.now()}_${Math.random()}`,
            product_id: null,
            product_name: '',
            product_image: null,
            quantity: '1',
            proof_image: null,
            proof_image_preview: null,
            max_quantity: 0,
        };
        setComplaintProducts([...complaintProducts, newProduct]);
    };

    const removeProduct = (id: string) => {
        setComplaintProducts(complaintProducts.filter((p) => p.id !== id));
    };

    const updateProduct = (
        id: string,
        field: keyof ComplaintProduct,
        value: any,
    ) => {
        setComplaintProducts(
            complaintProducts.map((p) => {
                if (p.id === id) {
                    const updated = { ...p, [field]: value };

                    // If product selection changed, update max_quantity and product details
                    if (field === 'product_id' && value) {
                        const orderProduct = orderProducts.find(
                            (op) => op.product_id === parseInt(value),
                        );
                        if (orderProduct) {
                            updated.product_name = orderProduct.product_name;
                            updated.product_image = orderProduct.product_image;
                            updated.max_quantity = orderProduct.quantity;
                            updated.quantity = Math.min(
                                parseInt(p.quantity) || 1,
                                orderProduct.quantity,
                            ).toString();
                        }
                    }

                    return updated;
                }
                return p;
            }),
        );
    };

    const handleImageChange = (
        productId: string,
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast({
                    title: 'File too large',
                    description: 'Image size must not exceed 2MB.',
                    variant: 'destructive',
                });
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                // Update both fields at once to avoid race condition
                setComplaintProducts(
                    complaintProducts.map((p) => {
                        if (p.id === productId) {
                            return {
                                ...p,
                                proof_image: file,
                                proof_image_preview: reader.result as string,
                            };
                        }
                        return p;
                    }),
                );
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedOrderId) {
            toast({
                title: 'Validation Error',
                description: 'Please select an order.',
                variant: 'destructive',
            });
            return;
        }
        if (complaintProducts.length === 0) {
            toast({
                title: 'Validation Error',
                description: 'Please add at least one product.',
                variant: 'destructive',
            });
            return;
        }

        // Validate all products
        for (let i = 0; i < complaintProducts.length; i++) {
            const product = complaintProducts[i];
            if (!product.product_id) {
                toast({
                    title: 'Validation Error',
                    description: `Please select a product for item #${i + 1}.`,
                    variant: 'destructive',
                });
                return;
            }
            if (!product.quantity || parseInt(product.quantity) < 1) {
                toast({
                    title: 'Validation Error',
                    description: `Please enter a valid quantity for ${product.product_name}.`,
                    variant: 'destructive',
                });
                return;
            }
            if (parseInt(product.quantity) > product.max_quantity) {
                toast({
                    title: 'Validation Error',
                    description: `Quantity for ${product.product_name} cannot exceed ${product.max_quantity}.`,
                    variant: 'destructive',
                });
                return;
            }
            if (!product.proof_image) {
                toast({
                    title: 'Validation Error',
                    description: `Please upload a proof image for ${product.product_name}.`,
                    variant: 'destructive',
                });
                return;
            }
        }
        if (!description.trim()) {
            toast({
                title: 'Validation Error',
                description: 'Please provide a description of the damage.',
                variant: 'destructive',
            });
            return;
        }

        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('order_id', selectedOrderId);
        formData.append('description', description);

        // Use flat structure for better file upload support
        complaintProducts.forEach((product, index) => {
            formData.append(
                `products[${index}][product_id]`,
                product.product_id?.toString() || '',
            );
            formData.append(
                `products[${index}][product_name]`,
                product.product_name,
            );
            formData.append(
                `products[${index}][product_image]`,
                product.product_image || '',
            );
            formData.append(`products[${index}][quantity]`, product.quantity);
            if (product.proof_image) {
                formData.append(
                    `products[${index}][proof_image]`,
                    product.proof_image,
                );
            }
        });

        // Use Inertia router with forceFormData
        router.post('/complaints', formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                // Success redirect with flash message will handle showing toast
                console.log('Complaint submitted successfully');
            },
            onError: (errors) => {
                console.error('Validation errors:', errors);
                const firstError = Object.values(errors)[0];
                if (firstError) {
                    toast({
                        title: 'Validation Error',
                        description: firstError as string,
                        variant: 'destructive',
                    });
                }
            },
            onFinish: () => {
                setIsSubmitting(false);
            },
        });
    };

    return (
        <div className="flex min-h-screen items-start justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 px-3 py-4 md:py-8">
            <Head title="Submit Complaint" />

            {/* Decorative Background */}
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
                        <div className="mb-3 flex items-center gap-3">
                            <a
                                href="/complaints"
                                className="flex items-center gap-2 text-slate-600 transition-colors hover:text-[#00447C]"
                            >
                                <ChevronRight className="h-4 w-4 rotate-180" />
                                <span className="text-sm font-medium">
                                    Back to Complaints
                                </span>
                            </a>
                        </div>
                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                            <div>
                                <h1 className="text-lg font-bold tracking-tight text-slate-900 md:text-xl">
                                    Submit Damaged Product Complaint
                                </h1>
                                <p className="text-xs font-medium text-slate-500">
                                    Report damaged products and track resolution
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Form Content */}
                <main className="relative rounded-b-2xl border-x border-slate-200/50 bg-white/60 px-4 py-6 pb-32 backdrop-blur-sm md:px-6 md:py-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Selected Order Info */}
                        {selectedOrder && (
                            <div className="group relative">
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 opacity-10 blur-lg md:rounded-2xl"></div>
                                <div className="relative rounded-xl border border-slate-200/50 bg-white p-4 shadow-sm md:rounded-2xl md:p-6">
                                    <div className="mb-4 flex items-center justify-between">
                                        <h3 className="text-sm font-bold tracking-wide text-slate-900 uppercase">
                                            Selected Order Details
                                        </h3>
                                        <div className="flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5">
                                            <Calendar className="h-3.5 w-3.5 text-blue-600" />
                                            <span className="text-xs font-semibold text-blue-700">
                                                {selectedOrder.created_at}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
                                        <div>
                                            <div className="mb-2 flex items-center justify-between">
                                                <span className="text-[10px] font-semibold tracking-wide text-slate-500 uppercase md:text-xs">
                                                    Order ID
                                                </span>
                                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 md:h-8 md:w-8">
                                                    <Package className="h-3.5 w-3.5 text-white md:h-4 md:w-4" />
                                                </div>
                                            </div>
                                            <div className="bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-lg font-bold text-transparent md:text-xl">
                                                #{selectedOrder.id}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="mb-2 flex items-center justify-between">
                                                <span className="text-[10px] font-semibold tracking-wide text-slate-500 uppercase md:text-xs">
                                                    Total
                                                </span>
                                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 md:h-8 md:w-8">
                                                    <DollarSign className="h-3.5 w-3.5 text-white md:h-4 md:w-4" />
                                                </div>
                                            </div>
                                            <div className="bg-gradient-to-br from-emerald-600 to-emerald-500 bg-clip-text text-lg font-bold text-transparent md:text-xl">
                                                LKR{' '}
                                                {selectedOrder.total_amount.toFixed(
                                                    2,
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="mb-2 flex items-center justify-between">
                                                <span className="text-[10px] font-semibold tracking-wide text-slate-500 uppercase md:text-xs">
                                                    Distributor
                                                </span>
                                            </div>
                                            <div className="truncate text-sm font-bold text-slate-900 md:text-base">
                                                {selectedOrder.distributor_name}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="mb-2 flex items-center justify-between">
                                                <span className="text-[10px] font-semibold tracking-wide text-slate-500 uppercase md:text-xs">
                                                    Status
                                                </span>
                                            </div>
                                            <div className="text-sm font-bold text-emerald-600 capitalize md:text-base">
                                                {selectedOrder.status}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Select Order */}
                        <div className="rounded-xl border border-slate-200/50 bg-white p-4 shadow-sm md:rounded-2xl md:p-6">
                            <label className="mb-3 block text-sm font-bold text-slate-900">
                                Select Order{' '}
                                <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={selectedOrderId}
                                onChange={(e) => {
                                    setSelectedOrderId(e.target.value);
                                    setComplaintProducts([]);
                                }}
                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm transition-all focus:border-transparent focus:ring-2 focus:ring-[#00447C] focus:outline-none"
                            >
                                <option value="">
                                    Choose an order to complain about
                                </option>
                                {orders.map((order) => (
                                    <option key={order.id} value={order.id}>
                                        Order #{order.id} - {order.created_at} -
                                        LKR {order.total_amount.toFixed(2)} (
                                        {order.distributor_name})
                                    </option>
                                ))}
                            </select>
                            {orders.length === 0 && (
                                <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
                                    <p className="text-sm text-amber-800">
                                        No completed orders available. You can
                                        only submit complaints for approved or
                                        completed orders.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Damaged Products */}
                        {selectedOrder && (
                            <>
                                <div className="rounded-xl border border-slate-200/50 bg-white p-4 shadow-sm md:rounded-2xl md:p-6">
                                    <div className="mb-4 flex items-center justify-between">
                                        <label className="block text-sm font-bold text-slate-900">
                                            Damaged Products{' '}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={addProduct}
                                            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#00447C] to-[#005a9e] px-4 py-2 text-sm font-semibold text-white transition-all hover:from-[#003366] hover:to-[#004a8c]"
                                        >
                                            <Plus className="h-4 w-4" />
                                            Add Product
                                        </button>
                                    </div>

                                    {complaintProducts.length === 0 && (
                                        <div className="rounded-lg border-2 border-dashed border-slate-300 py-8 text-center">
                                            <Package className="mx-auto mb-2 h-12 w-12 text-slate-400" />
                                            <p className="text-sm text-slate-500">
                                                No products added yet
                                            </p>
                                            <p className="mt-1 text-xs text-slate-400">
                                                Click "Add Product" to start
                                            </p>
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        {complaintProducts.map(
                                            (product, index) => (
                                                <div
                                                    key={product.id}
                                                    className="relative rounded-xl border border-slate-200 bg-slate-50 p-4"
                                                >
                                                    {/* Remove Button */}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeProduct(
                                                                product.id,
                                                            )
                                                        }
                                                        className="absolute top-3 right-3 rounded-lg bg-red-100 p-1.5 transition-colors hover:bg-red-200"
                                                    >
                                                        <X className="h-4 w-4 text-red-600" />
                                                    </button>

                                                    <div className="pr-8">
                                                        <div className="mb-3 flex items-center gap-2">
                                                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#00447C] to-[#005a9e]">
                                                                <span className="text-xs font-bold text-white">
                                                                    {index + 1}
                                                                </span>
                                                            </div>
                                                            <h4 className="text-sm font-bold text-slate-900">
                                                                Product #
                                                                {index + 1}
                                                            </h4>
                                                        </div>

                                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                                            {/* Product Selection */}
                                                            <div>
                                                                <label className="mb-2 block text-xs font-semibold text-slate-700">
                                                                    Product{' '}
                                                                    <span className="text-red-500">
                                                                        *
                                                                    </span>
                                                                </label>
                                                                <select
                                                                    value={
                                                                        product.product_id ||
                                                                        ''
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        updateProduct(
                                                                            product.id,
                                                                            'product_id',
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm transition-all focus:border-transparent focus:ring-2 focus:ring-[#00447C] focus:outline-none"
                                                                >
                                                                    <option value="">
                                                                        Select a
                                                                        product
                                                                    </option>
                                                                    {orderProducts
                                                                        .filter(
                                                                            (
                                                                                op,
                                                                            ) =>
                                                                                !complaintProducts.some(
                                                                                    (
                                                                                        cp,
                                                                                    ) =>
                                                                                        cp.product_id ===
                                                                                            op.product_id &&
                                                                                        cp.id !==
                                                                                            product.id,
                                                                                ),
                                                                        )
                                                                        .map(
                                                                            (
                                                                                op,
                                                                            ) => (
                                                                                <option
                                                                                    key={
                                                                                        op.product_id
                                                                                    }
                                                                                    value={
                                                                                        op.product_id
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        op.product_name
                                                                                    }{' '}
                                                                                    (Qty:{' '}
                                                                                    {
                                                                                        op.quantity
                                                                                    }
                                                                                    )
                                                                                </option>
                                                                            ),
                                                                        )}
                                                                </select>
                                                            </div>

                                                            {/* Quantity */}
                                                            <div>
                                                                <label className="mb-2 block text-xs font-semibold text-slate-700">
                                                                    Quantity{' '}
                                                                    <span className="text-red-500">
                                                                        *
                                                                    </span>
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    max={
                                                                        product.max_quantity ||
                                                                        999
                                                                    }
                                                                    value={
                                                                        product.quantity
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        updateProduct(
                                                                            product.id,
                                                                            'quantity',
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm transition-all focus:border-transparent focus:ring-2 focus:ring-[#00447C] focus:outline-none"
                                                                    placeholder="Qty"
                                                                />
                                                                {product.max_quantity >
                                                                    0 && (
                                                                    <p className="mt-1 text-[10px] text-slate-500">
                                                                        Max:{' '}
                                                                        {
                                                                            product.max_quantity
                                                                        }
                                                                    </p>
                                                                )}
                                                            </div>

                                                            {/* Proof Image */}
                                                            <div>
                                                                <label className="mb-2 block text-xs font-semibold text-slate-700">
                                                                    Proof Image{' '}
                                                                    <span className="text-red-500">
                                                                        *
                                                                    </span>
                                                                </label>
                                                                <div
                                                                    className="flex h-[78px] cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-slate-300 p-3 text-center transition-colors hover:border-[#00447C]"
                                                                    onClick={() =>
                                                                        fileInputRefs.current[
                                                                            product
                                                                                .id
                                                                        ]?.click()
                                                                    }
                                                                >
                                                                    <input
                                                                        ref={(
                                                                            el,
                                                                        ) => {
                                                                            fileInputRefs.current[
                                                                                product.id
                                                                            ] =
                                                                                el;
                                                                        }}
                                                                        type="file"
                                                                        accept="image/*"
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            handleImageChange(
                                                                                product.id,
                                                                                e,
                                                                            )
                                                                        }
                                                                        className="hidden"
                                                                    />
                                                                    {product.proof_image_preview ? (
                                                                        <img
                                                                            src={
                                                                                product.proof_image_preview
                                                                            }
                                                                            alt="Preview"
                                                                            className="mx-auto max-h-16 rounded object-contain"
                                                                        />
                                                                    ) : (
                                                                        <div>
                                                                            <Upload className="mx-auto h-5 w-5 text-slate-400" />
                                                                            <p className="mt-1 text-[10px] text-slate-500">
                                                                                Upload
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Description */}
                        <div className="rounded-xl border border-slate-200/50 bg-white p-4 shadow-sm md:rounded-2xl md:p-6">
                            <label className="mb-3 block text-sm font-bold text-slate-900">
                                Description of Damage{' '}
                                <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm transition-all focus:border-transparent focus:ring-2 focus:ring-[#00447C] focus:outline-none"
                                rows={5}
                                placeholder="Describe the damage in detail. What kind of damage did you observe? When did you discover it?..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                maxLength={1000}
                            />
                            <div className="mt-2 flex items-center justify-between">
                                <p className="text-xs text-slate-500">
                                    Be specific about the type and extent of
                                    damage
                                </p>
                                <p
                                    className={`text-xs font-medium ${description.length >= 900 ? 'text-amber-600' : 'text-slate-500'}`}
                                >
                                    {description.length}/1000
                                </p>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00447C] to-[#005a9e] px-6 py-4 text-base font-semibold text-white shadow-lg transition-all hover:from-[#003366] hover:to-[#004a8c] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Plus className="h-5 w-5" />
                            {isSubmitting
                                ? 'Submitting Complaint...'
                                : `Submit Complaint (${complaintProducts.length} product${complaintProducts.length !== 1 ? 's' : ''})`}
                        </button>
                    </form>
                </main>
            </div>
        </div>
    );
}
