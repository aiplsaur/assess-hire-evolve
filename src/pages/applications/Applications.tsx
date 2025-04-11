import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
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
import { format, parseISO, isValid } from "date-fns";
import { Building2, Clock, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { applicationService } from "@/services";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

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

// Helper function to safely format dates
const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) {
    return 'No date';
  }
  
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) {
      return 'Invalid date';
    }
    return format(date, "MMM d, yyyy");
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

const Applications: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchApplications = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        setError(null);
        const applicationsData = await applicationService.getApplicationsByCandidate(user.id);
        setApplications(applicationsData);
      } catch (err) {
        console.error("Error fetching applications:", err);
        setError("Failed to load applications. Please try again.");
        toast({
          title: "Error",
          description: "Failed to load applications. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchApplications();
  }, [user?.id]);

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
            <div className="p-4 text-red-500">{error}</div>
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
                      <div className="font-medium">{application.jobs?.title || 'Unknown Position'}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {application.jobs?.department || 'Unknown'}
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
                        <span>{formatDate(application.applied_at)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatDate(application.updated_at)}
                    </TableCell>
                    <TableCell>
                      <Link to={`/applications/${application.id}`}>
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center p-8 border border-dashed rounded-md">
              <p className="text-muted-foreground mb-4">You haven't applied to any jobs yet</p>
              <Link to="/jobs">
                <Button>Browse Open Positions</Button>
              </Link>
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
