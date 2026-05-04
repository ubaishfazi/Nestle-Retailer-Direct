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
    FileText,
    Receipt,
} from 'lucide-react';

interface Props {
    name: string;
    companyName: string;
    stats: {
        pending_orders: number;
        total_retailers: number;
        in_transit: number;
    };
}

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
        area: 'Survey Responses',
        icon: FileText,
        href: '/distributor/surveys',
        description: 'View retailer responses',
        isComingSoon: false,
    },
    {
        area: 'Invoice',
        icon: Receipt,
        href: '/invoices',
        description: 'View invoices',
        isComingSoon: false,
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
            <div className="flex min-h-screen w-full flex-col items-center justify-center overflow-x-hidden bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-blue-950 dark:via-slate-900 dark:to-blue-900">
                {/* Header */}
                <div className="mb-6 text-center md:mb-8">
                    <h1 className="mb-1 text-xl font-bold tracking-wider text-primary md:text-2xl">
                        DISTRIBUTOR PORTAL
                    </h1>
                    <p className="text-xs text-muted-foreground md:text-sm">
                        {companyName} • {name}
                    </p>
                </div>

                {/* Cards Container */}
                <div className="mx-auto flex w-full max-w-5xl flex-col justify-center gap-3 px-3 pb-24 md:gap-6 md:px-4 md:pb-28">
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
                                            className="flex h-20 w-full flex-col items-center justify-center rounded-xl border border-white/50 bg-white/90 p-2 text-center opacity-50 shadow-lg backdrop-blur-sm"
                                        >
                                            <p className="text-[9px] font-medium text-muted-foreground">
                                                Coming Soon
                                            </p>
                                        </div>
                                    );
                                }
                                return (
                                    <Link
                                        key={section.area}
                                        href={section.href}
                                        className="group flex h-20 w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-white/50 bg-white/90 p-2 text-center shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)]"
                                    >
                                        <div className="transform transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-110">
                                            <Icon className="mb-1 h-4 w-4 text-primary" />
                                        </div>
                                        <p className="text-center text-[9px] leading-tight font-medium transition-colors duration-300 group-hover:text-primary/80">
                                            {section.area}
                                        </p>
                                        <div className="mt-1 translate-y-4 transform opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                                            <span className="flex items-center gap-0.5 text-[8px] text-muted-foreground">
                                                Click
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
                                            className="flex h-20 w-full flex-col items-center justify-center rounded-xl border border-white/50 bg-white/90 p-2 text-center opacity-50 shadow-lg backdrop-blur-sm"
                                        >
                                            <p className="text-[9px] font-medium text-muted-foreground">
                                                Coming Soon
                                            </p>
                                        </div>
                                    );
                                }
                                return (
                                    <Link
                                        key={section.area}
                                        href={section.href}
                                        className="group flex h-20 w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-white/50 bg-white/90 p-2 text-center shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)]"
                                    >
                                        <div className="transform transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-110">
                                            <Icon className="mb-1 h-4 w-4 text-primary" />
                                        </div>
                                        <p className="text-center text-[9px] leading-tight font-medium transition-colors duration-300 group-hover:text-primary/80">
                                            {section.area}
                                        </p>
                                        <div className="mt-1 translate-y-4 transform opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                                            <span className="flex items-center gap-0.5 text-[8px] text-muted-foreground">
                                                Click to view
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
                                            className="flex h-20 w-full flex-col items-center justify-center rounded-xl border border-white/50 bg-white/90 p-2 text-center opacity-50 shadow-lg backdrop-blur-sm"
                                        >
                                            <p className="text-[9px] font-medium text-muted-foreground">
                                                Coming Soon
                                            </p>
                                        </div>
                                    );
                                }
                                return (
                                    <Link
                                        key={section.area}
                                        href={section.href}
                                        className="group flex h-20 w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-white/50 bg-white/90 p-2 text-center shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)]"
                                    >
                                        <div className="transform transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-110">
                                            <Icon className="mb-1 h-4 w-4 text-primary" />
                                        </div>
                                        <p className="text-center text-[9px] leading-tight font-medium transition-colors duration-300 group-hover:text-primary/80">
                                            {section.area}
                                        </p>
                                        <div className="mt-1 translate-y-4 transform opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                                            <span className="flex items-center gap-0.5 text-[8px] text-muted-foreground">
                                                Click
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
                                            className="flex h-20 w-full flex-col items-center justify-center rounded-xl border border-white/50 bg-white/90 p-2 text-center opacity-50 shadow-lg backdrop-blur-sm"
                                        >
                                            <p className="text-[9px] font-medium text-muted-foreground">
                                                Coming Soon
                                            </p>
                                        </div>
                                    );
                                }
                                return (
                                    <Link
                                        key={section.area}
                                        href={section.href}
                                        className="group flex h-20 w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-white/50 bg-white/90 p-2 text-center shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)]"
                                    >
                                        <div className="transform transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-110">
                                            <Icon className="mb-1 h-4 w-4 text-primary" />
                                        </div>
                                        <p className="text-center text-[9px] leading-tight font-medium transition-colors duration-300 group-hover:text-primary/80">
                                            {section.area}
                                        </p>
                                        <div className="mt-1 translate-y-4 transform opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                                            <span className="flex items-center gap-0.5 text-[8px] text-muted-foreground">
                                                Click
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
                                );
                            })}
                        </div>
                    </div>

                    {/* Desktop Layout - 2 rows x 4 cols */}
                    <div className="hidden flex-col gap-6 md:flex">
                        {/* Row 1 */}
                        <div className="grid gap-6 md:grid-cols-4">
                            {distributorSections.slice(0, 4).map((section) => {
                                const Icon = section.icon;
                                if (section.isComingSoon) {
                                    return (
                                        <div
                                            key={section.area}
                                            className="flex h-48 w-full flex-col items-center justify-center rounded-3xl border border-white/50 bg-white/90 p-6 text-center opacity-50 shadow-2xl backdrop-blur-sm"
                                        >
                                            <p className="text-lg font-medium text-muted-foreground">
                                                Coming Soon
                                            </p>
                                        </div>
                                    );
                                }
                                return (
                                    <Link
                                        key={section.area}
                                        href={section.href}
                                        className="group flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-3xl border border-white/50 bg-white/90 p-6 text-center shadow-2xl backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)]"
                                    >
                                        <div className="transform transition-transform duration-300 group-hover:-translate-y-2 group-hover:scale-110">
                                            <Icon className="mb-3 h-10 w-10 text-primary" />
                                        </div>
                                        <p className="text-center text-lg font-medium transition-colors duration-300 group-hover:text-primary/80">
                                            {section.area}
                                        </p>
                                        <p className="mt-1 text-center text-xs text-muted-foreground">
                                            {section.description}
                                        </p>
                                        <div className="mt-3 translate-y-4 transform opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                                            <span className="flex items-center gap-2 text-xs text-muted-foreground">
                                                Click to view
                                                <svg
                                                    className="h-3.5 w-3.5"
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
                                            className="flex h-48 w-full flex-col items-center justify-center rounded-3xl border border-white/50 bg-white/90 p-6 text-center opacity-50 shadow-2xl backdrop-blur-sm"
                                        >
                                            <p className="text-lg font-medium text-muted-foreground">
                                                Coming Soon
                                            </p>
                                        </div>
                                    );
                                }
                                return (
                                    <Link
                                        key={section.area}
                                        href={section.href}
                                        className="group flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-3xl border border-white/50 bg-white/90 p-6 text-center shadow-2xl backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)]"
                                    >
                                        <div className="transform transition-transform duration-300 group-hover:-translate-y-2 group-hover:scale-110">
                                            <Icon className="mb-3 h-10 w-10 text-primary" />
                                        </div>
                                        <p className="text-center text-lg font-medium transition-colors duration-300 group-hover:text-primary/80">
                                            {section.area}
                                        </p>
                                        <p className="mt-1 text-center text-xs text-muted-foreground">
                                            {section.description}
                                        </p>
                                        <div className="mt-3 translate-y-4 transform opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                                            <span className="flex items-center gap-2 text-xs text-muted-foreground">
                                                Click to view
                                                <svg
                                                    className="h-3.5 w-3.5"
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
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
