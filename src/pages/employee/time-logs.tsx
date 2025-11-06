import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  Play,
  Pause,
  StopCircle,
  Calendar,
  Filter,
  ArrowLeft,
  Plus,
  Timer,
  TrendingUp,
  Wrench,
  FolderKanban,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface TimeLog {
  id: string;
  employeeId: string;
  projectId?: string;
  appointmentId?: string;
  task: string;
  startTime?: string;
  endTime?: string;
  durationMinutes: number;
  notes?: string;
  loggedAt: string;
  status: 'running' | 'completed';
  type: 'service' | 'project' | 'other';
}

export default function TimeLogs() {
  const { toast } = useToast();
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTimer, setActiveTimer] = useState<TimeLog | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');

  // New time log form
  const [newLog, setNewLog] = useState({
    task: '',
    type: 'other' as 'service' | 'project' | 'other',
    notes: '',
  });

  const loadTimeLogs = useCallback(async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const data = await employeeApi.getTimeLogs();
      const mockData: TimeLog[] = [
        {
          id: '1',
          employeeId: '1',
          appointmentId: 'apt-1',
          task: 'Oil Change - Honda Civic',
          startTime: new Date(Date.now() - 3600000).toISOString(),
          endTime: new Date().toISOString(),
          durationMinutes: 60,
          notes: 'Completed successfully',
          loggedAt: new Date().toISOString(),
          status: 'completed',
          type: 'service',
        },
        {
          id: '2',
          employeeId: '1',
          projectId: 'proj-1',
          task: 'Custom Exhaust Installation',
          startTime: new Date(Date.now() - 7200000).toISOString(),
          endTime: new Date(Date.now() - 1800000).toISOString(),
          durationMinutes: 90,
          notes: 'Phase 1 completed',
          loggedAt: new Date().toISOString(),
          status: 'completed',
          type: 'project',
        },
      ];
      setTimeLogs(mockData);
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to load time logs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadTimeLogs();
  }, [loadTimeLogs]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTimer) {
      interval = setInterval(() => {
        const start = new Date(activeTimer.startTime!).getTime();
        const now = Date.now();
        setElapsedSeconds(Math.floor((now - start) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimer]);

  const startTimer = async () => {
    if (!newLog.task.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a task description',
        variant: 'destructive',
      });
      return;
    }

    try {
      // TODO: Replace with actual API call
      const newTimeLog: TimeLog = {
        id: Date.now().toString(),
        employeeId: '1',
        task: newLog.task,
        startTime: new Date().toISOString(),
        durationMinutes: 0,
        notes: newLog.notes,
        loggedAt: new Date().toISOString(),
        status: 'running',
        type: newLog.type,
      };

      setActiveTimer(newTimeLog);
      setElapsedSeconds(0);
      setShowCreateDialog(false);
      setNewLog({ task: '', type: 'other', notes: '' });

      toast({
        title: 'Timer Started',
        description: 'Time tracking has begun',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start timer',
        variant: 'destructive',
      });
    }
  };

  const stopTimer = async () => {
    if (!activeTimer) return;

    try {
      // TODO: Replace with actual API call
      const completedLog: TimeLog = {
        ...activeTimer,
        endTime: new Date().toISOString(),
        durationMinutes: Math.floor(elapsedSeconds / 60),
        status: 'completed',
      };

      setTimeLogs([completedLog, ...timeLogs]);
      setActiveTimer(null);
      setElapsedSeconds(0);

      toast({
        title: 'Timer Stopped',
        description: `Logged ${Math.floor(elapsedSeconds / 60)} minutes`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to stop timer',
        variant: 'destructive',
      });
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStats = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayLogs = timeLogs.filter(
      (log) => new Date(log.loggedAt) >= today
    );

    const thisWeekStart = new Date();
    thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
    thisWeekStart.setHours(0, 0, 0, 0);

    const thisWeekLogs = timeLogs.filter(
      (log) => new Date(log.loggedAt) >= thisWeekStart
    );

    return {
      todayMinutes: todayLogs.reduce((sum, log) => sum + log.durationMinutes, 0),
      weekMinutes: thisWeekLogs.reduce((sum, log) => sum + log.durationMinutes, 0),
      totalLogs: timeLogs.length,
      todayLogs: todayLogs.length,
    };
  };

  const filterLogs = () => {
    if (filterType === 'all') return timeLogs;
    return timeLogs.filter((log) => log.type === filterType);
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

  const stats = getStats();
  const filteredLogs = filterLogs();

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
            <h1 className="text-3xl font-bold">Time Logging</h1>
            <p className="text-muted-foreground mt-1">
              Track your work hours and productivity
            </p>
          </div>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Start New Timer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Start Time Tracking</DialogTitle>
              <DialogDescription>
                Begin tracking time for a new task
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="task">Task Description *</Label>
                <Input
                  id="task"
                  placeholder="e.g., Oil Change - Honda Civic"
                  value={newLog.task}
                  onChange={(e) => setNewLog({ ...newLog, task: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={newLog.type}
                  onValueChange={(value: 'service' | 'project' | 'other') =>
                    setNewLog({ ...newLog, type: value })
                  }
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any additional notes..."
                  value={newLog.notes}
                  onChange={(e) => setNewLog({ ...newLog, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={startTimer}>
                <Play className="mr-2 h-4 w-4" />
                Start Timer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Timer */}
      {activeTimer && (
        <Card className="border-primary bg-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="h-5 w-5 text-primary animate-pulse" />
                  Active Timer
                </CardTitle>
                <CardDescription className="mt-1">{activeTimer.task}</CardDescription>
              </div>
              <Badge variant="default" className="bg-green-500">
                <Clock className="h-3 w-3 mr-1" />
                Running
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-4xl font-bold font-mono">
                {formatTime(elapsedSeconds)}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </Button>
                <Button variant="destructive" size="sm" onClick={stopTimer}>
                  <StopCircle className="h-4 w-4 mr-2" />
                  Stop
                </Button>
              </div>
            </div>
            {activeTimer.notes && (
              <p className="text-sm text-muted-foreground mt-3">
                Notes: {activeTimer.notes}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats.todayMinutes / 60).toFixed(1)}h
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.todayLogs} {stats.todayLogs === 1 ? 'entry' : 'entries'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats.weekMinutes / 60).toFixed(1)}h
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.totalLogs} total {stats.totalLogs === 1 ? 'entry' : 'entries'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average/Day</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.weekMinutes > 0 ? ((stats.weekMinutes / 60) / 7).toFixed(1) : '0'}h
            </div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLogs}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <CardTitle>Filter Logs</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="service">Services</SelectItem>
              <SelectItem value="project">Projects</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Time Logs List */}
      <Card>
        <CardHeader>
          <CardTitle>Time Log History</CardTitle>
          <CardDescription>Your recorded work hours</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="week">This Week</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4 mt-4">
              {filteredLogs.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No time logs yet</p>
                </div>
              ) : (
                filteredLogs.map((log) => <TimeLogCard key={log.id} log={log} />)
              )}
            </TabsContent>

            <TabsContent value="today" className="space-y-4 mt-4">
              {filteredLogs
                .filter((log) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return new Date(log.loggedAt) >= today;
                })
                .map((log) => (
                  <TimeLogCard key={log.id} log={log} />
                ))}
            </TabsContent>

            <TabsContent value="week" className="space-y-4 mt-4">
              {filteredLogs
                .filter((log) => {
                  const weekStart = new Date();
                  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                  weekStart.setHours(0, 0, 0, 0);
                  return new Date(log.loggedAt) >= weekStart;
                })
                .map((log) => (
                  <TimeLogCard key={log.id} log={log} />
                ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

// Time Log Card Component
function TimeLogCard({ log }: { log: TimeLog }) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'service':
        return <Wrench className="h-4 w-4" />;
      case 'project':
        return <FolderKanban className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-all">
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {getTypeIcon(log.type)}
            <span className="ml-1">{log.type}</span>
          </Badge>
          <p className="font-medium">{log.task}</p>
        </div>
        {log.notes && (
          <p className="text-sm text-muted-foreground">{log.notes}</p>
        )}
        <p className="text-xs text-muted-foreground">
          {formatDate(log.loggedAt)}
        </p>
      </div>
      <div className="text-right">
        <div className="text-lg font-bold">
          {Math.floor(log.durationMinutes / 60)}h {log.durationMinutes % 60}m
        </div>
        <Badge variant="secondary" className="mt-1">
          {log.status}
        </Badge>
      </div>
    </div>
  );
}
