import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import { Search, ArrowLeft, Download, CheckCircle, XCircle, Clock } from "lucide-react";
import { assessmentService } from "@/services/assessmentService";
import { Progress } from "@/components/ui/progress";

interface AssessmentResult {
  id: string;
  assessment_id: string;
  candidate_id: string;
  application_id: string;
  score: number;
  status: "completed" | "in_progress" | "not_started";
  started_at: string | null;
  completed_at: string | null;
  candidate: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar_url?: string;
  };
  answers?: any[];
}

interface Assessment {
  id: string;
  title: string;
  description: string;
  type: "mcq" | "coding" | "text";
  duration_minutes: number;
  passing_score: number;
  created_at: string;
  updated_at: string;
  status: "active" | "draft" | "archived";
  questionCount?: number;
}

const AssessmentResults: React.FC = () => {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [results, setResults] = useState<AssessmentResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<AssessmentResult[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch assessment details
        const assessmentData = await assessmentService.getAssessmentById(assessmentId!);
        setAssessment(assessmentData);
        
        // Fetch assessment results
        const resultsData = await assessmentService.getAssessmentResults(assessmentId!);
        setResults(resultsData);
        setFilteredResults(resultsData);
      } catch (error) {
        console.error("Error fetching assessment results:", error);
        toast({
          title: "Error",
          description: "Failed to load assessment results. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (assessmentId) {
      fetchData();
    }
  }, [assessmentId]);

  useEffect(() => {
    // Filter results based on search term and active tab
    let filtered = [...results];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(result => {
        const candidateName = `${result.candidate.first_name} ${result.candidate.last_name}`.toLowerCase();
        const email = result.candidate.email.toLowerCase();
        return candidateName.includes(term) || email.includes(term);
      });
    }
    
    // Apply tab filter
    if (activeTab !== "all") {
      filtered = filtered.filter(result => result.status === activeTab);
    }
    
    setFilteredResults(filtered);
  }, [searchTerm, activeTab, results]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const getStatusBadge = (status: string, score: number) => {
    if (status === "not_started") {
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200">
          Not Started
        </Badge>
      );
    } else if (status === "in_progress") {
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-600 border-yellow-200">
          In Progress
        </Badge>
      );
    } else if (score >= (assessment?.passing_score || 0)) {
      return (
        <Badge variant="outline" className="bg-green-100 text-green-600 border-green-200">
          Passed
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-red-100 text-red-600 border-red-200">
          Failed
        </Badge>
      );
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  const getStatusIcon = (status: string, score: number) => {
    if (status === "not_started") {
      return <Clock className="h-5 w-5 text-gray-400" />;
    } else if (status === "in_progress") {
      return <Clock className="h-5 w-5 text-yellow-500" />;
    } else if (score >= (assessment?.passing_score || 0)) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const handleExportResults = () => {
    // Implementation for exporting results to CSV
    try {
      // Create CSV content
      const headers = ["Candidate Name", "Email", "Status", "Score", "Started At", "Completed At"];
      const rows = results.map(result => [
        `${result.candidate.first_name} ${result.candidate.last_name}`,
        result.candidate.email,
        result.status === "completed" 
          ? (result.score >= (assessment?.passing_score || 0) ? "Passed" : "Failed")
          : (result.status === "in_progress" ? "In Progress" : "Not Started"),
        result.status === "completed" ? `${result.score}%` : "N/A",
        result.started_at ? format(parseISO(result.started_at), "MMM d, yyyy HH:mm") : "N/A",
        result.completed_at ? format(parseISO(result.completed_at), "MMM d, yyyy HH:mm") : "N/A"
      ]);
      
      // Convert to CSV
      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.join(","))
      ].join("\n");
      
      // Create and download the file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${assessment?.title}-results.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export Successful",
        description: "Assessment results have been exported to CSV."
      });
    } catch (error) {
      console.error("Error exporting results:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export assessment results.",
        variant: "destructive"
      });
    }
  };

  const handleViewCandidateResult = (resultId: string) => {
    navigate(`/assessments/${assessmentId}/results/${resultId}`);
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
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Assessment Results</h1>
          <p className="text-muted-foreground">
            Results for "{assessment.title}"
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleExportResults}
          disabled={results.length === 0}
        >
          <Download className="h-4 w-4 mr-2" /> Export to CSV
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle>Candidate Results</CardTitle>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search candidates..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">
                All ({results.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({results.filter(r => r.status === "completed").length})
              </TabsTrigger>
              <TabsTrigger value="in_progress">
                In Progress ({results.filter(r => r.status === "in_progress").length})
              </TabsTrigger>
              <TabsTrigger value="not_started">
                Not Started ({results.filter(r => r.status === "not_started").length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-4">
              {filteredResults.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No results found</p>
                  {results.length > 0 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Try adjusting your search or filter criteria
                    </p>
                  )}
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredResults.map(result => (
                    <div 
                      key={result.id}
                      className="p-4 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => result.status === "completed" && handleViewCandidateResult(result.id)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={result.candidate.avatar_url} />
                            <AvatarFallback>
                              {getInitials(result.candidate.first_name, result.candidate.last_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{result.candidate.first_name} {result.candidate.last_name}</h3>
                            <p className="text-sm text-muted-foreground">{result.candidate.email}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {getStatusBadge(result.status, result.score)}
                        </div>
                      </div>
                      
                      {result.status === "completed" && (
                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Score: {result.score}%</span>
                            <span className="text-xs text-muted-foreground">
                              Passing: {assessment.passing_score}%
                            </span>
                          </div>
                          <Progress
                            value={result.score}
                            max={100}
                            className={`h-2 ${
                              result.score >= assessment.passing_score 
                                ? "bg-gray-100 [&>div]:bg-green-500" 
                                : "bg-gray-100 [&>div]:bg-red-500"
                            }`}
                          />
                        </div>
                      )}
                      
                      <div className="mt-3 flex justify-between text-xs text-muted-foreground">
                        <div>
                          {result.started_at && (
                            <span>
                              Started: {format(parseISO(result.started_at), "MMM d, yyyy HH:mm")}
                            </span>
                          )}
                        </div>
                        <div>
                          {result.completed_at && (
                            <span>
                              Completed: {format(parseISO(result.completed_at), "MMM d, yyyy HH:mm")}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {result.status === "completed" && (
                        <div className="mt-3 flex justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewCandidateResult(result.id);
                            }}
                          >
                            View Details
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssessmentResults; 