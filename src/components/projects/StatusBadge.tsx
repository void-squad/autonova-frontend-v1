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
  requested: {
    label: "Requested",
    variant: "secondary",
  },
  quoted: {
    label: "Quoted",
    variant: "default",
  },
  approved: {
    label: "Approved",
    variant: "default",
    className: "bg-emerald-600 text-white hover:bg-emerald-600/90",
  },
  rejected: {
    label: "Rejected",
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
