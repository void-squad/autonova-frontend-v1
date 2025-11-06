import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Project, ProjectTask, TimeLogFormData } from "@/types/timeLogging";
import { Clock } from "lucide-react";

interface ManualTimeLogModalProps {
  projects: Project[];
  tasks: ProjectTask[];
  selectedProjectId?: string;
  onProjectChange: (projectId: string) => void;
  onSubmit: (data: TimeLogFormData) => void;
  isLoading?: boolean;
}

export const ManualTimeLogModal = ({
  projects,
  tasks,
  selectedProjectId,
  onProjectChange,
  onSubmit,
  isLoading = false,
}: ManualTimeLogModalProps) => {
  const [formData, setFormData] = useState<TimeLogFormData>({
    projectId: selectedProjectId || "",
    taskId: "",
    hours: 0,
    note: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.projectId) newErrors.projectId = "Please select a project";
    if (!formData.taskId) newErrors.taskId = "Please select a task";
    if (formData.hours <= 0) newErrors.hours = "Hours must be greater than 0";
    if (formData.hours > 24) newErrors.hours = "Hours cannot exceed 24";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
      // Reset form
      setFormData({
        projectId: selectedProjectId || "",
        taskId: "",
        hours: 0,
        note: "",
      });
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-5 h-5 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">Log Time</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Project Select */}
        <div>
          <Label htmlFor="project">Project *</Label>
          <Select
            value={formData.projectId}
            onValueChange={(value) => {
              setFormData({ ...formData, projectId: value, taskId: "" });
              onProjectChange(value);
              setErrors({ ...errors, projectId: "" });
            }}
          >
            <SelectTrigger className={errors.projectId ? "border-red-500" : ""}>
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.projectId && (
            <p className="text-sm text-red-500 mt-1">{errors.projectId}</p>
          )}
        </div>

        {/* Task Select */}
        <div>
          <Label htmlFor="task">Task *</Label>
          <Select
            value={formData.taskId}
            onValueChange={(value) => {
              setFormData({ ...formData, taskId: value });
              setErrors({ ...errors, taskId: "" });
            }}
            disabled={!formData.projectId || tasks.length === 0}
          >
            <SelectTrigger className={errors.taskId ? "border-red-500" : ""}>
              <SelectValue placeholder="Select a task" />
            </SelectTrigger>
            <SelectContent>
              {tasks.map((task) => (
                <SelectItem key={task.id} value={task.id}>
                  {task.taskName} - {task.status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.taskId && (
            <p className="text-sm text-red-500 mt-1">{errors.taskId}</p>
          )}
        </div>

        {/* Hours Input */}
        <div>
          <Label htmlFor="hours">Hours Worked *</Label>
          <Input
            id="hours"
            type="number"
            step="0.5"
            min="0"
            max="24"
            value={formData.hours || ""}
            onChange={(e) => {
              setFormData({
                ...formData,
                hours: parseFloat(e.target.value) || 0,
              });
              setErrors({ ...errors, hours: "" });
            }}
            className={errors.hours ? "border-red-500" : ""}
            placeholder="e.g., 2.5"
          />
          {errors.hours && (
            <p className="text-sm text-red-500 mt-1">{errors.hours}</p>
          )}
        </div>

        {/* Notes Textarea */}
        <div>
          <Label htmlFor="note">Notes (Optional)</Label>
          <Textarea
            id="note"
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            placeholder="Add any notes about the work done..."
            rows={3}
          />
        </div>

        {/* Submit Button */}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Logging Time..." : "Log Time"}
        </Button>
      </form>
    </Card>
  );
};
