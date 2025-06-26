import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import AdminNavbar from '@/components/AdminNavbar';
import Dashboard from '@/pages/Dashboard';
import BookingsTable from '@/components/BookingsTable';
import SettingsPanel from '@/components/SettingsPanel';
import EnhancedAnalyticsPanel from '@/components/EnhancedAnalyticsPanel';
import FoodManagement from '@/components/FoodManagement';
import LocationManagement from '@/components/LocationManagement';
import PaymentMethodManagement from '@/components/PaymentMethodManagement';
import CategoryManagement from '@/components/CategoryManagement';
import AdditionalOptionsManagement from '@/components/AdditionalOptionsManagement';

import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Bell, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BACKEND_URL = 'http://localhost:3000';

const AdminDashboard = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState(null);
  const [filterDate, setFilterDate] = useState(null);
  
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

    // Reset filters when navigating directly to orders page
    if (location.pathname.endsWith('/orders')) {
      // Reset filters when coming from menu navigation
      setFilterStatus(null);
      setFilterDate(null);
      loadBookings();
    }
  }, [navigate, location.pathname]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: '1',
        limit: '10',
      });
      
      if (filterStatus) params.append('status', filterStatus);
      if (filterDate) {
        params.append('startDate', filterDate);
        params.append('endDate', filterDate);
      }

      const response = await fetch(`${BACKEND_URL}/api/orders?${params}`, {
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

      const data = await response.json();
      setBookings(data.orders || []);
    } catch (error) {
      toast.error(error.message || 'Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleBookingsUpdate = useCallback((updatedBookings) => {
    if (updatedBookings) {
      setBookings(updatedBookings);
    } else {
      loadBookings();
    }
  }, []);

  // Handle filter changes from dashboard cards
  const handleDashboardFilter = useCallback((status, date) => {
    setFilterStatus(status);
    setFilterDate(date);
    navigate('/admin/dashboard/orders');
  }, [navigate]);
  
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('tokenExpiry');
    navigate('/admin');
    toast.success('Logged out successfully');
  };
  
  const getCurrentPageTitle = () => {
    const path = location.pathname;
    
    if (path.endsWith('/dashboard') || path === '/admin/dashboard') {
      return 'Dashboard';
    } else if (path.endsWith('/orders')) {
      return 'Orders Management';
    } else if (path.endsWith('/settings')) {
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
      return 'Dashboard';
    }
  };

  const LoadingSkeleton = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  );
  
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
              <Route path="/" element={<Dashboard onDashboardFilter={handleDashboardFilter} />} />
              <Route path="orders" element={
                <BookingsTable 
                  bookings={bookings} 
                  onBookingsUpdate={handleBookingsUpdate}
                  initialStatus={filterStatus}
                  initialDate={filterDate}
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
