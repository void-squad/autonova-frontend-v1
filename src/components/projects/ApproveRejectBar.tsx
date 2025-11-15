import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Can } from "@/components/auth/Can";
import { useProjectsStore } from "@/contexts/ProjectsStore";
import type { Project, ProjectStatus } from "@/types/project";
import { useToast } from "@/hooks/use-toast";

interface ApproveRejectBarProps {
  projectId: string;
  status: ProjectStatus;
  onStatusChange?: (project: Project) => void;
}

export const ApproveRejectBar = ({ projectId, status, onStatusChange }: ApproveRejectBarProps) => {
  const { approveProject, rejectProject } = useProjectsStore();
  const { toast } = useToast();
  const [pendingAction, setPendingAction] = useState<"approve" | "reject" | null>(null);

  if (status !== "pending") {
    return null;
  }

  const handleAction = async (action: "approve" | "reject") => {
    try {
      setPendingAction(action);
      const next =
        action === "approve" ? await approveProject(projectId) : await rejectProject(projectId);
      onStatusChange?.(next);
      toast({
        title: action === "approve" ? "Project approved" : "Project rejected",
        description:
          action === "approve"
            ? "The request is now ready to be scheduled."
            : "The request has been marked as cancelled.",
      });
    } catch (error: any) {
      toast({
        title: "Action failed",
        description: error?.message ?? "Please try again.",
        variant: "destructive",
      });
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <Can roles={["Admin"]}>
      <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-semibold">Awaiting approval</p>
          <p className="text-sm text-muted-foreground">
            Approve this request to unlock scheduling and assignment, or reject it to close the request.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleAction("reject")}
            disabled={pendingAction !== null}
          >
            {pendingAction === "reject" ? "Rejecting..." : "Reject"}
          </Button>
          <Button onClick={() => handleAction("approve")} disabled={pendingAction !== null}>
            {pendingAction === "approve" ? "Approving..." : "Approve"}
          </Button>
        </div>
      </div>
    </Can>
  );
};
