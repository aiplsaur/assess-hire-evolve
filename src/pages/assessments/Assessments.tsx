import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Filter, Timer, FileText, CheckCircle, Plus, Search } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { assessmentService } from "@/services/assessmentService";
import { toast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

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
  stats?: {
    questionCount: number;
    completionCount: number;
  };
}

const getAssessmentTypeStyles = (type: "mcq" | "coding" | "text") => {
  switch (type) {
    case "mcq":
      return "bg-system-blue-100 text-system-blue-600 border-system-blue-200";
    case "coding":
      return "bg-system-green-100 text-system-green-600 border-system-green-200";
    case "text":
      return "bg-system-yellow-100 text-system-yellow-500 border-system-yellow-200";
    default:
      return "bg-system-gray-100 text-system-gray-600 border-system-gray-200";
  }
};

const getAssessmentTypeLabel = (type: "mcq" | "coding" | "text") => {
  switch (type) {
    case "mcq":
      return "Multiple Choice";
    case "coding":
      return "Coding Challenge";
    case "text":
      return "Written Response";
    default:
      return type;
  }
};

const getStatusStyles = (status: "active" | "draft" | "archived") => {
  switch (status) {
    case "active":
      return "bg-system-green-100 text-system-green-600 border-system-green-200";
    case "draft":
      return "bg-system-yellow-100 text-system-yellow-500 border-system-yellow-200";
    case "archived":
      return "bg-system-gray-100 text-system-gray-600 border-system-gray-200";
    default:
      return "bg-system-gray-100 text-system-gray-600 border-system-gray-200";
  }
};

const Assessments: React.FC = () => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        setLoading(true);
        
        // Fetch assessments with any filters applied
        const options: any = {};
        if (searchTerm) options.search = searchTerm;
        if (statusFilter) options.status = statusFilter;
        
        const data = await assessmentService.getAllAssessments(options);
        
        // Fetch stats for each assessment
        const assessmentsWithStats = await Promise.all(
          data.map(async (assessment: Assessment) => {
            try {
              const stats = await assessmentService.getAssessmentStats(assessment.id);
              return { ...assessment, stats };
            } catch (error) {
              console.error(`Error fetching stats for assessment ${assessment.id}:`, error);
              return { 
                ...assessment, 
                stats: { questionCount: 0, completionCount: 0 } 
              };
            }
          })
        );
        
        setAssessments(assessmentsWithStats);
      } catch (error) {
        console.error("Error fetching assessments:", error);
        toast({
          title: "Error",
          description: "Failed to load assessments. Please try again.",
          variant: "destructive",
        });
        // Set empty array on error
        setAssessments([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAssessments();
  }, [searchTerm, statusFilter]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCreateAssessment = () => {
    navigate('/assessments/create');
  };

  const handleSendToCandidate = (assessmentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/assessments/${assessmentId}/assign`);
  };

  const handleUnarchiveAssessment = async (assessmentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await assessmentService.updateAssessment(assessmentId, {
        status: "active"
      });
      
      toast({
        title: "Assessment Unarchived",
        description: "The assessment is now active and available for use."
      });
      
      // Update the assessment in the local state
      setAssessments(
        assessments.map(assessment => 
          assessment.id === assessmentId 
            ? { ...assessment, status: "active" } 
            : assessment
        )
      );
    } catch (error) {
      console.error("Error unarchiving assessment:", error);
      toast({
        title: "Error",
        description: "Failed to unarchive assessment. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Assessments</h1>
          <p className="text-muted-foreground">
            Create and manage candidate assessment tests
          </p>
        </div>
        <Button 
          className="bg-system-blue-600 hover:bg-system-blue-700"
          onClick={handleCreateAssessment}
        >
          <Plus className="h-4 w-4 mr-2" /> Create Assessment
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle>All Assessments</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Input 
                  placeholder="Search assessments..." 
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
                  <DropdownMenuItem onClick={() => setStatusFilter('active')}>
                    Active
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('draft')}>
                    Draft
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('archived')}>
                    Archived
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
          ) : assessments.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No Assessments Found</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm 
                  ? "No assessments match your search criteria." 
                  : "You haven't created any assessments yet."
                }
              </p>
              <Button 
                onClick={handleCreateAssessment}
                className="bg-system-blue-600 hover:bg-system-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" /> Create Assessment
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {assessments.map((assessment) => (
                <div
                  key={assessment.id}
                  className="p-4 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/assessments/${assessment.id}`)}
                >
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div>
                      <h3 className="font-medium text-lg">{assessment.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {assessment.description}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant="outline"
                        className={getAssessmentTypeStyles(assessment.type)}
                      >
                        {getAssessmentTypeLabel(assessment.type)}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={getStatusStyles(assessment.status)}
                      >
                        {assessment.status.charAt(0).toUpperCase() + assessment.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Timer className="h-4 w-4 mr-1.5" />
                      {assessment.duration_minutes} minutes
                    </div>
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-1.5" />
                      {assessment.stats?.questionCount || 0} questions
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1.5" />
                      {assessment.passing_score}% passing score
                    </div>
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-4 h-4 mr-1.5"
                      >
                        <path d="M10 9a3 3 0 100-6 3 3 0 000 6zM6 8a2 2 0 11-4 0 2 2 0 014 0zM1.49 15.326a.78.78 0 01-.358-.442 3 3 0 014.308-3.516 6.484 6.484 0 00-1.905 3.959c-.023.222-.014.442.025.654a4.97 4.97 0 01-2.07-.655zM16.44 15.98a4.97 4.97 0 002.07-.654.78.78 0 00.357-.442 3 3 0 00-4.308-3.517 6.484 6.484 0 011.907 3.96 2.32 2.32 0 01-.026.654zM18 8a2 2 0 11-4 0 2 2 0 014 0zM5.304 16.19a.844.844 0 01-.277-.71 5 5 0 019.947 0 .843.843 0 01-.277.71A6.975 6.975 0 0110 18a6.974 6.974 0 01-4.696-1.81z" />
                      </svg>
                      {assessment.stats?.completionCount || 0} completions
                    </div>
                  </div>
                  
                  <div className="mt-2 text-xs text-muted-foreground">
                    Created {format(new Date(assessment.created_at), "MMM d, yyyy")} • 
                    Last updated {format(new Date(assessment.updated_at), "MMM d, yyyy")}
                  </div>
                  
                  <div className="mt-4 flex justify-end space-x-2">
                    {assessment.status !== "archived" ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/assessments/${assessment.id}/edit`);
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
                            navigate(`/assessments/${assessment.id}/results`);
                          }}
                        >
                          View Results
                        </Button>
                        {assessment.status === "active" && (
                          <Button
                            size="sm"
                            className="text-xs h-8 bg-system-blue-500 hover:bg-system-blue-600"
                            onClick={(e) => handleSendToCandidate(assessment.id, e)}
                          >
                            Send to Candidates
                          </Button>
                        )}
                      </>
                    ) : (
                      <Button
                        size="sm"
                        className="text-xs h-8 bg-system-green-500 hover:bg-system-green-600"
                        onClick={(e) => handleUnarchiveAssessment(assessment.id, e)}
                      >
                        Unarchive
                      </Button>
                    )}
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

export default Assessments;
