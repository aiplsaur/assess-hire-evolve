
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { MainLayout } from "@/components/layout/MainLayout";

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
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="jobs" element={<Jobs />} />
              <Route path="candidates" element={<Candidates />} />
              <Route path="assessments" element={<Assessments />} />
              <Route path="interviews" element={<Interviews />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />
              {/* Add other protected routes here */}
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
