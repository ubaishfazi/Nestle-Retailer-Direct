import { Head, Link } from '@inertiajs/react';
import GuestLayout from '@/layouts/guest-layout';
import {
    AlertCircle,
    ClipboardList,
    Warehouse,
    Truck,
    BarChart3,
    MapPin,
    PackageSearch,
    Users,
    Bell,
} from 'lucide-react';

const distributorSections = [
    {
        area: 'Incoming Orders',
        icon: ClipboardList,
        href: '/distributor/incoming-orders',
        description: 'View incoming orders',
        isComingSoon: false,
    },
    {
        area: 'Complaints',
        icon: AlertCircle,
        href: '/distributor/complaints',
        description: 'Manage complaints',
        isComingSoon: false,
    },
    {
        area: 'Warehouse Inventory',
        icon: Warehouse,
        href: '/distributor/warehouse-inventory',
        description: 'Manage stock levels',
        isComingSoon: true,
    },
    {
        area: 'Delivery Tracking',
        icon: Truck,
        href: '/distributor/delivery',
        description: 'Track shipments',
        isComingSoon: true,
    },
    {
        area: 'Order Statistics',
        icon: BarChart3,
        href: '/distributor/statistics',
        description: 'View performance',
        isComingSoon: true,
    },
    {
        area: 'Delivery Schedule',
        icon: MapPin,
        href: '/distributor/schedule',
        description: 'Manage schedules',
        isComingSoon: true,
    },
    {
        area: 'Retailer Management',
        icon: Users,
        href: '/distributor/retailers',
        description: 'Manage retailers',
        isComingSoon: true,
    },
    {
        area: 'Tracking Dashboard',
        icon: PackageSearch,
        href: '/distributor/dashboard',
        description: 'Full tracking view',
        isComingSoon: true,
    },
    {
        area: 'Notifications',
        icon: Bell,
        href: '/distributor/notifications',
        description: 'View alerts',
        isComingSoon: true,
    },
];

interface Props {
    name: string;
    companyName: string;
    stats: {
        pending_orders: number;
        total_retailers: number;
        in_transit: number;
    };
}

