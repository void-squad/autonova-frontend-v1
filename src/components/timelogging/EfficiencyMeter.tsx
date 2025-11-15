import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  Target,
  Clock,
  Coffee,
  Focus,
  Trophy,
  Dumbbell,
  BarChart3,
  Target as TargetIcon,
} from "lucide-react";

interface EfficiencyMeterProps {
  efficiency: number; // 0-100
  weeklyTrend?: number; // -100 to +100 (percentage change from last week)
  tips?: React.ReactNode[];
  breakdown?: {
    onTime: number; // percentage of tasks completed on time
    overEstimate: number; // percentage of tasks where actual > estimated
    avgTaskTime: number; // average hours per task
  };
}

export const EfficiencyMeter = ({
  efficiency,
  weeklyTrend,
  tips,
  breakdown,
}: EfficiencyMeterProps) => {
  // Determine efficiency level and color
  const getEfficiencyLevel = (eff: number) => {
    if (eff >= 80)
      return {
        label: "Excellent",
        color: "text-green-600",
        bgColor: "bg-green-50",
        icon: Zap,
      };
    if (eff >= 60)
      return {
        label: "Good",
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        icon: Target,
      };
    if (eff >= 40)
      return {
        label: "Fair",
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        icon: Clock,
      };
    return {
      label: "Needs Improvement",
      color: "text-red-600",
      bgColor: "bg-red-50",
      icon: Coffee,
    };
  };

  const level = getEfficiencyLevel(efficiency);
  const LevelIcon = level.icon;

  // Get progress bar color
  const getProgressColor = (eff: number) => {
    if (eff >= 80) return "[&>div]:bg-green-600";
    if (eff >= 60) return "[&>div]:bg-blue-600";
    if (eff >= 40) return "[&>div]:bg-yellow-600";
    return "[&>div]:bg-red-600";
  };

  // Get trend indicator
  const getTrendIndicator = () => {
    if (!weeklyTrend) return null;

    if (weeklyTrend > 5) {
      return (
        <div className="flex items-center gap-1 text-green-600">
          <TrendingUp className="w-4 h-4" />
          <span className="text-sm font-medium">
            +{weeklyTrend.toFixed(0)}%
          </span>
        </div>
      );
    }

    if (weeklyTrend < -5) {
      return (
        <div className="flex items-center gap-1 text-red-600">
          <TrendingDown className="w-4 h-4" />
          <span className="text-sm font-medium">{weeklyTrend.toFixed(0)}%</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1 text-gray-600">
        <Minus className="w-4 h-4" />
        <span className="text-sm font-medium">Steady</span>
      </div>
    );
  };

  // Default tips based on efficiency
  const getDefaultTips = (eff: number): React.ReactNode[] => {
    if (eff >= 80) {
      return [
        <span className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-500" />
          You're crushing it! Keep up the excellent work.
        </span>,
        "Consider mentoring others or taking on challenging tasks.",
        "Your time management skills are outstanding.",
      ];
    }

    if (eff >= 60) {
      return [
        <span className="flex items-center gap-2">
          <Dumbbell className="w-4 h-4 text-blue-500" />
          Good progress! Focus on high-priority tasks first.
        </span>,
        "Try time-blocking for better focus periods.",
        "Review task estimates to improve accuracy.",
      ];
    }

    if (eff >= 40) {
      return [
        <span className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-orange-500" />
          Break large tasks into smaller, manageable chunks.
        </span>,
        "Eliminate distractions during work sessions.",
        "Set realistic time estimates based on past performance.",
        "Consider using the Pomodoro Technique (25-min focus blocks).",
      ];
    }

    return [
      <span className="flex items-center gap-2">
        <TargetIcon className="w-4 h-4 text-red-500" />
        Start with quick wins to build momentum.
      </span>,
      "Focus on one task at a time - avoid multitasking.",
      "Take regular breaks to maintain energy levels.",
      "Communicate blockers early to your team.",
      "Review your schedule and prioritize ruthlessly.",
    ];
  };

  const displayTips = tips || getDefaultTips(efficiency);

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`${level.bgColor} p-3 rounded-lg`}>
            <LevelIcon className={`w-6 h-6 ${level.color}`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Efficiency Score
            </h3>
            <p className="text-sm text-gray-600">{level.label}</p>
          </div>
        </div>

        {/* Trend Badge */}
        {getTrendIndicator()}
      </div>

      {/* Main Efficiency Display */}
      <div className="mb-6">
        <div className="flex items-end justify-between mb-2">
          <span className="text-5xl font-bold text-gray-900">
            {efficiency}%
          </span>
          <Badge
            className={`${level.color} ${level.bgColor} border-2 hover:opacity-95`}
          >
            {level.label}
          </Badge>
        </div>

        <Progress
          value={efficiency}
          className={`h-3 ${getProgressColor(efficiency)}`}
        />

        <p className="text-xs text-gray-500 mt-2">
          Based on task completion, time accuracy, and productivity patterns
        </p>
      </div>

      {/* Breakdown Stats (if provided) */}
      {breakdown && (
        <div className="grid grid-cols-3 gap-3 mb-6 pb-6 border-b">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {breakdown.onTime}%
            </p>
            <p className="text-xs text-gray-600">On Time</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {breakdown.overEstimate}%
            </p>
            <p className="text-xs text-gray-600">Over Estimate</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {breakdown.avgTaskTime.toFixed(2)}h
            </p>
            <p className="text-xs text-gray-600">Avg Task Time</p>
          </div>
        </div>
      )}

      {/* Tips Section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Focus className="w-4 h-4 text-indigo-600" />
          <h4 className="font-semibold text-gray-900 text-sm">
            Productivity Tips
          </h4>
        </div>

        <ul className="space-y-2">
          {displayTips.slice(0, 3).map((tip, index) => (
            <li
              key={index}
              className="text-sm text-gray-700 flex items-start gap-2 p-2 rounded hover:bg-gray-50 transition-colors"
            >
              <span className="text-indigo-600 mt-0.5">•</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Weekly Comparison (if trend provided) */}
      {weeklyTrend !== undefined && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-gray-600 flex items-center justify-between">
            <span>Compared to last week:</span>
            <span
              className={
                weeklyTrend > 0
                  ? "text-green-600 font-medium"
                  : weeklyTrend < 0
                  ? "text-red-600 font-medium"
                  : "text-gray-600"
              }
            >
              {weeklyTrend > 0 ? "+" : ""}
              {weeklyTrend.toFixed(1)}%
            </span>
          </p>
        </div>
      )}
    </Card>
  );
};
