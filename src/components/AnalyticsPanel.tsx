import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell, 
  Legend,
  CartesianGrid,
} from 'recharts';
import { toast } from 'sonner';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const COLORS = ['#E63946', '#F48C06', '#457B9D', '#8FBC8F', '#A8DADC'];
const STATUS_COLORS = {
  Pending: '#F59E0B',
  Confirmed: '#3B82F6',
  Delivered: '#10B981',
  Cancelled: '#EF4444',
};

const BACKEND_URL = 'http://localhost:4000';

const AnalyticsPanel = () => {
  const [analytics, setAnalytics] = useState({
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
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState(new Date());
  const [selectedInsight, setSelectedInsight] = useState(null);
  const [insightOpen, setInsightOpen] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [startDate, endDate]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${BACKEND_URL}/api/analytics?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          },
        }
      );

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to fetch analytics data (Status: ${response.status})`);
        } else {
          throw new Error(`Failed to fetch analytics data (Status: ${response.status}) - Unexpected response format`);
        }
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error(error.message || 'Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  };

  // Prepare data for charts
  const statusData = Object.entries(analytics.statusCounts).map(([name, value]) => ({
    name,
    value,
  }));

  const foodData = analytics.popularFoods.map((item) => ({
    name: item.name.length > 20 ? `${item.name.slice(0, 20)}...` : item.name,
    value: item.count,
  }));

  const categoryData = analytics.popularCategories.map((item) => ({
    name: item.name,
    value: item.count,
  }));

  const locationData = analytics.topLocations.map((item) => ({
    name: item.name.length > 20 ? `${item.name.slice(0, 20)}...` : item.name,
    value: item.count,
  }));

  const paymentModeData = analytics.paymentModes.map((item) => ({
    name: item.name,
    value: item.count,
  }));

  const drinkData = analytics.drinkPreferences.map((item) => ({
    name: item.name,
    value: item.count,
  }));

  const ordersByDayData = analytics.ordersByDay;

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Analytics Report', 20, 10);
    
    // Summary
    doc.text('Summary', 20, 20);
    doc.autoTable({
      startY: 30,
      head: [['Metric', 'Value']],
      body: [
        ['Total Orders', analytics.totalBookings],
        ['Total Revenue', `GHS ${analytics.totalRevenue.toFixed(2)}`],
        ['Average Order Value', `GHS ${(analytics.totalBookings > 0 ? analytics.totalRevenue / analytics.totalBookings : 0).toFixed(2)}`],
      ],
    });

    // Orders by Status
    let finalY = doc.lastAutoTable.finalY + 10;
    doc.text('Orders by Status', 20, finalY);
    doc.autoTable({
      startY: finalY + 10,
      head: [['Status', 'Count']],
      body: statusData.map((item) => [item.name, item.value]),
    });

    // Popular Foods
    finalY = doc.lastAutoTable.finalY + 10;
    doc.text('Popular Food Items', 20, finalY);
    doc.autoTable({
      startY: finalY + 10,
      head: [['Food Item', 'Quantity Sold']],
      body: foodData.map((item) => [item.name, item.value]),
    });

    // Popular Categories
    finalY = doc.lastAutoTable.finalY + 10;
    doc.text('Popular Categories', 20, finalY);
    doc.autoTable({
      startY: finalY + 10,
      head: [['Category', 'Quantity Sold']],
      body: categoryData.map((item) => [item.name, item.value]),
    });

    // Top Locations
    finalY = doc.lastAutoTable.finalY + 10;
    doc.text('Top Buying Locations', 20, finalY);
    doc.autoTable({
      startY: finalY + 10,
      head: [['Location', 'Order Count']],
      body: locationData.map((item) => [item.name, item.value]),
    });

    // Payment Modes
    finalY = doc.lastAutoTable.finalY + 10;
    doc.text('Payment Modes', 20, finalY);
    doc.autoTable({
      startY: finalY + 10,
      head: [['Payment Mode', 'Count']],
      body: paymentModeData.map((item) => [item.name, item.value]),
    });

    // Drink Preferences
    finalY = doc.lastAutoTable.finalY + 10;
    doc.text('Drink Preferences', 20, finalY);
    doc.autoTable({
      startY: finalY + 10,
      head: [['Drink', 'Count']],
      body: drinkData.map((item) => [item.name, item.value]),
    });

    doc.save('analytics-report.pdf');
  };

  // Export to Excel
  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();

    // Summary Sheet
    const summaryData = [
      ['Metric', 'Value'],
      ['Total Orders', analytics.totalBookings],
      ['Total Revenue', `GHS ${analytics.totalRevenue.toFixed(2)}`],
      ['Average Order Value', `GHS ${(analytics.totalBookings > 0 ? analytics.totalRevenue / analytics.totalBookings : 0).toFixed(2)}`],
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Orders by Status Sheet
    const statusSheetData = [['Status', 'Count'], ...statusData.map((item) => [item.name, item.value])];
    const statusSheet = XLSX.utils.aoa_to_sheet(statusSheetData);
    XLSX.utils.book_append_sheet(workbook, statusSheet, 'Orders by Status');

    // Popular Foods Sheet
    const foodSheetData = [['Food Item', 'Quantity Sold'], ...foodData.map((item) => [item.name, item.value])];
    const foodSheet = XLSX.utils.aoa_to_sheet(foodSheetData);
    XLSX.utils.book_append_sheet(workbook, foodSheet, 'Popular Foods');

    // Popular Categories Sheet
    const categorySheetData = [['Category', 'Quantity Sold'], ...categoryData.map((item) => [item.name, item.value])];
    const categorySheet = XLSX.utils.aoa_to_sheet(categorySheetData);
    XLSX.utils.book_append_sheet(workbook, categorySheet, 'Popular Categories');

    // Top Locations Sheet
    const locationSheetData = [['Location', 'Order Count'], ...locationData.map((item) => [item.name, item.value])];
    const locationSheet = XLSX.utils.aoa_to_sheet(locationSheetData);
    XLSX.utils.book_append_sheet(workbook, locationSheet, 'Top Locations');

    // Payment Modes Sheet
    const paymentModeSheetData = [['Payment Mode', 'Count'], ...paymentModeData.map((item) => [item.name, item.value])];
    const paymentModeSheet = XLSX.utils.aoa_to_sheet(paymentModeSheetData);
    XLSX.utils.book_append_sheet(workbook, paymentModeSheet, 'Payment Modes');

    // Drink Preferences Sheet
    const drinkSheetData = [['Drink', 'Count'], ...drinkData.map((item) => [item.name, item.value])];
    const drinkSheet = XLSX.utils.aoa_to_sheet(drinkSheetData);
    XLSX.utils.book_append_sheet(workbook, drinkSheet, 'Drink Preferences');

    XLSX.writeFile(workbook, 'analytics-report.xlsx');
  };

  // Handle chart clicks for insights
  const handleFoodClick = (data) => {
    const foodInsight = analytics.detailedFoodData.find((item) => item.name === data.name);
    setSelectedInsight({ type: 'food', data: foodInsight });
    setInsightOpen(true);
  };

  const handleCategoryClick = (data) => {
    const categoryInsight = analytics.detailedCategoryData.find((item) => item.name === data.name);
    setSelectedInsight({ type: 'category', data: categoryInsight });
    setInsightOpen(true);
  };

  const handleLocationClick = (data) => {
    const locationInsight = analytics.detailedLocationData.find((item) => item.name === data.name);
    setSelectedInsight({ type: 'location', data: locationInsight });
    setInsightOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading analytics data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Analytics Dashboard</h2>

      {/* Date Range Filter */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="font-medium">Start Date:</label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            showTimeSelect
            dateFormat="Pp"
            className="border rounded px-2 py-1"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="font-medium">End Date:</label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            showTimeSelect
            dateFormat="Pp"
            className="border rounded px-2 py-1"
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={exportToPDF}>Export to PDF</Button>
          <Button onClick={exportToExcel}>Export to Excel</Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics.totalBookings}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">GHS {analytics.totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              GHS {analytics.totalBookings > 0 
                ? (analytics.totalRevenue / analytics.totalBookings).toFixed(2) 
                : '0.00'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Orders by Status (Pie Chart) */}
        <Card>
          <CardHeader>
            <CardTitle>Orders by Status</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-80">
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={STATUS_COLORS[entry.name] || COLORS[index % COLORS.length]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`${value} orders`, 'Count']} 
                      labelFormatter={(value) => `Status: ${value}`} 
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  No data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Popular Food Items (Bar Chart) */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Food Items</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-80">
              {foodData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={foodData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 60,
                    }}
                  >
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end" 
                      height={60}
                      interval={0}
                    />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} orders`, 'Quantity']} />
                    <Bar dataKey="value" fill="#E63946" onClick={handleFoodClick} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  No data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Popular Categories (Pie Chart) */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Categories</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-80">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      onClick={handleCategoryClick}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} items`, 'Quantity']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  No data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Buying Locations (Bar Chart) */}
        <Card>
          <CardHeader>
            <CardTitle>Top Buying Locations</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-80">
              {locationData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={locationData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 60,
                    }}
                  >
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end" 
                      height={60}
                      interval={0}
                    />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} orders`, 'Count']} />
                    <Bar dataKey="value" fill="#457B9D" onClick={handleLocationClick} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  No data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment Modes (Pie Chart) */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Modes</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-80">
              {paymentModeData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentModeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {paymentModeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} orders`, 'Count']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  No data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Drink Preferences (Pie Chart) */}
        <Card>
          <CardHeader>
            <CardTitle>Drink Preferences</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-80">
              {drinkData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={drinkData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {drinkData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} orders`, 'Count']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  No data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Orders Over Time (Histogram) */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>Orders Over Time</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-80">
              {ordersByDayData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={ordersByDayData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 60,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      angle={-45} 
                      textAnchor="end" 
                      height={60}
                      interval={Math.floor(ordersByDayData.length / 10)}
                    />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} orders`, 'Count']} />
                    <Bar dataKey="count" fill="#8FBC8F" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  No data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights Dialog */}
      <Dialog open={insightOpen} onOpenChange={setInsightOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {selectedInsight?.type === 'food' && `Food Item: ${selectedInsight?.data.name}`}
              {selectedInsight?.type === 'category' && `Category: ${selectedInsight?.data.name}`}
              {selectedInsight?.type === 'location' && `Location: ${selectedInsight?.data.name}`}
            </DialogTitle>
          </DialogHeader>
          {selectedInsight && (
            <div className="space-y-4">
              <div>
                <p><strong>Total Quantity Sold:</strong> {selectedInsight.data.count}</p>
                <p><strong>Total Revenue:</strong> GHS {selectedInsight.data.totalRevenue.toFixed(2)}</p>
              </div>
              <div>
                <h3 className="font-semibold">Related Orders</h3>
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border px-4 py-2">Order ID</th>
                        {selectedInsight.type !== 'location' && <th className="border px-4 py-2">Quantity</th>}
                        {selectedInsight.type === 'location' && <th className="border px-4 py-2">Food Item</th>}
                        {selectedInsight.type !== 'location' && <th className="border px-4 py-2">Delivery Location</th>}
                        <th className="border px-4 py-2">Status</th>
                        <th className="border px-4 py-2">Order Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInsight.data.orders.map((order, index) => (
                        <tr key={index} className="border">
                          <td className="border px-4 py-2">{order.order_id}</td>
                          {selectedInsight.type !== 'location' && (
                            <td className="border px-4 py-2">{order.quantity}</td>
                          )}
                          {selectedInsight.type === 'location' && (
                            <td className="border px-4 py-2">{order.food_name}</td>
                          )}
                          {selectedInsight.type !== 'location' && (
                            <td className="border px-4 py-2">{order.delivery_location}</td>
                          )}
                          <td className="border px-4 py-2">{order.order_status}</td>
                          <td className="border px-4 py-2">
                            {new Date(order.created_at).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AnalyticsPanel;