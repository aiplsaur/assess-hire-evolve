import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ApplicationStatus } from "@/types";
import { format, parseISO } from "date-fns";
import { Link } from "react-router-dom";

// Modified to match the actual data structure from the API
interface Application {
  id: string;
  job_id: string;
  candidate_id: string;
  status: string;
  applied_at: string;
  updated_at: string;
  jobs?: {
    title: string;
    department: string;
  };
  profiles?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar_url?: string;
  };
}

interface RecentApplicationsProps {
  applications: Application[];
  className?: string;
}

const getStatusStyles = (status: string) => {
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

const getStatusLabel = (status: string) => {
  return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const getInitials = (firstName: string = "", lastName: string = "") => {
  const first = firstName.charAt(0) || "";
  const last = lastName.charAt(0) || "";
  return (first + last).toUpperCase();
};

export const RecentApplications: React.FC<RecentApplicationsProps> = ({
  applications,
  className,
}) => {
  return (
    <Card className={cn("h-full", className)}>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Recent Applications</CardTitle>
      </CardHeader>
      <CardContent>
        {applications.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No recent applications</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <div
                key={application.id}
                className="flex items-start p-3 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors"
              >
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage
                    src={application.profiles?.avatar_url}
                    alt={application.profiles ? `${application.profiles.first_name} ${application.profiles.last_name}` : "User"}
                  />
                  <AvatarFallback className="bg-system-blue-100 text-system-blue-600">
                    {application.profiles ? getInitials(application.profiles.first_name, application.profiles.last_name) : "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium truncate">
                      {application.profiles ? `${application.profiles.first_name} ${application.profiles.last_name}` : "Unknown User"}
                    </h4>
                    <Badge
                      variant="outline"
                      className={getStatusStyles(application.status)}
                    >
                      {getStatusLabel(application.status)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {application.jobs?.title || 'Unknown Position'} {application.jobs?.department ? `• ${application.jobs.department}` : ''}
                  </p>
                  <div className="mt-1 flex items-center text-xs text-muted-foreground">
                    Applied {application.applied_at ? format(parseISO(application.applied_at), "MMM d, yyyy") : "N/A"}
                  </div>
                  <div className="mt-2 flex space-x-2">
                    <Link to={`/applications/${application.id}`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7 px-2"
                      >
                        View Details
                      </Button>
                    </Link>
                    {application.status === "applied" && (
                      <Button
                        size="sm"
                        className="text-xs h-7 px-2 bg-system-blue-500 hover:bg-system-blue-600"
                      >
                        Start Review
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div className="text-center pt-2">
              <Link to="/applications">
                <Button variant="link" className="text-system-blue-600">
                  View All Applications
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
