import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ProjectStatus } from "@/types/project";

const STATUS_META: Record<
  ProjectStatus,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    className?: string;
  }
> = {
  pending: {
    label: "Pending review",
    variant: "secondary",
  },
  approved: {
    label: "Approved",
    variant: "default",
  },
  in_progress: {
    label: "In progress",
    variant: "default",
  },
  completed: {
    label: "Completed",
    variant: "outline",
    className:
      "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:border-emerald-400 dark:bg-emerald-400/20 dark:text-emerald-100",
  },
  cancelled: {
    label: "Cancelled",
    variant: "destructive",
  },
};

interface StatusBadgeProps {
  status: ProjectStatus;
  className?: string;
}

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const config = STATUS_META[status];

  return (
    <Badge variant={config.variant} className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
};
