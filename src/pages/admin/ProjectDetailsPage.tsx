import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { StatusBadge } from "@/components/projects/StatusBadge";
import {
  getAdminProject,
  approveProject,
  createAdminTask,
  updateAdminAppointmentStatus,
} from "@/services/projectService";
import type { ProjectDetails, ProjectTask, ProjectStatus } from "@/types/project";

const formatDateTime = (value?: string) =>
  value ? new Date(value).toLocaleString() : "—";

interface ApproveFormState {
  approvedStart?: string;
  approvedEnd?: string;
  assignments: Record<string, { assigneeId?: string; scheduledStart?: string; scheduledEnd?: string }>;
}

const defaultApproveState = (project?: ProjectDetails): ApproveFormState => {
  const assignments: ApproveFormState["assignments"] = {};
  project?.tasks.forEach((task) => {
    assignments[task.taskId] = {
      assigneeId: task.assigneeId,
      scheduledStart: task.scheduledStart?.slice(0, 16),
      scheduledEnd: task.scheduledEnd?.slice(0, 16),
    };
  });
  return {
    approvedStart: project?.approvedStart?.slice(0, 16),
    approvedEnd: project?.approvedEnd?.slice(0, 16),
    assignments,
  };
};

export default function ProjectDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approveOpen, setApproveOpen] = useState(false);
  const [approveState, setApproveState] = useState<ApproveFormState>(defaultApproveState());
  const [taskDraft, setTaskDraft] = useState({ title: "", serviceType: "", detail: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    if (!id) return;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAdminProject(id);
        if (!active) return;
        setProject(data);
        setApproveState(defaultApproveState(data));
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
  }, [id]);

  const handleApprove = async () => {
    if (!project) return;
    try {
      setSubmitting(true);
      await approveProject(project.projectId, {
        approvedStart: approveState.approvedStart,
        approvedEnd: approveState.approvedEnd,
        tasks: project.tasks.map((task) => ({
          taskId: task.taskId,
          assigneeId: approveState.assignments[task.taskId]?.assigneeId,
          scheduledStart: approveState.assignments[task.taskId]?.scheduledStart,
          scheduledEnd: approveState.assignments[task.taskId]?.scheduledEnd,
        })),
      });
      if (project.appointmentId) {
        try {
          await updateAdminAppointmentStatus(project.appointmentId, "IN_PROGRESS", `Project ${project.projectId} approved`);
        } catch (err) {
          console.warn("Failed to update appointment status", err);
        }
      }
      const updated = await getAdminProject(project.projectId);
      setProject(updated);
      setApproveOpen(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Unable to approve project");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddTask = async () => {
    if (!project || !taskDraft.title || !taskDraft.serviceType) return;
    try {
      setSubmitting(true);
      await createAdminTask(project.projectId, {
        title: taskDraft.title,
        serviceType: taskDraft.serviceType,
        detail: taskDraft.detail,
      });
      const updated = await getAdminProject(project.projectId);
      setProject(updated);
      setApproveState(defaultApproveState(updated));
      setTaskDraft({ title: "", serviceType: "", detail: "" });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Unable to add task");
    } finally {
      setSubmitting(false);
    }
  };

  const projectTasks: ProjectTask[] = project?.tasks ?? [];

  const summaryRows = useMemo(() => {
    if (!project) return [];
    return [
      { label: "Project ID", value: project.projectId },
      { label: "Customer", value: project.customerId },
      { label: "Vehicle", value: project.vehicleId },
      { label: "Requested window", value: `${formatDateTime(project.requestedStart)} – ${formatDateTime(project.requestedEnd)}` },
      { label: "Approved window", value: `${formatDateTime(project.approvedStart)} – ${formatDateTime(project.approvedEnd)}` },
      { label: "Created", value: formatDateTime(project.createdAt) },
      { label: "Updated", value: formatDateTime(project.updatedAt) },
    ];
  }, [project]);

  const isPending = (status: ProjectStatus) => status === "PendingReview";

  if (!id) {
    return (
      <DashboardLayout sidebar={<AdminSidebar />}>
        <div className="p-8 text-center text-muted-foreground">No project selected.</div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout sidebar={<AdminSidebar />}>
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !project) {
    return (
      <DashboardLayout sidebar={<AdminSidebar />}>
        <Card>
          <CardContent className="py-20 text-center">
            <p className="font-medium text-destructive">{error ?? "Project not found"}</p>
            <Button className="mt-4" variant="outline" onClick={() => navigate(-1)}>
              Go back
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">{project.title}</h1>
            <p className="text-muted-foreground">Customer modification request</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={project.status} />
            <Button
              variant="outline"
              onClick={() => navigate(`/admin/projects/${id}/progress`)}
            >
              Progress Monitoring
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {summaryRows.map((row) => (
              <div key={row.label}>
                <p className="text-sm text-muted-foreground">{row.label}</p>
                <p className="font-medium">{row.value}</p>
              </div>
            ))}
            {project.description && (
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="whitespace-pre-line">{project.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {isPending(project.status) && (
          <Button onClick={() => setApproveOpen(true)} className="w-full sm:w-auto">
            Approve & assign
          </Button>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Tasks</CardTitle>
            <p className="text-sm text-muted-foreground">Work items created from the appointment</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 rounded-md border p-4">
              <Label htmlFor="taskTitle">Add task</Label>
              <Input
                id="taskTitle"
                placeholder="Title"
                value={taskDraft.title}
                onChange={(e) => setTaskDraft((prev) => ({ ...prev, title: e.target.value }))}
              />
              <Input
                placeholder="Service type"
                value={taskDraft.serviceType}
                onChange={(e) => setTaskDraft((prev) => ({ ...prev, serviceType: e.target.value }))}
              />
              <Textarea
                placeholder="Detail"
                value={taskDraft.detail}
                onChange={(e) => setTaskDraft((prev) => ({ ...prev, detail: e.target.value }))}
              />
              <Button type="button" onClick={handleAddTask} disabled={submitting || !taskDraft.title || !taskDraft.serviceType}>
                Add task
              </Button>
            </div>

            <div className="overflow-hidden rounded-md border">
              <table className="min-w-full divide-y text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-2 text-left">Title</th>
                    <th className="px-4 py-2 text-left">Service</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Assignee</th>
                    <th className="px-4 py-2 text-left">Schedule</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {projectTasks.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                        No tasks yet.
                      </td>
                    </tr>
                  ) : (
                    projectTasks.map((task) => (
                      <tr key={task.taskId}>
                        <td className="px-4 py-2 font-medium">{task.title}</td>
                        <td className="px-4 py-2">{task.serviceType}</td>
                        <td className="px-4 py-2">{task.status}</td>
                        <td className="px-4 py-2">{task.assigneeId ?? "Unassigned"}</td>
                        <td className="px-4 py-2 text-xs text-muted-foreground">
                          {formatDateTime(task.scheduledStart)} – {formatDateTime(task.scheduledEnd)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {project.activity.length === 0 ? (
                <p className="text-sm text-muted-foreground">No activity logged yet.</p>
              ) : (
                project.activity.map((entry) => (
                  <div key={entry.id} className="rounded-md border p-3">
                    <p className="text-sm font-medium">{entry.actorRole}</p>
                    <p className="text-sm text-muted-foreground">{formatDateTime(entry.createdAt)}</p>
                    <p className="mt-2 text-sm">{entry.message}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Approve project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <Label htmlFor="approvedStart">Approved start</Label>
                <Input
                  id="approvedStart"
                  type="datetime-local"
                  value={approveState.approvedStart ?? ""}
                  onChange={(e) => setApproveState((prev) => ({ ...prev, approvedStart: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="approvedEnd">Approved end</Label>
                <Input
                  id="approvedEnd"
                  type="datetime-local"
                  value={approveState.approvedEnd ?? ""}
                  onChange={(e) => setApproveState((prev) => ({ ...prev, approvedEnd: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-4">
              {projectTasks.map((task) => (
                <div key={task.taskId} className="rounded-md border p-3">
                  <p className="text-sm font-medium">{task.title}</p>
                  <div className="mt-2 grid gap-3 md:grid-cols-3">
                    <div>
                      <Label>Assignee ID</Label>
                      <Input
                        value={approveState.assignments[task.taskId]?.assigneeId ?? ""}
                        onChange={(e) =>
                          setApproveState((prev) => ({
                            ...prev,
                            assignments: {
                              ...prev.assignments,
                              [task.taskId]: {
                                ...prev.assignments[task.taskId],
                                assigneeId: e.target.value || undefined,
                              },
                            },
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label>Scheduled start</Label>
                      <Input
                        type="datetime-local"
                        value={approveState.assignments[task.taskId]?.scheduledStart ?? ""}
                        onChange={(e) =>
                          setApproveState((prev) => ({
                            ...prev,
                            assignments: {
                              ...prev.assignments,
                              [task.taskId]: {
                                ...prev.assignments[task.taskId],
                                scheduledStart: e.target.value || undefined,
                              },
                            },
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label>Scheduled end</Label>
                      <Input
                        type="datetime-local"
                        value={approveState.assignments[task.taskId]?.scheduledEnd ?? ""}
                        onChange={(e) =>
                          setApproveState((prev) => ({
                            ...prev,
                            assignments: {
                              ...prev.assignments,
                              [task.taskId]: {
                                ...prev.assignments[task.taskId],
                                scheduledEnd: e.target.value || undefined,
                              },
                            },
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setApproveOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleApprove} disabled={submitting}>
                Save & approve
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
