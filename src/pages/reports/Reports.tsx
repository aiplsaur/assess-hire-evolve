
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";
import { format, subMonths } from "date-fns";

// Mock data for reports
const hiringOverviewData = [
  { name: "Jan", applications: 45, interviews: 22, hires: 5 },
  { name: "Feb", applications: 52, interviews: 30, hires: 8 },
  { name: "Mar", applications: 61, interviews: 35, hires: 10 },
  { name: "Apr", applications: 75, interviews: 42, hires: 12 },
  { name: "May", applications: 80, interviews: 48, hires: 15 },
  { name: "Jun", applications: 85, interviews: 52, hires: 18 },
];

const applicationSourceData = [
  { name: "LinkedIn", value: 35 },
  { name: "Company Website", value: 25 },
  { name: "Indeed", value: 15 },
  { name: "Referrals", value: 15 },
  { name: "Other", value: 10 },
];

const colors = ["#3b82f6", "#10b981", "#f97316", "#8b5cf6", "#6b7280"];

const timeToHireData = [
  { department: "Engineering", days: 28 },
  { department: "Design", days: 25 },
  { department: "Marketing", days: 21 },
  { department: "Sales", days: 18 },
  { department: "Product", days: 32 },
  { department: "HR", days: 15 },
];

const jobPositionData = [
  { position: "Frontend Developer", open: 12, filled: 8 },
  { position: "Backend Developer", open: 8, filled: 5 },
  { position: "UX Designer", open: 6, filled: 3 },
  { position: "Product Manager", open: 4, filled: 2 },
  { position: "Marketing Specialist", open: 5, filled: 4 },
];

const Reports: React.FC = () => {
  const [timeRange, setTimeRange] = useState<"30" | "90" | "180" | "365">("180");

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
                      data={hiringOverviewData}
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
                    <p className="text-2xl font-bold text-system-blue-600">398</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Interviews</p>
                    <p className="text-2xl font-bold text-system-green-600">229</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Hires</p>
                    <p className="text-2xl font-bold text-system-orange-500">68</p>
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
                        data={applicationSourceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {applicationSourceData.map((entry, index) => (
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
                  <p className="text-lg font-bold">LinkedIn (35%)</p>
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
                      data={timeToHireData}
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
                  <p className="text-lg font-bold">23 days</p>
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
                      data={jobPositionData}
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
                  <p className="text-lg font-bold">35 Open, 22 Filled</p>
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
