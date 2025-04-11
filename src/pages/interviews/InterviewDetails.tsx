import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Video, 
  MapPin, 
  User, 
  Briefcase,
  Mail,
  FileText
} from "lucide-react";
import { format, isToday } from "date-fns";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { interviewService } from "@/services/interviewService";
import { useAuth } from "@/context/AuthContext";

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

const getStatusStyles = (status: string) => {
  switch (status) {
    case "scheduled":
      return "bg-system-blue-100 text-system-blue-600 border-system-blue-200";
    case "completed":
      return "bg-system-green-100 text-system-green-600 border-system-green-200";
    case "canceled":
      return "bg-system-red-100 text-system-red-500 border-system-red-200";
    case "rescheduled":
      return "bg-system-yellow-100 text-system-yellow-500 border-system-yellow-200";
    default:
      return "bg-system-gray-100 text-system-gray-600 border-system-gray-200";
  }
};

const getTypeStyles = (type: string) => {
  return type === "remote"
    ? "bg-system-blue-100 text-system-blue-600 border-system-blue-200"
    : "bg-system-green-100 text-system-green-600 border-system-green-200";
};

const InterviewDetails: React.FC = () => {
  const { interviewId } = useParams<{ interviewId: string }>();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [interview, setInterview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInterviewDetails = async () => {
      if (!interviewId) return;

      try {
        setLoading(true);
        const data = await interviewService.getInterviewById(interviewId);
        setInterview(data);
      } catch (err) {
        console.error("Error fetching interview details:", err);
        setError("Failed to load interview details. Please try again.");
        toast({
          title: "Error",
          description: "Failed to load interview details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInterviewDetails();
  }, [interviewId]);

  const handleReschedule = () => {
    navigate(`/interviews/${interviewId}/reschedule`);
  };

  const handleJoinCall = () => {
    if (interview?.meeting_link) {
      window.open(interview.meeting_link, "_blank");
    }
  };

  const handleSubmitFeedback = () => {
    navigate(`/interviews/${interviewId}/feedback`);
  };

  const handleCancel = async () => {
    if (!interviewId) return;

    try {
      await interviewService.updateInterviewStatus(interviewId, "canceled");
      toast({
        title: "Success",
        description: "Interview has been canceled",
      });
      
      // Refresh interview data
      const updatedInterview = await interviewService.getInterviewById(interviewId);
      setInterview(updatedInterview);
    } catch (err) {
      console.error("Error canceling interview:", err);
      toast({
        title: "Error",
        description: "Failed to cancel interview. Please try again.",
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

  if (error || !interview) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Interview Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The interview you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <Button 
          variant="default" 
          onClick={() => navigate("/interviews")}
          className="bg-system-blue-600 hover:bg-system-blue-700"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Interviews
        </Button>
      </div>
    );
  }

  // Process interview data for display
  const scheduledAt = new Date(interview.scheduled_at);
  const candidate = interview.applications?.profiles || { first_name: "Unknown", last_name: "Candidate" };
  const interviewer = interview.profiles || { first_name: "Unknown", last_name: "Interviewer" };
  const candidateName = `${candidate.first_name} ${candidate.last_name}`;
  const interviewerName = `${interviewer.first_name} ${interviewer.last_name}`;
  const job = interview.applications?.jobs || { title: "Unknown Position" };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/interviews")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Interview Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between">
                <div>
                  <CardTitle>Interview Information</CardTitle>
                  <CardDescription>
                    Details about the scheduled interview
                  </CardDescription>
                </div>
                <div className="flex items-center">
                  <Badge
                    variant="outline"
                    className={getStatusStyles(interview.status)}
                  >
                    {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Date</div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-system-blue-500" />
                    <span>
                      {isToday(scheduledAt)
                        ? "Today"
                        : format(scheduledAt, "EEEE, MMMM d, yyyy")}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Time</div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-system-blue-500" />
                    <span>
                      {format(scheduledAt, "h:mm a")} ({interview.duration_minutes} minutes)
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Type</div>
                    <Badge
                      variant="outline"
                      className={getTypeStyles(interview.type)}
                    >
                      {interview.type === "remote" ? "Remote Interview" : "Onsite Interview"}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      {interview.type === "remote" ? "Meeting Link" : "Location"}
                    </div>
                    <div className="flex items-center">
                      {interview.type === "remote" ? (
                        <>
                          <Video className="h-4 w-4 mr-2 text-system-blue-500" />
                          <a
                            href={interview.meeting_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-system-blue-600 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {interview.meeting_link}
                          </a>
                        </>
                      ) : (
                        <>
                          <MapPin className="h-4 w-4 mr-2 text-system-blue-500" />
                          <span>{interview.location || "No location specified"}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {interview.notes && (
                <div className="pt-4 border-t border-border">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Notes</div>
                    <div className="p-3 bg-muted rounded-md whitespace-pre-line">
                      {interview.notes}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Position Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <Briefcase className="h-10 w-10 text-system-blue-600 bg-system-blue-50 p-2 rounded-full" />
                <div>
                  <h3 className="text-xl font-semibold">{job.title}</h3>
                  {job.department && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-muted-foreground">{job.department}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Candidate</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-16 w-16 mb-2">
                  <AvatarImage
                    src={candidate.avatar_url}
                    alt={candidateName}
                  />
                  <AvatarFallback className="bg-system-blue-100 text-system-blue-600">
                    {getInitials(candidateName)}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-medium">{candidateName}</h3>
                {candidate.email && (
                  <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <Mail className="h-3 w-3" />
                    <a
                      href={`mailto:${candidate.email}`}
                      className="hover:underline"
                    >
                      {candidate.email}
                    </a>
                  </div>
                )}
              </div>
              
              <div className="mt-4 flex flex-col gap-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate(`/candidates/${candidate.id}`)}
                >
                  <User className="mr-2 h-4 w-4" />
                  View Profile
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate(`/applications/${interview.application_id}`)}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  View Application
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Interviewer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-16 w-16 mb-2">
                  <AvatarImage
                    src={interviewer.avatar_url}
                    alt={interviewerName}
                  />
                  <AvatarFallback className="bg-system-green-100 text-system-green-600">
                    {getInitials(interviewerName)}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-medium">{interviewerName}</h3>
                {interviewer.email && (
                  <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <Mail className="h-3 w-3" />
                    <a
                      href={`mailto:${interviewer.email}`}
                      className="hover:underline"
                    >
                      {interviewer.email}
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {(hasRole(["admin", "hr"]) || interview.interviewer_id === interviewer.id) && (
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  {interview.status === "scheduled" && (
                    <>
                      {interview.type === "remote" && interview.meeting_link && (
                        <Button 
                          className="w-full bg-system-blue-600 hover:bg-system-blue-700"
                          onClick={handleJoinCall}
                        >
                          <Video className="mr-2 h-4 w-4" />
                          Join Meeting
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={handleReschedule}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        Reschedule
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full text-system-red-600 hover:text-system-red-700"
                        onClick={handleCancel}
                      >
                        Cancel Interview
                      </Button>
                    </>
                  )}
                  
                  {interview.status === "completed" && !interview.feedback_submitted && (
                    <Button 
                      className="w-full bg-system-green-600 hover:bg-system-green-700"
                      onClick={handleSubmitFeedback}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Submit Feedback
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewDetails; 