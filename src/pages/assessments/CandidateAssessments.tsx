import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Timer, CheckCircle, ArrowRight, PlayCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { assessmentService } from "@/services/assessmentService";
import { toast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { formatDate, formatDateTime } from "@/utils/dateUtils";

interface AssessmentAssignment {
  id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'evaluated';
  score?: number | null;
  started_at?: string | null;
  completed_at?: string | null;
  created_at: string;
  assessments?: {
    id: string;
    title: string;
    description: string;
    type: string;
    duration_minutes: number;
    passing_score: number;
  } | null;
  applications?: {
    id: string;
    jobs?: {
      id: string;
      title: string;
    } | null;
  } | null;
}

const getStatusBadge = (status: string, score?: number | null, passingScore?: number) => {
  switch (status) {
    case 'pending':
      return (
        <Badge variant="outline" className="bg-system-yellow-100 text-system-yellow-600 border-system-yellow-300">
          Not Started
        </Badge>
      );
    case 'in_progress':
      return (
        <Badge variant="outline" className="bg-system-blue-100 text-system-blue-600 border-system-blue-300">
          In Progress
        </Badge>
      );
    case 'completed':
      if (score !== undefined && score !== null && passingScore !== undefined) {
        if (score >= passingScore) {
          return (
            <Badge variant="outline" className="bg-system-green-100 text-system-green-600 border-system-green-300">
              Passed ({score}%)
            </Badge>
          );
        } else {
          return (
            <Badge variant="outline" className="bg-system-red-100 text-system-red-600 border-system-red-300">
              Failed ({score}%)
            </Badge>
          );
        }
      }
      return (
        <Badge variant="outline" className="bg-system-gray-100 text-system-gray-600 border-system-gray-300">
          Completed
        </Badge>
      );
    default:
      return (
        <Badge variant="outline">
          {status}
        </Badge>
      );
  }
};

const CandidateAssessments: React.FC = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<AssessmentAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        const data = await assessmentService.getUserAssignments();
        setAssignments(data || []);
      } catch (error) {
        console.error("Error fetching assignments:", error);
        toast({
          title: "Error",
          description: "Failed to load your assessments. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  const getActionButton = (assignment: AssessmentAssignment) => {
    if (!assignment.assessments) {
      return null;
    }

    switch (assignment.status) {
      case 'pending':
        return (
          <Button 
            onClick={() => navigate(`/assessments/${assignment.assessments.id}/take/${assignment.id}`)}
            className="bg-system-blue-600 hover:bg-system-blue-700"
          >
            <PlayCircle className="mr-2 h-4 w-4" />
            Start Assessment
          </Button>
        );
      case 'in_progress':
        return (
          <Button 
            onClick={() => navigate(`/assessments/${assignment.assessments.id}/take/${assignment.id}`)}
            className="bg-system-green-600 hover:bg-system-green-700"
          >
            <ArrowRight className="mr-2 h-4 w-4" />
            Continue Assessment
          </Button>
        );
      case 'completed':
        return (
          <Button 
            variant="outline"
            onClick={() => navigate(`/responses/${assignment.id}`)}
            className="border-system-blue-300 text-system-blue-700 hover:bg-system-blue-50"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            View Results
          </Button>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Assessments</h1>
        <p className="text-muted-foreground">
          View and take assessments assigned to you
        </p>
      </div>

      {assignments.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <h2 className="text-lg font-medium mb-2">No Assessments Found</h2>
            <p className="text-muted-foreground">
              You don't have any assessments assigned to you yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {assignments.map((assignment) => (
            assignment.assessments && (
              <Card key={assignment.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{assignment.assessments.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {assignment.applications?.jobs?.title || "Job Application"}
                      </p>
                    </div>
                    {getStatusBadge(assignment.status, assignment.score, assignment.assessments.passing_score)}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm mb-4 line-clamp-2">
                    {assignment.assessments.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-4 text-sm mb-4">
                    <div className="flex items-center gap-1">
                      <Timer className="h-4 w-4 text-muted-foreground" />
                      <span>{assignment.assessments.duration_minutes} minutes</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                      <span>Passing score: {assignment.assessments.passing_score}%</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center justify-between gap-4 text-sm border-t pt-4">
                    <div className="space-y-1">
                      <p>
                        <span className="text-muted-foreground">Assigned:</span>{" "}
                        {formatDate(assignment.created_at)}
                      </p>
                      
                      {assignment.started_at && (
                        <p>
                          <span className="text-muted-foreground">Started:</span>{" "}
                          {formatDateTime(assignment.started_at)}
                        </p>
                      )}
                      
                      {assignment.completed_at && (
                        <p>
                          <span className="text-muted-foreground">Completed:</span>{" "}
                          {formatDateTime(assignment.completed_at)}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      {getActionButton(assignment)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          ))}
        </div>
      )}
    </div>
  );
};

export default CandidateAssessments; 