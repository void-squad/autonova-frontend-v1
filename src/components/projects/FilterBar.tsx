import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ProjectStatus } from "@/types/project";
import { cn } from "@/lib/utils";

export interface ProjectFilterValue {
  q?: string;
  status?: ProjectStatus;
  from?: string;
  to?: string;
}

interface FilterBarProps {
  value: ProjectFilterValue;
  onChange: (value: ProjectFilterValue) => void;
  className?: string;
}

const statusOptions: { label: string; value: ProjectStatus }[] = [
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "In progress", value: "in_progress" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

export const FilterBar = ({ value, onChange, className }: FilterBarProps) => {
  const [search, setSearch] = useState(value.q ?? "");

  useEffect(() => {
    setSearch(value.q ?? "");
  }, [value.q]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (search !== value.q) {
        onChange({ ...value, q: search.trim() || undefined });
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [onChange, search, value]);

  return (
    <Card className={cn("border-none bg-muted/50", className)}>
      <CardContent className="flex flex-col gap-4 py-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="project-search">Search</Label>
          <Input
            id="project-search"
            placeholder="Search by project title or customer"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="grid flex-1 gap-2 lg:max-w-md lg:grid-cols-3">
          <div className="flex flex-col space-y-2">
            <Label>Status</Label>
            <Select
              value={(value.status ?? "all") as string}
              onValueChange={(next) =>
                onChange({
                  ...value,
                  status: next === "all" ? undefined : (next as ProjectStatus),
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col space-y-2">
            <Label htmlFor="project-from">From</Label>
            <Input
              id="project-from"
              type="date"
              value={value.from ?? ""}
              onChange={(event) => onChange({ ...value, from: event.target.value || undefined })}
            />
          </div>

          <div className="flex flex-col space-y-2">
            <Label htmlFor="project-to">To</Label>
            <Input
              id="project-to"
              type="date"
              value={value.to ?? ""}
              onChange={(event) => onChange({ ...value, to: event.target.value || undefined })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
