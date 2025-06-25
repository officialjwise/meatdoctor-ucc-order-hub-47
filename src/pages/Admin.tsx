
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '@/components/AdminNavbar';
import BookingsTable from '@/components/BookingsTable';
import FoodManagement from '@/components/FoodManagement';
import SettingsPanel from '@/components/SettingsPanel';
import EnhancedAnalyticsPanel from '@/components/EnhancedAnalyticsPanel';
import CategoryManagement from '@/components/CategoryManagement';
import LocationManagement from '@/components/LocationManagement';
import PaymentMethodManagement from '@/components/PaymentMethodManagement';
import AdditionalOptionsManagement from '@/components/AdditionalOptionsManagement';
import AdminDashboard from './AdminDashboard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { TableSkeleton } from '@/components/AdminSkeleton';

const Admin = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin-login');
      return;
    }
    
    // Simulate loading time for better UX
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <AdminNavbar />
        <div className="container mx-auto p-6">
          <LoadingSpinner size="lg" text="Loading admin panel..." />
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'orders':
        return (
          <React.Suspense fallback={<TableSkeleton />}>
            <BookingsTable />
          </React.Suspense>
        );
      case 'foods':
        return (
          <React.Suspense fallback={<TableSkeleton />}>
            <FoodManagement />
          </React.Suspense>
        );
      case 'categories':
        return (
          <React.Suspense fallback={<TableSkeleton />}>
            <CategoryManagement />
          </React.Suspense>
        );
      case 'locations':
        return (
          <React.Suspense fallback={<TableSkeleton />}>
            <LocationManagement />
          </React.Suspense>
        );
      case 'payment-methods':
        return (
          <React.Suspense fallback={<TableSkeleton />}>
            <PaymentMethodManagement />
          </React.Suspense>
        );
      case 'additional-options':
        return (
          <React.Suspense fallback={<TableSkeleton />}>
            <AdditionalOptionsManagement />
          </React.Suspense>
        );
      case 'analytics':
        return (
          <React.Suspense fallback={<TableSkeleton />}>
            <EnhancedAnalyticsPanel />
          </React.Suspense>
        );
      case 'settings':
        return (
          <React.Suspense fallback={<TableSkeleton />}>
            <SettingsPanel />
          </React.Suspense>
        );
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminNavbar />
      <div className="container mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 mb-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="foods">Foods</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="locations">Locations</TabsTrigger>
            <TabsTrigger value="payment-methods">Payment</TabsTrigger>
            <TabsTrigger value="additional-options">Add-ons</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-6">
            {renderTabContent()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
