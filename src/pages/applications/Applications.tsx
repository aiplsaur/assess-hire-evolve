
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useSupabaseFetch } from "@/hooks/useSupabase";
import { JobApplication } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Building2, Clock, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

// Status badge colors
const getStatusColor = (status: string) => {
  const statusMap: Record<string, { bg: string; text: string }> = {
    applied: { bg: "bg-system-blue-100", text: "text-system-blue-600" },
    screening: { bg: "bg-system-yellow-100", text: "text-system-yellow-600" },
    assessment: { bg: "bg-system-purple-100", text: "text-system-purple-600" },
    interview_scheduled: { bg: "bg-system-orange-100", text: "text-system-orange-600" },
    interview_completed: { bg: "bg-system-teal-100", text: "text-system-teal-600" },
    offered: { bg: "bg-system-green-100", text: "text-system-green-600" },
    hired: { bg: "bg-system-green-200", text: "text-system-green-700" },
    rejected: { bg: "bg-system-red-100", text: "text-system-red-600" },
  };
  
  return statusMap[status] || { bg: "bg-system-gray-100", text: "text-system-gray-600" };
};

// Mock data for the dashboard
const mockApplications = [
  {
    id: "1",
    job_id: "j1",
    job: { title: "Frontend Developer", company: "Tech Solutions Inc." },
    status: "applied",
    applied_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    job_id: "j2",
    job: { title: "UX Designer", company: "Creative Minds" },
    status: "screening",
    applied_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    job_id: "j3",
    job: { title: "Product Manager", company: "Innovative Products" },
    status: "assessment",
    applied_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "4",
    job_id: "j4",
    job: { title: "Backend Developer", company: "Data Systems" },
    status: "interview_scheduled",
    applied_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "5",
    job_id: "j5",
    job: { title: "Marketing Specialist", company: "Brand Builders" },
    status: "rejected",
    applied_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const Applications: React.FC = () => {
  const { user } = useAuth();
  
  // This would use Supabase in a real application
  // const { data: applications, loading, error } = useSupabaseFetch<JobApplication>(
  //   'applications',
  //   {
  //     columns: '*, jobs(*)',
  //     filters: [{ column: 'candidate_id', value: user?.id }],
  //     orderBy: { column: 'updated_at', ascending: false }
  //   }
  // );

  // Using mock data for now
  const applications = mockApplications;
  const loading = false;
  const error = null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Applications</h1>
        <p className="text-muted-foreground">
          Track and manage your job applications
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Applications</CardTitle>
          <CardDescription>View all your submitted applications</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-4">Loading applications...</div>
          ) : error ? (
            <div className="p-4 text-red-500">Error loading applications</div>
          ) : applications && applications.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Position</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead>Last Update</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell>
                      <div className="font-medium">{application.job.title}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {application.job.company}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary"
                        className={cn(
                          "capitalize",
                          getStatusColor(application.status).bg,
                          getStatusColor(application.status).text
                        )}
                      >
                        {application.status.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span>{format(new Date(application.applied_at), "MMM d, yyyy")}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(application.updated_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center p-8 border border-dashed rounded-md">
              <p className="text-muted-foreground mb-4">You haven't applied to any jobs yet</p>
              <Button>Browse Open Positions</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Application Tips</CardTitle>
          <CardDescription>Improve your chances of getting hired</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-system-blue-50 border border-system-blue-100 rounded-md">
            <h3 className="font-medium text-system-blue-700 mb-2">Keep your profile updated</h3>
            <p className="text-system-blue-600 text-sm">Recruiters are more likely to consider candidates with complete profiles.</p>
          </div>
          <div className="p-4 bg-system-green-50 border border-system-green-100 rounded-md">
            <h3 className="font-medium text-system-green-700 mb-2">Prepare for assessments</h3>
            <p className="text-system-green-600 text-sm">Our assessment guide can help you prepare for technical and behavioral assessments.</p>
          </div>
          <div className="p-4 bg-system-purple-50 border border-system-purple-100 rounded-md">
            <h3 className="font-medium text-system-purple-700 mb-2">Follow up</h3>
            <p className="text-system-purple-600 text-sm">Send a thank you note after interviews to make a good impression.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Applications;
