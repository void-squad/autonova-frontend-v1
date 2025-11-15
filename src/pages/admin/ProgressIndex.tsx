import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useProjectsStore } from '@/contexts/ProjectsStore';
import type { Project } from '@/types';

export default function AdminProgressIndex() {
  const { listProjects } = useProjectsStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await listProjects();
        if (!active) return;
        setProjects(res.data);
      } catch (e) {
        // ignore
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [listProjects]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Project progress (Admin)</h1>
      <p className="text-sm text-muted-foreground mb-6">Select a project to view live progress updates and timeline.</p>

      <div className="grid gap-4">
        {projects.length === 0 && !loading && (
          <Card>
            <CardContent>
              <div className="text-sm text-muted-foreground">No projects available.</div>
            </CardContent>
          </Card>
        )}

        {projects.map((p) => (
          <Card key={p.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{p.title}</CardTitle>
                <Link to={`/admin/projects/${p.id}/progress`}>
                  <Button variant="outline">View progress</Button>
                </Link>
              </div>
              {p.description && <CardDescription>{p.description}</CardDescription>}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>
                  <div className="text-xs">Project ID</div>
                  <div className="font-medium">{p.id}</div>
                </div>
                <div>
                  <div className="text-xs">Status</div>
                  <div className="font-medium capitalize">{p.status}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
