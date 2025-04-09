
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Filter, Calendar, Clock, Video, MapPin, Plus } from "lucide-react";
import { format, addDays, addHours, isToday, isPast, isThisWeek } from "date-fns";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

interface Interview {
  id: string;
  candidate: {
    id: string;
    name: string;
    avatar?: string;
  };
  interviewers: {
    id: string;
    name: string;
    avatar?: string;
  }[];
  position: string;
  scheduledAt: Date;
  duration: number; // minutes
  type: "remote" | "onsite";
  location?: string;
  meetingLink?: string;
  status: "scheduled" | "completed" | "canceled" | "rescheduled";
  notes?: string;
  feedbackSubmitted: boolean;
}

const mockInterviews: Interview[] = [
  {
    id: "1",
    candidate: {
      id: "c1",
      name: "Jane Cooper",
      avatar: "",
    },
    interviewers: [
      {
        id: "i1",
        name: "Robert Fox",
        avatar: "",
      },
      {
        id: "i2",
        name: "Alex Johnson",
        avatar: "",
      },
    ],
    position: "Frontend Developer",
    scheduledAt: addHours(new Date(), 3),
    duration: 45,
    type: "remote",
    meetingLink: "https://zoom.us/j/123456789",
    status: "scheduled",
    feedbackSubmitted: false,
  },
  {
    id: "2",
    candidate: {
      id: "c2",
      name: "Devon Lane",
      avatar: "",
    },
    interviewers: [
      {
        id: "i3",
        name: "Michael Wilson",
        avatar: "",
      },
    ],
    position: "Product Manager",
    scheduledAt: addDays(new Date(), 1),
    duration: 60,
    type: "onsite",
    location: "Main Office - Room 302",
    status: "scheduled",
    feedbackSubmitted: false,
  },
  {
    id: "3",
    candidate: {
      id: "c3",
      name: "Robert Fox",
      avatar: "",
    },
    interviewers: [
      {
        id: "i1",
        name: "Robert Fox",
        avatar: "",
      },
    ],
    position: "UX Designer",
    scheduledAt: addDays(new Date(), -2),
    duration: 30,
    type: "remote",
    meetingLink: "https://meet.google.com/abc-defg-hij",
    status: "completed",
    feedbackSubmitted: true,
  },
  {
    id: "4",
    candidate: {
      id: "c4",
      name: "Leslie Alexander",
      avatar: "",
    },
    interviewers: [
      {
        id: "i4",
        name: "Jessica Taylor",
        avatar: "",
      },
      {
        id: "i5",
        name: "Samantha Lee",
        avatar: "",
      },
    ],
    position: "Marketing Specialist",
    scheduledAt: addDays(new Date(), -1),
    duration: 45,
    type: "remote",
    meetingLink: "https://zoom.us/j/987654321",
    status: "completed",
    feedbackSubmitted: false,
  },
  {
    id: "5",
    candidate: {
      id: "c5",
      name: "Cameron Williamson",
      avatar: "",
    },
    interviewers: [
      {
        id: "i6",
        name: "David Chen",
        avatar: "",
      },
    ],
    position: "DevOps Engineer",
    scheduledAt: addDays(new Date(), 3),
    duration: 60,
    type: "onsite",
    location: "Main Office - Room 201",
    status: "scheduled",
    feedbackSubmitted: false,
  },
];

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

