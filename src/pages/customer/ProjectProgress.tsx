import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/projects/StatusBadge";
import {
  getProjectDetails,
  cancelProject,
} from "@/services/projectService";
import type { ProjectDetails } from "@/types/project";

const formatDate = (value?: string) => (value ? new Date(value).toLocaleString() : "—");

export default function CustomerProjectProgressPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getProjectDetails(projectId);
        if (!active) return;
        setProject(data);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load project");
      } finally {
        if (!active) return;
        setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [projectId]);

  const handleCancel = async () => {
    if (!projectId) return;
    if (!confirm("Cancel this request?")) return;
    try {
      await cancelProject(projectId);
      const updated = await getProjectDetails(projectId);
      setProject(updated);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Unable to cancel project");
    }
  };

  if (!projectId) {
    return <p className="p-4">Missing project ID.</p>;
  }

  if (loading) {
    return <p className="p-4">Loading project…</p>;
  }

  if (error || !project) {
    return <p className="p-4 text-destructive">{error ?? "Project not found."}</p>;
  }

  const canCancel = project.status === "PendingReview";

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{project.title}</h1>
          <p className="text-muted-foreground">Vehicle {project.vehicleId}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={project.status} />
          {canCancel && (
            <Button variant="outline" onClick={handleCancel}>
              Cancel request
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Requested window</p>
            <p className="font-medium">
              {formatDate(project.requestedStart)} – {formatDate(project.requestedEnd)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Approved window</p>
            <p className="font-medium">
              {formatDate(project.approvedStart)} – {formatDate(project.approvedEnd)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Created</p>
            <p className="font-medium">{formatDate(project.createdAt)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Updated</p>
            <p className="font-medium">{formatDate(project.updatedAt)}</p>
          </div>
          {project.description && (
            <div className="sm:col-span-2">
              <p className="text-sm text-muted-foreground">Description</p>
              <p>{project.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
        </CardHeader>
        <CardContent className="overflow-hidden rounded-md border">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-2 text-left">Title</th>
                <th className="px-4 py-2 text-left">Service</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Schedule</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {project.tasks.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">
                    No tasks yet.
                  </td>
                </tr>
              ) : (
                project.tasks.map((task) => (
                  <tr key={task.taskId}>
                    <td className="px-4 py-2 font-medium">{task.title}</td>
                    <td className="px-4 py-2">{task.serviceType}</td>
                    <td className="px-4 py-2">{task.status}</td>
                    <td className="px-4 py-2 text-xs text-muted-foreground">
                      {formatDate(task.scheduledStart)} – {formatDate(task.scheduledEnd)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {project.activity.length === 0 ? (
            <p className="text-sm text-muted-foreground">No updates yet.</p>
          ) : (
            project.activity.map((entry) => (
              <div key={entry.id} className="rounded-md border p-3">
                <p className="text-sm font-medium">{entry.actorRole}</p>
                <p className="text-xs text-muted-foreground">{formatDate(entry.createdAt)}</p>
                <p className="mt-1 text-sm">{entry.message}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
