import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, History, BarChart3 } from "lucide-react";

interface TimeLoggingTabsProps {
  activeTimerContent: React.ReactNode;
  timeLogsContent: React.ReactNode;
  weeklySummaryContent: React.ReactNode;
}

export const TimeLoggingTabs = ({
  activeTimerContent,
  timeLogsContent,
  weeklySummaryContent,
}: TimeLoggingTabsProps) => {
  return (
    <Tabs defaultValue="active" className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-6">
        <TabsTrigger value="active" className="gap-2">
          <Clock className="w-4 h-4" />
          Active Timer
        </TabsTrigger>
        <TabsTrigger value="logs" className="gap-2">
          <History className="w-4 h-4" />
          Time Logs
        </TabsTrigger>
        <TabsTrigger value="summary" className="gap-2">
          <BarChart3 className="w-4 h-4" />
          Weekly Summary
        </TabsTrigger>
      </TabsList>

      <TabsContent value="active" className="mt-0">
        {activeTimerContent}
      </TabsContent>
      <TabsContent value="logs" className="mt-0">
        {timeLogsContent}
      </TabsContent>
      <TabsContent value="summary" className="mt-0">
        {weeklySummaryContent}
      </TabsContent>
    </Tabs>
  );
};
