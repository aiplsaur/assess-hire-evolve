import React, { useEffect, useState } from "react";
import { Building2, Calendar, CheckSquare, Users } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { UpcomingInterviews } from "@/components/dashboard/UpcomingInterviews";
import { RecentApplications } from "@/components/dashboard/RecentApplications";
import { RecentJobs } from "@/components/dashboard/RecentJobs";
import { useAuth } from "@/context/AuthContext";
import { format, addHours, addDays, parseISO, isValid } from "date-fns";
import { jobService, applicationService, interviewService } from "@/services";
import { toast } from "@/hooks/use-toast";

// Helper function to safely format dates
const formatDate = (dateString: string) => {
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) {
      return 'Invalid date';
    }
    return format(date, "MMM d, yyyy 'at' h:mm a");
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

// Helper function to safely check if a date is within range
const isDateInRange = (dateString: string, startDate: Date, endDate: Date) => {
  try {
    const date = parseISO(dateString);
    return isValid(date) && date >= startDate && date <= endDate;
  } catch (error) {
    console.error('Error checking date range:', error);
    return false;
  }
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  
  // Show relevant dashboard based on role
  const renderRoleDashboard = () => {
    if (!user) return <CandidateDashboard />;
    
    switch (user.role) {
      case "admin":
        return <AdminDashboard />;
      case "hr":
        return <HRDashboard />;
      case "interviewer":
        return <InterviewerDashboard />;
      case "candidate":
        return <CandidateDashboard />;
      default:
        return <CandidateDashboard />;
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back{user ? `, ${user.firstName}` : ""}. Here's what's happening today.
        </p>
      </div>
      
      {renderRoleDashboard()}
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Get all applications first
        const [jobsData, applicationsData] = await Promise.all([
          jobService.getAllJobs({ status: 'published' }),
          applicationService.getAllApplications(),
        ]);

        // Then fetch interviews for each application
        const interviewPromises = applicationsData.map(app => 
          interviewService.getInterviewsByApplication(app.id)
        );
        const interviewsData = (await Promise.all(interviewPromises)).flat();

        setJobs(jobsData);
        setApplications(applicationsData);
        setInterviews(interviewsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  const openPositions = jobs.filter(job => job.status === 'published').length;
  const totalCandidates = applications.length;
  const scheduledInterviews = interviews.filter(interview => 
    interview.status === 'scheduled' || interview.status === 'rescheduled'
  ).length;
  const completedAssessments = applications.filter(app => 
    app.status === 'assessment_completed'
  ).length;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Open Positions"
          value={openPositions}
          icon={Building2}
          trend={{ value: 0, isPositive: true }}
        />
        <StatCard
          title="Total Candidates"
          value={totalCandidates}
          icon={Users}
          trend={{ value: 0, isPositive: true }}
        />
        <StatCard
          title="Scheduled Interviews"
          value={scheduledInterviews}
          icon={Calendar}
          trend={{ value: 0, isPositive: true }}
        />
        <StatCard
          title="Assessments Completed"
          value={completedAssessments}
          icon={CheckSquare}
          trend={{ value: 0, isPositive: true }}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentJobs jobs={jobs.slice(0, 5)} />
        <UpcomingInterviews interviews={interviews.filter(i => 
          i.status === 'scheduled' || i.status === 'rescheduled'
        ).slice(0, 5)} />
      </div>
      
      <div>
        <RecentApplications applications={applications.slice(0, 5)} />
      </div>
    </>
  );
};

const HRDashboard: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Get all applications first
        const [jobsData, applicationsData] = await Promise.all([
          jobService.getAllJobs({ status: 'published' }),
          applicationService.getAllApplications(),
        ]);

        // Then fetch interviews for each application
        const interviewPromises = applicationsData.map(app => 
          interviewService.getInterviewsByApplication(app.id)
        );
        const interviewsData = (await Promise.all(interviewPromises)).flat();

        setJobs(jobsData);
        setApplications(applicationsData);
        setInterviews(interviewsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  const openPositions = jobs.filter(job => job.status === 'published').length;
  const activeCandidates = applications.filter(app => 
    ['applied', 'screening', 'interview', 'assessment'].includes(app.status)
  ).length;
  const scheduledInterviews = interviews.filter(interview => 
    interview.status === 'scheduled' || interview.status === 'rescheduled'
  ).length;
  const newApplications = applications.filter(app => 
    app.status === 'applied'
  ).length;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Open Positions"
          value={openPositions}
          icon={Building2}
          trend={{ value: 0, isPositive: true }}
        />
        <StatCard
          title="Active Candidates"
          value={activeCandidates}
          icon={Users}
          trend={{ value: 0, isPositive: true }}
        />
        <StatCard
          title="Scheduled Interviews"
          value={scheduledInterviews}
          icon={Calendar}
          trend={{ value: 0, isPositive: true }}
        />
        <StatCard
          title="New Applications"
          value={newApplications}
          icon={CheckSquare}
          trend={{ value: 0, isPositive: true }}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentApplications applications={applications.slice(0, 5)} />
        <UpcomingInterviews interviews={interviews.filter(i => 
          i.status === 'scheduled' || i.status === 'rescheduled'
        ).slice(0, 5)} />
      </div>

    </>
  );
};

// cdnsjvn
const InterviewerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const [interviewsData, applicationsData] = await Promise.all([
          interviewService.getInterviewsByInterviewer(user.id),
          applicationService.getAllApplications()
        ]);

        setInterviews(interviewsData);
        setApplications(applicationsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const weeklyInterviews = interviews.filter(interview => {
    const today = new Date();
    const weekFromNow = addDays(today, 7);
    return isDateInRange(interview.scheduled_at, today, weekFromNow);
  }).length;

  const pendingFeedbacks = interviews.filter(interview => 
    interview.status === 'completed' && !interview.feedback
  ).length;

  const evaluatedCandidates = interviews.filter(interview => 
    interview.status === 'completed' && interview.feedback
  ).length;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="My Interviews"
          value={weeklyInterviews}
          icon={Calendar}
          description="Scheduled for this week"
        />
        <StatCard
          title="Pending Feedbacks"
          value={pendingFeedbacks}
          icon={CheckSquare}
          description="Awaiting your evaluation"
        />
        <StatCard
          title="Candidates Evaluated"
          value={evaluatedCandidates}
          icon={Users}
          description="In the past 30 days"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingInterviews interviews={interviews.filter(i => 
          i.status === 'scheduled' || i.status === 'rescheduled'
        ).slice(0, 5)} />
        <RecentApplications applications={applications.slice(0, 5)} />
      </div>
    </>
  );
};

