import { useEffect, useState } from 'react';
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Wrench,
  Clock,
  CheckCircle,
  AlertCircle,
  UserCog,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8089/api/analytics/dashboard');
      setDashboardData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Build stats array from backend data
  const stats = dashboardData ? [
    { 
      label: 'Total Customers', 
      value: dashboardData.stats.totalCustomers.toString(), 
      change: '+12%', 
      icon: Users, 
      color: 'text-primary' 
    },
    { 
      label: 'Active Appointments', 
      value: dashboardData.stats.activeAppointments.toString(), 
      change: '+5%', 
      icon: Calendar, 
      color: 'text-accent' 
    },
    { 
      label: 'Monthly Revenue', 
      value: formatCurrency(dashboardData.stats.monthlyRevenue), 
      change: '+23%', 
      icon: DollarSign, 
      color: 'text-green-600' 
    },
    { 
      label: 'Active Projects', 
      value: dashboardData.stats.activeProjects.toString(), 
      change: '-2%', 
      icon: Wrench, 
      color: 'text-secondary' 
    },
  ] : [];

  const quickLinks = [
    {
      title: 'Employee Management',
      description: 'Manage employees & workload',
      icon: UserCog,
      href: '/admin/employees',
    },
    {
      title: 'User Management',
      description: 'Manage users and roles',
      icon: Users,
      href: '/admin/users',
    },
    {
      title: 'Appointments',
      description: 'View all appointments',
      icon: Calendar,
      href: '/admin/appointments',
    },
    {
      title: 'Projects',
      description: 'Manage all projects',
      icon: Wrench,
      href: '/admin/projects',
    },
    {
      title: 'Analytics',
      description: 'View detailed reports',
      icon: TrendingUp,
      href: '/admin/analytics',
    },
  ];

  // Map activity types to icons
  const getActivityIcon = (type) => {
    switch (type) {
      case 'appointment':
        return { icon: Calendar, color: 'text-primary' };
      case 'project':
        return { icon: CheckCircle, color: 'text-green-600' };
      case 'alert':
        return { icon: AlertCircle, color: 'text-accent' };
      case 'payment':
        return { icon: DollarSign, color: 'text-green-600' };
      default:
        return { icon: Clock, color: 'text-muted-foreground' };
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Dashboard</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={fetchDashboardData} className="w-full">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No data state
  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>No Data Available</CardTitle>
            <CardDescription>Dashboard data could not be loaded</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={fetchDashboardData} className="w-full">
              Refresh
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back, {user?.userName}. Here's your business overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className={stat.change.startsWith('+') ? 'text-green-600' : 'text-destructive'}>
                  {stat.change}
                </span>{' '}
                from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Access</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {quickLinks.map((link) => (
            <Card key={link.title} className="hover:shadow-lg transition-smooth cursor-pointer group">
              <Link to={link.href}>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-smooth">
                      <link.icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-base">{link.title}</CardTitle>
                  </div>
                  <CardDescription className="mt-2">{link.description}</CardDescription>
                </CardHeader>
              </Link>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system activities and updates</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData.recentActivity && dashboardData.recentActivity.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.recentActivity.map((activity) => {
                  const { icon: ActivityIcon, color } = getActivityIcon(activity.type);
                  return (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg bg-muted ${color}`}>
                        <ActivityIcon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{activity.message}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No recent activity</p>
            )}
          </CardContent>
        </Card>

        {/* Employee Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Top Employees</CardTitle>
            <CardDescription>Performance overview for this month</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData.topEmployees && dashboardData.topEmployees.length > 0 ? (
              <>
                <div className="space-y-4">
                  {dashboardData.topEmployees.map((employee, index) => (
                    <div key={employee.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-primary text-white font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{employee.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {employee.tasksCompleted} tasks • {employee.hoursLogged}h
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">{employee.efficiency}%</p>
                        <p className="text-xs text-muted-foreground">efficiency</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4" asChild>
                  <Link to="/admin/employees">View All Employees</Link>
                </Button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No employee data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-center">
        <Button onClick={fetchDashboardData} variant="outline">
          Refresh Dashboard
        </Button>
      </div>
    </div>
  );
}