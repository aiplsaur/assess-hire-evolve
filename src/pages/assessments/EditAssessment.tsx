import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
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
import { useNavigate, useParams } from "react-router-dom";
import { assessmentService } from "@/services/assessmentService";
import { toast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";

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
  status: z.enum(["draft", "active", "archived"], {
    required_error: "Please select an assessment status"
  })
});

type AssessmentFormValues = z.infer<typeof assessmentFormSchema>;

const EditAssessment: React.FC = () => {
  const navigate = useNavigate();
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    const fetchAssessment = async () => {
      if (!assessmentId) return;
      
      try {
        setIsLoading(true);
        const assessment = await assessmentService.getAssessmentById(assessmentId);
        
        if (assessment) {
          form.reset({
            title: assessment.title,
            description: assessment.description,
            type: assessment.type,
            durationMinutes: assessment.duration_minutes,
            passingScore: assessment.passing_score,
            status: assessment.status
          });
        }
      } catch (error) {
        console.error("Error fetching assessment:", error);
        toast({
          title: "Error",
          description: "Failed to load assessment details. Please try again.",
          variant: "destructive",
        });
        navigate("/assessments");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssessment();
  }, [assessmentId, form, navigate]);

  const onSubmit = async (data: AssessmentFormValues) => {
    if (!assessmentId) return;
    
    setIsSubmitting(true);
    try {
      await assessmentService.updateAssessment(assessmentId, {
        title: data.title,
        description: data.description,
        type: data.type,
        durationMinutes: data.durationMinutes,
        passingScore: data.passingScore,
        status: data.status
      });
      
      toast({
        title: "Assessment Updated",
        description: "Assessment has been updated successfully",
      });
      
      // Navigate back to the assessment details
      navigate(`/assessments/${assessmentId}`);
    } catch (error) {
      console.error("Error updating assessment:", error);
      toast({
        title: "Failed to update assessment",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/assessments/${assessmentId}`)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Assessment</h1>
          <p className="text-muted-foreground">
            Update assessment details
          </p>
        </div>
      </div>

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
                        value={field.value}
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
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select assessment status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft (Save for later)</SelectItem>
                        <SelectItem value="active">Active (Ready to use)</SelectItem>
                        <SelectItem value="archived">Archived (No longer in use)</SelectItem>
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
                  onClick={() => navigate(`/assessments/${assessmentId}`)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-system-blue-600 hover:bg-system-blue-700"
                >
                  {isSubmitting ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" /> Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditAssessment; 