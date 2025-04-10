
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
import Assessments from "./pages/assessments/Assessments";
import Interviews from "./pages/interviews/Interviews";
import Reports from "./pages/reports/Reports";
import Settings from "./pages/settings/Settings";
import Applications from "./pages/applications/Applications";
import NotFound from "./pages/NotFound";

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
              <Route path="jobs" element={
                <RoleBasedGuard allowedRoles={["candidate", "hr", "admin"]}>
                  <Jobs />
                </RoleBasedGuard>
              } />
              
              {/* Routes for hiring team */}
              <Route path="candidates" element={
                <RoleBasedGuard allowedRoles={["hr", "admin"]}>
                  <Candidates />
                </RoleBasedGuard>
              } />
              <Route path="assessments" element={
                <RoleBasedGuard allowedRoles={["interviewer", "admin"]}>
                  <Assessments />
                </RoleBasedGuard>
              } />
              <Route path="interviews" element={
                <RoleBasedGuard allowedRoles={["interviewer", "hr", "admin"]}>
                  <Interviews />
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
