import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { candidateService } from "@/services/candidateService";
import { applicationService } from "@/services/applicationService";
import { interviewService } from "@/services/interviewService";
import { authService } from "@/services/authService";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { ArrowLeft, Calendar, Users, Clock, MapPin, Link as LinkIcon } from "lucide-react";
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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { format } from "date-fns";

// Define form schema using zod
const interviewFormSchema = z.object({
  interviewerId: z.string({
    required_error: "Interviewer is required",
  }),
  scheduledAt: z.string({
    required_error: "Date and time are required",
  }),
  durationMinutes: z.number({
    required_error: "Duration is required",
  }).min(15, { message: "Duration must be at least 15 minutes" }),
  location: z.string().optional(),
  meetingLink: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
  notes: z.string().optional(),
});

type InterviewFormValues = z.infer<typeof interviewFormSchema>;

// Types
interface Candidate {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  applications: Application[];
}

interface Application {
  id: string;
  status: string;
  jobs: {
    id: string;
    title: string;
    department: string;
  };
}

interface Interviewer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

const ScheduleInterview: React.FC = () => {
  const { candidateId } = useParams<{ candidateId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const applicationId = searchParams.get("applicationId");
  
  const { user } = useAuth();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [application, setApplication] = useState<Application | null>(null);
  const [interviewers, setInterviewers] = useState<Interviewer[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Initialize form
  const form = useForm<InterviewFormValues>({
    resolver: zodResolver(interviewFormSchema),
    defaultValues: {
      interviewerId: "",
      scheduledAt: "",
      durationMinutes: 60,
      location: "",
      meetingLink: "",
      notes: "",
    },
  });
  
  useEffect(() => {
    const fetchData = async () => {
      if (!candidateId) return;
      
      try {
        setLoading(true);
        
        // Fetch candidate details
        const candidateData = await candidateService.getCandidateById(candidateId);
        setCandidate(candidateData);
        
        // If applicationId is provided, fetch application details
        if (applicationId) {
          const appData = await applicationService.getApplicationDetails(applicationId);
          setApplication(appData);
        } else if (candidateData.applications.length > 0) {
          // Default to most recent application if no applicationId provided
          const sortedApps = [...candidateData.applications].sort(
            (a, b) => new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime()
          );
          setApplication(sortedApps[0]);
        }
        
        // Fetch available interviewers
        const users = await authService.getAllUsers();
        const availableInterviewers = users.filter(
          user => user.role === "interviewer" || user.role === "admin" || user.role === "hr"
        );
        setInterviewers(availableInterviewers);
        
        // Set default interviewer to current user if they can be an interviewer
        if (user && ["interviewer", "admin", "hr"].includes(user.role)) {
          form.setValue("interviewerId", user.id);
        }
        
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [candidateId, applicationId, user, form]);
  
  const onSubmit = async (values: InterviewFormValues) => {
    if (!application) {
      toast({
        title: "Error",
        description: "No application selected for interview.",
        variant: "destructive",
      });
      return;
    }
    
    setSubmitting(true);
    try {
      const interviewData = {
        application_id: application.id,
        interviewer_id: values.interviewerId,
        scheduled_at: values.scheduledAt,
        duration_minutes: values.durationMinutes,
        location: values.location || undefined,
        meeting_link: values.meetingLink || undefined,
        notes: values.notes || undefined,
      };
      
      // Schedule the interview
      await interviewService.scheduleInterview(interviewData);
      
      // Update application status to interview_scheduled if not already at a later stage
      const laterStages = ["interview_scheduled", "interview_completed", "offered", "hired"];
      if (!laterStages.includes(application.status)) {
        await applicationService.updateApplicationStatus(application.id, "interview_scheduled");
      }
      
      toast({
        title: "Success",
        description: "Interview scheduled successfully.",
      });
      
      // Navigate back to candidate details
      navigate(`/candidates/${candidateId}`);
      
    } catch (error) {
      console.error("Error scheduling interview:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to schedule interview. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }
  
  if (!candidate) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Candidate Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The candidate you're looking for doesn't exist or has been removed.
        </p>
        <Button 
          variant="default" 
          onClick={() => navigate("/candidates")}
          className="bg-system-blue-600 hover:bg-system-blue-700"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Candidates
        </Button>
      </div>
    );
  }
  
  if (!application) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">No Application Found</h2>
        <p className="text-muted-foreground mb-6">
          This candidate doesn't have any applications to schedule an interview for.
        </p>
        <Button 
          variant="default" 
          onClick={() => navigate(`/candidates/${candidateId}`)}
          className="bg-system-blue-600 hover:bg-system-blue-700"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Candidate
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
          onClick={() => navigate(`/candidates/${candidateId}`)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Schedule Interview</h1>
          <p className="text-muted-foreground">
            Schedule an interview for {candidate.first_name} {candidate.last_name} • {application.jobs.title}
          </p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Interview Details</CardTitle>
          <CardDescription>
            Fill out the form below to schedule an interview.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="interviewerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Users className="h-4 w-4" /> Interviewer
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an interviewer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {interviewers.map((interviewer) => (
                          <SelectItem key={interviewer.id} value={interviewer.id}>
                            {interviewer.first_name} {interviewer.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="scheduledAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" /> Date & Time
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="datetime-local" 
                          {...field} 
                          min={new Date().toISOString().slice(0, 16)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="durationMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Clock className="h-4 w-4" /> Duration (minutes)
                      </FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="45">45 minutes</SelectItem>
                          <SelectItem value="60">60 minutes</SelectItem>
                          <SelectItem value="90">90 minutes</SelectItem>
                          <SelectItem value="120">120 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" /> Location (Optional)
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g. Conference Room A, Main Office" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="meetingLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <LinkIcon className="h-4 w-4" /> Meeting Link (Optional)
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g. https://zoom.us/j/123456789" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Add any additional notes or instructions for the interview..."
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/candidates/${candidateId}`)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="bg-system-blue-600 hover:bg-system-blue-700"
                >
                  {submitting ? "Scheduling..." : "Schedule Interview"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScheduleInterview; 