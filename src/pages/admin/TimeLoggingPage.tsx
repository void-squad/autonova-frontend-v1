import { useState, useEffect, useMemo } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { TimeLog } from "@/types/timeLogging";
import { timeLoggingApi } from "@/Api/timeLoggingApi";
import { Check, X, Clock, Filter, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const TimeLoggingPage = () => {
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<TimeLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  // Rejection dialog state
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedLogForRejection, setSelectedLogForRejection] =
    useState<TimeLog | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Get unique search options from all logs
  const searchOptions = useMemo(() => {
    const employees = new Set<string>();
    const projects = new Set<string>();
    const tasks = new Set<string>();

    timeLogs.forEach((log) => {
      if (log.employeeName) employees.add(log.employeeName);
      if (log.projectTitle) projects.add(log.projectTitle);
      if (log.taskName) tasks.add(log.taskName);
    });

    return {
      employees: Array.from(employees).sort(),
      projects: Array.from(projects).sort(),
      tasks: Array.from(tasks).sort(),
    };
  }, [timeLogs]);

  // Fetch ALL time logs (not just pending)
  const fetchTimeLogs = async () => {
    try {
      setLoading(true);
      const logs = await timeLoggingApi.getAllTimeLogs();
      setTimeLogs(logs);
    } catch (error) {
      console.error("Error fetching time logs:", error);
      toast.error("Failed to fetch time logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeLogs();
  }, []);

  // Filter logs based on status and search term
  useEffect(() => {
    let filtered = [...timeLogs];

    // Filter by status
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((log) => log.approvalStatus === statusFilter);
    }

    // Filter by search term (employee name, project, task)
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          log.employeeName?.toLowerCase().includes(search) ||
          log.projectTitle?.toLowerCase().includes(search) ||
          log.taskName?.toLowerCase().includes(search)
      );
    }

    setFilteredLogs(filtered);
  }, [statusFilter, searchTerm, timeLogs]);

  const handleApprove = async (logId: string) => {
    try {
      await timeLoggingApi.approveTimeLog(logId);
      toast.success("Time log approved successfully");
      // Update the local state instead of refetching
      setTimeLogs((prev) =>
        prev.map((log) =>
          log.id === logId
            ? { ...log, approvalStatus: "APPROVED" as const }
            : log
        )
      );
    } catch (error: any) {
      console.error("Error approving time log:", error);
      console.error("Error response:", error.response);
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to approve time log";
      toast.error(errorMsg);
    }
  };

  const openRejectDialog = (log: TimeLog) => {
    setSelectedLogForRejection(log);
    setRejectionReason("");
    setRejectDialogOpen(true);
  };

  const handleReject = async () => {
    if (!selectedLogForRejection) return;

    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    try {
      await timeLoggingApi.rejectTimeLog(
        selectedLogForRejection.id,
        rejectionReason
      );
      toast.success("Time log rejected");
      setRejectDialogOpen(false);
      setSelectedLogForRejection(null);
      setRejectionReason("");
      // Update the local state instead of refetching
      setTimeLogs((prev) =>
        prev.map((log) =>
          log.id === selectedLogForRejection.id
            ? { ...log, approvalStatus: "REJECTED" as const }
            : log
        )
      );
    } catch (error: any) {
      console.error("Error rejecting time log:", error);
      console.error("Error response:", error.response);
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to reject time log";
      toast.error(errorMsg);
    }
  };

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

  const totalHours = filteredLogs.reduce((sum, log) => sum + log.hours, 0);
  const pendingCount = timeLogs.filter(
    (log) => log.approvalStatus === "PENDING"
  ).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Time Log Management
          </h1>
          <p className="text-gray-600 mt-1">
            Review and approve employee time logs
          </p>
        </div>
        <div className="flex gap-4">
          <Card className="p-4">
            <div className="text-sm text-gray-600">Pending Approval</div>
            <div className="text-2xl font-bold text-yellow-600">
              {pendingCount}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Total Hours (Filtered)</div>
            <div className="text-2xl font-bold text-blue-600">
              {totalHours.toFixed(2)}
            </div>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Search by Employee, Project, or Task</Label>
            <Popover open={searchOpen} onOpenChange={setSearchOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={searchOpen}
                  className="w-full justify-between"
                >
                  {searchTerm || "Type to search..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0">
                <Command>
                  <CommandInput
                    placeholder="Search employee, project, or task..."
                    value={searchTerm}
                    onValueChange={setSearchTerm}
                  />
                  <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    {searchOptions.employees.length > 0 && (
                      <CommandGroup heading="Employees">
                        {searchOptions.employees.map((employee) => (
                          <CommandItem
                            key={employee}
                            value={employee}
                            onSelect={(value) => {
                              setSearchTerm(value);
                              setSearchOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                searchTerm === employee
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {employee}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                    {searchOptions.projects.length > 0 && (
                      <CommandGroup heading="Projects">
                        {searchOptions.projects.map((project) => (
                          <CommandItem
                            key={project}
                            value={project}
                            onSelect={(value) => {
                              setSearchTerm(value);
                              setSearchOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                searchTerm === project
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {project}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                    {searchOptions.tasks.length > 0 && (
                      <CommandGroup heading="Tasks">
                        {searchOptions.tasks.map((task) => (
                          <CommandItem
                            key={task}
                            value={task}
                            onSelect={(value) => {
                              setSearchTerm(value);
                              setSearchOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                searchTerm === task
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {task}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchTerm("")}
                className="h-8 px-2 lg:px-3"
              >
                Clear search
                <X className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Time Logs Table */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Time Logs</h2>
          <Badge className="ml-2">{filteredLogs.length} entries</Badge>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading time logs...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No time logs found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">Employee</TableHead>
                  <TableHead className="w-36">Date</TableHead>
                  <TableHead className="w-40">Project</TableHead>
                  <TableHead className="w-32">Task</TableHead>
                  <TableHead className="w-20 text-right">Hours</TableHead>
                  <TableHead className="w-24">Status</TableHead>
                  <TableHead className="w-64">Notes</TableHead>
                  <TableHead className="w-32 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium w-32">
                      {log.employeeName || "Unknown"}
                    </TableCell>
                    <TableCell className="w-36">
                      <div className="flex flex-col">
                        <span className="whitespace-nowrap">
                          {formatDateOnly(log.loggedAt)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatTimeOnly(log.loggedAt)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="w-40">{log.projectTitle}</TableCell>
                    <TableCell className="w-32">{log.taskName}</TableCell>
                    <TableCell className="w-20 text-right font-semibold">
                      {log.hours.toFixed(2)}
                    </TableCell>
                    <TableCell className="w-24">
                      {getStatusBadge(log.approvalStatus)}
                    </TableCell>
                    <TableCell className="w-64 whitespace-normal break-words text-sm">
                      {log.note || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {log.approvalStatus === "PENDING" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleApprove(log.id)}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openRejectDialog(log)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </>
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

      {/* Rejection Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Time Log</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this time log. This will be
              added to the log's notes.
            </DialogDescription>
          </DialogHeader>
          {selectedLogForRejection && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Employee:</span>
                  <span className="text-sm font-medium">
                    {selectedLogForRejection.employeeName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Project:</span>
                  <span className="text-sm font-medium">
                    {selectedLogForRejection.projectTitle}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Task:</span>
                  <span className="text-sm font-medium">
                    {selectedLogForRejection.taskName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Hours:</span>
                  <span className="text-sm font-medium">
                    {selectedLogForRejection.hours.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rejection-reason">Rejection Reason *</Label>
                <Textarea
                  id="rejection-reason"
                  placeholder="Explain why this time log is being rejected..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectionReason.trim()}
            >
              Reject Time Log
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
