import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, X, Calendar } from "lucide-react";
import { Project, FilterOptions } from "@/types/timeLogging";

interface TimeLogFiltersProps {
  projects: Project[];
  onFilterChange: (filters: FilterOptions) => void;
}

export const TimeLogFilters = ({
  projects,
  onFilterChange,
}: TimeLogFiltersProps) => {
  const [filters, setFilters] = useState<FilterOptions>({
    startDate: "",
    endDate: "",
    projectId: "all",
    taskId: "all",
  });

  const [appliedFilters, setAppliedFilters] = useState<FilterOptions>({
    startDate: "",
    endDate: "",
    projectId: "all",
    taskId: "all",
  });

  const hasPendingChanges =
    JSON.stringify(filters) !== JSON.stringify(appliedFilters);

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    setAppliedFilters({ ...filters });
    onFilterChange(filters);
  };

  const handleClearFilters = () => {
    const emptyFilters: FilterOptions = {
      startDate: "",
      endDate: "",
      projectId: "all",
      taskId: "all",
    };
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const handlePresetFilter = (preset: "today" | "week" | "month") => {
    const today = new Date();
    const startDate = new Date();

    switch (preset) {
      case "today":
        startDate.setHours(0, 0, 0, 0);
        break;
      case "week":
        startDate.setDate(today.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(today.getMonth() - 1);
        break;
    }

    const newFilters: FilterOptions = {
      ...filters,
      startDate: startDate.toISOString().split("T")[0],
      endDate: today.toISOString().split("T")[0],
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const selectedProject = projects.find((p) => p.id === filters.projectId);
  const appliedProject = projects.find(
    (p) => p.id === appliedFilters.projectId
  );

  return (
    <Card className="p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Advanced Filters
          </h3>
        </div>

        {/* Quick Preset Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePresetFilter("today")}
            className="text-xs"
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePresetFilter("week")}
            className="text-xs"
          >
            This Week
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePresetFilter("month")}
            className="text-xs"
          >
            This Month
          </Button>
        </div>
      </div>

      {/* Labels row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-center">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <Label htmlFor="startDate" className="m-0">
            Start Date
          </Label>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <Label htmlFor="endDate" className="m-0">
            End Date
          </Label>
        </div>
        <div className="flex items-center">
          <Label htmlFor="projectFilter" className="m-0">
            Project
          </Label>
        </div>
        <div className="flex items-center">
          <Label htmlFor="taskFilter" className="m-0">
            Task
          </Label>
        </div>

        {/* Inputs row */}
        <div>
          <Input
            id="startDate"
            type="date"
            value={filters.startDate}
            onChange={(e) => handleFilterChange("startDate", e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Input
            id="endDate"
            type="date"
            value={filters.endDate}
            onChange={(e) => handleFilterChange("endDate", e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Select
            value={filters.projectId}
            onValueChange={(value) => handleFilterChange("projectId", value)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="All projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Select
            value={filters.taskId}
            onValueChange={(value) => handleFilterChange("taskId", value)}
            disabled={!filters.projectId || filters.projectId === "all"}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="All tasks" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              {selectedProject?.tasks?.map((task) => (
                <SelectItem key={task.id} value={task.id}>
                  {task.taskName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Action Buttons */}
      {(hasPendingChanges ||
        appliedFilters.startDate ||
        appliedFilters.endDate ||
        (appliedFilters.projectId && appliedFilters.projectId !== "all") ||
        (appliedFilters.taskId && appliedFilters.taskId !== "all")) && (
        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            onClick={handleClearFilters}
            className="gap-2"
          >
            <X className="w-4 h-4" />
            Clear All
          </Button>
          {hasPendingChanges && (
            <Button onClick={handleApplyFilters} className="gap-2 bg-blue-600">
              <Filter className="w-4 h-4" />
              Apply Filters
            </Button>
          )}
        </div>
      )}

      {/* Active Filters Display */}
      {(appliedFilters.startDate ||
        appliedFilters.endDate ||
        (appliedFilters.projectId && appliedFilters.projectId !== "all") ||
        (appliedFilters.taskId && appliedFilters.taskId !== "all")) && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-gray-600 mb-2">Active Filters:</p>
          <div className="flex flex-wrap gap-2">
            {appliedFilters.startDate && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                From: {appliedFilters.startDate}
              </span>
            )}
            {appliedFilters.endDate && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                To: {appliedFilters.endDate}
              </span>
            )}
            {appliedFilters.projectId && appliedFilters.projectId !== "all" && (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                Project:{" "}
                {projects.find((p) => p.id === appliedFilters.projectId)?.title}
              </span>
            )}
            {appliedFilters.taskId && appliedFilters.taskId !== "all" && (
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                Task:{" "}
                {
                  appliedProject?.tasks?.find(
                    (t) => t.id === appliedFilters.taskId
                  )?.taskName
                }
              </span>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};
