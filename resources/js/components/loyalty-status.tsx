import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Gift, ArrowUp, Sparkles } from 'lucide-react';
import { usePage } from '@inertiajs/react';

interface LoyaltyStatusProps {
    compact?: boolean;
}

export default function LoyaltyStatus({ compact = false }: LoyaltyStatusProps) {
    const { loyalty } = usePage<{ loyalty: any }>().props;

    if (!loyalty) {
        return null;
    }

    if (compact) {
        return (
            <div className="flex items-center gap-2 rounded-lg border bg-gradient-to-r from-amber-50 to-orange-50 p-3">
                {loyalty.has_tier ? (
                    <>
                        <div
                            className="flex h-8 w-8 items-center justify-center rounded-full text-white"
                            style={{ backgroundColor: loyalty.tier.color }}
                        >
                            <Trophy className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                            <div className="text-xs font-medium" style={{ color: loyalty.tier.color }}>
                                {loyalty.tier.name} Member
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                                {loyalty.tier.discount} cashback
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200">
                            <Star className="h-4 w-4 text-slate-500" />
                        </div>
                        <div className="flex-1">
                            <div className="text-xs font-medium text-slate-600">
                                {loyalty.points} points
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                                {loyalty.next_tier
                                    ? `${loyalty.next_tier.points_needed} more to ${loyalty.next_tier.name}`
                                    : 'Start earning points'}
                            </div>
                        </div>
                    </>
                )}
            </div>
        );
    }

    // Full loyalty status card
    if (!loyalty.has_tier && loyalty.points === 0) {
        return (
            <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-800">
                        <Sparkles className="h-5 w-5" />
                        Loyalty Program
                    </CardTitle>
                    <CardDescription className="text-amber-700">
                        Start earning points with every order to unlock exclusive rewards!
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-lg border border-amber-200 bg-white/60 p-4 text-center">
                        <p className="text-sm text-amber-800">
                            Place your first order to start earning loyalty points.
                            <br />
                            <span className="text-xs">1 point for every LKR 100 spent</span>
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!loyalty.has_tier && loyalty.points > 0) {
        return (
            <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-800">
                        <Star className="h-5 w-5" />
                        Almost There!
                    </CardTitle>
                    <CardDescription className="text-amber-700">
                        You're close to unlocking your first tier!
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-amber-800">Your Points</span>
                        <span className="text-2xl font-bold text-amber-600">{loyalty.points}</span>
                    </div>

                    {loyalty.next_tier && (
                        <>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-amber-700">
                                    {loyalty.next_tier.points_needed} more to{' '}
                                    <span className="font-semibold">{loyalty.next_tier.name}</span>
                                </span>
                                <span className="text-amber-600">{loyalty.next_tier.discount} discount</span>
                            </div>
                            <Progress
                                value={
                                    ((loyalty.points - (loyalty.next_tier.min_points - loyalty.next_tier.points_needed)) /
                                        loyalty.next_tier.points_needed) *
                                    100
                                }
                                className="h-2"
                            />
                        </>
                    )}
                </CardContent>
            </Card>
        );
    }

    // Has tier
    return (
        <Card
            className="overflow-hidden border"
            style={{ borderColor: loyalty.tier.color + '40', backgroundColor: loyalty.tier.color + '08' }}
        >
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div
                            className="flex h-12 w-12 items-center justify-center rounded-full text-white shadow-md"
                            style={{ backgroundColor: loyalty.tier.color }}
                        >
                            <Trophy className="h-6 w-6" />
                        </div>
                        <div>
                            <CardTitle
                                className="text-lg"
                                style={{ color: loyalty.tier.color }}
                            >
                                {loyalty.tier.name} Member
                            </CardTitle>
                            <CardDescription className="flex items-center gap-1">
                                <Gift className="h-3 w-3" />
                                {loyalty.tier.discount} discount on all orders
                            </CardDescription>
                        </div>
                    </div>
                    {loyalty.is_max_tier && (
                        <Badge
                            className="bg-gradient-to-r from-amber-400 to-orange-400 text-white"
                        >
                            <Sparkles className="mr-1 h-3 w-3" />
                            Top Tier
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg bg-white/60 p-3">
                    <div>
                        <div className="text-xs text-muted-foreground">Loyalty Points</div>
                        <div className="text-xl font-bold">{loyalty.points.toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-muted-foreground">Discount Applied</div>
                        <div className="text-lg font-semibold text-emerald-600">Automatic</div>
                    </div>
                </div>

                {!loyalty.is_max_tier && loyalty.next_tier && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                                <ArrowUp className="mr-1 inline h-3 w-3" />
                                {loyalty.next_tier.points_needed.toLocaleString()} points to next tier
                            </span>
                            <span className="font-medium" style={{ color: loyalty.tier.color }}>
                                {loyalty.next_tier.progress}%
                            </span>
                        </div>
                        <Progress value={loyalty.next_tier.progress} className="h-2" />
                    </div>
                )}

                {loyalty.is_max_tier && (
                    <div className="rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 p-3 text-center">
                        <p className="text-sm text-amber-800">
                            🎉 Congratulations! You've reached the highest tier!
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}