const CandidateDashboard: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const applicationsData = await applicationService.getApplicationsByCandidate(user.id);
        setApplications(applicationsData);

        // Get interviews for all applications
        const interviewsPromises = applicationsData.map(app => 
          interviewService.getInterviewsByApplication(app.id)
        );
        const interviewsData = await Promise.all(interviewsPromises);
        setInterviews(interviewsData.flat());
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const activeApplications = applications.filter(app => 
    ['applied', 'screening', 'interview', 'assessment'].includes(app.status)
  ).length;

  const upcomingInterviews = interviews.filter(interview => {
    const today = new Date();
    const weekFromNow = addDays(today, 7);
    return (
      (interview.status === 'scheduled' || interview.status === 'rescheduled') &&
      isDateInRange(interview.scheduled_at, today, weekFromNow)
    );
  }).length;

  const pendingAssessments = applications.filter(app => 
    app.status === 'assessment'
  ).length;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Active Applications"
          value={activeApplications}
          icon={Building2}
          description="Currently in progress"
        />
        <StatCard
          title="Scheduled Interviews"
          value={upcomingInterviews}
          icon={Calendar}
          description="In the next 7 days"
        />
        <StatCard
          title="Pending Assessments"
          value={pendingAssessments}
          icon={CheckSquare}
          description="Ready to complete"
        />
      </div>
      
      <div className="p-4 mt-4 mb-8 bg-system-blue-50 border border-system-blue-100 rounded-md">
        <h2 className="text-lg font-medium text-system-blue-700 mb-2">Ready for your next challenge?</h2>
        <p className="text-system-blue-600 mb-4">
          We have more than {applications.length} open positions that match your profile.
        </p>
        <button className="bg-system-blue-600 hover:bg-system-blue-700 text-white px-4 py-2 rounded-md transition-colors">
          Browse Jobs
        </button>
      </div>
      
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Recent Activity</h2>
        
        <div className="space-y-4">
          {applications.slice(0, 3).map((app) => (
            <div key={app.id} className="p-4 bg-white border border-border rounded-md shadow-sm">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-system-blue-100 flex items-center justify-center mr-4">
                  <Building2 className="h-5 w-5 text-system-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">Application {app.status.charAt(0).toUpperCase() + app.status.slice(1)}</h3>
                  <p className="text-sm text-muted-foreground">
                    {app.jobs?.title || 'Job Position'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(app.applied_at)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
