import { Head } from '@inertiajs/react';
import ActivePromotions from '@/components/active-promotions';
import LoyaltyStatus from '@/components/loyalty-status';
import { ChevronRight, Package, Gift } from 'lucide-react';

export default function RetailerPromotions() {
    return (
        <>
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
                                    Promotions
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
                <Head title="Promotions & Rewards" />

                <main className="mx-auto max-w-6xl px-4 py-8">
                    <div className="mb-6 flex items-center gap-2">
                        <Gift className="h-6 w-6 text-amber-500" />
                        <h1 className="text-2xl font-bold">Promotions & Rewards</h1>
                    </div>

                    {/* Loyalty Status Section */}
                    <div className="mb-8">
                        <h2 className="mb-4 text-lg font-semibold text-slate-700">
                            Your Loyalty Status
                        </h2>
                        <LoyaltyStatus />
                    </div>

                    {/* Active Promotions Section */}
                    <div>
                        <h2 className="mb-4 text-lg font-semibold text-slate-700">
                            Active Promotions
                        </h2>
                        <ActivePromotions />
                    </div>
                </main>
            </div>
        </>
    );
}
