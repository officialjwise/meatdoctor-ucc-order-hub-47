
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, CalendarDays, TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users, MapPin } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Booking, Analytics } from '@/lib/types';
import LoadingSpinner from './LoadingSpinner';

const BACKEND_URL = 'http://localhost:3000';

const EnhancedAnalyticsPanel = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange, selectedCategory]); // Auto-fetch when filters change

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      // Build query parameters
      const params = new URLSearchParams();
      if (dateRange !== 'all') {
        const today = new Date();
        let startDate = '';
        let endDate = today.toISOString().split('T')[0];
        
        switch (dateRange) {
          case 'today':
            startDate = endDate;
            break;
          case 'week':
            const weekAgo = new Date(today);
            weekAgo.setDate(today.getDate() - 7);
            startDate = weekAgo.toISOString().split('T')[0];
            break;
          case 'month':
            const monthAgo = new Date(today);
            monthAgo.setMonth(today.getMonth() - 1);
            startDate = monthAgo.toISOString().split('T')[0];
            break;
          case 'year':
            const yearAgo = new Date(today);
            yearAgo.setFullYear(today.getFullYear() - 1);
            startDate = yearAgo.toISOString().split('T')[0];
            break;
        }
        
        if (startDate) {
          params.append('startDate', startDate);
          params.append('endDate', endDate);
        }
      }

      const [analyticsRes, ordersRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/analytics?${params}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${BACKEND_URL}/api/orders?${params}&limit=1000`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (analyticsRes.ok && ordersRes.ok) {
        const analyticsData = await analyticsRes.json();
        const ordersData = await ordersRes.json();
        
        setAnalytics(analyticsData);
        setBookings(Array.isArray(ordersData.orders) ? ordersData.orders : []);
      }
    } catch (error) {
      // Handle error silently
      setAnalytics(null);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate revenue metrics for confirmed orders only
  const calculateRevenue = (orders: Booking[], filterFn?: (order: Booking) => boolean) => {
    const filteredOrders = filterFn ? orders.filter(filterFn) : orders;
    return filteredOrders
      .filter(order => 
        order.payment_status === 'success' && 
        (order.order_status === 'Confirmed' || order.order_status === 'Delivered')
      )
      .reduce((sum, order) => sum + (order.totalPrice || 0), 0);
  };

  // Date filtering helpers
  const isToday = (date: string) => {
    const today = new Date().toISOString().slice(0, 10);
    return date.startsWith(today);
  };

  const isThisWeek = (date: string) => {
    const orderDate = new Date(date);
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);
    return orderDate >= weekAgo && orderDate <= today;
  };

  const isThisMonth = (date: string) => {
    const orderDate = new Date(date);
    const today = new Date();
    return orderDate.getMonth() === today.getMonth() && 
           orderDate.getFullYear() === today.getFullYear();
  };

  const isThisYear = (date: string) => {
    const orderDate = new Date(date);
    const today = new Date();
    return orderDate.getFullYear() === today.getFullYear();
  };

  // Revenue calculations
  const todaysRevenue = calculateRevenue(bookings, (order) => isToday(order.created_at));
  const thisWeekRevenue = calculateRevenue(bookings, (order) => isThisWeek(order.created_at));
  const thisMonthRevenue = calculateRevenue(bookings, (order) => isThisMonth(order.created_at));
  const thisYearRevenue = calculateRevenue(bookings, (order) => isThisYear(order.created_at));

  // Previous period comparisons
  const lastWeekOrders = bookings.filter(order => {
    const orderDate = new Date(order.created_at);
    const today = new Date();
    const twoWeeksAgo = new Date(today);
    twoWeeksAgo.setDate(today.getDate() - 14);
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);
    return orderDate >= twoWeeksAgo && orderDate < weekAgo;
  });
  const lastWeekRevenue = calculateRevenue(lastWeekOrders);

  const lastMonthOrders = bookings.filter(order => {
    const orderDate = new Date(order.created_at);
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    return orderDate >= lastMonth && orderDate < thisMonth;
  });
  const lastMonthRevenue = calculateRevenue(lastMonthOrders);

  // Growth calculations
  const weeklyGrowth = lastWeekRevenue > 0 ? ((thisWeekRevenue - lastWeekRevenue) / lastWeekRevenue * 100) : 0;
  const monthlyGrowth = lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100) : 0;

  // Chart data
  const revenueChartData = analytics?.ordersByDay?.map(day => ({
    date: day.date,
    revenue: calculateRevenue(bookings.filter(order => order.created_at.startsWith(day.date))),
    orders: day.count
  })) || [];

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="lg" />
        <span className="ml-2">Loading analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Advanced Analytics</h1>
          <p className="text-muted-foreground">Comprehensive business insights and performance metrics</p>
        </div>
        
        <div className="flex gap-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Revenue Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GHS {todaysRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Confirmed orders only</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GHS {thisWeekRevenue.toFixed(2)}</div>
            <p className={`text-xs flex items-center ${weeklyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {weeklyGrowth >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {Math.abs(weeklyGrowth).toFixed(1)}% vs last week
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GHS {thisMonthRevenue.toFixed(2)}</div>
            <p className={`text-xs flex items-center ${monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {monthlyGrowth >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {Math.abs(monthlyGrowth).toFixed(1)}% vs last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Year</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GHS {thisYearRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Year to date</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Daily revenue over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`GHS ${Number(value).toFixed(2)}`, 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Order Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
            <CardDescription>Breakdown of order statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(analytics?.statusCounts || {}).map(([name, count]) => ({ name, count }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {Object.entries(analytics?.statusCounts || {}).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Popular Items Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Popular Foods */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Foods</CardTitle>
            <CardDescription>Top selling items</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics?.popularFoods?.slice(0, 10) || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Locations */}
        <Card>
          <CardHeader>
            <CardTitle>Top Delivery Locations</CardTitle>
            <CardDescription>Most popular delivery areas</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics?.topLocations?.slice(0, 10) || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalBookings || 0}</div>
            <p className="text-xs text-muted-foreground">All time orders</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              GHS {analytics?.totalBookings > 0 ? (analytics.totalRevenue / analytics.totalBookings).toFixed(2) : '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">Per order average</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Locations</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.topLocations?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Delivery areas served</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedAnalyticsPanel;
