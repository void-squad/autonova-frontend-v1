import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { Can } from "@/components/auth/Can";
import { useProjectsStore, useEmployees } from "@/contexts/ProjectsStore";
import type { Employee } from "@/contexts/ProjectsStore";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface AssigneesDialogProps {
  projectId: string;
  selectedIds: string[];
  onChange?: (ids: string[]) => void;
  className?: string;
}

export const AssigneesDialog = ({ projectId, selectedIds, onChange, className }: AssigneesDialogProps) => {
  const employees = useEmployees();
  const { setAssignees } = useProjectsStore();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [selection, setSelection] = useState<string[]>(selectedIds);
  const [saving, setSaving] = useState(false);

  const assignedEmployees = useMemo(
    () => employees.filter((employee) => selectedIds.includes(employee.id)),
    [employees, selectedIds],
  );

  useEffect(() => {
    if (open) {
      setSelection(selectedIds);
    }
  }, [open, selectedIds]);

  const toggleEmployee = (employee: Employee) => {
    setSelection((prev) =>
      prev.includes(employee.id) ? prev.filter((id) => id !== employee.id) : [...prev, employee.id],
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updated = await setAssignees(projectId, selection);
      onChange?.(updated.assigneeIds);
      toast({
        title: "Assignees updated",
        description: "Team members have been assigned to this project.",
      });
      setOpen(false);
    } catch (error: any) {
      toast({
        title: "Unable to save",
        description: error?.message ?? "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Can roles={["Admin"]}>
      <div className={cn("space-y-3 rounded-lg border bg-card p-4", className)}>
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold">Assignees</p>
            <p className="text-sm text-muted-foreground">Select the employees responsible for executing this work.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                Assign Employees
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Assign team members</DialogTitle>
                <DialogDescription>Choose one or more employees for this project.</DialogDescription>
              </DialogHeader>
              <Command className="rounded-lg border">
                <CommandInput placeholder="Search employees" />
                <CommandList className="max-h-64">
                  <CommandEmpty>No employees found.</CommandEmpty>
                  <CommandGroup>
                    {employees.map((employee) => {
                      const checked = selection.includes(employee.id);
                      return (
                        <CommandItem
                          key={employee.id}
                          onSelect={() => toggleEmployee(employee)}
                          value={`${employee.name} ${employee.email}`}
                          className="flex items-center justify-between gap-3"
                        >
                          <div className="flex flex-col text-left">
                            <span className="text-sm font-medium">{employee.name}</span>
                            <span className="text-xs text-muted-foreground">{employee.email}</span>
                          </div>
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => toggleEmployee(employee)}
                            aria-label={checked ? "Remove" : "Assign"}
                          />
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        {assignedEmployees.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {assignedEmployees.map((employee) => (
              <Badge key={employee.id} variant="secondary" className="text-xs">
                {employee.name}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No employees assigned yet.</p>
        )}
      </div>
    </Can>
  );
};
