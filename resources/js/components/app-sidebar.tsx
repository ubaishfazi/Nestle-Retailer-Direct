import { Link } from '@inertiajs/react';
import { UserCog, Tag, ClipboardList } from 'lucide-react';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'User Approvals',
        href: '/dashboard/user-approvals',
        icon: UserCog,
    },
    {
        title: 'Promotions',
        href: '/promotions',
        icon: Tag,
    },
    {
        title: 'Surveys',
        href: '/surveys',
        icon: ClipboardList,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard/user-approvals" prefetch>
                                <div className="flex items-center gap-3">
                                    <img
                                        src="/Nestle-Logo.png"
                                        alt="Nestlé"
                                        className="h-8 w-auto object-contain"
                                    />
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
