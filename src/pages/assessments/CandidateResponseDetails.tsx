import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import { ArrowLeft, CheckCircle, XCircle, Timer, Clock } from "lucide-react";
import { assessmentQuestionService } from "@/services/assessmentQuestionService";
import { Separator } from "@/components/ui/separator";

interface ResponseDetails {
  assignment: {
    id: string;
    status: string;
    score: number;
    started_at: string;
    completed_at: string;
  };
  assessment: {
    id: string;
    title: string;
    description: string;
    type: string;
    passing_score: number;
  };
  candidate: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar_url?: string;
  };
  responses: any[];
  questionCount: number;
  answeredCount: number;
}

const CandidateResponseDetails: React.FC = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  
  const [responseDetails, setResponseDetails] = useState<ResponseDetails | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchResponseDetails = async () => {
      if (!assignmentId) return;
      
      try {
        setLoading(true);
        const data = await assessmentQuestionService.getAssessmentResponseDetails(assignmentId);
        setResponseDetails(data);
      } catch (error) {
        console.error("Error fetching response details:", error);
        toast({
          title: "Error",
          description: "Failed to load response details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchResponseDetails();
  }, [assignmentId]);
  
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };
  
  const formatDuration = (startTime: string, endTime: string) => {
    if (!startTime || !endTime) return "N/A";
    
    const start = parseISO(startTime);
    const end = parseISO(endTime);
    const diffMs = end.getTime() - start.getTime();
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };
  
  const renderMcqResponse = (question: any) => {
    return (
      <div className="space-y-2">
        <h4 className="font-medium">{question.question}</h4>
        <div className="space-y-1 mt-2">
          {question.options.map((option: any, index: number) => {
            const optionText = typeof option === 'string' ? option : option.text;
            return (
              <div
                key={index}
                className={`text-sm p-2 px-3 rounded flex items-center space-x-2 ${
                  question.response && question.response.selected_option === index
                    ? question.response.is_correct
                      ? "bg-system-green-50 border border-system-green-200 text-system-green-700"
                      : "bg-system-red-50 border border-system-red-200 text-system-red-700"
                    : question.correct_option === index
                    ? "bg-system-blue-50 border border-system-blue-200 text-system-blue-700"
                    : "bg-system-gray-50 border border-system-gray-200"
                }`}
              >
                <div
                  className={`flex-shrink-0 h-4 w-4 rounded-full border ${
                    question.response && question.response.selected_option === index
                      ? question.response.is_correct
                        ? "border-system-green-500"
                        : "border-system-red-500"
                      : "border-system-gray-300"
                  } flex items-center justify-center`}
                >
                  {question.response && question.response.selected_option === index && (
                    <div
                      className={`h-2 w-2 rounded-full ${
                        question.response.is_correct ? "bg-system-green-500" : "bg-system-red-500"
                      }`}
                    />
                  )}
                </div>
                <span className="flex-1">{optionText}</span>
                {question.correct_option === index && (
                  <Badge
                    variant="outline"
                    className="ml-auto bg-system-green-50 text-system-green-700 border-system-green-200"
                  >
                    Correct
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderTextResponse = (question: any) => {
    return (
      <div className="space-y-2">
        <h4 className="font-medium">{question.question}</h4>
        <div className="mt-2">
          {question.response ? (
            <div className="p-3 bg-system-gray-50 border border-system-gray-200 rounded whitespace-pre-wrap text-sm">
              {question.response.response_text || "No response submitted"}
            </div>
          ) : (
            <div className="p-3 bg-system-gray-50 border border-system-gray-200 rounded text-sm text-system-gray-500">
              No response submitted
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCodingResponse = (question: any) => {
    return (
      <div className="space-y-2">
        <h4 className="font-medium">{question.title}</h4>
        <p className="text-sm text-muted-foreground">{question.description}</p>
        <div className="mt-2">
          {question.response ? (
            <div className="p-3 bg-system-gray-900 border border-system-gray-700 rounded whitespace-pre-wrap text-sm text-system-gray-100 font-mono overflow-x-auto">
              {question.response.code_submission || "No code submitted"}
            </div>
          ) : (
            <div className="p-3 bg-system-gray-900 border border-system-gray-700 rounded text-sm text-system-gray-400 font-mono">
              No code submitted
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!responseDetails) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-medium">Response Not Found</h2>
        <p className="text-muted-foreground mt-2">
          The response details you're looking for couldn't be found.
        </p>
        <Button className="mt-4" variant="outline" onClick={() => navigate(-1)}>
          Go Back
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
          onClick={() => navigate(`/assessments/${responseDetails.assessment.id}/results`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Candidate Response</h1>
          <p className="text-muted-foreground">
            Response for "{responseDetails.assessment.title}"
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={responseDetails.candidate.avatar_url} />
                <AvatarFallback>
                  {getInitials(
                    responseDetails.candidate.first_name,
                    responseDetails.candidate.last_name
                  )}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>
                  {responseDetails.candidate.first_name} {responseDetails.candidate.last_name}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {responseDetails.candidate.email}
                </p>
              </div>
            </div>
            <div>
              <Badge
                variant="outline"
                className={`${
                  responseDetails.assignment.score >= responseDetails.assessment.passing_score
                    ? "bg-system-green-100 text-system-green-600 border-system-green-200"
                    : "bg-system-red-100 text-system-red-600 border-system-red-200"
                }`}
              >
                {responseDetails.assignment.score >= responseDetails.assessment.passing_score
                  ? "Passed"
                  : "Failed"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 mb-6">
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-medium flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-muted-foreground" /> Score
              </span>
              <div className="flex items-center">
                <span className="text-lg font-bold">
                  {responseDetails.assignment.score}%
                </span>
                <span className="text-xs text-muted-foreground ml-2">
                  (Passing: {responseDetails.assessment.passing_score}%)
                </span>
              </div>
              <div className="w-full mt-1">
                <Progress
                  value={responseDetails.assignment.score}
                  max={100}
                  className={`h-2 ${
                    responseDetails.assignment.score >= responseDetails.assessment.passing_score
                      ? "bg-gray-100 [&>div]:bg-green-500"
                      : "bg-gray-100 [&>div]:bg-red-500"
                  }`}
                />
              </div>
            </div>

            <div className="flex flex-col space-y-1">
              <span className="text-sm font-medium flex items-center">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" /> Completion Time
              </span>
              <span className="text-sm">
                {responseDetails.assignment.completed_at
                  ? format(
                      parseISO(responseDetails.assignment.completed_at),
                      "MMM d, yyyy 'at' h:mm a"
                    )
                  : "Not completed"}
              </span>
              {responseDetails.assignment.started_at && responseDetails.assignment.completed_at && (
                <span className="text-xs text-muted-foreground">
                  Duration: {formatDuration(
                    responseDetails.assignment.started_at,
                    responseDetails.assignment.completed_at
                  )}
                </span>
              )}
            </div>

            <div className="flex flex-col space-y-1">
              <span className="text-sm font-medium flex items-center">
                <Timer className="h-4 w-4 mr-2 text-muted-foreground" /> Questions Answered
              </span>
              <span className="text-sm">
                {responseDetails.answeredCount} of {responseDetails.questionCount} questions
              </span>
              <span className="text-xs text-muted-foreground">
                {Math.round((responseDetails.answeredCount / responseDetails.questionCount) * 100)}% completion
              </span>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="space-y-8">
            <h3 className="text-lg font-medium">Responses</h3>

            {responseDetails.responses.map((question, index) => (
              <div key={question.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="h-6 w-6 flex items-center justify-center rounded-full p-0">
                      {index + 1}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {question.type === 'mcq'
                        ? 'Multiple Choice'
                        : question.type === 'coding'
                        ? 'Coding Challenge'
                        : 'Text Response'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {question.type === 'mcq' && question.response && (
                      <Badge
                        variant="outline"
                        className={`${
                          question.response.is_correct
                            ? 'bg-system-green-100 text-system-green-600 border-system-green-200'
                            : 'bg-system-red-100 text-system-red-600 border-system-red-200'
                        }`}
                      >
                        {question.response.is_correct ? 'Correct' : 'Incorrect'}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">{question.points} {question.points === 1 ? 'point' : 'points'}</span>
                  </div>
                </div>

                {question.type === 'mcq' && renderMcqResponse(question)}
                {question.type === 'text' && renderTextResponse(question)}
                {question.type === 'coding' && renderCodingResponse(question)}
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button
            variant="outline"
            onClick={() => navigate(`/assessments/${responseDetails.assessment.id}/results`)}
          >
            Back to Results
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CandidateResponseDetails; 