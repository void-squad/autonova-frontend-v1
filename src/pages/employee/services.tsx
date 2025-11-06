import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Wrench,
  Clock,
  PlayCircle,
  CheckCircle,
  Calendar,
  User,
  Car,
  Filter,
  ArrowLeft,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { employeeApi } from '@/lib/api/employee';
import { ServiceTask, TaskPriority, TaskStatus } from '@/types/employee';
import { useToast } from '@/hooks/use-toast';

export default function EmployeeServices() {
  const { toast } = useToast();
  const [services, setServices] = useState<ServiceTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const loadServices = useCallback(async () => {
    try {
      setLoading(true);
      const data = await employeeApi.getServiceTasks();
      setServices(data);
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to load services',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const filterServices = () => {
    let filtered = services;

    if (statusFilter !== 'all') {
      filtered = filtered.filter((s) => s.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter((s) => s.priority === priorityFilter);
    }

    return filtered;
  };

  const getStatusBadge = (status: TaskStatus) => {
    const config: Record<TaskStatus, { variant: 'default' | 'destructive' | 'secondary' | 'outline'; label: string }> = {
      assigned: { variant: 'outline', label: 'Assigned' },
      in_progress: { variant: 'default', label: 'In Progress' },
      completed: { variant: 'secondary', label: 'Completed' },
      blocked: { variant: 'destructive', label: 'Blocked' },
      overdue: { variant: 'destructive', label: 'Overdue' },
    };
    return config[status];
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    const config = {
      urgent: { variant: 'destructive' as const, className: 'bg-red-500 hover:bg-red-600' },
      high: { variant: 'default' as const, className: 'bg-orange-500 hover:bg-orange-600' },
      normal: { variant: 'secondary' as const, className: '' },
      low: { variant: 'outline' as const, className: '' },
    };
    return config[priority] || config.normal;
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const groupByStatus = () => {
    const grouped: Record<TaskStatus, ServiceTask[]> = {
      assigned: [],
      in_progress: [],
      completed: [],
      blocked: [],
      overdue: [],
    };

    filterServices().forEach((service) => {
      if (grouped[service.status]) {
        grouped[service.status].push(service);
      }
    });

    return grouped;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-60" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const groupedServices = groupByStatus();
  const filteredServices = filterServices();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link to="/employee/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Service Tasks</h1>
            <p className="text-muted-foreground mt-1">
              Manage your assigned service appointments
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <CardTitle>Filters</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Priority</label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services Tabs */}
      <Tabs defaultValue="all">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">
            All ({filteredServices.length})
          </TabsTrigger>
          <TabsTrigger value="assigned">
            Assigned ({groupedServices.assigned.length})
          </TabsTrigger>
          <TabsTrigger value="in_progress">
            In Progress ({groupedServices.in_progress.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({groupedServices.completed.length})
          </TabsTrigger>
          <TabsTrigger value="blocked">
            Blocked ({groupedServices.blocked.length})
          </TabsTrigger>
          <TabsTrigger value="overdue">
            Overdue ({groupedServices.overdue.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-4">
          {filteredServices.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No service tasks found</p>
              </CardContent>
            </Card>
          ) : (
            filteredServices.map((service) => (
              <ServiceCard key={service.id} service={service} onUpdate={loadServices} />
            ))
          )}
        </TabsContent>

        {(['assigned', 'in_progress', 'completed', 'blocked', 'overdue'] as TaskStatus[]).map((status) => (
          <TabsContent key={status} value={status} className="space-y-4 mt-4">
            {groupedServices[status].length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">
                    No {getStatusBadge(status).label.toLowerCase()} service tasks
                  </p>
                </CardContent>
              </Card>
            ) : (
              groupedServices[status].map((service) => (
                <ServiceCard key={service.id} service={service} onUpdate={loadServices} />
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

// Service Card Component
function ServiceCard({ service, onUpdate }: { service: ServiceTask; onUpdate: () => void }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const getStatusBadge = (status: TaskStatus) => {
    const config: Record<TaskStatus, { variant: 'default' | 'destructive' | 'secondary' | 'outline'; label: string }> = {
      assigned: { variant: 'outline', label: 'Assigned' },
      in_progress: { variant: 'default', label: 'In Progress' },
      completed: { variant: 'secondary', label: 'Completed' },
      blocked: { variant: 'destructive', label: 'Blocked' },
      overdue: { variant: 'destructive', label: 'Overdue' },
    };
    return config[status];
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    const config = {
      urgent: { variant: 'destructive' as const, className: 'bg-red-500 hover:bg-red-600' },
      high: { variant: 'default' as const, className: 'bg-orange-500 hover:bg-orange-600' },
      normal: { variant: 'secondary' as const, className: '' },
      low: { variant: 'outline' as const, className: '' },
    };
    return config[priority] || config.normal;
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleStartService = async () => {
    try {
      setLoading(true);
      await employeeApi.startService(service.id);
      toast({
        title: 'Success',
        description: 'Service task started',
      });
      onUpdate();
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to start service',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteService = async () => {
    try {
      setLoading(true);
      await employeeApi.completeService(service.id);
      toast({
        title: 'Success',
        description: 'Service task completed',
      });
      onUpdate();
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to complete service',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = getStatusBadge(service.status);
  const priorityBadge = getPriorityBadge(service.priority);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={priorityBadge.variant} className={priorityBadge.className || ''}>
                {service.priority}
              </Badge>
              <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
            </div>
            <CardTitle className="text-xl">{service.serviceTypeName}</CardTitle>
            <CardDescription className="mt-1">
              Appointment ID: {service.appointmentId}
            </CardDescription>
          </div>
          <Wrench className="h-6 w-6 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Car className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">
                {service.vehicleMake} {service.vehicleModel} ({service.vehicleYear})
              </p>
              <p className="text-muted-foreground">{service.licensePlate}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">{service.customerName}</p>
              <p className="text-muted-foreground">{service.customerEmail}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">Scheduled</p>
              <p className="text-muted-foreground">
                {formatDateTime(service.scheduledStartTime)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">Duration</p>
              <p className="text-muted-foreground">
                {service.estimatedDurationMinutes} minutes
              </p>
            </div>
          </div>
        </div>

        {service.notes && (
          <div className="text-sm">
            <p className="font-medium mb-1">Notes:</p>
            <p className="text-muted-foreground">{service.notes}</p>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {service.status === 'assigned' && (
            <Button onClick={handleStartService} disabled={loading} size="sm">
              <PlayCircle className="mr-2 h-4 w-4" />
              Start Service
            </Button>
          )}
          {service.status === 'in_progress' && (
            <Button onClick={handleCompleteService} disabled={loading} size="sm">
              <CheckCircle className="mr-2 h-4 w-4" />
              Complete Service
            </Button>
          )}
          <Button variant="outline" size="sm" asChild>
            <Link to={`/employee/services/${service.id}`}>View Details</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
