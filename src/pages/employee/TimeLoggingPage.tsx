import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

// Components
import { TimeLogStats } from "@/components/timelogging/TimeLogStats";
import { ActiveTimer } from "@/components/timelogging/ActiveTimer";
import { SmartSuggestions } from "@/components/timelogging/SmartSuggestions";
import { ProjectTaskList } from "@/components/timelogging/ProjectTaskList";
import { TimerStopModal } from "@/components/timelogging/TimerStopModal";
import { ManualTimeLogModal } from "@/components/timelogging/ManualTimeLogModal";
import { TimeLogHistory } from "@/components/timelogging/TimeLogHistory";
import { TimeLogFilters } from "@/components/timelogging/TimeLogFilters";
import { WeeklySummary } from "@/components/timelogging/WeeklySummary";
import { TimeLoggingTabs } from "@/components/timelogging/TimeLoggingTabs";
import { EfficiencyMeter } from "@/components/timelogging/EfficiencyMeter";

// API & Types
import { timeLoggingApi } from "@/Api/timeLoggingApi";
import {
  Project,
  ProjectTask,
  TimeLog,
  TimeLogFormData,
  TimeLogStats as StatsType,
  ActiveTimerData,
  WeeklySummaryData,
  SmartSuggestion,
  EfficiencyData,
  FilterOptions,
} from "@/types/timeLogging";

