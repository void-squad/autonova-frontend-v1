import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/projects/StatusBadge";
import {
  getProjectDetails,
  cancelProject,
} from "@/services/projectService";
import {
  getProjectMessages,
  subscribeToProjectUpdates,
} from "@/services/progressMonitoringService";
import type { ProjectDetails } from "@/types/project";
import type { ProjectMessage } from "@/types/progressMonitoring";
import { 
  Bell, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock, 
  FileText,
  Download,
  RefreshCw,
  ArrowLeft
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

export default function CustomerProjectProgressPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [messages, setMessages] = useState<ProjectMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
          getProjectDetails(projectId),
          getProjectMessages(projectId),
        ]);
        
        if (!active) return;
        
        setProject(projectData);
        setMessages(messagesData);
        
        // Scroll to bottom after messages load
        setTimeout(scrollToBottom, 100);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load project");
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

  const canCancel = project.status === "PendingReview";

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link to="/customer/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
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
            {canCancel && (
              <Button variant="outline" onClick={handleCancel}>
                Cancel request
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Project Details */}
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Project Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Requested window</p>
                <p className="font-medium text-sm">
                  {formatDate(project.requestedStart)}
                </p>
                <p className="font-medium text-sm">
                  {formatDate(project.requestedEnd)}
                </p>
              </div>
              {project.approvedStart && (
                <div>
                  <p className="text-sm text-muted-foreground">Approved window</p>
                  <p className="font-medium text-sm">
                    {formatDate(project.approvedStart)}
                  </p>
                  <p className="font-medium text-sm">
                    {formatDate(project.approvedEnd)}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium text-sm">{formatDate(project.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last updated</p>
                <p className="font-medium text-sm">{formatDate(project.updatedAt)}</p>
              </div>
              {project.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="text-sm">{project.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tasks ({project.tasks.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {project.tasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tasks yet.</p>
              ) : (
                project.tasks.map((task) => (
                  <div
                    key={task.taskId}
                    className="rounded-lg border p-3 space-y-1"
                  >
                    <p className="font-medium text-sm">{task.title}</p>
                    <p className="text-xs text-muted-foreground">{task.serviceType}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {task.status}
                      </Badge>
                      {task.scheduledStart && (
                        <p className="text-xs text-muted-foreground">
                          {formatDate(task.scheduledStart)}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Progress Updates */}
        <div className="lg:col-span-2">
          <Card className="h-[calc(100vh-12rem)]">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle>Progress Updates</CardTitle>
                <Badge variant="secondary">{messages.length} updates</Badge>
              </div>
            </CardHeader>
            <CardContent className="h-[calc(100%-5rem)] overflow-y-auto p-4">
              {messages.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <Clock className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <p className="mt-4 text-sm text-muted-foreground">
                      No updates yet. Check back later for progress updates.
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
                        <div className={`mt-0.5 rounded-full p-2 ${getCategoryColor(msg.category)}`}>
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