const getStatusStyles = (status: "scheduled" | "completed" | "canceled" | "rescheduled") => {
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

const getTypeStyles = (type: "remote" | "onsite") => {
  return type === "remote"
    ? "bg-system-blue-100 text-system-blue-600 border-system-blue-200"
    : "bg-system-green-100 text-system-green-600 border-system-green-200";
};

const Interviews: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filter, setFilter] = useState<"all" | "upcoming" | "today" | "past">("all");

  const filteredInterviews = mockInterviews.filter((interview) => {
    switch (filter) {
      case "upcoming":
        return !isPast(interview.scheduledAt) || isToday(interview.scheduledAt);
      case "today":
        return isToday(interview.scheduledAt);
      case "past":
        return isPast(interview.scheduledAt) && !isToday(interview.scheduledAt);
      default:
        return true;
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Interviews</h1>
          <p className="text-muted-foreground">
            Schedule and manage candidate interviews
          </p>
        </div>
        <Button className="bg-system-blue-600 hover:bg-system-blue-700">
          <Plus className="h-4 w-4 mr-2" /> Schedule Interview
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 pb-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          className={filter === "all" ? "" : "text-muted-foreground"}
          onClick={() => setFilter("all")}
        >
          All Interviews
        </Button>
        <Button
          variant={filter === "upcoming" ? "default" : "outline"}
          className={filter === "upcoming" ? "" : "text-muted-foreground"}
          onClick={() => setFilter("upcoming")}
        >
          Upcoming
        </Button>
        <Button
          variant={filter === "today" ? "default" : "outline"}
          className={filter === "today" ? "" : "text-muted-foreground"}
          onClick={() => setFilter("today")}
        >
          Today
        </Button>
        <Button
          variant={filter === "past" ? "default" : "outline"}
          className={filter === "past" ? "" : "text-muted-foreground"}
          onClick={() => setFilter("past")}
        >
          Past
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle>
              {filter === "all" && "All Interviews"}
              {filter === "upcoming" && "Upcoming Interviews"}
              {filter === "today" && "Today's Interviews"}
              {filter === "past" && "Past Interviews"}
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Input placeholder="Search interviews..." className="pl-8 w-full" />
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
              <Button variant="outline" className="flex gap-2 whitespace-nowrap">
                <Filter className="h-4 w-4" /> Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {filteredInterviews.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No interviews found</p>
              </div>
            ) : (
              filteredInterviews.map((interview) => (
                <div
                  key={interview.id}
                  className={cn(
                    "p-4 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors cursor-pointer",
                    isToday(interview.scheduledAt) && "border-system-blue-200 bg-system-blue-50/50"
                  )}
                  onClick={() => navigate(`/interviews/${interview.id}`)}
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="sm:w-1/3">
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={interview.candidate.avatar}
                            alt={interview.candidate.name}
                          />
                          <AvatarFallback className="bg-system-blue-100 text-system-blue-600">
                            {getInitials(interview.candidate.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{interview.candidate.name}</h4>
                          <p className="text-sm text-muted-foreground">{interview.position}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge
                          variant="outline"
                          className={getStatusStyles(interview.status)}
                        >
                          {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={getTypeStyles(interview.type)}
                        >
                          {interview.type === "remote" ? "Remote" : "Onsite"}
                        </Badge>
                      </div>
                      
                      <div className="text-sm">
                        <div className="text-muted-foreground">Interviewers:</div>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {interview.interviewers.map((interviewer) => (
                            <div key={interviewer.id} className="flex items-center gap-1">
                              <Avatar className="h-6 w-6">
                                <AvatarImage
                                  src={interviewer.avatar}
                                  alt={interviewer.name}
                                />
                                <AvatarFallback className="bg-system-gray-100 text-system-gray-600 text-xs">
                                  {getInitials(interviewer.name)}
                                </AvatarFallback>
                              </Avatar>
                              <span>{interviewer.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="sm:w-2/3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div className="flex items-center text-sm">
                          <Calendar className="h-4 w-4 mr-1.5 text-muted-foreground" />
                          <span>
                            {isToday(interview.scheduledAt)
                              ? "Today"
                              : format(interview.scheduledAt, "EEEE, MMMM d, yyyy")}
                          </span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 mr-1.5 text-muted-foreground" />
                          <span>
                            {format(interview.scheduledAt, "h:mm a")} ({interview.duration} min)
                          </span>
                        </div>
                      </div>
                      
                      <div className="mb-3 text-sm">
                        {interview.type === "remote" && interview.meetingLink ? (
                          <div className="flex items-center">
                            <Video className="h-4 w-4 mr-1.5 text-muted-foreground" />
                            <span className="text-system-blue-600">{interview.meetingLink}</span>
                          </div>
                        ) : interview.location ? (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1.5 text-muted-foreground" />
                            <span>{interview.location}</span>
                          </div>
                        ) : null}
                      </div>
                      
                      <div className="mt-4 flex justify-end space-x-2">
                        {interview.status === "scheduled" && (
                          <>
                            {interview.type === "remote" && interview.meetingLink && (
                              <Button
                                size="sm"
                                className="text-xs h-8 bg-system-blue-500 hover:bg-system-blue-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(interview.meetingLink, "_blank");
                                }}
                              >
                                Join Call
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Reschedule
                              }}
                            >
                              Reschedule
                            </Button>
                          </>
                        )}
                        {interview.status === "completed" && !interview.feedbackSubmitted && (
                          <Button
                            size="sm"
                            className="text-xs h-8 bg-system-green-500 hover:bg-system-green-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/interviews/${interview.id}/feedback`);
                            }}
                          >
                            Submit Feedback
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            // View details
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Interviews;
