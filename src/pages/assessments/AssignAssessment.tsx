import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/hooks/use-toast";
import { Search, ArrowLeft, Send } from "lucide-react";
import { assessmentService } from "@/services/assessmentService";
import { applicationService } from "@/services";
import { useDebounce } from "@/hooks/use-debounce";

interface Candidate {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url?: string;
  application_id?: string;
}

const AssignAssessment: React.FC = () => {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState<any>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [sending, setSending] = useState(false);

  // Fetch assessment data when component loads
  useEffect(() => {
    const fetchAssessment = async () => {
      if (!assessmentId) return;
      
      try {
        setLoading(true);
        // Fetch the assessment details
        const assessmentData = await assessmentService.getAssessmentById(assessmentId);
        setAssessment(assessmentData);
      } catch (error) {
        console.error("Error fetching assessment:", error);
        toast({
          title: "Error",
          description: "Failed to load assessment details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [assessmentId]);

  // Search candidates whenever the debounced search term changes
  useEffect(() => {
    const searchCandidates = async () => {
      try {
        setSearching(true);
        // Use the new searchCandidates method that performs server-side filtering
        const candidatesData = await applicationService.searchCandidates(
          debouncedSearchTerm,
          ["screening", "interview", "assessment"]
        );
        
        setCandidates(candidatesData);
      } catch (error) {
        console.error("Error searching candidates:", error);
        toast({
          title: "Search Error",
          description: "Failed to search candidates. Please try again.",
          variant: "destructive",
        });
        setCandidates([]);
      } finally {
        setSearching(false);
      }
    };

    // Initial load of candidates or when search term changes
    searchCandidates();
  }, [debouncedSearchTerm]);

  const handleSelectCandidate = (candidateId: string, viaEmail: boolean = false) => {
    setSelectedCandidates(prev => {
      if (prev.includes(candidateId)) {
        return prev.filter(id => id !== candidateId);
      } else {
        // If selected via email, show a toast to confirm selection
        if (viaEmail) {
          const candidate = candidates.find(c => c.id === candidateId);
          if (candidate) {
            toast({
              title: "Candidate Selected",
              description: `${candidate.first_name} ${candidate.last_name} (${candidate.email}) has been selected.`,
            });
          }
        }
        return [...prev, candidateId];
      }
    });
  };

  const selectCandidateByEmail = (email) => {
    const candidate = candidates.find(c => c.email.toLowerCase() === email.toLowerCase());
    if (candidate) {
      // Add to selected candidates if not already selected
      if (!selectedCandidates.includes(candidate.id)) {
        handleSelectCandidate(candidate.id, true);
        return true;
      }
    }
    return false;
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    
    // If input looks like an email (contains @), auto-select exact match
    const value = e.target.value.trim();
    if (value.includes('@') && candidates.length > 0) {
      const selected = selectCandidateByEmail(value);
      
      if (selected) {
        // Clear the search field after successful selection
        setTimeout(() => {
          setSearchTerm("");
        }, 1000);
      }
    }
  };

  const handleSendAssessment = async () => {
    if (selectedCandidates.length === 0) {
      toast({
        title: "No candidates selected",
        description: "Please select at least one candidate to send the assessment to.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSending(true);
      
      // Find the applications for the selected candidates
      const selectedApplications = candidates
        .filter(c => selectedCandidates.includes(c.id))
        .map(c => c.application_id)
        .filter(id => id); // Filter out undefined application IDs
      
      // For each application, assign the assessment
      const assignments = [];
      let errorOccurred = false;
      
      for (const appId of selectedApplications) {
        try {
          const result = await assessmentService.assignAssessmentToApplication(assessmentId!, appId!);
          assignments.push(result);
        } catch (error) {
          console.error(`Error assigning assessment to application ${appId}:`, error);
          errorOccurred = true;
        }
      }
      
      if (errorOccurred) {
        toast({
          title: "Partial Success",
          description: `Assessment sent to some candidates, but errors occurred. Please check and try again for failed assignments.`,
          variant: "default",
        });
      } else {
        toast({
          title: "Assessment Assigned",
          description: `Assessment sent to ${assignments.length} candidate(s) successfully.`,
        });
      }
      
      // Navigate back to the assessment details
      navigate(`/assessments/${assessmentId}`);
    } catch (error) {
      console.error("Error assigning assessment:", error);
      toast({
        title: "Error",
        description: "Failed to assign assessment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-medium">Assessment Not Found</h2>
        <p className="text-muted-foreground mt-2">The assessment you're looking for doesn't exist or has been removed.</p>
        <Button 
          className="mt-4" 
          variant="outline" 
          onClick={() => navigate("/assessments")}
        >
          Back to Assessments
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => navigate(`/assessments/${assessmentId}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Assign Assessment</h1>
          <p className="text-muted-foreground">
            Send "{assessment.title}" to candidates
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Assessment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium text-lg">{assessment.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{assessment.description}</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Type:</span>
                <span className="font-medium">{assessment.type === "mcq" ? "Multiple Choice" : assessment.type === "coding" ? "Coding Challenge" : "Written Response"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Duration:</span>
                <span className="font-medium">{assessment.duration_minutes} minutes</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Passing Score:</span>
                <span className="font-medium">{assessment.passing_score}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Select Candidates</CardTitle>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by name or email..."
                className="pl-8"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-4">
              Click on a candidate's row or email to select them. You can also paste an email address in the search box to select by email.
            </p>
            {searching ? (
              <div className="flex justify-center items-center py-8">
                <Spinner className="mr-2" />
                <p>Searching...</p>
              </div>
            ) : candidates.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {searchTerm ? "No candidates match your search" : "No candidates found"}
                </p>
                {searchTerm && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Try different search terms or check candidate status
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {candidates.map(candidate => (
                  <div 
                    key={candidate.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      selectedCandidates.includes(candidate.id) 
                        ? "border-blue-500 bg-blue-50" 
                        : "border-border"
                    }`}
                    onClick={() => handleSelectCandidate(candidate.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={`candidate-${candidate.id}`}
                        checked={selectedCandidates.includes(candidate.id)}
                        onCheckedChange={() => handleSelectCandidate(candidate.id)}
                        className="cursor-pointer"
                      />
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={candidate.avatar_url} />
                        <AvatarFallback>
                          {getInitials(candidate.first_name, candidate.last_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <Label 
                          htmlFor={`candidate-${candidate.id}`}
                          className="font-medium cursor-pointer"
                        >
                          {candidate.first_name} {candidate.last_name}
                        </Label>
                        <p 
                          className={`text-sm cursor-pointer ${
                            selectedCandidates.includes(candidate.id) 
                              ? "text-blue-500 font-medium" 
                              : "text-muted-foreground hover:text-blue-500"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectCandidate(candidate.id, true);
                          }}
                          title="Click to select this candidate by email"
                        >
                          {candidate.email}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-6 flex justify-end">
              <Button
                disabled={sending || selectedCandidates.length === 0}
                onClick={handleSendAssessment}
                className="bg-system-blue-600 hover:bg-system-blue-700"
              >
                {sending ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" /> 
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" /> 
                    Send Assessment to {selectedCandidates.length} Candidate{selectedCandidates.length !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AssignAssessment; 