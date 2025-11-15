import {
  Calendar,
  Car,
  Wrench,
  CreditCard,
  FileText,
  TrendingUp,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { getVehicleStats } from '@/services/authService';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [vehicleCount, setVehicleCount] = useState<number | null>(null);
  const [loadingVehicles, setLoadingVehicles] = useState(true);

  const displayName = user?.firstName || user?.name || 'Customer';

  useEffect(() => {
    const fetchVehicleStats = async () => {
      try {
        const stats = await getVehicleStats();
        setVehicleCount(stats.totalVehicles);
      } catch (error) {
        console.error('Failed to fetch vehicle stats:', error);
        setVehicleCount(0);
      } finally {
        setLoadingVehicles(false);
      }
    };

    fetchVehicleStats();
  }, []);

  const { data: projects } = useQuery<ProjectSummary[]>({
    queryKey: ['customer-projects'],
    queryFn: fetchCustomerProjects,
    staleTime: 60 * 1000,
  });

  const stats = [
    {
      label: 'Upcoming Appointments',
      value: '2',
      icon: Calendar,
      color: 'text-primary',
    },
    {
      label: 'Vehicles Registered',
      value: loadingVehicles ? '...' : vehicleCount?.toString() || '0',
      icon: Car,
      color: 'text-accent',
    },
    {
      label: 'Active Projects',
      value: '1',
      icon: Wrench,
      color: 'text-secondary',
    },
    {
      label: 'Unpaid Invoices',
      value: '$450',
      icon: CreditCard,
      color: 'text-destructive',
    },
  ];

  const quickActions = [
    {
      title: 'Book Appointment',
      description: 'Schedule your next service',
      icon: Calendar,
      href: '/customer/appointments/book',
    },
    {
      title: 'My Vehicles',
      description: 'Manage your vehicles',
      icon: Car,
      href: '/customer/vehicles',
    },
    {
      title: 'Service History',
      description: 'View past services',
      icon: FileText,
      href: '/customer/reports',
    },
    {
      title: 'Pay Bills',
      description: 'View and pay invoices',
      icon: CreditCard,
      href: '/customer/billing',
    },
  ];

  const upcomingAppointments = [
    {
      id: '1',
      date: '2025-11-05',
      time: '10:00 AM',
      service: 'Oil Change',
      vehicle: '2022 Honda Civic',
      status: 'confirmed',
    },
    {
      id: '2',
      date: '2025-11-12',
      time: '2:00 PM',
      service: 'Brake Inspection',
      vehicle: '2020 Toyota Camry',
      status: 'pending',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {displayName}!</h1>
        <p className="text-muted-foreground mt-1">
          Here's what's happening with your vehicles
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.label}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Card
              key={action.title}
              className="hover:shadow-lg transition-smooth cursor-pointer group"
            >
              <Link to={action.href}>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-smooth">
                      <action.icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-base">{action.title}</CardTitle>
                  </div>
                  <CardDescription className="mt-2">
                    {action.description}
                  </CardDescription>
                </CardHeader>
              </Link>
            </Card>
          ))}
        </div>
      </div>

      {projects && projects.length > 0 && (
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Your Projects</CardTitle>
              <CardDescription>Latest vehicle modifications in progress</CardDescription>
            </div>
            <Button variant="outline" asChild>
              <Link to="/customer/appointments">Track all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {projects.slice(0, 3).map((project) => (
              <div key={project.projectId} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{project.title}</p>
                    <p className="text-sm text-muted-foreground">Vehicle: {project.vehicleId}</p>
                  </div>
                  <StatusBadge status={project.status} />
                </div>
                <div className="text-sm text-muted-foreground flex gap-4">
                  <span>
                    Requested:{' '}
                    {project.requestedStart ? format(new Date(project.requestedStart), 'MMM d') : 'N/A'}
                  </span>
                  <span>
                    Approved:{' '}
                    {project.approvedStart ? format(new Date(project.approvedStart), 'MMM d') : 'Pending'}
                  </span>
                </div>
                <Button size="sm" variant="outline" asChild>
                  <Link to={`/customer/progress/${project.projectId}`}>View details</Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Upcoming Appointments */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
          <CardDescription>
            Your scheduled services and maintenance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-smooth"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{appointment.service}</p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.vehicle}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{appointment.date}</p>
                  <p className="text-sm text-muted-foreground">
                    {appointment.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4" asChild>
            <Link to="/customer/appointments">View All Appointments</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
