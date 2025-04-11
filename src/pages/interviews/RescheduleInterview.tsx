import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import { format, addDays } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { interviewService } from "@/services/interviewService";
import { toast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";

// Define form schema
const rescheduleFormSchema = z.object({
  date: z.date({
    required_error: "Please select a date"
  }),
  time: z.string({
    required_error: "Please select a time"
  }),
  durationMinutes: z.coerce.number()
    .min(15, { message: "Duration must be at least 15 minutes" })
    .max(240, { message: "Duration cannot exceed 4 hours" }),
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

type RescheduleFormValues = z.infer<typeof rescheduleFormSchema>;

const RescheduleInterview: React.FC = () => {
  const { interviewId } = useParams<{ interviewId: string }>();
  const navigate = useNavigate();
  const [interview, setInterview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<RescheduleFormValues>({
    resolver: zodResolver(rescheduleFormSchema),
    defaultValues: {
      date: addDays(new Date(), 1),
      time: "09:00",
      durationMinutes: 60,
      notes: ""
    }
  });

  useEffect(() => {
    const fetchInterviewDetails = async () => {
      if (!interviewId) return;

      try {
        setLoading(true);
        const data = await interviewService.getInterviewById(interviewId);
        setInterview(data);
        
        // Set form default values based on existing interview
        if (data) {
          const scheduledAt = new Date(data.scheduled_at);
          form.setValue("date", scheduledAt);
          
          const hours = scheduledAt.getHours().toString().padStart(2, '0');
          const minutes = scheduledAt.getMinutes().toString().padStart(2, '0');
          form.setValue("time", `${hours}:${minutes}`);
          
          form.setValue("durationMinutes", data.duration_minutes || 60);
        }
      } catch (err) {
        console.error("Error fetching interview details:", err);
        setError("Failed to load interview details. Please try again.");
        toast({
          title: "Error",
          description: "Failed to load interview details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInterviewDetails();
  }, [interviewId, form]);

  const onSubmit = async (values: RescheduleFormValues) => {
    if (!interviewId) return;
    
    try {
      setIsSubmitting(true);
      
      // Combine date and time
      const dateTime = new Date(
        `${values.date.toISOString().split('T')[0]}T${values.time}`
      );
      
      // Call the reschedule endpoint
      await interviewService.rescheduleInterview(
        interviewId, 
        dateTime.toISOString(), 
        values.durationMinutes
      );
      
      // If there are notes, update the interview notes
      if (values.notes) {
        await interviewService.updateInterviewStatus(
          interviewId,
          "rescheduled",
          values.notes
        );
      }
      
      toast({
        title: "Success",
        description: "Interview has been rescheduled",
      });
      
      // Navigate back to interview details
      navigate(`/interviews/${interviewId}`);
    } catch (err) {
      console.error("Error rescheduling interview:", err);
      toast({
        title: "Error",
        description: "Failed to reschedule interview. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !interview) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Interview Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The interview you're trying to reschedule doesn't exist or you don't have permission to modify it.
        </p>
        <Button 
          variant="default" 
          onClick={() => navigate("/interviews")}
          className="bg-system-blue-600 hover:bg-system-blue-700"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Interviews
        </Button>
      </div>
    );
  }

  const candidateName = interview.applications?.profiles 
    ? `${interview.applications.profiles.first_name} ${interview.applications.profiles.last_name}`
    : "Unknown Candidate";
  
  const jobTitle = interview.applications?.jobs?.title || "Unknown Position";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/interviews/${interviewId}`)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Reschedule Interview</h1>
          <p className="text-muted-foreground">
            Reschedule interview with {candidateName} for {jobTitle}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Schedule</CardTitle>
          <CardDescription>
            Select a new date and time for this interview
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
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
                            <CalendarComponent
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          The new date for the interview
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
                          The new time for the interview
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
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
                        The duration of the interview
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <Separator />
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rescheduling Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Reason for rescheduling or any additional notes..." 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Optional notes about why the interview is being rescheduled
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/interviews/${interviewId}`)}
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
                      <Spinner className="mr-2 h-4 w-4" /> Rescheduling...
                    </>
                  ) : (
                    "Reschedule Interview"
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

export default RescheduleInterview; 