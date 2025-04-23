
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import AdminNavbar from '@/components/AdminNavbar';
import BookingsTable from '@/components/BookingsTable';
import SettingsPanel from '@/components/SettingsPanel';
import AnalyticsPanel from '@/components/AnalyticsPanel';
import { getBookings } from '@/lib/storage';

const AdminDashboard = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const [bookings, setBookings] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  
  useEffect(() => {
    loadBookings();
  }, [refreshKey]);
  
  const loadBookings = () => {
    const allBookings = getBookings();
    setBookings(allBookings);
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
    } else {
      return 'Bookings Management';
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col md:flex-row">
        {/* Sidebar */}
        <AdminNavbar isMobile={isMobile} />
        
        {/* Main Content */}
        <main className="flex-1">
          {isMobile && (
            <div className="h-16 bg-gray-50"> {/* This is a spacer for mobile view */}
              {/* Navbar is rendered above the content in mobile view */}
            </div>
          )}
          
          <div className="p-4 md:p-8">
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold">{getCurrentPageTitle()}</h1>
            </div>
            
            <Routes>
              <Route path="/" element={
                <BookingsTable 
                  bookings={bookings} 
                  onBookingsUpdate={handleBookingsUpdate} 
                />
              } />
              <Route path="settings" element={<SettingsPanel />} />
              <Route path="analytics" element={<AnalyticsPanel />} />
              <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
