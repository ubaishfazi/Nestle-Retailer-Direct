import { Head, usePage } from '@inertiajs/react';
import { Clock, Package, Calendar, DollarSign, ChevronRight, AlertCircle, CheckCircle, XCircle, Tag } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface OrderItem {
    product_name: string;
    product_image: string | null;
    quantity: number;
    price: number;
    subtotal: number;
}

interface Order {
    id: number;
    status: string;
    total_amount: number;
    discount_amount: number;
    promo_code: string | null;
    created_at: string;
    created_date: string;
    distributor_name: string;
    items: OrderItem[];
}

interface Props {
    orders: Order[];
    stats: {
        total_orders: number;
        pending_orders: number;
        completed_orders: number;
        total_spent: number;
        rejected_orders?: number;
        approved_orders?: number;
    };
}

function getStatusBadgeClass(status: string): string {
    switch (status) {
        case 'pending':
            return 'bg-amber-500 text-white';
        case 'approved':
            return 'bg-emerald-500 text-white';
        case 'rejected':
            return 'bg-red-500 text-white';
        case 'completed':
            return 'bg-blue-500 text-white';
        default:
            return 'bg-gray-500 text-white';
    }
}

export default function MyOrderRecords({ orders, stats }: Props) {
    const { toast } = useToast();
    const { flash } = usePage().props;
    const [filter, setFilter] = useState('all');

    // Show success toast if there's a flash message
    useEffect(() => {
        if (flash?.success) {
            toast({
                title: 'Success',
                description: flash.success,
            });
        }
    }, [flash?.success]);

    const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);
    const pendingOrders = filteredOrders.filter(o => o.status === 'pending');
    const otherOrders = filteredOrders.filter(o => o.status !== 'pending');

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex items-start justify-center py-4 px-3 md:py-8">
            <Head title="My Orders" />

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
                                    <span className="text-sm font-semibold text-blue-700 whitespace-nowrap">{stats.total_orders} Orders</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-3">
                            <h1 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">My Order History</h1>
                            <p className="text-xs text-slate-500 font-medium">Track and manage your orders</p>
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
                                    <span className="text-[10px] md:text-xs font-semibold text-slate-500 uppercase tracking-wide">Total</span>
                                    <div className="w-7 h-7 md:w-9 md:h-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                        <Package className="h-3.5 w-3.5 md:h-4 md:w-4 text-white" />
                                    </div>
                                </div>
                                <div className="text-2xl md:text-3xl font-bold bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-transparent">{stats.total_orders}</div>
                            </div>
                        </div>

                        <div className="group relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl md:rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity"></div>
                            <div className="relative bg-white rounded-xl md:rounded-2xl p-3 md:p-5 border border-slate-200/50 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-2 md:mb-3">
                                    <span className="text-[10px] md:text-xs font-semibold text-slate-500 uppercase tracking-wide">Pending</span>
                                    <div className="w-7 h-7 md:w-9 md:h-9 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                                        <Clock className="h-3.5 w-3.5 md:h-4 md:w-4 text-white" />
                                    </div>
                                </div>
                                <div className="text-2xl md:text-3xl font-bold bg-gradient-to-br from-amber-600 to-amber-500 bg-clip-text text-transparent">{stats.pending_orders}</div>
                            </div>
                        </div>

                        <div className="group relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl md:rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity"></div>
                            <div className="relative bg-white rounded-xl md:rounded-2xl p-3 md:p-5 border border-slate-200/50 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-2 md:mb-3">
                                    <span className="text-[10px] md:text-xs font-semibold text-slate-500 uppercase tracking-wide">Done</span>
                                    <div className="w-7 h-7 md:w-9 md:h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                                        <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4 text-white" />
                                    </div>
                                </div>
                                <div className="text-2xl md:text-3xl font-bold bg-gradient-to-br from-emerald-600 to-emerald-500 bg-clip-text text-transparent">{stats.completed_orders}</div>
                            </div>
                        </div>

                        <div className="group relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl md:rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity"></div>
                            <div className="relative bg-white rounded-xl md:rounded-2xl p-3 md:p-5 border border-slate-200/50 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-2 md:mb-3">
                                    <span className="text-[10px] md:text-xs font-semibold text-slate-500 uppercase tracking-wide">Spent</span>
                                    <div className="w-7 h-7 md:w-9 md:h-9 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                                        <DollarSign className="h-3.5 w-3.5 md:h-4 md:w-4 text-white" />
                                    </div>
                                </div>
                                <div className="text-2xl md:text-3xl font-bold bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-transparent">LKR {stats.total_spent.toFixed(2)}</div>
                            </div>
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 mb-6">
                        <div className="flex gap-2 p-1.5 bg-white rounded-xl border border-slate-200/50 shadow-sm w-fit min-w-max">
                            {['all', 'pending', 'approved', 'rejected'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilter(status)}
                                    className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                                        filter === status
                                            ? 'bg-gradient-to-r from-[#00447C] to-[#003d6f] text-white shadow-md'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                    }`}
                                >
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Pending Orders Section */}
                    {pendingOrders.length > 0 ? (
                        <div className="relative mb-6">
                            <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full hidden md:block"></div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4 sm:mb-6 pl-0 sm:pl-4">
                                <div className="relative flex-shrink-0">
                                    <div className="absolute inset-0 bg-amber-400/30 rounded-full blur-md"></div>
                                    <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                                        <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-base sm:text-lg font-bold text-slate-900">Pending Approval</h2>
                                    <p className="text-xs text-slate-500 font-medium">Awaiting distributor approval</p>
                                </div>
                                <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md self-start sm:self-center">
                                    {pendingOrders.length}
                                </Badge>
                            </div>
                            <div className="grid gap-3 md:gap-4">
                                {pendingOrders.map((order, index) => (
                                    <OrderCard key={order.id} order={order} index={index} />
                                ))}
                            </div>
                        </div>
                    ) : filter === 'pending' ? (
                        <div className="relative bg-white rounded-2xl border border-slate-200/50 shadow-sm overflow-hidden mb-6">
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-50/30 to-transparent"></div>
                            <div className="relative flex flex-col items-center justify-center py-12 text-center px-6">
                                <div className="relative mb-4">
                                    <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-xl"></div>
                                    <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                                        <AlertCircle className="h-8 w-8 text-amber-400" />
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">No pending orders</h3>
                                <p className="text-slate-500 text-sm">There are no orders awaiting approval at the moment.</p>
                            </div>
                        </div>
                    ) : null}

                    {/* Other Orders Section (Approved, Rejected, Completed) */}
                    {otherOrders.length > 0 ? (
                        <div className="relative">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center flex-shrink-0">
                                    <Package className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-base sm:text-lg font-bold text-slate-900">Processed Orders</h2>
                                    <p className="text-xs text-slate-500 font-medium">Completed decisions</p>
                                </div>
                                <Badge variant="outline" className="self-start sm:self-center flex-shrink-0">
                                    {otherOrders.length}
                                </Badge>
                            </div>

                            <div className="grid gap-3">
                                {otherOrders.map((order) => (
                                    <OrderCard key={order.id} order={order} index={0} />
                                ))}
                            </div>
                        </div>
                    ) : (filter === 'approved' || filter === 'rejected') ? (
                        <div className={`relative bg-white rounded-2xl border border-slate-200/50 shadow-sm overflow-hidden ${filter === 'pending' ? '' : 'mt-6'}`}>
                            <div className={`absolute inset-0 bg-gradient-to-br to-transparent ${
                                filter === 'approved' ? 'from-emerald-50/30' : 'from-red-50/30'
                            }`}></div>
                            <div className="relative flex flex-col items-center justify-center py-12 text-center px-6">
                                <div className="relative mb-4">
                                    <div className={`absolute inset-0 rounded-full blur-xl ${
                                        filter === 'approved' ? 'bg-emerald-400/20' : 'bg-red-400/20'
                                    }`}></div>
                                    <div className={`relative w-16 h-16 rounded-full flex items-center justify-center ${
                                        filter === 'approved'
                                            ? 'bg-gradient-to-br from-emerald-100 to-emerald-200'
                                            : 'bg-gradient-to-br from-red-100 to-red-200'
                                    }`}>
                                        {filter === 'approved' ? (
                                            <CheckCircle className="h-8 w-8 text-emerald-400" />
                                        ) : (
                                            <XCircle className="h-8 w-8 text-red-400" />
                                        )}
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">
                                    No {filter} orders
                                </h3>
                                <p className="text-slate-500 text-sm">
                                    {filter === 'approved'
                                        ? 'There are no approved orders yet.'
                                        : 'There are no rejected orders yet.'
                                    }
                                </p>
                            </div>
                        </div>
                    ) : null}

                    {/* Empty State for All Filter */}
                    {filter === 'all' && filteredOrders.length === 0 && (
                        <div className="relative bg-white rounded-2xl border border-slate-200/50 shadow-sm overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 to-transparent"></div>
                            <div className="relative flex flex-col items-center justify-center py-12 text-center px-6">
                                <Package className="h-16 w-16 text-slate-300 mb-4" />
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">No orders yet</h3>
                                <p className="text-slate-500 text-sm">Your order history will appear here</p>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Footer Navigation */}
            <footer className="fixed bottom-0 left-0 right-0 z-50">
                <div className="absolute inset-0 bg-gradient-to-r from-[#00447C] via-[#003d6f] to-[#00284a]"></div>
                <div className="absolute inset-0 opacity-[0.02]" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
                }}></div>
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 left-1/4 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl"></div>
                    <div className="absolute bottom-0 right-1/4 w-24 h-24 bg-cyan-400/10 rounded-full blur-2xl"></div>
                </div>
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                <div className="relative container px-4 py-3">
                    <div className="flex items-center justify-center">
                        <div className="grid grid-cols-4 gap-2 md:gap-4">
                            <a href="/" className="group relative flex flex-col items-center gap-1.5 p-2">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/40 to-cyan-400/40 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    <svg className="relative h-5 w-5 text-white/60 group-hover:text-white transition-all duration-500 group-hover:scale-110 group-hover:-translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                </div>
                                <span className="text-[10px] text-white/50 font-medium tracking-wider uppercase group-hover:text-white/80 transition-colors duration-500">Home</span>
                                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent group-hover:w-8 transition-all duration-500"></div>
                            </a>
                            <a href="/my-orders" className="group relative flex flex-col items-center gap-1.5 p-2">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/40 to-cyan-400/40 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    <svg className="relative h-5 w-5 text-white/60 group-hover:text-white transition-all duration-500 group-hover:scale-110 group-hover:-translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 15H4L5 9z" />
                                    </svg>
                                </div>
                                <span className="text-[10px] text-white/50 font-medium tracking-wider uppercase group-hover:text-white/80 transition-colors duration-500">Orders</span>
                                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent group-hover:w-8 transition-all duration-500"></div>
                            </a>
                            <a href="/stock" className="group relative flex flex-col items-center gap-1.5 p-2">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/40 to-cyan-400/40 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    <svg className="relative h-5 w-5 text-white/60 group-hover:text-white transition-all duration-500 group-hover:scale-110 group-hover:-translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>
                                <span className="text-[10px] text-white/50 font-medium tracking-wider uppercase group-hover:text-white/80 transition-colors duration-500">Inventory</span>
                                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent group-hover:w-8 transition-all duration-500"></div>
                            </a>
                            <a href="/user/profile" className="group relative flex flex-col items-center gap-1.5 p-2">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/40 to-cyan-400/40 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    <svg className="relative h-5 w-5 text-white/60 group-hover:text-white transition-all duration-500 group-hover:scale-110 group-hover:-translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <span className="text-[10px] text-white/50 font-medium tracking-wider uppercase group-hover:text-white/80 transition-colors duration-500">Profile</span>
                                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent group-hover:w-8 transition-all duration-500"></div>
                            </a>
                        </div>
                    </div>
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <div className="relative w-1.5 h-1.5">
                            <div className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-blue-400/40 animate-ping"></div>
                            <div className="relative w-1.5 h-1.5 rounded-full bg-blue-400/60"></div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

// Order Card Component
function OrderCard({ order, index }: { order: Order; index: number }) {
    return (
        <div
            className="group relative"
            style={{ animationDelay: `${index * 100}ms` }}
        >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-blue-600/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative bg-white rounded-2xl border border-blue-200/50 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                {/* Top accent bar */}
                <div className="h-1 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600"></div>

                <div className="p-4 md:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3 md:mb-4">
                        <div className="flex items-center gap-3 md:gap-4 flex-1">
                            <div className="relative flex-shrink-0">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl blur-md opacity-50"></div>
                                <div className="relative h-10 w-10 md:h-12 md:w-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-base md:text-lg shadow-lg">
                                    #{order.id}
                                </div>
                            </div>
                                <div className="min-w-0 flex-1">
                                    <div className="font-bold text-sm md:text-base text-slate-900 truncate">Order #{order.id}</div>
                                    <div className="text-xs text-slate-600 font-medium truncate">
                                        Dist: {order.distributor_name}
                                    </div>
                                    {order.has_invoice && (
                                        <a
                                            href={`/invoices/${order.invoice_number}/view`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-600 hover:bg-amber-100 transition-colors font-medium"
                                            title="View Invoice"
                                        >
                                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            Invoice
                                        </a>
                                    )}
                                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {order.created_date}
                                    </div>
                                </div>
                        </div>
                        <Badge className={getStatusBadgeClass(order.status)} variant="outline">
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                    </div>

                    {/* Order Items */}
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl p-3 md:p-4 mb-3 md:mb-4 border border-slate-200/50">
                        <div className="text-xs font-semibold text-slate-700 mb-2 md:mb-3 flex items-center gap-2">
                            <Package className="h-3.5 w-3.5" />
                            Order Items
                        </div>
                        <div className="space-y-1.5 md:space-y-2">
                            {order.items.map((item, itemIndex) => (
                                <div
                                    key={itemIndex}
                                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs p-2 rounded-lg bg-white/50 border border-slate-200/50"
                                >
                                    <span className="font-medium text-slate-700 break-words">{item.product_name}</span>
                                    <div className="text-right flex-shrink-0">
                                        <span className="text-slate-600">
                                            Qty: {item.quantity} × LKR {item.price.toFixed(2)}
                                        </span>
                                        <span className="font-bold text-slate-900 ml-2">
                                            = LKR {item.subtotal.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Discount and Total Amount */}
                    <div className="pt-3 md:pt-4 border-t border-slate-200/50 space-y-2">
                        {order.discount_amount > 0 && order.promo_code && (
                            <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Tag className="h-4 w-4 text-emerald-600" />
                                        <span className="text-xs font-semibold text-emerald-800">Promo Applied</span>
                                    </div>
                                    <Badge className="bg-emerald-200 text-emerald-800 text-xs">
                                        {order.promo_code}
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-emerald-700">Discount Amount</span>
                                    <span className="font-bold text-emerald-700">- LKR {order.discount_amount.toFixed(2)}</span>
                                </div>
                            </div>
                        )}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                {order.discount_amount > 0 && order.promo_code && (
                                    <div className="text-xs text-slate-500 font-medium mb-0.5">
                                        Original: LKR {(order.total_amount + order.discount_amount).toFixed(2)}
                                    </div>
                                )}
                                <div className="text-xs text-slate-500 font-medium mb-0.5">Final Amount</div>
                                <div className="text-xl md:text-2xl font-bold bg-gradient-to-br from-slate-900 to-slate-700 bg-clip-text text-transparent">
                                    LKR {order.total_amount.toFixed(2)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
