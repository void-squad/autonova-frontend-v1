import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Play, Check, Car, Calendar } from "lucide-react";
import { Project, ProjectTask } from "@/types/timeLogging";

interface ProjectTaskListProps {
  projects: Project[];
  activeTimerTaskId?: string;
  onStartTimer: (projectId: string, taskId: string) => void;
}

export const ProjectTaskList = ({
  projects,
  activeTimerTaskId,
  onStartTimer,
}: ProjectTaskListProps) => {
  const getStatusColor = (status: string) => {
    const colors = {
      PENDING: "bg-yellow-100 text-yellow-800",
      IN_PROGRESS: "bg-blue-100 text-blue-800",
      COMPLETED: "bg-green-100 text-green-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      LOW: "bg-gray-100 text-gray-800",
      MEDIUM: "bg-orange-100 text-orange-800",
      HIGH: "bg-red-100 text-red-800",
    };
    return (
      colors[priority as keyof typeof colors] || "bg-gray-100 text-gray-800"
    );
  };

  const calculateProgress = (actual: number, estimated: number) => {
    if (!estimated) return 0;
    return Math.min((actual / estimated) * 100, 100);
  };

  if (projects.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-gray-500">No projects assigned yet</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">
        Assigned Projects & Tasks
      </h2>

      {projects.map((project) => (
        <Card
          key={project.id}
          className="p-6 hover:shadow-lg transition-shadow"
        >
          {/* Project Header */}
          <div className="mb-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {project.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {project.description}
                </p>
              </div>
              <div className="flex gap-2">
                <Badge className={getStatusColor(project.status)}>
                  {project.status.replace("_", " ")}
                </Badge>
                <Badge className={getPriorityColor(project.priority)}>
                  {project.priority}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600">
              {project.vehicle && (
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4" />
                  <span>
                    {project.vehicle.make} {project.vehicle.model} -{" "}
                    {project.vehicle.licensePlate}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(project.startDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Tasks List */}
          <div className="space-y-3 mt-4 border-t pt-4">
            {project.tasks?.map((task) => {
              const progress = calculateProgress(
                task.actualHours,
                task.estimatedHours || 0
              );
              const isActive = activeTimerTaskId === task.id;
              const isCompleted = task.status === "COMPLETED";

              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isActive
                      ? "bg-blue-50 border-blue-500"
                      : isCompleted
                      ? "bg-gray-50 border-gray-200"
                      : "bg-white border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3 flex-1">
                      {isCompleted ? (
                        <div className="bg-green-100 rounded-full p-1">
                          <Check className="w-4 h-4 text-green-600" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-gray-300" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-medium ${
                              isCompleted
                                ? "text-gray-500 line-through"
                                : "text-gray-900"
                            }`}
                          >
                            {task.taskName}
                          </span>
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                          {isActive && (
                            <Badge className="bg-blue-600 text-white animate-pulse">
                              Active
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {task.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {task.actualHours.toFixed(2)}h /{" "}
                          {task.estimatedHours?.toFixed(2) || "?"}h
                        </p>
                        <p className="text-xs text-gray-500">
                          {progress.toFixed(0)}% complete
                        </p>
                      </div>

                      <Button
                        onClick={() => onStartTimer(project.id, task.id)}
                        disabled={
                          isActive || isCompleted || !!activeTimerTaskId
                        }
                        variant={isActive ? "default" : "outline"}
                        className={isActive ? "bg-blue-600" : ""}
                      >
                        {isActive ? (
                          <>
                            <Play className="w-4 h-4 mr-2" fill="white" />
                            Active
                          </>
                        ) : isCompleted ? (
                          "Completed"
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Start
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {!isCompleted && (
                    <div className="mt-3">
                      <Progress value={progress} className="h-2" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      ))}
    </div>
  );
};
