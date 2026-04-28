import { Head, usePage } from '@inertiajs/react';
import { Package, Calendar, DollarSign, ChevronRight, Download, Eye, CheckCircle, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
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
    payment_status: string;
    status: string;
    distributor_name: string;
    items: OrderItem[];
}

function getPaymentStatusBadgeClass(status: string): string {
    switch (status) {
        case 'paid':
            return 'bg-emerald-500 text-white';
        case 'pending':
            return 'bg-amber-500 text-white';
        case 'refunded':
            return 'bg-blue-500 text-white';
        case 'failed':
            return 'bg-red-500 text-white';
        default:
            return 'bg-gray-500 text-white';
    }
}

export default function InvoiceArchive({ invoices, stats }: Props) {
    const { toast } = useToast();
    const { flash } = usePage<{ flash?: { success?: string } }>().props;
    const [filter, setFilter] = useState('all');
    const [expandedInvoiceId, setExpandedInvoiceId] = useState<number | null>(null);

    // Show success toast if there's a flash message
    useEffect(() => {
        if (flash?.success) {
            toast({
                title: 'Success',
                description: flash.success,
            });
        }
    }, [flash?.success, toast]);

    const filteredInvoices = filter === 'all' ? invoices : invoices.filter(i => i.payment_status === filter);

    const downloadInvoice = (invoiceNumber: string) => {
        window.open(`/invoices/${invoiceNumber}/download`, '_blank');
    };

    const viewInvoice = (invoiceNumber: string) => {
        window.open(`/invoices/${invoiceNumber}/view`, '_blank');
    };

    const toggleExpanded = (invoiceId: number) => {
        setExpandedInvoiceId(prev => prev === invoiceId ? null : invoiceId);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex items-start justify-center py-4 px-3 md:py-8">
            <Head title="Digital Invoice Archive" />

            {/* Decorative Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-[#00447C]/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-1/4 w-64 h-64 md:w-80 md:h-80 bg-blue-400/5 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] md:w-[800px] md:h-[800px] bg-gradient-to-br from-[#00447C]/3 via-transparent to-transparent rounded-full blur-3xl"></div>
            </div>

            {/* Main Container */}
            <div className="relative w-full max-w-5xl mx-auto">
                {/* Header */}
                <header className="relative bg-white/80 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-50 rounded-t-2xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#00447C]/5 via-transparent to-[#00447C]/5"></div>
                    <div className="relative px-4 md:px-6 py-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <a href="/" className="flex items-center gap-2 text-slate-600 hover:text-[#00447C] transition-colors">
                                    <ChevronRight className="h-4 w-4 rotate-180" />
                                    <span className="text-sm font-medium">Back to Home</span>
                                </a>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200">
                                    <Package className="h-3.5 w-3.5 text-blue-600" />
                                    <span className="text-sm font-semibold text-blue-700 whitespace-nowrap">{stats.total_invoices} Invoices</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-3">
                            <h1 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">Digital Invoice Archive</h1>
                            <p className="text-xs text-slate-500 font-medium">All your order invoices in one place</p>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="relative bg-white/60 backdrop-blur-sm border-x border-slate-200/50 px-4 md:px-6 py-6 md:py-8 pb-48 md:pb-40">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
                        <div className="group relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl md:rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity"></div>
                            <div className="relative bg-white rounded-xl md:rounded-2xl p-3 md:p-5 border border-slate-200/50 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-2 md:mb-3">
                                    <span className="text-[10px] md:text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Invoices</span>
                                    <div className="w-7 h-7 md:w-9 md:h-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                        <Package className="h-3.5 w-3.5 md:h-4 md:w-4 text-white" />
                                    </div>
                                </div>
                                <div className="text-2xl md:text-3xl font-bold bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-transparent">{stats.total_invoices}</div>
                            </div>
                        </div>

                        <div className="group relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl md:rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity"></div>
                            <div className="relative bg-white rounded-xl md:rounded-2xl p-3 md:p-5 border border-slate-200/50 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-2 md:mb-3">
                                    <span className="text-[10px] md:text-xs font-semibold text-slate-500 uppercase tracking-wide">Paid</span>
                                    <div className="w-7 h-7 md:w-9 md:h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                                        <CheckCircle className="h-3.5 w-3.5 md:h-4 md:w-4 text-white" />
                                    </div>
                                </div>
                                <div className="text-2xl md:text-3xl font-bold bg-gradient-to-br from-emerald-600 to-emerald-500 bg-clip-text text-transparent">{stats.paid_invoices}</div>
                            </div>
                        </div>

                        <div className="group relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl md:rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity"></div>
                            <div className="relative bg-white rounded-xl md:rounded-2xl p-3 md:p-5 border border-slate-200/50 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-2 md:mb-3">
                                    <span className="text-[10px] md:text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Spent</span>
                                    <div className="w-7 h-7 md:w-9 md:h-9 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                                        <DollarSign className="h-3.5 w-3.5 md:h-4 md:w-4 text-white" />
                                    </div>
                                </div>
                                <div className="text-2xl md:text-3xl font-bold bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-transparent">LKR {stats.total_spent.toFixed(2)}</div>
                            </div>
                        </div>

                        <div className="group relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl md:rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity"></div>
                            <div className="relative bg-white rounded-xl md:rounded-2xl p-3 md:p-5 border border-slate-200/50 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-2 md:mb-3">
                                    <span className="text-[10px] md:text-xs font-semibold text-slate-500 uppercase tracking-wide">Avg/Invoice</span>
                                    <div className="w-7 h-7 md:w-9 md:h-9 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                                        <Package className="h-3.5 w-3.5 md:h-4 md:w-4 text-white" />
                                    </div>
                                </div>
                                <div className="text-2xl md:text-3xl font-bold bg-gradient-to-br from-amber-600 to-amber-500 bg-clip-text text-transparent">
                                    {stats.total_invoices > 0 ? `LKR ${(stats.total_spent / stats.total_invoices).toFixed(2)}` : '-/-'}
                                </div>
                            </div>
                        </div>
                    </div>


                     {/* Invoices List */}
                     {filteredInvoices.length > 0 ? (
                         <div className="space-y-4">
                             {filteredInvoices.map((invoice, index) => (
                                 <InvoiceCard
                                    key={invoice.id}
                                    invoice={invoice}
                                    index={index}
                                    onDownload={downloadInvoice}
                                    onView={viewInvoice}
                                    isExpanded={expandedInvoiceId === invoice.id}
                                    onToggleExpanded={() => toggleExpanded(invoice.id)}
                                />
                             ))}
                         </div>
                    ) : (
                        <div className="relative bg-white rounded-2xl border border-slate-200/50 shadow-sm overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 to-transparent"></div>
                            <div className="relative flex flex-col items-center justify-center py-12 text-center px-6">
                                <div className="relative mb-4">
                                    <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-xl"></div>
                                    <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                                        <Package className="h-8 w-8 text-blue-400" />
                                    </div>
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">No invoices found</h3>
                                <p className="text-slate-500 text-sm">Your invoices will appear here after order approval</p>
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
    onToggleExpanded
}: {
    invoice: Invoice;
    index: number;
    onDownload: (invoiceNumber: string) => void;
    onView: (invoiceNumber: string) => void;
    isExpanded: boolean;
    onToggleExpanded: () => void;
}) {
    return (
        <div
            className="group"
            style={{ animationDelay: `${index * 100}ms` }}
        >
            <div className="relative bg-white rounded-2xl border border-blue-200/50 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                {/* Top accent bar */}
                <div className="h-1 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600"></div>

                <div className="p-4 md:p-5">
                    {/* Clickable Header */}
                    <div
                        className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3 md:mb-4 cursor-pointer"
                        onClick={onToggleExpanded}
                    >
                        <div className="flex items-center gap-3 md:gap-4 flex-1">
                            <div className="relative flex-shrink-0">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl blur-md opacity-50"></div>
                                <div className="relative h-10 w-10 md:h-12 md:w-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-base md:text-lg shadow-lg">
                                    {invoice.invoice_number.substring(0, 3)}
                                </div>
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="font-bold text-sm md:text-base text-slate-900 truncate">
                                    {invoice.invoice_number}
                                </div>
                                <div className="text-xs text-slate-600 font-medium truncate">
                                    Order #{invoice.order_id}
                                </div>
                                <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {invoice.invoice_date}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge className={getPaymentStatusBadgeClass(invoice.payment_status)} variant="outline">
                                {invoice.payment_status}
                            </Badge>
                            <ChevronDown
                                className={`h-5 w-5 text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                            />
                        </div>
                    </div>

                    {/* Expandable Details and Actions */}
                    <div
                        className={`overflow-hidden transition-all duration-500 ease-in-out ${
                            isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                        }`}
                    >
                        <div className="pt-0">
                            <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl p-3 md:p-4 mb-3 md:mb-4 border border-slate-200/50">
                                <div className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                    <Package className="h-3.5 w-3.5" />
                                    Details
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <span className="text-xs text-slate-500">Distributor</span>
                                        <div className="font-medium text-slate-900 text-sm">{invoice.distributor_name}</div>
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-500">Items</span>
                                        <div className="space-y-1 mt-1">
                                            {invoice.items && invoice.items.length > 0 ? (
                                                invoice.items.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between text-sm">
                                                        <span className="text-slate-700">{item.product_name}</span>
                                                        <span className="text-slate-900 font-medium">x{item.quantity}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-xs text-slate-500">No items</p>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-500">Total Amount</span>
                                        <div className="font-bold text-slate-900 text-sm">LKR {invoice.total_amount.toFixed(2)}</div>
                                    </div>
                                    {invoice.discount_amount > 0 && (
                                        <div>
                                            <span className="text-xs text-emerald-600">Discount</span>
                                            <div className="text-emerald-600 font-medium text-sm">- LKR {invoice.discount_amount.toFixed(2)}</div>
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
                                    className="flex-1 flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                                >
                                    <Eye className="h-4 w-4" />
                                    View
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDownload(invoice.invoice_number);
                                    }}
                                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
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