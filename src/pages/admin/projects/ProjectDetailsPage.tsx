import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format, formatDistanceToNow } from "date-fns";

import DashboardLayout from "@/components/layout/DashboardLayout";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/projects/StatusBadge";
import { TasksTable } from "@/components/projects/TasksTable";
import { QuoteCard } from "@/components/projects/QuoteCard";
import { ProjectForm, type ProjectFormValues } from "@/components/projects/ProjectForm";
import { TaskFormValues } from "@/components/projects/AddTaskDialog";
import { ApproveRejectBar } from "@/components/projects/ApproveRejectBar";
import { AssigneesDialog } from "@/components/projects/AssigneesDialog";
import { ScheduleCard } from "@/components/projects/ScheduleCard";
import { useProjectsStore } from "@/contexts/ProjectsStore";
import type { Project, ProjectActivity, Quote, Task } from "@/types/project";
import { useToast } from "@/hooks/use-toast";
import { Can } from "@/components/auth/Can";

export default function ProjectDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    getProject,
    listTasks,
    getQuote,
    updateProject,
    addTask,
    updateTask,
    deleteTask,
    createQuote,
    activity: activityLog,
    startProject,
    completeProject,
    cancelProject,
  } = useProjectsStore();
  const { toast } = useToast();

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [savingProject, setSavingProject] = useState(false);
  const [actionLoading, setActionLoading] = useState<"start" | "complete" | "cancel" | null>(null);

  const projectActivity = useMemo<ProjectActivity[]>(() => activityLog.filter((entry) => entry.projectId === id), [activityLog, id]);

  const refreshProject = useCallback(async () => {
    if (!id) return;
    const latest = await getProject(id);
    if (latest) {
      setProject(latest);
    }
  }, [getProject, id]);

  const refreshQuote = useCallback(async () => {
    if (!id) return;
    const latestQuote = await getQuote(id);
    setQuote(latestQuote);
  }, [getQuote, id]);

  useEffect(() => {
    if (!id) return;

    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        setError(null);
        const [projectData, taskData, quoteData] = await Promise.all([getProject(id), listTasks(id), getQuote(id)]);
        if (!active) return;
        if (!projectData) {
          setNotFound(true);
          setProject(null);
        } else {
          setNotFound(false);
          setProject(projectData);
        }
        setTasks(taskData);
        setQuote(quoteData);
      } catch (err: any) {
        if (!active) return;
        setError(err?.message ?? "Failed to load project.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [getProject, getQuote, id, listTasks]);

  const handleProjectUpdate = async (values: ProjectFormValues) => {
    if (!project) return;
    try {
      setSavingProject(true);
      const updated = await updateProject(project.id, values);
      setProject(updated);
      setEditOpen(false);
      toast({
        title: "Project updated",
        description: "The project details were saved.",
      });
    } catch (err: any) {
      toast({
        title: "Unable to update project",
        description: err?.message ?? "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSavingProject(false);
    }
  };

  const handleAddTask = async (input: TaskFormValues) => {
    if (!project) return;
    const created = await addTask(project.id, input);
    setTasks((prev) => [...prev, created]);
    await Promise.all([refreshProject(), refreshQuote()]);
  };

  const handleUpdateTask = async (taskId: string, input: TaskFormValues) => {
    if (!project) return;
    const updatedTask = await updateTask(project.id, taskId, input);
    setTasks((prev) => prev.map((task) => (task.id === taskId ? updatedTask : task)));
    await Promise.all([refreshProject(), refreshQuote()]);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!project) return;
    await deleteTask(project.id, taskId);
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
    await Promise.all([refreshProject(), refreshQuote()]);
  };

  const handleCreateQuote = async () => {
    if (!project) return;
    const newQuote = await createQuote(project.id);
    setQuote(newQuote);
    await refreshProject();
  };

  const handleStatusAction = async (action: "start" | "complete" | "cancel") => {
    if (!project) return;
    try {
      setActionLoading(action);
      let updated: Project;
      if (action === "start") {
        updated = await startProject(project.id);
      } else if (action === "complete") {
        updated = await completeProject(project.id);
      } else {
        updated = await cancelProject(project.id);
      }
      setProject(updated);
      toast({
        title:
          action === "start"
            ? "Project in progress"
            : action === "complete"
              ? "Project completed"
              : "Project cancelled",
        description:
          action === "start"
            ? "The team can now log work on this project."
            : action === "complete"
              ? "Mark the project closed in your downstream systems."
              : "This request will no longer appear in active views.",
      });
    } catch (err: any) {
      toast({
        title: "Unable to update status",
        description: err?.message ?? "Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  if (!id) {
    return (
      <DashboardLayout sidebar={<AdminSidebar />}>
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground">No project selected.</p>
        </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout sidebar={<AdminSidebar />}>
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-96 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout sidebar={<AdminSidebar />}>
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            <p className="text-lg font-semibold text-destructive">Unable to load project</p>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" onClick={refreshProject}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  if (notFound || !project) {
    return (
      <DashboardLayout sidebar={<AdminSidebar />}>
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            <p className="text-lg font-semibold">Project not found</p>
            <p className="text-sm text-muted-foreground">
              The project you are looking for could not be located or may have been removed.
            </p>
            <Button onClick={() => navigate("/admin/projects")}>Back to projects</Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const priorityLabel = project.priority
    ? project.priority.charAt(0).toUpperCase() + project.priority.slice(1)
    : null;

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold">{project.title}</h1>
              <StatusBadge status={project.status} />
              {priorityLabel ? (
                <Badge variant="outline" className="uppercase tracking-wide">
                  {priorityLabel} priority
                </Badge>
              ) : null}
            </div>
            <p className="text-muted-foreground">
              Customer: <span className="font-medium text-foreground">{project.customerName}</span>
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span>Created {format(new Date(project.createdAt), "PP")}</span>
              <span>Updated {format(new Date(project.updatedAt), "PP")}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => navigate("/admin/projects")}>
              Back
            </Button>
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              Edit details
            </Button>
            <Can roles={["Admin"]}>
              {project.status === "approved" && (
                <Button onClick={() => handleStatusAction("start")} disabled={actionLoading !== null}>
                  {actionLoading === "start" ? "Starting..." : "Start project"}
                </Button>
              )}
              {project.status === "in_progress" && (
                <Button onClick={() => handleStatusAction("complete")} disabled={actionLoading !== null}>
                  {actionLoading === "complete" ? "Completing..." : "Mark completed"}
                </Button>
              )}
              {project.status !== "completed" && project.status !== "cancelled" && (
                <Button
                  variant="secondary"
                  onClick={() => handleStatusAction("cancel")}
                  disabled={actionLoading !== null}
                >
                  {actionLoading === "cancel" ? "Cancelling..." : "Cancel project"}
                </Button>
              )}
            </Can>
          </div>
        </div>

        <ApproveRejectBar projectId={project.id} status={project.status} onStatusChange={setProject} />

        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks &amp; estimates</TabsTrigger>
            <TabsTrigger value="quote">Quote</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
              <Card>
                <CardHeader>
                  <CardTitle>Project summary</CardTitle>
                  <CardDescription>Keep the team aligned on scope and expectations.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground">Description</h3>
                    <p className="mt-1 whitespace-pre-line text-sm">
                      {project.description ?? "No description provided."}
                    </p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground">Priority</h3>
                      <p className="mt-1 text-sm capitalize">{project.priority ?? "Not set"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground">Schedule</h3>
                      <p className="mt-1 text-sm">
                        {project.startDate ? format(new Date(project.startDate), "PP") : "TBD"} &ndash;{" "}
                        {project.endDate ? format(new Date(project.endDate), "PP") : "TBD"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <AssigneesDialog
                  projectId={project.id}
                  selectedIds={project.assigneeIds}
                  onChange={(ids) => setProject((prev) => (prev ? { ...prev, assigneeIds: ids } : prev))}
                />
                <ScheduleCard
                  projectId={project.id}
                  startDate={project.startDate}
                  endDate={project.endDate}
                  onScheduleChange={(schedule) => setProject((prev) => (prev ? { ...prev, ...schedule } : prev))}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tasks">
            <TasksTable
              tasks={tasks}
              onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
            />
          </TabsContent>

          <TabsContent value="quote">
            <QuoteCard quote={quote} onCreateQuote={handleCreateQuote} />
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
                <CardDescription>Recent updates and automation for this project.</CardDescription>
              </CardHeader>
              <CardContent>
                {projectActivity.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No activity yet.</p>
                ) : (
                  <ul className="relative">
                    {projectActivity.map((entry, index) => (
                      <li key={entry.id} className="relative pl-6 pb-6 last:pb-0">
                        <span className="absolute left-0 top-1 h-2 w-2 rounded-full bg-primary" />
                        {index !== projectActivity.length - 1 && (
                          <span className="absolute left-[3px] top-4 h-full w-px bg-border" />
                        )}
                        <p className="text-sm font-medium">{entry.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(entry.at), { addSuffix: true })}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit project</DialogTitle>
          </DialogHeader>
          <ProjectForm
            defaultValues={{
              customerName: project.customerName,
              title: project.title,
              description: project.description,
              priority: project.priority,
            }}
            onSubmit={handleProjectUpdate}
            submitLabel="Save changes"
            loading={savingProject}
          />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
