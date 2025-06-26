
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
        <h2 className="mb-2 px-4 text-lg font-semibold">
          Admin Panel
        </h2>
        <div className="space-y-1">
          {menuItems.map((item) => (
            <Button
              key={item.href}
              variant={location.pathname === item.href ? 'secondary' : 'ghost'}
              className="w-full justify-start"
              asChild={!item.onClick}
              onClick={item.onClick ? () => {
                item.onClick();
                if (isMobile) setIsOpen(false);
              } : undefined}
            >
              {item.onClick ? (
                <span>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </span>
              ) : (
                <Link to={item.href} onClick={() => isMobile && setIsOpen(false)}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
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
      <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-lg font-semibold">MeatDoctor Admin</h1>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
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
      <div className="space-y-4 py-4 h-screen bg-background border-r">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold">
            MeatDoctor Admin
          </h2>
          <div className="space-y-1">
            {menuItems.map((item) => (
              <Button
                key={item.href}
                variant={location.pathname === item.href ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                asChild={!item.onClick}
                onClick={item.onClick}
              >
                {item.onClick ? (
                  <span>
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.title}
                  </span>
                ) : (
                  <Link to={item.href}>
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.title}
                  </Link>
                )}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNavbar;
