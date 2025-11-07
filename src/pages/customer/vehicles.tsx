import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2 } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import * as authService from '@/services/authService';
import type { Vehicle, VehicleInput } from '@/types';

const currentYear = new Date().getFullYear();

const vehicleFormSchema = z.object({
  make: z.string().trim().min(1, 'Make is required'),
  model: z.string().trim().min(1, 'Model is required'),
  year: z
    .string()
    .trim()
    .regex(/^\d{4}$/u, 'Enter a valid year')
    .refine((value) => {
      const asNumber = Number(value);
      return asNumber >= 1950 && asNumber <= currentYear + 1;
    }, `Enter a year between 1950 and ${currentYear + 1}`),
  vin: z
    .string()
    .trim()
    .min(11, 'VIN must be at least 11 characters')
    .max(17, 'VIN must be 17 characters or fewer'),
  licensePlate: z
    .string()
    .trim()
    .min(1, 'License plate is required')
    .max(12, 'License plate must be 12 characters or fewer'),
});

const emptyFormValues: VehicleFormValues = {
  make: '',
  model: '',
  year: '',
  vin: '',
  licensePlate: '',
};

type VehicleFormValues = z.infer<typeof vehicleFormSchema>;

type UpdateVehiclePayload = {
  id: number;
  payload: VehicleInput;
};

type DeleteVehiclePayload = {
  id: number;
};

const VehiclesPage = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [vehiclePendingDeletion, setVehiclePendingDeletion] =
    useState<Vehicle | null>(null);

  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: emptyFormValues,
  });

  const vehiclesQuery = useQuery({
    queryKey: ['vehicles'],
    queryFn: authService.listVehicles,
  });

  const createVehicleMutation = useMutation({
    mutationFn: authService.createVehicle,
    onSuccess: () => {
      toast.success('Vehicle added successfully.');
      void queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      setIsDialogOpen(false);
      setEditingVehicle(null);
      form.reset(emptyFormValues);
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to add the vehicle right now. Please try again.';
      toast.error(message);
    },
  });

  const updateVehicleMutation = useMutation({
    mutationFn: ({ id, payload }: UpdateVehiclePayload) =>
      authService.updateVehicle(id, payload),
    onSuccess: () => {
      toast.success('Vehicle updated successfully.');
      void queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      setIsDialogOpen(false);
      setEditingVehicle(null);
      form.reset(emptyFormValues);
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to update the vehicle right now. Please try again.';
      toast.error(message);
    },
  });

  const deleteVehicleMutation = useMutation({
    mutationFn: ({ id }: DeleteVehiclePayload) => authService.deleteVehicle(id),
    onSuccess: () => {
      toast.success('Vehicle removed successfully.');
      void queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      setVehiclePendingDeletion(null);
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to delete the vehicle right now. Please try again.';
      toast.error(message);
    },
  });

  const openCreateDialog = () => {
    setEditingVehicle(null);
    form.reset(emptyFormValues);
    setIsDialogOpen(true);
  };

  const openEditDialog = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    form.reset({
      make: vehicle.make ?? '',
      model: vehicle.model ?? '',
      year: vehicle.year ? String(vehicle.year) : '',
      vin: vehicle.vin ?? '',
      licensePlate: vehicle.licensePlate ?? '',
    });
    setIsDialogOpen(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      setIsDialogOpen(false);
      setEditingVehicle(null);
      form.reset(emptyFormValues);
      return;
    }

    setIsDialogOpen(true);
  };

  const handleSubmit = (values: VehicleFormValues) => {
    const payload: VehicleInput = {
      make: values.make.trim(),
      model: values.model.trim(),
      year: Number(values.year.trim()),
      vin: values.vin.trim().toUpperCase(),
      licensePlate: values.licensePlate.trim().toUpperCase(),
    };

    if (editingVehicle) {
      updateVehicleMutation.mutate({ id: editingVehicle.id, payload });
    } else {
      createVehicleMutation.mutate(payload);
    }
  };

  const vehicles = useMemo(
    () => vehiclesQuery.data ?? [],
    [vehiclesQuery.data]
  );

  const isLoadingList = vehiclesQuery.isLoading;
  const isFormSubmitting =
    createVehicleMutation.isPending || updateVehicleMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Vehicles</h1>
          <p className="text-muted-foreground">
            Manage the vehicles connected to your Autonova account.
          </p>
        </div>
        <Button onClick={openCreateDialog} className="w-full md:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Add vehicle
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vehicle garage</CardTitle>
          <CardDescription>
            Keep your vehicle information up to date for faster bookings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingList ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : vehicles.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              No vehicles yet. Add your first vehicle to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>VIN</TableHead>
                  <TableHead>License plate</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-foreground">
                          {[vehicle.make, vehicle.model]
                            .filter(Boolean)
                            .join(' ')
                            .trim() || '—'}
                        </span>
                        <Badge
                          variant="secondary"
                          className="w-fit text-xs font-medium"
                        >
                          {vehicle.year ?? '—'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm uppercase">
                      {vehicle.vin ?? '—'}
                    </TableCell>
                    <TableCell className="font-medium uppercase">
                      {vehicle.licensePlate ?? '—'}
                    </TableCell>
                    <TableCell className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(vehicle)}
                      >
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setVehiclePendingDeletion(vehicle)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingVehicle ? 'Edit vehicle' : 'Add new vehicle'}
            </DialogTitle>
            <DialogDescription>
              {editingVehicle
                ? 'Update the details for this vehicle.'
                : 'Add a vehicle for quicker bookings and service tracking.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="make"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Make</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Tesla" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Model 3" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 2024"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>VIN</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Vehicle identification number"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="licensePlate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>License plate</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., ABC-1234" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleDialogOpenChange(false)}
                  disabled={isFormSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isFormSubmitting}>
                  {isFormSubmitting
                    ? 'Saving...'
                    : editingVehicle
                    ? 'Save changes'
                    : 'Add vehicle'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(vehiclePendingDeletion)}
        onOpenChange={(open) => {
          if (!open) {
            setVehiclePendingDeletion(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove vehicle</AlertDialogTitle>
            <AlertDialogDescription>
              This action will remove
              {vehiclePendingDeletion
                ? ` ${vehiclePendingDeletion.make} ${vehiclePendingDeletion.model}`
                : ''}
              {'.'} You can add it again later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setVehiclePendingDeletion(null)}
              disabled={deleteVehicleMutation.isPending}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!vehiclePendingDeletion) return;
                deleteVehicleMutation.mutate({ id: vehiclePendingDeletion.id });
              }}
              disabled={deleteVehicleMutation.isPending}
            >
              {deleteVehicleMutation.isPending ? 'Removing...' : 'Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VehiclesPage;
