import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { ArrowLeft, PlusCircle, Trash2 } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { assessmentService } from "@/services/assessmentService";
import { toast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";

// Define form schema using zod
const assessmentFormSchema = z.object({
  title: z.string()
    .min(5, { message: "Title must be at least 5 characters" })
    .max(100, { message: "Title cannot exceed 100 characters" }),
  description: z.string()
    .min(10, { message: "Description must be at least 10 characters" })
    .max(500, { message: "Description cannot exceed 500 characters" }),
  type: z.enum(["mcq", "coding", "text"], {
    required_error: "Please select an assessment type"
  }),
  durationMinutes: z.coerce.number()
    .min(5, { message: "Duration must be at least 5 minutes" })
    .max(240, { message: "Duration cannot exceed 240 minutes" }),
  passingScore: z.coerce.number()
    .min(0, { message: "Passing score must be at least 0%" })
    .max(100, { message: "Passing score cannot exceed 100%" }),
  status: z.enum(["draft", "active"], {
    required_error: "Please select an assessment status"
  })
});

type AssessmentFormValues = z.infer<typeof assessmentFormSchema>;

// Question component for managing questions after creating the assessment
interface QuestionEditorProps {
  assessmentId: string | null;
  assessmentType: string;
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({ assessmentId, assessmentType }) => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    options: ['', ''],
    correctOption: 0,
    points: 1,
    description: '',
    wordLimit: 500
  });

  const handleAddQuestion = async () => {
    if (!assessmentId) return;
    
    try {
      setLoading(true);
      let newQuestionData;
      
      if (assessmentType === 'mcq') {
        newQuestionData = await assessmentService.createMcqQuestion(assessmentId, {
          question: newQuestion.question,
          options: newQuestion.options.filter(opt => opt.trim() !== ''),
          correctOption: newQuestion.correctOption,
          points: newQuestion.points
        });
      } else if (assessmentType === 'coding') {
        newQuestionData = await assessmentService.createCodingQuestion(assessmentId, {
          title: newQuestion.question,
          description: newQuestion.description,
          starterCode: '',
          testCases: [],
          points: newQuestion.points
        });
      } else if (assessmentType === 'text') {
        newQuestionData = await assessmentService.createTextQuestion(assessmentId, {
          question: newQuestion.question,
          wordLimit: newQuestion.wordLimit,
          points: newQuestion.points
        });
      }
      
      setQuestions(prevQuestions => [...prevQuestions, newQuestionData]);
      setShowAddQuestion(false);
      
      // Reset form fields
      setNewQuestion({
        question: '',
        options: ['', ''],
        correctOption: 0,
        points: 1,
        description: '',
        wordLimit: 500
      });
      
      toast({
        title: "Question Added",
        description: "The question has been added successfully."
      });
    } catch (error) {
      console.error(`Error adding ${assessmentType} question:`, error);
      toast({
        title: "Error",
        description: `Failed to add question. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string, index: number) => {
    if (!assessmentId) return;
    
    try {
      setLoading(true);
      
      if (assessmentType === 'mcq') {
        await assessmentService.deleteMcqQuestion(questionId);
      } else if (assessmentType === 'coding') {
        // Implement delete for coding questions if you have the function
      } else if (assessmentType === 'text') {
        // Implement delete for text questions if you have the function
      }
      
      // Remove question from local state
      setQuestions(prevQuestions => prevQuestions.filter((_, i) => i !== index));
      
      toast({
        title: "Question Deleted",
        description: "The question has been deleted successfully."
      });
    } catch (error) {
      console.error(`Error deleting ${assessmentType} question:`, error);
      toast({
        title: "Error",
        description: `Failed to delete question. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    setNewQuestion(prev => {
      const newOptions = [...prev.options];
      newOptions[index] = value;
      return { ...prev, options: newOptions };
    });
  };
  
  const addOption = () => {
    setNewQuestion(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };
  
  const removeOption = (index: number) => {
    if (newQuestion.options.length <= 2) return;
    
    setNewQuestion(prev => {
      const newOptions = [...prev.options];
      newOptions.splice(index, 1);
      
      // Adjust correctOption if needed
      let correctOption = prev.correctOption;
      if (correctOption >= index && correctOption > 0) {
        correctOption--;
      }
      
      return { 
        ...prev, 
        options: newOptions,
        correctOption: correctOption
      };
    });
  };

  // Simple radio button component for the MCQ editor
  const Radio = ({ checked, onCheckedChange, className }: { 
    checked: boolean; 
    onCheckedChange: () => void; 
    className?: string 
  }) => {
    return (
      <button
        type="button"
        className={`rounded-full border border-primary ${checked ? 'bg-primary' : 'bg-background'} 
          flex items-center justify-center ${className}`}
        onClick={onCheckedChange}
      >
        {checked && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
      </button>
    );
  };

  if (!assessmentId) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Please save the assessment first to add questions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">
          Questions ({questions.length})
        </h3>
        <Button 
          onClick={() => setShowAddQuestion(true)}
          variant="outline"
          size="sm"
          className="h-8"
          disabled={showAddQuestion}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Question
        </Button>
      </div>

      {questions.length > 0 && (
        <div className="space-y-3">
          {questions.map((question, index) => (
            <Card key={question.id || index} className="relative overflow-hidden">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="h-6 w-6 flex items-center justify-center rounded-full p-0">
                        {index + 1}
                      </Badge>
                      <h4 className="font-medium">
                        {question.question || question.title}
                      </h4>
                    </div>
                    
                    {assessmentType === 'mcq' && question.options && (
                      <div className="pl-8 mt-2 space-y-1">
                        {Array.isArray(question.options) && question.options.map((option: string, optIndex: number) => (
                          <div key={optIndex} className={`text-sm p-1.5 px-3 rounded ${
                            question.correct_option === optIndex ? 
                              'bg-system-green-50 border border-system-green-200 text-system-green-700' : 
                              'bg-system-gray-50 border border-system-gray-200'
                          }`}>
                            {option}
                            {question.correct_option === optIndex && (
                              <span className="ml-2 text-xs text-system-green-600 font-medium">(Correct)</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {assessmentType === 'coding' && question.description && (
                      <p className="text-sm text-muted-foreground pl-8">
                        {question.description.length > 100 
                          ? question.description.substring(0, 100) + '...' 
                          : question.description}
                      </p>
                    )}
                    
                    <div className="pl-8 mt-1.5">
                      <span className="text-xs text-muted-foreground">
                        Points: {question.points || 1}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteQuestion(question.id, index)}
                      className="h-8 w-8 text-system-red-500 hover:text-system-red-600 hover:bg-system-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {showAddQuestion && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add New Question</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="question" className="text-sm font-medium">
                Question {assessmentType === 'coding' ? 'Title' : 'Text'}
              </label>
              <Textarea 
                id="question"
                placeholder={`Enter your ${assessmentType === 'coding' ? 'coding challenge title' : 'question text'}...`}
                value={newQuestion.question}
                onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                className="min-h-20"
              />
            </div>
            
            {assessmentType === 'mcq' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Answer Options</label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    className="h-7 text-xs"
                    onClick={addOption}
                  >
                    Add Option
                  </Button>
                </div>
                
                {newQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Radio 
                      checked={newQuestion.correctOption === index}
                      onCheckedChange={() => setNewQuestion({ ...newQuestion, correctOption: index })}
                      className="h-4 w-4"
                    />
                    <Input
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className="flex-1"
                    />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8 text-system-red-500"
                      onClick={() => removeOption(index)}
                      disabled={newQuestion.options.length <= 2}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">
                  Select the radio button next to the correct answer.
                </p>
              </div>
            )}
            
            {assessmentType === 'coding' && (
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description
                </label>
                <Textarea 
                  id="description"
                  placeholder="Enter a detailed description of the coding challenge..."
                  value={newQuestion.description}
                  onChange={(e) => setNewQuestion({ ...newQuestion, description: e.target.value })}
                  className="min-h-32"
                />
              </div>
            )}
            
            {assessmentType === 'text' && (
              <div className="space-y-2">
                <label htmlFor="wordLimit" className="text-sm font-medium">Word Limit</label>
                <Input
                  id="wordLimit"
                  type="number"
                  min="50"
                  max="5000"
                  value={newQuestion.wordLimit}
                  onChange={(e) => setNewQuestion({ ...newQuestion, wordLimit: parseInt(e.target.value) || 500 })}
                />
                <p className="text-xs text-muted-foreground">
                  Maximum word count for the candidate's response.
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="points" className="text-sm font-medium">Points</label>
                <Input
                  id="points"
                  type="number"
                  min="1"
                  max="100"
                  value={newQuestion.points}
                  onChange={(e) => setNewQuestion({ ...newQuestion, points: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setShowAddQuestion(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button"
              onClick={handleAddQuestion}
              disabled={!newQuestion.question.trim() || loading}
            >
              {loading ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" /> Adding...
                </>
              ) : (
                "Add Question"
              )}
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {!questions.length && !showAddQuestion && (
        <div className="bg-muted/20 rounded-md p-6 text-center">
          <p className="text-muted-foreground">
            No questions added yet. Click "Add Question" to create your first question.
          </p>
        </div>
      )}
    </div>
  );
};

const CreateAssessment: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [createdAssessmentId, setCreatedAssessmentId] = useState<string | null>(null);

  const form = useForm<AssessmentFormValues>({
    resolver: zodResolver(assessmentFormSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "mcq",
      durationMinutes: 60,
      passingScore: 70,
      status: "draft"
    }
  });

  const onSubmit = async (data: AssessmentFormValues) => {
    setIsSubmitting(true);
    try {
      const assessment = await assessmentService.createAssessment({
        title: data.title,
        description: data.description,
        type: data.type,
        durationMinutes: data.durationMinutes,
        passingScore: data.passingScore,
        status: data.status
      });
      
      toast({
        title: "Assessment Created",
        description: "Assessment has been created successfully. You can now add questions.",
      });
      
      // Set the created assessment ID
      setCreatedAssessmentId(assessment.id);
      
      // Switch to questions tab
      setActiveTab("questions");
      
    } catch (error) {
      console.error("Error creating assessment:", error);
      toast({
        title: "Failed to create assessment",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinish = () => {
    if (createdAssessmentId) {
      navigate(`/assessments/${createdAssessmentId}`);
    } else {
      navigate("/assessments");
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-2 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/assessments")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create Assessment</h1>
          <p className="text-muted-foreground">
            Create a new assessment and add questions
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 w-[400px]">
          <TabsTrigger value="details">Assessment Details</TabsTrigger>
          <TabsTrigger value="questions" disabled={!createdAssessmentId}>Questions</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Assessment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assessment Title</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g. Frontend Developer Technical Assessment" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Create a clear, descriptive title for your assessment.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe what this assessment will evaluate..." 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Explain what skills or knowledge the assessment will evaluate.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Assessment Type</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="mcq" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Multiple Choice Questions
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="coding" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Coding Challenge
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="text" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Written Response
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormDescription>
                          Select the type of assessment you want to create.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="durationMinutes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration (minutes)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min={5} 
                              max={240} 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            How long candidates have to complete the assessment.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="passingScore"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Passing Score (%)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min={0} 
                              max={100} 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Minimum percentage required to pass the assessment.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select 
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select assessment status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="draft">Draft (Save for later)</SelectItem>
                            <SelectItem value="active">Active (Ready to use)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Set as draft to continue editing or active to make it available for assignments.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/assessments")}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isSubmitting || !!createdAssessmentId}
                      className="bg-system-blue-600 hover:bg-system-blue-700"
                    >
                      {isSubmitting ? (
                        <>
                          <Spinner className="mr-2 h-4 w-4" /> Creating...
                        </>
                      ) : createdAssessmentId ? (
                        "Assessment Created"
                      ) : (
                        "Create Assessment"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions">
          <Card>
            <CardHeader>
              <CardTitle>Assessment Questions</CardTitle>
              <CardDescription>
                Add questions to your assessment. You can add as many questions as needed.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <QuestionEditor 
                assessmentId={createdAssessmentId} 
                assessmentType={form.getValues("type")} 
              />
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                onClick={handleFinish}
                className="bg-system-blue-600 hover:bg-system-blue-700"
              >
                Finish
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CreateAssessment; 