export default function DistributorHome({ name, companyName, stats }: Props) {
    return (
        <GuestLayout>
            <Head title="Distributor Portal" />
            <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-blue-950 dark:via-slate-900 dark:to-blue-900 overflow-x-hidden">
                {/* Header */}
                <div className="text-center mb-6 md:mb-8">
                    <h1 className="text-xl md:text-2xl font-bold text-primary mb-1 tracking-wider">DISTRIBUTOR PORTAL</h1>
                    <p className="text-muted-foreground text-xs md:text-sm">{companyName} • {name}</p>
                </div>

                {/* Cards Container */}
                <div className="flex flex-col justify-center gap-3 md:gap-6 w-full max-w-5xl mx-auto pb-24 md:pb-28 px-3 md:px-4">
                    {/* Mobile Layout - Multiple rows x 2 cols */}
                    <div className="flex flex-col gap-3 md:hidden">
                        {/* Row 1 */}
                        <div className="grid grid-cols-2 gap-2">
                            {distributorSections.slice(0, 2).map((section) => {
                                const Icon = section.icon;
                                if (section.isComingSoon) {
                                    return (
                                        <div
                                            key={section.area}
                                            className="flex h-20 w-full flex-col items-center justify-center rounded-xl bg-white/90 p-2 text-center shadow-lg backdrop-blur-sm border border-white/50 opacity-50"
                                        >
                                            <p className="font-medium text-[9px] text-muted-foreground">Coming Soon</p>
                                        </div>
                                    );
                                }
                                return (
                                    <Link
                                        key={section.area}
                                        href={section.href}
                                        className="group flex h-20 w-full flex-col items-center justify-center rounded-xl bg-white/90 p-2 text-center shadow-lg backdrop-blur-sm border border-white/50 transition-all duration-300 hover:scale-105 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] hover:bg-white cursor-pointer"
                                    >
                                        <div className="transform transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1">
                                            <Icon className="mb-1 h-4 w-4 text-primary" />
                                        </div>
                                        <p className="font-medium text-[9px] group-hover:text-primary/80 transition-colors duration-300 text-center leading-tight">{section.area}</p>
                                        <div className="mt-1 opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                                            <span className="text-[8px] text-muted-foreground flex items-center gap-0.5">
                                                Click
                                                <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Row 2 */}
                        <div className="grid grid-cols-2 gap-2">
                            {distributorSections.slice(2, 4).map((section) => {
                                const Icon = section.icon;
                                if (section.isComingSoon) {
                                    return (
                                        <div
                                            key={section.area}
                                            className="flex h-20 w-full flex-col items-center justify-center rounded-xl bg-white/90 p-2 text-center shadow-lg backdrop-blur-sm border border-white/50 opacity-50"
                                        >
                                            <p className="font-medium text-[9px] text-muted-foreground">Coming Soon</p>
                                        </div>
                                    );
                                }
                                return (
                                    <Link
                                        key={section.area}
                                        href={section.href}
                                        className="group flex h-20 w-full flex-col items-center justify-center rounded-xl bg-white/90 p-2 text-center shadow-lg backdrop-blur-sm border border-white/50 transition-all duration-300 hover:scale-105 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] hover:bg-white cursor-pointer"
                                    >
                                        <div className="transform transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1">
                                            <Icon className="mb-1 h-4 w-4 text-primary" />
                                        </div>
                                        <p className="font-medium text-[9px] group-hover:text-primary/80 transition-colors duration-300 text-center leading-tight">{section.area}</p>
                                        <div className="mt-1 opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                                            <span className="text-[8px] text-muted-foreground flex items-center gap-0.5">
                                                Click
                                                <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Row 3 */}
                        <div className="grid grid-cols-2 gap-2">
                            {distributorSections.slice(4, 6).map((section) => {
                                const Icon = section.icon;
                                if (section.isComingSoon) {
                                    return (
                                        <div
                                            key={section.area}
                                            className="flex h-20 w-full flex-col items-center justify-center rounded-xl bg-white/90 p-2 text-center shadow-lg backdrop-blur-sm border border-white/50 opacity-50"
                                        >
                                            <p className="font-medium text-[9px] text-muted-foreground">Coming Soon</p>
                                        </div>
                                    );
                                }
                                return (
                                    <Link
                                        key={section.area}
                                        href={section.href}
                                        className="group flex h-20 w-full flex-col items-center justify-center rounded-xl bg-white/90 p-2 text-center shadow-lg backdrop-blur-sm border border-white/50 transition-all duration-300 hover:scale-105 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] hover:bg-white cursor-pointer"
                                    >
                                        <div className="transform transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1">
                                            <Icon className="mb-1 h-4 w-4 text-primary" />
                                        </div>
                                        <p className="font-medium text-[9px] group-hover:text-primary/80 transition-colors duration-300 text-center leading-tight">{section.area}</p>
                                        <div className="mt-1 opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                                            <span className="text-[8px] text-muted-foreground flex items-center gap-0.5">
                                                Click
                                                <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Row 4 */}
                        <div className="grid grid-cols-2 gap-2">
                            {distributorSections.slice(6, 8).map((section) => {
                                const Icon = section.icon;
                                if (section.isComingSoon) {
                                    return (
                                        <div
                                            key={section.area}
                                            className="flex h-20 w-full flex-col items-center justify-center rounded-xl bg-white/90 p-2 text-center shadow-lg backdrop-blur-sm border border-white/50 opacity-50"
                                        >
                                            <p className="font-medium text-[9px] text-muted-foreground">Coming Soon</p>
                                        </div>
                                    );
                                }
                                return (
                                    <Link
                                        key={section.area}
                                        href={section.href}
                                        className="group flex h-20 w-full flex-col items-center justify-center rounded-xl bg-white/90 p-2 text-center shadow-lg backdrop-blur-sm border border-white/50 transition-all duration-300 hover:scale-105 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] hover:bg-white cursor-pointer"
                                    >
                                        <div className="transform transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1">
                                            <Icon className="mb-1 h-4 w-4 text-primary" />
                                        </div>
                                        <p className="font-medium text-[9px] group-hover:text-primary/80 transition-colors duration-300 text-center leading-tight">{section.area}</p>
                                        <div className="mt-1 opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                                            <span className="text-[8px] text-muted-foreground flex items-center gap-0.5">
                                                Click
                                                <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Desktop Layout - 2 rows x 4 cols */}
                    <div className="hidden md:flex flex-col gap-6">
                        {/* Row 1 */}
                        <div className="grid gap-6 md:grid-cols-4">
                            {distributorSections.slice(0, 4).map((section) => {
                                const Icon = section.icon;
                                if (section.isComingSoon) {
                                    return (
                                        <div
                                            key={section.area}
                                            className="flex h-48 w-full flex-col items-center justify-center rounded-3xl bg-white/90 p-6 text-center shadow-2xl backdrop-blur-sm border border-white/50 opacity-50"
                                        >
                                            <p className="font-medium text-lg text-muted-foreground">Coming Soon</p>
                                        </div>
                                    );
                                }
                                return (
                                    <Link
                                        key={section.area}
                                        href={section.href}
                                        className="group flex h-48 w-full flex-col items-center justify-center rounded-3xl bg-white/90 p-6 text-center shadow-2xl backdrop-blur-sm border border-white/50 transition-all duration-300 hover:scale-105 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] hover:bg-white cursor-pointer"
                                    >
                                        <div className="transform transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-2">
                                            <Icon className="mb-3 h-10 w-10 text-primary" />
                                        </div>
                                        <p className="font-medium text-lg group-hover:text-primary/80 transition-colors duration-300 text-center">{section.area}</p>
                                        <p className="text-xs text-muted-foreground mt-1 text-center">{section.description}</p>
                                        <div className="mt-3 opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                                            <span className="text-xs text-muted-foreground flex items-center gap-2">
                                                Click to view
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Row 2 */}
                        <div className="grid gap-6 md:grid-cols-4">
                            {distributorSections.slice(4, 8).map((section) => {
                                const Icon = section.icon;
                                if (section.isComingSoon) {
                                    return (
                                        <div
                                            key={section.area}
                                            className="flex h-48 w-full flex-col items-center justify-center rounded-3xl bg-white/90 p-6 text-center shadow-2xl backdrop-blur-sm border border-white/50 opacity-50"
                                        >
                                            <p className="font-medium text-lg text-muted-foreground">Coming Soon</p>
                                        </div>
                                    );
                                }
                                return (
                                    <Link
                                        key={section.area}
                                        href={section.href}
                                        className="group flex h-48 w-full flex-col items-center justify-center rounded-3xl bg-white/90 p-6 text-center shadow-2xl backdrop-blur-sm border border-white/50 transition-all duration-300 hover:scale-105 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] hover:bg-white cursor-pointer"
                                    >
                                        <div className="transform transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-2">
                                            <Icon className="mb-3 h-10 w-10 text-primary" />
                                        </div>
                                        <p className="font-medium text-lg group-hover:text-primary/80 transition-colors duration-300 text-center">{section.area}</p>
                                        <p className="text-xs text-muted-foreground mt-1 text-center">{section.description}</p>
                                        <div className="mt-3 opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                                            <span className="text-xs text-muted-foreground flex items-center gap-2">
                                                Click to view
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
