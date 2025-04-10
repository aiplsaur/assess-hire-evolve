import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";
import { format, subMonths } from "date-fns";
import { reportService } from "@/services";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";

// Default colors for charts
const colors = ["#3b82f6", "#10b981", "#f97316", "#8b5cf6", "#6b7280"];

const Reports: React.FC = () => {
  const [timeRange, setTimeRange] = useState<"30" | "90" | "180" | "365">("180");
  const [hiringData, setHiringData] = useState<any>({ monthlyData: [], totals: { applications: 0, interviews: 0, hires: 0 } });
  const [sourceData, setSourceData] = useState<any>([]);
  const [timeToHireData, setTimeToHireData] = useState<any>({ departmentData: [], overallAverage: 0 });
  const [jobPositionsData, setJobPositionsData] = useState<any>({ positionData: [], totals: { open: 0, filled: 0 } });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all report data in parallel
        const [hiringOverview, applicationSources, timeToHire, jobPositions] = await Promise.all([
          reportService.getHiringOverview(timeRange),
          reportService.getApplicationSources(timeRange),
          reportService.getTimeToHire(timeRange),
          reportService.getJobPositions()
        ]);
        
        setHiringData(hiringOverview);
        setSourceData(applicationSources);
        setTimeToHireData(timeToHire);
        setJobPositionsData(jobPositions);
      } catch (err) {
        console.error("Error fetching report data:", err);
        setError("Failed to load report data. Please try again.");
        toast({
          title: "Error",
          description: "Failed to load report data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchReportData();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <AlertCircle className="h-12 w-12 text-system-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Error Loading Reports</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
      </div>
    );
  }

  // Find the top source
  const topSource = sourceData.length > 0 
    ? `${sourceData[0].name} (${sourceData[0].value}%)`
    : 'None';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-muted-foreground">
          View insights and metrics for your hiring process
        </p>
      </div>

      <div className="flex justify-end">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Time period:</span>
          <select 
            className="px-2 py-1 rounded-md border border-input bg-background text-sm"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as "30" | "90" | "180" | "365")}
          >
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="180">Last 6 months</option>
            <option value="365">Last 12 months</option>
          </select>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="candidates">Candidates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Hiring Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={hiringData.monthlyData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="applications" fill="#3b82f6" name="Applications" />
                      <Bar dataKey="interviews" fill="#10b981" name="Interviews" />
                      <Bar dataKey="hires" fill="#f97316" name="Hires" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Applications</p>
                    <p className="text-2xl font-bold text-system-blue-600">{hiringData.totals.applications}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Interviews</p>
                    <p className="text-2xl font-bold text-system-green-600">{hiringData.totals.interviews}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Hires</p>
                    <p className="text-2xl font-bold text-system-orange-500">{hiringData.totals.hires}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Application Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sourceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {sourceData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, "Percentage"]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-sm text-muted-foreground">Most Effective Source</p>
                  <p className="text-lg font-bold">{topSource}</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Average Time to Hire by Department</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={timeToHireData.departmentData}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 70, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 'dataMax + 5']} />
                      <YAxis dataKey="department" type="category" width={70} />
                      <Tooltip formatter={(value) => [`${value} days`, "Time to Hire"]} />
                      <Bar dataKey="days" fill="#8b5cf6" name="Days" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-sm text-muted-foreground">Overall Average</p>
                  <p className="text-lg font-bold">{timeToHireData.overallAverage} days</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Job Positions: Open vs. Filled</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={jobPositionsData.positionData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="position" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="open" fill="#f97316" name="Open Positions" />
                      <Bar dataKey="filled" fill="#10b981" name="Filled Positions" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-sm text-muted-foreground">Total Positions</p>
                  <p className="text-lg font-bold">{jobPositionsData.totals.open} Open, {jobPositionsData.totals.filled} Filled</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="applications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Applications Report</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Detailed application metrics will be shown here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="jobs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Jobs Report</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Job performance metrics will be shown here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="candidates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Candidates Report</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Candidate metrics and analytics will be shown here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
