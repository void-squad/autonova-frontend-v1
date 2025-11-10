import { useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "@/components/layout/DashboardLayout";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectForm, type ProjectFormValues } from "@/components/projects/ProjectForm";
import { useProjectsStore } from "@/contexts/ProjectsStore";
import { useToast } from "@/hooks/use-toast";

export default function ProjectCreatePage() {
  const navigate = useNavigate();
  const { createProject } = useProjectsStore();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values: ProjectFormValues) => {
    try {
      setSubmitting(true);
      const project = await createProject(values);
      toast({
        title: "Project created",
        description: "The request has been added to the pipeline.",
      });
      navigate(`/admin/projects/${project.id}`);
    } catch (error: any) {
      toast({
        title: "Unable to create project",
        description: error?.message ?? "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">New project</h1>
            <p className="text-muted-foreground">Capture the details needed to review the modification request.</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/admin/projects")}>
            Cancel
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Project information</CardTitle>
            <CardDescription>Only the project title and customer name are required.</CardDescription>
          </CardHeader>
          <CardContent>
            <ProjectForm onSubmit={handleSubmit} submitLabel="Create project" loading={submitting} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
