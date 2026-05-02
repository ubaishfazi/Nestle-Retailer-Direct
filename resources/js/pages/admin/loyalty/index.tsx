import { Head, Link } from '@inertiajs/react';
import {
    Trophy,
    Users,
    TrendingUp,
    ArrowUp,
    DollarSign,
    ArrowLeft,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

interface Tier {
    id: number;
    name: string;
    color: string;
    min_points: number;
    max_points: number | null;
    discount: string;
    discount_type: string;
    discount_value: number;
    max_discount_amount: number | null;
    description: string;
    benefits: string;
    user_count: number;
}

interface Stats {
    total_retailers: number;
    retailers_with_tier: number;
    retailers_without_tier: number;
    tier_distribution: Array<{
        tier_name: string;
        tier_color: string;
        user_count: number;
    }>;
    total_points_issued: number;
}

interface Props {
    tiers: Tier[];
    stats: Stats;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
    },
    {
        title: 'Loyalty Program',
        href: '/loyalty',
    },
];

export default function AdminLoyaltyIndex({ tiers, stats }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Loyalty Program Management" />
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <Link
                                href={dashboard()}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                            <h1 className="text-3xl font-bold tracking-tight">
                                Loyalty Program
                            </h1>
                        </div>
                        <p className="text-muted-foreground">
                            Manage loyalty tiers and view program statistics
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Retailers
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.total_retailers}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {stats.retailers_with_tier} in loyalty program
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                In Loyalty Program
                            </CardTitle>
                            <Trophy className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-600">
                                {stats.retailers_with_tier}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {stats.retailers_without_tier} not yet enrolled
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Points Issued
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600">
                                {stats.total_points_issued.toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Across all retailers
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Active Tiers
                            </CardTitle>
                            <ArrowUp className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">
                                {tiers.length}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Loyalty levels available
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Tier Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Tier Distribution</CardTitle>
                        <CardDescription>
                            Number of retailers in each loyalty tier
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats.tier_distribution.map((tier, index) => {
                                const percentage = stats.retailers_with_tier > 0
                                    ? (tier.user_count / stats.retailers_with_tier) * 100
                                    : 0;
                                return (
                                    <div key={index} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="h-3 w-3 rounded-full"
                                                    style={{ backgroundColor: tier.tier_color }}
                                                />
                                                <span className="font-medium">{tier.tier_name}</span>
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {tier.user_count} retailers ({percentage.toFixed(1)}%)
                                            </div>
                                        </div>
                                        <Progress value={percentage} className="h-2" />
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Loyalty Tiers Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Loyalty Tiers</CardTitle>
                        <CardDescription>
                            Configure rewards and thresholds for each tier
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="px-4 py-3 text-left font-medium">Tier</th>
                                        <th className="px-4 py-3 text-left font-medium">Points Required</th>
                                        <th className="px-4 py-3 text-left font-medium">Discount</th>
                                        <th className="px-4 py-3 text-left font-medium">Members</th>
                                        <th className="px-4 py-3 text-left font-medium">Benefits</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tiers.map((tier) => (
                                        <tr key={tier.id} className="border-b hover:bg-muted/50">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="flex h-8 w-8 items-center justify-center rounded-full text-white text-xs font-bold"
                                                        style={{ backgroundColor: tier.color }}
                                                    >
                                                        {tier.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">{tier.name}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {tier.description}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="text-sm">
                                                    {tier.min_points.toLocaleString()} -{' '}
                                                    {tier.max_points ? tier.max_points.toLocaleString() : '∞'}{' '}
                                                    points
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge
                                                    variant="secondary"
                                                    className="bg-emerald-100 text-emerald-800"
                                                >
                                                    {tier.discount}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="text-sm font-medium">
                                                    {tier.user_count}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="max-w-xs text-sm text-muted-foreground">
                                                    {tier.benefits.length > 80
                                                        ? tier.benefits.substring(0, 80) + '...'
                                                        : tier.benefits}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* How Points Work */}
                <Card>
                    <CardHeader>
                        <CardTitle>How Loyalty Points Work</CardTitle>
                        <CardDescription>
                            Understanding the loyalty program mechanics
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="rounded-lg border bg-muted/30 p-4">
                                <div className="mb-2 flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                                        <span className="text-sm font-bold text-blue-600">1</span>
                                    </div>
                                    <h4 className="font-medium">Earn Points</h4>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Retailers earn 1 point for every LKR 100 spent on approved orders.
                                </p>
                            </div>
                            <div className="rounded-lg border bg-muted/30 p-4">
                                <div className="mb-2 flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100">
                                        <span className="text-sm font-bold text-amber-600">2</span>
                                    </div>
                                    <h4 className="font-medium">Unlock Tiers</h4>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    As points accumulate, retailers automatically advance to higher tiers.
                                </p>
                            </div>
                            <div className="rounded-lg border bg-muted/30 p-4">
                                <div className="mb-2 flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                                        <span className="text-sm font-bold text-emerald-600">3</span>
                                    </div>
                                    <h4 className="font-medium">Get Rewards</h4>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Higher tiers receive better automatic discounts on every order.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}