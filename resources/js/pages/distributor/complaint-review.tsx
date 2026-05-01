import { Head, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import {
    ArrowLeft,
    Package,
    Calendar,
    User,
    Mail,
    AlertCircle,
    CheckCircle,
    XCircle,
    Clock,
    ImageOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface OrderItem {
    product_name: string;
    product_image: string | null;
    quantity: number;
    price: number;
}

interface Order {
    id: number;
    status: string;
    total_amount: number;
    created_at: string;
    items: OrderItem[];
}

interface ComplaintItem {
    id: number;
    product_id: number | null;
    product_name: string;
    product_image: string | null;
    quantity: number;
    proof_image_path: string | null;
}

interface Complaint {
    id: number;
    complaint_id: string;
    status: string;
    items: ComplaintItem[];
    product_name: string;
    quantity: number;
    description: string;
    distributor_response: string | null;
    created_at: string;
    resolved_at: string | null;
    retailer_name: string;
    retailer_email: string;
    order_id: number;
    order: Order | null;
}

interface Props {
    complaint: Complaint;
}

function getStatusBadge(status: string): string {
    switch (status) {
        case 'pending':
            return 'bg-amber-100 text-amber-800 border-amber-300';
        case 'approved':
            return 'bg-emerald-100 text-emerald-800 border-emerald-300';
        case 'rejected':
            return 'bg-red-100 text-red-800 border-red-300';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-300';
    }
}

export default function DistributorComplaintReview({ complaint }: Props) {
    const { toast } = useToast();
    const { flash } = usePage().props;
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [approveResponse, setApproveResponse] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (flash?.success) {
            toast({
                title: 'Success',
                description: flash.success,
            });
        }
    }, [flash?.success]);

    const handleApprove = () => {
        setIsSubmitting(true);
        router.post(
            `/distributor/complaints/${complaint.id}/approve`,
            {
                response: approveResponse,
            },
            {
                onFinish: () => {
                    setIsSubmitting(false);
                    setShowApproveModal(false);
                },
            },
        );
    };

    const handleReject = () => {
        if (!rejectReason.trim()) {
            toast({
                title: 'Validation Error',
                description: 'Please provide a reason for rejection.',
                variant: 'destructive',
            });
            return;
        }

        setIsSubmitting(true);
        router.post(
            `/distributor/complaints/${complaint.id}/reject`,
            {
                reason: rejectReason,
            },
            {
                onFinish: () => {
                    setIsSubmitting(false);
                    setShowRejectModal(false);
                },
            },
        );
    };

    const handleMarkPending = () => {
        if (
            confirm('Are you sure you want to mark this complaint as pending?')
        ) {
            router.post(
                `/distributor/complaints/${complaint.id}/mark-pending`,
                {
                    onFinish: () => {
                        toast({
                            title: 'Success',
                            description: 'Complaint marked as pending.',
                        });
                    },
                },
            );
        }
    };

    return (
        <div className="flex min-h-screen items-start justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 px-3 py-4 md:py-8">
            <Head title={`Review Complaint - ${complaint.complaint_id}`} />

            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-[#00447C]/5 blur-3xl md:h-96 md:w-96"></div>
                <div className="absolute right-1/4 bottom-0 h-64 w-64 rounded-full bg-blue-400/5 blur-3xl md:h-80 md:w-80"></div>
            </div>

            <div className="relative mx-auto w-full max-w-4xl">
                {/* Header */}
                <header className="relative rounded-t-2xl border border-slate-200/50 bg-white/80 backdrop-blur-xl">
                    <div className="px-4 py-4 md:px-6">
                        <div className="flex items-center justify-between">
                            <a
                                href="/distributor/complaints"
                                className="flex items-center gap-2 text-slate-600 transition-colors hover:text-[#00447C]"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                <span className="text-sm font-medium">
                                    Back to Complaints
                                </span>
                            </a>
                            <Badge
                                className={`flex items-center gap-2 px-4 py-2 text-sm ${getStatusBadge(complaint.status)}`}
                            >
                                {complaint.status === 'pending' && (
                                    <Clock className="h-4 w-4" />
                                )}
                                {complaint.status === 'approved' && (
                                    <CheckCircle className="h-4 w-4" />
                                )}
                                {complaint.status === 'rejected' && (
                                    <XCircle className="h-4 w-4" />
                                )}
                                <span className="font-semibold capitalize">
                                    {complaint.status}
                                </span>
                            </Badge>
                        </div>
                        <div className="mt-3">
                            <h1 className="text-lg font-bold tracking-tight text-slate-900 md:text-xl">
                                Complaint Review
                            </h1>
                            <p className="text-xs font-medium text-slate-500">
                                Complaint ID:{' '}
                                <span className="font-mono font-semibold">
                                    {complaint.complaint_id}
                                </span>
                            </p>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="space-y-6 rounded-b-2xl border border-slate-200/50 bg-white/60 p-4 backdrop-blur-sm md:p-8">
                    {/* Retailer Information */}
                    <div className="rounded-xl border border-slate-200/50 bg-white p-6">
                        <h2 className="mb-4 text-lg font-bold text-slate-900">
                            Retailer Information
                        </h2>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                                    <User className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">
                                        Name
                                    </p>
                                    <p className="font-semibold text-slate-900">
                                        {complaint.retailer_name}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                                    <Mail className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">
                                        Email
                                    </p>
                                    <p className="font-semibold text-slate-900">
                                        {complaint.retailer_email}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Details */}
                    <div className="rounded-xl border border-slate-200/50 bg-white p-6">
                        <h2 className="mb-4 text-lg font-bold text-slate-900">
                            Damaged Products ({complaint.items.length})
                        </h2>
                        <div className="space-y-4">
                            {complaint.items.map((item, idx) => (
                                <div
                                    key={item.id}
                                    className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                                >
                                    <div className="flex flex-col gap-4 md:flex-row md:items-start">
                                        <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white">
                                            {item.product_image ? (
                                                <img
                                                    src={item.product_image}
                                                    alt={item.product_name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <Package className="h-10 w-10 text-slate-400" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div>
                                                <p className="text-xs text-slate-500">
                                                    Product Name
                                                </p>
                                                <p className="text-base font-bold text-slate-900">
                                                    {item.product_name}
                                                </p>
                                            </div>
                                            <div className="mt-2">
                                                <p className="text-xs text-slate-500">
                                                    Quantity Affected
                                                </p>
                                                <p className="text-base font-bold text-slate-900">
                                                    {item.quantity} units
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    {item.proof_image_path ? (
                                        <div className="mt-3 border-t border-slate-200 pt-3">
                                            <p className="mb-2 text-xs font-semibold text-slate-700">
                                                Proof Image:
                                            </p>
                                            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                                                <img
                                                    src={item.proof_image_path}
                                                    alt={`Proof for ${item.product_name}`}
                                                    className="h-auto max-h-64 w-full object-contain"
                                                    onError={(e) => {
                                                        const target =
                                                            e.currentTarget;
                                                        target.style.display =
                                                            'none';
                                                        const parent =
                                                            target.parentElement;
                                                        if (parent) {
                                                            parent.innerHTML = `
                                                                <div class="flex flex-col items-center justify-center p-8 text-slate-400">
                                                                    <svg class="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                                                    </svg>
                                                                    <p class="text-sm">Unable to load image</p>
                                                                    <p class="text-xs mt-1">Path: ${item.proof_image_path}</p>
                                                                </div>
                                                            `;
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mt-3 border-t border-slate-200 pt-3">
                                            <p className="mb-2 text-xs font-semibold text-slate-700">
                                                Proof Image:
                                            </p>
                                            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 p-6">
                                                <svg
                                                    class="mb-2 h-10 w-10 text-slate-300"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        stroke-linecap="round"
                                                        stroke-linejoin="round"
                                                        stroke-width="2"
                                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                    ></path>
                                                </svg>
                                                <p className="text-xs text-slate-500">
                                                    No proof image uploaded for
                                                    this product
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Damage Description */}
                    <div className="rounded-xl border border-slate-200/50 bg-white p-6">
                        <h2 className="mb-4 text-lg font-bold text-slate-900">
                            Damage Description
                        </h2>
                        <div className="rounded-lg bg-slate-50 p-4">
                            <p className="text-sm whitespace-pre-wrap text-slate-700">
                                {complaint.description}
                            </p>
                        </div>
                    </div>

                    {/* Order Details */}
                    {complaint.order && (
                        <div className="rounded-xl border border-slate-200/50 bg-white p-6">
                            <h2 className="mb-4 text-lg font-bold text-slate-900">
                                Original Order Details
                            </h2>
                            <div className="space-y-3 rounded-lg bg-slate-50 p-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">
                                        Order #
                                    </span>
                                    <span className="font-semibold text-slate-900">
                                        {complaint.order.id}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">
                                        Order Date
                                    </span>
                                    <span className="font-semibold text-slate-900">
                                        {complaint.order.created_at}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">
                                        Total Amount
                                    </span>
                                    <span className="font-semibold text-slate-900">
                                        LKR{' '}
                                        {complaint.order.total_amount.toFixed(
                                            2,
                                        )}
                                    </span>
                                </div>
                                <div className="border-t border-slate-200 pt-3">
                                    <p className="mb-2 text-xs font-semibold text-slate-700">
                                        Order Items:
                                    </p>
                                    <div className="space-y-2">
                                        {complaint.order.items.map(
                                            (item, index) => (
                                                <div
                                                    key={index}
                                                    className="flex justify-between text-sm"
                                                >
                                                    <span className="text-slate-600">
                                                        {item.product_name} x
                                                        {item.quantity}
                                                    </span>
                                                    <span className="font-semibold text-slate-900">
                                                        LKR{' '}
                                                        {(
                                                            item.price *
                                                            item.quantity
                                                        ).toFixed(2)}
                                                    </span>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Distributor Response (if already resolved) */}
                    {complaint.distributor_response && (
                        <div
                            className={`rounded-xl border-2 p-6 ${
                                complaint.status === 'approved'
                                    ? 'border-emerald-200 bg-emerald-50'
                                    : 'border-red-200 bg-red-50'
                            }`}
                        >
                            <h2
                                className={`mb-4 text-lg font-bold ${
                                    complaint.status === 'approved'
                                        ? 'text-emerald-900'
                                        : 'text-red-900'
                                }`}
                            >
                                {complaint.status === 'approved'
                                    ? '✓ Approved'
                                    : '✗ Rejected'}
                            </h2>
                            <div
                                className={`rounded-lg p-4 ${
                                    complaint.status === 'approved'
                                        ? 'bg-emerald-100'
                                        : 'bg-red-100'
                                }`}
                            >
                                <p
                                    className={`mb-2 text-sm font-medium ${
                                        complaint.status === 'approved'
                                            ? 'text-emerald-700'
                                            : 'text-red-700'
                                    }`}
                                >
                                    Response:
                                </p>
                                <p
                                    className={`text-sm ${
                                        complaint.status === 'approved'
                                            ? 'text-emerald-600'
                                            : 'text-red-600'
                                    }`}
                                >
                                    {complaint.distributor_response}
                                </p>
                            </div>
                            {complaint.resolved_at && (
                                <p className="mt-4 text-xs text-slate-500">
                                    Resolved on: {complaint.resolved_at}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Action Buttons */}
                    {complaint.status === 'pending' && (
                        <div className="rounded-xl border border-slate-200/50 bg-white p-6">
                            <h2 className="mb-4 text-lg font-bold text-slate-900">
                                Take Action
                            </h2>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <Button
                                    onClick={() => setShowApproveModal(true)}
                                    className="bg-emerald-600 py-6 font-semibold text-white hover:bg-emerald-700"
                                >
                                    <CheckCircle className="mr-2 h-5 w-5" />
                                    Approve Complaint
                                </Button>
                                <Button
                                    onClick={() => setShowRejectModal(true)}
                                    className="bg-red-600 py-6 font-semibold text-white hover:bg-red-700"
                                >
                                    <XCircle className="mr-2 h-5 w-5" />
                                    Reject Complaint
                                </Button>
                                <Button
                                    onClick={handleMarkPending}
                                    variant="outline"
                                    className="py-6 font-semibold"
                                >
                                    <Clock className="mr-2 h-5 w-5" />
                                    Keep Pending
                                </Button>
                            </div>
                            <p className="mt-4 text-xs text-slate-500">
                                <AlertCircle className="mr-1 inline h-4 w-4" />
                                Approving will initiate replacement process.
                                Requiring requires a reason.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Approve Modal */}
            {showApproveModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-xl bg-white p-6">
                        <h3 className="mb-4 text-lg font-bold text-slate-900">
                            Approve Complaint
                        </h3>
                        <p className="mb-4 text-sm text-slate-600">
                            This will initiate the replacement process for{' '}
                            {complaint.quantity} units of{' '}
                            {complaint.product_name}.
                        </p>
                        <div className="mb-4">
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Response (optional)
                            </label>
                            <textarea
                                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                placeholder="Add any notes about the replacement..."
                                value={approveResponse}
                                onChange={(e) =>
                                    setApproveResponse(e.target.value)
                                }
                                maxLength={1000}
                            />
                        </div>
                        <div className="flex gap-3">
                            <Button
                                onClick={handleApprove}
                                disabled={isSubmitting}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                            >
                                {isSubmitting
                                    ? 'Processing...'
                                    : 'Confirm Approval'}
                            </Button>
                            <Button
                                onClick={() => setShowApproveModal(false)}
                                variant="outline"
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-xl bg-white p-6">
                        <h3 className="mb-4 text-lg font-bold text-slate-900">
                            Reject Complaint
                        </h3>
                        <p className="mb-4 text-sm text-slate-600">
                            Please provide a reason for rejecting this
                            complaint.
                        </p>
                        <div className="mb-4">
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Rejection Reason *
                            </label>
                            <textarea
                                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                placeholder="Explain why this complaint is being rejected..."
                                value={rejectReason}
                                onChange={(e) =>
                                    setRejectReason(e.target.value)
                                }
                                maxLength={1000}
                                required
                            />
                        </div>
                        <div className="flex gap-3">
                            <Button
                                onClick={handleReject}
                                disabled={isSubmitting}
                                className="flex-1 bg-red-600 hover:bg-red-700"
                            >
                                {isSubmitting
                                    ? 'Processing...'
                                    : 'Confirm Rejection'}
                            </Button>
                            <Button
                                onClick={() => setShowRejectModal(false)}
                                variant="outline"
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
