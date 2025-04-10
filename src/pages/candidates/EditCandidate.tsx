import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { candidateService } from "@/services/candidateService";
import { useAuth } from "@/context/AuthContext";
import { Spinner } from "@/components/ui/spinner";

// Define form schema using zod
const candidateFormSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().optional(),
  location: z.string().optional(),
  headline: z.string().optional(),
  bio: z.string().optional(),
});

type CandidateFormValues = z.infer<typeof candidateFormSchema>;

const EditCandidate: React.FC = () => {
  const { candidateId } = useParams<{ candidateId: string }>();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CandidateFormValues>({
    resolver: zodResolver(candidateFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      location: "",
      headline: "",
      bio: "",
    },
  });

  // Check if user has permission to edit candidates
  useEffect(() => {
    if (!hasRole(["admin", "hr"])) {
      toast({
        title: "Access Denied",
        description: "You do not have permission to edit candidates",
        variant: "destructive",
      });
      navigate("/candidates");
    }
  }, [hasRole, navigate]);

  // Fetch candidate data
  useEffect(() => {
    const fetchCandidate = async () => {
      if (!candidateId) return;

      try {
        setLoading(true);
        const data = await candidateService.getCandidateById(candidateId);
        
        if (data) {
          form.reset({
            firstName: data.first_name,
            lastName: data.last_name,
            email: data.email,
            phone: data.phone || "",
            location: data.location || "",
            headline: data.headline || "",
            bio: data.bio || "",
          });
        }
      } catch (error) {
        console.error("Error fetching candidate:", error);
        toast({
          title: "Error",
          description: "Failed to load candidate data. Please try again.",
          variant: "destructive",
        });
        navigate("/candidates");
      } finally {
        setLoading(false);
      }
    };

    fetchCandidate();
  }, [candidateId, form, navigate]);

  const onSubmit = async (data: CandidateFormValues) => {
    if (!candidateId) return;
    
    setIsSubmitting(true);
    try {
      await candidateService.updateCandidate(candidateId, {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone || "",
        location: data.location || "",
        headline: data.headline || "",
        bio: data.bio || "",
      });
      
      toast({
        title: "Success",
        description: "Candidate information has been updated",
      });
      
      // Navigate back to candidate details
      navigate(`/candidates/${candidateId}`);
    } catch (error) {
      console.error("Error updating candidate:", error);
      toast({
        title: "Failed to update candidate",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/candidates/${candidateId}`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Edit Candidate</h1>
            <p className="text-muted-foreground">
              Update candidate information
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate(`/candidates/${candidateId}`)}
        >
          Cancel
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Candidate Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter first name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter last name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="candidate@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. (123) 456-7890" {...field} />
                      </FormControl>
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
                      <FormLabel>Location (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. New York, NY" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="headline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Headline (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Senior Frontend Developer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Brief description about the candidate..." 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-system-blue-600 hover:bg-system-blue-700"
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditCandidate; 