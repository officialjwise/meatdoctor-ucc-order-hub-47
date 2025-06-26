
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Settings, 
  BarChart3, 
  UtensilsCrossed,
  MapPin,
  CreditCard,
  Tags,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';

const AdminNavbar = ({ isMobile }: { isMobile: boolean }) => {
  const location = useLocation();
  
  const navigationItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Orders', href: '/admin/dashboard/orders', icon: ShoppingBag },
    { name: 'Foods', href: '/admin/dashboard/foods', icon: UtensilsCrossed },
    { name: 'Categories', href: '/admin/dashboard/categories', icon: Tags },
    { name: 'Locations', href: '/admin/dashboard/locations', icon: MapPin },
    { name: 'Payment Methods', href: '/admin/dashboard/payment-methods', icon: CreditCard },
    { name: 'Additional Options', href: '/admin/dashboard/additional-options', icon: Plus },
    { name: 'Analytics', href: '/admin/dashboard/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/admin/dashboard/settings', icon: Settings },
  ];

  if (isMobile) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
        <div className="flex justify-around items-center h-16 px-2">
          {navigationItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-lg transition-colors min-w-0 flex-1",
                  isActive 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-xs truncate">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    );
  }

  return (
    <nav className="w-64 bg-background border-r border-border h-screen sticky top-0">
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-6">Admin Panel</h2>
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};

export default AdminNavbar;