export const TimeLoggingPage = () => {
  // State Management

  // Data States
  const [projects, setProjects] = useState<Project[]>([]);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [filteredTimeLogs, setFilteredTimeLogs] = useState<TimeLog[]>([]);
  const [stats, setStats] = useState<StatsType>({
    todayHours: 0,
    weekHours: 0,
    monthHours: 0,
    totalEarnings: 0,
    activeProjects: 0,
    pendingTasks: 0,
  });
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummaryData>({
    dailyHours: [],
    projectBreakdown: [],
  });
  const [smartSuggestions, setSmartSuggestions] = useState<SmartSuggestion[]>(
    []
  );
  const [efficiencyData, setEfficiencyData] = useState<EfficiencyData>({
    efficiency: 0,
    weeklyTrend: 0,
    breakdown: {
      onTime: 0,
      overEstimate: 0,
      avgTaskTime: 0,
    },
  });

  // Timer States
  const [activeTimer, setActiveTimer] = useState<ActiveTimerData | null>(null);
  const [timerStartTime, setTimerStartTime] = useState<Date | null>(null);

  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [showStopModal, setShowStopModal] = useState(false);
  const [showManualLogModal, setShowManualLogModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingLog, setEditingLog] = useState<TimeLog | null>(null);
  const [selectedProjectForManualLog, setSelectedProjectForManualLog] =
    useState<string>("");
  const [tasksForManualLog, setTasksForManualLog] = useState<ProjectTask[]>([]);
  const [editSelectedProjectForManualLog, setEditSelectedProjectForManualLog] =
    useState<string>("");
  const [editTasksForManualLog, setEditTasksForManualLog] = useState<
    ProjectTask[]
  >([]);

  // Filter States
  const [appliedFilters, setAppliedFilters] = useState<FilterOptions>({
    startDate: "",
    endDate: "",
    projectId: "all",
    taskId: "all",
  });

  useEffect(() => {
    initializePage();
    restoreTimerFromStorage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    applyFiltersToTimeLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLogs, appliedFilters]);

  const initializePage = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchProjects(),
        fetchTimeLogs(),
        fetchStats(),
        fetchWeeklySummary(),
        fetchSmartSuggestions(),
        fetchEfficiency(),
      ]);
    } catch (error) {
      console.error("Error initializing page:", error);
      toast.error("Failed to load data. Please refresh the page.");
    } finally {
      setIsLoading(false);
    }
  };

  const restoreTimerFromStorage = () => {
    try {
      const savedTimer = localStorage.getItem("activeTimer");
      if (savedTimer) {
        const timer: ActiveTimerData = JSON.parse(savedTimer);
        setActiveTimer(timer);
        setTimerStartTime(new Date(timer.startedAt));
        toast.info("Restored active timer from previous session");
      }
    } catch (error) {
      console.error("Error restoring timer:", error);
      localStorage.removeItem("activeTimer");
    }
  };

  // Data fetching functions

  const fetchProjects = async () => {
    try {
      const data = await timeLoggingApi.getAssignedProjects();
      setProjects(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to load projects");
    }
  };

  const fetchTimeLogs = async () => {
    try {
      const data = await timeLoggingApi.getMyTimeLogs();
      setTimeLogs(data);
    } catch (error) {
      console.error("Error fetching time logs:", error);
      toast.error("Failed to load time logs");
    }
  };

  const fetchStats = async () => {
    try {
      const logs = await timeLoggingApi.getMyTimeLogs();
      const projects = await timeLoggingApi.getAssignedProjects();

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);

      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);

      const todayHours = logs
        .filter((log) => new Date(log.loggedAt) >= today)
        .reduce((sum, log) => sum + log.hours, 0);

      const weekHours = logs
        .filter((log) => new Date(log.loggedAt) >= weekAgo)
        .reduce((sum, log) => sum + log.hours, 0);

      const monthHours = logs
        .filter((log) => new Date(log.loggedAt) >= monthAgo)
        .reduce((sum, log) => sum + log.hours, 0);

      const activeProjects = projects.filter(
        (p) => p.status === "IN_PROGRESS"
      ).length;

      const pendingTasks = projects
        .flatMap((p) => p.tasks || [])
        .filter((t) => t.status !== "COMPLETED").length;

      setStats({
        todayHours,
        weekHours,
        monthHours,
        totalEarnings: monthHours * 25, // Mock hourly rate
        activeProjects,
        pendingTasks,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchWeeklySummary = async () => {
    try {
      const data = await timeLoggingApi.getWeeklySummary();
      setWeeklySummary(data);
    } catch (error) {
      console.error("Error fetching weekly summary:", error);
    }
  };

  const fetchSmartSuggestions = async () => {
    try {
      const data = await timeLoggingApi.getSmartSuggestions();
      setSmartSuggestions(data);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      // Generate suggestions from current projects as fallback
      generateSuggestionsFromProjects();
    }
  };

  const generateSuggestionsFromProjects = () => {
    const todoTasks: SmartSuggestion[] = [];

    projects.forEach((project) => {
      project.tasks
        ?.filter(
          (task) => task.status === "TODO" || task.status === "IN_PROGRESS"
        )
        .forEach((task) => {
          let urgency: "high" | "medium" | "low" = "low";
          let reason = "Recommended based on your schedule";
          let icon: "deadline" | "progress" | "efficiency" | "priority" =
            "efficiency";

          // Determine urgency based on due date
          if (task.dueDate) {
            const daysUntilDue = Math.floor(
              (new Date(task.dueDate).getTime() - Date.now()) /
                (1000 * 60 * 60 * 24)
            );
            if (daysUntilDue <= 1) {
              urgency = "high";
              reason = `Due ${daysUntilDue === 0 ? "today" : "tomorrow"}`;
              icon = "deadline";
            } else if (daysUntilDue <= 3) {
              urgency = "medium";
              reason = `Due in ${daysUntilDue} days`;
              icon = "deadline";
            }
          }

          if (task.priority === "HIGH") {
            urgency = urgency === "high" ? "high" : "medium";
            icon = "priority";
            reason = "High priority task";
          }

          if (task.status === "IN_PROGRESS" && task.actualHours > 0) {
            const progress = task.estimatedHours
              ? (task.actualHours / (task.estimatedHours || 1)) * 100
              : 0;
            reason = `Already started - ${progress.toFixed(0)}% complete`;
            icon = "progress";
          }

          todoTasks.push({
            task,
            projectTitle: project.title,
            reason,
            urgency,
            icon,
          });
        });
    });

    // Sort by urgency (high > medium > low) and take top 3
    const sorted = todoTasks.sort((a, b) => {
      const urgencyOrder = { high: 3, medium: 2, low: 1 };
      return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
    });

    setSmartSuggestions(sorted.slice(0, 3));
  };

  const fetchEfficiency = async () => {
    try {
      const data = await timeLoggingApi.getEfficiencyMetrics();
      setEfficiencyData(data);
    } catch (error) {
      console.error("Error fetching efficiency:", error);
      // Use mock data as fallback
      setEfficiencyData({
        efficiency: 72,
        weeklyTrend: 8.5,
        breakdown: {
          onTime: 85,
          overEstimate: 23,
          avgTaskTime: 2.3,
        },
      });
    }
  };

  const refreshAllData = async () => {
    await Promise.all([
      fetchProjects(),
      fetchTimeLogs(),
      fetchStats(),
      fetchWeeklySummary(),
      fetchSmartSuggestions(),
      fetchEfficiency(),
    ]);
  };

  // Timer handlers

  const handleStartTimer = async (projectId: string, taskId: string) => {
    // Prevent starting if timer already active
    if (activeTimer) {
      toast.error("Please stop the current timer before starting a new one");
      return;
    }

    try {
      const project = projects.find((p) => p.id === projectId);
      const task = project?.tasks?.find((t) => t.id === taskId);

      if (!project || !task) {
        toast.error("Project or task not found");
        return;
      }

      const timerData: ActiveTimerData = {
        projectId,
        taskId,
        projectTitle: project.title,
        taskName: task.taskName,
        startedAt: new Date().toISOString(),
      };

      setActiveTimer(timerData);
      setTimerStartTime(new Date());

      // Save to localStorage as backup
      localStorage.setItem("activeTimer", JSON.stringify(timerData));

      toast.success(`Timer started for: ${task.taskName}`);
    } catch (error) {
      console.error("Error starting timer:", error);
      toast.error("Failed to start timer");
    }
  };

  const handleStopTimer = () => {
    if (!activeTimer) return;
    setShowStopModal(true);
  };

  const handleConfirmStopTimer = async (note?: string) => {
    if (!activeTimer || !timerStartTime) return;

    setIsLoading(true);
    try {
      const endTime = new Date();
      const elapsedMs = endTime.getTime() - timerStartTime.getTime();
      const hours = elapsedMs / (1000 * 60 * 60);

      // Submit time log to backend
      await timeLoggingApi.createTimeLog({
        projectId: activeTimer.projectId,
        taskId: activeTimer.taskId,
        hours: parseFloat(hours.toFixed(2)),
        note: note || undefined,
      });

      // Clear timer state
      setActiveTimer(null);
      setTimerStartTime(null);
      setShowStopModal(false);
      localStorage.removeItem("activeTimer");

      // Refresh data
      await refreshAllData();

      toast.success(`Successfully logged ${hours.toFixed(2)} hours!`);
    } catch (error) {
      console.error("Error stopping timer:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to log time");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelStopTimer = () => {
    setShowStopModal(false);
  };

  // Manual log handlers

  const handleOpenManualLog = () => {
    setShowManualLogModal(true);
    if (projects.length > 0) {
      setSelectedProjectForManualLog(projects[0].id);
      handleManualLogProjectChange(projects[0].id);
    }
  };

  const handleCloseManualLog = () => {
    setShowManualLogModal(false);
    setSelectedProjectForManualLog("");
    setTasksForManualLog([]);
  };

  const handleManualLogProjectChange = async (projectId: string) => {
    setSelectedProjectForManualLog(projectId);
    try {
      const tasks = await timeLoggingApi.getProjectTasks(projectId);
      setTasksForManualLog(
        tasks.map((t) => ({
          id: t.id,
          projectId: t.projectId,
          taskName: t.taskName,
          description: t.description,
          status: t.status,
          priority: t.priority,
          estimatedHours: t.estimatedHours,
          actualHours: t.actualHours,
          dueDate: t.dueDate,
        }))
      );
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setTasksForManualLog([]);
    }
  };

  const handleSubmitManualLog = async (data: TimeLogFormData) => {
    setIsLoading(true);
    try {
      await timeLoggingApi.createTimeLog(data);
      setShowManualLogModal(false);
      await refreshAllData();
      toast.success("Time log created successfully!");
    } catch (error) {
      console.error("Error creating manual log:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to create time log");
    } finally {
      setIsLoading(false);
    }
  };

  // Time log history handlers

  const handleDeleteTimeLog = async (id: string) => {
    if (!confirm("Are you sure you want to delete this time log?")) return;

    try {
      await timeLoggingApi.deleteTimeLog(id);
      await refreshAllData();
      toast.success("Time log deleted successfully");
    } catch (error) {
      console.error("Error deleting time log:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to delete time log");
    }
  };

  const handleEditTimeLog = async (log: TimeLog) => {
    try {
      setEditingLog(log);
      setEditSelectedProjectForManualLog(log.projectId);
      // fetch tasks for that project
      const tasks = await timeLoggingApi.getProjectTasks(log.projectId);
      setEditTasksForManualLog(
        tasks.map((t) => ({
          id: t.id,
          projectId: t.projectId,
          taskName: t.taskName,
          description: t.description,
          status: t.status,
          priority: t.priority,
          estimatedHours: t.estimatedHours,
          actualHours: t.actualHours,
          dueDate: t.dueDate,
        }))
      );
      setShowEditModal(true);
    } catch (error) {
      console.error("Error preparing edit modal:", error);
      toast.error("Failed to open edit form");
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingLog(null);
    setEditSelectedProjectForManualLog("");
    setEditTasksForManualLog([]);
  };

  const handleSubmitEdit = async (data: TimeLogFormData) => {
    if (!editingLog) return;
    setIsLoading(true);
    try {
      await timeLoggingApi.updateTimeLog(editingLog.id, data);
      handleCloseEditModal();
      await refreshAllData();
      toast.success("Time log updated successfully!");
    } catch (error) {
      console.error("Error updating time log:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to update time log");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter handlers

  const handleFilterChange = (filters: FilterOptions) => {
    setAppliedFilters(filters);
  };

  const applyFiltersToTimeLogs = () => {
    let filtered = [...timeLogs];

    if (appliedFilters.startDate) {
      const start = new Date(appliedFilters.startDate!);
      start.setHours(0, 0, 0, 0);
      filtered = filtered.filter((log) => new Date(log.loggedAt) >= start);
    }

    if (appliedFilters.endDate) {
      const end = new Date(appliedFilters.endDate!);
      // Include the entire selected day by setting time to end of day
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter((log) => new Date(log.loggedAt) <= end);
    }

    if (appliedFilters.projectId && appliedFilters.projectId !== "all") {
      filtered = filtered.filter(
        (log) => log.projectId === appliedFilters.projectId
      );
    }

    if (appliedFilters.taskId && appliedFilters.taskId !== "all") {
      filtered = filtered.filter((log) => log.taskId === appliedFilters.taskId);
    }

    setFilteredTimeLogs(filtered);
  };

  // Rendering

  if (isLoading && projects.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading time logging data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Time Logs</h1>
            <p className="text-gray-600 mt-2">
              Track and manage your work hours across projects
            </p>
          </div>
          <Button
            onClick={handleOpenManualLog}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Manual Log
          </Button>
        </div>

        {/* Stats cards */}
        <TimeLogStats stats={stats} />

        {/* Active timer banner */}
        <ActiveTimer timer={activeTimer} onStop={handleStopTimer} />

        {/* Smart suggestions */}
        {smartSuggestions.length > 0 && (
          <SmartSuggestions
            suggestions={smartSuggestions}
            onStartTask={handleStartTimer}
            activeTaskId={activeTimer?.taskId}
          />
        )}

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Left Column: (Project List, Time Logs, Weekly Summary) */}
          <div className="lg:col-span-2">
            <TimeLoggingTabs
              activeTimerContent={
                <ProjectTaskList
                  projects={projects}
                  activeTimerTaskId={activeTimer?.taskId}
                  onStartTimer={handleStartTimer}
                />
              }
              timeLogsContent={
                <div className="space-y-4">
                  <TimeLogFilters
                    projects={projects || []}
                    onFilterChange={handleFilterChange}
                  />
                  <TimeLogHistory
                    timeLogs={filteredTimeLogs || []}
                    onEdit={handleEditTimeLog}
                    onDelete={handleDeleteTimeLog}
                  />
                </div>
              }
              weeklySummaryContent={<WeeklySummary data={weeklySummary} />}
            />
          </div>

          {/* Right Column: Efficiency Meter */}
          <div>
            <EfficiencyMeter {...efficiencyData} />
          </div>
        </div>

        {/* Modals */}

        {/* Stop Timer Modal */}
        <TimerStopModal
          isOpen={showStopModal}
          taskName={activeTimer?.taskName || ""}
          elapsedHours={
            timerStartTime
              ? (Date.now() - timerStartTime.getTime()) / (1000 * 60 * 60)
              : 0
          }
          onConfirm={handleConfirmStopTimer}
          onCancel={handleCancelStopTimer}
        />

        {/* Manual Time Log Modal */}
        <Dialog open={showManualLogModal} onOpenChange={setShowManualLogModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Manual Time Log</DialogTitle>
            </DialogHeader>
            <ManualTimeLogModal
              projects={projects}
              tasks={tasksForManualLog}
              selectedProjectId={selectedProjectForManualLog}
              onProjectChange={handleManualLogProjectChange}
              onSubmit={handleSubmitManualLog}
              isLoading={isLoading}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Time Log Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Time Log</DialogTitle>
            </DialogHeader>
            <ManualTimeLogModal
              projects={projects}
              tasks={editTasksForManualLog}
              selectedProjectId={editSelectedProjectForManualLog}
              onProjectChange={async (projectId: string) => {
                setEditSelectedProjectForManualLog(projectId);
                try {
                  const tasks = await timeLoggingApi.getProjectTasks(projectId);
                  setEditTasksForManualLog(
                    tasks.map((t) => ({
                      id: t.id,
                      projectId: t.projectId,
                      taskName: t.taskName,
                      description: t.description,
                      status: t.status,
                      priority: t.priority,
                      estimatedHours: t.estimatedHours,
                      actualHours: t.actualHours,
                      dueDate: t.dueDate,
                    }))
                  );
                } catch (error) {
                  console.error("Error fetching tasks for edit:", error);
                }
              }}
              onSubmit={handleSubmitEdit}
              isLoading={isLoading}
              initialData={
                editingLog
                  ? {
                      projectId: editingLog.projectId,
                      taskId: editingLog.taskId,
                      hours: editingLog.hours,
                      note: editingLog.note,
                    }
                  : undefined
              }
              submitLabel="Update Time"
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default TimeLoggingPage;
