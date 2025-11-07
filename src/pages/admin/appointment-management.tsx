import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Clock,
  Car,
  Wrench,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
} from "lucide-react";
import { appointmentApi } from "@/lib/api/appointments";
import { AppointmentResponseDto, AppointmentStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const AppointmentManagement = () => {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<AppointmentResponseDto[]>([]);
  const [filterDate, setFilterDate] = useState<Date>();
  const [filterStatus, setFilterStatus] = useState<AppointmentStatus>();
  const [searchQuery, setSearchQuery] = useState("");
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentResponseDto | null>(null);

  useEffect(() => {
    loadAppointments();
  }, [filterDate, filterStatus]);

  const loadAppointments = async () => {
    try {
      const params: any = {};
      if (filterDate) {
        params.startDate = format(filterDate, "yyyy-MM-dd");
      }
      if (filterStatus) {
        params.status = filterStatus;
      }
      const data = await appointmentApi.listAll(params);
      setAppointments(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load appointments. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStatusUpdate = async (status: AppointmentStatus) => {
    if (!selectedAppointment) return;

    try {
      await appointmentApi.updateStatus(selectedAppointment.id, status);
      toast({
        title: "Success",
        description: "Appointment status updated successfully.",
      });
      setIsUpdateDialogOpen(false);
      loadAppointments();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update appointment status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusDetails = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.PENDING:
        return {
          label: "Pending",
          color: "bg-yellow-500",
          icon: AlertCircle,
        };
      case AppointmentStatus.ACCEPTED:
        return {
          label: "Accepted",
          color: "bg-green-500",
          icon: CheckCircle2,
        };
      case AppointmentStatus.REJECTED:
        return {
          label: "Rejected",
          color: "bg-red-500",
          icon: XCircle,
        };
      case AppointmentStatus.CANCELLED:
        return {
          label: "Cancelled",
          color: "bg-gray-500",
          icon: XCircle,
        };
      case AppointmentStatus.COMPLETED:
        return {
          label: "Completed",
          color: "bg-blue-500",
          icon: CheckCircle2,
        };
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    const customerInfo = `${apt.customerName} ${apt.vehicle.make} ${apt.vehicle.model} ${apt.vehicle.licensePlate}`.toLowerCase();
    return customerInfo.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Appointment Management</CardTitle>
          <CardDescription>
            Manage and track all service appointments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-4 items-center">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="min-w-[240px]">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filterDate ? (
                        format(filterDate, "PPP")
                      ) : (
                        "Filter by date"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filterDate}
                      onSelect={setFilterDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Select
                  value={filterStatus}
                  onValueChange={(value: AppointmentStatus) =>
                    setFilterStatus(value)
                  }
                >
                  <SelectTrigger className="min-w-[200px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={undefined}>All Statuses</SelectItem>
                    {Object.values(AppointmentStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        {getStatusDetails(status).label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={() => {
                    setFilterDate(undefined);
                    setFilterStatus(undefined);
                  }}
                >
                  Clear Filters
                </Button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search customer or vehicle..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 min-w-[300px]"
                />
              </div>
            </div>

            {/* Appointments Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.map((appointment) => {
                  const statusDetails = getStatusDetails(appointment.status);
                  return (
                    <TableRow key={appointment.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4" />
                            {format(
                              new Date(appointment.startTime),
                              "MMM dd, yyyy"
                            )}
                          </span>
                          <span className="text-muted-foreground flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {format(new Date(appointment.startTime), "hh:mm a")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {appointment.customerName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4" />
                          <span>
                            {appointment.vehicle.make} {appointment.vehicle.model}
                            <br />
                            <span className="text-muted-foreground text-sm">
                              {appointment.vehicle.licensePlate}
                            </span>
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Wrench className="h-4 w-4" />
                          {appointment.serviceType}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={`${statusDetails.color} text-white`}
                        >
                          <statusDetails.icon className="h-4 w-4 mr-1" />
                          {statusDetails.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {appointment.status === AppointmentStatus.PENDING && (
                          <div className="flex gap-2">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => {
                                setSelectedAppointment(appointment);
                                setIsUpdateDialogOpen(true);
                              }}
                            >
                              Update Status
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {filteredAppointments.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No appointments found.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Appointment Status</DialogTitle>
            <DialogDescription>
              Choose the new status for this appointment
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Button
              className="w-full"
              onClick={() => handleStatusUpdate(AppointmentStatus.ACCEPTED)}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Accept Appointment
            </Button>
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => handleStatusUpdate(AppointmentStatus.REJECTED)}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject Appointment
            </Button>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUpdateDialogOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentManagement;