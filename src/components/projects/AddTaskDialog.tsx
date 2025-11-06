import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const schema = z.object({
  name: z.string().min(1, "Task name is required"),
  hours: z.number().min(0, "Hours must be zero or greater"),
  rate: z.number().min(0, "Rate must be zero or greater"),
});

export type TaskFormValues = z.infer<typeof schema>;

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: TaskFormValues) => Promise<void> | void;
  title?: string;
  initialValues?: Partial<TaskFormValues>;
  submitLabel?: string;
  loading?: boolean;
}

export const AddTaskDialog = ({
  open,
  onOpenChange,
  onSubmit,
  title = "Add task",
  initialValues,
  submitLabel = "Save task",
  loading,
}: AddTaskDialogProps) => {
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialValues?.name ?? "",
      hours: initialValues?.hours ?? 0,
      rate: initialValues?.rate ?? 0,
    },
  });

  useEffect(() => {
    form.reset({
      name: initialValues?.name ?? "",
      hours: initialValues?.hours ?? 0,
      rate: initialValues?.rate ?? 0,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues, open]);

  const handleSubmit = (values: TaskFormValues) => {
    onSubmit(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task name</FormLabel>
                  <FormControl>
                    <Input placeholder="Describe the task" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated hours</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.25"
                        min={0}
                        {...field}
                        onChange={(event) => field.onChange(Number(event.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hourly rate</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step="1"
                        {...field}
                        onChange={(event) => field.onChange(Number(event.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="submit" disabled={loading}>
                {submitLabel}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
