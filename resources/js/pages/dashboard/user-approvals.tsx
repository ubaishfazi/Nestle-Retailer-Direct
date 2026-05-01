import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    User,
    CheckCircle,
    XCircle,
    AlertCircle,
    Sparkles,
    Store,
    Building2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'User Approvals',
        href: '/dashboard/user-approvals',
    },
];

interface Profile {
    id: number;
    shop_name?: string;
    company_name?: string;
    shop_address?: string;
    company_address?: string;
    shop_city?: string;
    company_city?: string;
    shop_phone?: string;
    company_phone?: string;
}

interface UserData {
    id: number;
    name: string;
    email: string;
    role: string;
    approval_status: string;
    created_at: string;
    profile: Profile | null;
}

interface Props {
    allUsers: UserData[];
    pendingUsers: UserData[];
    approvedUsers: UserData[];
    rejectedUsers: UserData[];
    stats: {
        total_users: number;
        pending_users: number;
        approved_users: number;
        rejected_users: number;
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
        default:
            return 'bg-gray-500 text-white';
    }
}

export default function UserApprovals({
    allUsers = [],
    stats = {
        total_users: 0,
        pending_users: 0,
        approved_users: 0,
        rejected_users: 0,
    },
}: Props) {
    const { toast } = useToast();
    const [filter, setFilter] = useState('all');

    const handleApprove = (userId: number) => {
        router.post(
            `/dashboard/user-approvals/${userId}/approve`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast({
                        title: 'User approved!',
                        description: 'The user account has been approved.',
                    });
                },
                onError: () => {
                    toast({
                        title: 'Failed to approve',
                        description: 'There was an error approving the user.',
                        variant: 'destructive',
                    });
                },
            },
        );
    };

    const handleReject = (userId: number) => {
        router.post(
            `/dashboard/user-approvals/${userId}/reject`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast({
                        title: 'User rejected',
                        description: 'The user account has been rejected.',
                    });
                },
                onError: () => {
                    toast({
                        title: 'Failed to reject',
                        description: 'There was an error rejecting the user.',
                        variant: 'destructive',
                    });
                },
            },
        );
    };

    const filteredUsers =
        filter === 'all'
            ? allUsers
            : allUsers.filter((u) => u.approval_status === filter);
    const pendingUsers = filteredUsers.filter(
        (u) => u.approval_status === 'pending',
    );
    const otherUsers = filteredUsers.filter(
        (u) => u.approval_status !== 'pending',
    );

    const UserCard = ({
        user,
        showActions = false,
    }: {
        user: UserData;
        showActions?: boolean;
    }) => (
        <div
            className={`group relative overflow-hidden rounded-xl border shadow-sm transition-all duration-300 hover:shadow-md ${
                user.approval_status === 'pending'
                    ? 'border-amber-200/50 bg-gradient-to-br from-amber-50/50 to-amber-100/30'
                    : user.approval_status === 'approved'
                      ? 'border-emerald-200/50 bg-gradient-to-br from-emerald-50/50 to-emerald-100/30'
                      : 'border-red-200/50 bg-gradient-to-br from-red-50/50 to-red-100/30'
            }`}
        >
            <div
                className={`h-0.5 bg-gradient-to-r ${
                    user.approval_status === 'pending'
                        ? 'from-amber-400 via-amber-500 to-amber-600'
                        : user.approval_status === 'approved'
                          ? 'from-emerald-400 via-emerald-500 to-emerald-600'
                          : 'from-red-400 via-red-500 to-red-600'
                }`}
            ></div>
            <div className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-1 items-center gap-3">
                        <div
                            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg font-bold text-white sm:h-11 sm:w-11 ${
                                user.role === 'retailer'
                                    ? 'bg-gradient-to-br from-blue-400 to-blue-600'
                                    : 'bg-gradient-to-br from-purple-400 to-purple-600'
                            }`}
                        >
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="truncate font-semibold text-slate-900">
                                    {user.name}
                                </div>
                                <Badge
                                    variant={
                                        user.role === 'retailer'
                                            ? 'default'
                                            : 'secondary'
                                    }
                                    className="text-xs"
                                >
                                    {user.role}
                                </Badge>
                            </div>
                            <div className="truncate text-xs text-slate-600">
                                {user.email}
                            </div>
                            <div className="mt-1 space-y-0.5 text-xs text-slate-500">
                                {user.profile && (
                                    <>
                                        {user.role === 'retailer' &&
                                            user.profile.shop_name && (
                                                <div className="flex items-center gap-1">
                                                    <Store className="h-3 w-3" />
                                                    <span className="truncate">
                                                        {user.profile.shop_name}
                                                    </span>
                                                </div>
                                            )}
                                        {user.role === 'distributor' &&
                                            user.profile.company_name && (
                                                <div className="flex items-center gap-1">
                                                    <Building2 className="h-3 w-3" />
                                                    <span className="truncate">
                                                        {
                                                            user.profile
                                                                .company_name
                                                        }
                                                    </span>
                                                </div>
                                            )}
                                        {user.profile.shop_city ||
                                        user.profile.company_city ? (
                                            <div className="flex items-center gap-1">
                                                <svg
                                                    className="h-3 w-3"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                                    />
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                                    />
                                                </svg>
                                                <span className="truncate">
                                                    {user.profile.shop_city ||
                                                        user.profile
                                                            .company_city}
                                                </span>
                                            </div>
                                        ) : null}
                                        {user.profile.shop_phone ||
                                        user.profile.company_phone ? (
                                            <div className="flex items-center gap-1">
                                                <svg
                                                    className="h-3 w-3"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                                    />
                                                </svg>
                                                <span>
                                                    {user.profile.shop_phone ||
                                                        user.profile
                                                            .company_phone}
                                                </span>
                                            </div>
                                        ) : null}
                                    </>
                                )}
                                <div className="flex items-center gap-1 pt-0.5">
                                    <svg
                                        className="h-3 w-3"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    <span>{user.created_at}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-3">
                        <Badge
                            className={getStatusBadgeClass(
                                user.approval_status,
                            )}
                        >
                            {user.approval_status.charAt(0).toUpperCase() +
                                user.approval_status.slice(1)}
                        </Badge>
                        {showActions && (
                            <div className="flex flex-shrink-0 gap-1.5">
                                <Button
                                    onClick={() => handleReject(user.id)}
                                    variant="outline"
                                    size="sm"
                                    className="h-8 border-red-200 text-red-600 transition-all duration-300 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                                >
                                    <XCircle className="h-3.5 w-3.5" />
                                    <span className="ml-1 hidden sm:inline">
                                        Reject
                                    </span>
                                </Button>
                                <Button
                                    onClick={() => handleApprove(user.id)}
                                    size="sm"
                                    className="h-8 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md transition-all duration-300 hover:from-emerald-600 hover:to-emerald-700 hover:shadow-lg"
                                >
                                    <CheckCircle className="h-3.5 w-3.5" />
                                    <span className="ml-1 hidden sm:inline">
                                        Approve
                                    </span>
                                    <span className="ml-1 sm:hidden">OK</span>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Approvals" />

            <div className="flex min-h-screen items-start justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 px-3 py-4 md:py-8">
                {/* Decorative Background Elements */}
                <div className="pointer-events-none fixed inset-0 overflow-hidden">
                    <div className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-[#00447C]/5 blur-3xl md:h-96 md:w-96"></div>
                    <div className="absolute right-1/4 bottom-0 h-64 w-64 rounded-full bg-blue-400/5 blur-3xl md:h-80 md:w-80"></div>
                    <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-[#00447C]/3 via-transparent to-transparent blur-3xl md:h-[800px] md:w-[800px]"></div>
                </div>

                {/* Main Container */}
                <div className="relative mx-auto w-full max-w-5xl">
                    {/* Header */}
                    <header className="relative sticky top-0 z-50 rounded-t-2xl border border-slate-200/50 bg-white/80 backdrop-blur-xl">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#00447C]/5 via-transparent to-[#00447C]/5"></div>
                        <div className="relative px-4 py-4 md:px-6">
                            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                                <div className="flex items-center gap-3">
                                    <div className="relative flex-shrink-0">
                                        <div className="absolute inset-0 rounded-xl bg-[#00447C]/20 blur-md"></div>
                                        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#00447C] to-[#003d6f] shadow-lg md:h-11 md:w-11">
                                            <User className="h-4 w-4 text-white md:h-5 md:w-5" />
                                        </div>
                                    </div>
                                    <div className="min-w-0">
                                        <h1 className="truncate text-lg font-bold tracking-tight text-slate-900 md:text-xl">
                                            User Approvals
                                        </h1>
                                        <p className="hidden text-xs font-medium text-slate-500 sm:block">
                                            Review and manage user registrations
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
                                    <div className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1.5 sm:gap-2 md:px-3">
                                        <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                                        <span className="text-xs font-semibold whitespace-nowrap text-amber-700 sm:text-sm">
                                            {stats.pending_users} Pending
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Content */}
                    <main className="relative border-x border-slate-200/50 bg-white/60 px-4 py-6 pb-40 backdrop-blur-sm md:px-6 md:py-8">
                        <div className="flex flex-col gap-6 md:gap-8">
                            {/* Stats Cards */}
                            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
                                <div className="group relative">
                                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 opacity-20 blur-lg transition-opacity group-hover:opacity-30 md:rounded-2xl"></div>
                                    <div className="relative rounded-xl border border-slate-200/50 bg-white p-3 shadow-sm transition-shadow hover:shadow-md md:rounded-2xl md:p-5">
                                        <div className="mb-2 flex items-center justify-between md:mb-3">
                                            <span className="text-[10px] font-semibold tracking-wide text-slate-500 uppercase md:text-xs">
                                                Total
                                            </span>
                                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 md:h-9 md:w-9">
                                                <User className="h-3.5 w-3.5 text-white md:h-4 md:w-4" />
                                            </div>
                                        </div>
                                        <div className="bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-2xl font-bold text-transparent md:text-4xl">
                                            {stats.total_users}
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
                                                <AlertCircle className="h-3.5 w-3.5 text-white md:h-4 md:w-4" />
                                            </div>
                                        </div>
                                        <div className="bg-gradient-to-br from-amber-600 to-amber-500 bg-clip-text text-2xl font-bold text-transparent md:text-4xl">
                                            {stats.pending_users}
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
                                        <div className="bg-gradient-to-br from-emerald-600 to-emerald-500 bg-clip-text text-2xl font-bold text-transparent md:text-4xl">
                                            {stats.approved_users}
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
                                        <div className="bg-gradient-to-br from-red-600 to-red-500 bg-clip-text text-2xl font-bold text-transparent md:text-4xl">
                                            {stats.rejected_users}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Filter Tabs - Scrollable on mobile */}
                            <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
                                <div className="flex w-fit min-w-max gap-2 rounded-xl border border-slate-200/50 bg-white p-1.5 shadow-sm">
                                    {[
                                        'all',
                                        'pending',
                                        'approved',
                                        'rejected',
                                    ].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => setFilter(status)}
                                            className={`rounded-lg px-3 py-2 text-xs font-medium whitespace-nowrap transition-all duration-300 md:px-4 md:text-sm ${
                                                filter === status
                                                    ? 'bg-gradient-to-r from-[#00447C] to-[#003d6f] text-white shadow-md'
                                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                            }`}
                                        >
                                            {status.charAt(0).toUpperCase() +
                                                status.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Pending Users Section */}
                            {pendingUsers.length > 0 ? (
                                <div className="relative">
                                    <div className="absolute top-0 bottom-0 -left-4 hidden w-1 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 md:block"></div>
                                    <div className="mb-4 flex flex-col gap-2 pl-0 sm:mb-6 sm:flex-row sm:items-center sm:gap-3 sm:pl-4">
                                        <div className="relative flex-shrink-0">
                                            <div className="absolute inset-0 rounded-full bg-amber-400/30 blur-md"></div>
                                            <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 sm:h-10 sm:w-10">
                                                <AlertCircle className="h-4 w-4 text-white sm:h-5 sm:w-5" />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h2 className="text-base font-bold text-slate-900 sm:text-lg">
                                                Pending Approval
                                            </h2>
                                            <p className="text-xs font-medium text-slate-500">
                                                Requires your attention
                                            </p>
                                        </div>
                                        <Badge className="self-start bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md sm:self-center">
                                            <Sparkles className="mr-1 h-3 w-3" />
                                            {pendingUsers.length}
                                        </Badge>
                                    </div>
                                    <div className="grid gap-3 md:gap-4">
                                        {pendingUsers.map((user, index) => (
                                            <UserCard
                                                key={user.id}
                                                user={user}
                                                showActions
                                            />
                                        ))}
                                    </div>
                                </div>
                            ) : filter === 'pending' ? (
                                <div className="relative overflow-hidden rounded-2xl border border-slate-200/50 bg-white shadow-sm">
                                    <div className="absolute inset-0 bg-gradient-to-br from-amber-50/30 to-transparent"></div>
                                    <div className="relative flex flex-col items-center justify-center px-6 py-16 text-center">
                                        <div className="relative mb-6">
                                            <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-xl"></div>
                                            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-amber-200">
                                                <AlertCircle className="h-10 w-10 text-amber-400" />
                                            </div>
                                        </div>
                                        <h3 className="mb-2 text-xl font-bold text-slate-900">
                                            No pending users
                                        </h3>
                                        <p className="max-w-sm text-slate-500">
                                            There are no users awaiting your
                                            approval at the moment.
                                        </p>
                                    </div>
                                </div>
                            ) : null}

                            {/* Other Users Section */}
                            {otherUsers.length > 0 ? (
                                <div className="mt-4">
                                    <div className="mb-4 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-center sm:gap-3">
                                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-400 to-slate-600 sm:h-10 sm:w-10">
                                            <User className="h-4 w-4 text-white sm:h-5 sm:w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <h2 className="text-base font-bold text-slate-900 sm:text-lg">
                                                Processed Users
                                            </h2>
                                            <p className="text-xs font-medium text-slate-500">
                                                Completed decisions
                                            </p>
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className="flex-shrink-0 self-start sm:self-center"
                                        >
                                            {otherUsers.length}
                                        </Badge>
                                    </div>

                                    <div className="grid gap-3">
                                        {otherUsers.map((user) => (
                                            <UserCard
                                                key={user.id}
                                                user={user}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ) : filter === 'approved' ||
                              filter === 'rejected' ? (
                                <div className="relative mt-4 overflow-hidden rounded-2xl border border-slate-200/50 bg-white shadow-sm">
                                    <div
                                        className={`absolute inset-0 bg-gradient-to-br to-transparent ${
                                            filter === 'approved'
                                                ? 'from-emerald-50/30'
                                                : 'from-red-50/30'
                                        }`}
                                    ></div>
                                    <div className="relative flex flex-col items-center justify-center px-6 py-12 text-center md:py-16">
                                        <div className="relative mb-4 md:mb-6">
                                            <div
                                                className={`absolute inset-0 rounded-full blur-xl ${
                                                    filter === 'approved'
                                                        ? 'bg-emerald-400/20'
                                                        : 'bg-red-400/20'
                                                }`}
                                            ></div>
                                            <div
                                                className={`relative flex h-16 w-16 items-center justify-center rounded-full md:h-20 md:w-20 ${
                                                    filter === 'approved'
                                                        ? 'bg-gradient-to-br from-emerald-100 to-emerald-200'
                                                        : 'bg-gradient-to-br from-red-100 to-red-200'
                                                }`}
                                            >
                                                {filter === 'approved' ? (
                                                    <CheckCircle className="h-8 w-8 text-emerald-400 md:h-10 md:w-10" />
                                                ) : (
                                                    <XCircle className="h-8 w-8 text-red-400 md:h-10 md:w-10" />
                                                )}
                                            </div>
                                        </div>
                                        <h3 className="mb-2 text-lg font-bold text-slate-900 md:text-xl">
                                            No {filter} users
                                        </h3>
                                        <p className="max-w-sm px-4 text-sm text-slate-500 md:text-base">
                                            {filter === 'approved'
                                                ? 'There are no approved users yet.'
                                                : 'There are no rejected users yet.'}
                                        </p>
                                    </div>
                                </div>
                            ) : null}

                            {/* Empty State for All Filter */}
                            {filter === 'all' && filteredUsers.length === 0 && (
                                <div className="relative overflow-hidden rounded-2xl border border-slate-200/50 bg-white shadow-sm">
                                    <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 to-transparent"></div>
                                    <div className="relative flex flex-col items-center justify-center px-6 py-12 text-center md:py-16">
                                        <div className="relative mb-4 md:mb-6">
                                            <div className="absolute inset-0 rounded-full bg-slate-400/20 blur-xl"></div>
                                            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-300 md:h-20 md:w-20">
                                                <User className="h-8 w-8 text-slate-400 md:h-10 md:w-10" />
                                            </div>
                                        </div>
                                        <h3 className="mb-2 text-lg font-bold text-slate-900 md:text-xl">
                                            No users yet
                                        </h3>
                                        <p className="max-w-sm px-4 text-sm text-slate-500 md:text-base">
                                            There are no user registrations in
                                            the system yet.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </main>

                    {/* Footer border */}
                    <div className="relative h-2 rounded-b-2xl border-t border-slate-200/50 bg-white/80 backdrop-blur-xl"></div>
                </div>
            </div>
        </AppLayout>
    );
}
