import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Lightbulb,
  Play,
  Clock,
  AlertCircle,
  TrendingUp,
  Flame,
  Zap,
  Star,
  Calendar,
} from "lucide-react";
import { ProjectTask } from "@/types/timeLogging";

interface SmartSuggestion {
  task: ProjectTask;
  projectTitle: string;
  reason: string;
  urgency: "high" | "medium" | "low";
  icon: "deadline" | "progress" | "efficiency" | "priority";
}

interface SmartSuggestionsProps {
  suggestions: SmartSuggestion[];
  onStartTask: (projectId: string, taskId: string) => void;
  activeTaskId?: string | null;
}

export const SmartSuggestions = ({
  suggestions,
  onStartTask,
  activeTaskId,
}: SmartSuggestionsProps) => {
  if (suggestions.length === 0) {
    return null;
  }

  const getUrgencyColor = (urgency: string) => {
    const colors = {
      high: "bg-red-100 text-red-800 border-red-200",
      medium: "bg-orange-100 text-orange-800 border-orange-200",
      low: "bg-blue-100 text-blue-800 border-blue-200",
    };
    return colors[urgency as keyof typeof colors] || colors.low;
  };

  const getUrgencyLabel = (urgency: string) => {
    const labels = {
      high: (
        <span className="flex items-center gap-1">
          <Flame className="w-3 h-3" />
          Urgent
        </span>
      ),
      medium: (
        <span className="flex items-center gap-1">
          <Zap className="w-3 h-3" />
          Important
        </span>
      ),
      low: (
        <span className="flex items-center gap-1">
          <Lightbulb className="w-3 h-3" />
          Recommended
        </span>
      ),
    };
    return labels[urgency as keyof typeof labels] || labels.low;
  };

  const getReasonIcon = (icon: string) => {
    const icons = {
      deadline: <Clock className="w-4 h-4" />,
      progress: <TrendingUp className="w-4 h-4" />,
      efficiency: <Lightbulb className="w-4 h-4" />,
      priority: <AlertCircle className="w-4 h-4" />,
    };
    return icons[icon as keyof typeof icons] || icons.efficiency;
  };

  return (
    <Card className="p-6 mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-indigo-600 rounded-full p-2">
          <Lightbulb className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Smart Suggestions
          </h3>
          <p className="text-sm text-gray-600">
            AI-powered recommendations for your next task
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {suggestions.slice(0, 3).map((suggestion, index) => (
          <div
            key={suggestion.task.id}
            className={`p-4 bg-white rounded-lg border-2 transition-all hover:shadow-md ${
              index === 0 ? "border-indigo-300" : "border-gray-200"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                {/* Priority Badge */}
                <div className="flex items-center gap-2 mb-2">
                  {index === 0 && (
                    <Badge className="bg-indigo-600 text-white">
                      <Star className="w-3 h-3 mr-1" />
                      Top Pick
                    </Badge>
                  )}
                  <Badge className={getUrgencyColor(suggestion.urgency)}>
                    {getUrgencyLabel(suggestion.urgency)}
                  </Badge>
                </div>

                {/* Task Info */}
                <div className="mb-2">
                  <h4 className="font-semibold text-gray-900 text-base">
                    {suggestion.task.taskName}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {suggestion.projectTitle}
                  </p>
                </div>

                {/* Reason */}
                <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 p-2 rounded">
                  {getReasonIcon(suggestion.icon)}
                  <span>{suggestion.reason}</span>
                </div>

                {/* Task Details */}
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {suggestion.task.estimatedHours?.toFixed(2) || "?"}h
                    estimated
                  </span>
                  {suggestion.task.dueDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Due:{" "}
                      {new Date(suggestion.task.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Button */}
              {activeTaskId === suggestion.task.id ? (
                <Button disabled className="gap-2 shrink-0" size="sm">
                  <Clock className="w-4 h-4" />
                  Running
                </Button>
              ) : (
                <Button
                  onClick={() =>
                    onStartTask(suggestion.task.projectId, suggestion.task.id)
                  }
                  className="bg-indigo-600 hover:bg-indigo-700 gap-2 shrink-0"
                  size="sm"
                >
                  <Play className="w-4 h-4" />
                  Start Now
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Tip */}
      <div className="mt-4 pt-4 border-t border-indigo-200">
        <p className="text-xs text-gray-600 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-indigo-600" />
          <span>
            Suggestions are based on deadlines, priority, progress, and your
            work patterns
          </span>
        </p>
      </div>
    </Card>
  );
};
