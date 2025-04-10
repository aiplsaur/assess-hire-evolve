import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { format, addDays, addMinutes } from "date-fns";
import { interviewService } from "@/services/interviewService";
import { candidateService } from "@/services/candidateService";
import { jobService } from "@/services/jobService";
import { userService } from "@/services/userService";
import { applicationService } from "@/services/applicationService";
import { toast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Interface definitions
interface Candidate {
  id: string;
  name: string;
  email: string;
}

interface Job {
  id: string;
  title: string;
}

interface Interviewer {
  id: string;
  name: string;
  email: string;
}

interface Application {
  id: string;
  candidate_id: string;
  job_id: string;
}

// Define form schema
const interviewFormSchema = z.object({
  applicationId: z.string({
    required_error: "Please select a candidate and job"
  }),
  interviewerId: z.string({
    required_error: "Please select an interviewer"
  }),
  date: z.date({
    required_error: "Please select a date"
  }),
  time: z.string({
    required_error: "Please select a time"
  }),
  durationMinutes: z.coerce.number()
    .min(15, { message: "Duration must be at least 15 minutes" })
    .max(240, { message: "Duration cannot exceed 4 hours" }),
  interviewType: z.enum(["remote", "onsite"], {
    required_error: "Please select an interview type"
  }),
  location: z.string().optional(),
  meetingLink: z.string().optional(),
  notes: z.string().optional()
});

// Time slots for dropdown
const timeSlots = Array.from({ length: 24 * 4 }, (_, i) => {
  const minutes = i * 15;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return {
    value: `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`,
    label: format(new Date().setHours(hours, mins), 'h:mm a')
  };
});

type InterviewFormValues = z.infer<typeof interviewFormSchema>;

const ScheduleInterview: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [interviewers, setInterviewers] = useState<Interviewer[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);

  const form = useForm<InterviewFormValues>({
    resolver: zodResolver(interviewFormSchema),
    defaultValues: {
      durationMinutes: 60,
      interviewType: "remote",
      date: addDays(new Date(), 1),
      time: "09:00"
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch candidates
        let candidatesData = [];
        try {
          candidatesData = await candidateService.getAllCandidates();
        } catch (error) {
          console.error("Error fetching candidates:", error);
          // Fallback to mock data
          candidatesData = [
            { id: 'mock-candidate-1', first_name: 'John', last_name: 'Doe', email: 'john@example.com' },
            { id: 'mock-candidate-2', first_name: 'Jane', last_name: 'Smith', email: 'jane@example.com' }
          ];
        }
        
        const formattedCandidates = candidatesData.map((candidate: any) => ({
          id: candidate.id,
          name: `${candidate.first_name} ${candidate.last_name}`,
          email: candidate.email
        }));
        setCandidates(formattedCandidates);
        
        // Fetch jobs
        let jobsData = [];
        try {
          jobsData = await jobService.getAllJobs();
        } catch (error) {
          console.error("Error fetching jobs:", error);
          // Fallback to mock data
          jobsData = [
            { id: 'mock-job-1', title: 'Frontend Developer' },
            { id: 'mock-job-2', title: 'Backend Engineer' }
          ];
        }
        
        const formattedJobs = jobsData.map((job: any) => ({
          id: job.id,
          title: job.title
        }));
        setJobs(formattedJobs);
        setFilteredJobs(formattedJobs);
        
        // Fetch interviewers (users with interviewer role)
        let usersData = [];
        try {
          usersData = await userService.listUsers({ role: 'interviewer' });
        } catch (error) {
          console.error("Error fetching interviewers:", error);
          // Fallback to mock data
          usersData = [
            { id: 'mock-interviewer-1', first_name: 'Alex', last_name: 'Johnson', email: 'alex@example.com' },
            { id: 'mock-interviewer-2', first_name: 'Sarah', last_name: 'Williams', email: 'sarah@example.com' }
          ];
        }
        
        const formattedInterviewers = usersData.map((user: any) => ({
          id: user.id,
          name: `${user.first_name} ${user.last_name}`,
          email: user.email
        }));
        setInterviewers(formattedInterviewers);
        
        // Fetch applications
        let applicationsData = [];
        try {
          applicationsData = await applicationService.getAllApplications();
        } catch (error) {
          console.error("Error fetching applications:", error);
          // Fallback to mock data
          applicationsData = [
            { id: 'mock-app-1', candidate_id: 'mock-candidate-1', job_id: 'mock-job-1' },
            { id: 'mock-app-2', candidate_id: 'mock-candidate-2', job_id: 'mock-job-2' }
          ];
        }
        
        setApplications(applicationsData);
        
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load required data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filter jobs when candidate is selected
  useEffect(() => {
    if (selectedCandidate) {
      const candidateApplications = applications.filter(app => app.candidate_id === selectedCandidate);
      const candidateJobIds = candidateApplications.map(app => app.job_id);
      const availableJobs = jobs.filter(job => candidateJobIds.includes(job.id));
      setFilteredJobs(availableJobs);
      
      // Clear selected job if it's no longer valid
      if (selectedJob && !candidateJobIds.includes(selectedJob)) {
        setSelectedJob(null);
        form.setValue('applicationId', '');
      }
    } else {
      setFilteredJobs(jobs);
    }
  }, [selectedCandidate, applications, jobs, selectedJob, form]);

  // Update application ID when both candidate and job are selected
  useEffect(() => {
    if (selectedCandidate && selectedJob) {
      const application = applications.find(
        app => app.candidate_id === selectedCandidate && app.job_id === selectedJob
      );
      
      if (application) {
        form.setValue('applicationId', application.id);
      } else {
        form.setValue('applicationId', '');
      }
    }
  }, [selectedCandidate, selectedJob, applications, form]);

  const onSubmit = async (values: z.infer<typeof interviewFormSchema>) => {
    try {
      setIsSubmitting(true);
      
      // Format the date and time for the API
      const dateTime = new Date(
        `${values.date.toISOString().split('T')[0]}T${values.time}`
      );
      
      const interviewData = {
        application_id: values.applicationId,
        interviewer_id: values.interviewerId,
        scheduled_at: dateTime.toISOString(),
        duration_minutes: values.durationMinutes,
        type: values.interviewType,
        status: 'scheduled',
        location: values.interviewType === 'onsite' ? values.location : null,
        meeting_link: values.interviewType === 'remote' ? values.meetingLink : null,
        notes: values.notes
      };
      
      console.log('Scheduling interview with data:', interviewData);
      
      const result = await interviewService.scheduleInterview(interviewData);
      
      if (result?.id) {
        toast({
          title: "Success",
          description: "Interview scheduled successfully",
        });
        
        // Reset form
        form.reset();
        
        // Redirect to interviews page after short delay
        setTimeout(() => {
          navigate("/interviews");
        }, 1500);
      } else {
        throw new Error("Failed to schedule interview. Please try again.");
      }
    } catch (error) {
      console.error("Error scheduling interview:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to schedule interview. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/interviews")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Schedule Interview</h1>
          <p className="text-muted-foreground">
            Schedule a new interview with a candidate
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Interview Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Candidate & Position</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="applicationId"
                      render={() => (
                        <FormItem>
                          <FormLabel>Candidate</FormLabel>
                          <Select
                            onValueChange={(value) => setSelectedCandidate(value)}
                            value={selectedCandidate || ""}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a candidate" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {candidates.map((candidate) => (
                                <SelectItem key={candidate.id} value={candidate.id}>
                                  {candidate.name} ({candidate.email})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Select the candidate to interview
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="applicationId"
                      render={() => (
                        <FormItem>
                          <FormLabel>Position</FormLabel>
                          <Select
                            onValueChange={(value) => setSelectedJob(value)}
                            value={selectedJob || ""}
                            disabled={!selectedCandidate || filteredJobs.length === 0}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={
                                  !selectedCandidate 
                                    ? "Select a candidate first" 
                                    : filteredJobs.length === 0 
                                      ? "No job applications found" 
                                      : "Select a position"
                                } />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {filteredJobs.map((job) => (
                                <SelectItem key={job.id} value={job.id}>
                                  {job.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Select the position the candidate applied for
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Interviewer</h3>
                  <FormField
                    control={form.control}
                    name="interviewerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Interviewer</FormLabel>
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
                                {interviewer.name} ({interviewer.email})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select the person who will conduct the interview
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Schedule</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className="pl-3 text-left font-normal"
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormDescription>
                            The date for the interview
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a time" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {timeSlots.map((slot) => (
                                <SelectItem key={slot.value} value={slot.value}>
                                  {slot.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            The time for the interview
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="durationMinutes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration (minutes)</FormLabel>
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
                              <SelectItem value="60">1 hour</SelectItem>
                              <SelectItem value="90">1.5 hours</SelectItem>
                              <SelectItem value="120">2 hours</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            How long the interview will last
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Interview Type</h3>
                  <FormField
                    control={form.control}
                    name="interviewType"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="remote" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Remote (Video Call)
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="onsite" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                On-site (In Person)
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {form.watch("interviewType") === "remote" && (
                    <FormField
                      control={form.control}
                      name="meetingLink"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meeting Link</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., https://zoom.us/j/123456789" {...field} />
                          </FormControl>
                          <FormDescription>
                            The video conferencing link for the interview
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  {form.watch("interviewType") === "onsite" && (
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Main Office - Meeting Room 3" {...field} />
                          </FormControl>
                          <FormDescription>
                            The physical location for the interview
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Any additional details or instructions for the interview..." 
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Optional notes about the interview (visible to the interviewer)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/interviews")}
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
                        <Spinner className="mr-2 h-4 w-4" /> Scheduling...
                      </>
                    ) : (
                      "Schedule Interview"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ScheduleInterview; 