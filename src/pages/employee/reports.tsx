import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  PieChart,
  Activity,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface ReportData {
  period: string;
  tasksCompleted: number;
  hoursWorked: number;
  servicesCompleted: number;
  projectsCompleted: number;
  averageCompletionTime: number;
  productivityScore: number;
}

interface PerformanceMetric {
  label: string;
  value: number;
  target: number;
  unit: string;
}

export default function EmployeeReports() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [reportPeriod, setReportPeriod] = useState('week');
  const [reportData, setReportData] = useState<ReportData | null>(null);

  const loadReportData = useCallback(async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const data = await employeeApi.getReports(reportPeriod);
      
      // Mock data for demonstration
      const mockData: ReportData = {
        period: reportPeriod,
        tasksCompleted: reportPeriod === 'week' ? 12 : reportPeriod === 'month' ? 48 : 156,
        hoursWorked: reportPeriod === 'week' ? 38 : reportPeriod === 'month' ? 160 : 520,
        servicesCompleted: reportPeriod === 'week' ? 8 : reportPeriod === 'month' ? 32 : 104,
        projectsCompleted: reportPeriod === 'week' ? 4 : reportPeriod === 'month' ? 16 : 52,
        averageCompletionTime: reportPeriod === 'week' ? 95 : reportPeriod === 'month' ? 92 : 90,
        productivityScore: reportPeriod === 'week' ? 88 : reportPeriod === 'month' ? 85 : 87,
      };

      setReportData(mockData);
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to load report data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [reportPeriod, toast]);

  useEffect(() => {
    loadReportData();
  }, [loadReportData]);

  const performanceMetrics: PerformanceMetric[] = [
    {
      label: 'Tasks Completed',
      value: reportData?.tasksCompleted || 0,
      target: reportPeriod === 'week' ? 15 : reportPeriod === 'month' ? 60 : 200,
      unit: 'tasks',
    },
    {
      label: 'Hours Worked',
      value: reportData?.hoursWorked || 0,
      target: reportPeriod === 'week' ? 40 : reportPeriod === 'month' ? 160 : 520,
      unit: 'hours',
    },
    {
      label: 'Completion Rate',
      value: reportData?.averageCompletionTime || 0,
      target: 100,
      unit: '%',
    },
    {
      label: 'Productivity Score',
      value: reportData?.productivityScore || 0,
      target: 90,
      unit: '%',
    },
  ];

  const handleExportReport = () => {
    toast({
      title: 'Export Started',
      description: 'Your report is being generated...',
    });
    // TODO: Implement actual export functionality
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-60" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link to="/employee/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Performance Reports</h1>
            <p className="text-muted-foreground mt-1">
              View your work statistics and performance metrics
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={reportPeriod} onValueChange={setReportPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExportReport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData?.tasksCompleted}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {reportPeriod === 'week' ? 'This week' : reportPeriod === 'month' ? 'This month' : 'This quarter'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours Worked</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData?.hoursWorked}h</div>
            <p className="text-xs text-muted-foreground mt-1">
              Avg {reportPeriod === 'week' ? '7.6h/day' : reportPeriod === 'month' ? '8h/day' : '8.1h/day'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Services Done</CardTitle>
            <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData?.servicesCompleted}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Service appointments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projects Done</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData?.projectsCompleted}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Modification projects
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance Metrics
          </CardTitle>
          <CardDescription>
            Your performance compared to targets
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {performanceMetrics.map((metric) => (
            <div key={metric.label} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{metric.label}</p>
                  <p className="text-xs text-muted-foreground">
                    Target: {metric.target} {metric.unit}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">
                    {metric.value}
                    <span className="text-sm font-normal text-muted-foreground ml-1">
                      {metric.unit}
                    </span>
                  </p>
                  <p className={`text-xs ${
                    metric.value >= metric.target ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    {((metric.value / metric.target) * 100).toFixed(0)}% of target
                  </p>
                </div>
              </div>
              <Progress
                value={(metric.value / metric.target) * 100}
                className="h-2"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Detailed Reports Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Task Breakdown</TabsTrigger>
          <TabsTrigger value="time">Time Analysis</TabsTrigger>
          <TabsTrigger value="quality">Quality Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Work Summary</CardTitle>
              <CardDescription>
                Overview of your work for the selected period
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Completed Work
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Services:</span>
                      <span className="font-medium">{reportData?.servicesCompleted}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Projects:</span>
                      <span className="font-medium">{reportData?.projectsCompleted}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Tasks:</span>
                      <span className="font-medium">{reportData?.tasksCompleted}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    Time Statistics
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Hours:</span>
                      <span className="font-medium">{reportData?.hoursWorked}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg per Task:</span>
                      <span className="font-medium">
                        {reportData?.hoursWorked && reportData?.tasksCompleted
                          ? (reportData.hoursWorked / reportData.tasksCompleted).toFixed(1)
                          : 0}h
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Efficiency:</span>
                      <span className="font-medium">{reportData?.averageCompletionTime}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                  Productivity Score
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Overall Score</span>
                    <span className="text-2xl font-bold">{reportData?.productivityScore}%</span>
                  </div>
                  <Progress value={reportData?.productivityScore} className="h-3" />
                  <p className="text-xs text-muted-foreground">
                    {reportData && reportData.productivityScore >= 90
                      ? 'Excellent performance! Keep up the great work.'
                      : reportData && reportData.productivityScore >= 75
                      ? 'Good performance. Room for improvement.'
                      : 'Consider reviewing your workflow efficiency.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Task Breakdown</CardTitle>
              <CardDescription>
                Distribution of your completed tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      Services
                    </span>
                    <span className="font-medium">
                      {reportData?.servicesCompleted} (
                      {reportData?.tasksCompleted
                        ? ((reportData.servicesCompleted / reportData.tasksCompleted) * 100).toFixed(0)
                        : 0}%)
                    </span>
                  </div>
                  <Progress
                    value={
                      reportData?.tasksCompleted
                        ? (reportData.servicesCompleted / reportData.tasksCompleted) * 100
                        : 0
                    }
                    className="h-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500" />
                      Projects
                    </span>
                    <span className="font-medium">
                      {reportData?.projectsCompleted} (
                      {reportData?.tasksCompleted
                        ? ((reportData.projectsCompleted / reportData.tasksCompleted) * 100).toFixed(0)
                        : 0}%)
                    </span>
                  </div>
                  <Progress
                    value={
                      reportData?.tasksCompleted
                        ? (reportData.projectsCompleted / reportData.tasksCompleted) * 100
                        : 0
                    }
                    className="h-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Time Analysis</CardTitle>
              <CardDescription>
                How you spend your work hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Time Distribution</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Service Work:</span>
                        <span className="font-medium">
                          {reportData?.hoursWorked
                            ? ((reportData.hoursWorked * 0.65)).toFixed(1)
                            : 0}h (65%)
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Project Work:</span>
                        <span className="font-medium">
                          {reportData?.hoursWorked
                            ? ((reportData.hoursWorked * 0.35)).toFixed(1)
                            : 0}h (35%)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Efficiency Metrics</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">On-Time Completion:</span>
                        <span className="font-medium text-green-600">
                          {reportData?.averageCompletionTime}%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Avg Task Duration:</span>
                        <span className="font-medium">
                          {reportData?.hoursWorked && reportData?.tasksCompleted
                            ? ((reportData.hoursWorked / reportData.tasksCompleted) * 60).toFixed(0)
                            : 0} min
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quality Metrics</CardTitle>
              <CardDescription>
                Quality and accuracy of your work
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Work Quality Score</p>
                    <p className="text-sm text-muted-foreground">Based on customer feedback</p>
                  </div>
                  <div className="text-2xl font-bold text-green-600">4.8/5</div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">First-Time Fix Rate</p>
                    <p className="text-sm text-muted-foreground">Tasks completed without rework</p>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">92%</div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Customer Satisfaction</p>
                    <p className="text-sm text-muted-foreground">Average rating from customers</p>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">94%</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Export Reports
          </CardTitle>
          <CardDescription>
            Download your performance reports in various formats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportReport}>
              <Download className="mr-2 h-4 w-4" />
              Export as PDF
            </Button>
            <Button variant="outline" onClick={handleExportReport}>
              <Download className="mr-2 h-4 w-4" />
              Export as Excel
            </Button>
            <Button variant="outline" onClick={handleExportReport}>
              <Download className="mr-2 h-4 w-4" />
              Export as CSV
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
