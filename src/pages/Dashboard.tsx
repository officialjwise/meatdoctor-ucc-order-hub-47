
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ShoppingBag, 
  DollarSign, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = 'http://localhost:3000';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  todayOrders: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/analytics`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats({
          totalOrders: data.totalBookings || 0,
          totalRevenue: data.totalRevenue || 0,
          pendingOrders: data.statusCounts?.Pending || 0,
          completedOrders: data.statusCounts?.Delivered || 0,
          cancelledOrders: data.statusCounts?.Cancelled || 0,
          todayOrders: data.ordersByDay?.slice(-1)[0]?.count || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, description, color = "default", onClick }) => (
    <Card className={`cursor-pointer hover:shadow-lg transition-shadow ${onClick ? 'hover:bg-accent/50' : ''}`} onClick={onClick}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${
          color === 'green' ? 'text-green-600' :
          color === 'blue' ? 'text-blue-600' :
          color === 'yellow' ? 'text-yellow-600' :
          color === 'red' ? 'text-red-600' :
          'text-muted-foreground'
        }`} />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
          </>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your food delivery business</p>
        </div>
        <Button onClick={() => navigate('/admin/dashboard/analytics')}>
          View Full Analytics
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders || 0}
          icon={ShoppingBag}
          description="All time orders"
          onClick={() => navigate('/admin/dashboard')}
        />
        <StatCard
          title="Total Revenue"
          value={`GHS ${stats?.totalRevenue?.toFixed(2) || '0.00'}`}
          icon={DollarSign}
          description="All time revenue"
          color="green"
        />
        <StatCard
          title="Today's Orders"
          value={stats?.todayOrders || 0}
          icon={TrendingUp}
          description="Orders received today"
          color="blue"
        />
        <StatCard
          title="Pending Orders"
          value={stats?.pendingOrders || 0}
          icon={Clock}
          description="Awaiting processing"
          color="yellow"
          onClick={() => navigate('/admin/dashboard')}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Completed Orders"
          value={stats?.completedOrders || 0}
          icon={CheckCircle}
          description="Successfully delivered"
          color="green"
        />
        <StatCard
          title="Processing Orders"
          value={stats?.pendingOrders || 0}
          icon={AlertCircle}
          description="Currently being prepared"
          color="blue"
        />
        <StatCard
          title="Cancelled Orders"
          value={stats?.cancelledOrders || 0}
          icon={XCircle}
          description="Orders cancelled"
          color="red"
        />
      </div>

      {loading && (
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
