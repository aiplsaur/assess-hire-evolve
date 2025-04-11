import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { candidateService } from "@/services/candidateService";
import { applicationService } from "@/services/applicationService";
import { interviewService } from "@/services/interviewService";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  FileText, 
  BookOpen,
  CalendarClock,
  ClipboardList,
  Edit,
  User,
  Briefcase
} from "lucide-react";
import { format } from "date-fns";
import { Spinner } from "@/components/ui/spinner";
import { ApplicationStatus } from "@/types";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

// Helper functions
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

const getStatusStyles = (status: ApplicationStatus) => {
  switch (status) {
    case "applied":
      return "bg-system-blue-100 text-system-blue-600 border-system-blue-200";
    case "screening":
      return "bg-system-yellow-100 text-system-yellow-500 border-system-yellow-200";
    case "assessment":
      return "bg-system-blue-100 text-system-blue-600 border-system-blue-200";
    case "interview_scheduled":
      return "bg-system-blue-100 text-system-blue-600 border-system-blue-200";
    case "interview_completed":
      return "bg-system-blue-100 text-system-blue-600 border-system-blue-200";
    case "offered":
      return "bg-system-green-100 text-system-green-600 border-system-green-200";
    case "hired":
      return "bg-system-green-100 text-system-green-600 border-system-green-200";
    case "rejected":
      return "bg-system-red-100 text-system-red-500 border-system-red-200";
    default:
      return "bg-system-gray-100 text-system-gray-600 border-system-gray-200";
  }
};

const getStatusLabel = (status: ApplicationStatus) => {
  switch (status) {
    case "applied":
      return "Applied";
    case "screening":
      return "Screening";
    case "assessment":
      return "Assessment";
    case "interview_scheduled":
      return "Interview Scheduled";
    case "interview_completed":
      return "Interview Completed";
    case "offered":
      return "Offered";
    case "hired":
      return "Hired";
    case "rejected":
      return "Rejected";
    default:
      return status;
  }
};

// Types
interface Candidate {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  location: string;
  headline: string;
  bio: string;
  avatar_url?: string;
  applications: Application[];
  created_at: string;
  updated_at: string;
}

interface Application {
  id: string;
  status: ApplicationStatus;
  applied_at: string;
  updated_at: string;
  resume_url?: string;
  cover_letter?: string;
  notes?: string;
  jobs: {
    id: string;
    title: string;
    department: string;
    location: string;
  };
  interviews?: Interview[];
  assessment_assignments?: AssessmentAssignment[];
}

