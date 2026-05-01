import { Head } from '@inertiajs/react';
import { useState } from 'react';
import {
    Search,
    Filter,
    ShoppingCart,
    ChevronDown,
    Plus,
    Minus,
    Check,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
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
import { useToast } from '@/hooks/use-toast';
import type { BreadcrumbItem } from '@/types';

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
    stock_quantity: number;
}

interface Props {
    products: Product[];
    categories: string[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Products',
        href: '/products',
    },
];

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

export default function Products() {
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('name');
    const [cart, setCart] = useState<Record<number, number>>({});

    const filteredProducts = products
        .filter((product) => {
            const matchesSearch =
                product.name
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                product.description
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase());
            const matchesCategory =
                selectedCategory === 'all' ||
                product.category === selectedCategory;
            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'price_low':
                    return a.price - b.price;
                case 'price_high':
                    return b.price - a.price;
                case 'stock':
                    return b.stock_quantity - a.stock_quantity;
                default:
                    return 0;
            }
        });

    const handleAddToCart = (productId: number) => {
        setCart((prev) => {
            const currentQty = prev[productId] || 0;
            return { ...prev, [productId]: currentQty + 1 };
        });
    };

    const handleRemoveFromCart = (productId: number) => {
        setCart((prev) => {
            const currentQty = prev[productId] || 0;
            if (currentQty <= 1) {
                const { [productId]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [productId]: currentQty - 1 };
        });
    };

    const handleClearCart = () => {
        setCart({});
    };

    const totalItems = Object.values(cart).reduce((acc, qty) => acc + qty, 0);
    const totalAmount = Object.entries(cart).reduce((acc, [productId, qty]) => {
        const product = products.find((p) => p.id === parseInt(productId));
        return acc + (product ? product.price * qty : 0);
    }, 0);

    const handleCheckout = () => {
        if (totalItems === 0) {
            toast({
                title: 'Cart is empty',
                description: 'Please add items to your cart before checkout.',
                variant: 'destructive',
            });
            return;
        }

        toast({
            title: 'Checkout initiated',
            description: `Processing ${totalItems} items totaling LKR ${totalAmount.toFixed(2)}`,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Products" />

            <div className="flex flex-col gap-6 p-6">
                {/* Page Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Products
                        </h1>
                        <p className="mt-1 text-muted-foreground">
                            Browse and order from our product catalog
                        </p>
                    </div>

                    {/* Cart Summary */}
                    {totalItems > 0 && (
                        <Card className="w-full md:w-auto">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-2">
                                        <ShoppingCart className="h-5 w-5 text-[#00447C]" />
                                        <div>
                                            <div className="text-sm font-semibold">
                                                {totalItems} items
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                LKR {totalAmount.toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleClearCart}
                                        >
                                            Clear
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={handleCheckout}
                                            className="bg-[#00447C] hover:bg-[#003d6f]"
                                        >
                                            Checkout
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Search and Filters */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center">
                            {/* Search */}
                            <div className="relative flex-1">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="pl-9"
                                />
                            </div>

                            {/* Category Filter */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-between md:w-auto"
                                    >
                                        {selectedCategory === 'all'
                                            ? 'All Categories'
                                            : selectedCategory}
                                        <ChevronDown className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-[200px]"
                                >
                                    <DropdownMenuItem
                                        onClick={() =>
                                            setSelectedCategory('all')
                                        }
                                    >
                                        All Categories
                                    </DropdownMenuItem>
                                    {categories.map((category) => (
                                        <DropdownMenuItem
                                            key={category}
                                            onClick={() =>
                                                setSelectedCategory(category)
                                            }
                                        >
                                            {category}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Sort */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-between md:w-auto"
                                    >
                                        <Filter className="mr-2 h-4 w-4" />
                                        Sort
                                        <ChevronDown className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                        onClick={() => setSortBy('name')}
                                    >
                                        Name (A-Z)
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => setSortBy('price_low')}
                                    >
                                        Price (Low to High)
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => setSortBy('price_high')}
                                    >
                                        Price (High to Low)
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => setSortBy('stock')}
                                    >
                                        Stock Level
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </CardContent>
                </Card>

                {/* Results Count */}
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Showing {filteredProducts.length} of {products.length}{' '}
                        products
                    </p>
                </div>

                {/* Products Grid */}
                {filteredProducts.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                            <ShoppingCart className="mb-4 h-12 w-12 text-muted-foreground" />
                            <h3 className="text-lg font-semibold">
                                No products found
                            </h3>
                            <p className="text-muted-foreground">
                                Try adjusting your search or filter criteria
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredProducts.map((product) => {
                            const quantityInCart = cart[product.id] || 0;
                            const isOutOfStock =
                                product.stock_status === 'out_of_stock';

                            return (
                                <Card
                                    key={product.id}
                                    className="overflow-hidden transition-shadow duration-300 hover:shadow-lg"
                                >
                                    <CardHeader className="p-0">
                                        {/* Product Image */}
                                        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50">
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                                            />
                                            {/* Stock Status Badge */}
                                            <div className="absolute top-2 right-2">
                                                <Badge
                                                    className={getStockStatusBadge(
                                                        product.stock_status,
                                                    )}
                                                >
                                                    {getStockStatusLabel(
                                                        product.stock_status,
                                                    )}
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3 p-4">
                                        {/* Category */}
                                        <div className="text-xs tracking-wide text-muted-foreground uppercase">
                                            {product.category}
                                        </div>

                                        {/* Product Name */}
                                        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold">
                                            {product.name}
                                        </h3>

                                        {/* Description */}
                                        <p className="line-clamp-2 text-xs text-muted-foreground">
                                            {product.description}
                                        </p>

                                        {/* Stock Info */}
                                        {product.stock_status !==
                                            'out_of_stock' && (
                                            <p className="text-xs text-muted-foreground">
                                                {product.stock_quantity}{' '}
                                                available
                                            </p>
                                        )}

                                        {/* Price and Cart Actions */}
                                        <div className="flex items-center justify-between border-t pt-2">
                                            <div className="text-lg font-bold text-[#00447C]">
                                                LKR {product.price.toFixed(2)}
                                            </div>

                                            {quantityInCart > 0 ? (
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        size="icon"
                                                        variant="outline"
                                                        className="h-8 w-8"
                                                        onClick={() =>
                                                            handleRemoveFromCart(
                                                                product.id,
                                                            )
                                                        }
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </Button>
                                                    <span className="w-8 text-center text-sm font-semibold">
                                                        {quantityInCart}
                                                    </span>
                                                    <Button
                                                        size="icon"
                                                        className="h-8 w-8 bg-[#00447C] hover:bg-[#003d6f]"
                                                        onClick={() =>
                                                            handleAddToCart(
                                                                product.id,
                                                            )
                                                        }
                                                        disabled={isOutOfStock}
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    onClick={() =>
                                                        handleAddToCart(
                                                            product.id,
                                                        )
                                                    }
                                                    disabled={isOutOfStock}
                                                    className="bg-[#00447C] hover:bg-[#003d6f]"
                                                >
                                                    <ShoppingCart className="mr-1 h-4 w-4" />
                                                    Add
                                                </Button>
                                            )}
                                        </div>

                                        {/* In Cart Indicator */}
                                        {quantityInCart > 0 && (
                                            <div className="flex items-center gap-1 text-xs text-emerald-600">
                                                <Check className="h-3 w-3" />
                                                <span>
                                                    {quantityInCart} in cart
                                                </span>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
