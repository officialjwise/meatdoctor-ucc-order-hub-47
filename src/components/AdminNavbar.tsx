
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
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
  Menu
} from 'lucide-react';

interface AdminNavbarProps {
  isMobile: boolean;
  onOrdersMenuClick?: () => void;
}

const AdminNavbar = ({ isMobile, onOrdersMenuClick }: AdminNavbarProps) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

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

  const NavContent = () => (
    <div className="space-y-4 py-4">
      <div className="px-3 py-2">
        <h2 className="mb-4 px-4 text-lg font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
          MeatDoctor Admin
        </h2>
        <div className="space-y-2">
          {menuItems.map((item) => (
            <Button
              key={item.href}
              variant={location.pathname === item.href ? 'default' : 'ghost'}
              className={cn(
                "w-full justify-start text-left transition-all duration-200 hover:scale-105",
                location.pathname === item.href
                  ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg hover:from-orange-600 hover:to-red-600"
                  : "hover:bg-orange-50 dark:hover:bg-gray-800 hover:text-orange-600 dark:hover:text-orange-400"
              )}
              asChild={!item.onClick}
              onClick={item.onClick ? () => {
                item.onClick();
                if (isMobile) setIsOpen(false);
              } : undefined}
            >
              {item.onClick ? (
                <span className="flex items-center gap-3">
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.title}</span>
                </span>
              ) : (
                <Link to={item.href} onClick={() => isMobile && setIsOpen(false)} className="flex items-center gap-3">
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.title}</span>
                </Link>
              )}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-background/95 backdrop-blur-sm border-b border-gray-200 dark:border-border shadow-sm">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-lg font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            MeatDoctor Admin
          </h1>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                className="bg-white dark:bg-gray-800 hover:bg-orange-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700 transition-all duration-200 hover:scale-105"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 bg-white dark:bg-background">
              <ScrollArea className="h-full">
                <NavContent />
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-12 w-64">
      <div className="space-y-4 py-4 h-screen bg-white dark:bg-background border-r border-gray-200 dark:border-border shadow-sm">
        <NavContent />
      </div>
    </div>
  );
};

export default AdminNavbar;
