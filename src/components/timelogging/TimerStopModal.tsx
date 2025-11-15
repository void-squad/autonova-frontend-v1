import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Clock } from "lucide-react";

interface TimerStopModalProps {
  isOpen: boolean;
  taskName: string;
  elapsedHours: number;
  onConfirm: (note?: string) => void;
  onCancel: () => void;
}

export const TimerStopModal = ({
  isOpen,
  taskName,
  elapsedHours,
  onConfirm,
  onCancel,
}: TimerStopModalProps) => {
  const [note, setNote] = useState("");

  const handleSubmit = () => {
    // Call confirm handler and then request modal close immediately
    onConfirm(note);
    setNote(""); // Reset for next use
    onCancel();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Stop Timer
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Task:</p>
            <p className="font-semibold text-gray-900">{taskName}</p>
            <p className="text-2xl font-bold text-blue-600 mt-2">
              {elapsedHours.toFixed(2)} hours
            </p>
          </div>

          <div>
            <Label htmlFor="note">Add notes (optional)</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What did you accomplish? Any blockers?"
              rows={4}
              className="mt-2"
            />
            <p className="text-xs text-gray-500 mt-1">
              This will help track your progress and communicate with the team
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onCancel}>
            Keep Running
          </Button>
          <Button onClick={handleSubmit} className="bg-blue-600">
            Submit Time Log
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
