
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import AdminNavbar from '@/components/AdminNavbar';
import BookingsTable from '@/components/BookingsTable';
import SettingsPanel from '@/components/SettingsPanel';
import EnhancedAnalyticsPanel from '@/components/EnhancedAnalyticsPanel';
import FoodManagement from '@/components/FoodManagement';
import LocationManagement from '@/components/LocationManagement';
import PaymentMethodManagement from '@/components/PaymentMethodManagement';
import { getBookings } from '@/lib/storage';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { initNotificationSound, checkForNewOrders, playNotificationSound } from '@/lib/notifications';
import { toast } from 'sonner';
import { Bell } from 'lucide-react';

const AdminDashboard = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const [bookings, setBookings] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [previousBookingCount, setPreviousBookingCount] = useState(0);
  
  useEffect(() => {
    // Initialize notification sound
    initNotificationSound();
    
    // Set up polling for new bookings
    const pollInterval = setInterval(() => {
      loadBookings();
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(pollInterval);
  }, []);
  
  useEffect(() => {
    loadBookings();
  }, [refreshKey]);
  
  const loadBookings = () => {
    const allBookings = getBookings();
    
    // Check if we have new bookings
    if (previousBookingCount > 0 && allBookings.length > previousBookingCount) {
      // New order received!
      playNotificationSound();
      
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
              // Navigate to bookings if not already there
              if (!location.pathname.endsWith('/dashboard')) {
                window.location.href = '/admin/dashboard';
              }
            }
          }
        }
      );
    }
    
    setBookings(allBookings);
    setPreviousBookingCount(allBookings.length);
  };
  
  const handleBookingsUpdate = () => {
    // Increment refresh key to trigger useEffect
    setRefreshKey(prev => prev + 1);
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
              <ThemeToggle />
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
              <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
