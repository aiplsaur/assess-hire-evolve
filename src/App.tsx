import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { MainLayout } from "@/components/layout/MainLayout";
import { RoleBasedGuard } from "@/components/auth/RoleBasedGuard";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";

// Main Pages
import Index from "./pages/Index";
import Dashboard from "./pages/dashboard/Dashboard";
import Jobs from "./pages/jobs/Jobs";
import Candidates from "./pages/candidates/Candidates";
import AddCandidate from "./pages/candidates/AddCandidate";
import Assessments from "./pages/assessments/Assessments";
import Interviews from "./pages/interviews/Interviews";
import InterviewDetails from "./pages/interviews/InterviewDetails";
import RescheduleInterview from "./pages/interviews/RescheduleInterview";
import Reports from "./pages/reports/Reports";
import Settings from "./pages/settings/Settings";
import Applications from "./pages/applications/Applications";
import ApplicationDetail from "./pages/applications/ApplicationDetail";
import NotFound from "./pages/NotFound";
import JobEdit from "./pages/jobs/JobEdit";
import JobApplicants from "./pages/jobs/JobApplicants";
import CreateJob from "./pages/jobs/CreateJob";
import JobDetails from "./pages/jobs/JobDetails";
import JobApply from "./pages/jobs/JobApply";
import CandidateDetails from "./pages/candidates/CandidateDetails";
import ScheduleInterview from "./pages/interviews/ScheduleInterview";
import EditCandidate from "./pages/candidates/EditCandidate";
import CreateAssessment from "./pages/assessments/CreateAssessment";
import AssessmentDetails from "./pages/assessments/AssessmentDetails";
import EditAssessment from "./pages/assessments/EditAssessment";
import AssignAssessment from "./pages/assessments/AssignAssessment";
import AssessmentResults from "./pages/assessments/AssessmentResults";
import CandidateAssessments from "./pages/assessments/CandidateAssessments";
import TakeAssessment from "./pages/assessments/TakeAssessment";
import CandidateResponseDetails from "./pages/assessments/CandidateResponseDetails";
import RoleRouter from "./components/router/RoleRouter";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            
            {/* Protected Routes */}
            <Route path="/" element={<MainLayout />}>
              {/* All authenticated users */}
              <Route path="dashboard" element={
                <RoleBasedGuard allowedRoles="all">
                  <Dashboard />
                </RoleBasedGuard>
              } />
              
              {/* Routes for job seekers (candidates) */}
              <Route path="applications" element={
                <RoleBasedGuard allowedRoles={["candidate"]}>
                  <Applications />
                </RoleBasedGuard>
              } />
              <Route path="applications/:applicationId" element={
                <RoleBasedGuard allowedRoles={["candidate", "hr", "admin", "interviewer"]}>
                  <ApplicationDetail />
                </RoleBasedGuard>
              } />
              <Route path="jobs" element={
                <RoleBasedGuard allowedRoles={["candidate", "hr", "admin"]}>
                  <Jobs />
                </RoleBasedGuard>
              } />
              <Route path="jobs/create" element={
                <RoleBasedGuard allowedRoles={["hr", "admin"]}>
                  <CreateJob />
                </RoleBasedGuard>
              } />
              <Route path="jobs/:jobId" element={
                <RoleBasedGuard allowedRoles={["candidate", "hr", "admin", "interviewer"]}>
                  <JobDetails />
                </RoleBasedGuard>
              } />
              <Route path="jobs/:jobId/apply" element={
                <RoleBasedGuard allowedRoles={["candidate"]}>
                  <JobApply />
                </RoleBasedGuard>
              } />
              <Route path="jobs/:jobId/edit" element={
                <RoleBasedGuard allowedRoles={["hr", "admin"]}>
                  <JobEdit />
                </RoleBasedGuard>
              } />
              <Route path="jobs/:jobId/applicants" element={
                <RoleBasedGuard allowedRoles={["hr", "admin", "interviewer"]}>
                  <JobApplicants />
                </RoleBasedGuard>
              } />
              
              {/* Routes for hiring team */}
              <Route path="candidates" element={
                <RoleBasedGuard allowedRoles={["hr", "admin"]}>
                  <Candidates />
                </RoleBasedGuard>
              } />
              <Route path="candidates/new" element={
                <RoleBasedGuard allowedRoles={["hr", "admin"]}>
                  <AddCandidate />
                </RoleBasedGuard>
              } />
              <Route path="candidates/:candidateId" element={
                <RoleBasedGuard allowedRoles={["hr", "admin", "interviewer"]}>
                  <CandidateDetails />
                </RoleBasedGuard>
              } />
              <Route path="candidates/:candidateId/edit" element={
                <RoleBasedGuard allowedRoles={["hr", "admin"]}>
                  <EditCandidate />
                </RoleBasedGuard>
              } />
              <Route path="candidates/:candidateId/interview" element={
                <RoleBasedGuard allowedRoles={["hr", "admin", "interviewer"]}>
                  <ScheduleInterview />
                </RoleBasedGuard>
              } />
              <Route path="assessments" element={
                <RoleBasedGuard allowedRoles={["candidate", "hr", "admin", "interviewer"]}>
                  <RoleRouter 
                    roleMap={{
                      "candidate": <CandidateAssessments />,
                      "hr": <Assessments />,
                      "admin": <Assessments />,
                      "interviewer": <Assessments />
                    }}
                    defaultComponent={<Assessments />}
                  />
                </RoleBasedGuard>
              } />
              <Route path="assessments/create" element={
                <RoleBasedGuard allowedRoles={["hr", "admin"]}>
                  <CreateAssessment />
                </RoleBasedGuard>
              } />
              <Route path="assessments/:assessmentId" element={
                <RoleBasedGuard allowedRoles={["hr", "admin", "interviewer"]}>
                  <AssessmentDetails />
                </RoleBasedGuard>
              } />
              <Route path="assessments/:assessmentId/edit" element={
                <RoleBasedGuard allowedRoles={["hr", "admin"]}>
                  <EditAssessment />
                </RoleBasedGuard>
              } />
              <Route path="assessments/:assessmentId/assign" element={
                <RoleBasedGuard allowedRoles={["hr", "admin"]}>
                  <AssignAssessment />
                </RoleBasedGuard>
              } />
              <Route path="assessments/:assessmentId/results" element={
                <RoleBasedGuard allowedRoles={["hr", "admin", "interviewer"]}>
                  <AssessmentResults />
                </RoleBasedGuard>
              } />
              <Route path="responses/:assignmentId" element={
                <RoleBasedGuard allowedRoles={["hr", "admin", "interviewer", "candidate"]}>
                  <CandidateResponseDetails />
                </RoleBasedGuard>
              } />
              <Route path="interviews" element={
                <RoleBasedGuard allowedRoles={["interviewer", "hr", "admin"]}>
                  <Interviews />
                </RoleBasedGuard>
              } />
              <Route path="interviews/schedule" element={
                <RoleBasedGuard allowedRoles={["hr", "admin"]}>
                  <ScheduleInterview />
                </RoleBasedGuard>
              } />
              <Route path="interviews/:interviewId" element={
                <RoleBasedGuard allowedRoles={["interviewer", "hr", "admin"]}>
                  <InterviewDetails />
                </RoleBasedGuard>
              } />
              <Route path="interviews/:interviewId/reschedule" element={
                <RoleBasedGuard allowedRoles={["interviewer", "hr", "admin"]}>
                  <RescheduleInterview />
                </RoleBasedGuard>
              } />
              
              {/* Admin only routes */}
              <Route path="reports" element={
                <RoleBasedGuard allowedRoles={["admin"]}>
                  <Reports />
                </RoleBasedGuard>
              } />
              <Route path="settings" element={
                <RoleBasedGuard allowedRoles="all">
                  <Settings />
                </RoleBasedGuard>
              } />

              {/* Candidate assessment routes */}
              <Route path="assessments/:assessmentId/take/:assignmentId" element={
                <RoleBasedGuard allowedRoles={["candidate"]}>
                  <TakeAssessment />
                </RoleBasedGuard>
              } />
              <Route path="assessments/results/:assignmentId" element={
                <RoleBasedGuard allowedRoles={["candidate"]}>
                  <AssessmentResults />
                </RoleBasedGuard>
              } />
            </Route>
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
