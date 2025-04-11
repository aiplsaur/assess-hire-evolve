import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jobService } from "@/services/jobService";
import { applicationService } from "@/services/applicationService";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Upload, Briefcase, Building2 } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { format, parseISO } from "date-fns";

const JobApply: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  
  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!jobId) return;
      
      try {
        setLoading(true);
        const jobData = await jobService.getJobById(jobId);
        setJob(jobData);
        
        // Check if user already applied for this job
        if (user?.id) {
          const applications = await applicationService.getApplicationsByCandidate(user.id);
          const alreadyApplied = applications.some(app => app.job_id === jobId);
          
          if (alreadyApplied) {
            toast({
              title: "Already Applied",
              description: "You've already applied for this position.",
              variant: "default"
            });
            navigate(`/jobs/${jobId}`);
          }
        }
      } catch (error) {
        console.error("Error fetching job details:", error);
        toast({
          title: "Error",
          description: "Failed to load job details. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobDetails();
  }, [jobId, user?.id, navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id || !jobId) {
      toast({
        title: "Error",
        description: "You must be logged in to apply for jobs.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Upload resume if provided
      let resumeUrl = null;
      if (resumeFile) {
        // This is a simplified example - in a real app you'd upload to a storage service
        // resumeUrl = await uploadResume(resumeFile);
        resumeUrl = "example-resume-url.pdf"; // Mock URL for now
      }
      
      // First check if already applied to prevent duplicate submissions
      const applications = await applicationService.getApplicationsByCandidate(user.id);
      const alreadyApplied = applications.some(app => app.job_id === jobId);
      
      if (alreadyApplied) {
        toast({
          title: "Already Applied",
          description: "You've already applied for this position.",
          variant: "default"
        });
        navigate(`/jobs/${jobId}`);
        return;
      }
      
      // Create the application
      try {
        await applicationService.createApplication(jobId, user.id, {
          coverLetter,
          resumeUrl
        });
        
        toast({
          title: "Application Submitted",
          description: "Your application has been successfully submitted.",
          variant: "default"
        });
        
        // Redirect to applications page
        navigate("/applications");
      } catch (error: any) {
        if (error.message && error.message.includes("violates row-level security policy")) {
          console.error("RLS Policy Error:", error);
          toast({
            title: "Permission Error",
            description: "There was an issue with your application submission. This could be due to permission settings. Please try again later or contact support.",
            variant: "destructive"
          });
        } else {
          throw error; // rethrow to be caught by outer catch
        }
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive"
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
  
  if (!job) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Job Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The job you're looking for doesn't exist or has been removed.
        </p>
        <Button 
          variant="default" 
          onClick={() => navigate("/jobs")}
          className="bg-system-blue-600 hover:bg-system-blue-700"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Jobs
        </Button>
      </div>
    );
  }
  
  if (job.status !== "published") {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Job Not Available</h2>
        <p className="text-muted-foreground mb-6">
          This position is not accepting applications at this time.
        </p>
        <Button 
          variant="default" 
          onClick={() => navigate("/jobs")}
          className="bg-system-blue-600 hover:bg-system-blue-700"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Jobs
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
          onClick={() => navigate(`/jobs/${jobId}`)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Apply for Position</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Submit Your Application</CardTitle>
              <CardDescription>
                Complete the form below to apply for this position
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="cover-letter">Cover Letter</Label>
                  <Textarea
                    id="cover-letter"
                    placeholder="Tell us why you're a good fit for this position..."
                    className="min-h-[200px] mt-1"
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="resume">Resume/CV</Label>
                  <div className="mt-1 flex items-center gap-4">
                    <Input
                      id="resume"
                      type="file"
                      className="cursor-pointer"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setResumeFile(e.target.files[0]);
                        }
                      }}
                    />
                    {resumeFile && (
                      <span className="text-sm text-muted-foreground">
                        {resumeFile.name}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(`/jobs/${jobId}`)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={submitting}
                    className="bg-system-blue-600 hover:bg-system-blue-700"
                  >
                    {submitting ? (
                      <>
                        <Spinner className="mr-2 h-4 w-4" /> Submitting...
                      </>
                    ) : (
                      <>
                        Submit Application
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Job Summary</CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Briefcase className="h-10 w-10 text-system-blue-600 bg-system-blue-50 p-2 rounded-full" />
                <div>
                  <h3 className="font-medium">{job.title}</h3>
                  <p className="text-sm text-muted-foreground">{job.department}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-[16px_1fr] gap-2 items-center">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{job.location}</p>
              </div>
              
              <div className="text-sm">
                <p className="font-medium">Posted On</p>
                <p className="text-muted-foreground">
                  {job.created_at ? format(parseISO(job.created_at), "MMM d, yyyy") : "N/A"}
                </p>
              </div>
              
              <div className="bg-system-blue-50 text-system-blue-700 p-3 rounded-md text-sm">
                <p>Your profile information will be automatically included with your application.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default JobApply; 