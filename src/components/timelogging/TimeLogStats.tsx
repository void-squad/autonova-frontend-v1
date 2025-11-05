import { Card } from "@/components/ui/card";
import { Clock, CheckCircle2, FolderOpen, ListTodo } from "lucide-react";
import { TimeLogStats as Stats } from "@/types/timeLogging";

interface TimeLogStatsProps {
  stats: Stats;
}

export const TimeLogStats = ({ stats }: TimeLogStatsProps) => {
  const statCards = [
    {
      title: "Today's Hours",
      value: stats.todayHours.toFixed(2),
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "This Week",
      value: stats.weekHours.toFixed(2),
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Active Projects",
      value: stats.activeProjects.toString(),
      icon: FolderOpen,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Pending Tasks",
      value: stats.pendingTasks.toString(),
      icon: ListTodo,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {statCards.map((stat) => (
        <Card
          key={stat.title}
          className="p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stat.value}
              </p>
            </div>
            <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}>
              <stat.icon className="w-6 h-6" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
