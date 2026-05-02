import { Head, Link } from '@inertiajs/react';
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
    Clipboard,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import GuestLayout from '@/layouts/guest-layout';

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

interface SurveyQuestion {
    id: number;
    question_text: string;
    question_type: string;
    placeholder: string | null;
    is_required: boolean;
}

interface ActiveSurvey {
    id: number;
    title: string;
    description: string | null;
    questions: SurveyQuestion[];
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
    const [surveys, setSurveys] = useState<ActiveSurvey[]>([]);
    const [surveysLoading, setSurveysLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setShowPromotions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);

        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
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
    }, [showPromotions, promotions.length]);

    // Fetch active surveys on mount
    useEffect(() => {
        const fetchSurveys = async () => {
            setSurveysLoading(true);

            try {
                const response = await fetch('/api/surveys/active');
                const data = await response.json();
                setSurveys(data.surveys || []);
            } catch (error) {
                console.error('Error fetching surveys:', error);
            } finally {
                setSurveysLoading(false);
            }
        };

        fetchSurveys();
    }, []);

    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        toast({
            title: 'Copied!',
            description: `Promo code "${code}" copied to clipboard`,
        });
    };

    return (
        <GuestLayout canRegister={canRegister}>
            <Head title="Nestlé System Analysis" />
            <div className="flex min-h-screen w-full flex-col items-center justify-center overflow-x-hidden bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-blue-950 dark:via-slate-900 dark:to-blue-900">
                {/* Cards Container */}
                <div className="mx-auto flex w-full max-w-4xl flex-col justify-center gap-4 px-4 pb-28 md:gap-10 md:pb-32">
                    {/* Mobile Layout - 2 rows x 2 cols */}
                    <div className="flex flex-col gap-4 md:hidden">
                        {/* Row 1 - One-Tap Reorder + Complaints */}
                        <div className="grid grid-cols-2 gap-3">
                            {/* One-Tap Reorder Card */}
                            <a
                                href="/quick-reorder"
                                className="group flex h-24 w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-white/50 bg-white/90 p-2 text-center shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] dark:bg-white/10"
                            >
                                <div className="transform transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-110">
                                    <ShoppingCart className="mb-1.5 h-5 w-5 text-primary" />
                                </div>
                                <p className="text-[10px] font-medium transition-colors duration-300 group-hover:text-primary/80">
                                    One-Tap Reorder
                                </p>
                                <div className="mt-1.5 translate-y-4 transform opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                                    <span className="flex items-center gap-0.5 text-[9px] text-muted-foreground">
                                        Click to view
                                        <svg
                                            className="h-2.5 w-2.5"
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
                                    </span>
                                </div>
                            </a>

                            {/* Complaints Card */}
                            <a
                                href="/complaints"
                                className="group flex h-24 w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-white/50 bg-white/90 p-2 text-center shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] dark:bg-white/10"
                            >
                                <div className="transform transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-110">
                                    <AlertCircle className="mb-1.5 h-5 w-5 text-primary" />
                                </div>
                                <p className="text-[10px] font-medium transition-colors duration-300 group-hover:text-primary/80">
                                    Complaints
                                </p>
                                <div className="mt-1.5 translate-y-4 transform opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                                    <span className="flex items-center gap-0.5 text-[9px] text-muted-foreground">
                                        Click to view
                                        <svg
                                            className="h-2.5 w-2.5"
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
                                    </span>
                                </div>
                            </a>
                        </div>

                        {/* Row 2 - Promotions + Coming Soon */}
                        <div className="grid grid-cols-2 gap-3">
                            {/* Promotions Card with Dropdown */}
                            <div className="relative">
                                <Link
                                    href="/retailer/promotions"
                                    className="group flex h-24 w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-white/50 bg-white/90 p-2 text-center shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] dark:bg-white/10"
                                >
                                    <div className="transform transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-110">
                                        <Tag className="mb-1.5 h-5 w-5 text-primary" />
                                    </div>
                                    <p className="text-[10px] font-medium transition-colors duration-300 group-hover:text-primary/80">
                                        Promotions
                                    </p>
                                    <div className="mt-1.5 translate-y-4 transform opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                                        <span className="flex items-center gap-0.5 text-[9px] text-muted-foreground">
                                            View offers
                                            <svg
                                                className="h-2.5 w-2.5"
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
                                        </span>
                                    </div>
                                </Link>

                                {/* Mobile Promotions Dropdown */}
                                {showPromotions && (
                                    <div className="absolute top-full right-0 left-0 z-50 mt-2 max-h-64 overflow-y-auto rounded-xl border bg-white p-3 shadow-xl">
                                        <div className="mb-2 flex items-center justify-between">
                                            <h3 className="text-sm font-semibold">
                                                Active Promotions
                                            </h3>
                                            <button
                                                onClick={() =>
                                                    setShowPromotions(false)
                                                }
                                                className="rounded p-1 hover:bg-gray-100"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                        {loading ? (
                                            <p className="py-4 text-center text-xs text-muted-foreground">
                                                Loading...
                                            </p>
                                        ) : promotions.length === 0 ? (
                                            <p className="py-4 text-center text-xs text-muted-foreground">
                                                No active promotions
                                            </p>
                                        ) : (
                                            <div className="space-y-2">
                                                {promotions.map((promo) => (
                                                    <div
                                                        key={promo.id}
                                                        className="rounded-lg border p-2"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex-1">
                                                                <p className="text-xs font-semibold">
                                                                    {
                                                                        promo.title
                                                                    }
                                                                </p>
                                                                <div className="mt-1 flex items-center gap-1">
                                                                    <Calendar className="h-3 w-3 text-muted-foreground" />
                                                                    <span className="text-[10px] text-muted-foreground">
                                                                        {Math.floor(
                                                                            promo.days_remaining,
                                                                        )}{' '}
                                                                        days
                                                                        left
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className="text-[10px] font-bold text-emerald-600">
                                                                    {promo.discount_type ===
                                                                    'percentage'
                                                                        ? `${promo.discount_value}% OFF`
                                                                        : `$${promo.discount_value.toFixed(2)} OFF`}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="mt-2 flex items-center gap-1">
                                                            <code className="flex-1 rounded bg-gray-100 px-2 py-1 font-mono text-[10px]">
                                                                {
                                                                    promo.promo_code
                                                                }
                                                            </code>
                                                            <button
                                                                onClick={() =>
                                                                    handleCopyCode(
                                                                        promo.promo_code,
                                                                    )
                                                                }
                                                                className="rounded p-1 hover:bg-gray-100"
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

                            {/* Mobile Survey Card */}
                            <Link
                                href="/retailer/surveys"
                                className="group flex h-24 w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-white/50 bg-white/90 p-2 text-center shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] dark:bg-white/10"
                            >
                                <div className="flex items-center gap-1.5">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                                        <Clipboard className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-semibold text-slate-900 dark:text-white">
                                            Questionnaire
                                        </p>
                                        <p className="text-[9px] text-muted-foreground">
                                            {surveysLoading
                                                ? 'Loading...'
                                                : `${surveys.length} survey${surveys.length !== 1 ? 's' : ''} available`}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-1 translate-y-4 transform opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                                    <span className="flex items-center gap-0.5 text-[9px] font-semibold text-primary">
                                        View Surveys
                                        <svg
                                            className="h-2 w-2"
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
                                    </span>
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* Desktop Layout - 2 rows x 3 cols */}
                    <div className="hidden flex-col gap-10 md:flex">
                        {/* Row 1 - One-Tap Reorder + Complaints + Promotions */}
                        <div className="grid gap-10 md:grid-cols-3">
                            {/* One-Tap Reorder Card */}
                            <a
                                href="/quick-reorder"
                                className="group flex h-56 w-72 cursor-pointer flex-col items-center justify-center rounded-3xl border border-white/50 bg-white/90 p-8 text-center shadow-2xl backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] dark:bg-white/10"
                            >
                                <div className="transform transition-transform duration-300 group-hover:-translate-y-2 group-hover:scale-110">
                                    <ShoppingCart className="mb-4 h-14 w-14 text-primary" />
                                </div>
                                <p className="text-xl font-medium transition-colors duration-300 group-hover:text-primary/80">
                                    One-Tap Reorder
                                </p>
                                <div className="mt-4 translate-y-4 transform opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                                        Click to view
                                        <svg
                                            className="h-4 w-4"
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
                                    </span>
                                </div>
                            </a>

                            {/* Complaints Card */}
                            <a
                                href="/complaints"
                                className="group flex h-56 w-72 cursor-pointer flex-col items-center justify-center rounded-3xl border border-white/50 bg-white/90 p-8 text-center shadow-2xl backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] dark:bg-white/10"
                            >
                                <div className="transform transition-transform duration-300 group-hover:-translate-y-2 group-hover:scale-110">
                                    <AlertCircle className="mb-4 h-14 w-14 text-primary" />
                                </div>
                                <p className="text-xl font-medium transition-colors duration-300 group-hover:text-primary/80">
                                    Complaints
                                </p>
                                <div className="mt-4 translate-y-4 transform opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                                        Click to view
                                        <svg
                                            className="h-4 w-4"
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
                                    </span>
                                </div>
                            </a>

                            {/* Promotions Card with Dropdown */}
                            <div className="relative">
                                <Link
                                    href="/retailer/promotions"
                                    className="group flex h-56 w-72 cursor-pointer flex-col items-center justify-center rounded-3xl border border-white/50 bg-white/90 p-8 text-center shadow-2xl backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] dark:bg-white/10"
                                >
                                    <div className="transform transition-transform duration-300 group-hover:-translate-y-2 group-hover:scale-110">
                                        <Tag className="mb-4 h-14 w-14 text-primary" />
                                    </div>
                                    <p className="text-xl font-medium transition-colors duration-300 group-hover:text-primary/80">
                                        Promotions
                                    </p>
                                    <div className="mt-4 translate-y-4 transform opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                                        <span className="flex items-center gap-2 text-sm text-muted-foreground">
                                            View offers
                                            <svg
                                                className="h-4 w-4"
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
                                        </span>
                                    </div>
                                </Link>

                                {/* Desktop Promotions Dropdown */}
                                {showPromotions && (
                                    <div className="absolute top-full left-1/2 z-50 mt-4 max-h-96 w-[500px] -translate-x-1/2 overflow-y-auto rounded-2xl border bg-white p-6 shadow-2xl">
                                        <div className="mb-4 flex items-center justify-between">
                                            <h3 className="flex items-center gap-2 text-lg font-bold">
                                                <Tag className="h-5 w-5" />
                                                Active Promotions
                                            </h3>
                                            <button
                                                onClick={() =>
                                                    setShowPromotions(false)
                                                }
                                                className="rounded-lg p-2 hover:bg-gray-100"
                                            >
                                                <X className="h-5 w-5" />
                                            </button>
                                        </div>
                                        {loading ? (
                                            <p className="py-8 text-center text-sm text-muted-foreground">
                                                Loading promotions...
                                            </p>
                                        ) : promotions.length === 0 ? (
                                            <p className="py-8 text-center text-sm text-muted-foreground">
                                                No active promotions
                                            </p>
                                        ) : (
                                            <div className="space-y-3">
                                                {promotions.map((promo) => (
                                                    <div
                                                        key={promo.id}
                                                        className="rounded-xl border p-4 transition-colors hover:bg-gray-50"
                                                    >
                                                        <div className="mb-2 flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <div className="mb-1 flex items-center gap-2">
                                                                    <p className="font-semibold">
                                                                        {
                                                                            promo.title
                                                                        }
                                                                    </p>
                                                                    <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-800">
                                                                        {promo.discount_type ===
                                                                        'percentage' ? (
                                                                            <span className="flex items-center gap-1">
                                                                                <Percent className="h-3 w-3" />
                                                                                {
                                                                                    promo.discount_value
                                                                                }
                                                                                %
                                                                            </span>
                                                                        ) : (
                                                                            <span className="flex items-center gap-1">
                                                                                <DollarSign className="h-3 w-3" />

                                                                                $
                                                                                {promo.discount_value.toFixed(
                                                                                    2,
                                                                                )}
                                                                            </span>
                                                                        )}
                                                                    </span>
                                                                </div>
                                                                {promo.description && (
                                                                    <p className="text-xs text-muted-foreground">
                                                                        {
                                                                            promo.description
                                                                        }
                                                                    </p>
                                                                )}
                                                                <div className="mt-2 flex items-center gap-1">
                                                                    <Calendar className="h-3 w-3 text-muted-foreground" />
                                                                    <span className="text-xs text-muted-foreground">
                                                                        {Math.floor(
                                                                            promo.days_remaining,
                                                                        )}{' '}
                                                                        days
                                                                        remaining
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="mt-3 flex items-center gap-2 border-t pt-3">
                                                            <code className="flex-1 rounded-lg bg-gray-100 px-3 py-2 text-center font-mono text-sm">
                                                                {
                                                                    promo.promo_code
                                                                }
                                                            </code>
                                                            <button
                                                                onClick={() =>
                                                                    handleCopyCode(
                                                                        promo.promo_code,
                                                                    )
                                                                }
                                                                className="rounded-lg p-2 hover:bg-gray-100"
                                                                title="Copy code"
                                                            >
                                                                <Copy className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                                <button
                                                    onClick={() =>
                                                        setShowPromotions(false)
                                                    }
                                                    className="w-full py-2 text-xs text-primary hover:underline"
                                                >
                                                    Click any code to copy •
                                                    Close to dismiss
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
                                className="group flex h-56 w-72 cursor-pointer flex-col items-center justify-center rounded-3xl border border-white/50 bg-white/90 p-8 text-center shadow-2xl backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] dark:bg-white/10"
                            >
                                <div className="transform transition-transform duration-300 group-hover:-translate-y-2 group-hover:scale-110">
                                    <FileText className="mb-4 h-14 w-14 text-primary" />
                                </div>
                                <p className="text-xl font-medium transition-colors duration-300 group-hover:text-primary/80">
                                    Invoices
                                </p>
                                <div className="mt-4 translate-y-4 transform opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                                        View invoices
                                        <svg
                                            className="h-4 w-4"
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
                                    </span>
                                </div>
                            </Link>

                            {/* Demand Sensing Survey Card */}
                            <Link
                                href="/retailer/surveys"
                                className="group flex h-56 w-72 cursor-pointer flex-col items-center justify-center rounded-3xl border border-white/50 bg-white/90 p-8 text-center shadow-2xl backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] dark:bg-white/10"
                            >
                                <div className="flex flex-col items-center gap-3">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 transition-transform duration-300 group-hover:scale-110">
                                        <Clipboard className="h-8 w-8 text-primary" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xl font-semibold text-slate-900 dark:text-white transition-colors duration-300 group-hover:text-primary/80">
                                            Questionnaire
                                        </p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {surveysLoading
                                                ? 'Loading...'
                                                : `${surveys.length} survey${surveys.length !== 1 ? 's' : ''} available`}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-4 translate-y-4 transform opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                                    <span className="flex items-center gap-2 text-sm font-semibold text-primary">
                                        View Surveys
                                        <svg
                                            className="h-4 w-4"
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
                                    </span>
                                </div>
                            </Link>

                            {/* Second Coming Soon (remain unchanged) */}
                            <div className="flex h-56 w-72 flex-col items-center justify-center rounded-3xl border border-white/50 bg-white/90 p-8 text-center opacity-50 shadow-2xl backdrop-blur-sm dark:bg-white/10">
                                <p className="text-xl font-medium text-muted-foreground">
                                    Coming Soon
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