interface Interview {
  id: string;
  status: 'scheduled' | 'completed' | 'canceled' | 'rescheduled';
  scheduled_at: string;
  duration_minutes: number;
  location?: string;
  meeting_link?: string;
  notes?: string;
  profiles: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

interface AssessmentAssignment {
  id: string;
  status: string;
  score?: number;
  assessments: {
    id: string;
    title: string;
    description: string;
    type: string;
  };
}

const CandidateDetails: React.FC = () => {
  const { candidateId } = useParams<{ candidateId: string }>();
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [resumeUrls, setResumeUrls] = useState<Record<string, string>>({});
  
  useEffect(() => {
    const fetchCandidateDetails = async () => {
      if (!candidateId) return;
      
      try {
        setLoading(true);
        const data = await candidateService.getCandidateById(candidateId);
        setCandidate(data);
        setApplications(data.applications);
        setInterviews(data.applications.flatMap(app => app.interviews || []));
      } catch (error) {
        console.error("Error fetching candidate details:", error);
        toast({
          title: "Error",
          description: "Failed to load candidate details. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchCandidateDetails();
  }, [candidateId]);
  
  const handleScheduleInterview = (applicationId: string) => {
    navigate(`/candidates/${candidateId}/interview?applicationId=${applicationId}`);
  };
  
  const handleEditCandidate = () => {
    navigate(`/candidates/${candidateId}/edit`);
  };
  
  // Function to get a temporary URL for the resume
  const getResumeUrl = async (path: string) => {
    try {
      // If it's already a full URL, return it
      if (path.startsWith('http')) {
        return path;
      }
      
      // Otherwise, get a signed URL from Supabase
      const { data, error } = await supabase.storage
        .from('resumes')
        .createSignedUrl(path, 60); // URL valid for 60 seconds
      
      if (error) {
        console.error("Error getting resume URL:", error);
        return null;
      }
      
      return data.signedUrl;
    } catch (err) {
      console.error("Error generating resume URL:", err);
      return null;
    }
  };

  // Handle viewing a resume
  const handleViewResume = async (e: React.MouseEvent, resumePath: string) => {
    e.stopPropagation();
    
    try {
      // Check if we already have a signed URL for this resume
      if (resumeUrls[resumePath]) {
        window.open(resumeUrls[resumePath], '_blank');
        return;
      }
      
      // Get a new signed URL
      const signedUrl = await getResumeUrl(resumePath);
      if (signedUrl) {
        // Store the signed URL for future use
        setResumeUrls(prev => ({
          ...prev,
          [resumePath]: signedUrl
        }));
        window.open(signedUrl, '_blank');
      } else {
        toast({
          title: "Error",
          description: "Unable to access the resume file.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error viewing resume:", error);
      toast({
        title: "Error",
        description: "Failed to open the resume file.",
        variant: "destructive",
      });
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }
  
  if (!candidate) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Candidate Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The candidate you're looking for doesn't exist or has been removed.
        </p>
        <Button 
          variant="default" 
          onClick={() => navigate("/candidates")}
          className="bg-system-blue-600 hover:bg-system-blue-700"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Candidates
        </Button>
      </div>
    );
  }
  
  const sortedApplications = [...applications].sort(
    (a, b) => new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime()
  );
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/candidates")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{candidate.first_name} {candidate.last_name}</h1>
            <p className="text-muted-foreground">
              {candidate.headline || "Candidate"}
            </p>
          </div>
        </div>
        
        {hasRole(["admin", "hr"]) && (
          <Button
            variant="outline"
            onClick={handleEditCandidate}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" /> Edit Candidate
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={candidate.avatar_url} alt={`${candidate.first_name} ${candidate.last_name}`} />
                  <AvatarFallback className="bg-system-blue-100 text-system-blue-600">
                    {getInitials(`${candidate.first_name} ${candidate.last_name}`)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{candidate.first_name} {candidate.last_name}</CardTitle>
                  <CardDescription>{candidate.headline || "Candidate"}</CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-[20px_1fr] gap-2 items-start">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground break-all">{candidate.email}</p>
                </div>
              </div>
              
              {candidate.phone && (
                <div className="grid grid-cols-[20px_1fr] gap-2 items-start">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">{candidate.phone}</p>
                  </div>
                </div>
              )}
              
              {candidate.location && (
                <div className="grid grid-cols-[20px_1fr] gap-2 items-start">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">{candidate.location}</p>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-[20px_1fr] gap-2 items-start">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Joined</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(candidate.created_at), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {candidate.bio && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" /> Bio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-line">{candidate.bio}</p>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="md:col-span-2 space-y-6">
          <Tabs defaultValue="applications">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="applications" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" /> Applications
              </TabsTrigger>
              <TabsTrigger value="interviews" className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4" /> Interviews
              </TabsTrigger>
              <TabsTrigger value="assessments" className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4" /> Assessments
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="applications" className="space-y-4 pt-4">
              {sortedApplications.length > 0 ? (
                sortedApplications.map((application) => (
                  <Card key={application.id} className="overflow-hidden">
                    <CardHeader className="pb-3 bg-muted/30">
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <div>
                          <CardTitle className="text-lg">{application.jobs.title}</CardTitle>
                          <CardDescription>
                            {application.jobs.department} • {application.jobs.location}
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className={getStatusStyles(application.status)}>
                          {getStatusLabel(application.status)}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-4 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium">Applied on</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(application.applied_at), "MMM d, yyyy")}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Last updated</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(application.updated_at), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                      
                      {application.notes && (
                        <div>
                          <p className="text-sm font-medium">Notes</p>
                          <p className="text-sm text-muted-foreground mt-1">{application.notes}</p>
                        </div>
                      )}
                    </CardContent>
                    
                    <CardFooter className="bg-muted/30 flex flex-wrap gap-2 justify-end">
                      {application.resume_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => handleViewResume(e, application.resume_url)}
                          className="h-8 text-xs"
                        >
                          <FileText className="h-3 w-3 mr-1" /> Resume
                        </Button>
                      )}
                      
                      {hasRole(["admin", "hr", "interviewer"]) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleScheduleInterview(application.id)}
                          className="h-8 text-xs"
                        >
                          <CalendarClock className="h-3 w-3 mr-1" /> Schedule Interview
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/jobs/${application.jobs.id}`)}
                        className="h-8 text-xs"
                      >
                        <Briefcase className="h-3 w-3 mr-1" /> View Job
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12 bg-muted/20 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">No Applications</h3>
                  <p className="text-muted-foreground mb-6">
                    This candidate hasn't applied to any positions yet.
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="interviews" className="space-y-4 pt-4">
              {sortedApplications.some(app => app.interviews && app.interviews.length > 0) ? (
                sortedApplications.flatMap(app => 
                  (app.interviews || []).map(interview => (
                    <Card key={interview.id}>
                      <CardHeader className="pb-3 bg-muted/30">
                        <div className="flex justify-between items-start flex-wrap gap-2">
                          <div>
                            <CardTitle className="text-lg">{app.jobs.title}</CardTitle>
                            <CardDescription>
                              Interviewer: {interview.profiles.first_name} {interview.profiles.last_name}
                            </CardDescription>
                          </div>
                          <Badge variant="outline" className={
                            interview.status === 'completed' 
                              ? "bg-system-green-100 text-system-green-600 border-system-green-200"
                              : interview.status === 'canceled'
                                ? "bg-system-red-100 text-system-red-500 border-system-red-200"
                                : "bg-system-blue-100 text-system-blue-600 border-system-blue-200"
                          }>
                            {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium">Date & Time</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(interview.scheduled_at), "MMM d, yyyy 'at' h:mm a")}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Duration</p>
                            <p className="text-sm text-muted-foreground">
                              {interview.duration_minutes} minutes
                            </p>
                          </div>
                        </div>
                        
                        {interview.location && (
                          <div>
                            <p className="text-sm font-medium">Location</p>
                            <p className="text-sm text-muted-foreground">{interview.location}</p>
                          </div>
                        )}
                        
                        {interview.meeting_link && (
                          <div>
                            <p className="text-sm font-medium">Meeting Link</p>
                            <a 
                              href={interview.meeting_link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-system-blue-600 hover:underline break-all"
                            >
                              {interview.meeting_link}
                            </a>
                          </div>
                        )}
                        
                        {interview.notes && (
                          <div>
                            <p className="text-sm font-medium">Notes</p>
                            <p className="text-sm text-muted-foreground mt-1">{interview.notes}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )
              ) : (
                <div className="text-center py-12 bg-muted/20 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">No Interviews</h3>
                  <p className="text-muted-foreground mb-6">
                    This candidate doesn't have any scheduled interviews.
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="assessments" className="space-y-4 pt-4">
              {sortedApplications.some(app => app.assessment_assignments && app.assessment_assignments.length > 0) ? (
                sortedApplications.flatMap(app => 
                  (app.assessment_assignments || []).map(assessment => (
                    <Card key={assessment.id}>
                      <CardHeader className="pb-3 bg-muted/30">
                        <div className="flex justify-between items-start flex-wrap gap-2">
                          <div>
                            <CardTitle className="text-lg">{assessment.assessments.title}</CardTitle>
                            <CardDescription>
                              {app.jobs.title} - {assessment.assessments.type}
                            </CardDescription>
                          </div>
                          <Badge variant="outline" className={
                            assessment.status === 'completed' 
                              ? "bg-system-green-100 text-system-green-600 border-system-green-200"
                              : assessment.status === 'failed'
                                ? "bg-system-red-100 text-system-red-500 border-system-red-200"
                                : "bg-system-blue-100 text-system-blue-600 border-system-blue-200"
                          }>
                            {assessment.status.charAt(0).toUpperCase() + assessment.status.slice(1)}
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-4 space-y-4">
                        <div>
                          <p className="text-sm font-medium">Description</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {assessment.assessments.description}
                          </p>
                        </div>
                        
                        {assessment.score !== undefined && (
                          <div>
                            <p className="text-sm font-medium">Score</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {assessment.score}/100
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )
              ) : (
                <div className="text-center py-12 bg-muted/20 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">No Assessments</h3>
                  <p className="text-muted-foreground mb-6">
                    This candidate hasn't been assigned any assessments.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetails; 