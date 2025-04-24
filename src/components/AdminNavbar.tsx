import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  BarChart, 
  Settings, 
  ShoppingBag,
  LogOut,
  Menu,
  X,
  Utensils,
  MapPin,
  CreditCard,
  Folder,
  GlassWater,
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { toast } from "sonner";
import { cn } from '@/lib/utils';

interface AdminNavbarProps {
  isMobile: boolean;
}

const AdminNavbar: React.FC<AdminNavbarProps> = ({ isMobile }) => {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  
  const handleLogout = () => {
    localStorage.removeItem('adminToken'); // Inlined clearAdminSession
    toast.success('Logged out successfully');
    navigate('/admin');
  };
  
  const navItems = [
    {
      label: 'Bookings',
      icon: <ShoppingBag className="h-5 w-5" />,
      href: '/admin/dashboard',
      exact: true
    },
    {
      label: 'Food Management',
      icon: <Utensils className="h-5 w-5" />,
      href: '/admin/dashboard/foods'
    },
    {
      label: 'Categories',
      icon: <Folder className="h-5 w-5" />,
      href: '/admin/dashboard/categories'
    },
    {
      label: 'Additional Options',
      icon: <GlassWater className="h-5 w-5" />,
      href: '/admin/dashboard/additional-options'
    },
    {
      label: 'Location Management',
      icon: <MapPin className="h-5 w-5" />,
      href: '/admin/dashboard/locations'
    },
    {
      label: 'Payment Methods',
      icon: <CreditCard className="h-5 w-5" />,
      href: '/admin/dashboard/payment-methods'
    },
    {
      label: 'Analytics',
      icon: <BarChart className="h-5 w-5" />,
      href: '/admin/dashboard/analytics'
    },
    {
      label: 'Settings',
      icon: <Settings className="h-5 w-5" />,
      href: '/admin/dashboard/settings'
    }
  ];
  
  const NavContent = () => (
    <>
      <div className="mb-8 px-4">
        <h2 className="text-xl font-bold text-sidebar-foreground flex items-center">
          <span className="text-food-primary">Meat</span>Doctor
          <span className="text-food-secondary">Ucc</span>
        </h2>
        <p className="text-sidebar-foreground/60 text-sm">Admin Dashboard</p>
      </div>
      
      <div className="space-y-1 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.exact}
            onClick={() => setOpen(false)}
            className={({ isActive }) => cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
            )}
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </div>
      
      <div className="mt-auto px-2">
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 mr-2" />
          Logout
        </Button>
      </div>
    </>
  );
  
  if (isMobile) {
    return (
      <>
        <div className="flex items-center justify-between p-4 bg-sidebar">
          <h2 className="text-xl font-bold text-sidebar-foreground flex items-center">
            <span className="text-food-primary">Meat</span>Doctor
            <span className="text-food-secondary">Ucc</span>
          </h2>
          
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" className="text-sidebar-foreground">
                {open ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 bg-sidebar border-r border-sidebar-border">
              <div className="flex flex-col h-full pt-6 pb-4">
                <NavContent />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </>
    );
  }
  
  return (
    <div className="hidden md:flex md:flex-col md:w-64 md:bg-sidebar md:border-r md:border-sidebar-border md:min-h-screen p-6">
      <NavContent />
    </div>
  );
};

export default AdminNavbar;