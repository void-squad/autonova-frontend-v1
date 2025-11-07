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
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
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
import { Alert, AlertDescription } from "@/components/ui/alert";

const MyAppointments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<AppointmentResponseDto[]>(
    []
  );
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentResponseDto | null>(null);
  const [newDate, setNewDate] = useState<Date>();
  const [newTimeSlot, setNewTimeSlot] = useState<string>('');

  const loadAppointments = useCallback(async () => {
    const userId = user?.id;
    if (!userId) return;

    try {
      const data = await appointmentApi.listByCustomer(userId);
      setAppointments(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load appointments. Please try again.',
        variant: 'destructive',
      });
    }
  }, [toast, user?.id]);

  useEffect(() => {
    void loadAppointments();
  }, [loadAppointments]);

  const handleCancel = async (appointmentId: string) => {
    const userId = user?.id;
    if (!userId) return;

    try {
      await appointmentApi.cancel(appointmentId, userId);
      toast({
        title: 'Success',
        description: 'Appointment cancelled successfully.',
      });
      void loadAppointments();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel appointment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleReschedule = async () => {
    if (!selectedAppointment || !newDate || !newTimeSlot) return;

    try {
      const [hours, minutes] = newTimeSlot.split(':');
      const startTime = new Date(newDate);
      startTime.setHours(parseInt(hours), parseInt(minutes));

      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + 1);

      await appointmentApi.reschedule(
        selectedAppointment.id,
        startTime.toISOString(),
        endTime.toISOString()
      );

      toast({
        title: 'Success',
        description: 'Appointment rescheduled successfully.',
      });
      setIsRescheduleDialogOpen(false);
      void loadAppointments();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reschedule appointment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const filteredAppointments = selectedDate
    ? appointments.filter(
        (apt) =>
          format(new Date(apt.startTime), 'yyyy-MM-dd') ===
          format(selectedDate, 'yyyy-MM-dd')
      )
    : appointments;

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.CONFIRMED:
        return 'text-green-600';
      case AppointmentStatus.IN_PROGRESS:
        return 'text-blue-600';
      case AppointmentStatus.COMPLETED:
        return 'text-gray-600';
      case AppointmentStatus.CANCELLED:
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h1 className="mb-6 text-2xl font-bold">My Appointments</h1>

        <div className="grid gap-6 md:grid-cols-[300px_1fr]">
          <div>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
            <Button
              variant="outline"
              className="mt-4 w-full"
              onClick={() => setSelectedDate(undefined)}
            >
              Show All Appointments
            </Button>
          </div>

          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>
                      {format(new Date(appointment.startTime), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      {format(new Date(appointment.startTime), 'hh:mm a')}
                    </TableCell>
                    <TableCell>{appointment.serviceTypeId}</TableCell>
                    <TableCell>{appointment.vehicleId}</TableCell>
                    <TableCell className={getStatusColor(appointment.status)}>
                      {appointment.status}
                    </TableCell>
                    <TableCell>
                      {appointment.status === AppointmentStatus.PENDING && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mr-2"
                            onClick={() => {
                              setSelectedAppointment(appointment);
                              setIsRescheduleDialogOpen(true);
                            }}
                          >
                            Reschedule
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleCancel(appointment.id)}
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredAppointments.length === 0 && (
              <Alert>
                <AlertDescription>
                  No appointments found for the selected date.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </Card>

      <Dialog
        open={isRescheduleDialogOpen}
        onOpenChange={setIsRescheduleDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
          </DialogHeader>
          {/* Add rescheduling form here */}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyAppointments;
