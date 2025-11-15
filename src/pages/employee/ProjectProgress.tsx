import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/projects/StatusBadge";
import { getAdminProject, updateTaskStatus } from "@/services/projectService";
import type { ProjectDetails, TaskStatus } from "@/types/project";

const formatDate = (value?: string) => (value ? new Date(value).toLocaleString() : "—");

const nextStatuses: Record<TaskStatus, TaskStatus[]> = {
  Requested: ["Accepted", "Cancelled"],
  Accepted: ["InProgress", "Cancelled"],
  InProgress: ["Completed"],
  Completed: [],
  Cancelled: [],
};

export default function EmployeeProjectProgressPage() {
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
        const data = await getAdminProject(projectId);
        if (!active) return;
        setProject(data);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Unable to load project");
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

  const handleTaskStatus = async (taskId: string, status: TaskStatus) => {
    try {
      await updateTaskStatus(taskId, status);
      if (!projectId) return;
      const updated = await getAdminProject(projectId);
      setProject(updated);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Unable to update task");
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

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{project.title}</h1>
          <p className="text-muted-foreground">Vehicle {project.vehicleId}</p>
        </div>
        <StatusBadge status={project.status} />
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
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {project.tasks.map((task) => (
                <tr key={task.taskId}>
                  <td className="px-4 py-2 font-medium">{task.title}</td>
                  <td className="px-4 py-2">{task.serviceType}</td>
                  <td className="px-4 py-2">{task.status}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">
                    {formatDate(task.scheduledStart)} – {formatDate(task.scheduledEnd)}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      {nextStatuses[task.status].map((status) => (
                        <Button
                          key={status}
                          size="sm"
                          variant={status === "Cancelled" ? "destructive" : "outline"}
                          onClick={() => handleTaskStatus(task.taskId, status)}
                        >
                          {status}
                        </Button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
