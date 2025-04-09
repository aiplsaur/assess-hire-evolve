
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Video } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Interview {
  id: string;
  candidate: {
    id: string;
    name: string;
    avatar?: string;
  };
  position: string;
  scheduledAt: Date;
  duration: number; // minutes
  type: "remote" | "onsite";
  location?: string;
  meetingLink?: string;
}

interface UpcomingInterviewsProps {
  interviews: Interview[];
  className?: string;
}

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

export const UpcomingInterviews: React.FC<UpcomingInterviewsProps> = ({
  interviews,
  className,
}) => {
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
            {interviews.map((interview) => (
              <div
                key={interview.id}
                className="flex items-start p-3 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors"
              >
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage
                    src={interview.candidate.avatar}
                    alt={interview.candidate.name}
                  />
                  <AvatarFallback className="bg-system-blue-100 text-system-blue-600">
                    {getInitials(interview.candidate.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium truncate">
                      {interview.candidate.name}
                    </h4>
                    <Badge
                      variant="outline"
                      className={cn(
                        interview.type === "remote"
                          ? "bg-system-blue-100 text-system-blue-600 border-system-blue-200"
                          : "bg-system-green-100 text-system-green-600 border-system-green-200"
                      )}
                    >
                      {interview.type === "remote" ? "Remote" : "Onsite"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {interview.position}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      {format(interview.scheduledAt, "MMM d, yyyy")}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {format(interview.scheduledAt, "h:mm a")} (
                      {interview.duration} min)
                    </div>
                    {interview.type === "remote" && interview.meetingLink ? (
                      <div className="flex items-center text-xs text-system-blue-600">
                        <Video className="h-3 w-3 mr-1" />
                        Video Call
                      </div>
                    ) : (
                      interview.location && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3 mr-1" />
                          {interview.location}
                        </div>
                      )
                    )}
                  </div>
                  <div className="mt-2 flex space-x-2">
                    {interview.type === "remote" && interview.meetingLink && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7 px-2"
                        onClick={() => window.open(interview.meetingLink, "_blank")}
                      >
                        Join Call
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 px-2"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            <div className="text-center pt-2">
              <Button variant="link" className="text-system-blue-600">
                View All Interviews
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
