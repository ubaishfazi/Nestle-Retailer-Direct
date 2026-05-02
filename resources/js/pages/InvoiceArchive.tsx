import { Head, usePage } from '@inertiajs/react';
import {
    Package,
    Calendar,
    ChevronRight,
    Download,
    Eye,
    ChevronDown,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface OrderItem {
    product_name: string;
    quantity: number;
}

interface Invoice {
    id: number;
    invoice_number: string;
    order_id: number;
    invoice_date: string;
    total_amount: number;
    discount_amount: number;
    status: string;
    distributor_name: string;
    items: OrderItem[];
}

interface Props {
    invoices: Invoice[];
    stats: {
        total_invoices: number;
        total_spent: number;
    };
}

export default function InvoiceArchive({ invoices, stats }: Props) {
    const { toast } = useToast();
    const { flash } = usePage<{ flash?: { success?: string } }>().props;
    const [expandedInvoiceId, setExpandedInvoiceId] = useState<number | null>(
        null,
    );

    // Show success toast if there's a flash message
    useEffect(() => {
        if (flash?.success) {
            toast({
                title: 'Success',
                description: flash.success,
            });
        }
    }, [flash?.success, toast]);

    const downloadInvoice = (invoiceNumber: string) => {
        window.open(`/invoices/${invoiceNumber}/download`, '_blank');
    };

    const viewInvoice = (invoiceNumber: string) => {
        window.open(`/invoices/${invoiceNumber}/view`, '_blank');
    };

    const toggleExpanded = (invoiceId: number) => {
        setExpandedInvoiceId((prev) => (prev === invoiceId ? null : invoiceId));
    };

    return (
        <div className="flex min-h-screen items-start justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 px-3 py-4 md:py-8">
            <Head title="Digital Invoice Archive" />

            {/* Decorative Background Elements */}
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
                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                            <div className="flex items-center gap-3">
                                <a
                                    href="/"
                                    className="flex items-center gap-2 text-slate-600 transition-colors hover:text-[#00447C]"
                                >
                                    <ChevronRight className="h-4 w-4 rotate-180" />
                                    <span className="text-sm font-medium">
                                        Back to Home
                                    </span>
                                </a>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5">
                                    <Package className="h-3.5 w-3.5 text-blue-600" />
                                    <span className="text-sm font-semibold whitespace-nowrap text-blue-700">
                                        {stats.total_invoices} Invoices
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-3">
                            <h1 className="text-lg font-bold tracking-tight text-slate-900 md:text-xl">
                                Digital Invoice Archive
                            </h1>
                            <p className="text-xs font-medium text-slate-500">
                                All your order invoices in one place
                            </p>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="relative border-x border-slate-200/50 bg-white/60 px-4 py-6 pb-48 backdrop-blur-sm md:px-6 md:py-8 md:pb-40">
                    {/* Stats Cards */}
                    <div className="mb-6 grid grid-cols-2 gap-3 md:mb-8 md:gap-4">
                        <div className="group relative">
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 opacity-20 blur-lg transition-opacity group-hover:opacity-30 md:rounded-2xl"></div>
                            <div className="relative rounded-xl border border-slate-200/50 bg-white p-3 shadow-sm transition-shadow hover:shadow-md md:rounded-2xl md:p-5">
                                <div className="mb-2 flex items-center justify-between md:mb-3">
                                    <span className="text-[10px] font-semibold tracking-wide text-slate-500 uppercase md:text-xs">
                                        Total Invoices
                                    </span>
                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 md:h-9 md:w-9">
                                        <Package className="h-3.5 w-3.5 text-white md:h-4 md:w-4" />
                                    </div>
                                </div>
                                <div className="bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-2xl font-bold text-transparent md:text-3xl">
                                    {stats.total_invoices}
                                </div>
                            </div>
                        </div>

                        <div className="group relative">
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 opacity-20 blur-lg transition-opacity group-hover:opacity-30 md:rounded-2xl"></div>
                            <div className="relative rounded-xl border border-slate-200/50 bg-white p-3 shadow-sm transition-shadow hover:shadow-md md:rounded-2xl md:p-5">
                                <div className="mb-2 flex items-center justify-between md:mb-3">
                                    <span className="text-[10px] font-semibold tracking-wide text-slate-500 uppercase md:text-xs">
                                        Total Invoice Value
                                    </span>
                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 md:h-9 md:w-9">
                                        <Package className="h-3.5 w-3.5 text-white md:h-4 md:w-4" />
                                    </div>
                                </div>
                                <div className="bg-gradient-to-br from-amber-600 to-amber-500 bg-clip-text text-2xl font-bold text-transparent md:text-3xl">
                                    LKR {stats.total_spent.toFixed(2)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Invoices List */}
                    {invoices.length > 0 ? (
                        <div className="space-y-4">
                            {invoices.map((invoice, index) => (
                                <InvoiceCard
                                    key={invoice.id}
                                    invoice={invoice}
                                    index={index}
                                    onDownload={downloadInvoice}
                                    onView={viewInvoice}
                                    isExpanded={
                                        expandedInvoiceId === invoice.id
                                    }
                                    onToggleExpanded={() =>
                                        toggleExpanded(invoice.id)
                                    }
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="relative overflow-hidden rounded-2xl border border-slate-200/50 bg-white shadow-sm">
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 to-transparent"></div>
                            <div className="relative flex flex-col items-center justify-center px-6 py-12 text-center">
                                <div className="relative mb-4">
                                    <div className="absolute inset-0 rounded-full bg-blue-400/20 blur-xl"></div>
                                    <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200">
                                        <Package className="h-8 w-8 text-blue-400" />
                                    </div>
                                </div>
                                <h3 className="mb-2 text-lg font-semibold text-slate-900">
                                    No invoices found
                                </h3>
                                <p className="text-sm text-slate-500">
                                    Your invoices will appear here after order
                                    approval
                                </p>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

// Invoice Card Component
function InvoiceCard({
    invoice,
    index,
    onDownload,
    onView,
    isExpanded,
    onToggleExpanded,
}: {
    invoice: Invoice;
    index: number;
    onDownload: (invoiceNumber: string) => void;
    onView: (invoiceNumber: string) => void;
    isExpanded: boolean;
    onToggleExpanded: () => void;
}) {
    return (
        <div className="group" style={{ animationDelay: `${index * 100}ms` }}>
            <div className="relative overflow-hidden rounded-2xl border border-blue-200/50 bg-white shadow-sm transition-all duration-300 hover:shadow-lg">
                {/* Top accent bar */}
                <div className="h-1 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600"></div>

                <div className="p-4 md:p-5">
                    {/* Clickable Header */}
                    <div
                        className="mb-3 flex cursor-pointer flex-col gap-3 sm:flex-row sm:items-start sm:justify-between md:mb-4"
                        onClick={onToggleExpanded}
                    >
                        <div className="flex flex-1 items-center gap-3 md:gap-4">
                            <div className="relative flex-shrink-0">
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 opacity-50 blur-md"></div>
                                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 text-base font-bold text-white shadow-lg md:h-12 md:w-12 md:text-lg">
                                    {invoice.invoice_number.substring(0, 3)}
                                </div>
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="truncate text-sm font-bold text-slate-900 md:text-base">
                                    {invoice.invoice_number}
                                </div>
                                <div className="truncate text-xs font-medium text-slate-600">
                                    Order #{invoice.order_id}
                                </div>
                                <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                                    <Calendar className="h-3 w-3" />
                                    {invoice.invoice_date}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <ChevronDown
                                className={`h-5 w-5 text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                            />
                        </div>
                    </div>

                    {/* Expandable Details and Actions */}
                    <div
                        className={`overflow-hidden transition-all duration-500 ease-in-out ${
                            isExpanded
                                ? 'max-h-96 opacity-100'
                                : 'max-h-0 opacity-0'
                        }`}
                    >
                        <div className="pt-0">
                            <div className="mb-3 rounded-xl border border-slate-200/50 bg-gradient-to-br from-slate-50 to-slate-100/50 p-3 md:mb-4 md:p-4">
                                <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-700">
                                    <Package className="h-3.5 w-3.5" />
                                    Details
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <span className="text-xs text-slate-500">
                                            Distributor
                                        </span>
                                        <div className="text-sm font-medium text-slate-900">
                                            {invoice.distributor_name}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-500">
                                            Items
                                        </span>
                                        <div className="mt-1 space-y-1">
                                            {invoice.items &&
                                            invoice.items.length > 0 ? (
                                                invoice.items.map(
                                                    (item, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="flex justify-between text-sm"
                                                        >
                                                            <span className="text-slate-700">
                                                                {
                                                                    item.product_name
                                                                }
                                                            </span>
                                                            <span className="font-medium text-slate-900">
                                                                x{item.quantity}
                                                            </span>
                                                        </div>
                                                    ),
                                                )
                                            ) : (
                                                <p className="text-xs text-slate-500">
                                                    No items
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-500">
                                            Total Amount
                                        </span>
                                        <div className="text-sm font-bold text-slate-900">
                                            LKR{' '}
                                            {invoice.total_amount.toFixed(2)}
                                        </div>
                                    </div>
                                    {invoice.discount_amount > 0 && (
                                        <div>
                                            <span className="text-xs text-emerald-600">
                                                Discount
                                            </span>
                                            <div className="text-sm font-medium text-emerald-600">
                                                - LKR{' '}
                                                {invoice.discount_amount.toFixed(
                                                    2,
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onView(invoice.invoice_number);
                                    }}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100"
                                >
                                    <Eye className="h-4 w-4" />
                                    View
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDownload(invoice.invoice_number);
                                    }}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                                >
                                    <Download className="h-4 w-4" />
                                    Download
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
