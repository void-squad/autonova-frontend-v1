import { Wrench, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function EmployeeDashboard() {
  const { user } = useAuth();

  const stats = [
    { label: 'Assigned Tasks', value: '8', icon: Wrench, color: 'text-primary' },
    { label: 'In Progress', value: '3', icon: Clock, color: 'text-accent' },
    { label: 'Completed Today', value: '5', icon: CheckCircle, color: 'text-green-600' },
    { label: 'Urgent Tasks', value: '2', icon: AlertTriangle, color: 'text-destructive' },
  ];

  const tasks = [
    {
      id: '1',
      service: 'Oil Change',
      vehicle: '2022 Honda Civic',
      customer: 'John Smith',
      priority: 'normal',
      status: 'assigned',
      estimatedTime: '45 min',
    },
    {
      id: '2',
      service: 'Brake System Repair',
      vehicle: '2020 Toyota Camry',
      customer: 'Sarah Johnson',
      priority: 'urgent',
      status: 'in_progress',
      estimatedTime: '2 hours',
    },
    {
      id: '3',
      service: 'Engine Diagnostic',
      vehicle: '2019 Ford F-150',
      customer: 'Mike Davis',
      priority: 'high',
      status: 'assigned',
      estimatedTime: '1.5 hours',
    },
  ];

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, 'default' | 'destructive' | 'secondary'> = {
      urgent: 'destructive',
      high: 'default',
      normal: 'secondary',
    };
    return variants[priority] || 'secondary';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome, {user?.name}!</h1>
        <p className="text-muted-foreground mt-1">Here are your tasks for today</p>
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
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Today's Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Assignments</CardTitle>
          <CardDescription>Tasks assigned to you for today</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-smooth"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{task.service}</p>
                    <Badge variant={getPriorityBadge(task.priority)}>{task.priority}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {task.vehicle} • {task.customer}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Est. {task.estimatedTime}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" asChild>
                    <Link to={`/employee/tasks/${task.id}`}>View Details</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" className="flex-1" asChild>
              <Link to="/employee/tasks">View All Tasks</Link>
            </Button>
            <Button variant="outline" className="flex-1" asChild>
              <Link to="/employee/time-logs">Log Time</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Time Log */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Time Log</CardTitle>
          <CardDescription>Log your work hours</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="hero" className="w-full" asChild>
            <Link to="/employee/time-logs">Start New Time Entry</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
