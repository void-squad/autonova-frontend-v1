import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ProjectProgressBar } from '@/components/projects/ProjectProgressBar';
import { ProgressTimeline } from '@/components/projects/ProgressTimeline';
import { progressService, ProjectProgress, ProgressMessage } from '@/services/progressService';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { timeLoggingApi } from '@/Api/timeLoggingApi';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Project } from '@/types';

const STATUS_OPTIONS = [
  { label: 'Planned', value: 'planned' },
  { label: 'In progress', value: 'in_progress' },
  { label: 'Paused', value: 'paused' },
  { label: 'Complete', value: 'complete' },
];

// Dummy data for local preview / design reference.
// To use, uncomment the setProgress(DUMMY_PROGRESS) and setStatus(DUMMY_PROGRESS.status)
// lines in the load() function below.
const DUMMY_PROGRESS: ProjectProgress = {
  projectId: 'demo-123',
  status: 'in_progress',
  progressPercentage: 42,
  messages: [
    {
      id: 'm3',
      authorId: 'emp-002',
      authorName: 'Jordan Smith',
      content: 'Replaced the front bumper and started paint prep. Awaiting color match approval.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: 'm2',
      authorId: 'emp-001',
      authorName: 'Alex Murphy',
      content: 'Ordered replacement parts. ETA 3 days.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
    {
      id: 'm1',
      authorName: 'System',
      content: 'Project created and scheduled for inspection.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    },
  ],
};

export default function EmployeeProjectProgressPage() {
  const { projectId } = useParams();
  const [progress, setProgress] = useState<ProjectProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [statusSelect, setStatusSelect] = useState<string | undefined>(undefined);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!projectId) return;
    let unsub: (() => void) | undefined;

    const load = async () => {
      setLoading(true);
          try {
            const data = await progressService.getProjectProgress(projectId);
            setProgress(data);
            setStatus(data.status);
            setStatusSelect(data.status);
            try {
              const p = await progressService.getProjectDetails(projectId);
              setProject(p as Project);
            } catch (err) {
              // ignore
            }
          } catch (err) {
        console.error('Failed to load project progress', err);
      } finally {
        setLoading(false);
      }

      unsub = progressService.subscribeToProjectProgress(projectId, (data) => {
        setProgress(data);
        setStatus(data.status);
      });
    };
    load();

    return () => unsub?.();
  }, [projectId]);

  if (!projectId) return <div>Project id missing</div>;

  const handleSend = async () => {
    if (!message.trim() && attachments.length === 0) return;
    try {
      const resp = await progressService.postProgressMessage(projectId, { content: message, attachments });
      // append returned message to timeline
      setProgress((prev) => ({ ...(prev ?? ({} as ProjectProgress)), messages: [resp, ...(prev?.messages ?? [])] }));
      setMessage('');
      // cleanup attachments
      setAttachments([]);
      previews.forEach((u) => URL.revokeObjectURL(u));
      setPreviews([]);
      toast({ title: 'Update sent', description: 'Progress update was sent to the project feed.' });
    } catch (err: any) {
      toast({ title: 'Unable to send', description: err?.message ?? 'Please try again', variant: 'destructive' });
    }
  };

  const handleFileChange = (files?: FileList | null) => {
    // cleanup old previews
    previews.forEach((u) => URL.revokeObjectURL(u));
    if (!files || files.length === 0) {
      setAttachments([]);
      setPreviews([]);
      return;
    }
    const arr = Array.from(files);
    setAttachments(arr);
    const urls = arr.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
  };

  // cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      previews.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [previews]);

  const handleStatusChange = async (newStatus?: string) => {
    if (!newStatus || newStatus === status) return;
    try {
      await progressService.updateProjectStatus(projectId, { status: newStatus });
      setStatus(newStatus);
      setStatusSelect(newStatus);
      toast({ title: 'Status updated', description: `Project status set to ${newStatus}` });
    } catch (err: any) {
      toast({ title: 'Unable to update', description: err?.message ?? 'Please try again', variant: 'destructive' });
    }
  };

  return (
    <div className="max-w-10xl mx-auto px-2 py-6">
      <div className="space-y-6">

        {/* Project details */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{project?.title ?? (project as any)?.name ?? 'Project details'}</CardTitle>
              <Badge className="uppercase">{project?.status ?? progress?.status ?? 'unknown'}</Badge>
            </div>
            {project?.description && <CardDescription>{project.description}</CardDescription>}
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div>
                <div className="text-sm text-muted-foreground">Project ID</div>
                <div className="font-medium">{project?.id ?? projectId}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Start date</div>
                <div className="font-medium">{project?.startDate ? new Date(project.startDate).toLocaleDateString() : '-'}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">End date</div>
                <div className="font-medium">{(project as any)?.endDate ? new Date((project as any).endDate).toLocaleDateString() : '-'}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Customer</div>
                <div className="font-medium">{(project as any)?.customerName ?? (project as any)?.customer ?? '-'}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Budget</div>
                <div className="font-medium">{typeof (project as any)?.budget === 'number' ? `$${((project as any).budget).toLocaleString()}` : ((project as any)?.budget ?? '-')}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <ProjectProgressBar status={progress?.status ?? project?.status ?? 'unknown'} percent={progress?.progressPercentage ?? project?.progressPct} />

        {/* Status update card - separate from message posting */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold">Update project status</h3>
          <p className="mt-1 text-sm text-muted-foreground">Change the overall project status. This is separate from progress messages.</p>
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <Select onValueChange={(v) => setStatusSelect(v)} value={statusSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Button onClick={() => handleStatusChange(statusSelect)}>Save status</Button>
            </div>
          </div>
        </div>

        {/* Progress message card (with optional photo attachment) */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold">Post progress update</h3>
          <p className="mt-1 text-sm text-muted-foreground">Post a message and optionally attach a photo. Customers will see this in their timeline.</p>
          <div className="mt-4 grid gap-3">
            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write an update..." />

              <div className="flex flex-col gap-2">
                <label className="text-sm text-muted-foreground">Attach photo(s)</label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <input
                    ref={fileInputRef}
                    className="hidden"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    multiple
                    onChange={(e) => handleFileChange(e.target.files)}
                  />
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                    Attach photo(s)
                  </Button>
                  <div className="flex flex-wrap gap-2">
                    {previews.map((u) => (
                      <div key={u} className="relative">
                        <img src={u} alt="preview" className="h-24 w-24 rounded-md object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            <div className="flex items-center gap-3">
              <Button onClick={handleSend}>Send update</Button>
              <Button variant="ghost" onClick={() => { setMessage(''); handleFileChange(null); }}>
                Clear
              </Button>
            </div>
          </div>
        </div>

        <ProgressTimeline messages={progress?.messages ?? []} />
      </div>
    </div>
  );
}
