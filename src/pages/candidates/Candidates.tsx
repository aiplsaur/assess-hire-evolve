
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Filter, Mail, Phone, MapPin, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, addDays } from "date-fns";
import { useNavigate } from "react-router-dom";
import { ApplicationStatus } from "@/types";

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  avatar?: string;
  status: ApplicationStatus;
  appliedFor: string;
  appliedAt: Date;
  tags: string[];
}

const mockCandidates: Candidate[] = [
  {
    id: "1",
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    phone: "+1 (555) 123-4567",
    location: "New York, NY",
    avatar: "",
    status: "screening",
    appliedFor: "Senior Frontend Developer",
    appliedAt: addDays(new Date(), -3),
    tags: ["React", "TypeScript", "UI/UX"],
  },
  {
    id: "2",
    name: "Samantha Lee",
    email: "samantha.lee@example.com",
    phone: "+1 (555) 234-5678",
    location: "San Francisco, CA",
    avatar: "",
    status: "assessment",
    appliedFor: "Product Manager",
    appliedAt: addDays(new Date(), -5),
    tags: ["Product Strategy", "Agile", "User Research"],
  },
  {
    id: "3",
    name: "David Chen",
    email: "david.chen@example.com",
    phone: "+1 (555) 345-6789",
    location: "Remote",
    avatar: "",
    status: "interview_scheduled",
    appliedFor: "UI/UX Designer",
    appliedAt: addDays(new Date(), -7),
    tags: ["Figma", "User Testing", "Design Systems"],
  },
  {
    id: "4",
    name: "Emily Rodriguez",
    email: "emily.rodriguez@example.com",
    phone: "+1 (555) 456-7890",
    location: "Chicago, IL",
    avatar: "",
    status: "applied",
    appliedFor: "DevOps Engineer",
    appliedAt: addDays(new Date(), -1),
    tags: ["AWS", "Docker", "Kubernetes"],
  },
  {
    id: "5",
    name: "Michael Wilson",
    email: "michael.wilson@example.com",
    phone: "+1 (555) 567-8901",
    location: "Boston, MA",
    avatar: "",
    status: "offered",
    appliedFor: "Marketing Specialist",
    appliedAt: addDays(new Date(), -14),
    tags: ["Content Marketing", "SEO", "Social Media"],
  },
  {
    id: "6",
    name: "Jessica Taylor",
    email: "jessica.taylor@example.com",
    phone: "+1 (555) 678-9012",
    location: "Austin, TX",
    avatar: "",
    status: "rejected",
    appliedFor: "Backend Developer",
    appliedAt: addDays(new Date(), -21),
    tags: ["Node.js", "Python", "SQL"],
  },
];

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

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

const Candidates: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCandidates = mockCandidates.filter(
    (candidate) =>
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.appliedFor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Candidates</h1>
          <p className="text-muted-foreground">
            Manage and track candidate applications
          </p>
        </div>
        <Button className="bg-system-blue-600 hover:bg-system-blue-700">
          <Plus className="h-4 w-4 mr-2" /> Add Candidate
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle>All Candidates</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Input 
                  placeholder="Search candidates..." 
                  className="pl-8 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
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
            {filteredCandidates.map((candidate) => (
              <div
                key={candidate.id}
                className="p-4 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/candidates/${candidate.id}`)}
              >
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={candidate.avatar} alt={candidate.name} />
                    <AvatarFallback className="bg-system-blue-100 text-system-blue-600">
                      {getInitials(candidate.name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div>
                        <h3 className="font-medium text-lg">{candidate.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Applied for: {candidate.appliedFor}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={getStatusStyles(candidate.status)}
                      >
                        {getStatusLabel(candidate.status)}
                      </Badge>
                    </div>
                    
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-1.5 flex-shrink-0" />
                        <span className="truncate">{candidate.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-1.5 flex-shrink-0" />
                        {candidate.phone}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1.5 flex-shrink-0" />
                        {candidate.location}
                      </div>
                    </div>
                    
                    <div className="mt-3 flex flex-wrap gap-2">
                      {candidate.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="mt-3 flex items-center text-xs text-muted-foreground">
                      Applied on {format(candidate.appliedAt, "MMM d, yyyy")}
                    </div>
                    
                    <div className="mt-4 flex justify-end space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Add functionality
                        }}
                      >
                        View Resume
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/candidates/${candidate.id}/interview`);
                        }}
                      >
                        Schedule Interview
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Candidates;
