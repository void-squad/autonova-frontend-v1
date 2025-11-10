import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Can } from "@/components/auth/Can";
import { useProjectsStore } from "@/contexts/ProjectsStore";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ScheduleCardProps {
  projectId: string;
  startDate?: string;
  endDate?: string;
  onScheduleChange?: (schedule: { startDate?: string; endDate?: string }) => void;
  className?: string;
}

export const ScheduleCard = ({ projectId, startDate, endDate, onScheduleChange, className }: ScheduleCardProps) => {
  const { setSchedule } = useProjectsStore();
  const { toast } = useToast();
  const [localStart, setLocalStart] = useState(startDate ?? "");
  const [localEnd, setLocalEnd] = useState(endDate ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLocalStart(startDate ?? "");
  }, [startDate]);

  useEffect(() => {
    setLocalEnd(endDate ?? "");
  }, [endDate]);

  const isDirty = useMemo(
    () => localStart !== (startDate ?? "") || localEnd !== (endDate ?? ""),
    [localEnd, localStart, endDate, startDate],
  );

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        startDate: localStart || undefined,
        endDate: localEnd || undefined,
      };
      const updated = await setSchedule(projectId, payload);
      onScheduleChange?.({ startDate: updated.startDate, endDate: updated.endDate });
      toast({
        title: "Schedule updated",
        description: "Project dates have been saved.",
      });
    } catch (error: any) {
      toast({
        title: "Unable to save schedule",
        description: error?.message ?? "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setLocalStart(startDate ?? "");
    setLocalEnd(endDate ?? "");
  };

  return (
    <Can roles={["Admin"]}>
      <Card className={cn(className)}>
        <CardHeader>
          <CardTitle>Schedule</CardTitle>
          <CardDescription>Provide tentative start and end dates so the team can plan capacity.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="schedule-start">Start date</Label>
            <Input
              id="schedule-start"
              type="date"
              value={localStart}
              onChange={(event) => setLocalStart(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="schedule-end">End date</Label>
            <Input id="schedule-end" type="date" value={localEnd} onChange={(event) => setLocalEnd(event.target.value)} />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <p className="text-sm text-muted-foreground">Leave blank if dates are still TBD.</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleReset} disabled={!isDirty || saving}>
              Reset
            </Button>
            <Button size="sm" onClick={handleSave} disabled={!isDirty || saving}>
              {saving ? "Saving..." : "Save dates"}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </Can>
  );
};
