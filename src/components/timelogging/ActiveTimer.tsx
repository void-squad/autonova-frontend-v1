import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pause, Play } from "lucide-react";
import { ActiveTimerData } from "@/types/timeLogging";

interface ActiveTimerProps {
  timer: ActiveTimerData | null;
  onStop: () => void;
}

export const ActiveTimer = ({ timer, onStop }: ActiveTimerProps) => {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (!timer) return;

    // Calculate initial elapsed time
    const startTime = new Date(timer.startedAt).getTime();
    const now = Date.now();
    setElapsedTime(Math.floor((now - startTime) / 1000));

    // Update every second
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  if (!timer) return null;

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(
      2,
      "0"
    )}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <Card className="p-6 mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 rounded-full p-3 animate-pulse">
            <Play className="w-5 h-5 text-white" fill="white" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-blue-600">Active</Badge>
              <span className="text-sm text-gray-600">
                {timer.taskName} - {timer.projectTitle}
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-900 font-mono">
              {formatTime(elapsedTime)}
            </div>
          </div>
        </div>
        <Button
          onClick={onStop}
          variant="destructive"
          size="lg"
          className="gap-2"
        >
          <Pause className="w-5 h-5" />
          Stop Timer
        </Button>
      </div>
    </Card>
  );
};
