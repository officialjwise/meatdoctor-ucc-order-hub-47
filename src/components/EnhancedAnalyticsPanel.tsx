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
import Sweetalert2 from 'sweetalert2';
import { Analytics, Booking } from '@/lib/types';

const BACKEND_URL = 'http://localhost:3000';

const EnhancedAnalyticsPanel = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');
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
      console.error('Error fetching analytics:', error);
      Sweetalert2.fire('Error', error.message || 'Failed to load analytics.', 'error');
    }
  };

  const fetchBookings = async () => {
    try {
      let url = `${BACKEND_URL}/api/orders`;
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
          throw new Error(errorData.message || `Failed to fetch bookings (Status: ${response.status})`);
        } else {
          throw new Error(`Failed to fetch bookings (Status: ${response.status}) - Unexpected response format`);
        }
      }

      const data: Booking[] = await response.json();
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      Sweetalert2.fire('Error', error.message || 'Failed to load bookings.', 'error');
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

  useEffect(() => {
    fetchAnalyticsData();
    fetchBookings();
  }, []);

  // Generate monthly order data
  const getMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = months.map(month => ({
      name: month,
      orders: 0,
      revenue: 0,
    }));
    
    bookings.forEach(booking => {
      const date = new Date(booking.created_at);
      if (!startDate || !endDate || (date >= new Date(startDate) && date <= new Date(endDate))) {
        const monthIndex = date.getMonth();
        monthlyData[monthIndex].orders += 1;
        monthlyData[monthIndex].revenue += booking.food.price * booking.quantity;
      }
    });
    
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
    
    bookings.forEach(booking => {
      const date = new Date(booking.created_at);
      if (!startDate || !endDate || (date >= new Date(startDate) && date <= new Date(endDate))) {
        const dayDiff = Math.floor((date.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
        if (dayDiff >= 0 && dayDiff < 7) {
          const dayIndex = date.getDay();
          weeklyData[dayIndex].orders += 1;
          weeklyData[dayIndex].revenue += booking.food.price * booking.quantity;
        }
      }
    });
    
    return weeklyData.filter(data => data.orders > 0 || data.revenue > 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Analytics Dashboard</h2>
      </div>

      <div className="flex space-x-4 mb-4">
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
        <div className="flex items-end">
          <Button onClick={handleFilterSubmit}>Apply Filter</Button>
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
              +2.5% from last month
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
            <div className="text-2xl font-bold">GHS {analytics.totalRevenue.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">
              +5.1% from last month
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Order Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              GHS {(analytics.totalBookings ? analytics.totalRevenue / analytics.totalBookings : 0).toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">
              +1.2% from last month
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.statusCounts?.Pending || 0}
            </div>
            <div className="text-xs text-muted-foreground">
              Orders awaiting processing
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="food">Food Items</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="payment">Payment Modes</TabsTrigger>
          <TabsTrigger value="drinks">Drink Preferences</TabsTrigger>
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

          <Card>
            <CardHeader>
              <CardTitle>Detailed Food Insights</CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.detailedFoodData.map((food, index) => (
                <details key={index} className="mb-2">
                  <summary className="cursor-pointer font-medium">
                    {food.name} (Orders: {food.count}, Revenue: GHS {food.totalRevenue.toFixed(2)})
                  </summary>
                  <div className="mt-2 pl-4">
                    <table className="w-full text-sm">
                      <thead>
                        <tr>
                          <th className="text-left">Order ID</th>
                          <th className="text-left">Quantity</th>
                          <th className="text-left">Location</th>
                          <th className="text-left">Status</th>
                          <th className="text-left">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {food.orders.map((order, idx) => (
                          <tr key={idx}>
                            <td>{order.order_id}</td>
                            <td>{order.quantity}</td>
                            <td>{order.delivery_location}</td>
                            <td>{order.order_status}</td>
                            <td>{new Date(order.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </details>
              ))}
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

          <Card>
            <CardHeader>
              <CardTitle>Detailed Category Insights</CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.detailedCategoryData.map((category, index) => (
                <details key={index} className="mb-2">
                  <summary className="cursor-pointer font-medium">
                    {category.name} (Orders: {category.count}, Revenue: GHS {category.totalRevenue.toFixed(2)})
                  </summary>
                  <div className="mt-2 pl-4">
                    <table className="w-full text-sm">
                      <thead>
                        <tr>
                          <th className="text-left">Order ID</th>
                          <th className="text-left">Quantity</th>
                          <th className="text-left">Location</th>
                          <th className="text-left">Status</th>
                          <th className="text-left">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {category.orders.map((order, idx) => (
                          <tr key={idx}>
                            <td>{order.order_id}</td>
                            <td>{order.quantity}</td>
                            <td>{order.delivery_location}</td>
                            <td>{order.order_status}</td>
                            <td>{new Date(order.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </details>
              ))}
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

          <Card>
            <CardHeader>
              <CardTitle>Detailed Location Insights</CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.detailedLocationData.map((location, index) => (
                <details key={index} className="mb-2">
                  <summary className="cursor-pointer font-medium">
                    {location.name} (Orders: {location.count}, Revenue: GHS {location.totalRevenue.toFixed(2)})
                  </summary>
                  <div className="mt-2 pl-4">
                    <table className="w-full text-sm">
                      <thead>
                        <tr>
                          <th className="text-left">Order ID</th>
                          <th className="text-left">Quantity</th>
                          <th className="text-left">Food</th>
                          <th className="text-left">Status</th>
                          <th className="text-left">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {location.orders.map((order, idx) => (
                          <tr key={idx}>
                            <td>{order.order_id}</td>
                            <td>{order.quantity}</td>
                            <td>{order.food_name}</td>
                            <td>{order.order_status}</td>
                            <td>{new Date(order.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </details>
              ))}
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

        <TabsContent value="drinks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Drink Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getDrinkData()}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill={chartColors.drink}
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