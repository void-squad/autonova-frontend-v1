import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, addDays, setHours, setMinutes } from "date-fns";
import { Calendar as CalendarIcon, Loader2, Car, Clock, Wrench } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { appointmentApi, vehicleApi } from "@/lib/api/appointments";
import { SERVICE_TYPES, Vehicle, AppointmentStatus } from "@/types";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

const BUSINESS_HOURS = {
  start: 9, // 9 AM
  end: 17, // 5 PM
};

const TIME_SLOTS = Array.from({ length: 16 }, (_, i) => {
  const hour = Math.floor(i / 2) + BUSINESS_HOURS.start;
  const minutes = (i % 2) * 30;
  return `${hour.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}`;
});

const formSchema = z.object({
  vehicleId: z.string().min(1, 'Please select a vehicle'),
  serviceTypeId: z.string().min(1, 'Please select a service type'),
  date: z.date({
    required_error: 'Please select a date',
  }),
  timeSlot: z.string().min(1, 'Please select a time slot'),
  notes: z.string().optional(),
});

const BookAppointment = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>(TIME_SLOTS);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const [hours, minutes] = values.timeSlot.split(':');
      const startTime = setMinutes(
        setHours(values.date, parseInt(hours)),
        parseInt(minutes)
      ).toISOString();

      // Assuming 1 hour duration for now
      const endTime = setMinutes(
        setHours(values.date, parseInt(hours) + 1),
        parseInt(minutes)
      ).toISOString();

      await appointmentApi.create({
        vehicleId: values.vehicleId,
        serviceType: values.serviceTypeId,
        startTime,
        endTime,
        notes: values.notes,
        status: AppointmentStatus.PENDING
      });

      toast({
        title: 'Success',
        description: 'Appointment booked successfully!',
      });
      form.reset();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to book appointment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkAvailability = async (date: Date, timeSlot: string) => {
    const [hours, minutes] = timeSlot.split(':');
    const startTime = setMinutes(
      setHours(date, parseInt(hours)),
      parseInt(minutes)
    ).toISOString();
    const endTime = setMinutes(
      setHours(date, parseInt(hours) + 1),
      parseInt(minutes)
    ).toISOString();

    try {
      return await appointmentApi.checkAvailability(startTime, endTime);
    } catch (error) {
      console.error('Failed to check availability:', error);
      return false;
    }
  };

  const updateAvailableSlots = async (date: Date) => {
    const availabilityChecks = TIME_SLOTS.map((slot) =>
      checkAvailability(date, slot)
    );
    const results = await Promise.all(availabilityChecks);
    const available = TIME_SLOTS.filter((_, index) => results[index]);
    setAvailableSlots(available);
  };

  useEffect(() => {
    if (user?.id) {
      // Load customer's vehicles
      vehicleApi.listByCustomer(user.id).then(setVehicles).catch(console.error);
    }
  }, [user]);

  return (
    <Card className="p-6">
      <CardHeader>
        <CardTitle>Book an Appointment</CardTitle>
        <CardDescription>Schedule a service appointment for your vehicle</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="vehicleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.make} {vehicle.model} ({vehicle.licensePlate})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="serviceTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICE_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => {
                      field.onChange(date);
                      if (date) {
                        updateAvailableSlots(date);
                      }
                    }}
                    disabled={(date) => {
                      const today = new Date();
                      const maxDate = addDays(today, 30);
                      return (
                        date < today ||
                        date > maxDate ||
                        date.getDay() === 0 || // Sunday
                        date.getDay() === 6 // Saturday
                      );
                    }}
                    className="rounded-md border"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="timeSlot"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  {availableSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Add any additional notes or requirements..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Booking...
              </>
            ) : (
              "Book Appointment"
            )}
          </Button>
        </form>
      </Form>
      </CardContent>
    </Card>
  );
};

export default BookAppointment;
