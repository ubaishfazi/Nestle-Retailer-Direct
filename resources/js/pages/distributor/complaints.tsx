import { Head, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle,
    XCircle,
    Clock,
    Package,
    Eye,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

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
}

interface Props {
    complaints: Complaint[];
    stats: {
        total_complaints: number;
        pending_complaints: number;
        approved_complaints: number;
        rejected_complaints: number;
    };
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

function getStatusIcon(status: string) {
    switch (status) {
        case 'pending':
            return <Clock className="h-4 w-4" />;
        case 'approved':
            return <CheckCircle className="h-4 w-4" />;
        case 'rejected':
            return <XCircle className="h-4 w-4" />;
        default:
            return <AlertCircle className="h-4 w-4" />;
    }
}

export default function DistributorComplaints({ complaints, stats }: Props) {
    const { toast } = useToast();
    const { flash } = usePage().props;
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        if (flash?.success) {
            toast({
                title: 'Success',
                description: flash.success,
            });
        }
    }, [flash?.success]);

    const filteredComplaints =
        filter === 'all'
            ? complaints
            : complaints.filter((c) => c.status === filter);

    return (
        <div className="flex min-h-screen items-start justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 px-3 py-4 md:py-8">
            <Head title="Manage Complaints" />

            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-[#00447C]/5 blur-3xl md:h-96 md:w-96"></div>
                <div className="absolute right-1/4 bottom-0 h-64 w-64 rounded-full bg-blue-400/5 blur-3xl md:h-80 md:w-80"></div>
            </div>

            <div className="relative mx-auto w-full max-w-6xl">
                {/* Header */}
                <header className="relative rounded-t-2xl border border-slate-200/50 bg-white/80 backdrop-blur-xl">
                    <div className="px-4 py-4 md:px-6">
                        <div className="flex items-center justify-between">
                            <a
                                href="/distributor/home"
                                className="flex items-center gap-2 text-slate-600 transition-colors hover:text-[#00447C]"
                            >
                                <svg
                                    className="h-4 w-4 rotate-180"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>
                                <span className="text-sm font-medium">
                                    Back to Home
                                </span>
                            </a>
                        </div>
                        <div className="mt-3">
                            <h1 className="text-lg font-bold tracking-tight text-slate-900 md:text-xl">
                                Complaint Management
                            </h1>
                            <p className="text-xs font-medium text-slate-500">
                                Review and resolve retailer complaints
                            </p>
                        </div>
                    </div>
                </header>

                {/* Stats Cards */}
                <div className="my-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
                    <div className="group relative">
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 opacity-20 blur-lg transition-opacity group-hover:opacity-30 md:rounded-2xl"></div>
                        <div className="relative rounded-xl border border-slate-200/50 bg-white p-3 shadow-sm transition-shadow hover:shadow-md md:rounded-2xl md:p-5">
                            <div className="mb-2 flex items-center justify-between md:mb-3">
                                <span className="text-[10px] font-semibold tracking-wide text-slate-500 uppercase md:text-xs">
                                    Total
                                </span>
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 md:h-9 md:w-9">
                                    <AlertCircle className="h-3.5 w-3.5 text-white md:h-4 md:w-4" />
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-2xl font-bold text-transparent md:text-3xl">
                                {stats.total_complaints}
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
                            <div className="bg-gradient-to-br from-amber-600 to-amber-500 bg-clip-text text-2xl font-bold text-transparent md:text-3xl">
                                {stats.pending_complaints}
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
                            <div className="bg-gradient-to-br from-emerald-600 to-emerald-500 bg-clip-text text-2xl font-bold text-transparent md:text-3xl">
                                {stats.approved_complaints}
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
                            <div className="bg-gradient-to-br from-red-600 to-red-500 bg-clip-text text-2xl font-bold text-transparent md:text-3xl">
                                {stats.rejected_complaints}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="mb-6 rounded-xl border border-slate-200/50 bg-white/60 p-2 backdrop-blur-sm">
                    <div className="flex gap-2">
                        {['all', 'pending', 'approved', 'rejected'].map(
                            (status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilter(status)}
                                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                                        filter === status
                                            ? 'bg-[#00447C] text-white'
                                            : 'bg-white text-slate-700 hover:bg-slate-100'
                                    }`}
                                >
                                    {status.charAt(0).toUpperCase() +
                                        status.slice(1)}
                                </button>
                            ),
                        )}
                    </div>
                </div>

                {/* Complaints List */}
                <div className="space-y-4">
                    {filteredComplaints.length === 0 ? (
                        <div className="rounded-xl border border-slate-200/50 bg-white/60 p-12 text-center backdrop-blur-sm">
                            <AlertCircle className="mx-auto mb-4 h-16 w-16 text-slate-400" />
                            <h3 className="mb-2 text-lg font-semibold text-slate-900">
                                No Complaints Found
                            </h3>
                            <p className="text-sm text-slate-500">
                                {filter === 'all'
                                    ? 'No complaints have been submitted yet.'
                                    : `No ${filter} complaints found.`}
                            </p>
                        </div>
                    ) : (
                        filteredComplaints.map((complaint) => (
                            <div
                                key={complaint.id}
                                className="rounded-xl border border-slate-200/50 bg-white/60 p-4 backdrop-blur-sm transition-shadow hover:shadow-md md:p-6"
                            >
                                <div className="flex flex-col gap-4 md:flex-row md:items-start">
                                    <div className="flex flex-shrink-0 flex-wrap gap-2 md:flex-col">
                                        {complaint.items
                                            .slice(0, 3)
                                            .map((item, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border-2 border-white bg-slate-100 shadow-sm md:h-20 md:w-20"
                                                >
                                                    {item.product_image ? (
                                                        <img
                                                            src={
                                                                item.product_image
                                                            }
                                                            alt={
                                                                item.product_name
                                                            }
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <Package className="h-8 w-8 text-slate-400" />
                                                    )}
                                                </div>
                                            ))}
                                        {complaint.items.length > 3 && (
                                            <div className="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-white bg-slate-200 shadow-sm md:h-20 md:w-20">
                                                <span className="text-xs font-bold text-slate-600">
                                                    +
                                                    {complaint.items.length - 3}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="mb-2 flex items-start justify-between gap-2">
                                            <div>
                                                <h3 className="mb-1 text-base font-semibold text-slate-900">
                                                    {complaint.product_name}
                                                </h3>
                                                <p className="text-xs text-slate-500">
                                                    Complaint ID:{' '}
                                                    <span className="font-mono font-semibold">
                                                        {complaint.complaint_id}
                                                    </span>
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    Retailer:{' '}
                                                    {complaint.retailer_name} (
                                                    {complaint.retailer_email})
                                                </p>
                                            </div>
                                            <Badge
                                                className={`flex items-center gap-1 px-3 py-1 ${getStatusBadge(complaint.status)}`}
                                            >
                                                {getStatusIcon(
                                                    complaint.status,
                                                )}
                                                <span className="text-xs font-medium capitalize">
                                                    {complaint.status}
                                                </span>
                                            </Badge>
                                        </div>

                                        <div className="mb-3 grid grid-cols-2 gap-3 text-xs md:grid-cols-4">
                                            <div>
                                                <p className="mb-1 text-slate-500">
                                                    Quantity
                                                </p>
                                                <p className="font-semibold text-slate-900">
                                                    {complaint.quantity} units
                                                </p>
                                            </div>
                                            <div>
                                                <p className="mb-1 text-slate-500">
                                                    Submitted
                                                </p>
                                                <p className="font-semibold text-slate-900">
                                                    {complaint.created_at}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="mb-1 text-slate-500">
                                                    Resolved
                                                </p>
                                                <p className="font-semibold text-slate-900">
                                                    {complaint.resolved_at ||
                                                        'Pending'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="mb-1 text-slate-500">
                                                    Order #
                                                </p>
                                                <p className="font-semibold text-slate-900">
                                                    {complaint.order_id}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mb-3 rounded-lg bg-slate-50 p-3">
                                            <p className="mb-1 text-xs font-medium text-slate-700">
                                                Description:
                                            </p>
                                            <p className="text-sm text-slate-600">
                                                {complaint.description}
                                            </p>
                                        </div>

                                        {complaint.distributor_response && (
                                            <div
                                                className={`rounded-lg p-3 ${
                                                    complaint.status ===
                                                    'approved'
                                                        ? 'border border-emerald-200 bg-emerald-50'
                                                        : 'border border-red-200 bg-red-50'
                                                }`}
                                            >
                                                <p
                                                    className={`mb-1 text-xs font-medium ${
                                                        complaint.status ===
                                                        'approved'
                                                            ? 'text-emerald-700'
                                                            : 'text-red-700'
                                                    }`}
                                                >
                                                    Distributor Response:
                                                </p>
                                                <p
                                                    className={`text-sm ${
                                                        complaint.status ===
                                                        'approved'
                                                            ? 'text-emerald-600'
                                                            : 'text-red-600'
                                                    }`}
                                                >
                                                    {
                                                        complaint.distributor_response
                                                    }
                                                </p>
                                            </div>
                                        )}

                                        {complaint.status === 'pending' && (
                                            <a
                                                href={`/distributor/complaints/${complaint.id}`}
                                                className="mt-2 inline-flex items-center gap-2 rounded-lg bg-[#00447C] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#003366]"
                                            >
                                                <Eye className="h-4 w-4" />
                                                <span>Review Complaint</span>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
