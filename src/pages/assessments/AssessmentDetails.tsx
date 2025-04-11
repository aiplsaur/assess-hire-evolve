import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";
import { assessmentService } from "@/services/assessmentService";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ArrowLeft, Edit, Timer, CheckCircle, Copy, FileText, Send, Users, Eye, Archive } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { formatDate } from "@/utils/dateUtils";

interface Question {
  id: string;
  question: string;
  type: string;
  options?: { text: string; isCorrect: boolean }[];
  correct_answer?: string;
  points: number;
  order_num: number;
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
  coding_questions?: Question[];
  stats?: {
    questionCount: number;
    completionCount: number;
    averageScore?: number;
    passRate?: number;
  };
}

interface Result {
  id: string;
  candidate_name: string;
  score: number;
  status: string;
  completion_date: string;
}

const getAssessmentTypeStyles = (type: string) => {
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

const getAssessmentTypeLabel = (type: string) => {
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

const getStatusStyles = (status: string) => {
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

const AssessmentDetails: React.FC = () => {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchAssessmentData = async () => {
      if (!assessmentId) return;
      
      try {
        setLoading(true);
        
        // Fetch assessment details
        const assessmentData = await assessmentService.getAssessmentById(assessmentId);
        
        // Fetch assessment stats
        const statsData = await assessmentService.getAssessmentStats(assessmentId);
        
        // Combine data
        setAssessment({
          ...assessmentData,
          stats: statsData
        });
        
        // Fetch results if available
        try {
          const resultsData = await assessmentService.getAssessmentResults(assessmentId);
          setResults(resultsData);
        } catch (error) {
          console.error("Error fetching results:", error);
          setResults([]);
        }
        
      } catch (error) {
        console.error("Error fetching assessment details:", error);
        toast({
          title: "Error",
          description: "Failed to load assessment details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchAssessmentData();
  }, [assessmentId]);
  
  const handleEditAssessment = () => {
    navigate(`/assessments/${assessmentId}/edit`);
  };
  
  const handleDuplicateAssessment = async () => {
    try {
      if (!assessment) return;
      
      const newAssessment = await assessmentService.createAssessment({
        title: `Copy of ${assessment.title}`,
        description: assessment.description,
        type: assessment.type,
        durationMinutes: assessment.duration_minutes,
        passingScore: assessment.passing_score,
        status: "draft"
      });
      
      toast({
        title: "Assessment Duplicated",
        description: "A copy of the assessment has been created as a draft."
      });
      
      navigate(`/assessments/${newAssessment.id}/edit`);
    } catch (error) {
      console.error("Error duplicating assessment:", error);
      toast({
        title: "Error",
        description: "Failed to duplicate assessment. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleSendToCandidate = () => {
    navigate(`/assessments/${assessmentId}/assign`);
  };
  
  const handleArchiveAssessment = async () => {
    try {
      if (!assessment) return;
      
      await assessmentService.updateAssessment(assessmentId!, {
        status: "archived"
      });
      
      toast({
        title: "Assessment Archived",
        description: "The assessment has been archived successfully."
      });
      
      // Update local state
      setAssessment({
        ...assessment,
        status: "archived"
      });
      
    } catch (error) {
      console.error("Error archiving assessment:", error);
      toast({
        title: "Error",
        description: "Failed to archive assessment. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleUnarchiveAssessment = async () => {
    try {
      if (!assessment) return;
      
      await assessmentService.updateAssessment(assessmentId!, {
        status: "active"
      });
      
      toast({
        title: "Assessment Unarchived",
        description: "The assessment has been unarchived and is now active."
      });
      
      // Update local state
      setAssessment({
        ...assessment,
        status: "active"
      });
      
    } catch (error) {
      console.error("Error unarchiving assessment:", error);
      toast({
        title: "Error",
        description: "Failed to unarchive assessment. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }
  
  if (!assessment) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Assessment Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The assessment you're looking for doesn't exist or has been removed.
        </p>
        <Button 
          variant="default" 
          onClick={() => navigate("/assessments")}
          className="bg-system-blue-600 hover:bg-system-blue-700"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Assessments
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/assessments")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{assessment.title}</h1>
            <div className="flex items-center gap-2">
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
          <p className="text-muted-foreground mt-1">
            Created {formatDate(assessment.created_at)} •
            Last updated {formatDate(assessment.updated_at)}
          </p>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {hasRole(["admin", "hr"]) && (
          <>
            {assessment.status !== "archived" ? (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleEditAssessment}
                  className="h-9"
                >
                  <Edit className="h-4 w-4 mr-2" /> Edit Assessment
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleDuplicateAssessment}
                  className="h-9"
                >
                  <Copy className="h-4 w-4 mr-2" /> Duplicate
                </Button>
                {assessment.status === "active" && (
                  <Button 
                    size="sm" 
                    onClick={handleSendToCandidate}
                    className="h-9 bg-system-blue-600 hover:bg-system-blue-700"
                  >
                    <Send className="h-4 w-4 mr-2" /> Send to Candidates
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleArchiveAssessment}
                  className="h-9 text-system-red-500 hover:text-system-red-600"
                >
                  <Archive className="h-4 w-4 mr-2" /> Archive
                </Button>
              </>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleUnarchiveAssessment}
                className="h-9 text-system-green-500 hover:text-system-green-600"
              >
                <CheckCircle className="h-4 w-4 mr-2" /> Unarchive
              </Button>
            )}
          </>
        )}
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate(`/assessments/${assessmentId}/results`)}
          className="h-9 ml-auto"
        >
          <Eye className="h-4 w-4 mr-2" /> View All Results
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Assessment Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-medium">Description</h3>
            <p className="text-sm text-muted-foreground mt-1">{assessment.description}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-medium flex items-center">
                <Timer className="h-4 w-4 mr-2 text-muted-foreground" /> Duration
              </span>
              <span className="text-sm text-muted-foreground">{assessment.duration_minutes} minutes</span>
            </div>
            
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-medium flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-muted-foreground" /> Passing Score
              </span>
              <span className="text-sm text-muted-foreground">{assessment.passing_score}%</span>
            </div>
            
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-medium flex items-center">
                <FileText className="h-4 w-4 mr-2 text-muted-foreground" /> Questions
              </span>
              <span className="text-sm text-muted-foreground">
                {assessment.stats?.questionCount || 0} questions
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="questions" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="questions">
            <FileText className="h-4 w-4 mr-2" /> Questions
          </TabsTrigger>
          <TabsTrigger value="results">
            <Users className="h-4 w-4 mr-2" /> Results
          </TabsTrigger>
          <TabsTrigger value="stats">
            <CheckCircle className="h-4 w-4 mr-2" /> Statistics
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="questions" className="space-y-4">
          {assessment.coding_questions && assessment.coding_questions.length > 0 ? (
            assessment.coding_questions.map((question, index) => (
              <Card key={question.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <CardTitle className="text-base">Question {index + 1}</CardTitle>
                    <Badge variant="outline" className={getAssessmentTypeStyles(question.type)}>
                      {getAssessmentTypeLabel(question.type)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">{question.question}</p>
                  
                  {question.type === "mcq" && question.options && (
                    <div className="space-y-2 pl-4">
                      {question.options.map((option, idx) => (
                        <div 
                          key={idx} 
                          className={`text-sm p-2 rounded-md ${
                            option.isCorrect 
                              ? "bg-system-green-50 border border-system-green-200" 
                              : "bg-system-gray-50 border border-system-gray-200"
                          }`}
                        >
                          {option.text} {option.isCorrect && (
                            <span className="text-system-green-500 font-medium ml-2">(Correct)</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {question.type !== "mcq" && question.correct_answer && (
                    <div className="mt-2">
                      <h4 className="text-sm font-medium">Expected Answer:</h4>
                      <p className="text-sm text-muted-foreground mt-1">{question.correct_answer}</p>
                    </div>
                  )}
                  
                  <div className="mt-4 text-sm text-muted-foreground">
                    Points: <span className="font-medium">{question.points}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 bg-muted/20 rounded-lg">
              <h3 className="text-lg font-medium mb-2">No Questions Added</h3>
              <p className="text-muted-foreground mb-4">
                This assessment doesn't have any questions yet.
              </p>
              {hasRole(["admin", "hr"]) && assessment.status !== "archived" && (
                <Button 
                  onClick={handleEditAssessment}
                  className="bg-system-blue-600 hover:bg-system-blue-700"
                >
                  <Edit className="h-4 w-4 mr-2" /> Edit Assessment
                </Button>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="results" className="space-y-4">
          {results.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Recent Results</CardTitle>
                <CardDescription>
                  Showing the most recent assessment completions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="min-w-full divide-y divide-border">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Candidate</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Score</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Completed</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-background divide-y divide-border">
                      {results.map((result) => (
                        <tr key={result.id}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{result.candidate_name}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <span className={`font-medium ${result.score >= assessment.passing_score ? 'text-system-green-600' : 'text-system-red-500'}`}>
                              {result.score}%
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <Badge 
                              variant="outline" 
                              className={result.score >= assessment.passing_score 
                                ? "bg-system-green-100 text-system-green-600 border-system-green-200" 
                                : "bg-system-red-100 text-system-red-500 border-system-red-200"
                              }
                            >
                              {result.score >= assessment.passing_score ? "Passed" : "Failed"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">
                            {formatDate(result.completion_date, "MMM d, yyyy", "Not completed")}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                            <Button size="sm" variant="outline" className="h-8 text-xs">
                              View Details
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate(`/assessments/${assessmentId}/results`)}
                >
                  View All Results
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="text-center py-12 bg-muted/20 rounded-lg">
              <h3 className="text-lg font-medium mb-2">No Results Yet</h3>
              <p className="text-muted-foreground mb-6">
                No candidates have completed this assessment yet.
              </p>
              {hasRole(["admin", "hr"]) && assessment.status === "active" && (
                <Button 
                  onClick={handleSendToCandidate}
                  className="bg-system-blue-600 hover:bg-system-blue-700"
                >
                  <Send className="h-4 w-4 mr-2" /> Send to Candidates
                </Button>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Completion Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Total Attempts</p>
                    <p className="text-3xl font-bold">{assessment.stats?.completionCount || 0}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Average Score</p>
                    <p className="text-3xl font-bold">
                      {assessment.stats?.averageScore 
                        ? `${assessment.stats.averageScore}%` 
                        : "N/A"
                      }
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Pass Rate</p>
                    <p className="text-3xl font-bold">
                      {assessment.stats?.passRate 
                        ? `${assessment.stats.passRate}%` 
                        : "N/A"
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Assessment Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Questions</p>
                    <p className="text-3xl font-bold">{assessment.stats?.questionCount || 0}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Duration</p>
                    <p className="text-3xl font-bold">{assessment.duration_minutes} min</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Passing Score</p>
                    <p className="text-3xl font-bold">{assessment.passing_score}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AssessmentDetails; 