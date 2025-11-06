import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  Clock,
  PlayCircle,
  CheckCircle,
  Calendar,
  User,
  Car,
  Filter,
  ArrowLeft,
  AlertCircle,
  Wrench,
  FolderKanban,
  CalendarClock,
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
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { employeeApi } from '@/lib/api/employee';
import { EmployeeWorkItem, TaskPriority } from '@/types/employee';
import { useToast } from '@/hooks/use-toast';

export default function MyTasks() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<EmployeeWorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await employeeApi.getAllWorkItems();
      setTasks(data);
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to load tasks',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const filterTasks = () => {
    let filtered = tasks;

    if (statusFilter !== 'all') {
      filtered = filtered.filter((t) => t.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter((t) => t.priority === priorityFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter((t) => t.type === typeFilter);
    }

    return filtered;
  };

  const groupByPriority = () => {
    const filtered = filterTasks();
    return {
      urgent: filtered.filter((t) => t.priority === 'urgent'),
      high: filtered.filter((t) => t.priority === 'high'),
      normal: filtered.filter((t) => t.priority === 'normal'),
      low: filtered.filter((t) => t.priority === 'low'),
    };
  };

  const getStats = () => {
    const filtered = filterTasks();
    return {
      total: filtered.length,
      urgent: filtered.filter((t) => t.priority === 'urgent').length,
      inProgress: filtered.filter((t) => t.status === 'in_progress').length,
      completed: filtered.filter((t) => t.status === 'completed').length,
      overdue: filtered.filter((t) => t.status === 'overdue').length,
    };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-60" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const stats = getStats();
  const groupedTasks = groupByPriority();
  const filteredTasks = filterTasks();

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
            <h1 className="text-3xl font-bold">My Tasks</h1>
            <p className="text-muted-foreground mt-1">
              Manage all your assigned tasks and projects
            </p>
          </div>
        </div>
        <Button onClick={loadTasks} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.urgent}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.inProgress}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <CalendarClock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.overdue}</div>
          </CardContent>
        </Card>
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
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium mb-2 block">Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="service">Services</SelectItem>
                  <SelectItem value="project">Projects</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
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
            <div>
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

      {/* Tasks Tabs */}
      <Tabs defaultValue="all">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">
            All ({filteredTasks.length})
          </TabsTrigger>
          <TabsTrigger value="urgent">
            Urgent ({groupedTasks.urgent.length})
          </TabsTrigger>
          <TabsTrigger value="high">
            High ({groupedTasks.high.length})
          </TabsTrigger>
          <TabsTrigger value="normal">
            Normal ({groupedTasks.normal.length})
          </TabsTrigger>
          <TabsTrigger value="low">
            Low ({groupedTasks.low.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-4">
          {filteredTasks.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No tasks found</p>
              </CardContent>
            </Card>
          ) : (
            filteredTasks.map((task) => (
              <TaskCard key={task.id} task={task} onUpdate={loadTasks} />
            ))
          )}
        </TabsContent>

        {(['urgent', 'high', 'normal', 'low'] as TaskPriority[]).map((priority) => (
          <TabsContent key={priority} value={priority} className="space-y-4 mt-4">
            {groupedTasks[priority].length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">
                    No {priority} priority tasks
                  </p>
                </CardContent>
              </Card>
            ) : (
              groupedTasks[priority].map((task) => (
                <TaskCard key={task.id} task={task} onUpdate={loadTasks} />
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

// Task Card Component
function TaskCard({ task, onUpdate }: { task: EmployeeWorkItem; onUpdate: () => void }) {
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

  const priorityConfig = getPriorityBadge(task.priority);
  const statusConfig = getStatusBadge(task.status);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant="outline" className="bg-background">
                {task.type === 'service' ? (
                  <Wrench className="h-3 w-3 mr-1" />
                ) : (
                  <FolderKanban className="h-3 w-3 mr-1" />
                )}
                {task.type}
              </Badge>
              <Badge 
                variant={priorityConfig.variant} 
                className={priorityConfig.className || ''}
              >
                {task.priority}
              </Badge>
              <Badge variant={statusConfig.variant}>
                {statusConfig.label}
              </Badge>
            </div>
            <CardTitle className="text-xl">{task.title}</CardTitle>
            {task.description && (
              <CardDescription className="mt-2">{task.description}</CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Car className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{task.vehicle}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{task.customer}</span>
          </div>
        </div>

        {task.estimatedTime && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Estimated: {task.estimatedTime}</span>
          </div>
        )}

        {task.progress !== undefined && task.type === 'project' && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{task.progress}%</span>
            </div>
            <Progress value={task.progress} className="h-2" />
          </div>
        )}

        {task.dueDate && (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-orange-600" />
            <p className="text-sm font-medium text-orange-600">
              {formatDueDate(task.dueDate)}
            </p>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {task.status === 'assigned' && (
            <Button size="sm" asChild>
              <Link to={`/employee/${task.type === 'service' ? 'services' : 'projects'}/${task.id}`}>
                <PlayCircle className="mr-2 h-4 w-4" />
                Start Task
              </Link>
            </Button>
          )}
          <Button variant="outline" size="sm" asChild>
            <Link to={`/employee/${task.type === 'service' ? 'services' : 'projects'}/${task.id}`}>
              View Details
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
