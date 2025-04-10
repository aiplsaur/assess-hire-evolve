import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jobService } from "@/services/jobService";
import { applicationService } from "@/services/applicationService";
import { useAuth } from "@/context/AuthContext";
import { JobPosting } from "@/types";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Calendar, 
  FileText, 
  User, 
  Mail 
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

interface Applicant {
  id: string;
  job_id: string;
  candidate_id: string;
  status: string;
  resume_url?: string;
  cover_letter?: string;
  applied_at: string;
  updated_at: string;
  profiles: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    avatar_url?: string;
  };
}

const JobApplicants: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const [job, setJob] = useState<JobPosting | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Check if user has permission to view applicants
  useEffect(() => {
    if (user && !hasRole(["admin", "hr", "interviewer"])) {
      toast({
        title: "Access Denied",
        description: "You do not have permission to view job applicants",
        variant: "destructive",
      });
      navigate("/jobs");
    }
  }, [user, hasRole, navigate]);

  // Fetch job and applicants data
  useEffect(() => {
    const fetchData = async () => {
      if (!jobId) return;
      
      try {
        setLoading(true);
        
        // Fetch job details
        const jobData = await jobService.getJobById(jobId);
        setJob(jobData);
        
        // Fetch applicants for this job
        const applicantsData = await applicationService.getApplicationsForJob(jobId);
        setApplicants(applicantsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Failed to load data",
          description: "Could not load the job and applicants details",
          variant: "destructive",
        });
        navigate("/jobs");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [jobId, navigate]);

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    setStatusUpdating(applicationId);
    try {
      await applicationService.updateApplicationStatus(applicationId, newStatus);
      
      // Update the applicant in the local state
      setApplicants(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: newStatus, updated_at: new Date().toISOString() } 
            : app
        )
      );
      
      toast({
        title: "Status updated",
        description: "The applicant status has been updated successfully",
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Failed to update status",
        description: "Could not update the applicant status",
        variant: "destructive",
      });
    } finally {
      setStatusUpdating(null);
    }
  };

  // Filter applicants based on search and status
  const filteredApplicants = applicants.filter(app => {
    const matchesSearch = searchQuery 
      ? `${app.profiles.first_name} ${app.profiles.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.profiles.email.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    
    const matchesStatus = statusFilter === "all" || !statusFilter 
      ? true
      : app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-system-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Button
            variant="ghost"
            className="mb-2 p-0 hover:bg-transparent"
            onClick={() => navigate("/jobs")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Button>
          <h1 className="text-2xl font-bold">{job?.title} - Applicants</h1>
          <p className="text-muted-foreground">
            Manage applicants for this position
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Input 
              placeholder="Search applicants..." 
              className="pl-8 w-full" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute left-2.5 top-2.5 text-muted-foreground">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path
                  fillRule="evenodd"
                  d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="applied">Applied</SelectItem>
              <SelectItem value="screening">Screening</SelectItem>
              <SelectItem value="assessment">Assessment</SelectItem>
              <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
              <SelectItem value="interview_completed">Interview Completed</SelectItem>
              <SelectItem value="offered">Offered</SelectItem>
              <SelectItem value="hired">Hired</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>{filteredApplicants.length} Applicants</CardTitle>
          <CardDescription>
            {job?.status === "published" ? "This job is currently open for applications" : 
             job?.status === "closed" ? "This job is closed to new applications" : 
             "This job is in draft mode and not visible to candidates"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredApplicants.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Update</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplicants.map((applicant) => (
                    <TableRow key={applicant.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage 
                              src={applicant.profiles.avatar_url || ""} 
                              alt={`${applicant.profiles.first_name} ${applicant.profiles.last_name}`} 
                            />
                            <AvatarFallback>
                              {applicant.profiles.first_name.charAt(0)}
                              {applicant.profiles.last_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {applicant.profiles.first_name} {applicant.profiles.last_name}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {applicant.profiles.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(applicant.applied_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            getStatusColor(applicant.status).bg,
                            getStatusColor(applicant.status).text,
                            "border-0"
                          )}
                        >
                          {applicant.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(applicant.updated_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 text-xs"
                            onClick={() => navigate(`/applications/${applicant.id}`)}
                          >
                            View
                          </Button>
                          <Select
                            value={applicant.status}
                            onValueChange={(value) => handleStatusChange(applicant.id, value)}
                            disabled={statusUpdating === applicant.id}
                          >
                            <SelectTrigger className="h-8 w-24 text-xs">
                              <SelectValue>
                                {statusUpdating === applicant.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  "Status"
                                )}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="applied">Applied</SelectItem>
                              <SelectItem value="screening">Screening</SelectItem>
                              <SelectItem value="assessment">Assessment</SelectItem>
                              <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
                              <SelectItem value="interview_completed">Interview Completed</SelectItem>
                              <SelectItem value="offered">Offered</SelectItem>
                              <SelectItem value="hired">Hired</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No applicants found</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery || statusFilter
                  ? "No applicants match your search criteria. Try adjusting your filters."
                  : "There are no applicants for this job yet."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default JobApplicants; 