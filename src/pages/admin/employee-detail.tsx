import { useEffect, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ClipboardList,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  UserX,
  ArrowRightLeft,
  Star,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { adminApi } from '@/lib/api/admin';
import { EmployeeWithStats, EmployeeTask, EmployeeWorkload } from '@/types/admin';

export default function EmployeeDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [employee, setEmployee] = useState<EmployeeWithStats | null>(null);
  const [tasks, setTasks] = useState<EmployeeTask[]>([]);
  const [workload, setWorkload] = useState<EmployeeWorkload | null>(null);
  const [allEmployees, setAllEmployees] = useState<{ id: string; userName: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReassignDialog, setShowReassignDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<EmployeeTask | null>(null);
  const [reassignToId, setReassignToId] = useState('');
  const [reassignReason, setReassignReason] = useState('');

  const loadData = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      const [employeeData, tasksData, workloadData, employeesData] = await Promise.all([
        adminApi.getEmployeeById(id),
        adminApi.getEmployeeTasks(id),
        adminApi.getEmployeeWorkload(id),
        adminApi.getAllEmployees(),
      ]);
      setEmployee(employeeData);
      setTasks(tasksData);
      setWorkload(workloadData);
      setAllEmployees(
        employeesData.filter((e) => e.id !== id && e.status === 'active')
      );
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to load employee details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleReassignTask = async () => {
    if (!selectedTask || !reassignToId || !id) return;

    try {
      await adminApi.reassignTask({
        taskId: selectedTask.id,
        fromEmployeeId: id,
        toEmployeeId: reassignToId,
        reason: reassignReason,
      });
      toast({
        title: 'Success',
        description: 'Task reassigned successfully',
      });
      setShowReassignDialog(false);
      setSelectedTask(null);
      setReassignToId('');
      setReassignReason('');
      loadData();
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to reassign task',
        variant: 'destructive',
      });
    }
  };

  const openReassignDialog = (task: EmployeeTask) => {
    setSelectedTask(task);
    setShowReassignDialog(true);
  };

  const getStatusBadge = (status: string) => {
    const config = {
      assigned: { variant: 'outline' as const, label: 'Assigned', color: 'text-blue-600' },
      in_progress: { variant: 'default' as const, label: 'In Progress', color: 'text-yellow-600' },
      completed: { variant: 'default' as const, label: 'Completed', color: 'text-green-600' },
      blocked: { variant: 'secondary' as const, label: 'Blocked', color: 'text-red-600' },
      overdue: { variant: 'destructive' as const, label: 'Overdue', color: 'text-red-600' },
    };
    return config[status as keyof typeof config] || config.assigned;
  };

  const getPriorityBadge = (priority: string) => {
    const config = {
      urgent: { variant: 'destructive' as const, label: 'Urgent' },
      high: { variant: 'default' as const, label: 'High' },
      normal: { variant: 'secondary' as const, label: 'Normal' },
      low: { variant: 'outline' as const, label: 'Low' },
    };
    return config[priority as keyof typeof config] || config.normal;
  };

  const filterTasks = (status?: string, priority?: string) => {
    let filtered = tasks;
    if (status && status !== 'all') {
      filtered = filtered.filter((t) => t.status === status);
    }
    if (priority && priority !== 'all') {
      filtered = filtered.filter((t) => t.priority === priority);
    }
    return filtered;
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
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <UserX className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Employee Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The employee you're looking for doesn't exist
        </p>
        <Button asChild>
          <Link to="/admin/employees">Back to Employees</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link to="/admin/employees">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{employee.userName}</h1>
            <p className="text-muted-foreground mt-1">
              Employee Details & Task Management
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={loadData}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Employee Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <CardTitle>Employee Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>Email</span>
              </div>
              <p className="font-medium">{employee.email}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>Phone</span>
              </div>
              <p className="font-medium">{employee.contactOne}</p>
            </div>
            {employee.address && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>Address</span>
                </div>
                <p className="font-medium">{employee.address}</p>
              </div>
            )}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Hire Date</span>
              </div>
              <p className="font-medium">
                {new Date(employee.hireDate).toLocaleDateString()}
              </p>
            </div>
          </div>
          {employee.specialization && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">Specialization</p>
              <p className="font-medium mt-1">{employee.specialization}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Tasks</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {employee.stats.assignedTasks}
            </div>
            <p className="text-xs text-muted-foreground">
              {employee.stats.inProgressTasks} in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {employee.stats.completedTasks}
            </div>
            <p className="text-xs text-muted-foreground">
              {employee.stats.completedThisMonth} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours This Month</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {employee.stats.hoursThisMonth}h
            </div>
            <p className="text-xs text-muted-foreground">
              {employee.stats.efficiency}% efficiency
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">
              {employee.stats.averageRating.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">out of 5.0</p>
          </CardContent>
        </Card>
      </div>

      {/* Workload Overview */}
      {workload && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              <CardTitle>Workload Overview</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Tasks</p>
                  <p className="text-2xl font-bold">{workload.totalTasks}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">In Progress</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {workload.inProgressTasks}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Urgent</p>
                  <p className="text-2xl font-bold text-red-600">
                    {workload.urgentTasks}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Overdue</p>
                  <p className="text-2xl font-bold text-red-600">
                    {workload.overdueTasks}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Utilization Rate</span>
                  <span className="font-medium">{workload.utilizationRate}%</span>
                </div>
                <Progress
                  value={workload.utilizationRate}
                  className={
                    workload.utilizationRate > 90
                      ? '[&>div]:bg-red-600'
                      : workload.utilizationRate > 75
                      ? '[&>div]:bg-yellow-600'
                      : '[&>div]:bg-green-600'
                  }
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Available Capacity</span>
                  <span className="font-medium">{workload.availableCapacity}%</span>
                </div>
                <Progress
                  value={workload.availableCapacity}
                  className="[&>div]:bg-green-600"
                />
              </div>

              {workload.utilizationRate > 90 && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <p className="text-sm text-red-900 dark:text-red-100">
                    <strong>Overloaded:</strong> This employee is at maximum
                    capacity. Consider reassigning tasks.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tasks List */}
      <Card>
        <CardHeader>
          <CardTitle>Assigned Tasks ({tasks.length})</CardTitle>
          <CardDescription>
            Manage and reassign tasks for this employee
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">
                All ({tasks.length})
              </TabsTrigger>
              <TabsTrigger value="assigned">
                Assigned ({filterTasks('assigned').length})
              </TabsTrigger>
              <TabsTrigger value="in_progress">
                In Progress ({filterTasks('in_progress').length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({filterTasks('completed').length})
              </TabsTrigger>
              <TabsTrigger value="overdue">
                Overdue ({filterTasks('overdue').length})
              </TabsTrigger>
            </TabsList>

            {(['all', 'assigned', 'in_progress', 'completed', 'overdue'] as const).map(
              (status) => (
                <TabsContent key={status} value={status} className="space-y-3 mt-4">
                  {filterTasks(status === 'all' ? undefined : status).length === 0 ? (
                    <div className="text-center py-8">
                      <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                      <p className="text-muted-foreground">No tasks found</p>
                    </div>
                  ) : (
                    filterTasks(status === 'all' ? undefined : status).map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onReassign={openReassignDialog}
                        getStatusBadge={getStatusBadge}
                        getPriorityBadge={getPriorityBadge}
                      />
                    ))
                  )}
                </TabsContent>
              )
            )}
          </Tabs>
        </CardContent>
      </Card>

      {/* Reassign Task Dialog */}
      <Dialog open={showReassignDialog} onOpenChange={setShowReassignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reassign Task</DialogTitle>
            <DialogDescription>
              Reassign "{selectedTask?.title}" to another employee
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reassign-to">Reassign To</Label>
              <Select value={reassignToId} onValueChange={setReassignToId}>
                <SelectTrigger id="reassign-to">
                  <SelectValue placeholder="Select employee..." />
                </SelectTrigger>
                <SelectContent>
                  {allEmployees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.userName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason (Optional)</Label>
              <Textarea
                id="reason"
                placeholder="Why are you reassigning this task?"
                value={reassignReason}
                onChange={(e) => setReassignReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowReassignDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleReassignTask} disabled={!reassignToId}>
              Reassign Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Task Card Component
function TaskCard({
  task,
  onReassign,
  getStatusBadge,
  getPriorityBadge,
}: {
  task: EmployeeTask;
  onReassign: (task: EmployeeTask) => void;
  getStatusBadge: (status: string) => {
    variant: 'default' | 'secondary' | 'outline' | 'destructive';
    label: string;
    color: string;
  };
  getPriorityBadge: (priority: string) => {
    variant: 'default' | 'secondary' | 'outline' | 'destructive';
    label: string;
  };
}) {
  const statusBadge = getStatusBadge(task.status);
  const priorityBadge = getPriorityBadge(task.priority);

  return (
    <div className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-all">
      <div className="flex-1 space-y-2">
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <h4 className="font-medium">{task.title}</h4>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
              <Badge variant={priorityBadge.variant}>{priorityBadge.label}</Badge>
              <Badge variant="outline">
                {task.type === 'service' ? 'Service' : 'Project'}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Customer</p>
            <p className="font-medium">{task.customer}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Vehicle</p>
            <p className="font-medium">{task.vehicle}</p>
          </div>
        </div>

        {task.dueDate && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      <Button
        size="sm"
        variant="outline"
        onClick={() => onReassign(task)}
        disabled={task.status === 'completed'}
      >
        <ArrowRightLeft className="mr-2 h-4 w-4" />
        Reassign
      </Button>
    </div>
  );
}
