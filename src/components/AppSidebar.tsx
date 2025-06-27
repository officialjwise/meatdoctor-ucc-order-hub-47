
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  ShoppingBag,
  Settings,
  BarChart3,
  Utensils,
  MapPin,
  CreditCard,
  FolderOpen,
  Plus,
} from 'lucide-react';

interface AppSidebarProps {
  onOrdersMenuClick?: () => void;
}

const AppSidebar = ({ onOrdersMenuClick }: AppSidebarProps) => {
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  const menuItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      href: '/admin/dashboard',
    },
    {
      title: 'Orders',
      icon: ShoppingBag,
      href: '/admin/dashboard/orders',
      onClick: onOrdersMenuClick,
    },
    {
      title: 'Analytics',
      icon: BarChart3,
      href: '/admin/dashboard/analytics',
    },
    {
      title: 'Food Management',
      icon: Utensils,
      href: '/admin/dashboard/foods',
    },
    {
      title: 'Categories',
      icon: FolderOpen,
      href: '/admin/dashboard/categories',
    },
    {
      title: 'Locations',
      icon: MapPin,
      href: '/admin/dashboard/locations',
    },
    {
      title: 'Payment Methods',
      icon: CreditCard,
      href: '/admin/dashboard/payment-methods',
    },
    {
      title: 'Additional Options',
      icon: Plus,
      href: '/admin/dashboard/additional-options',
    },
    {
      title: 'Settings',
      icon: Settings,
      href: '/admin/dashboard/settings',
    },
  ];

  return (
    <Sidebar collapsible="icon" className="bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
      <SidebarHeader className="p-4">
        {!collapsed && (
          <h2 className="text-lg font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            MeatDoctor Admin
          </h2>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">MD</span>
          </div>
        )}
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild={!item.onClick}
                    isActive={location.pathname === item.href}
                    tooltip={collapsed ? item.title : undefined}
                    className={cn(
                      "transition-all duration-200",
                      location.pathname === item.href
                        ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg hover:from-orange-600 hover:to-red-600"
                        : "hover:bg-orange-50 dark:hover:bg-gray-800 hover:text-orange-600 dark:hover:text-orange-400"
                    )}
                    onClick={item.onClick}
                  >
                    {item.onClick ? (
                      <span className="flex items-center gap-3 w-full">
                        <item.icon className="h-5 w-5 shrink-0" />
                        <span className="font-medium">{item.title}</span>
                      </span>
                    ) : (
                      <Link to={item.href} className="flex items-center gap-3 w-full">
                        <item.icon className="h-5 w-5 shrink-0" />
                        <span className="font-medium">{item.title}</span>
                      </Link>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
