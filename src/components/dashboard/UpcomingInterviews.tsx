import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Video } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { applicationService } from "@/services";

// Updated interface to match the actual API response structures from getInterviewsByApplication and getAllInterviews
interface Interview {
  id: string;
  application_id?: string;
  applications?: {
    id: string;
    profiles?: {
      id: string;
      first_name: string;
      last_name: string;
      email?: string;
      avatar_url?: string;
    };
    jobs?: {
      id: string;
      title: string;
      department?: string;
    };
    candidate_id?: string;
  };
  profiles?: { // Interviewer profile
    id: string;
    first_name: string;
    last_name: string;
    email?: string;
    role?: string;
    avatar_url?: string;
  };
  // From getAllInterviews transformed data
  candidate?: {
    id: string;
    name?: string;
    avatar?: string;
  };
  position?: string;
  scheduledAt?: Date;
  interviewer_id?: string;
  scheduled_at: string;
  duration_minutes: number;
  duration?: number; // From transformed data
  type: "remote" | "onsite";
  location?: string;
  meeting_link?: string;
  meetingLink?: string; // From transformed data
  status: string;
}

interface UpcomingInterviewsProps {
  interviews: Interview[];
  className?: string;
}

const getInitials = (firstName: string = "", lastName: string = "") => {
  const first = firstName ? firstName[0] : "";
  const last = lastName ? lastName[0] : "";
  return (first + last).toUpperCase();
};

export const UpcomingInterviews: React.FC<UpcomingInterviewsProps> = ({
  interviews,
  className,
}) => {
  // Track additional application data that we may need to fetch
  const [applicationsData, setApplicationsData] = React.useState<{[key: string]: any}>({});

  useEffect(() => {
    // If we have interviews with application_id but no applications data,
    // fetch the missing application information
    const fetchMissingApplications = async () => {
      const missingAppIds = interviews
        .filter(interview => interview.application_id && !interview.applications)
        .map(interview => interview.application_id as string);
      
      if (missingAppIds.length === 0) return;
      
      try {
        // Fetch each application that we're missing
        const appData: {[key: string]: any} = {};
        for (const appId of missingAppIds) {
          try {
            const app = await applicationService.getApplicationById(appId);
            if (app) {
              appData[appId] = app;
            }
          } catch (error) {
            console.error(`Error fetching application ${appId}:`, error);
          }
        }
        
        setApplicationsData(appData);
      } catch (error) {
        console.error("Error fetching missing applications:", error);
      }
    };
    
    fetchMissingApplications();
  }, [interviews]);

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Upcoming Interviews</CardTitle>
      </CardHeader>
      <CardContent>
        {interviews.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No upcoming interviews scheduled</p>
          </div>
        ) : (
          <div className="space-y-4">
            {interviews.map((interview) => {
              
              let candidateName = "Upcoming Interview";
              let avatarUrl = "";
              let firstName = "";
              let lastName = "";
              let jobTitle = "Interview";
              
              // Try to get the application data if we fetched it separately
              const applicationData = interview.application_id 
                ? applicationsData[interview.application_id] 
                : null;
              
              // Case 1: Format from getAllInterviews transformed data
              if (interview.candidate) {
                candidateName = interview.candidate.name || "Upcoming Interview";
                avatarUrl = interview.candidate.avatar || "";
                jobTitle = interview.position || "Interview";
                
                // Try to extract first/last name for initials
                const nameParts = candidateName.split(" ");
                if (nameParts.length > 0) {
                  firstName = nameParts[0] || "";
                  lastName = nameParts.slice(1).join(" ") || "";
                }
              } 
              // Case 2: Format from getInterviewsByApplication or getInterviewsByInterviewer
              else if (interview.applications?.profiles) {
                const profile = interview.applications.profiles;
                firstName = profile.first_name || "";
                lastName = profile.last_name || "";
                candidateName = `${firstName} ${lastName}`.trim();
                avatarUrl = profile.avatar_url || "";
                jobTitle = interview.applications.jobs?.title || "Interview";
              }
              // Case 3: We have application_id and fetched the data separately
              else if (applicationData) {
                const profile = applicationData.profiles;
                if (profile) {
                  firstName = profile.first_name || "";
                  lastName = profile.last_name || "";
                  candidateName = `${firstName} ${lastName}`.trim();
                  avatarUrl = profile.avatar_url || "";
                }
                if (applicationData.jobs) {
                  jobTitle = applicationData.jobs.title || "Interview";
                }
              }
              // Case 4: We only have interviewer data but not candidate
              else {
                // Use interview ID or application ID as placeholder
                candidateName = "Scheduled Interview";
                jobTitle = "Interview";
                
                // If we have an interviewer's profile, at least show who they'll be meeting with
                if (interview.profiles && interview.profiles.role === "interviewer") {
                  const interviewer = interview.profiles;
                  jobTitle = `Interview with ${interviewer.first_name} ${interviewer.last_name}`;
                }
              }
              
              // Handle different date and duration field formats
              const scheduledDate = interview.scheduledAt 
                ? interview.scheduledAt 
                : (interview.scheduled_at ? parseISO(interview.scheduled_at) : new Date());
              
              const duration = interview.duration || interview.duration_minutes || 30;
              
              // Handle different field names for meeting link
              const meetingLink = interview.meetingLink || interview.meeting_link;

              return (
                <div
                  key={interview.id}
                  className="flex flex-col sm:flex-row sm:items-start p-3 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors"
                >
                  <Avatar className="h-10 w-10 mb-2 sm:mb-0 sm:mr-3">
                    <AvatarImage
                      src={avatarUrl}
                      alt={candidateName}
                    />
                    <AvatarFallback className="bg-system-blue-100 text-system-blue-600">
                      {getInitials(firstName, lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <h4 className="font-medium truncate max-w-[180px] sm:max-w-none">
                        {candidateName}
                      </h4>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          interview.type === "remote"
                            ? "bg-system-blue-100 text-system-blue-600 border-system-blue-200"
                            : "bg-system-green-100 text-system-green-600 border-system-green-200"
                        )}
                      >
                        {interview.type === "remote" ? "Remote" : "Onsite"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {jobTitle}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                        {format(scheduledDate, "MMM d, yyyy")}
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                        {format(scheduledDate, "h:mm a")} ({duration} min)
                      </div>
                      {interview.type === "remote" && meetingLink ? (
                        <div className="flex items-center text-xs text-system-blue-600">
                          <Video className="h-3 w-3 mr-1 flex-shrink-0" />
                          Video Call
                        </div>
                      ) : (
                        interview.location && (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                            <span className="truncate">{interview.location}</span>
                          </div>
                        )
                      )}
                    </div>
                    <div className="mt-2 flex space-x-2">
                      {interview.type === "remote" && meetingLink && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-7 px-2"
                          onClick={() => window.open(meetingLink, "_blank")}
                        >
                          Join Call
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7 px-2"
                        onClick={() => window.location.href = `/interviews/${interview.id}`}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="text-center pt-2">
              <Button 
                variant="link" 
                className="text-system-blue-600"
                onClick={() => window.location.href = "/interviews"}
              >
                View All Interviews
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
