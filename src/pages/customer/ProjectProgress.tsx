import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ProjectProgressBar } from '@/components/projects/ProjectProgressBar';
import { ProgressTimeline } from '@/components/projects/ProgressTimeline';
import { progressService, ProjectProgress } from '@/services/progressService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Project } from '@/types';

// Dummy data for local preview / design reference.
// You can uncomment the setProgress(DUMMY_PROGRESS) line in the load() function below to use this data.
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

export default function CustomerProjectProgressPage() {
  const { projectId } = useParams();
  const [progress, setProgress] = useState<ProjectProgress | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;
    let unsub: (() => void) | undefined;

    const load = async () => {
      setLoading(true);
          try {
            const data = await progressService.getProjectProgress(projectId);
            setProgress(data);
            // fetch project details via progressService (will return demo for 'demo')
            try {
              const p = await progressService.getProjectDetails(projectId);
              setProject(p as Project);
            } catch (err) {
              // ignore - project details are optional
            }
          } catch (err) {
        console.error('Failed to load project progress', err);
      } finally {
        setLoading(false);
      }

      // subscribe for realtime
      unsub = progressService.subscribeToProjectProgress(projectId, (data) => {
        setProgress(data);
      });
    };
    load();

    return () => {
      unsub?.();
    };
  }, [projectId]);

  if (!projectId) return <div>Project id missing</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="space-y-6">
        <ProjectProgressBar status={progress?.status ?? project?.status ?? 'unknown'} percent={progress?.progressPercentage ?? project?.progressPct} />

        {/* Project details */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{project?.title ?? 'Project details'}</CardTitle>
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
            </div>
          </CardContent>
        </Card>

        <ProgressTimeline messages={progress?.messages ?? []} />
      </div>
    </div>
  );
}
