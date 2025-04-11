import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { applicationService } from "@/services/applicationService";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Building2, 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  Mail,
  MapPin,
  Briefcase,
  AlertCircle
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { format, parseISO, isValid } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/services/supabase";

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

const ApplicationDetail = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [resumeError, setResumeError] = useState<boolean>(false);

  // Function to get a temporary URL for the resume
  const getResumeUrl = async (path: string) => {
    try {
      setResumeError(false);
      
      // If it's already a full URL, return it
      if (path.startsWith('http')) {
        setResumeUrl(path);
        return;
      }
      
      // Otherwise, get a signed URL from Supabase
      const { data, error } = await supabase.storage
        .from('resumes')
        .createSignedUrl(path, 60); // URL valid for 60 seconds
      
      if (error) {
        console.error("Error getting resume URL:", error);
        setResumeError(true);
        return;
      }
      
      setResumeUrl(data.signedUrl);
    } catch (err) {
      console.error("Error generating resume URL:", err);
      setResumeError(true);
    }
  };

  useEffect(() => {
    const fetchApplicationDetails = async () => {
      if (!applicationId) return;
      
      try {
        setLoading(true);
        const applicationData = await applicationService.getApplicationDetails(applicationId);
        
        // Check if the user is authorized to view this application
        if (user?.id !== applicationData.candidate_id && !['admin', 'hr', 'interviewer'].includes(user?.role || '')) {
          toast({
            title: "Access Denied",
            description: "You do not have permission to view this application",
            variant: "destructive",
          });
          navigate("/applications");
          return;
        }
        
        setApplication(applicationData);
        
        // If there's a resume, get its URL
        if (applicationData.resume_url) {
          getResumeUrl(applicationData.resume_url);
        }
      } catch (err) {
        console.error("Error fetching application details:", err);
        setError("Failed to load application details. Please try again.");
        toast({
          title: "Error",
          description: "Failed to load application details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchApplicationDetails();
  }, [applicationId, user?.id, user?.role, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Application Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The application you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <Button 
          variant="default" 
          onClick={() => navigate("/applications")}
          className="bg-system-blue-600 hover:bg-system-blue-700"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Applications
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/applications")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Application Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
              <CardDescription>Information about the position</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <Briefcase className="h-10 w-10 text-system-blue-600 bg-system-blue-50 p-2 rounded-full" />
                <div>
                  <h3 className="text-xl font-semibold">{application.jobs?.title || 'Unknown Position'}</h3>
                  <div className="flex flex-col gap-2 mt-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{application.jobs?.department || 'Unknown Department'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{application.jobs?.location || 'Unknown Location'}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {application.jobs?.description && (
                <div className="mt-4 border-t pt-4">
                  <h4 className="font-medium mb-2">Job Description</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {application.jobs.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {application.cover_letter && (
            <Card>
              <CardHeader>
                <CardTitle>Cover Letter</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-line text-sm">
                  {application.cover_letter}
                </div>
              </CardContent>
            </Card>
          )}

          {application.resume_url && (
            <Card>
              <CardHeader>
                <CardTitle>Resume</CardTitle>
              </CardHeader>
              <CardContent>
                {resumeError ? (
                  <div className="flex items-center gap-2 text-system-red-600">
                    <AlertCircle className="h-5 w-5" />
                    <span>Unable to access resume file</span>
                  </div>
                ) : resumeUrl ? (
                  <a 
                    href={resumeUrl}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-system-blue-600 hover:text-system-blue-700"
                  >
                    <FileText className="h-5 w-5" />
                    <span>View Resume</span>
                  </a>
                ) : (
                  <div className="flex items-center gap-2">
                    <Spinner className="h-4 w-4" />
                    <span>Loading resume...</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {application.assessment_assignments && application.assessment_assignments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Assessments</CardTitle>
                <CardDescription>Assigned assessments for this application</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {application.assessment_assignments.map((assignment: any) => (
                    <li key={assignment.id} className="border rounded-md p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{assignment.assessments?.title || 'Unknown Assessment'}</h4>
                          <p className="text-sm text-muted-foreground">{assignment.assessments?.description || 'No description'}</p>
                        </div>
                        <Badge 
                          variant="secondary"
                          className={cn(
                            "capitalize",
                            assignment.status === 'completed' ? 'bg-system-green-100 text-system-green-600' :
                            assignment.status === 'in_progress' ? 'bg-system-orange-100 text-system-orange-600' :
                            'bg-system-gray-100 text-system-gray-600'
                          )}
                        >
                          {assignment.status.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      {assignment.score !== null && (
                        <div className="mt-2 text-sm">
                          <span className="font-medium">Score:</span> {assignment.score}%
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {application.interviews && application.interviews.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Interviews</CardTitle>
                <CardDescription>Scheduled interviews for this application</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {application.interviews.map((interview: any) => (
                    <li key={interview.id} className="border rounded-md p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">Interview with {interview.profiles?.first_name} {interview.profiles?.last_name}</h4>
                          {interview.scheduled_at && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(interview.scheduled_at)}
                            </p>
                          )}
                        </div>
                        <Badge 
                          variant="secondary"
                          className={cn(
                            "capitalize",
                            interview.status === 'completed' ? 'bg-system-green-100 text-system-green-600' :
                            interview.status === 'scheduled' ? 'bg-system-blue-100 text-system-blue-600' :
                            interview.status === 'cancelled' ? 'bg-system-red-100 text-system-red-600' :
                            'bg-system-gray-100 text-system-gray-600'
                          )}
                        >
                          {interview.status.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Application Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <Badge 
                  className={cn(
                    "text-md py-2 px-4",
                    getStatusColor(application.status).bg,
                    getStatusColor(application.status).text
                  )}
                >
                  {application.status.replace(/_/g, ' ')}
                </Badge>
              </div>
              
              <div className="pt-4 border-t">
                <div className="text-sm mb-3">
                  <span className="font-medium">Applied On:</span> {formatDate(application.applied_at)}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Last Updated:</span> {formatDate(application.updated_at)}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Candidate Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full bg-system-gray-100 flex items-center justify-center mb-2">
                  {application.profiles?.avatar_url ? (
                    <img 
                      src={application.profiles.avatar_url} 
                      alt={`${application.profiles.first_name} ${application.profiles.last_name}`}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <h3 className="font-medium">
                  {application.profiles?.first_name} {application.profiles?.last_name}
                </h3>
                <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <Mail className="h-3 w-3" />
                  {application.profiles?.email}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {user?.role === 'admin' || user?.role === 'hr' ? (
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate(`/candidates/${application.candidate_id}`)}
                  >
                    <User className="mr-2 h-4 w-4" />
                    View Candidate Profile
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate(`/jobs/${application.job_id}/applicants`)}
                  >
                    <Briefcase className="mr-2 h-4 w-4" />
                    View All Applicants
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetail; 