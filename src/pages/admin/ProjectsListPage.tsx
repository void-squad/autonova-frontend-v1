import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { StatusBadge } from "@/components/projects/StatusBadge";
import { listAdminProjects } from "@/services/projectService";
import type { ProjectSummary, ProjectStatus } from "@/types/project";

const statusOptions: Array<{ label: string; value?: ProjectStatus }> = [
  { label: "All", value: undefined },
  { label: "Pending review", value: "PendingReview" },
  { label: "Approved", value: "Approved" },
  { label: "In progress", value: "InProgress" },
  { label: "Completed", value: "Completed" },
  { label: "Cancelled", value: "Cancelled" },
];

const formatDate = (value?: string) => (value ? new Date(value).toLocaleDateString() : "—");

export default function ProjectsListPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [status, setStatus] = useState<ProjectStatus | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await listAdminProjects(status);
        if (!active) return;
        setProjects(data);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load projects");
      } finally {
        if (!active) return;
        setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [status]);

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold">Projects</h1>
            <p className="text-muted-foreground">Review customer modification requests and approvals.</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">Status</label>
            <Select
              value={status ?? "all"}
              onValueChange={(value) =>
                setStatus(value === "all" ? undefined : (value as ProjectStatus))
              }
            >
              <SelectTrigger className="w-56">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem
                    key={option.label}
                    value={option.value ?? "all"}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {error ? (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="font-semibold text-destructive">{error}</p>
              <Button size="sm" variant="outline" className="mt-3" onClick={() => setStatus(status)}>
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : loading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <div className="overflow-hidden rounded-md border">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Title</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Requested window</th>
                  <th className="px-4 py-3 text-left font-medium">Approved window</th>
                  <th className="px-4 py-3 text-left font-medium">Created</th>
                  <th className="px-4 py-3 text-left font-medium">Updated</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {projects.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">
                      No projects match the selected filters.
                    </td>
                  </tr>
                ) : (
                  projects.map((project) => (
                    <tr key={project.projectId} className="hover:bg-muted/25">
                      <td className="px-4 py-3">
                        <div className="font-medium">{project.title}</div>
                        <div className="text-xs text-muted-foreground">
                          Vehicle: {project.vehicleId}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={project.status} />
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {formatDate(project.requestedStart)} – {formatDate(project.requestedEnd)}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {formatDate(project.approvedStart)} – {formatDate(project.approvedEnd)}
                      </td>
                      <td className="px-4 py-3">{formatDate(project.createdAt)}</td>
                      <td className="px-4 py-3">{formatDate(project.updatedAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <Button size="sm" variant="outline" onClick={() => navigate(`/admin/projects/${project.projectId}`)}>
                          View
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
