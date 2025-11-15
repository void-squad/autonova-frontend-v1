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

export default function AdminDashboard() {
  const { user } = useAuth();

  const stats = [
    { label: 'Total Customers', value: '248', change: '+12%', icon: Users, color: 'text-primary' },
    { label: 'Active Appointments', value: '32', change: '+5%', icon: Calendar, color: 'text-accent' },
    { label: 'Monthly Revenue', value: '$42,350', change: '+23%', icon: DollarSign, color: 'text-green-600' },
    { label: 'Active Projects', value: '15', change: '-2%', icon: Wrench, color: 'text-secondary' },
  ];

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

  const recentActivity = [
    {
      id: '1',
      type: 'appointment',
      message: 'New appointment booked by John Smith',
      time: '5 minutes ago',
      icon: Calendar,
      color: 'text-primary',
    },
    {
      id: '2',
      type: 'project',
      message: 'Custom modification project completed',
      time: '1 hour ago',
      icon: CheckCircle,
      color: 'text-green-600',
    },
    {
      id: '3',
      type: 'alert',
      message: 'Employee time log pending review',
      time: '2 hours ago',
      icon: AlertCircle,
      color: 'text-accent',
    },
    {
      id: '4',
      type: 'payment',
      message: 'Invoice #1234 paid by Sarah Johnson',
      time: '3 hours ago',
      icon: DollarSign,
      color: 'text-green-600',
    },
  ];

  const employeePerformance = [
    { name: 'Mike Johnson', tasksCompleted: 45, hoursLogged: 152, efficiency: 95 },
    { name: 'Sarah Williams', tasksCompleted: 38, hoursLogged: 148, efficiency: 92 },
    { name: 'David Brown', tasksCompleted: 42, hoursLogged: 160, efficiency: 88 },
  ];

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
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg bg-muted ${activity.color}`}>
                    <activity.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Employee Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Top Employees</CardTitle>
            <CardDescription>Performance overview for this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {employeePerformance.map((employee, index) => (
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
