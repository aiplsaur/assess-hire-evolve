
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarRange, MapPin, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: "full-time" | "part-time" | "contract" | "remote";
  applicantsCount: number;
  postedAt: Date;
  status: "draft" | "published" | "closed";
}

interface RecentJobsProps {
  jobs: Job[];
  className?: string;
}

const getJobTypeStyles = (type: Job["type"]) => {
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

const getStatusStyles = (status: Job["status"]) => {
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

export const RecentJobs: React.FC<RecentJobsProps> = ({
  jobs,
  className,
}) => {
  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium">Recent Jobs</CardTitle>
        <Button variant="outline" size="sm">
          Create New
        </Button>
      </CardHeader>
      <CardContent>
        {jobs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No recent jobs</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="p-3 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{job.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {job.department}
                    </p>
                  </div>
                  <div className="flex space-x-2">
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
                <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {job.location}
                  </div>
                  <div className="flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    {job.applicantsCount} applicants
                  </div>
                  <div className="flex items-center">
                    <CalendarRange className="h-3 w-3 mr-1" />
                    {format(job.postedAt, "MMM d, yyyy")}
                  </div>
                </div>
                <div className="mt-3 flex justify-end space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7 px-2"
                  >
                    View Details
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7 px-2"
                  >
                    View Applicants
                  </Button>
                </div>
              </div>
            ))}
            <div className="text-center pt-2">
              <Button variant="link" className="text-system-blue-600">
                View All Jobs
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
