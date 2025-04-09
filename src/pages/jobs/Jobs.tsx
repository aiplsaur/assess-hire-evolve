
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, MapPin, Users, CalendarRange, Plus, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { format, addDays } from "date-fns";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const mockJobs = [
  {
    id: "1",
    title: "Senior Frontend Developer",
    department: "Engineering",
    location: "New York, NY",
    type: "full-time" as const,
    applicantsCount: 15,
    postedAt: addDays(new Date(), -5),
    status: "published" as const,
    description: "We are looking for an experienced Frontend Developer to join our team...",
    requirements: "5+ years of experience with React, TypeScript, and modern web technologies.",
  },
  {
    id: "2",
    title: "Product Manager",
    department: "Product",
    location: "San Francisco, CA",
    type: "full-time" as const,
    applicantsCount: 8,
    postedAt: addDays(new Date(), -7),
    status: "published" as const,
    description: "We are seeking a talented Product Manager to lead our product initiatives...",
    requirements: "3+ years of experience in product management, preferably in SaaS products.",
  },
  {
    id: "3",
    title: "UI/UX Designer",
    department: "Design",
    location: "Remote",
    type: "remote" as const,
    applicantsCount: 12,
    postedAt: addDays(new Date(), -3),
    status: "published" as const,
    description: "Join our design team to create beautiful and intuitive user experiences...",
    requirements: "Portfolio showing UI/UX design work. Experience with Figma and design systems.",
  },
  {
    id: "4",
    title: "DevOps Engineer",
    department: "Engineering",
    location: "Chicago, IL",
    type: "full-time" as const,
    applicantsCount: 6,
    postedAt: addDays(new Date(), -10),
    status: "published" as const,
    description: "We're looking for a DevOps Engineer to help scale our infrastructure...",
    requirements: "Experience with AWS, Kubernetes, and CI/CD pipelines.",
  },
  {
    id: "5",
    title: "Marketing Specialist",
    department: "Marketing",
    location: "Boston, MA",
    type: "part-time" as const,
    applicantsCount: 9,
    postedAt: addDays(new Date(), -2),
    status: "published" as const,
    description: "Join our marketing team to create compelling campaigns...",
    requirements: "Experience in digital marketing, content creation, and analytics.",
  },
  {
    id: "6",
    title: "Backend Developer",
    department: "Engineering",
    location: "Austin, TX",
    type: "contract" as const,
    applicantsCount: 4,
    postedAt: addDays(new Date(), -15),
    status: "published" as const,
    description: "We need a skilled backend developer to help build our API infrastructure...",
    requirements: "Experience with Node.js, Python, and database design.",
  },
];

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

const Jobs: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Jobs</h1>
          <p className="text-muted-foreground">
            Manage your open positions and job listings
          </p>
        </div>
        <Button className="bg-system-blue-600 hover:bg-system-blue-700">
          <Plus className="h-4 w-4 mr-2" /> Create New Job
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle>All Jobs</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Input placeholder="Search jobs..." className="pl-8 w-full" />
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
            {mockJobs.map((job) => (
              <div
                key={job.id}
                className="p-4 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/jobs/${job.id}`)}
              >
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <div className="space-y-1">
                    <h3 className="font-medium text-lg">{job.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {job.department}
                    </p>
                  </div>
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
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1.5" />
                    {job.location}
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1.5" />
                    {job.applicantsCount} applicants
                  </div>
                  <div className="flex items-center">
                    <CalendarRange className="h-4 w-4 mr-1.5" />
                    Posted {format(job.postedAt, "MMM d, yyyy")}
                  </div>
                </div>
                <div className="mt-3 line-clamp-2 text-sm">
                  {job.description}
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/jobs/${job.id}/edit`);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/jobs/${job.id}/applicants`);
                    }}
                  >
                    View Applicants
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Jobs;
