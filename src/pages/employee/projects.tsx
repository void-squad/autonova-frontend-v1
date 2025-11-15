import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban,
  Car,
  User,
  Calendar,
  TrendingUp,
  Filter,
  ArrowLeft,
  PlayCircle,
  PauseCircle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
import { ModificationProject, TaskPriority } from '@/types/employee';
import { useToast } from '@/hooks/use-toast';

type ProjectStatus = 'planned' | 'in_progress' | 'blocked' | 'completed' | 'canceled';

export default function EmployeeProjects() {
  const { toast } = useToast();
  const [projects, setProjects] = useState<ModificationProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      const data = await employeeApi.getProjects();
      setProjects(data);
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to load projects',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const filterProjects = () => {
    let filtered = projects;

    if (statusFilter !== 'all') {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter((p) => p.priority === priorityFilter);
    }

    return filtered;
  };

  const getStatusBadge = (status: ProjectStatus) => {
    const config: Record<ProjectStatus, { variant: 'default' | 'destructive' | 'secondary' | 'outline'; label: string }> = {
      planned: { variant: 'outline', label: 'Planned' },
      in_progress: { variant: 'default', label: 'In Progress' },
      completed: { variant: 'secondary', label: 'Completed' },
      blocked: { variant: 'destructive', label: 'Blocked' },
      canceled: { variant: 'secondary', label: 'Canceled' },
    };
    return config[status];
  };

  const groupByStatus = () => {
    const grouped: Record<ProjectStatus, ModificationProject[]> = {
      planned: [],
      in_progress: [],
      blocked: [],
      completed: [],
      canceled: [],
    };

    filterProjects().forEach((project) => {
      if (grouped[project.status]) {
        grouped[project.status].push(project);
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
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const groupedProjects = groupByStatus();
  const filteredProjects = filterProjects();

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
            <h1 className="text-3xl font-bold">Modification Projects</h1>
            <p className="text-muted-foreground mt-1">
              Manage your assigned modification projects
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
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
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

      {/* Projects Tabs */}
      <Tabs defaultValue="all">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">
            All ({filteredProjects.length})
          </TabsTrigger>
          <TabsTrigger value="planned">
            Planned ({groupedProjects.planned.length})
          </TabsTrigger>
          <TabsTrigger value="in_progress">
            In Progress ({groupedProjects.in_progress.length})
          </TabsTrigger>
          <TabsTrigger value="blocked">
            Blocked ({groupedProjects.blocked.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({groupedProjects.completed.length})
          </TabsTrigger>
          <TabsTrigger value="canceled">
            Canceled ({groupedProjects.canceled.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-4">
          {filteredProjects.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FolderKanban className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No projects found</p>
              </CardContent>
            </Card>
          ) : (
            filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} onUpdate={loadProjects} />
            ))
          )}
        </TabsContent>

        {(['planned', 'in_progress', 'blocked', 'completed', 'canceled'] as ProjectStatus[]).map((status) => (
          <TabsContent key={status} value={status} className="space-y-4 mt-4">
            {groupedProjects[status].length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FolderKanban className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">
                    No {getStatusBadge(status).label.toLowerCase()} projects
                  </p>
                </CardContent>
              </Card>
            ) : (
              groupedProjects[status].map((project) => (
                <ProjectCard key={project.id} project={project} onUpdate={loadProjects} />
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

// Project Card Component
function ProjectCard({ project, onUpdate }: { project: ModificationProject; onUpdate: () => void }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const getStatusBadge = (status: ProjectStatus) => {
    const config: Record<ProjectStatus, { variant: 'default' | 'destructive' | 'secondary' | 'outline'; label: string }> = {
      planned: { variant: 'outline', label: 'Planned' },
      in_progress: { variant: 'default', label: 'In Progress' },
      completed: { variant: 'secondary', label: 'Completed' },
      blocked: { variant: 'destructive', label: 'Blocked' },
      canceled: { variant: 'secondary', label: 'Canceled' },
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleUpdateStatus = async (newStatus: ProjectStatus) => {
    try {
      setLoading(true);
      await employeeApi.updateProjectStatus(project.id, newStatus);
      toast({
        title: 'Success',
        description: 'Project status updated',
      });
      onUpdate();
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to update project',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = getStatusBadge(project.status);
  const priorityBadge = getPriorityBadge(project.priority);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={priorityBadge.variant} className={priorityBadge.className || ''}>
                {project.priority}
              </Badge>
              <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
            </div>
            <CardTitle className="text-xl">{project.title}</CardTitle>
            {project.description && (
              <CardDescription className="mt-2">{project.description}</CardDescription>
            )}
          </div>
          <FolderKanban className="h-6 w-6 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Car className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">
                {project.vehicleMake} {project.vehicleModel} ({project.vehicleYear})
              </p>
              <p className="text-muted-foreground">{project.licensePlate}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">{project.customerName}</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Progress
            </span>
            <span className="font-medium">{project.progressPct}%</span>
          </div>
          <Progress value={project.progressPct} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">Start Date</p>
              <p className="text-muted-foreground">{formatDate(project.startDate)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">End Date</p>
              <p className="text-muted-foreground">{formatDate(project.endDate)}</p>
            </div>
          </div>
        </div>

        {project.estimatedHours && (
          <div className="flex items-center justify-between text-sm border-t pt-3">
            <span className="text-muted-foreground">Estimated Hours:</span>
            <span className="font-medium">{project.estimatedHours} hrs</span>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {project.status === 'planned' && (
            <Button 
              onClick={() => handleUpdateStatus('in_progress')} 
              disabled={loading} 
              size="sm"
            >
              <PlayCircle className="mr-2 h-4 w-4" />
              Start Project
            </Button>
          )}
          {project.status === 'in_progress' && (
            <Button 
              onClick={() => handleUpdateStatus('blocked')} 
              disabled={loading} 
              size="sm"
              variant="outline"
            >
              <PauseCircle className="mr-2 h-4 w-4" />
              Mark as Blocked
            </Button>
          )}
          <Button variant="outline" size="sm" asChild>
            <Link to={`/employee/projects/${project.id}`}>View Details</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
