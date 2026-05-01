import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import {
    Search,
    Package,
    AlertTriangle,
    Warehouse,
    TrendingUp,
    TrendingDown,
    Eye,
    EyeOff,
    ChevronLeft,
    HelpCircle,
    LayoutDashboard,
    Settings,
    User,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string;
    stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
    stock_quantity: number;
}

interface Stats {
    total_products: number;
    in_stock: number;
    low_stock: number;
    out_of_stock: number;
}

interface Props {
    products: Product[];
    stats: Stats;
}

function getStockStatusBadge(status: string): string {
    switch (status) {
        case 'in_stock':
            return 'bg-emerald-500 text-white';
        case 'low_stock':
            return 'bg-amber-500 text-white';
        case 'out_of_stock':
            return 'bg-red-500 text-white';
        default:
            return 'bg-gray-500 text-white';
    }
}

function getStockStatusLabel(status: string): string {
    switch (status) {
        case 'in_stock':
            return 'In Stock';
        case 'low_stock':
            return 'Low Stock';
        case 'out_of_stock':
            return 'Out of Stock';
        default:
            return status;
    }
}

export default function RetailerInventory({ products, stats }: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [stockFilter, setStockFilter] = useState<string>('all');
    const [showOutOfStock, setShowOutOfStock] = useState(true);

    const filteredProducts = products.filter((product) => {
        const matchesSearch =
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description
                .toLowerCase()
                .includes(searchQuery.toLowerCase());
        const matchesStockFilter =
            stockFilter === 'all' || product.stock_status === stockFilter;
        const shouldShowOutOfStock =
            showOutOfStock || product.stock_status !== 'out_of_stock';
        return matchesSearch && matchesStockFilter && shouldShowOutOfStock;
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
            <Head title="My Inventory" />

            {/* Decorative Background */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-[#00447C]/5 blur-3xl"></div>
                <div className="absolute right-1/4 bottom-0 h-64 w-64 rounded-full bg-blue-400/5 blur-3xl"></div>
            </div>

            {/* Header */}
            <header className="relative sticky top-0 z-50 border-b border-slate-200/50 bg-white/80 backdrop-blur-xl">
                <div className="absolute inset-0 bg-gradient-to-r from-[#00447C]/5 via-transparent to-[#00447C]/5"></div>
                <div className="relative px-4 py-4 md:px-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link href="/">
                                <div className="relative">
                                    <div className="absolute inset-0 rounded-lg bg-[#00447C]/20 opacity-0 blur-md transition-opacity hover:opacity-100"></div>
                                    <ChevronLeft className="relative h-6 w-6 text-[#00447C] transition-transform hover:scale-110" />
                                </div>
                            </Link>
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="absolute inset-0 rounded-xl bg-[#00447C]/20 blur-md"></div>
                                    <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#00447C] to-[#003d6f] shadow-lg">
                                        <Warehouse className="h-5 w-5 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h1 className="text-lg font-bold text-slate-900 md:text-xl">
                                        My Inventory
                                    </h1>
                                    <p className="text-xs font-medium text-slate-500">
                                        View your stock levels
                                    </p>
                                </div>
                            </div>
                        </div>
                        <button className="group">
                            <div className="relative">
                                <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 blur-md transition-opacity group-hover:opacity-100"></div>
                                <HelpCircle className="relative h-6 w-6 text-slate-400 transition-colors group-hover:text-slate-600" />
                            </div>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative border-x border-slate-200/50 bg-white/60 px-4 py-6 pb-40 backdrop-blur-sm md:px-6 md:py-8">
                <div className="mx-auto max-w-7xl space-y-6">
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
                                        <Package className="h-3.5 w-3.5 text-white md:h-4 md:w-4" />
                                    </div>
                                </div>
                                <div className="bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-2xl font-bold text-transparent md:text-4xl">
                                    {stats.total_products}
                                </div>
                            </div>
                        </div>
                        <div className="group relative">
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 opacity-20 blur-lg transition-opacity group-hover:opacity-30 md:rounded-2xl"></div>
                            <div className="relative rounded-xl border border-slate-200/50 bg-white p-3 shadow-sm transition-shadow hover:shadow-md md:rounded-2xl md:p-5">
                                <div className="mb-2 flex items-center justify-between md:mb-3">
                                    <span className="text-[10px] font-semibold tracking-wide text-slate-500 uppercase md:text-xs">
                                        In Stock
                                    </span>
                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 md:h-9 md:w-9">
                                        <TrendingUp className="h-3.5 w-3.5 text-white md:h-4 md:w-4" />
                                    </div>
                                </div>
                                <div className="bg-gradient-to-br from-emerald-600 to-emerald-500 bg-clip-text text-2xl font-bold text-transparent md:text-4xl">
                                    {stats.in_stock}
                                </div>
                            </div>
                        </div>
                        <div className="group relative">
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 opacity-20 blur-lg transition-opacity group-hover:opacity-30 md:rounded-2xl"></div>
                            <div className="relative rounded-xl border border-slate-200/50 bg-white p-3 shadow-sm transition-shadow hover:shadow-md md:rounded-2xl md:p-5">
                                <div className="mb-2 flex items-center justify-between md:mb-3">
                                    <span className="text-[10px] font-semibold tracking-wide text-slate-500 uppercase md:text-xs">
                                        Low Stock
                                    </span>
                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 md:h-9 md:w-9">
                                        <AlertTriangle className="h-3.5 w-3.5 text-white md:h-4 md:w-4" />
                                    </div>
                                </div>
                                <div className="bg-gradient-to-br from-amber-600 to-amber-500 bg-clip-text text-2xl font-bold text-transparent md:text-4xl">
                                    {stats.low_stock}
                                </div>
                            </div>
                        </div>
                        <div className="group relative">
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-red-500 to-red-600 opacity-20 blur-lg transition-opacity group-hover:opacity-30 md:rounded-2xl"></div>
                            <div className="relative rounded-xl border border-slate-200/50 bg-white p-3 shadow-sm transition-shadow hover:shadow-md md:rounded-2xl md:p-5">
                                <div className="mb-2 flex items-center justify-between md:mb-3">
                                    <span className="text-[10px] font-semibold tracking-wide text-slate-500 uppercase md:text-xs">
                                        Out of Stock
                                    </span>
                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-red-600 md:h-9 md:w-9">
                                        <TrendingDown className="h-3.5 w-3.5 text-white md:h-4 md:w-4" />
                                    </div>
                                </div>
                                <div className="bg-gradient-to-br from-red-600 to-red-500 bg-clip-text text-2xl font-bold text-transparent md:text-4xl">
                                    {stats.out_of_stock}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="border-slate-200/50 bg-white pl-9"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant={showOutOfStock ? 'default' : 'outline'}
                                size="sm"
                                onClick={() =>
                                    setShowOutOfStock(!showOutOfStock)
                                }
                                className="h-9"
                            >
                                {showOutOfStock ? (
                                    <Eye className="mr-1 h-4 w-4" />
                                ) : (
                                    <EyeOff className="mr-1 h-4 w-4" />
                                )}
                                {showOutOfStock
                                    ? 'Hide Out of Stock'
                                    : 'Show All'}
                            </Button>
                        </div>
                    </div>

                    {/* Results Count */}
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-500">
                            Showing {filteredProducts.length} of{' '}
                            {products.length} products
                        </p>
                    </div>

                    {/* Products Grid */}
                    {filteredProducts.length === 0 ? (
                        <Card className="border-0 shadow-lg">
                            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                                <Package className="mb-4 h-12 w-12 text-slate-400" />
                                <h3 className="text-lg font-semibold text-slate-900">
                                    No products found
                                </h3>
                                <p className="text-slate-500">
                                    Try adjusting your search or filter criteria
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {filteredProducts.map((product) => (
                                <Card
                                    key={product.id}
                                    className="group overflow-hidden border-0 shadow-sm transition-all duration-300 hover:shadow-xl"
                                >
                                    <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                        />
                                        <Badge
                                            className={`absolute top-2 right-2 ${getStockStatusBadge(product.stock_status)}`}
                                        >
                                            {getStockStatusLabel(
                                                product.stock_status,
                                            )}
                                        </Badge>
                                    </div>
                                    <CardContent className="space-y-3 p-4">
                                        <div>
                                            <h3 className="truncate font-semibold text-slate-900">
                                                {product.name}
                                            </h3>
                                            <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                                                {product.description}
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-lg font-bold text-[#00447C]">
                                                LKR {product.price.toFixed(2)}
                                            </span>
                                            <span className="text-sm font-medium text-slate-600">
                                                {product.stock_quantity} units
                                            </span>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                            <div
                                                className={`h-full rounded-full transition-all duration-300 ${
                                                    product.stock_status ===
                                                    'in_stock'
                                                        ? 'bg-emerald-500'
                                                        : product.stock_status ===
                                                            'low_stock'
                                                          ? 'bg-amber-500'
                                                          : 'bg-red-500'
                                                }`}
                                                style={{
                                                    width: `${Math.min(100, (product.stock_quantity / 100) * 100)}%`,
                                                }}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Spacer */}
            <div className="h-20"></div>

            {/* Footer Navigation */}
            <footer className="fixed right-0 bottom-0 left-0 z-50">
                <div className="absolute inset-0 bg-gradient-to-r from-[#00447C] via-[#003d6f] to-[#00284a]"></div>
                <div
                    className="absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                    }}
                ></div>
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 left-1/2 h-40 w-40 -translate-x-1/2 animate-pulse rounded-full bg-blue-400/10 blur-2xl"></div>
                </div>
                <div className="absolute top-0 right-0 left-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                <div className="relative container px-4 py-4">
                    <div className="flex justify-center">
                        <div className="grid grid-cols-4 gap-2 md:gap-4">
                            {navLinks.map((link) => {
                                const Icon = link.icon;
                                return (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        className="group relative flex flex-col items-center gap-1.5 p-2"
                                    >
                                        <div className="relative">
                                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/40 to-cyan-400/40 opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-100"></div>
                                            <Icon className="relative h-5 w-5 text-white/60 transition-all duration-500 group-hover:-translate-y-0.5 group-hover:scale-110 group-hover:text-white" />
                                        </div>
                                        <span className="text-[10px] font-medium tracking-wider text-white/50 uppercase transition-colors duration-500 group-hover:text-white/80">
                                            {link.name}
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <div className="relative h-1.5 w-1.5">
                            <div className="absolute inset-0 h-1.5 w-1.5 animate-ping rounded-full bg-blue-400/40"></div>
                            <div className="relative h-1.5 w-1.5 rounded-full bg-blue-400/60"></div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

const navLinks = [
    { name: 'Home', icon: LayoutDashboard, href: '/' },
    { name: 'Orders', icon: Package, href: '/my-orders' },
    { name: 'Inventory', icon: Warehouse, href: '/retailer/inventory' },
    { name: 'Profile', icon: User, href: '/user/profile' },
];
