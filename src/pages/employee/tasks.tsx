import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchAssignedTasks, updateTaskStatus } from "@/services/projectService";
import type { ProjectTask, TaskPriority, TaskStatus } from "@/types/project";

const formatDate = (value?: string) => (value ? new Date(value).toLocaleString() : "—");

const taskStatusValues: TaskStatus[] = ["Requested", "Accepted", "InProgress", "Completed", "Cancelled"];
const taskPriorityValues: TaskPriority[] = ["urgent", "high", "normal", "low"];

const nextAvailableStatuses: Record<TaskStatus, TaskStatus[]> = {
  Requested: ["Accepted", "Cancelled"],
  Accepted: ["InProgress", "Cancelled"],
  InProgress: ["Completed"],
  Completed: [],
  Cancelled: [],
};

export default function EmployeeTasks() {
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      console.log("[DEBUG] Starting to load tasks...");
      setLoading(true);
      setError(null);
      const data = await fetchAssignedTasks();
      console.log("[DEBUG] Tasks loaded successfully:", data);
      const statusCounts = taskStatusValues.reduce<Record<TaskStatus, number>>((acc, status) => {
        acc[status] = data.filter((t) => t.status === status).length;
        return acc;
      }, {} as Record<TaskStatus, number>);
      const priorityCounts = taskPriorityValues.reduce<Record<TaskPriority, number>>((acc, priority) => {
        acc[priority] = data.filter((t) => t.priority === priority).length;
        return acc;
      }, {} as Record<TaskPriority, number>);
      console.log("[DEBUG] Tasks by status:", statusCounts);
      console.log("[DEBUG] Tasks by priority:", priorityCounts);
      setTasks(data);
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

  const handleUpdate = async (taskId: string, status: TaskStatus) => {
    try {
      await updateTaskStatus(taskId, status);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Unable to update task");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Tasks</h1>
          <p className="text-muted-foreground">Work assigned to you across all projects.</p>
        </div>
        <Button variant="outline" onClick={load} disabled={loading}>
          Refresh
        </Button>
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <Card>
        <CardHeader>
          <CardTitle>Assignments</CardTitle>
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
                  <th className="px-4 py-2 text-left">Service</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Schedule</th>
                  <th className="px-4 py-2 text-left">Project</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {tasks.map((task) => (
                  <tr key={task.taskId}>
                    <td className="px-4 py-2 font-medium">{task.title}</td>
                    <td className="px-4 py-2">{task.serviceType}</td>
                    <td className="px-4 py-2">{task.status}</td>
                    <td className="px-4 py-2 text-xs text-muted-foreground">
                      {formatDate(task.scheduledStart)} – {formatDate(task.scheduledEnd)}
                    </td>
                    <td className="px-4 py-2 text-xs">{task.projectId}</td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        {nextAvailableStatuses[task.status].map((next) => (
                          <Button
                            key={next}
                            size="sm"
                            variant={next === "Cancelled" ? "destructive" : "outline"}
                            onClick={() => handleUpdate(task.taskId, next)}
                          >
                            {next}
                          </Button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
