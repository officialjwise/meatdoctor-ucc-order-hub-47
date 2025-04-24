import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import AdminNavbar from '@/components/AdminNavbar';
import BookingsTable from '@/components/BookingsTable';
import SettingsPanel from '@/components/SettingsPanel';
import EnhancedAnalyticsPanel from '@/components/EnhancedAnalyticsPanel';
import FoodManagement from '@/components/FoodManagement';
import LocationManagement from '@/components/LocationManagement';
import PaymentMethodManagement from '@/components/PaymentMethodManagement';
import CategoryManagement from '@/components/CategoryManagement';
import AdditionalOptionsManagement from '@/components/AdditionalOptionsManagement';

import { ThemeToggle } from '@/components/ui/theme-toggle';
import { toast } from 'sonner';
import { Bell, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BACKEND_URL = 'http://localhost:4000';

const AdminDashboard = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [previousBookingCount, setPreviousBookingCount] = useState(0);
  
  useEffect(() => {
    // Check if authenticated and token is not expired
    const token = localStorage.getItem('adminToken');
    const tokenExpiry = localStorage.getItem('tokenExpiry');
    
    if (!token || !tokenExpiry) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('tokenExpiry');
      navigate('/admin');
      toast.error('Session expired. Please log in again.');
      return;
    }

    const currentTime = new Date().getTime();
    if (currentTime > parseInt(tokenExpiry)) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('tokenExpiry');
      navigate('/admin');
      toast.error('Session expired. Please log in again.');
      return;
    }

    // Fetch bookings immediately
    loadBookings();
    
    // Set up polling for new bookings
    const pollInterval = setInterval(() => {
      loadBookings();
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(pollInterval);
  }, [navigate, refreshKey]);
  
  const loadBookings = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/orders`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (response.status === 401) {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('tokenExpiry');
          navigate('/admin');
          toast.error('Session expired. Please log in again.');
          return;
        }
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to fetch bookings (Status: ${response.status})`);
        } else {
          throw new Error(`Failed to fetch bookings (Status: ${response.status}) - Unexpected response format`);
        }
      }

      const allBookings = await response.json();
      
      // Check if we have new bookings
      if (previousBookingCount > 0 && allBookings.length > previousBookingCount) {
        toast(
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-amber-500" />
            <span>New order received!</span>
          </div>,
          {
            description: `You have received ${allBookings.length - previousBookingCount} new order(s).`,
            action: {
              label: "View",
              onClick: () => {
                if (!location.pathname.endsWith('/dashboard')) {
                  navigate('/admin/dashboard');
                }
              }
            }
          }
        );
      }
      
      setBookings(allBookings);
      setPreviousBookingCount(allBookings.length);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error(error.message || 'Failed to load bookings. Please try again.');
    }
  };
  
  const handleBookingsUpdate = () => {
    setRefreshKey(prev => prev + 1);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('tokenExpiry');
    navigate('/admin');
    toast.success('Logged out successfully');
  };
  
  const getCurrentPageTitle = () => {
    const path = location.pathname;
    
    if (path.endsWith('/settings')) {
      return 'Settings';
    } else if (path.endsWith('/analytics')) {
      return 'Analytics';
    } else if (path.endsWith('/foods')) {
      return 'Food Management';
    } else if (path.endsWith('/locations')) {
      return 'Location Management';
    } else if (path.endsWith('/payment-methods')) {
      return 'Payment Methods';
    } else if (path.endsWith('/categories')) {
      return 'Category Management';
    } else if (path.endsWith('/additional-options')) {
      return 'Additional Options Management';
    } else {
      return 'Bookings Management';
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <div className="flex flex-col md:flex-row">
        {/* Sidebar */}
        <AdminNavbar isMobile={isMobile} />
        
        {/* Main Content */}
        <main className="flex-1">
          {isMobile && (
            <div className="h-16 bg-background"> {/* Spacer for mobile view */}
              {/* Navbar is rendered above the content in mobile view */}
            </div>
          )}
          
          <div className="p-4 md:p-8">
            <div className="mb-6 flex justify-between items-center">
              <h1 className="text-2xl md:text-3xl font-bold">{getCurrentPageTitle()}</h1>
              <div className="flex items-center gap-4">
                <ThemeToggle />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </div>
            </div>
            
            <Routes>
              <Route path="/" element={
                <BookingsTable 
                  bookings={bookings} 
                  onBookingsUpdate={handleBookingsUpdate} 
                />
              } />
              <Route path="settings" element={<SettingsPanel />} />
              <Route path="analytics" element={<EnhancedAnalyticsPanel />} />
              <Route path="foods" element={<FoodManagement />} />
              <Route path="locations" element={<LocationManagement />} />
              <Route path="payment-methods" element={<PaymentMethodManagement />} />
              <Route path="categories" element={<CategoryManagement />} />
              <Route path="additional-options" element={<AdditionalOptionsManagement />} />
              <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;