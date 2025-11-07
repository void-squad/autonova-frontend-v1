import { useEffect, useState, useCallback } from 'react';
import { 
  Wrench, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  FolderKanban, 
  PlayCircle, 
  Timer, 
  CalendarClock,
  ArrowRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { employeeApi } from '@/lib/api/employee';
import { EmployeeStats, EmployeeWorkItem, TaskPriority, TimeLogStats } from '@/types/employee';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<EmployeeStats | null>(null);
  const [timeLogStats, setTimeLogStats] = useState<TimeLogStats | null>(null);
  const [workItems, setWorkItems] = useState<EmployeeWorkItem[]>([]);
  const [urgentTasks, setUrgentTasks] = useState<EmployeeWorkItem[]>([]);
  const [overdueTasks, setOverdueTasks] = useState<EmployeeWorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      // Single BFF call - the backend service aggregates data from multiple microservices
      const dashboardData = await employeeApi.getDashboardData();

      setStats(dashboardData.stats);
      setTimeLogStats(dashboardData.timeLogStats);
      setWorkItems(dashboardData.workItems);
      setUrgentTasks(dashboardData.urgentTasks);
      setOverdueTasks(dashboardData.overdueTasks);
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const getPriorityBadge = (priority: TaskPriority) => {
    const variants: Record<TaskPriority, { variant: 'default' | 'destructive' | 'secondary' | 'outline'; className?: string }> = {
      urgent: { variant: 'destructive', className: 'bg-red-500 hover:bg-red-600' },
      high: { variant: 'default', className: 'bg-orange-500 hover:bg-orange-600' },
      normal: { variant: 'secondary' },
      low: { variant: 'outline' },
    };
    return variants[priority] || variants.normal;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: 'default' | 'destructive' | 'secondary' | 'outline'; label: string }> = {
      assigned: { variant: 'outline', label: 'Assigned' },
      in_progress: { variant: 'default', label: 'In Progress' },
      completed: { variant: 'secondary', label: 'Completed' },
      blocked: { variant: 'destructive', label: 'Blocked' },
      overdue: { variant: 'destructive', label: 'Overdue' },
      planned: { variant: 'outline', label: 'Planned' },
      canceled: { variant: 'secondary', label: 'Canceled' },
    };
    return statusConfig[status] || statusConfig.assigned;
  };

  const formatDueDate = (dueDate?: string) => {
    if (!dueDate) return null;
    const date = new Date(dueDate);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `Due in ${diffDays} days`;
  };

  const filterWorkItems = (type?: 'service' | 'project') => {
    if (!type) return workItems;
    return workItems.filter(item => item.type === type);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-10 w-80" />
          <Skeleton className="h-5 w-60 mt-2" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const dashboardStats = [
    { 
      label: 'Assigned Services', 
      value: stats?.assignedServices || 0, 
      icon: Wrench, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20'
    },
    { 
      label: 'Modification Projects', 
      value: stats?.assignedProjects || 0, 
      icon: FolderKanban, 
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20'
    },
    { 
      label: 'In Progress', 
      value: (stats?.inProgressServices || 0) + (stats?.inProgressProjects || 0), 
      icon: Clock, 
      color: 'text-amber-600',
      bgColor: 'bg-amber-100 dark:bg-amber-900/20'
    },
    { 
      label: 'Completed Today', 
      value: stats?.completedToday || 0, 
      icon: CheckCircle, 
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20'
    },
    { 
      label: 'Urgent Tasks', 
      value: stats?.urgentTasks || 0, 
      icon: AlertTriangle, 
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/20'
    },
    { 
      label: 'Overdue Tasks', 
      value: stats?.overdueTasks || 0, 
      icon: AlertCircle, 
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20'
    },
    { 
      label: 'Hours This Week', 
      value: timeLogStats?.totalHoursThisWeek || 0, 
      icon: TrendingUp, 
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100 dark:bg-indigo-900/20',
      suffix: 'hrs'
    },
    { 
      label: 'Total Assigned', 
      value: (stats?.assignedServices || 0) + (stats?.assignedProjects || 0), 
      icon: CalendarClock, 
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-100 dark:bg-cyan-900/20'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.userName}!</h1>
          <p className="text-muted-foreground mt-1">Here's what's on your plate today</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/employee/time-logging">
              <Timer className="mr-2 h-4 w-4" />
              Log Time
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/employee/projects">
              <FolderKanban className="mr-2 h-4 w-4" />
              View Projects
            </Link>
          </Button>
        </div>
      </div>

      {/* Alerts for Overdue Tasks */}
      {overdueTasks.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Overdue Tasks</AlertTitle>
          <AlertDescription>
            You have {overdueTasks.length} overdue {overdueTasks.length === 1 ? 'task' : 'tasks'} that need immediate attention.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat) => (
          <Card key={stat.label} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stat.value}{stat.suffix || ''}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link to="/employee/services" className="block">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-base">Service Tasks</CardTitle>
                <CardDescription className="text-xs mt-1">
                  View all assigned services
                </CardDescription>
              </div>
              <Wrench className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {stats?.assignedServices || 0} assigned
                </span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/employee/projects" className="block">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-base">Modification Projects</CardTitle>
                <CardDescription className="text-xs mt-1">
                  Manage your projects
                </CardDescription>
              </div>
              <FolderKanban className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {stats?.assignedProjects || 0} assigned
                </span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/employee/time-logging" className="block">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-base">Time Logging</CardTitle>
                <CardDescription className="text-xs mt-1">
                  Track your work hours
                </CardDescription>
              </div>
              <Timer className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {timeLogStats?.totalHoursThisWeek || 0} hrs this week
                </span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Urgent Tasks Section */}
      {urgentTasks.length > 0 && (
        <Card className="border-red-200 dark:border-red-900">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Urgent Tasks
                </CardTitle>
                <CardDescription>These tasks require immediate attention</CardDescription>
              </div>
              <Badge variant="destructive">{urgentTasks.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {urgentTasks.slice(0, 3).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-4 border border-red-200 dark:border-red-900 rounded-lg bg-red-50 dark:bg-red-950/20"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="bg-background">
                        {task.type === 'service' ? <Wrench className="h-3 w-3 mr-1" /> : <FolderKanban className="h-3 w-3 mr-1" />}
                        {task.type}
                      </Badge>
                      <p className="font-medium">{task.title}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {task.vehicle} • {task.customer}
                    </p>
                    {task.dueDate && (
                      <p className="text-sm text-red-600 font-medium mt-1">
                        {formatDueDate(task.dueDate)}
                      </p>
                    )}
                  </div>
                  <Button size="sm" variant="default" asChild>
                    <Link to={`/employee/${task.type === 'service' ? 'services' : 'projects'}/${task.id}`}>
                      <PlayCircle className="mr-2 h-4 w-4" />
                      Start
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Work Items Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Your Work Assignments</CardTitle>
          <CardDescription>Manage your services and modification projects</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">
                All ({workItems.length})
              </TabsTrigger>
              <TabsTrigger value="services">
                Services ({filterWorkItems('service').length})
              </TabsTrigger>
              <TabsTrigger value="projects">
                Projects ({filterWorkItems('project').length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4 mt-4">
              {workItems.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No work items assigned yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {workItems.map((item) => (
                    <WorkItemCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="services" className="space-y-4 mt-4">
              {filterWorkItems('service').length === 0 ? (
                <div className="text-center py-12">
                  <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No service tasks assigned</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filterWorkItems('service').map((item) => (
                    <WorkItemCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="projects" className="space-y-4 mt-4">
              {filterWorkItems('project').length === 0 ? (
                <div className="text-center py-12">
                  <FolderKanban className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No projects assigned</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filterWorkItems('project').map((item) => (
                    <WorkItemCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

// Work Item Card Component
function WorkItemCard({ item }: { item: EmployeeWorkItem }) {
  const getPriorityBadge = (priority: TaskPriority) => {
    const config = {
      urgent: { variant: 'destructive' as const, className: 'bg-red-500 hover:bg-red-600' },
      high: { variant: 'default' as const, className: 'bg-orange-500 hover:bg-orange-600' },
      normal: { variant: 'secondary' as const, className: '' },
      low: { variant: 'outline' as const, className: '' },
    };
    return config[priority] || config.normal;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: 'default' | 'destructive' | 'secondary' | 'outline'; label: string }> = {
      assigned: { variant: 'outline', label: 'Assigned' },
      in_progress: { variant: 'default', label: 'In Progress' },
      completed: { variant: 'secondary', label: 'Completed' },
      blocked: { variant: 'destructive', label: 'Blocked' },
      overdue: { variant: 'destructive', label: 'Overdue' },
      planned: { variant: 'outline', label: 'Planned' },
      canceled: { variant: 'secondary', label: 'Canceled' },
    };
    return statusConfig[status] || statusConfig.assigned;
  };

  const formatDueDate = (dueDate?: string) => {
    if (!dueDate) return null;
    const date = new Date(dueDate);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `Due in ${diffDays} days`;
  };

  const priorityConfig = getPriorityBadge(item.priority);
  const statusConfig = getStatusBadge(item.status);

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-all">
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="bg-background">
            {item.type === 'service' ? (
              <Wrench className="h-3 w-3 mr-1" />
            ) : (
              <FolderKanban className="h-3 w-3 mr-1" />
            )}
            {item.type}
          </Badge>
          <Badge 
            variant={priorityConfig.variant} 
            className={priorityConfig.className || ''}
          >
            {item.priority}
          </Badge>
          <Badge variant={statusConfig.variant}>
            {statusConfig.label}
          </Badge>
        </div>
        
        <div>
          <p className="font-medium">{item.title}</p>
          {item.description && (
            <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{item.vehicle}</span>
          <span>•</span>
          <span>{item.customer}</span>
          {item.estimatedTime && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {item.estimatedTime}
              </span>
            </>
          )}
        </div>

        {item.progress !== undefined && item.type === 'project' && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{item.progress}%</span>
            </div>
            <Progress value={item.progress} className="h-2" />
          </div>
        )}

        {item.dueDate && (
          <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
            <CalendarClock className="h-3 w-3 inline mr-1" />
            {formatDueDate(item.dueDate)}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 ml-4">
        <Button size="sm" variant="outline" asChild>
          <Link to={`/employee/${item.type === 'service' ? 'services' : 'projects'}/${item.id}`}>
            View Details
          </Link>
        </Button>
      </div>
    </div>
  );
}
