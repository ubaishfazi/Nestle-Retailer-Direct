import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    Search,
    Filter,
    ChevronDown,
    Package,
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    Eye,
    EyeOff,
    ChevronLeft,
    HelpCircle,
    LayoutDashboard,
    Settings,
    Edit2,
    Save,
    X,
    User,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string;
    stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
    stock_quantity: number;
}

interface Props {
    products: Product[];
    categories: string[];
}

function getStockStatus(
    status: string,
    quantity: number,
): 'in_stock' | 'low_stock' | 'out_of_stock' {
    if (quantity === 0) return 'out_of_stock';
    if (quantity <= 20) return 'low_stock';
    return 'in_stock';
}

function getStockStatusBadge(status: string): string {
    switch (status) {
        case 'in_stock':
            return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
        case 'low_stock':
            return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
        case 'out_of_stock':
            return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
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

export default function Stock({ products, categories }: Props) {
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<string>('name');
    const [stockFilter, setStockFilter] = useState<string>('all');
    const [showOutOfStock, setShowOutOfStock] = useState(true);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [editQuantity, setEditQuantity] = useState<number>(0);

    // Update stock status based on quantity (>20 in stock, <=20 low stock, =0 out of stock)
    const productsWithUpdatedStatus = products.map((product) => ({
        ...product,
        stock_status: getStockStatus(
            product.stock_status,
            product.stock_quantity,
        ),
    }));

    const filteredProducts = productsWithUpdatedStatus
        .filter((product) => {
            const matchesSearch =
                product.name
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                product.description
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase());
            const matchesStockFilter =
                stockFilter === 'all' || product.stock_status === stockFilter;
            const shouldShowOutOfStock =
                showOutOfStock || product.stock_status !== 'out_of_stock';
            return matchesSearch && matchesStockFilter && shouldShowOutOfStock;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'price_low':
                    return a.price - b.price;
                case 'price_high':
                    return b.price - a.price;
                case 'stock_low':
                    return a.stock_quantity - b.stock_quantity;
                case 'stock_high':
                    return b.stock_quantity - a.stock_quantity;
                default:
                    return 0;
            }
        });

    const handleEditClick = (product: Product) => {
        setEditingProduct(product);
        setEditQuantity(product.stock_quantity);
    };

    const handleSaveQuantity = () => {
        if (editingProduct) {
            router.put(
                `/stock/${editingProduct.id}`,
                {
                    stock_quantity: editQuantity,
                },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast({
                            title: 'Stock updated!',
                            description: `${editingProduct.name} quantity updated to ${editQuantity} units.`,
                        });
                        setEditingProduct(null);
                    },
                    onError: () => {
                        toast({
                            title: 'Failed to update',
                            description:
                                'There was an error updating the stock quantity.',
                            variant: 'destructive',
                        });
                    },
                },
            );
        }
    };

    const stats = {
        total_products: products.length,
        in_stock: products.filter(
            (p) =>
                getStockStatus(p.stock_status, p.stock_quantity) === 'in_stock',
        ).length,
        low_stock: products.filter(
            (p) =>
                getStockStatus(p.stock_status, p.stock_quantity) ===
                'low_stock',
        ).length,
        out_of_stock: products.filter(
            (p) =>
                getStockStatus(p.stock_status, p.stock_quantity) ===
                'out_of_stock',
        ).length,
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f5f7fa] to-[#e8ecf1]">
            <Head title="Inventory" />

            {/* SKILL.md Designed Header */}
            <header className="sticky top-0 z-50">
                {/* Deep navy gradient base */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#00447C] via-[#003d6f] to-[#00284a]"></div>

                {/* Subtle noise texture */}
                <div
                    className="absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                    }}
                ></div>

                {/* Animated glow orbs */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 left-1/4 h-32 w-32 rounded-full bg-blue-400/10 blur-2xl"></div>
                    <div className="absolute top-0 right-1/4 h-24 w-24 rounded-full bg-cyan-400/10 blur-2xl"></div>
                </div>

                {/* Content */}
                <div className="relative container flex h-16 items-center justify-between px-4">
                    {/* Back button */}
                    <Link href="/" className="group flex items-center gap-2">
                        <div className="relative">
                            <div className="absolute inset-0 rounded-lg bg-white/20 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100"></div>
                            <ChevronLeft className="relative h-6 w-6 text-white transition-transform duration-300 group-hover:scale-110" />
                        </div>
                    </Link>

                    {/* Title */}
                    <h1 className="text-base font-bold tracking-widest text-white uppercase md:text-lg">
                        Inventory
                    </h1>

                    {/* Help button */}
                    <button className="group">
                        <div className="relative">
                            <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100"></div>
                            <HelpCircle className="relative h-6 w-6 text-white/80 transition-all duration-300 group-hover:scale-110 group-hover:text-white" />
                        </div>
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="container px-3 pb-56 md:px-4 md:py-6">
                <div className="flex flex-col gap-6">
                    {/* Results Count */}
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground md:text-sm">
                            Showing {filteredProducts.length} of{' '}
                            {products.length} products
                        </p>
                    </div>

                    {/* Products Table */}
                    {filteredProducts.length === 0 ? (
                        <Card className="border-0 shadow-lg">
                            <CardContent className="flex flex-col items-center justify-center px-4 py-12 text-center">
                                <Package className="mb-4 h-12 w-12 text-muted-foreground" />
                                <h3 className="text-lg font-semibold">
                                    No products found
                                </h3>
                                <p className="text-muted-foreground">
                                    Try adjusting your search or filter criteria
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            {/* Desktop Table View */}
                            <Card className="max-w-8xl mx-auto hidden overflow-hidden border-0 shadow-lg md:block">
                                <table className="w-full">
                                    <thead className="bg-muted/50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                                Product
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                                Price
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                                Stock Level
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                                Quantity
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                                Status
                                            </th>
                                            <th className="px-4 py-3 text-right text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {filteredProducts.map((product) => (
                                            <tr
                                                key={product.id}
                                                className="transition-colors hover:bg-muted/30"
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg border border-border bg-gradient-to-br from-gray-100 to-gray-50">
                                                            <img
                                                                src={
                                                                    product.image
                                                                }
                                                                alt={
                                                                    product.name
                                                                }
                                                                className="h-full w-full object-cover"
                                                            />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium">
                                                                {product.name}
                                                            </div>
                                                            <div className="line-clamp-1 max-w-[180px] text-xs text-muted-foreground">
                                                                {
                                                                    product.description
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm font-semibold text-[#00447C]">
                                                    LKR{' '}
                                                    {product.price.toFixed(2)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-2 max-w-[80px] flex-1 overflow-hidden rounded-full bg-muted">
                                                            <div
                                                                className={`h-full rounded-full ${
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
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm font-medium">
                                                    {product.stock_quantity}{' '}
                                                    units
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge
                                                        className={getStockStatusBadge(
                                                            product.stock_status,
                                                        )}
                                                    >
                                                        {getStockStatusLabel(
                                                            product.stock_status,
                                                        )}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleEditClick(
                                                                product,
                                                            )
                                                        }
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </Card>

                            {/* Mobile Card View */}
                            <div className="grid gap-3 md:hidden">
                                {filteredProducts.map((product) => (
                                    <Card
                                        key={product.id}
                                        className="overflow-hidden border-0 shadow-md"
                                    >
                                        <CardContent className="p-3">
                                            <div className="flex items-start gap-3">
                                                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-border bg-gradient-to-br from-gray-100 to-gray-50">
                                                    <img
                                                        src={product.image}
                                                        alt={product.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="truncate text-sm font-semibold">
                                                        {product.name}
                                                    </div>
                                                    <div className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                                                        {product.description}
                                                    </div>
                                                    <div className="mt-2 flex items-center gap-2">
                                                        <Badge
                                                            className={`${getStockStatusBadge(product.stock_status)} px-1.5 py-0 text-[10px]`}
                                                        >
                                                            {getStockStatusLabel(
                                                                product.stock_status,
                                                            )}
                                                        </Badge>
                                                        <span className="text-xs font-semibold text-[#00447C]">
                                                            LKR{' '}
                                                            {product.price.toFixed(
                                                                2,
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-3 flex items-center justify-between border-t pt-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                                                        <div
                                                            className={`h-full rounded-full ${
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
                                                    <span className="text-xs text-muted-foreground">
                                                        {product.stock_quantity}{' '}
                                                        units
                                                    </span>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 px-2"
                                                    onClick={() =>
                                                        handleEditClick(product)
                                                    }
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Edit Quantity Dialog */}
                    <Dialog
                        open={!!editingProduct}
                        onOpenChange={() => setEditingProduct(null)}
                    >
                        <DialogContent className="w-full max-w-[90vw] p-4 sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle className="text-base md:text-lg">
                                    Edit Stock Quantity
                                </DialogTitle>
                                <DialogDescription className="text-xs md:text-sm">
                                    Update the stock quantity for{' '}
                                    {editingProduct?.name}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label
                                        htmlFor="quantity"
                                        className="text-xs md:text-sm"
                                    >
                                        Quantity
                                    </Label>
                                    <Input
                                        id="quantity"
                                        type="number"
                                        min="0"
                                        value={editQuantity}
                                        onChange={(e) =>
                                            setEditQuantity(
                                                parseInt(e.target.value) || 0,
                                            )
                                        }
                                        className="w-full text-sm"
                                    />
                                </div>
                                <div className="space-y-2 text-xs text-muted-foreground md:text-sm">
                                    <p>
                                        Current status:{' '}
                                        <Badge
                                            className={getStockStatusBadge(
                                                editingProduct?.stock_status ||
                                                    'in_stock',
                                            )}
                                        >
                                            {getStockStatusLabel(
                                                editingProduct?.stock_status ||
                                                    'in_stock',
                                            )}
                                        </Badge>
                                    </p>
                                    <p>
                                        New status:{' '}
                                        <Badge
                                            className={getStockStatusBadge(
                                                getStockStatus(
                                                    '',
                                                    editQuantity,
                                                ),
                                            )}
                                        >
                                            {getStockStatusLabel(
                                                getStockStatus(
                                                    '',
                                                    editQuantity,
                                                ),
                                            )}
                                        </Badge>
                                    </p>
                                </div>
                            </div>
                            <DialogFooter className="gap-2 sm:gap-0">
                                <Button
                                    variant="outline"
                                    onClick={() => setEditingProduct(null)}
                                    className="w-full sm:w-auto"
                                >
                                    <X className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSaveQuantity}
                                    className="w-full sm:w-auto"
                                >
                                    <Save className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                                    Save Changes
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </main>

            {/* Spacer to prevent content going under footer */}
            <div className="h-20"></div>

            {/* SKILL.md Designed Footer */}
            <footer className="fixed right-0 bottom-0 left-0 z-50">
                {/* Deep navy gradient base */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#00447C] via-[#003d6f] to-[#00284a]"></div>

                {/* Subtle noise texture */}
                <div
                    className="absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                    }}
                ></div>

                {/* Animated glow */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 left-1/2 h-40 w-40 -translate-x-1/2 animate-pulse rounded-full bg-blue-400/10 blur-2xl"></div>
                </div>

                {/* Top accent line */}
                <div className="absolute top-0 right-0 left-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>

                {/* Content */}
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

                    {/* Decorative pulse dot */}
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
    { name: 'Inventory', icon: Package, href: '/stock' },
    { name: 'Profile', icon: User, href: '/user/profile' },
];
