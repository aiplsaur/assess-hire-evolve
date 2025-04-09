
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { UserProfile, UserRole } from "@/types";
import { toast } from "@/hooks/use-toast";

// Define the shape of our authentication context
interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role?: UserRole
  ) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  hasRole: (roles: UserRole[] | "all") => boolean;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Sample temporary user data (to be replaced with Supabase auth)
const mockUser: UserProfile = {
  id: "1",
  email: "admin@interviewpro.com",
  firstName: "Admin",
  lastName: "User",
  role: "admin",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize and check for existing session
  useEffect(() => {
    const checkUser = async () => {
      try {
        // This will be replaced with Supabase session check
        // For now, we'll simulate a logged-in user for demonstration
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          // For demo purposes, automatically log in as admin
          // In a real app, this would be removed
          setUser(mockUser);
          localStorage.setItem('user', JSON.stringify(mockUser));
        }
      } catch (error) {
        console.error("Error checking authentication status:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      // This will be replaced with Supabase auth.signIn
      
      // For demonstration, we'll simulate a successful login with different user roles
      let loggedInUser: UserProfile;
      
      if (email.includes('admin')) {
        loggedInUser = { ...mockUser, role: 'admin' };
      } else if (email.includes('hr')) {
        loggedInUser = { 
          ...mockUser, 
          id: "2", 
          email: email, 
          firstName: "HR", 
          lastName: "Manager", 
          role: 'hr' 
        };
      } else if (email.includes('interviewer')) {
        loggedInUser = { 
          ...mockUser, 
          id: "3", 
          email: email, 
          firstName: "Technical", 
          lastName: "Interviewer", 
          role: 'interviewer' 
        };
      } else {
        loggedInUser = { 
          ...mockUser, 
          id: "4", 
          email: email, 
          firstName: "Job", 
          lastName: "Seeker", 
          role: 'candidate' 
        };
      }
      
      setUser(loggedInUser);
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      
      // Show success toast
      toast({
        title: "Signed in successfully",
        description: `Welcome back, ${loggedInUser.firstName}!`,
      });
      
      // Redirect to dashboard or the page they were trying to access
      const from = location.state?.from || "/dashboard";
      navigate(from);
    } catch (error) {
      console.error("Error signing in:", error);
      toast({
        title: "Sign in failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign up function
  const signUp = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: UserRole = "candidate"
  ) => {
    try {
      setLoading(true);
      // This will be replaced with Supabase auth.signUp
      
      // For demonstration, we'll simulate a successful registration
      const newUser: UserProfile = {
        id: "2",
        email,
        firstName,
        lastName,
        role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      // Show success toast
      toast({
        title: "Account created successfully",
        description: `Welcome to InterviewPro, ${firstName}!`,
      });
      
      // Redirect to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Error signing up:", error);
      toast({
        title: "Sign up failed",
        description: "There was a problem creating your account. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      setLoading(true);
      // This will be replaced with Supabase auth.signOut
      
      // Clear user state and local storage
      setUser(null);
      localStorage.removeItem('user');
      
      // Show success toast
      toast({
        title: "Signed out successfully",
        description: "You have been logged out. See you soon!",
      });
      
      // Redirect to home page
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Sign out failed",
        description: "There was a problem signing you out. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Reset password function
  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      // This will be replaced with Supabase auth.resetPassword
      
      // Show success toast
      toast({
        title: "Password reset email sent",
        description: "Check your email for instructions to reset your password.",
      });
    } catch (error) {
      console.error("Error resetting password:", error);
      toast({
        title: "Password reset failed",
        description: "There was a problem sending the reset email. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Function to check if user has required roles
  const hasRole = (roles: UserRole[] | "all"): boolean => {
    if (!user) return false;
    if (roles === "all") return true;
    return roles.includes(user.role);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
