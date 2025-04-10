import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { UserProfile, UserRole } from "@/types";
import { authService } from "@/services/authService.js";

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
        // Get the current user from authService - now async
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
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
      
      // Use authService to sign in
      const loggedInUser = await authService.signIn(email, password);
      setUser(loggedInUser);
      
      // Redirect to dashboard or the page they were trying to access
      const from = location.state?.from || "/dashboard";
      navigate(from);
    } catch (error) {
      console.error("Error signing in:", error);
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
      
      // Use authService to sign up
      const result = await authService.signUp(email, password, firstName, lastName, role);
      
      if (!result.success) {
        throw new Error(result.error || "Signup failed");
      }
      
      if (result.requiresConfirmation) {
        // Don't redirect, let the user know they need to confirm their email
        return { requiresConfirmation: true };
      }
      
      if (result.incomplete) {
        // Profile creation failed but account was created
        // We can either redirect to complete profile or let them try again later
        return { incomplete: true };
      }
      
      // Set the user in context
      setUser(result.user);
      
      // Redirect to dashboard
      navigate("/dashboard");
      
      return result;
    } catch (error) {
      console.error("Error signing up:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      setLoading(true);
      
      // Use authService to sign out
      await authService.signOut();
      setUser(null);
      
      // Redirect to home page
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Reset password function
  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      
      // Use authService to reset password
      await authService.resetPassword(email);
    } catch (error) {
      console.error("Error resetting password:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Function to check if user has required roles - delegate to authService
  const hasRole = (roles: UserRole[] | "all"): boolean => {
    return authService.hasRole(user, roles);
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
