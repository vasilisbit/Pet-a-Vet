"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Calendar,
  Download,
  Filter,
  PieChartIcon,
  BarChartIcon,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import {
  initializePerformanceMonitoring,
  markPerformanceEvent,
} from "@/utils/performance-monitoring";

// Professional color palette for veterinary clinic
const CHART_COLORS = {
  primary: "#2563EB", // Blue
  secondary: "#059669", // Green
  accent: "#DC2626", // Red
  warning: "#D97706", // Orange
  info: "#7C3AED", // Purple
  success: "#16A34A", // Dark Green
  neutral: "#6B7280", // Gray
};

const PIE_COLORS = [
  CHART_COLORS.primary,
  CHART_COLORS.secondary,
  CHART_COLORS.warning,
  CHART_COLORS.accent,
  CHART_COLORS.info,
  CHART_COLORS.success,
  CHART_COLORS.neutral,
];

// Legacy COLORS constant for backward compatibility
const COLORS = PIE_COLORS;

// Loading skeleton component
const ChartSkeleton = () => (
  <div className="h-[300px] w-full space-y-3">
    <Skeleton className="h-4 w-1/4" />
    <Skeleton className="h-[250px] w-full" />
  </div>
);

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState("last30days");
  const [species, setSpecies] = useState("all");
  const [reportType, setReportType] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Data states
  const [appointmentData, setAppointmentData] = useState<any>(null);
  const [diagnosisData, setDiagnosisData] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any>(null);
  const [demographicsData, setDemographicsData] = useState<any>(null);
  const [summaryStats, setSummaryStats] = useState<any>(null);

  // Initialize performance monitoring
  useEffect(() => {
    initializePerformanceMonitoring();
    markPerformanceEvent("reports-page-init");
  }, []);

  // Derived data for charts
  const subscriptionData = revenueData?.subscriptionData || [
    { name: "Basic Plan", value: 120, percentage: 35 },
    { name: "Premium Plan", value: 85, percentage: 25 },
    { name: "Enterprise Plan", value: 60, percentage: 18 },
    { name: "Trial", value: 75, percentage: 22 },
  ];

  // Make sure speciesData has the proper format for the PieChart
  const speciesData = (
    demographicsData?.speciesData || [
      { name: "Dogs", value: 456 },
      { name: "Cats", value: 298 },
      { name: "Birds", value: 87 },
      { name: "Other", value: 34 },
    ]
  ).map((item) => ({
    name: item.name || "Unknown",
    value: typeof item.value === "number" ? item.value : 0,
  }));

  // Debug log to check speciesData
  useEffect(() => {
    console.log("Species Data:", speciesData);
  }, [speciesData]);

  const fetchReportsData = useCallback(
    async (showRefreshing = false) => {
      try {
        markPerformanceEvent("reports-data-fetch-start");
        if (showRefreshing) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
        setError(null);

        const params = new URLSearchParams({
          type: reportType,
          dateRange,
          species,
        });

        const response = await fetch(`/api/reports?${params}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch reports: ${response.status}`);
        }

        const data = await response.json();

        if (reportType === "all") {
          setAppointmentData(data.appointments);
          setDiagnosisData(data.diagnoses);
          setRevenueData(data.revenue);
          setDemographicsData(data.demographics);
        } else {
          switch (reportType) {
            case "appointments":
              setAppointmentData(data);
              break;
            case "diagnoses":
              setDiagnosisData(data);
              break;
            case "revenue":
              setRevenueData(data);
              break;
            case "demographics":
              setDemographicsData(data);
              break;
          }
        }

        // Calculate summary stats
        if (data.appointments?.monthlyData) {
          const totalAppointments = data.appointments.monthlyData.reduce(
            (sum: number, item: any) => sum + item.appointments,
            0
          );
          const avgRevenue =
            data.revenue?.monthlyRevenue?.reduce(
              (sum: number, item: any) => sum + item.revenue,
              0
            ) / 12 || 0;
          setSummaryStats({
            totalAppointments,
            avgRevenue: Math.round(avgRevenue),
            totalPets:
              data.demographics?.speciesData?.reduce(
                (sum: number, item: any) => sum + item.value,
                0
              ) || 0,
          });
        }

        toast({
          title: "Data updated",
          description: "Reports data has been refreshed successfully.",
        });

        markPerformanceEvent("reports-data-fetch-complete");
      } catch (err) {
        console.error("Error fetching reports data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load reports data"
        );
        markPerformanceEvent("reports-data-fetch-error");
        toast({
          title: "Error",
          description: "Failed to load reports data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [dateRange, species, reportType]
  );

  // Initial data load and auto-refresh
  useEffect(() => {
    fetchReportsData();

    // Set up periodic refresh every 5 minutes
    const interval = setInterval(() => {
      if (!loading && !refreshing) {
        fetchReportsData(true);
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [fetchReportsData]);

  // Handle filter application
  const handleApplyFilters = () => {
    fetchReportsData(true);
  };

  // Handle manual refresh
  const handleRefresh = () => {
    fetchReportsData(true);
  };

  // Keyboard navigation handler
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key.toLowerCase()) {
          case "r":
            event.preventDefault();
            if (!loading && !refreshing) {
              handleRefresh();
            }
            break;
          case "e":
            event.preventDefault();
            if (!loading && !refreshing) {
              handleExport();
            }
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [loading, refreshing]);

  // Export functionality
  const handleExport = async () => {
    try {
      setRefreshing(true);

      // Prepare export data
      const exportData = {
        meta: {
          exportDate: new Date().toISOString(),
          dateRange,
          species,
          reportType,
        },
        summary: summaryStats,
        appointments: appointmentData,
        diagnoses: diagnosisData,
        revenue: revenueData,
        demographics: demographicsData,
      };

      // Create downloadable JSON file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);

      // Create download link
      const link = document.createElement("a");
      link.href = url;
      link.download = `veterinary-reports-${dateRange}-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Export completed",
        description: "Your report has been downloaded successfully.",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export failed",
        description: "Failed to export report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Reports & Analytics
            </h1>
            <p className="text-muted-foreground">
              Real-time insights and analytics for your veterinary practice
            </p>
          </div>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>

        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">
              Failed to Load Reports Data
            </h3>
            <p className="text-muted-foreground mb-4">
              We encountered an issue while loading your reports. This could be
              due to a network connection problem or server maintenance.
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => fetchReportsData()}
              disabled={loading || refreshing}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${
                  loading || refreshing ? "animate-spin" : ""
                }`}
              />
              {loading || refreshing ? "Retrying..." : "Retry Loading Data"}
            </Button>

            <Button variant="outline" onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground">
            Real-time insights and analytics for your veterinary practice
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            title="Refresh data (Ctrl+R)"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={loading || refreshing}
            title="Export reports (Ctrl+E)"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Appointments
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {summaryStats?.totalAppointments || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  for selected period
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Pets</CardTitle>
            <PieChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {summaryStats?.totalPets || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  registered in system
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Revenue
            </CardTitle>
            <BarChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  ${summaryStats?.avgRevenue?.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground">per month</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters Panel */}
        <div className="w-full lg:w-1/4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last7days">Last 7 days</SelectItem>
                    <SelectItem value="last30days">Last 30 days</SelectItem>
                    <SelectItem value="last90days">Last 90 days</SelectItem>
                    <SelectItem value="lastYear">Last year</SelectItem>
                    <SelectItem value="allTime">All time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Species</label>
                <Select value={species} onValueChange={setSpecies}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select species" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Species</SelectItem>
                    <SelectItem value="dogs">Dogs</SelectItem>
                    <SelectItem value="cats">Cats</SelectItem>
                    <SelectItem value="birds">Birds</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Report Focus</label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Reports</SelectItem>
                    <SelectItem value="appointments">Appointments</SelectItem>
                    <SelectItem value="diagnoses">Diagnoses</SelectItem>
                    <SelectItem value="revenue">Revenue</SelectItem>
                    <SelectItem value="demographics">Demographics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="w-full"
                onClick={handleApplyFilters}
                disabled={refreshing}
              >
                {refreshing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Applying...
                  </>
                ) : (
                  "Apply Filters"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="w-full lg:w-3/4">
          <Tabs defaultValue="appointments" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="appointments">Appointments</TabsTrigger>
              <TabsTrigger value="diagnoses">Diagnoses</TabsTrigger>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="demographics">Demographics</TabsTrigger>
            </TabsList>

            <TabsContent value="appointments" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Appointment Trends</CardTitle>
                  <CardDescription>
                    Number of appointments scheduled per month
                  </CardDescription>
                </CardHeader>
                <CardContent className="chart-container">
                  {loading ? (
                    <ChartSkeleton />
                  ) : (
                    <ChartContainer
                      config={{
                        appointments: {
                          label: "Appointments",
                          color: CHART_COLORS.primary,
                        },
                      }}
                      className="h-full w-full"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={appointmentData?.monthlyData || []}
                          role="img"
                          aria-label="Monthly appointment trends chart showing number of appointments per month"
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#E5E7EB"
                          />
                          <XAxis
                            dataKey="month"
                            tick={{ fontSize: 12 }}
                            axisLine={{ stroke: "#D1D5DB" }}
                          />
                          <YAxis
                            tick={{ fontSize: 12 }}
                            axisLine={{ stroke: "#D1D5DB" }}
                          />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="appointments"
                            stroke={CHART_COLORS.primary}
                            strokeWidth={3}
                            dot={{
                              fill: CHART_COLORS.primary,
                              strokeWidth: 2,
                              r: 4,
                            }}
                            activeDot={{
                              r: 6,
                              stroke: CHART_COLORS.primary,
                              strokeWidth: 2,
                            }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>

              <div className="reports-grid">
                <Card>
                  <CardHeader>
                    <CardTitle>Appointment Types</CardTitle>
                    <CardDescription>
                      Distribution of appointment types
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="chart-container">
                    {loading ? (
                      <ChartSkeleton />
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart
                          role="img"
                          aria-label="Appointment types distribution pie chart"
                        >
                          <Pie
                            data={appointmentData?.typeData || []}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) =>
                              `${name}: ${(percent * 100).toFixed(0)}%`
                            }
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {(appointmentData?.typeData || []).map(
                              (entry: any, index: number) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={PIE_COLORS[index % PIE_COLORS.length]}
                                />
                              )
                            )}
                          </Pie>
                          <Tooltip
                            formatter={(value) => [value, "Appointments"]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Appointment Analytics</CardTitle>
                    <CardDescription>
                      Key metrics about appointments
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                              Average Duration
                            </p>
                            <p className="text-2xl font-bold">
                              {appointmentData?.analytics?.avgDuration || 45}{" "}
                              min
                            </p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                              No-show Rate
                            </p>
                            <p className="text-2xl font-bold">
                              {typeof appointmentData?.analytics?.noShowRate ===
                              "number"
                                ? appointmentData.analytics.noShowRate.toFixed(
                                    1
                                  )
                                : appointmentData?.analytics?.noShowRate || 4.2}
                              %
                            </p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                              Busiest Day
                            </p>
                            <p className="text-2xl font-bold">
                              {appointmentData?.analytics?.busiestDay ||
                                "Monday"}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                              Busiest Time
                            </p>
                            <p className="text-2xl font-bold">
                              {appointmentData?.analytics?.busiestHour || 10}-
                              {(appointmentData?.analytics?.busiestHour || 10) +
                                1}{" "}
                              AM
                            </p>
                          </div>
                        </div>
                        <div className="pt-4 border-t">
                          <p className="text-sm text-muted-foreground mb-2">
                            Appointment Satisfaction
                          </p>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-green-600 h-2.5 rounded-full transition-all duration-500 progress-w-92" />
                          </div>
                          <p className="text-right text-sm mt-1">92%</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="diagnoses" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Common Diagnoses</CardTitle>
                  <CardDescription>
                    Most frequent diagnoses in your practice
                  </CardDescription>
                </CardHeader>
                <CardContent className="chart-container">
                  {loading ? (
                    <ChartSkeleton />
                  ) : (
                    <ChartContainer
                      config={{
                        value: {
                          label: "Cases",
                          color: CHART_COLORS.secondary,
                        },
                      }}
                      className="h-full w-full"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={diagnosisData?.diagnosisData || []}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#E5E7EB"
                          />
                          <XAxis
                            dataKey="name"
                            tick={{ fontSize: 12 }}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                          />
                          <YAxis tick={{ fontSize: 12 }} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Legend />
                          <Bar
                            dataKey="value"
                            fill={CHART_COLORS.secondary}
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>

              <div className="reports-grid">
                <Card>
                  <CardHeader>
                    <CardTitle>Treatment Effectiveness</CardTitle>
                    <CardDescription>
                      Success rates for common treatments
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="space-y-4">
                        {[...Array(4)].map((_, i) => (
                          <Skeleton key={i} className="h-12 w-full" />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {(
                          diagnosisData?.treatmentData || [
                            {
                              treatment: "Antibiotics for Infections",
                              effectiveness: 95,
                            },
                            {
                              treatment: "Anti-inflammatory for Joint Pain",
                              effectiveness: 88,
                            },
                            {
                              treatment: "Dietary Changes for Digestive Issues",
                              effectiveness: 78,
                            },
                            {
                              treatment:
                                "Topical Treatment for Skin Conditions",
                              effectiveness: 82,
                            },
                          ]
                        ).map((item: any, index: number) => (
                          <div key={index} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <p className="text-sm font-medium">
                                {item.treatment}
                              </p>
                              <p className="text-sm text-green-600">
                                {item.effectiveness}%
                              </p>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`bg-green-500 h-2 rounded-full transition-all duration-500 ${
                                  item.effectiveness >= 95
                                    ? "progress-w-95"
                                    : item.effectiveness >= 90
                                    ? "progress-w-92"
                                    : item.effectiveness >= 85
                                    ? "progress-w-88"
                                    : item.effectiveness >= 80
                                    ? "progress-w-82"
                                    : "progress-w-78"
                                }`}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Diagnosis Trends</CardTitle>
                    <CardDescription>
                      How diagnoses have changed over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="space-y-4">
                        {[...Array(4)].map((_, i) => (
                          <Skeleton key={i} className="h-10 w-full" />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {[
                          {
                            name: "Skin Conditions",
                            change: "+12%",
                            percentage: 65,
                            positive: true,
                          },
                          {
                            name: "Ear Infections",
                            change: "+5%",
                            percentage: 48,
                            positive: true,
                          },
                          {
                            name: "Digestive Issues",
                            change: "-3%",
                            percentage: 36,
                            positive: false,
                          },
                          {
                            name: "Respiratory Problems",
                            change: "+8%",
                            percentage: 28,
                            positive: true,
                          },
                        ].map((item, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <p className="text-sm font-medium">{item.name}</p>
                              <p
                                className={`text-sm ${
                                  item.positive
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {item.change}
                              </p>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`bg-teal-600 h-2 rounded-full transition-all duration-500 ${
                                  item.percentage >= 60
                                    ? "progress-w-65"
                                    : item.percentage >= 45
                                    ? "progress-w-48"
                                    : item.percentage >= 35
                                    ? "progress-w-36"
                                    : "progress-w-28"
                                }`}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="revenue" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Revenue</CardTitle>
                  <CardDescription>Revenue generated per month</CardDescription>
                </CardHeader>
                <CardContent className="chart-container">
                  {loading ? (
                    <ChartSkeleton />
                  ) : (
                    <ChartContainer
                      config={{
                        revenue: {
                          label: "Revenue ($)",
                          color: CHART_COLORS.warning,
                        },
                      }}
                      className="h-full w-full"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={revenueData?.monthlyRevenue || []}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#E5E7EB"
                          />
                          <XAxis
                            dataKey="month"
                            tick={{ fontSize: 12 }}
                            axisLine={{ stroke: "#D1D5DB" }}
                          />
                          <YAxis
                            tick={{ fontSize: 12 }}
                            axisLine={{ stroke: "#D1D5DB" }}
                          />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Legend />
                          <Bar
                            dataKey="revenue"
                            fill={CHART_COLORS.warning}
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>

              <div className="reports-grid">
                <Card>
                  <CardHeader>
                    <CardTitle>Subscription Plan Distribution</CardTitle>
                    <CardDescription>
                      Active subscriptions by plan type
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="chart-container">
                    {loading ? (
                      <ChartSkeleton />
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={subscriptionData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) =>
                              `${name}: ${(percent * 100).toFixed(0)}%`
                            }
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {subscriptionData.map(
                              (entry: any, index: number) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={PIE_COLORS[index % PIE_COLORS.length]}
                                />
                              )
                            )}
                          </Pie>
                          <Tooltip
                            formatter={(value) => [value, "Subscriptions"]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Revenue by Service Type</CardTitle>
                    <CardDescription>
                      Breakdown of revenue sources
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <p className="text-sm">Consultations</p>
                          <p className="text-sm">$82,500</p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full progress-w-40"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <p className="text-sm">Surgeries</p>
                          <p className="text-sm">$56,200</p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full progress-w-27"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <p className="text-sm">Medications</p>
                          <p className="text-sm">$38,900</p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full progress-w-19"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <p className="text-sm">Vaccinations</p>
                          <p className="text-sm">$27,700</p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full progress-w-14"></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="demographics" className="space-y-4">
              <div className="reports-grid">
                <Card>
                  <CardHeader>
                    <CardTitle>Pet Species Distribution</CardTitle>
                    <CardDescription>
                      Breakdown of pets by species
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="chart-container">
                    {loading ? (
                      <ChartSkeleton />
                    ) : (
                      <ChartContainer
                        config={{
                          value: {
                            label: "Number of Pets",
                            color: CHART_COLORS.primary,
                          },
                        }}
                        className="h-full w-full"
                      >
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={speciesData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) =>
                                `${name}: ${(percent * 100).toFixed(0)}%`
                              }
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {speciesData.map((entry: any, index: number) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={PIE_COLORS[index % PIE_COLORS.length]}
                                />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => [value, "Pets"]} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Age Distribution</CardTitle>
                    <CardDescription>Pets by age group</CardDescription>
                  </CardHeader>
                  <CardContent className="chart-container">
                    {loading ? (
                      <ChartSkeleton />
                    ) : (
                      <ChartContainer
                        config={{
                          count: {
                            label: "Number of Pets",
                            color: CHART_COLORS.info,
                          },
                        }}
                        className="h-full w-full"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={
                              demographicsData?.ageData || [
                                { age: "< 1 year", count: 45 },
                                { age: "1-3 years", count: 78 },
                                { age: "4-7 years", count: 92 },
                                { age: "8-12 years", count: 63 },
                                { age: "13+ years", count: 22 },
                              ]
                            }
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#E5E7EB"
                            />
                            <XAxis
                              dataKey="age"
                              tick={{ fontSize: 12 }}
                              axisLine={{ stroke: "#D1D5DB" }}
                            />
                            <YAxis
                              tick={{ fontSize: 12 }}
                              axisLine={{ stroke: "#D1D5DB" }}
                            />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Legend />
                            <Bar
                              dataKey="count"
                              fill={CHART_COLORS.info}
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Breed Distribution</CardTitle>
                  <CardDescription>
                    Most common dog and cat breeds
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="dogs" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="dogs">Dogs</TabsTrigger>
                      <TabsTrigger value="cats">Cats</TabsTrigger>
                    </TabsList>

                    <TabsContent value="dogs" className="pt-4">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <p className="text-sm">Labrador Retriever</p>
                            <p className="text-sm">18%</p>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-amber-500 h-2 rounded-full progress-w-18"></div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <p className="text-sm">German Shepherd</p>
                            <p className="text-sm">14%</p>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-amber-500 h-2 rounded-full progress-w-14"></div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <p className="text-sm">Golden Retriever</p>
                            <p className="text-sm">12%</p>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-amber-500 h-2 rounded-full progress-w-12"></div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <p className="text-sm">French Bulldog</p>
                            <p className="text-sm">9%</p>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-amber-500 h-2 rounded-full progress-w-9"></div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <p className="text-sm">Beagle</p>
                            <p className="text-sm">7%</p>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-amber-500 h-2 rounded-full progress-w-7"></div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="cats" className="pt-4">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <p className="text-sm">Domestic Shorthair</p>
                            <p className="text-sm">22%</p>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-amber-500 h-2 rounded-full progress-w-22"></div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <p className="text-sm">Maine Coon</p>
                            <p className="text-sm">15%</p>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-amber-500 h-2 rounded-full progress-w-15"></div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <p className="text-sm">Siamese</p>
                            <p className="text-sm">12%</p>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-amber-500 h-2 rounded-full progress-w-12"></div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <p className="text-sm">Persian</p>
                            <p className="text-sm">10%</p>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-amber-500 h-2 rounded-full progress-w-10"></div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <p className="text-sm">Ragdoll</p>
                            <p className="text-sm">8%</p>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-amber-500 h-2 rounded-full progress-w-8"></div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
