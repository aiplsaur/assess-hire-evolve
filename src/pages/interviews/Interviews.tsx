import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Filter, Calendar, Clock, Video, MapPin, Plus, Search, AlertCircle } from "lucide-react";
import { format, isToday, isPast, isThisWeek } from "date-fns";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { interviewService } from "@/services/interviewService";
import { toast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

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
  const { user, hasRole } = useAuth();
  const [filter, setFilter] = useState<"all" | "upcoming" | "today" | "past">("all");
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Build filters
        const filters: any = {};
        
        // Add status filter if selected
        if (statusFilter) {
          filters.status = statusFilter;
        }
        
        // Add date filters based on selected filter tab
        const now = new Date();
        if (filter === "upcoming") {
          filters.from = now.toISOString();
        } else if (filter === "today") {
          const startOfDay = new Date(now);
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date(now);
          endOfDay.setHours(23, 59, 59, 999);
          filters.from = startOfDay.toISOString();
          filters.to = endOfDay.toISOString();
        } else if (filter === "past") {
          filters.to = now.toISOString();
        }
        
        // Add search term if present
        if (searchTerm) {
          filters.search = searchTerm;
        }
        
        // Add interviewer filter if user is an interviewer
        if (hasRole(["interviewer"]) && user?.id) {
          filters.interviewerId = user.id;
        }
        
        const data = await interviewService.getAllInterviews(filters);
        setInterviews(data);
      } catch (err) {
        console.error("Error fetching interviews:", err);
        setError("Failed to load interviews. Please try again.");
        toast({
          title: "Error",
          description: "Failed to load interviews. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchInterviews();
  }, [filter, statusFilter, searchTerm, user?.id, hasRole]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleRescheduleInterview = async (interviewId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/interviews/${interviewId}/reschedule`);
  };

  const handleJoinCall = (meetingLink: string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(meetingLink, "_blank");
  };

  const handleSubmitFeedback = (interviewId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/interviews/${interviewId}/feedback`);
  };

  const handleViewDetails = (interviewId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/interviews/${interviewId}`);
  };

  const handleScheduleInterview = () => {
    navigate("/interviews/schedule");
  };

  // Filter the interviews client-side for certain conditions
  const filteredInterviews = interviews.filter((interview) => {
    // Apply additional client-side filters if needed
    return true;
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
        <Button 
          className="bg-system-blue-600 hover:bg-system-blue-700"
          onClick={handleScheduleInterview}
        >
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
                <Input 
                  placeholder="Search interviews..." 
                  className="pl-8 w-full"
                  value={searchTerm}
                  onChange={handleSearch}
                />
                <div className="absolute left-2.5 top-2.5 text-muted-foreground">
                  <Search className="h-4 w-4" />
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className={`flex gap-2 whitespace-nowrap ${statusFilter ? 'bg-muted' : ''}`}
                  >
                    <Filter className="h-4 w-4" /> 
                    {statusFilter ? `Status: ${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}` : 'All Statuses'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setStatusFilter(null)}>
                    All Statuses
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('scheduled')}>
                    Scheduled
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('completed')}>
                    Completed
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('canceled')}>
                    Canceled
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('rescheduled')}>
                    Rescheduled
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Spinner size="lg" />
            </div>
          ) : error ? (
            <div className="text-center py-8 bg-system-red-50 rounded-lg">
              <AlertCircle className="h-8 w-8 text-system-red-500 mx-auto mb-2" />
              <h3 className="text-lg font-medium text-system-red-600 mb-1">Error Loading Interviews</h3>
              <p className="text-muted-foreground">{error}</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          ) : filteredInterviews.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-2">No interviews found</p>
              {searchTerm || statusFilter ? (
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search or filters
                </p>
              ) : (
                <Button 
                  onClick={handleScheduleInterview}
                  className="mt-2 bg-system-blue-600 hover:bg-system-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" /> Schedule Interview
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredInterviews.map((interview) => (
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
                                onClick={(e) => handleJoinCall(interview.meetingLink!, e)}
                              >
                                Join Call
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-8"
                              onClick={(e) => handleRescheduleInterview(interview.id, e)}
                            >
                              Reschedule
                            </Button>
                          </>
                        )}
                        {interview.status === "completed" && !interview.feedbackSubmitted && (
                          <Button
                            size="sm"
                            className="text-xs h-8 bg-system-green-500 hover:bg-system-green-600"
                            onClick={(e) => handleSubmitFeedback(interview.id, e)}
                          >
                            Submit Feedback
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-8"
                          onClick={(e) => handleViewDetails(interview.id, e)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Interviews;
