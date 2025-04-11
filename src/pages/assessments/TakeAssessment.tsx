import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/hooks/use-toast";
import { AlertCircle, ArrowLeft, ArrowRight, Clock, CheckCircle } from "lucide-react";
import { assessmentService } from "@/services/assessmentService";
import { assessmentQuestionService } from "@/services/assessmentQuestionService";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Option {
  id: string;
  text: string;
}

interface Question {
  id: string;
  question: string;
  title?: string;
  description?: string;
  type: string;
  options?: Option[];
  order_num: number;
}

interface Assessment {
  id: string;
  title: string;
  description: string;
  type: "mcq" | "coding" | "text";
  duration_minutes: number;
  passing_score: number;
  questions: Question[];
}

const TakeAssessment: React.FC = () => {
  const { assessmentId, assignmentId } = useParams<{ assessmentId: string, assignmentId: string }>();
  const navigate = useNavigate();
  
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: any }>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [assessmentStarted, setAssessmentStarted] = useState(false);
  
  // Format time remaining
  const formatTimeRemaining = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Fetch assessment details and setup timer
  useEffect(() => {
    const fetchAssessment = async () => {
      if (!assessmentId || !assignmentId) return;
      
      try {
        setLoading(true);
        const assessmentData = await assessmentService.getAssessmentForTaking(assessmentId, assignmentId);
        
        if (!assessmentData) {
          throw new Error("Failed to load assessment data");
        }
        
        // Ensure questions array is valid
        const validQuestions = Array.isArray(assessmentData.questions) ? assessmentData.questions : [];
        
        // Process questions to ensure consistent format
        const processedQuestions = validQuestions.map(q => ({
          id: q.id || `question-${Math.random().toString(36).substring(2, 9)}`,
          question: q.question || q.title || "Question",
          title: q.title,
          description: q.description,
          type: q.type || assessmentData.type,
          options: Array.isArray(q.options) ? q.options.map((opt, idx) => {
            // Handle both string options and object options
            if (typeof opt === 'string') {
              return { id: `${q.id}_opt_${idx}`, text: opt };
            }
            return { 
              id: opt.id || `${q.id}_opt_${idx}`, 
              text: opt.text || `Option ${idx + 1}` 
            };
          }) : [],
          order_num: q.order_num || 0
        }));
        
        setAssessment({
          ...assessmentData,
          questions: processedQuestions
        });
        
        // Initialize time left based on duration
        setTimeLeft(assessmentData.duration_minutes * 60);
        
        // Initialize answers object
        const initialAnswers: { [key: string]: any } = {};
        processedQuestions.forEach((question: Question) => {
          if (question.type === "mcq") {
            initialAnswers[question.id] = null;
          } else {
            initialAnswers[question.id] = "";
          }
        });
        setAnswers(initialAnswers);
        
        // Check if the assessment is already started
        if (assessmentData.status === 'in_progress') {
          setAssessmentStarted(true);
        }
        
      } catch (error) {
        console.error("Error fetching assessment:", error);
        toast({
          title: "Error",
          description: "Failed to load assessment. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchAssessment();
  }, [assessmentId, assignmentId]);
  
  // Timer countdown
  useEffect(() => {
    if (!assessmentStarted || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [assessmentStarted, timeLeft]);
  
  const handleTimeUp = () => {
    toast({
      title: "Time's up!",
      description: "Your assessment is being submitted automatically.",
      variant: "destructive",
    });
    
    handleSubmitAssessment();
  };
  
  const handleStartAssessment = async () => {
    try {
      if (!assignmentId) {
        throw new Error("Missing assignment ID");
      }
      
      await assessmentService.startAssessment(assignmentId);
      setAssessmentStarted(true);
      
      toast({
        title: "Assessment Started",
        description: "Your assessment timer has started. Good luck!",
      });
    } catch (error) {
      console.error("Error starting assessment:", error);
      toast({
        title: "Error",
        description: "Failed to start assessment. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };
  
  const handleNextQuestion = () => {
    if (assessment && currentQuestion < assessment.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };
  
  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };
  
  const isQuestionAnswered = (questionId: string) => {
    if (answers[questionId] === null || answers[questionId] === undefined) {
      return false;
    }
    
    if (typeof answers[questionId] === 'string' && answers[questionId].trim() === '') {
      return false;
    }
    
    return true;
  };
  
  const getCompletionPercentage = () => {
    if (!assessment) return 0;
    
    const answeredQuestions = Object.keys(answers).filter(questionId => 
      isQuestionAnswered(questionId)
    ).length;
    
    return Math.round((answeredQuestions / assessment.questions.length) * 100);
  };
  
  const handleSubmitAssessment = async () => {
    if (!assessment || !assignmentId) return;
    
    try {
      setIsSubmitting(true);
      setShowConfirmSubmit(false);
      
      // Prepare submission data
      const submissionData = {
        answers: Object.entries(answers).map(([questionId, answer]) => ({
          question_id: questionId,
          answer: answer
        }))
      };
      
      const result = await assessmentService.submitAssessment(assignmentId, submissionData);
      
      // Show score if it was automatically calculated (for MCQ)
      if (result.calculatedScore !== null && result.calculatedScore !== undefined) {
        toast({
          title: "Assessment Submitted",
          description: `Your assessment has been submitted successfully. Your score: ${result.calculatedScore}%`,
        });
      } else {
        toast({
          title: "Assessment Submitted",
          description: "Your assessment has been submitted successfully.",
        });
      }
      
      // Navigate to results or dashboard
      navigate("/assessments");
      
    } catch (error) {
      console.error("Error submitting assessment:", error);
      toast({
        title: "Submission Error",
        description: "Failed to submit your assessment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
  
  if (!assessmentStarted) {
    return (
      <div className="mx-auto my-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{assessment.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium">Description</h3>
              <p className="text-muted-foreground">{assessment.description}</p>
            </div>
            
            <div className="space-y-2 border-t border-b py-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration:</span>
                <span className="font-medium">{assessment.duration_minutes} minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Questions:</span>
                <span className="font-medium">{assessment.questions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Passing Score:</span>
                <span className="font-medium">{assessment.passing_score}%</span>
              </div>
            </div>
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Important</AlertTitle>
              <AlertDescription>
                Once you start this assessment, the timer will begin and you'll have {assessment.duration_minutes} minutes to complete it.
                Please ensure you have enough time to complete the assessment without interruptions.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handleStartAssessment}>
              Start Assessment
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Make sure we have questions before trying to display them
  if (!assessment.questions || assessment.questions.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-medium">No Questions Available</h2>
        <p className="text-muted-foreground mt-2">This assessment doesn't have any questions.</p>
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
  
  const question = assessment.questions[currentQuestion];
  
  return (
    <div className="max-w-4xl mx-auto my-8 space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowConfirmExit(true)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Exit
        </Button>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono font-bold">{formatTimeRemaining(timeLeft)}</span>
          </div>
          
          <div>
            <span className="text-sm text-muted-foreground">
              Question {currentQuestion + 1} of {assessment.questions.length}
            </span>
          </div>
        </div>
      </div>
      
      <Progress value={getCompletionPercentage()} className="h-2" />
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Question {currentQuestion + 1}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-base">{question.question}</p>
          {question.description && (
            <p className="text-sm text-muted-foreground">{question.description}</p>
          )}
          
          {question.type === "mcq" && question.options && question.options.length > 0 && (
            <RadioGroup
              value={answers[question.id]}
              onValueChange={(value) => handleAnswerChange(question.id, parseInt(value))}
              className="space-y-3"
            >
              {question.options.map((option, index) => (
                <div key={option.id || index} className="flex items-center space-x-2">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="cursor-pointer">{option.text || option.text}</Label>
                </div>
              ))}
            </RadioGroup>
          )}
          
          {question.type === "text" && (
            <Textarea 
              placeholder="Enter your answer here..."
              value={answers[question.id] || ""}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              className="min-h-32"
            />
          )}
          
          {question.type === "coding" && (
            <Textarea 
              placeholder="Write your code here..."
              value={answers[question.id] || ""}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              className="min-h-64 font-mono"
            />
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handlePrevQuestion}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>
          
          <div className="flex gap-2">
            {currentQuestion === assessment.questions.length - 1 ? (
              <Button 
                onClick={() => setShowConfirmSubmit(true)}
                className="bg-system-green-600 hover:bg-system-green-700"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Submit Assessment
              </Button>
            ) : (
              <Button onClick={handleNextQuestion}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
      
      {/* Question navigation */}
      <div className="bg-background border rounded-md p-4">
        <div className="flex flex-wrap gap-2">
          {assessment.questions.map((q, index) => (
            <Button
              key={q.id}
              variant={index === currentQuestion ? "default" : isQuestionAnswered(q.id) ? "outline" : "secondary"}
              size="sm"
              className={`w-10 h-10 ${
                isQuestionAnswered(q.id) && index !== currentQuestion
                  ? "bg-system-green-100 text-system-green-800 border-system-green-300"
                  : ""
              }`}
              onClick={() => setCurrentQuestion(index)}
            >
              {index + 1}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Confirmation Dialogs */}
      <Dialog open={showConfirmSubmit} onOpenChange={setShowConfirmSubmit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Assessment</DialogTitle>
            <DialogDescription>
              Are you sure you want to submit your assessment? You won't be able to make changes after submission.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Completed: {getCompletionPercentage()}% ({Object.keys(answers).filter(id => isQuestionAnswered(id)).length} of {assessment.questions.length} questions)
            </p>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowConfirmSubmit(false)}
            >
              Continue Assessment
            </Button>
            <Button 
              onClick={handleSubmitAssessment}
              disabled={isSubmitting}
              className="bg-system-green-600 hover:bg-system-green-700"
            >
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Submit
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showConfirmExit} onOpenChange={setShowConfirmExit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exit Assessment</DialogTitle>
            <DialogDescription>
              Are you sure you want to exit? Your progress will be lost, and the assessment will not be submitted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowConfirmExit(false)}
            >
              Continue Assessment
            </Button>
            <Button 
              variant="destructive"
              onClick={() => navigate("/assessments")}
            >
              Exit Without Saving
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TakeAssessment; 