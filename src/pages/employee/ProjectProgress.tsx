import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [messages, setMessages] = useState<ProjectMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Form state
  const [newMessage, setNewMessage] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<EventCategory>("UPDATED");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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

        // Scroll to bottom after messages load
        setTimeout(scrollToBottom, 100);
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
            setTimeout(scrollToBottom, 100);
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
      
      setTimeout(scrollToBottom, 100);
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

  if (!projectId) {
    return <p className="p-4">Missing project ID.</p>;
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">Loading project…</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-4">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-destructive">{error ?? "Project not found."}</p>
        </div>
      </div>
    );
  }

  return (
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
        {/* Left Column - Project Details & Tasks */}
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Project Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Requested window</p>
                <p className="font-medium text-sm">{formatDate(project.requestedStart)}</p>
                <p className="font-medium text-sm">{formatDate(project.requestedEnd)}</p>
              </div>
              {project.approvedStart && (
                <div>
                  <p className="text-sm text-muted-foreground">Approved window</p>
                  <p className="font-medium text-sm">{formatDate(project.approvedStart)}</p>
                  <p className="font-medium text-sm">{formatDate(project.approvedEnd)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tasks ({project.tasks.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {project.tasks.map((task) => (
                <div key={task.taskId} className="rounded-lg border p-3 space-y-2">
                  <div>
                    <p className="font-medium text-sm">{task.title}</p>
                    <p className="text-xs text-muted-foreground">{task.serviceType}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {task.status}
                    </Badge>
                  </div>
                  {nextStatuses[task.status].length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {nextStatuses[task.status].map((status) => (
                        <Button
                          key={status}
                          size="sm"
                          variant={status === "Cancelled" ? "destructive" : "outline"}
                          onClick={() => handleTaskStatus(task.taskId, status)}
                          className="h-7 text-xs"
                        >
                          {status}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Progress Updates & Post Message */}
        <div className="lg:col-span-2 space-y-4">
          {/* Post Update Form */}
          <Card>
            <CardHeader>
              <CardTitle>Post Update</CardTitle>
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

          {/* Progress Updates Timeline */}
          <Card className="h-[calc(100vh-28rem)]">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle>Progress Timeline</CardTitle>
                <Badge variant="secondary">{messages.length} updates</Badge>
              </div>
            </CardHeader>
            <CardContent className="h-[calc(100%-5rem)] overflow-y-auto p-4">
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
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className="rounded-lg border bg-card p-4 transition-shadow hover:shadow-md"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 rounded-full p-2 ${getCategoryColor(msg.category)}`}
                        >
                          {getCategoryIcon(msg.category)}
                        </div>
                        <div className="flex-1 space-y-2">
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
                            <div className="flex items-center gap-2 rounded-md border p-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm flex-1">{msg.attachmentFilename}</span>
                              <a
                                href={msg.attachmentUrl}
                                download
                                className="text-primary hover:underline"
                              >
                                <Download className="h-4 w-4" />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
