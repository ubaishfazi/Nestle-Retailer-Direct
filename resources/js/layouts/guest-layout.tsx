import { Link, usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Home,
    Package,
    ShoppingCart,
    User,
    LogOut,
    LogIn,
    UserPlus,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuGroup,
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

export default function GuestLayout({
    children,
    canRegister = true,
}: {
    children: React.ReactNode;
    canRegister?: boolean;
}) {
    const { auth } = usePage().props as {
        auth?: {
            user?: { name?: string; email?: string; role?: string };
            role?: string;
            isDistributor?: boolean;
        };
    };
    const isLoggedIn = !!auth?.user;
    const isDistributor =
        auth?.isDistributor || auth?.user?.role === 'distributor';

    // Different navigation links based on user role
    const navLinks = [
        { name: 'Home', icon: Home, href: '/' },
        {
            name: 'Orders',
            icon: ShoppingCart,
            href: isDistributor ? '/distributor/incoming-orders' : '/my-orders',
        },
        {
            name: 'Inventory',
            icon: Package,
            href: isDistributor ? '/distributor/warehouse-inventory' : '/stock',
        },
        { name: 'Profile', icon: User, href: '/user/profile' },
    ];

    return (
        <div className="flex h-screen flex-col overflow-hidden bg-transparent">
            {/* SKILL.md Designed Navbar - Refined Minimalism */}
            <header className="sticky top-0 z-50 w-full">
                {/* Deep navy gradient base */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#00447C] via-[#003d6f] to-[#00284a]"></div>

                {/* Subtle noise texture overlay */}
                <div
                    className="absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                    }}
                ></div>

                {/* Animated glow orbs */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 left-1/3 h-40 w-40 animate-pulse rounded-full bg-blue-400/10 blur-2xl"></div>
                    <div className="absolute top-0 right-1/4 h-32 w-32 animate-pulse rounded-full bg-cyan-400/10 blur-2xl delay-1000"></div>
                </div>

                {/* Bottom accent line */}
                <div className="absolute right-0 bottom-0 left-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

                {/* Content */}
                <div className="relative container flex h-20 items-center justify-between px-4 md:h-16">
                    {/* Brand logo and text */}
                    <div className="flex items-center gap-2 md:gap-3">
                        <img
                            src="/Nestle-Logo.png"
                            alt="Nestlé"
                            className="h-8 w-auto object-contain brightness-0 invert md:h-10"
                        />
                        <div className="flex flex-col">
                            <span className="text-xs font-bold tracking-tight text-white md:text-lg">
                                Nestlé Retailer Direct
                            </span>
                            <span className="text-[9px] font-medium tracking-widest text-white/50 uppercase">
                                System Analysis
                            </span>
                        </div>
                    </div>

                    {/* Navigation buttons - Desktop */}
                    <nav className="hidden items-center gap-2 md:flex">
                        {isLoggedIn ? (
                            <>
                                {/* User profile button */}
                                <Link href="/user/profile">
                                    <Button
                                        variant="ghost"
                                        className="flex items-center gap-2 border border-white/20 text-white transition-all duration-300 hover:bg-white/10"
                                    >
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-gradient-to-br from-white/30 to-white/10">
                                            <User className="h-4 w-4 text-white" />
                                        </div>
                                        <span className="text-sm font-medium">
                                            {auth.user?.name || 'User'}
                                        </span>
                                    </Button>
                                </Link>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => router.post('/logout')}
                                    className="border border-transparent text-white/70 transition-all duration-300 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300"
                                >
                                    <LogOut className="h-4 w-4" />
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link href="/login">
                                    <Button
                                        variant="ghost"
                                        className="border border-transparent text-white/70 transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:text-white"
                                    >
                                        <LogIn className="mr-2 h-4 w-4" />
                                        Log in
                                    </Button>
                                </Link>
                                <Link href="/register">
                                    <Button className="border border-white/20 bg-gradient-to-r from-white/20 to-white/10 text-white backdrop-blur-sm transition-all duration-300 hover:border-white/40 hover:from-white/30 hover:to-white/20">
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        Register
                                    </Button>
                                </Link>
                            </>
                        )}
                    </nav>

                    {/* Mobile - User dropdown or Log in button */}
                    <div className="flex md:hidden">
                        {isLoggedIn ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="text-white transition-all duration-300 hover:bg-white/10"
                                    >
                                        <User className="h-5 w-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    className="w-48 bg-white"
                                    align="end"
                                    side="bottom"
                                >
                                    <DropdownMenuLabel className="flex items-center gap-2">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">
                                                {auth.user?.name || 'User'}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {auth.user?.email ||
                                                    'user@example.com'}
                                            </span>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuGroup>
                                        <DropdownMenuItem asChild>
                                            <Link
                                                href="/user/profile"
                                                className="flex items-center gap-2"
                                            >
                                                <User className="h-4 w-4" />
                                                Profile
                                            </Link>
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <button
                                            type="button"
                                            className="flex w-full items-center gap-2 text-red-600"
                                            onClick={() => {
                                                router.post('/logout');
                                            }}
                                        >
                                            <LogOut className="h-4 w-4" />
                                            Log out
                                        </button>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Link href="/login">
                                <Button
                                    variant="ghost"
                                    className="text-white transition-all duration-300 hover:bg-white/10"
                                >
                                    <LogIn className="h-5 w-5" />
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="w-full flex-1 overflow-hidden pb-24">
                {children}
            </main>

            {/* SKILL.md Designed Footer - Refined Minimalism */}
            <footer className="fixed right-0 bottom-0 left-0 z-50">
                {/* Deep navy gradient base */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#00447C] via-[#003d6f] to-[#00284a]"></div>

                {/* Subtle noise texture overlay */}
                <div
                    className="absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                    }}
                ></div>

                {/* Animated glow orbs */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 left-1/4 h-32 w-32 rounded-full bg-blue-400/10 blur-2xl"></div>
                    <div className="absolute right-1/4 bottom-0 h-24 w-24 rounded-full bg-cyan-400/10 blur-2xl"></div>
                </div>

                {/* Top accent line */}
                <div className="absolute top-0 right-0 left-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>

                {/* Content */}
                <div className="relative container px-4 py-3">
                    <div className="flex items-center justify-center">
                        {/* Navigation */}
                        <div className="grid grid-cols-4 gap-2 md:gap-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="group relative flex flex-col items-center gap-1.5 p-2"
                                >
                                    {/* Icon container with glow effect */}
                                    <div className="relative">
                                        {/* Glow background on hover */}
                                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/40 to-cyan-400/40 opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-100"></div>

                                        {/* Icon */}
                                        <link.icon className="relative h-5 w-5 text-white/60 transition-all duration-500 group-hover:-translate-y-0.5 group-hover:scale-110 group-hover:text-white" />
                                    </div>

                                    {/* Label */}
                                    <span className="text-[10px] font-medium tracking-wider text-white/50 uppercase transition-colors duration-500 group-hover:text-white/80">
                                        {link.name}
                                    </span>

                                    {/* Bottom accent line */}
                                    <div className="absolute bottom-1 left-1/2 h-px w-0 -translate-x-1/2 bg-gradient-to-r from-transparent via-blue-400 to-transparent transition-all duration-500 group-hover:w-8"></div>
                                </Link>
                            ))}
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
