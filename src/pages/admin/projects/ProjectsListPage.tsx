import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

import DashboardLayout from "@/components/layout/DashboardLayout";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable, type DataTableColumn } from "@/components/projects/DataTable";
import { FilterBar, type ProjectFilterValue } from "@/components/projects/FilterBar";
import { StatusBadge } from "@/components/projects/StatusBadge";
import { computeProjectList, useProjectsStore } from "@/contexts/ProjectsStore";
import type { Project } from "@/types/project";

const PAGE_SIZE = 10;

export default function ProjectsListPage() {
  const navigate = useNavigate();
  const { listProjects, projects: storeProjects } = useProjectsStore();

  const [filters, setFilters] = useState<ProjectFilterValue>({});
  const [page, setPage] = useState(1);
  const [projects, setProjects] = useState<Project[]>(() =>
    computeProjectList(storeProjects, { page: 1, pageSize: PAGE_SIZE }).data,
  );
  const [total, setTotal] = useState(() => computeProjectList(storeProjects, { page: 1, pageSize: PAGE_SIZE }).total);
  const [loading, setLoading] = useState(() => storeProjects.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(() => storeProjects.length > 0);

  useEffect(() => {
    let active = true;
    const params = { ...filters, page, pageSize: PAGE_SIZE };

    const snapshot = computeProjectList(storeProjects, params);
    setProjects(snapshot.data);
    setTotal(snapshot.total);

    const fetchProjects = async () => {
      try {
        setError(null);
        if (!hasLoadedOnce) {
          setLoading(true);
        }

        const result = await listProjects(params);
        if (!active) return;
        setProjects(result.data);
        setTotal(result.total);
        setHasLoadedOnce(true);
      } catch (err: any) {
        if (!active) return;
        setError(err?.message ?? "Failed to load projects.");
      } finally {
        if (!active) return;
        setLoading(false);
      }
    };

    fetchProjects();

    return () => {
      active = false;
    };
  }, [filters, page, listProjects, storeProjects, hasLoadedOnce]);

  const columns = useMemo<DataTableColumn<Project>[]>(
    () => [
      {
        id: "code",
        header: "Code",
        cell: (project) => <span className="font-medium">{project.code}</span>,
      },
      {
        id: "title",
        header: "Title",
        cell: (project) => (
          <div className="space-y-1">
            <p className="font-medium">{project.title}</p>
            <p className="text-xs text-muted-foreground">{project.customerName}</p>
          </div>
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: (project) => <StatusBadge status={project.status} />,
      },
      {
        id: "createdAt",
        header: "Created",
        cell: (project) => format(new Date(project.createdAt), "PP"),
      },
      {
        id: "updatedAt",
        header: "Updated",
        cell: (project) => format(new Date(project.updatedAt), "PP"),
      },
      {
        id: "actions",
        header: "Actions",
        className: "text-right",
        headerClassName: "text-right",
        cell: (project) => (
          <Button size="sm" variant="outline" onClick={() => navigate(`/admin/projects/${project.id}`)}>
            View
          </Button>
        ),
      },
    ],
    [navigate],
  );

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold">Projects</h1>
            <p className="text-muted-foreground">Review incoming modification requests and manage approvals.</p>
          </div>
          <Button onClick={() => navigate("/admin/projects/new")}>New project</Button>
        </div>

        <FilterBar
          value={filters}
          onChange={(next) => {
            setFilters(next);
            setPage(1);
          }}
        />

        {error && !hasLoadedOnce ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-3 py-10 text-center">
              <p className="font-medium text-destructive">Something went wrong</p>
              <p className="max-w-md text-sm text-muted-foreground">{error}</p>
              <Button variant="outline" onClick={() => setFilters({ ...filters })}>
                Try again
              </Button>
            </CardContent>
          </Card>
        ) : !hasLoadedOnce && loading ? (
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={projects}
            loading={!hasLoadedOnce && loading}
            page={page}
            pageSize={PAGE_SIZE}
            total={total}
            onPageChange={setPage}
            emptyMessage="No projects match the current filters."
          />
        )}
      </div>
    </DashboardLayout>
  );
}
