
import React from "react";
import { Building2, Calendar, CheckSquare, Users } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { UpcomingInterviews } from "@/components/dashboard/UpcomingInterviews";
import { RecentApplications } from "@/components/dashboard/RecentApplications";
import { RecentJobs } from "@/components/dashboard/RecentJobs";
import { useAuth } from "@/context/AuthContext";
import { format, addHours, addDays } from "date-fns";

// Mock data for the dashboard
const mockInterviews = [
  {
    id: "1",
    candidate: {
      id: "c1",
      name: "Jane Cooper",
      avatar: "",
    },
    position: "Frontend Developer",
    scheduledAt: addHours(new Date(), 3),
    duration: 45,
    type: "remote" as const,
    meetingLink: "https://zoom.us/j/123456789",
  },
  {
    id: "2",
    candidate: {
      id: "c2",
      name: "Devon Lane",
      avatar: "",
    },
    position: "Product Manager",
    scheduledAt: addDays(new Date(), 1),
    duration: 60,
    type: "onsite" as const,
    location: "Main Office - Room 302",
  },
  {
    id: "3",
    candidate: {
      id: "c3",
      name: "Robert Fox",
      avatar: "",
    },
    position: "UX Designer",
    scheduledAt: addDays(new Date(), 2),
    duration: 30,
    type: "remote" as const,
    meetingLink: "https://meet.google.com/abc-defg-hij",
  },
];

const mockApplications = [
  {
    id: "1",
    jobTitle: "Frontend Developer",
    department: "Engineering",
    candidate: {
      id: "c1",
      name: "Cameron Williamson",
      avatar: "",
      email: "cameron@example.com",
    },
    status: "applied" as const,
    appliedAt: new Date(),
  },
  {
    id: "2",
    jobTitle: "Product Manager",
    department: "Product",
    candidate: {
      id: "c2",
      name: "Brooklyn Simmons",
      avatar: "",
      email: "brooklyn@example.com",
    },
    status: "screening" as const,
    appliedAt: addDays(new Date(), -1),
  },
  {
    id: "3",
    jobTitle: "Marketing Specialist",
    department: "Marketing",
    candidate: {
      id: "c3",
      name: "Leslie Alexander",
      avatar: "",
      email: "leslie@example.com",
    },
    status: "assessment" as const,
    appliedAt: addDays(new Date(), -2),
  },
];

const mockJobs = [
  {
    id: "1",
    title: "Senior Frontend Developer",
    department: "Engineering",
    location: "New York, NY",
    type: "full-time" as const,
    applicantsCount: 15,
    postedAt: addDays(new Date(), -5),
    status: "published" as const,
  },
  {
    id: "2",
    title: "Product Manager",
    department: "Product",
    location: "San Francisco, CA",
    type: "full-time" as const,
    applicantsCount: 8,
    postedAt: addDays(new Date(), -7),
    status: "published" as const,
  },
  {
    id: "3",
    title: "UI/UX Designer",
    department: "Design",
    location: "Remote",
    type: "remote" as const,
    applicantsCount: 12,
    postedAt: addDays(new Date(), -3),
    status: "published" as const,
  },
];

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
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Open Positions"
          value={12}
          icon={Building2}
          trend={{ value: 10, isPositive: true }}
        />
        <StatCard
          title="Total Candidates"
          value={145}
          icon={Users}
          trend={{ value: 15, isPositive: true }}
        />
        <StatCard
          title="Scheduled Interviews"
          value={28}
          icon={Calendar}
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          title="Assessments Completed"
          value={32}
          icon={CheckSquare}
          trend={{ value: 8, isPositive: true }}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentJobs jobs={mockJobs} />
        <UpcomingInterviews interviews={mockInterviews} />
      </div>
      
      <div>
        <RecentApplications applications={mockApplications} />
      </div>
    </>
  );
};

const HRDashboard: React.FC = () => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Open Positions"
          value={12}
          icon={Building2}
          trend={{ value: 10, isPositive: true }}
        />
        <StatCard
          title="Active Candidates"
          value={78}
          icon={Users}
          trend={{ value: 15, isPositive: true }}
        />
        <StatCard
          title="Scheduled Interviews"
          value={28}
          icon={Calendar}
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          title="New Applications"
          value={23}
          icon={CheckSquare}
          trend={{ value: 8, isPositive: true }}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentApplications applications={mockApplications} />
        <UpcomingInterviews interviews={mockInterviews} />
      </div>
    </>
  );
};

const InterviewerDashboard: React.FC = () => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="My Interviews"
          value={8}
          icon={Calendar}
          description="Scheduled for this week"
        />
        <StatCard
          title="Pending Feedbacks"
          value={3}
          icon={CheckSquare}
          description="Awaiting your evaluation"
        />
        <StatCard
          title="Candidates Evaluated"
          value={26}
          icon={Users}
          description="In the past 30 days"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingInterviews interviews={mockInterviews} />
        <RecentApplications applications={mockApplications} />
      </div>
    </>
  );
};

const CandidateDashboard: React.FC = () => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Active Applications"
          value={5}
          icon={Building2}
          description="Currently in progress"
        />
        <StatCard
          title="Scheduled Interviews"
          value={2}
          icon={Calendar}
          description="In the next 7 days"
        />
        <StatCard
          title="Pending Assessments"
          value={3}
          icon={CheckSquare}
          description="Ready to complete"
        />
      </div>
      
      <div className="p-4 mt-4 mb-8 bg-system-blue-50 border border-system-blue-100 rounded-md">
        <h2 className="text-lg font-medium text-system-blue-700 mb-2">Ready for your next challenge?</h2>
        <p className="text-system-blue-600 mb-4">
          We have more than 200 open positions that match your profile.
        </p>
        <button className="bg-system-blue-600 hover:bg-system-blue-700 text-white px-4 py-2 rounded-md transition-colors">
          Browse Jobs
        </button>
      </div>
      
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Recent Activity</h2>
        
        <div className="space-y-4">
          <div className="p-4 bg-white border border-border rounded-md shadow-sm">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-system-green-100 flex items-center justify-center mr-4">
                <CheckSquare className="h-5 w-5 text-system-green-600" />
              </div>
              <div>
                <h3 className="font-medium">Assessment Completed</h3>
                <p className="text-sm text-muted-foreground">
                  You completed the Frontend Developer coding assessment.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {format(addDays(new Date(), -1), "MMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-white border border-border rounded-md shadow-sm">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-system-blue-100 flex items-center justify-center mr-4">
                <Calendar className="h-5 w-5 text-system-blue-600" />
              </div>
              <div>
                <h3 className="font-medium">Interview Scheduled</h3>
                <p className="text-sm text-muted-foreground">
                  Your interview for Product Designer has been scheduled.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {format(addDays(new Date(), -3), "MMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-white border border-border rounded-md shadow-sm">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-system-blue-100 flex items-center justify-center mr-4">
                <Building2 className="h-5 w-5 text-system-blue-600" />
              </div>
              <div>
                <h3 className="font-medium">Application Submitted</h3>
                <p className="text-sm text-muted-foreground">
                  You applied for the Frontend Developer position.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {format(addDays(new Date(), -5), "MMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
