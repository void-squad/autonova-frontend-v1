import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  fetchEmployeeDashboard,
  type ActiveProject,
  type UpcomingTask,
} from "@/services/employeeDashboardService";

const formatDueDate = (value?: string) => {
  if (!value || value === "TBD") return "To be scheduled";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

const priorityBadgeStyles: Record<string, string> = {
  URGENT: "bg-red-500 text-white",
  HIGH: "bg-orange-500 text-white",
  MEDIUM: "bg-amber-500 text-white",
  LOW: "bg-muted text-foreground",
  Accepted: "bg-emerald-500 text-white",
  Pending: "bg-yellow-500 text-black",
  InProgress: "bg-blue-500 text-white",
};

const getPriorityBadgeClass = (priority?: string | null) => {
  if (!priority) return "bg-muted text-foreground";
  return priorityBadgeStyles[priority] ?? "bg-muted text-foreground";
};

export default function EmployeeTasks() {
  const [tasks, setTasks] = useState<UpcomingTask[]>([]);
  const [projects, setProjects] = useState<ActiveProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      console.log("[DEBUG] Starting to load tasks...");
      setLoading(true);
      setError(null);
      const data = await fetchEmployeeDashboard();
      console.log("[DEBUG] Dashboard data loaded successfully:", data);
      setTasks(data.upcomingTasks ?? []);
      setProjects(data.activeProjects ?? []);
    } catch (err) {
      console.error("[DEBUG] Error loading tasks:", err);
      setError(err instanceof Error ? err.message : "Failed to load tasks");
    } finally {
      setLoading(false);
      console.log("[DEBUG] Loading complete");
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Tasks</h1>
        <p className="text-muted-foreground">Work assigned to you across all projects.</p>
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Tasks</CardTitle>
        </CardHeader>
        <CardContent className="overflow-hidden rounded-md border">
          {loading ? (
            <p className="p-4 text-sm text-muted-foreground">Loading tasks…</p>
          ) : tasks.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No tasks assigned.</p>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-2 text-left">Title</th>
                  <th className="px-4 py-2 text-left">Priority</th>
                  <th className="px-4 py-2 text-left">Due</th>
                  <th className="px-4 py-2 text-left">Project</th>
                  <th className="px-4 py-2 text-left">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td className="px-4 py-2 font-medium">{task.title}</td>
                    <td className="px-4 py-2">
                      <Badge className={getPriorityBadgeClass(task.priority)}>
                        {task.priority ?? "Unassigned"}
                      </Badge>
                    </td>
                    <td className="px-4 py-2 text-xs text-muted-foreground">
                      {formatDueDate(task.dueDate)}
                    </td>
                    <td className="px-4 py-2 text-xs">{task.projectId ?? "—"}</td>
                    <td className="px-4 py-2 text-xs text-muted-foreground max-w-xs">
                      {task.description?.trim() || "No description provided"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Projects</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading projects…</p>
          ) : projects.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active projects.</p>
          ) : (
            projects.map((project) => (
              <div key={project.projectId} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{project.projectName}</p>
                    <p className="text-xs text-muted-foreground">Customer: {project.customerName}</p>
                  </div>
                  <Badge variant={project.status === "InProgress" ? "default" : "outline"}>
                    {project.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {project.startDate ? `Start: ${new Date(project.startDate).toLocaleDateString()}` : ""}
                  {project.expectedCompletionDate ? ` • Due: ${new Date(project.expectedCompletionDate).toLocaleDateString()}` : ""}
                </p>
                <div className="mt-2 h-2 w-full rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{ width: `${project.progressPercentage}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
