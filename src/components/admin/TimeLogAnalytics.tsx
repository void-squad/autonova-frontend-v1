import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { TimeLog } from "@/types/timeLogging";
import {
  BarChart3,
  TrendingUp,
  Users,
  FolderKanban,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TimeLogAnalyticsProps {
  timeLogs: TimeLog[];
}

export const TimeLogAnalytics = ({ timeLogs }: TimeLogAnalyticsProps) => {
  const analytics = useMemo(() => {
    const totalLogs = timeLogs.length;
    const totalHours = timeLogs.reduce((sum, log) => sum + log.hours, 0);
    const approvedLogs = timeLogs.filter(
      (log) => log.approvalStatus === "APPROVED"
    );
    const pendingLogs = timeLogs.filter(
      (log) => log.approvalStatus === "PENDING"
    );
    const rejectedLogs = timeLogs.filter(
      (log) => log.approvalStatus === "REJECTED"
    );

    const approvedHours = approvedLogs.reduce((sum, log) => sum + log.hours, 0);
    const pendingHours = pendingLogs.reduce((sum, log) => sum + log.hours, 0);
    const rejectedHours = rejectedLogs.reduce((sum, log) => sum + log.hours, 0);

    // Employee stats
    const employeeStats = new Map<
      string,
      {
        logs: number;
        hours: number;
        approved: number;
        pending: number;
        rejected: number;
      }
    >();
    timeLogs.forEach((log) => {
      const name = log.employeeName || "Unknown";
      const current = employeeStats.get(name) || {
        logs: 0,
        hours: 0,
        approved: 0,
        pending: 0,
        rejected: 0,
      };
      current.logs++;
      current.hours += log.hours;
      if (log.approvalStatus === "APPROVED") current.approved++;
      if (log.approvalStatus === "PENDING") current.pending++;
      if (log.approvalStatus === "REJECTED") current.rejected++;
      employeeStats.set(name, current);
    });

    // Project stats
    const projectStats = new Map<
      string,
      {
        logs: number;
        hours: number;
        approved: number;
        pending: number;
        rejected: number;
      }
    >();
    timeLogs.forEach((log) => {
      const project = log.projectTitle || "Unknown";
      const current = projectStats.get(project) || {
        logs: 0,
        hours: 0,
        approved: 0,
        pending: 0,
        rejected: 0,
      };
      current.logs++;
      current.hours += log.hours;
      if (log.approvalStatus === "APPROVED") current.approved++;
      if (log.approvalStatus === "PENDING") current.pending++;
      if (log.approvalStatus === "REJECTED") current.rejected++;
      projectStats.set(project, current);
    });

    // Task stats
    const taskStats = new Map<string, { logs: number; hours: number }>();
    timeLogs.forEach((log) => {
      const task = log.taskName || "Unknown";
      const current = taskStats.get(task) || { logs: 0, hours: 0 };
      current.logs++;
      current.hours += log.hours;
      taskStats.set(task, current);
    });

    // Sort and get top performers
    const topEmployees = Array.from(employeeStats.entries())
      .sort((a, b) => b[1].hours - a[1].hours)
      .slice(0, 5);

    const topProjects = Array.from(projectStats.entries())
      .sort((a, b) => b[1].hours - a[1].hours)
      .slice(0, 5);

    const topTasks = Array.from(taskStats.entries())
      .sort((a, b) => b[1].hours - a[1].hours)
      .slice(0, 5);

    // Approval rate
    const approvalRate =
      totalLogs > 0 ? (approvedLogs.length / totalLogs) * 100 : 0;
    const rejectionRate =
      totalLogs > 0 ? (rejectedLogs.length / totalLogs) * 100 : 0;

    // Average hours per log
    const avgHoursPerLog = totalLogs > 0 ? totalHours / totalLogs : 0;

    return {
      totalLogs,
      totalHours,
      approvedLogs: approvedLogs.length,
      pendingLogs: pendingLogs.length,
      rejectedLogs: rejectedLogs.length,
      approvedHours,
      pendingHours,
      rejectedHours,
      approvalRate,
      rejectionRate,
      avgHoursPerLog,
      uniqueEmployees: employeeStats.size,
      uniqueProjects: projectStats.size,
      uniqueTasks: taskStats.size,
      topEmployees,
      topProjects,
      topTasks,
    };
  }, [timeLogs]);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Logs</p>
              <p className="text-3xl font-bold">{analytics.totalLogs}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Hours</p>
              <p className="text-3xl font-bold">
                {analytics.totalHours.toFixed(1)}
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Avg Hours/Log</p>
              <p className="text-3xl font-bold">
                {analytics.avgHoursPerLog.toFixed(1)}
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Approval Rate</p>
              <p className="text-3xl font-bold">
                {analytics.approvalRate.toFixed(0)}%
              </p>
            </div>
            <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold">{analytics.approvedLogs}</p>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Hours:</span>
              <span className="font-semibold">
                {analytics.approvedHours.toFixed(1)}h
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{
                  width: `${
                    analytics.totalLogs > 0
                      ? (analytics.approvedLogs / analytics.totalLogs) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold">{analytics.pendingLogs}</p>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Hours:</span>
              <span className="font-semibold">
                {analytics.pendingHours.toFixed(1)}h
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-yellow-600 h-2 rounded-full"
                style={{
                  width: `${
                    analytics.totalLogs > 0
                      ? (analytics.pendingLogs / analytics.totalLogs) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-2xl font-bold">{analytics.rejectedLogs}</p>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Hours:</span>
              <span className="font-semibold">
                {analytics.rejectedHours.toFixed(1)}h
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-red-600 h-2 rounded-full"
                style={{
                  width: `${
                    analytics.totalLogs > 0
                      ? (analytics.rejectedLogs / analytics.totalLogs) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Employees */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Top Employees</h3>
            <Badge variant="secondary">{analytics.uniqueEmployees} total</Badge>
          </div>
          <div className="space-y-3">
            {analytics.topEmployees.map(([name, stats], index) => (
              <div key={name} className="flex items-center gap-3">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{name}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span>{stats.hours.toFixed(1)}h</span>
                    <span>•</span>
                    <span>{stats.logs} logs</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  {stats.approved > 0 && (
                    <Badge
                      variant="outline"
                      className="text-xs bg-green-50 text-green-700 border-green-200"
                    >
                      {stats.approved}
                    </Badge>
                  )}
                  {stats.pending > 0 && (
                    <Badge
                      variant="outline"
                      className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200"
                    >
                      {stats.pending}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
            {analytics.topEmployees.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No employee data available
              </p>
            )}
          </div>
        </Card>

        {/* Top Projects */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <FolderKanban className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold">Top Projects</h3>
            <Badge variant="secondary">{analytics.uniqueProjects} total</Badge>
          </div>
          <div className="space-y-3">
            {analytics.topProjects.map(([project, stats], index) => (
              <div key={project} className="flex items-center gap-3">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-purple-100 text-purple-600 font-semibold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{project}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span>{stats.hours.toFixed(1)}h</span>
                    <span>•</span>
                    <span>{stats.logs} logs</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  {stats.approved > 0 && (
                    <Badge
                      variant="outline"
                      className="text-xs bg-green-50 text-green-700 border-green-200"
                    >
                      {stats.approved}
                    </Badge>
                  )}
                  {stats.pending > 0 && (
                    <Badge
                      variant="outline"
                      className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200"
                    >
                      {stats.pending}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
            {analytics.topProjects.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No project data available
              </p>
            )}
          </div>
        </Card>

        {/* Top Tasks */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold">Most Logged Tasks</h3>
            <Badge variant="secondary">{analytics.uniqueTasks} total</Badge>
          </div>
          <div className="space-y-3">
            {analytics.topTasks.map(([task, stats], index) => (
              <div key={task} className="flex items-center gap-3">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-100 text-green-600 font-semibold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{task}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span>{stats.hours.toFixed(1)}h</span>
                    <span>•</span>
                    <span>{stats.logs} logs</span>
                  </div>
                </div>
              </div>
            ))}
            {analytics.topTasks.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No task data available
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
