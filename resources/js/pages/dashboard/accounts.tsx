import { Head } from '@inertiajs/react';
import { Users, Mail, Calendar, UserCheck } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
    },
    {
        title: 'Accounts',
        href: '/dashboard/accounts',
    },
];

interface Account {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
    created_date: string;
}

interface Props {
    accounts: Account[];
    stats: {
        total_accounts: number;
    };
}

export default function Accounts({ accounts, stats }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Accounts" />

            <div className="flex flex-col gap-6 p-6">
                {/* Page Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Accounts
                    </h1>
                    <p className="mt-1 text-muted-foreground">
                        View all registered retailer accounts
                    </p>
                </div>

                {/* Stats Card */}
                <div className="grid gap-4 md:grid-cols-1">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Registered Accounts
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.total_accounts}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Active retailer accounts
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Accounts Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Registered Retailers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {accounts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Users className="mb-4 h-12 w-12 text-muted-foreground" />
                                <h3 className="text-lg font-semibold">
                                    No accounts yet
                                </h3>
                                <p className="text-muted-foreground">
                                    Registered users will appear here
                                </p>
                            </div>
                        ) : (
                            <div className="rounded-md border">
                                <div className="w-full overflow-auto">
                                    <table className="w-full">
                                        <thead className="bg-muted/50">
                                            <tr>
                                                <th className="p-4 text-left font-medium">
                                                    User
                                                </th>
                                                <th className="p-4 text-left font-medium">
                                                    Email
                                                </th>
                                                <th className="p-4 text-left font-medium">
                                                    Role
                                                </th>
                                                <th className="p-4 text-left font-medium">
                                                    Registered
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {accounts.map((account) => (
                                                <tr
                                                    key={account.id}
                                                    className="hover:bg-muted/30"
                                                >
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#00447C] to-[#003d6f] font-semibold text-white">
                                                                {account.name
                                                                    .charAt(0)
                                                                    .toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <div className="font-medium">
                                                                    {
                                                                        account.name
                                                                    }
                                                                </div>
                                                                <div className="text-xs text-muted-foreground">
                                                                    ID: #
                                                                    {account.id}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-1.5 text-sm">
                                                            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                                            {account.email}
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-1.5">
                                                            <UserCheck className="h-4 w-4 text-muted-foreground" />
                                                            <span className="text-sm capitalize">
                                                                {account.role}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                            <Calendar className="h-3.5 w-3.5" />
                                                            <div>
                                                                <div>
                                                                    {
                                                                        account.created_at
                                                                    }
                                                                </div>
                                                                <div className="text-xs">
                                                                    {
                                                                        account.created_date
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
