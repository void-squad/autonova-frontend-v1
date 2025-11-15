import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AddTaskDialog, type TaskFormValues } from "@/components/projects/AddTaskDialog";
import { DeleteConfirmDialog } from "@/components/projects/DeleteConfirmDialog";
import { useToast } from "@/hooks/use-toast";
import type { Task } from "@/types/project";

interface TasksTableProps {
  tasks: Task[];
  onAddTask: (input: TaskFormValues) => Promise<void>;
  onUpdateTask: (taskId: string, input: TaskFormValues) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  loading?: boolean;
}

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export const TasksTable = ({ tasks, onAddTask, onUpdateTask, onDeleteTask, loading }: TasksTableProps) => {
  const { toast } = useToast();
  const [addOpen, setAddOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [deleteTask, setDeleteTask] = useState<Task | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const totalEstimate = useMemo(
    () => tasks.reduce((sum, task) => sum + task.hours * task.rate, 0),
    [tasks],
  );

  const handleAdd = async (values: TaskFormValues) => {
    try {
      setSubmitting(true);
      await onAddTask(values);
      setAddOpen(false);
      toast({
        title: "Task added",
        description: "The task has been added to the project.",
      });
    } catch (error: any) {
      toast({
        title: "Unable to add task",
        description: error?.message ?? "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (values: TaskFormValues) => {
    if (!editTask) return;
    try {
      setSubmitting(true);
      await onUpdateTask(editTask.id, values);
      setEditTask(null);
      toast({
        title: "Task updated",
        description: "The task details were saved.",
      });
    } catch (error: any) {
      toast({
        title: "Unable to update task",
        description: error?.message ?? "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTask) return;
    try {
      setDeleting(true);
      await onDeleteTask(deleteTask.id);
      setDeleteTask(null);
      toast({
        title: "Task removed",
        description: "The task was deleted from the project.",
      });
    } catch (error: any) {
      toast({
        title: "Unable to delete task",
        description: error?.message ?? "Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h3 className="text-lg font-semibold">Tasks</h3>
        <Button onClick={() => setAddOpen(true)} disabled={loading}>
          Add task
        </Button>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead className="w-24 text-right">Hours</TableHead>
              <TableHead className="w-24 text-right">Rate</TableHead>
              <TableHead className="w-28 text-right">Line total</TableHead>
              <TableHead className="w-32 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-6 text-center text-muted-foreground">
                  No tasks recorded yet.
                </TableCell>
              </TableRow>
            ) : (
              tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>{task.name}</TableCell>
                  <TableCell className="text-right">{task.hours.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{currency.format(task.rate)}</TableCell>
                  <TableCell className="text-right">{currency.format(task.hours * task.rate)}</TableCell>
                  <TableCell className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditTask(task)}>
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => setDeleteTask(task)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end text-sm text-muted-foreground">
        Estimated total:{" "}
        <span className="ml-2 font-medium text-foreground">{currency.format(totalEstimate)}</span>
      </div>

      <AddTaskDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={handleAdd}
        loading={submitting}
        title="Add task"
        submitLabel="Add task"
      />

      <AddTaskDialog
        open={!!editTask}
        onOpenChange={(open) => {
          if (!open) setEditTask(null);
        }}
        onSubmit={handleEdit}
        loading={submitting}
        title="Edit task"
        submitLabel="Save changes"
        initialValues={
          editTask
            ? {
                name: editTask.name,
                hours: editTask.hours,
                rate: editTask.rate,
              }
            : undefined
        }
      />

      <DeleteConfirmDialog
        open={!!deleteTask}
        onOpenChange={(open) => {
          if (!open) setDeleteTask(null);
        }}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete task"
        description="This task will be permanently removed from the project."
        confirmLabel="Delete task"
      />
    </div>
  );
};
