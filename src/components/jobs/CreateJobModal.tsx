import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { jobService } from "@/services/jobService";
import { toast } from "@/hooks/use-toast";

// Define form schema using zod
const jobFormSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters" }),
  department: z.string().min(2, { message: "Department is required" }),
  location: z.string().min(2, { message: "Location is required" }),
  type: z.enum(["full-time", "part-time", "contract", "remote"], {
    required_error: "Please select a job type",
  }),
  description: z.string().min(20, { message: "Description must be at least 20 characters" }),
  requirements: z.string().min(20, { message: "Requirements must be at least 20 characters" }),
  responsibilities: z.string().min(20, { message: "Responsibilities must be at least 20 characters" }),
  status: z.enum(["draft", "published", "closed"], {
    required_error: "Please select a job status",
  }).default("draft"),
  salaryMin: z.number().nonnegative().optional(),
  salaryMax: z.number().nonnegative().optional(),
}).refine(data => {
  // If both salary fields are provided, ensure max is greater than min
  if (data.salaryMin && data.salaryMax) {
    return data.salaryMax > data.salaryMin;
  }
  return true;
}, {
  message: "Maximum salary must be greater than minimum salary",
  path: ["salaryMax"],
});

type JobFormValues = z.infer<typeof jobFormSchema>;

interface CreateJobModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJobCreated?: (job: any) => void;
}

const CreateJobModal: React.FC<CreateJobModalProps> = ({ 
  open, 
  onOpenChange,
  onJobCreated 
}) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: "",
      department: "",
      location: "",
      type: "full-time",
      description: "",
      requirements: "",
      responsibilities: "",
      status: "draft",
      salaryMin: undefined,
      salaryMax: undefined,
    },
  });

  const onSubmit = async (data: JobFormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to create a job",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const newJob = await jobService.createJob(user.id, data);
      
      toast({
        title: "Job created successfully",
        description: "Your job posting has been created",
      });
      
      // Reset the form
      form.reset();
      
      // Close the modal
      onOpenChange(false);
      
      // Callback for parent component
      if (onJobCreated) {
        onJobCreated(newJob);
      }
    } catch (error) {
      console.error("Error creating job:", error);
      toast({
        title: "Failed to create job",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Job</DialogTitle>
          <DialogDescription>
            Create a new job posting. Fill out the form below to get started.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Senior Frontend Developer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Engineering" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. New York, NY or Remote" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select job type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="remote">Remote</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
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
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Draft jobs won't be visible to candidates
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="salaryMin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Salary (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="e.g. 50000" 
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value === "" ? undefined : Number(e.target.value);
                          field.onChange(value);
                        }}
                        value={field.value?.toString() || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="salaryMax"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Salary (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="e.g. 80000" 
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value === "" ? undefined : Number(e.target.value);
                          field.onChange(value);
                        }}
                        value={field.value?.toString() || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the job role and responsibilities..." 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="requirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Requirements</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="List the skills and qualifications required..." 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="responsibilities"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Responsibilities</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Outline the key responsibilities of this role..." 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Job"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateJobModal; 