import { useEffect, useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { addDays, format, setHours, setMinutes } from 'date-fns';
import { appointmentApi } from '@/lib/api/appointments';
import { useAuth } from '@/contexts/AuthContext';
import { Vehicle } from '@/types';
import { Textarea } from '@/components/ui/textarea';
import { listVehicles } from '@/services/authService';

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
  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const data = await listVehicles();
        setVehicles(data);
      } catch (error) {
        console.error('Failed to load vehicles', error);
        toast({
          title: 'Vehicle load failed',
          description:
            "We couldn't fetch your vehicles. Please try again later.",
          variant: 'destructive',
        });
      }
    };

    loadVehicles();
  }, [toast]);

  const [serviceTypes, setServiceTypes] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>(TIME_SLOTS);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
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
        serviceTypeId: values.serviceTypeId,
        startTime,
        endTime,
        notes: values.notes,
      });

      toast({
        title: 'Success',
        description: 'Appointment booked successfully!',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to book appointment. Please try again.',
        variant: 'destructive',
      });
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

  return (
    <Card className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Book an Appointment</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="vehicleId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vehicle</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id.toString()}>
                      {vehicle.make} {vehicle.model} ({vehicle.licensePlate})
                    </option>
                  ))}
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
                <Select onValueChange={field.onChange} value={field.value}>
                  {serviceTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
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

          <Button type="submit">Book Appointment</Button>
        </form>
      </Form>
    </Card>
  );
};

export default BookAppointment;
