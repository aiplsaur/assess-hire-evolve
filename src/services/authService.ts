import { UserProfile, UserRole } from "@/types";
import { supabase } from "./supabase";
import { toast } from "@/hooks/use-toast";

// Sample temporary user data (for fallback if needed)
const mockUser: UserProfile = {
  id: "1",
  email: "admin@interviewpro.com",
  firstName: "Admin",
  lastName: "User",
  role: "admin",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Helper function for mock login (outside of authService)
const signInWithMockData = (email: string): UserProfile => {
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
  
  localStorage.setItem('user', JSON.stringify(loggedInUser));
  
  toast({
    title: "Signed in successfully (Demo Mode)",
    description: `Welcome back, ${loggedInUser.firstName}!`,
  });
  
  return loggedInUser;
};

export const authService = {
  /**
   * Get the current authenticated user from Supabase and localStorage
   */
  getCurrentUser: async () => {
    try {
      // First check if we have a Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session && session.user) {
        // If we have a session, fetch the user profile from Supabase
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (error) throw error;
        
        if (profile) {
          // Create a UserProfile from the Supabase data
          const userProfile: UserProfile = {
            id: session.user.id,
            email: session.user.email || '',
            firstName: profile.first_name || '',
            lastName: profile.last_name || '',
            role: profile.role as UserRole || 'candidate',
            avatar_url: profile.avatar_url,
            phone: profile.phone,
            created_at: profile.created_at || (session.user.created_at || new Date().toISOString()),
            updated_at: profile.updated_at || new Date().toISOString(),
          };
          
          // Store the user in localStorage for faster access
          localStorage.setItem('user', JSON.stringify(userProfile));
          return userProfile;
        }
      }
      
      // Fallback to localStorage if no Supabase session
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        return JSON.parse(storedUser);
      }
      
      return null;
    } catch (error) {
      console.error("Error checking authentication status:", error);
      
      // Fallback to localStorage if error
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        return JSON.parse(storedUser);
      }
      
      return null;
    }
  },

  /**
   * Sign in a user with email and password
   */
  signIn: async (email: string, password: string): Promise<UserProfile> => {
    try {
      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data && data.user) {
        // Fetch user profile data
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        if (profileError && profileError.code !== 'PGRST116') {
          // PGRST116 is "no rows returned" - in this case, we'll create a profile
          throw profileError;
        }
          
        // If no profile exists, create one based on the role
        let userProfile: UserProfile;
          
        if (profile) {
          userProfile = {
            id: data.user.id,
            email: data.user.email || '',
            firstName: profile.first_name || '',
            lastName: profile.last_name || '',
            role: profile.role as UserRole || 'candidate',
            avatar_url: profile.avatar_url,
            phone: profile.phone,
            created_at: profile.created_at || (data.user.created_at || new Date().toISOString()),
            updated_at: profile.updated_at || new Date().toISOString(),
          };
        } else {
          // Determine role based on email (for demo purposes)
          let role: UserRole = 'candidate';
          let firstName = 'User';
          let lastName = '';
          
          if (email.includes('admin')) {
            role = 'admin';
            firstName = 'Admin';
            lastName = 'User';
          } else if (email.includes('hr')) {
            role = 'hr';
            firstName = 'HR';
            lastName = 'Manager';
          } else if (email.includes('interviewer')) {
            role = 'interviewer';
            firstName = 'Technical';
            lastName = 'Interviewer';
          } else {
            role = 'candidate';
            firstName = 'Job';
            lastName = 'Seeker';
          }
          
          userProfile = {
            id: data.user.id,
            email: data.user.email || '',
            firstName,
            lastName,
            role,
            created_at: data.user.created_at ? data.user.created_at : new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          
          // Create a profile in the profiles table
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              first_name: firstName,
              last_name: lastName,
              role,
              email: data.user.email,
            });
            
          if (insertError) console.error("Error creating user profile:", insertError);
        }
        
        // Store user in localStorage
        localStorage.setItem('user', JSON.stringify(userProfile));
        
        // Show success toast
        toast({
          title: "Signed in successfully",
          description: `Welcome back, ${userProfile.firstName}!`,
        });
        
        return userProfile;
      }
      
      // For demo purposes, if Supabase auth fails but has demo email, still login
      if (email.includes('@interviewpro.com')) {
        return signInWithMockData(email);
      }
      
      throw new Error("Authentication failed");
    } catch (error) {
      console.error("Error signing in:", error);
      
      // For demo purposes, if using a demo email, allow login even if Supabase fails
      if (email.includes('@interviewpro.com')) {
        return signInWithMockData(email);
      }
      
      toast({
        title: "Sign in failed",
        description: error instanceof Error ? error.message : "Invalid email or password. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  },

  /**
   * Sign up a new user
   */
  signUp: async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: UserRole = "candidate"
  ): Promise<UserProfile> => {
    try {
      // Make sure to await the auth signup
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            role,
          },
        },
      });
      
      if (error) throw error;
      
      if (data && data.user) {
        // User is now authenticated, can insert into profiles
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,  // important: must match auth.uid()
            first_name: firstName,
            last_name: lastName,
            role,
            email: data.user.email,
          });
          
        if (profileError) console.error("Error creating profile:", profileError);
        
        // Create UserProfile object
        const userProfile: UserProfile = {
          id: data.user.id,
          email: data.user.email || '',
          firstName,
          lastName,
          role,
          created_at: data.user.created_at ? data.user.created_at : new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        // Store in localStorage
        localStorage.setItem('user', JSON.stringify(userProfile));
        
        // Show success toast
        toast({
          title: "Account created successfully",
          description: `Welcome to InterviewPro, ${firstName}!`,
        });
        
        return userProfile;
      }
      
      // Fallback to mock data for demo
      const newUser: UserProfile = {
        id: Math.random().toString(36).substring(2, 11),
        email,
        firstName,
        lastName,
        role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      localStorage.setItem('user', JSON.stringify(newUser));
      
      toast({
        title: "Account created successfully (Demo Mode)",
        description: `Welcome to InterviewPro, ${firstName}!`,
      });
      
      return newUser;
    } catch (error) {
      console.error("Error signing up:", error);
      
      // For demo purposes, create a user anyway
      const newUser: UserProfile = {
        id: Math.random().toString(36).substring(2, 11),
        email,
        firstName,
        lastName,
        role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      localStorage.setItem('user', JSON.stringify(newUser));
      
      toast({
        title: "Account created successfully (Demo Mode)",
        description: `Welcome to InterviewPro, ${firstName}!`,
        variant: "destructive",
      });
      
      return newUser;
    }
  },

  /**
   * Sign out the current user
   */
  signOut: async (): Promise<void> => {
    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear local storage
      localStorage.removeItem('user');
      
      // Show success toast
      toast({
        title: "Signed out successfully",
        description: "You have been logged out. See you soon!",
      });
    } catch (error) {
      console.error("Error signing out:", error);
      
      // Still clear localStorage even if Supabase fails
      localStorage.removeItem('user');
      
      toast({
        title: "Sign out failed",
        description: "There was a problem signing you out. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  },

  /**
   * Reset user password
   */
  resetPassword: async (email: string): Promise<void> => {
    try {
      // Use Supabase to send password reset email
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/auth/reset-password',
      });
      
      if (error) throw error;
      
      // Show success toast
      toast({
        title: "Password reset email sent",
        description: "Check your email for instructions to reset your password.",
      });
    } catch (error) {
      console.error("Error resetting password:", error);
      
      // Show demo toast anyway
      toast({
        title: "Password reset email sent (Demo)",
        description: "In a real application, an email would be sent to reset your password.",
        variant: "destructive",
      });
      
      throw error;
    }
  },

  /**
   * Update password with reset token
   */
  updatePassword: async (token: string, newPassword: string): Promise<void> => {
    try {
      // Use Supabase to update the password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      // Show success toast
      toast({
        title: "Password updated successfully",
        description: "You can now sign in with your new password.",
      });
    } catch (error) {
      console.error("Error updating password:", error);
      
      // In demo mode, simulate successful password reset
      if (process.env.NODE_ENV !== 'production') {
        toast({
          title: "Password updated successfully (Demo)",
          description: "In a real application, your password would be updated in the database.",
        });
        return;
      }
      
      toast({
        title: "Failed to update password",
        description: "The reset link may have expired. Please request a new one.",
        variant: "destructive",
      });
      
      throw error;
    }
  },

  /**
   * Check if the current user has the required role(s)
   */
  hasRole: (user: UserProfile | null, roles: UserRole[] | "all"): boolean => {
    if (!user) return false;
    if (roles === "all") return true;
    return roles.includes(user.role);
  }
}; 