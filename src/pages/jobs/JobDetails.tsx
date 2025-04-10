import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jobService } from "@/services/jobService";
import { JobPosting } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Building2, CalendarRange, MapPin, Users, Edit, UserPlus, Share, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { Spinner } from "@/components/ui/spinner";

const getJobTypeStyles = (type: "full-time" | "part-time" | "contract" | "remote") => {
  switch (type) {
    case "full-time":
      return "bg-system-blue-100 text-system-blue-600 border-system-blue-200";
    case "part-time":
      return "bg-system-green-100 text-system-green-600 border-system-green-200";
    case "contract":
      return "bg-system-yellow-100 text-system-yellow-500 border-system-yellow-200";
    case "remote":
      return "bg-system-blue-100 text-system-blue-600 border-system-blue-200";
    default:
      return "bg-system-gray-100 text-system-gray-600 border-system-gray-200";
  }
};

const getStatusStyles = (status: "draft" | "published" | "closed") => {
  switch (status) {
    case "draft":
      return "bg-system-gray-100 text-system-gray-600 border-system-gray-200";
    case "published":
      return "bg-system-green-100 text-system-green-600 border-system-green-200";
    case "closed":
      return "bg-system-red-100 text-system-red-500 border-system-red-200";
    default:
      return "bg-system-gray-100 text-system-gray-600 border-system-gray-200";
  }
};

const formatSalaryRange = (min?: number, max?: number) => {
  if (!min && !max) return "Not specified";
  if (min && !max) return `$${min.toLocaleString()}+`;
  if (!min && max) return `Up to $${max.toLocaleString()}`;
  return `$${min?.toLocaleString()} - $${max?.toLocaleString()}`;
};

const JobDetails: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const [job, setJob] = useState<JobPosting | null>(null);
  const [loading, setLoading] = useState(true);
  const [applicationStats, setApplicationStats] = useState<any>({});
  
  // Check if user can manage jobs (admin or HR)
  const canManageJobs = user && hasRole(["admin", "hr"]);
  
  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!jobId) return;
      
      try {
        setLoading(true);
        const jobData = await jobService.getJobById(jobId);
        setJob(jobData);
        
        // Fetch application statistics
        const stats = await jobService.getJobStatistics(jobId);
        setApplicationStats(stats);
      } catch (error) {
        console.error("Error fetching job details:", error);
        toast({
          title: "Error",
          description: "Failed to load job details. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobDetails();
  }, [jobId]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }
  
  if (!job) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Job Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The job you're looking for doesn't exist or has been removed.
        </p>
        <Button 
          variant="default" 
          onClick={() => navigate("/jobs")}
          className="bg-system-blue-600 hover:bg-system-blue-700"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Jobs
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/jobs")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{job.title}</h1>
            <p className="text-muted-foreground">
              {job.department} • {job.location}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {canManageJobs && (
            <Button 
              onClick={() => navigate(`/jobs/${job.id}/edit`)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" /> Edit Job
            </Button>
          )}
          
          {canManageJobs && (
            <Button 
              onClick={() => navigate(`/jobs/${job.id}/applicants`)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" /> View Applicants
            </Button>
          )}
          
          {hasRole(["candidate"]) && job.status === "published" && (
            <Button 
              onClick={() => navigate(`/jobs/${job.id}/apply`)}
              className="bg-system-blue-600 hover:bg-system-blue-700 flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" /> Apply Now
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-wrap justify-between gap-2">
                <CardTitle>Job Details</CardTitle>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant="outline"
                    className={getJobTypeStyles(job.type)}
                  >
                    {job.type.replace("-", " ")}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={getStatusStyles(job.status)}
                  >
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <Tabs defaultValue="description">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="responsibilities">Responsibilities</TabsTrigger>
                  <TabsTrigger value="requirements">Requirements</TabsTrigger>
                </TabsList>
                
                <TabsContent value="description" className="mt-4 text-sm whitespace-pre-line">
                  {job.description}
                </TabsContent>
                
                <TabsContent value="responsibilities" className="mt-4 text-sm whitespace-pre-line">
                  {job.responsibilities}
                </TabsContent>
                
                <TabsContent value="requirements" className="mt-4 text-sm whitespace-pre-line">
                  {job.requirements}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Job Summary</CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-[20px_1fr] gap-2 items-center">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Department</p>
                  <p className="text-sm text-muted-foreground">{job.department}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-[20px_1fr] gap-2 items-center">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Location</p>
                  <p className="text-sm text-muted-foreground">{job.location}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-[20px_1fr] gap-2 items-center">
                <CalendarRange className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Posted Date</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(job.created_at), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-[20px_1fr] gap-2 items-center">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Applications</p>
                  <p className="text-sm text-muted-foreground">
                    {applicationStats.total || 0} total applicants
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <p className="text-sm font-medium">Salary Range</p>
                <p className="text-sm text-muted-foreground">
                  {formatSalaryRange(job.salary_min, job.salary_max)}
                </p>
              </div>
            </CardContent>
            
            {hasRole(["candidate"]) && job.status === "published" && (
              <CardFooter className="flex justify-center pt-2">
                <Button 
                  onClick={() => navigate(`/jobs/${job.id}/apply`)}
                  className="w-full bg-system-blue-600 hover:bg-system-blue-700"
                >
                  Apply Now
                </Button>
              </CardFooter>
            )}
          </Card>
          
          {canManageJobs && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Application Stats</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {Object.entries(applicationStats)
                  .filter(([key]) => key !== 'total')
                  .map(([status, count]) => (
                    <div key={status} className="flex justify-between items-center">
                      <span className="text-sm capitalize">
                        {status.replace(/_/g, ' ')}
                      </span>
                      <Badge variant="outline">{count as number}</Badge>
                    </div>
                  ))}
              </CardContent>
            </Card>
          )}
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Share Job</CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <Button 
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast({
                    title: "Link copied",
                    description: "Job link copied to clipboard",
                  });
                }}
              >
                <Share className="h-4 w-4" />
                Copy Link
              </Button>
              
              <Button 
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => {
                  window.open(
                    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                      window.location.href
                    )}`,
                    "_blank"
                  );
                }}
              >
                <ExternalLink className="h-4 w-4" />
                Share on LinkedIn
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default JobDetails; 