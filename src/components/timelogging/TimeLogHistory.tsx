import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TimeLog } from "@/types/timeLogging";
import { Trash2, Edit, Clock } from "lucide-react";

interface TimeLogHistoryProps {
  timeLogs: TimeLog[];
  onEdit?: (timeLog: TimeLog) => void;
  onDelete?: (id: string) => void;
}

export const TimeLogHistory = ({
  timeLogs,
  onEdit,
  onDelete,
}: TimeLogHistoryProps) => {
  const formatDateOnly = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const formatTimeOnly = (dateString: string) =>
    new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const totalHours = timeLogs.reduce((sum, log) => sum + log.hours, 0);

  const getStatusBadge = (status: "PENDING" | "APPROVED" | "REJECTED") => {
    switch (status) {
      case "APPROVED":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-300">
            Approved
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-300">
            Rejected
          </Badge>
        );
      case "PENDING":
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
            Pending
          </Badge>
        );
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Time Log History
          </h2>
        </div>
        <Badge className="bg-blue-100 text-blue-800 text-lg px-4 py-1">
          Total: {totalHours.toFixed(2)} hrs
        </Badge>
      </div>

      {timeLogs.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No time logs yet. Start logging your work!</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-48">Date</TableHead>
                <TableHead className="min-w-[240px]">Project</TableHead>
                <TableHead className="min-w-[180px]">Task</TableHead>
                <TableHead className="text-right">Hours</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="min-w-[320px]">Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {timeLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium w-48">
                    <div className="flex flex-col">
                      <span className="whitespace-nowrap">
                        {formatDateOnly(log.loggedAt)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatTimeOnly(log.loggedAt)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="min-w-[240px]">
                    {log.projectTitle}
                  </TableCell>
                  <TableCell className="min-w-[180px]">
                    {log.taskName}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {log.hours.toFixed(2)}
                  </TableCell>
                  <TableCell>{getStatusBadge(log.approvalStatus)}</TableCell>
                  <TableCell className="min-w-[320px] whitespace-normal break-words text-sm">
                    {log.note || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(log)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(log.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
};
