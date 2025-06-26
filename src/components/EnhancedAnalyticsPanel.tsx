
import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/hooks/use-theme';
import { Skeleton } from '@/components/ui/skeleton';
import Sweetalert2 from 'sweetalert2';
import { Analytics, Booking } from '@/lib/types';

const BACKEND_URL = 'http://localhost:3000';

const EnhancedAnalyticsPanel = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState<Analytics>({
    totalBookings: 0,
    totalRevenue: 0,
    statusCounts: {},
    popularFoods: [],
    popularCategories: [],
    topLocations: [],
    paymentModes: [],
    drinkPreferences: [],
    ordersByDay: [],
    detailedFoodData: [],
    detailedCategoryData: [],
    detailedLocationData: [],
  });
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      let url = `${BACKEND_URL}/api/analytics`;
      if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to fetch analytics (Status: ${response.status})`);
        } else {
          throw new Error(`Failed to fetch analytics (Status: ${response.status}) - Unexpected response format`);
        }
      }

      const data: Analytics = await response.json();
      setAnalytics(data);
    } catch (error) {
      Sweetalert2.fire('Error', error.message || 'Failed to load analytics.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      let url = `${BACKEND_URL}/api/orders?limit=1000`;
      if (startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to fetch bookings (Status: ${response.status})`);
        } else {
          throw new Error(`Failed to fetch bookings (Status: ${response.status}) - Unexpected response format`);
        }
      }

      const data = await response.json();
      // Defensive check to ensure bookings is always an array
      setBookings(Array.isArray(data.orders) ? data.orders : []);
    } catch (error) {
      Sweetalert2.fire('Error', error.message || 'Failed to load bookings.', 'error');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterSubmit = () => {
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      Sweetalert2.fire('Error', 'Start date cannot be after end date.', 'error');
      return;
    }
    fetchAnalyticsData();
    fetchBookings();
  };

  const setTodayFilter = () => {
    const today = new Date().toISOString().slice(0, 10);
    setStartDate(today);
    setEndDate(today);
  };

  const setWeekFilter = () => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - 7);
    setStartDate(weekStart.toISOString().slice(0, 10));
    setEndDate(today.toISOString().slice(0, 10));
  };

  const setMonthFilter = () => {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    setStartDate(monthStart.toISOString().slice(0, 10));
    setEndDate(today.toISOString().slice(0, 10));
  };

  useEffect(() => {
    fetchAnalyticsData();
    fetchBookings();
  }, []);

  // Calculate revenue only for successful payments
  const calculateRevenue = (orders: Booking[]) => {
    if (!Array.isArray(orders)) return 0;
    return orders
      .filter(order => order.payment_status === 'success' || order.order_status === 'Delivered')
      .reduce((sum, order) => sum + (order.totalPrice || 0), 0);
  };

  // Generate monthly order data with revenue calculation
  const getMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = months.map(month => ({
      name: month,
      orders: 0,
      revenue: 0,
    }));
    
    if (Array.isArray(bookings)) {
      bookings.forEach(booking => {
        const date = new Date(booking.created_at);
        if (!startDate || !endDate || (date >= new Date(startDate) && date <= new Date(endDate))) {
          const monthIndex = date.getMonth();
          monthlyData[monthIndex].orders += 1;
          if (booking.payment_status === 'success' || booking.order_status === 'Delivered') {
            monthlyData[monthIndex].revenue += booking.totalPrice || 0;
          }
        }
      });
    }
    
    return monthlyData.filter(data => data.orders > 0 || data.revenue > 0);
  };

  // Format status data for pie chart
  const getStatusData = () => {
    return Object.entries(analytics.statusCounts).map(([name, value]) => ({
      name,
      value,
    }));
  };

  // Format popular foods data for bar chart
  const getFoodData = () => {
    return analytics.popularFoods;
  };

  // Format popular categories data
  const getCategoryData = () => {
    return analytics.popularCategories;
  };

  // Format top locations data
  const getLocationData = () => {
    return analytics.topLocations;
  };

  // Format payment modes data
  const getPaymentModeData = () => {
    return analytics.paymentModes;
  };

  // Format drink preferences data
  const getDrinkData = () => {
    return analytics.drinkPreferences;
  };

  // Format orders by day data
  const getOrdersByDayData = () => {
    return analytics.ordersByDay;
  };

  // Revenue insights
  const getTodayRevenue = () => {
    const today = new Date().toISOString().slice(0, 10);
    if (!Array.isArray(bookings)) return 0;
    return bookings
      .filter(order => order.created_at.slice(0, 10) === today)
      .reduce((sum, order) => {
        if (order.payment_status === 'success' || order.order_status === 'Delivered') {
          return sum + (order.totalPrice || 0);
        }
        return sum;
      }, 0);
  };

  const getWeekRevenue = () => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - 7);
    
    if (!Array.isArray(bookings)) return 0;
    return bookings
      .filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate >= weekStart && orderDate <= today;
      })
      .reduce((sum, order) => {
        if (order.payment_status === 'success' || order.order_status === 'Delivered') {
          return sum + (order.totalPrice || 0);
        }
        return sum;
      }, 0);
  };

  // Colors for charts based on theme
  const chartColors = {
    orders: theme === 'dark' ? '#82ca9d' : '#4caf50',
    revenue: theme === 'dark' ? '#8884d8' : '#3f51b5',
    food: theme === 'dark' ? '#ffbb28' : '#ff9800',
    category: theme === 'dark' ? '#ff7300' : '#ef6c00',
    location: theme === 'dark' ? '#00c4b4' : '#26a69a',
    payment: theme === 'dark' ? '#ab47bc' : '#8e24aa',
    drink: theme === 'dark' ? '#42a5f5' : '#1e88e5',
    status: {
      Pending: theme === 'dark' ? '#ffbb28' : '#ff9800',
      Confirmed: theme === 'dark' ? '#8884d8' : '#3f51b5',
      Delivered: theme === 'dark' ? '#82ca9d' : '#4caf50',
      Cancelled: theme === 'dark' ? '#ff8042' : '#f44336',
    },
  };

  // Generate weekly data for a more granular view
  const getWeeklyData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    
    const weeklyData = days.map(day => ({
      name: day,
      orders: 0,
      revenue: 0,
    }));
    
    if (Array.isArray(bookings)) {
      bookings.forEach(booking => {
        const date = new Date(booking.created_at);
        if (!startDate || !endDate || (date >= new Date(startDate) && date <= new Date(endDate))) {
          const dayDiff = Math.floor((date.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
          if (dayDiff >= 0 && dayDiff < 7) {
            const dayIndex = date.getDay();
            weeklyData[dayIndex].orders += 1;
            if (booking.payment_status === 'success' || booking.order_status === 'Delivered') {
              weeklyData[dayIndex].revenue += booking.totalPrice || 0;
            }
          }
        }
      });
    }
    
    return weeklyData.filter(data => data.orders > 0 || data.revenue > 0);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Analytics Dashboard</h2>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        <div>
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div className="flex items-end gap-2">
          <Button onClick={handleFilterSubmit}>Apply Filter</Button>
          <Button variant="outline" onClick={setTodayFilter}>Today</Button>
          <Button variant="outline" onClick={setWeekFilter}>Week</Button>
          <Button variant="outline" onClick={setMonthFilter}>Month</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalBookings}</div>
            <div className="text-xs text-muted-foreground">
              All time orders
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GHS {calculateRevenue(bookings).toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">
              Confirmed payments only
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today's Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GHS {getTodayRevenue().toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">
              Revenue earned today
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Week Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GHS {getWeekRevenue().toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">
              Last 7 days revenue
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="food">Food Items</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="payment">Payment Modes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Orders by Status</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={getStatusData()}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {getStatusData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={chartColors.status[entry.name] || '#8884d8'} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Popular Food Items</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getFoodData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar 
                      dataKey="count" 
                      fill={chartColors.food} 
                      radius={[4, 4, 0, 0]}
                      barSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={getMonthlyData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke={chartColors.revenue} 
                    strokeWidth={3}
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getWeeklyData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="orders" 
                    stroke={chartColors.orders} 
                    strokeWidth={2}
                    activeDot={{ r: 8 }} 
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="revenue" 
                    stroke={chartColors.revenue} 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getMonthlyData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="orders" 
                    stroke={chartColors.orders} 
                    strokeWidth={2}
                    activeDot={{ r: 8 }} 
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="revenue" 
                    stroke={chartColors.revenue} 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Orders by Day</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getOrdersByDayData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar 
                    dataKey="count" 
                    fill={chartColors.orders} 
                    radius={[4, 4, 0, 0]}
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="food" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Food Items Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getFoodData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar 
                    dataKey="count" 
                    fill={chartColors.food} 
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Popular Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getCategoryData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar 
                    dataKey="count" 
                    fill={chartColors.category} 
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Locations</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getLocationData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar 
                    dataKey="count" 
                    fill={chartColors.location} 
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Mode Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getPaymentModeData()}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill={chartColors.payment}
                    label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                  />
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedAnalyticsPanel;
