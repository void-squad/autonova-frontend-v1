import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getMyProjectStatuses } from "@/services/progressMonitoringService";
import type { ProjectStatusSummary } from "@/types/progressMonitoring";
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  Bell,
  Inbox,
} from "lucide-react";

const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString() : "—";

const getStatusIcon = (status: string) => {
  switch (status) {
    case "Completed":
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    case "InProgress":
      return <RefreshCw className="h-5 w-5 text-blue-600" />;
    case "PendingReview":
      return <Clock className="h-5 w-5 text-amber-600" />;
    default:
      return <Bell className="h-5 w-5 text-gray-600" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "Completed":
      return "bg-green-100 text-green-800";
    case "InProgress":
      return "bg-blue-100 text-blue-800";
    case "PendingReview":
      return "bg-amber-100 text-amber-800";
    case "Approved":
      return "bg-purple-100 text-purple-800";
    case "Cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function ProgressMonitoringDashboard() {
  const [projects, setProjects] = useState<ProjectStatusSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getMyProjectStatuses();
        if (!active) return;
        setProjects(data);
      } catch (err) {
        if (!active) return;
        setError(
          err instanceof Error ? err.message : "Failed to load project statuses"
        );
      } finally {
        if (!active) return;
        setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">Loading projects…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold">Project Progress Monitoring</h1>
        <p className="text-muted-foreground mt-1">
          Track real-time updates on all your vehicle service projects
        </p>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Inbox className="h-16 w-16 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No Projects Yet</h3>
            <p className="mt-2 text-sm text-muted-foreground text-center max-w-md">
              You don't have any service projects yet. Book an appointment to get started
              with vehicle services.
            </p>
            <Link to="/customer/appointments">
              <Button className="mt-6">Book Appointment</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((projectStatus) => {
            const { project, lastMessage } = projectStatus;
            return (
              <Card
                key={project.projectId}
                className="overflow-hidden transition-shadow hover:shadow-lg"
              >
                <CardHeader className="border-b bg-muted/30">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-1">
                        {project.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Vehicle: {project.vehicleId}
                      </p>
                    </div>
                    {getStatusIcon(project.status)}
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(project.updatedAt)}
                    </span>
                  </div>

                  {project.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {project.description}
                    </p>
                  )}

                  {lastMessage && (
                    <div className="rounded-lg border bg-muted/30 p-3">
                      <div className="flex items-start gap-2">
                        <Bell className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-muted-foreground">
                            Latest Update
                          </p>
                          <p className="text-sm mt-1 line-clamp-2">
                            {lastMessage.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(lastMessage.occurredAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <Link to={`/customer/progress/${project.projectId}`}>
                    <Button variant="outline" className="w-full">
                      View Details
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
