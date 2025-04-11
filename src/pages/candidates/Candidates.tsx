import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Filter, Mail, Phone, MapPin, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { ApplicationStatus } from "@/types";
import { candidateService } from "@/services/candidateService";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

interface Candidate {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  location: string;
  avatar_url?: string;
  applications: Application[];
  created_at: string;
}

interface Application {
  id: string;
  status: ApplicationStatus;
  applied_at: string;
  resume_url?: string;
  jobs: {
    id: string;
    title: string;
    department: string;
    location: string;
  };
}

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
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [resumeUrls, setResumeUrls] = useState<Record<string, string>>({});

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

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        const data = await candidateService.getAllCandidates();
        setCandidates(data || []);
      } catch (error) {
        console.error("Error fetching candidates:", error);
        toast({
          title: "Error",
          description: "Failed to load candidates. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, []);

  useEffect(() => {
    const searchCandidates = async () => {
      if (searchTerm.trim() === "") {
        // If search is cleared, fetch all candidates
        const data = await candidateService.getAllCandidates();
        setCandidates(data || []);
        return;
      }

      try {
        setLoading(true);
        const data = await candidateService.searchCandidates(searchTerm);
        setCandidates(data || []);
      } catch (error) {
        console.error("Error searching candidates:", error);
        toast({
          title: "Error",
          description: "Failed to search candidates. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    // Debounce search
    const timer = setTimeout(() => {
      searchCandidates();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleAddCandidate = () => {
    navigate("/candidates/new");
  };

  // Get most recent application for each candidate
  const candidatesWithLatestApplication = candidates.map(candidate => {
    const sortedApplications = [...(candidate.applications || [])].sort(
      (a, b) => new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime()
    );
    
    const latestApplication = sortedApplications[0];
    
    return {
      ...candidate,
      latestApplication
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Candidates</h1>
          <p className="text-muted-foreground">
            Manage and track candidate applications
          </p>
        </div>
        <Button 
          className="bg-system-blue-600 hover:bg-system-blue-700"
          onClick={handleAddCandidate}
        >
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
          {loading ? (
            <div className="flex justify-center p-8">
              <Spinner size="lg" />
            </div>
          ) : candidatesWithLatestApplication.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              No candidates found. Try adjusting your search criteria.
            </div>
          ) : (
            <div className="grid gap-4">
              {candidatesWithLatestApplication.map((candidate) => (
                <div
                  key={candidate.id}
                  className="p-4 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/candidates/${candidate.id}`)}
                >
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={candidate.avatar_url} alt={`${candidate.first_name} ${candidate.last_name}`} />
                      <AvatarFallback className="bg-system-blue-100 text-system-blue-600">
                        {getInitials(`${candidate.first_name} ${candidate.last_name}`)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <div>
                          <h3 className="font-medium text-lg">{candidate.first_name} {candidate.last_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {candidate.latestApplication ? `Applied for: ${candidate.latestApplication.jobs.title}` : 'No applications yet'}
                          </p>
                        </div>
                        {candidate.latestApplication && (
                          <Badge
                            variant="outline"
                            className={getStatusStyles(candidate.latestApplication.status)}
                          >
                            {getStatusLabel(candidate.latestApplication.status)}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-1.5 flex-shrink-0" />
                          <span className="truncate">{candidate.email}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-1.5 flex-shrink-0" />
                          {candidate.phone || 'No phone'}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1.5 flex-shrink-0" />
                          {candidate.location || 'No location'}
                        </div>
                      </div>
                      
                      {candidate.latestApplication && (
                        <div className="mt-3 flex items-center text-xs text-muted-foreground">
                          Applied on {format(new Date(candidate.latestApplication.applied_at), "MMM d, yyyy")}
                        </div>
                      )}
                      
                      <div className="mt-4 flex justify-end space-x-2">
                        {candidate.latestApplication?.resume_url && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-8"
                            onClick={(e) => handleViewResume(e, candidate.latestApplication.resume_url)}
                          >
                            View Resume
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (candidate.latestApplication) {
                              navigate(`/candidates/${candidate.id}/interview?applicationId=${candidate.latestApplication.id}`);
                            } else {
                              navigate(`/candidates/${candidate.id}/interview`);
                            }
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Candidates;
