import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardLayout from "@/components/layout/DashboardLayout";
import EmployeeSidebar from "@/components/layout/EmployeeSidebar";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { useAuth } from "@/contexts/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/projects/StatusBadge";
import { getAdminProject, updateTaskStatus } from "@/services/projectService";
import {
  getProjectMessages,
  postStatusMessage,
  uploadAndCreateMessage,
  subscribeToProjectUpdates,
} from "@/services/progressMonitoringService";
import { apiConfig } from "@/lib/api/client";
import type { ProjectDetails, TaskStatus } from "@/types/project";
import type { ProjectMessage, EventCategory } from "@/types/progressMonitoring";
import {
  Bell,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  FileText,
  Download,
  RefreshCw,
  ArrowLeft,
  Send,
  Upload,
  Loader2,
} from "lucide-react";

const formatDate = (value?: string) => (value ? new Date(value).toLocaleString() : "—");
const formatRelativeTime = (date: string) => {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

const isImageFile = (contentType?: string) => {
  if (!contentType) return false;
  return contentType.startsWith("image/");
};

const getCategoryIcon = (category: string) => {
  switch (category.toUpperCase()) {
    case "CREATED":
      return <FileText className="h-4 w-4" />;
    case "APPROVED":
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    case "REJECTED":
      return <XCircle className="h-4 w-4 text-red-600" />;
    case "COMPLETED":
      return <CheckCircle2 className="h-4 w-4 text-blue-600" />;
    case "UPDATED":
      return <RefreshCw className="h-4 w-4 text-amber-600" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};

const getCategoryColor = (category: string) => {
  switch (category.toUpperCase()) {
    case "CREATED":
      return "bg-blue-100 text-blue-800";
    case "APPROVED":
      return "bg-green-100 text-green-800";
    case "REJECTED":
      return "bg-red-100 text-red-800";
    case "COMPLETED":
      return "bg-purple-100 text-purple-800";
    case "UPDATED":
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const nextStatuses: Record<TaskStatus, TaskStatus[]> = {
  Pending: ["Requested", "Cancelled"],
  Requested: ["Accepted", "Cancelled"],
  Accepted: ["InProgress", "Cancelled"],
  InProgress: ["Completed"],
  Completed: [],
  Cancelled: [],
};

const categoryOptions: EventCategory[] = [
  "UPDATED",
  "APPROVED",
  "COMPLETED",
  "REJECTED",
  "CREATED",
  "APPLIED",
];

export default function EmployeeProjectProgressPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [messages, setMessages] = useState<ProjectMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const messagesTopRef = useRef<HTMLDivElement>(null);

  // Form state
  const [newMessage, setNewMessage] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<EventCategory>("UPDATED");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToTop = () => {
    messagesTopRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!projectId) return;
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load project details and messages in parallel
        const [projectData, messagesData] = await Promise.all([
          getAdminProject(projectId),
          getProjectMessages(projectId),
        ]);

        if (!active) return;

        setProject(projectData);
        setMessages(messagesData);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Unable to load project");
      } finally {
        if (!active) return;
        setLoading(false);
      }
    };

    load();

    // Set up SSE connection for live updates
    if (projectId) {
      try {
        const eventSource = subscribeToProjectUpdates(
          projectId,
          (newMessage) => {
            setMessages((prev) => [newMessage, ...prev]);
            setTimeout(scrollToTop, 100);
          },
          () => {
            setIsLiveConnected(false);
          }
        );

        eventSourceRef.current = eventSource;
        setIsLiveConnected(true);
      } catch (err) {
        console.error("Failed to establish SSE connection:", err);
      }
    }

    return () => {
      active = false;
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
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

  const handleSubmitMessage = async () => {
    if (!projectId || !newMessage.trim()) return;

    setIsSubmitting(true);
    try {
      let postedMessage: ProjectMessage;

      if (selectedFile) {
        postedMessage = await uploadAndCreateMessage(
          projectId,
          selectedFile,
          newMessage,
          selectedCategory
        );
      } else {
        postedMessage = await postStatusMessage(projectId, {
          message: newMessage,
          category: selectedCategory,
        });
      }

      // Add message to the list (it will also come via SSE but this is immediate)
      setMessages((prev) => [postedMessage, ...prev]);

      // Reset form
      setNewMessage("");
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
      setTimeout(scrollToTop, 100);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Unable to post message");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Determine which sidebar to use based on user role
  const sidebar = user?.role === "ADMIN" ? <AdminSidebar /> : <EmployeeSidebar />;

  if (!projectId) {
    return (
      <DashboardLayout sidebar={sidebar}>
        <p className="p-4">Missing project ID.</p>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout sidebar={sidebar}>
        <div className="mx-auto max-w-7xl space-y-6 p-4">
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-1">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-96 w-full" />
            </div>
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !project) {
    return (
      <DashboardLayout sidebar={sidebar}>
        <div className="p-4">
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <p className="text-destructive">{error ?? "Project not found."}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebar={sidebar}>
      <div className="mx-auto max-w-7xl space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link
          to="/admin/projects"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Link>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{project.title}</h1>
            <p className="text-muted-foreground mt-1">Vehicle: {project.vehicleId}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {isLiveConnected && (
              <Badge variant="outline" className="bg-green-50">
                <span className="mr-1.5 h-2 w-2 animate-pulse rounded-full bg-green-600" />
                Live
              </Badge>
            )}
            <StatusBadge status={project.status} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Project Details, Tasks & Post Update Form */}
        <div className="space-y-4 lg:col-span-1 overflow-y-auto" style={{ maxHeight: "calc(100vh - 10rem)" }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Project Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Requested Window</p>
                <div className="text-sm space-y-0.5">
                  <p className="font-medium">{formatDate(project.requestedStart)}</p>
                  <p className="font-medium">{formatDate(project.requestedEnd)}</p>
                </div>
              </div>
              {project.approvedStart && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Approved Window</p>
                  <div className="text-sm space-y-0.5">
                    <p className="font-medium text-green-700">{formatDate(project.approvedStart)}</p>
                    <p className="font-medium text-green-700">{formatDate(project.approvedEnd)}</p>
                  </div>
                </div>
              )}
              {project.description && (
                <div className="space-y-1 pt-2 border-t">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Description</p>
                  <p className="text-sm leading-relaxed">{project.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Tasks</CardTitle>
                <Badge variant="secondary" className="text-xs">{project.tasks.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {project.tasks.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No tasks assigned yet.</p>
              ) : (
                project.tasks.map((task) => (
                  <div key={task.taskId} className="rounded-lg border bg-card p-3 space-y-2.5 hover:shadow-sm transition-shadow">
                    <div>
                      <p className="font-medium text-sm leading-tight">{task.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{task.serviceType}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs font-medium">
                        {task.status}
                      </Badge>
                    </div>
                    {nextStatuses[task.status].length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1 border-t">
                        {nextStatuses[task.status].map((status) => (
                          <Button
                            key={status}
                            size="sm"
                            variant={status === "Cancelled" ? "destructive" : "outline"}
                            onClick={() => handleTaskStatus(task.taskId, status)}
                            className="h-7 text-xs font-medium"
                          >
                            {status}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Post Update Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Post Update</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={selectedCategory}
                  onValueChange={(value) => setSelectedCategory(value as EventCategory)}
                >
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Enter progress update message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">Attachment (optional)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="file"
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="flex-1"
                  />
                  {selectedFile && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedFile(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {selectedFile && (
                  <p className="text-xs text-muted-foreground">
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>

              <Button
                onClick={handleSubmitMessage}
                disabled={!newMessage.trim() || isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Post Update
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Progress Update Messages Only */}
        <div className="lg:col-span-2" style={{ height: "calc(100vh - 10rem)" }}>
          {/* Progress Update Messages */}
          <Card className="flex flex-col h-full">
            <CardHeader className="border-b flex-shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle>Progress Update Messages</CardTitle>
                <Badge variant="secondary">{messages.length} updates</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4">
              <div ref={messagesTopRef} />
              {messages.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <Clock className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <p className="mt-4 text-sm text-muted-foreground">
                      No updates yet. Be the first to post a progress update!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className="rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 flex-shrink-0 rounded-full p-2 ${getCategoryColor(msg.category)}`}
                        >
                          {getCategoryIcon(msg.category)}
                        </div>
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline" className="text-xs">
                                {msg.category}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(msg.occurredAt)}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                ({formatRelativeTime(msg.occurredAt)})
                              </span>
                            </div>
                          </div>
                          <p className="text-sm leading-relaxed">{msg.message}</p>
                          {msg.payload && (
                            <details className="text-xs">
                              <summary className="cursor-pointer text-muted-foreground">
                                View details
                              </summary>
                              <pre className="mt-2 rounded bg-muted p-2 overflow-x-auto">
                                {JSON.stringify(JSON.parse(msg.payload), null, 2)}
                              </pre>
                            </details>
                          )}
                          {msg.attachmentUrl && (
                            <div className="mt-3">
                              {isImageFile(msg.attachmentContentType) ? (
                                <div className="space-y-2">
                                  <div className="relative group rounded-lg overflow-hidden border bg-muted/30">
                                    <img
                                      src={`${apiConfig.API_BASE_URL}${msg.attachmentUrl}`}
                                      alt={msg.attachmentFilename || "Attachment"}
                                      className="w-full h-auto object-contain cursor-pointer transition-opacity hover:opacity-90"
                                      style={{ maxHeight: "320px", maxWidth: "100%" }}
                                      onClick={() => window.open(`${apiConfig.API_BASE_URL}${msg.attachmentUrl}`, '_blank')}
                                    />
                                  </div>
                                  <div className="flex items-center justify-between gap-2 px-1">
                                    <span className="text-xs text-muted-foreground truncate flex-1">
                                      {msg.attachmentFilename}
                                    </span>
                                    <a
                                      href={`${apiConfig.API_BASE_URL}${msg.attachmentUrl}`}
                                      download={msg.attachmentFilename}
                                      className="flex items-center gap-1.5 text-xs text-primary hover:underline whitespace-nowrap"
                                    >
                                      <Download className="h-3 w-3" />
                                      Download
                                    </a>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 rounded-md border p-3 bg-muted/50">
                                  <FileText className="h-5 w-5 text-muted-foreground" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{msg.attachmentFilename}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {msg.attachmentSize ? `${(msg.attachmentSize / 1024).toFixed(1)} KB` : ""}
                                    </p>
                                  </div>
                                  <a
                                    href={`${apiConfig.API_BASE_URL}${msg.attachmentUrl}`}
                                    download={msg.attachmentFilename}
                                    className="text-primary hover:underline flex items-center gap-1"
                                  >
                                    <Download className="h-4 w-4" />
                                  </a>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </DashboardLayout>
  );
}
