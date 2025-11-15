import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { WeeklySummaryData } from "@/types/timeLogging";

interface WeeklySummaryProps {
  data: WeeklySummaryData;
}

export const WeeklySummary = ({ data }: WeeklySummaryProps) => {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Hours by Day</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.dailyHours}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="hours" fill="#4F86F7" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Hours by Project</h3>
        <div className="space-y-3">
          {data.projectBreakdown.map((project) => (
            <div
              key={project.projectId}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <p className="font-medium text-gray-900">
                  {project.projectTitle}
                </p>
                <p className="text-sm text-gray-600">
                  {project.taskCount} tasks
                </p>
              </div>
              <p className="text-xl font-bold text-blue-600">
                {project.totalHours.toFixed(2)}h
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
