import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const schema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  title: z.string().min(1, "Project title is required"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
});

export type ProjectFormValues = z.infer<typeof schema>;

interface ProjectFormProps {
  defaultValues?: Partial<ProjectFormValues>;
  onSubmit: (values: ProjectFormValues) => Promise<void> | void;
  submitLabel?: string;
  loading?: boolean;
  className?: string;
}

const priorityOptions = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
];

export const ProjectForm = ({ defaultValues, onSubmit, submitLabel = "Save", loading, className }: ProjectFormProps) => {
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(schema),
    defaultValues: useMemo(
      () => ({
        customerName: "",
        title: "",
        description: "",
        priority: undefined,
        ...defaultValues,
      }),
      [defaultValues],
    ),
  });

  const handleSubmit = (values: ProjectFormValues) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className={className}>
        <div className="grid gap-6">
          <FormField
            control={form.control}
            name="customerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Alex Murphy" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project title</FormLabel>
                <FormControl>
                  <Input placeholder="What needs to be done?" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Add more project details…" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select onValueChange={(value) => field.onChange(value)} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="submit" disabled={loading} className="min-w-[120px]">
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
};
