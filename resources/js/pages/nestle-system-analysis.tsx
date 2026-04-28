import { Head, Link } from '@inertiajs/react';
import GuestLayout from '@/layouts/guest-layout';
import {
    ShoppingCart,
    AlertCircle,
    Tag,
    X,
    Copy,
    Calendar,
    Percent,
    DollarSign,
    FileText,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ActivePromotion {
    id: number;
    title: string;
    description: string | null;
    promo_code: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    minimum_order_amount: number | null;
    start_date: string;
    expiry_date: string;
    products: Array<{ id: number; name: string }>;
    days_remaining: number;
}

export default function NestleSystemAnalysis({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { toast } = useToast();
    const [showPromotions, setShowPromotions] = useState(false);
    const [promotions, setPromotions] = useState<ActivePromotion[]>([]);
    const [loading, setLoading] = useState(false);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowPromotions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (showPromotions && promotions.length === 0) {
            setLoading(true);
            fetch('/api/promotions/active')
                .then((res) => res.json())
                .then((data) => {
                    setPromotions(data.promotions || []);
                    setLoading(false);
                })
                .catch(() => {
                    setLoading(false);
                });
        }
    }, [showPromotions]);

    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
        toast({
            title: 'Copied!',
            description: `Promo code "${code}" copied to clipboard`,
        });
    };

    return (
        <GuestLayout canRegister={canRegister}>
            <Head title="Nestlé System Analysis" />
            <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-blue-950 dark:via-slate-900 dark:to-blue-900 overflow-x-hidden">
                {/* Cards Container */}
                <div className="flex flex-col justify-center gap-4 md:gap-10 w-full max-w-4xl mx-auto pb-28 md:pb-32 px-4">

                    {/* Mobile Layout - 2 rows x 2 cols */}
                    <div className="flex flex-col gap-4 md:hidden">
                        {/* Row 1 - One-Tap Reorder + Complaints */}
                        <div className="grid grid-cols-2 gap-3">
                            {/* One-Tap Reorder Card */}
                            <a
                                href="/quick-reorder"
                                className="group flex h-24 w-full flex-col items-center justify-center rounded-xl bg-white/90 p-2 text-center shadow-lg backdrop-blur-sm border border-white/50 dark:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] hover:bg-white cursor-pointer"
                            >
                                <div className="transform transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1">
                                    <ShoppingCart className="mb-1.5 h-5 w-5 text-primary" />
                                </div>
                                <p className="font-medium text-[10px] group-hover:text-primary/80 transition-colors duration-300">One-Tap Reorder</p>
                                <div className="mt-1.5 opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                                    <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                                        Click to view
                                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </span>
                                </div>
                            </a>

                            {/* Complaints Card */}
                            <a
                                href="/complaints"
                                className="group flex h-24 w-full flex-col items-center justify-center rounded-xl bg-white/90 p-2 text-center shadow-lg backdrop-blur-sm border border-white/50 dark:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] hover:bg-white cursor-pointer"
                            >
                                <div className="transform transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1">
                                    <AlertCircle className="mb-1.5 h-5 w-5 text-primary" />
                                </div>
                                <p className="font-medium text-[10px] group-hover:text-primary/80 transition-colors duration-300">Complaints</p>
                                <div className="mt-1.5 opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                                    <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                                        Click to view
                                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </span>
                                </div>
                            </a>
                        </div>

                        {/* Row 2 - Promotions + Coming Soon */}
                        <div className="grid grid-cols-2 gap-3">
                            {/* Promotions Card with Dropdown */}
                            <div className="relative">
                                <Link href="/retailer/promotions" className="group flex h-24 w-full flex-col items-center justify-center rounded-xl bg-white/90 p-2 text-center shadow-lg backdrop-blur-sm border border-white/50 dark:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] hover:bg-white cursor-pointer">
                                    <div className="transform transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1">
                                        <Tag className="mb-1.5 h-5 w-5 text-primary" />
                                    </div>
                                    <p className="font-medium text-[10px] group-hover:text-primary/80 transition-colors duration-300">Promotions</p>
                                    <div className="mt-1.5 opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                                        <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                                            View offers
                                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </span>
                                    </div>
                                </Link>

                                {/* Mobile Promotions Dropdown */}
                                {showPromotions && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border z-50 p-3 max-h-64 overflow-y-auto">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-sm font-semibold">Active Promotions</h3>
                                            <button
                                                onClick={() => setShowPromotions(false)}
                                                className="p-1 hover:bg-gray-100 rounded"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                        {loading ? (
                                            <p className="text-xs text-center py-4 text-muted-foreground">Loading...</p>
                                        ) : promotions.length === 0 ? (
                                            <p className="text-xs text-center py-4 text-muted-foreground">No active promotions</p>
                                        ) : (
                                            <div className="space-y-2">
                                                {promotions.map((promo) => (
                                                    <div key={promo.id} className="border rounded-lg p-2">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex-1">
                                                                <p className="text-xs font-semibold">{promo.title}</p>
                                                                <div className="flex items-center gap-1 mt-1">
                                                                    <Calendar className="h-3 w-3 text-muted-foreground" />
                                                                    <span className="text-[10px] text-muted-foreground">
                                                                        {Math.floor(promo.days_remaining)} days left
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className="text-[10px] font-bold text-emerald-600">
                                                                    {promo.discount_type === 'percentage'
                                                                        ? `${promo.discount_value}% OFF`
                                                                        : `$${promo.discount_value.toFixed(2)} OFF`}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1 mt-2">
                                                            <code className="flex-1 text-[10px] bg-gray-100 px-2 py-1 rounded font-mono">
                                                                {promo.promo_code}
                                                            </code>
                                                            <button
                                                                onClick={() => handleCopyCode(promo.promo_code)}
                                                                className="p-1 hover:bg-gray-100 rounded"
                                                            >
                                                                <Copy className="h-3 w-3" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="flex h-24 w-full flex-col items-center justify-center rounded-xl bg-white/90 p-2 text-center shadow-lg backdrop-blur-sm border border-white/50 dark:bg-white/10 opacity-50">
                                <p className="font-medium text-[10px] text-muted-foreground">Coming Soon</p>
                            </div>
                        </div>
                    </div>

                    {/* Desktop Layout - 2 rows x 3 cols */}
                    <div className="hidden md:flex flex-col gap-10">
                        {/* Row 1 - One-Tap Reorder + Complaints + Promotions */}
                        <div className="grid gap-10 md:grid-cols-3">
                            {/* One-Tap Reorder Card */}
                            <a
                                href="/quick-reorder"
                                className="group flex h-56 w-72 flex-col items-center justify-center rounded-3xl bg-white/90 p-8 text-center shadow-2xl backdrop-blur-sm border border-white/50 dark:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] hover:bg-white cursor-pointer"
                            >
                                <div className="transform transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-2">
                                    <ShoppingCart className="mb-4 h-14 w-14 text-primary" />
                                </div>
                                <p className="font-medium text-xl group-hover:text-primary/80 transition-colors duration-300">One-Tap Reorder</p>
                                <div className="mt-4 opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                                        Click to view
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </span>
                                </div>
                            </a>

                            {/* Complaints Card */}
                            <a
                                href="/complaints"
                                className="group flex h-56 w-72 flex-col items-center justify-center rounded-3xl bg-white/90 p-8 text-center shadow-2xl backdrop-blur-sm border border-white/50 dark:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] hover:bg-white cursor-pointer"
                            >
                                <div className="transform transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-2">
                                    <AlertCircle className="mb-4 h-14 w-14 text-primary" />
                                </div>
                                <p className="font-medium text-xl group-hover:text-primary/80 transition-colors duration-300">Complaints</p>
                                <div className="mt-4 opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                                        Click to view
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </span>
                                </div>
                            </a>

                            {/* Promotions Card with Dropdown */}
                            <div className="relative">
                                <Link href="/retailer/promotions" className="group flex h-56 w-72 flex-col items-center justify-center rounded-3xl bg-white/90 p-8 text-center shadow-2xl backdrop-blur-sm border border-white/50 dark:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] hover:bg-white cursor-pointer">
                                    <div className="transform transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-2">
                                        <Tag className="mb-4 h-14 w-14 text-primary" />
                                    </div>
                                    <p className="font-medium text-xl group-hover:text-primary/80 transition-colors duration-300">Promotions</p>
                                    <div className="mt-4 opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                                            View offers
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </span>
                                    </div>
                                </Link>

                                {/* Desktop Promotions Dropdown */}
                                {showPromotions && (
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 bg-white rounded-2xl shadow-2xl border z-50 p-6 w-[500px] max-h-96 overflow-y-auto">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-bold flex items-center gap-2">
                                                <Tag className="h-5 w-5" />
                                                Active Promotions
                                            </h3>
                                            <button
                                                onClick={() => setShowPromotions(false)}
                                                className="p-2 hover:bg-gray-100 rounded-lg"
                                            >
                                                <X className="h-5 w-5" />
                                            </button>
                                        </div>
                                        {loading ? (
                                            <p className="text-sm text-center py-8 text-muted-foreground">Loading promotions...</p>
                                        ) : promotions.length === 0 ? (
                                            <p className="text-sm text-center py-8 text-muted-foreground">No active promotions</p>
                                        ) : (
                                            <div className="space-y-3">
                                                {promotions.map((promo) => (
                                                    <div key={promo.id} className="border rounded-xl p-4 hover:bg-gray-50 transition-colors">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <p className="font-semibold">{promo.title}</p>
                                                                    <span className="text-xs font-bold px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                                                                        {promo.discount_type === 'percentage' ? (
                                                                            <span className="flex items-center gap-1">
                                                                                <Percent className="h-3 w-3" />
                                                                                {promo.discount_value}%
                                                                            </span>
                                                                        ) : (
                                                                            <span className="flex items-center gap-1">
                                                                                <DollarSign className="h-3 w-3" />
                                                                                ${promo.discount_value.toFixed(2)}
                                                                            </span>
                                                                        )}
                                                                    </span>
                                                                </div>
                                                                {promo.description && (
                                                                    <p className="text-xs text-muted-foreground">{promo.description}</p>
                                                                )}
                                                                <div className="flex items-center gap-1 mt-2">
                                                                    <Calendar className="h-3 w-3 text-muted-foreground" />
                                                                    <span className="text-xs text-muted-foreground">
                                                                        {Math.floor(promo.days_remaining)} days remaining
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                                                            <code className="flex-1 text-sm bg-gray-100 px-3 py-2 rounded-lg font-mono text-center">
                                                                {promo.promo_code}
                                                            </code>
                                                            <button
                                                                onClick={() => handleCopyCode(promo.promo_code)}
                                                                className="p-2 hover:bg-gray-100 rounded-lg"
                                                                title="Copy code"
                                                            >
                                                                <Copy className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                                <button
                                                    onClick={() => setShowPromotions(false)}
                                                    className="w-full text-xs text-primary hover:underline py-2"
                                                >
                                                    Click any code to copy • Close to dismiss
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Row 2 - Invoices + Coming Soon + Coming Soon */}
                        <div className="grid gap-10 md:grid-cols-3">
                            {/* Invoices Card */}
                            <Link
                                href="/invoices"
                                className="group flex h-56 w-72 flex-col items-center justify-center rounded-3xl bg-white/90 p-8 text-center shadow-2xl backdrop-blur-sm border border-white/50 dark:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] hover:bg-white cursor-pointer"
                            >
                                <div className="transform transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-2">
                                    <FileText className="mb-4 h-14 w-14 text-primary" />
                                </div>
                                <p className="font-medium text-xl group-hover:text-primary/80 transition-colors duration-300">Invoices</p>
                                <div className="mt-4 opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                                        View invoices
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </span>
                                </div>
                            </Link>

                            {/* Coming Soon Cards */}
                            <div className="flex h-56 w-72 flex-col items-center justify-center rounded-3xl bg-white/90 p-8 text-center shadow-2xl backdrop-blur-sm border border-white/50 dark:bg-white/10 opacity-50">
                                <p className="font-medium text-xl text-muted-foreground">Coming Soon</p>
                            </div>
                            <div className="flex h-56 w-72 flex-col items-center justify-center rounded-3xl bg-white/90 p-8 text-center shadow-2xl backdrop-blur-sm border border-white/50 dark:bg-white/10 opacity-50">
                                <p className="font-medium text-xl text-muted-foreground">Coming Soon</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
