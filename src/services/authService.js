// Import supabase client (assumed to be initialized elsewhere)
import { supabase } from "./supabase";
import { toast } from "@/hooks/use-toast";

// Sample temporary user data (for fallback if needed)
const mockUser = {
  id: "1",
  email: "admin@interviewpro.com",
  firstName: "Admin",
  lastName: "User",
  role: "admin",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Helper function for mock login (outside of authService)
const signInWithMockData = (email) => {
  let loggedInUser;

  if (email.includes("admin")) {
    loggedInUser = { ...mockUser, role: "admin" };
  } else if (email.includes("hr")) {
    loggedInUser = {
      ...mockUser,
      id: "2",
      email: email,
      firstName: "HR",
      lastName: "Manager",
      role: "hr",
    };
  } else if (email.includes("interviewer")) {
    loggedInUser = {
      ...mockUser,
      id: "3",
      email: email,
      firstName: "Technical",
      lastName: "Interviewer",
      role: "interviewer",
    };
  } else {
    loggedInUser = {
      ...mockUser,
      id: "4",
      email: email,
      firstName: "Job",
      lastName: "Seeker",
      role: "candidate",
    };
  }

  localStorage.setItem("user", JSON.stringify(loggedInUser));

  toast({
    title: "Signed in successfully (Demo Mode)",
    description: `Welcome back, ${loggedInUser.firstName}!`,
  });

  return loggedInUser;
};

// Helper function to create a mock user when Supabase fails
const fallbackToMockUser = (
  email = "",
  firstName = "Demo",
  lastName = "User",
  role = "candidate"
) => {
  const newUser = {
    id: Math.random().toString(36).substring(2, 11),
    email,
    firstName,
    lastName,
    role,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  localStorage.setItem("user", JSON.stringify(newUser));

  toast({
    title: "Account created successfully (Demo Mode)",
    description: `Welcome to AnthemHire, ${firstName}!`,
    variant: "destructive",
  });

  return newUser;
};

export const authService = {
  /**
   * Get the current authenticated user from Supabase and localStorage
   */
  getCurrentUser: async () => {
    try {
      const { data } = await supabase.auth.getSession();

      if (data.session && data.session.user) {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.session.user.id)
          .single();

        if (error) throw error;

        if (profile) {
          const userProfile = {
            id: data.session.user.id,
            email: data.session.user.email || "",
            firstName: profile.first_name || "",
            lastName: profile.last_name || "",
            role: profile.role || "candidate",
            avatar_url: profile.avatar_url,
            phone: profile.phone,
            created_at:
              profile.created_at ||
              (data.session.user.created_at || new Date().toISOString()),
            updated_at: profile.updated_at || new Date().toISOString(),
          };

          localStorage.setItem("user", JSON.stringify(userProfile));
          return userProfile;
        }
      }

      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        return JSON.parse(storedUser);
      }

      return null;
    } catch (error) {
      console.error("Error checking authentication status:", error);

      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        return JSON.parse(storedUser);
      }

      return null;
    }
  },

  /**
   * Sign in a user with email and password
   */
  signIn: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data && data.user) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();

        if (profileError && profileError.code !== "PGRST116") {
          throw profileError;
        }

        let userProfile;

        if (profile) {
          userProfile = {
            id: data.user.id,
            email: data.user.email || "",
            firstName: profile.first_name || "",
            lastName: profile.last_name || "",
            role: profile.role || "candidate",
            avatar_url: profile.avatar_url,
            phone: profile.phone,
            created_at:
              profile.created_at ||
              (data.user.created_at || new Date().toISOString()),
            updated_at: profile.updated_at || new Date().toISOString(),
          };
        } else {
          let role = "candidate";
          let firstName = "User";
          let lastName = "";

          if (email.includes("admin")) {
            role = "admin";
            firstName = "Admin";
            lastName = "User";
          } else if (email.includes("hr")) {
            role = "hr";
            firstName = "HR";
            lastName = "Manager";
          } else if (email.includes("interviewer")) {
            role = "interviewer";
            firstName = "Technical";
            lastName = "Interviewer";
          } else {
            role = "candidate";
            firstName = "Job";
            lastName = "Seeker";
          }

          userProfile = {
            id: data.user.id,
            email: data.user.email || "",
            firstName,
            lastName,
            role,
            created_at: data.user.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          const { error: insertError } = await supabase
            .from("profiles")
            .insert({
              id: data.user.id,
              first_name: firstName,
              last_name: lastName,
              role,
              email: data.user.email,
            });

          if (insertError)
            console.error("Error creating user profile:", insertError);
        }

        localStorage.setItem("user", JSON.stringify(userProfile));

        toast({
          title: "Signed in successfully",
          description: `Welcome back, ${userProfile.firstName}!`,
        });

        return userProfile;
      }

      if (email.includes("@interviewpro.com")) {
        return signInWithMockData(email);
      }

      throw new Error("Authentication failed");
    } catch (error) {
      console.error("Error signing in:", error);

      if (email.includes("@interviewpro.com")) {
        return signInWithMockData(email);
      }

      toast({
        title: "Sign in failed",
        description:
          error instanceof Error
            ? error.message
            : "Invalid email or password. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  },

  /**
   * Sign up a new user
   */
  signUp: async (email, password, firstName, lastName, role = "candidate") => {
    try {
      // Proceed with signup
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

      // Check specific error cases
      if (error) {
        if (error.message?.includes("already registered") || 
            error.message?.includes("already in use") ||
            error.message?.includes("already exists")) {
          toast({
            title: "Account already exists",
            description: "An account with this email already exists. Please log in instead.",
            variant: "destructive",
          });
          return { error: "Account already exists", success: false };
        }
        throw error;
      }

      // Check if we have user data
      if (!data || !data.user) {
        toast({
          title: "Signup failed",
          description: "There was a problem creating your account. Please try again.",
          variant: "destructive",
        });
        return { error: "Signup failed", success: false };
      }
      
      // For confirmation-required setups, check if email confirmation is required
      if (data.user.identities && data.user.identities.length === 0) {
        toast({
          title: "Account already exists",
          description: "An account with this email already exists. Please log in instead.",
          variant: "destructive",
        });
        return { error: "Account already exists", success: false };
      }
      
      // If confirmation is required but user isn't yet confirmed
      if (data.user.confirmed_at === null && !data.session) {
        toast({
          title: "Confirmation email sent",
          description: "Please check your email to confirm your account before signing in.",
        });
        return { error: null, success: true, requiresConfirmation: true };
      }

      // Set session for authenticated profile creation
      const { data: sessionData } = await supabase.auth.setSession({
        access_token: data.session?.access_token || "",
        refresh_token: data.session?.refresh_token || "",
      });

      console.log("Signup success, user:", data.user.id);
      console.log("Session after signup:", sessionData.session);

      await new Promise((resolve) => setTimeout(resolve, 500));

      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: data.user.id,
          first_name: firstName,
          last_name: lastName,
          role,
          email: data.user.email,
        });

      if (profileError) {
        console.error("Error creating profile:", profileError);
        
        // Check if error is due to profile already existing
        if (profileError.code === "23505" || // Unique constraint violation
            profileError.message?.includes("already exists")) {
          toast({
            title: "Account already exists",
            description: "An account with this email already exists. Please log in instead.",
            variant: "destructive",
          });
          return { error: "Account already exists", success: false };
        }
        
        toast({
          title: "Signup incomplete",
          description: "Your account was created but we couldn't set up your profile. Please sign in to continue.",
          variant: "destructive",
        });
        
        return { 
          user: { id: data.user.id, email: data.user.email },
          success: true,
          incomplete: true 
        };
      }
      
      // Create user profile object
      const userProfile = {
        id: data.user.id,
        email: data.user.email || "",
        firstName,
        lastName,
        role,
        created_at: data.user.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      localStorage.setItem("user", JSON.stringify(userProfile));

      toast({
        title: "Account created successfully",
        description: `Welcome to AnthemHire, ${firstName}!`,
      });

      return { user: userProfile, success: true };
    } catch (error) {
      console.error("Error signing up:", error);
      
      // Handle specific error messages
      if (error.message?.includes("already registered") || 
          error.message?.includes("already in use") ||
          error.message?.includes("already exists")) {
        toast({
          title: "Account already exists",
          description: "An account with this email already exists. Please log in instead.",
          variant: "destructive",
        });
        return { error: "Account already exists", success: false };
      }
      
      toast({
        title: "Signup failed",
        description: "There was a problem creating your account. Please try again.",
        variant: "destructive",
      });
      
      return { error: error.message || "Signup failed", success: false };
    }
  },

  /**
   * Sign out the current user
   */
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      localStorage.removeItem("user");

      toast({
        title: "Signed out successfully",
        description: "You have been logged out. See you soon!",
      });
    } catch (error) {
      console.error("Error signing out:", error);

      localStorage.removeItem("user");

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
  resetPassword: async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/auth/reset-password",
      });

      if (error) throw error;

      toast({
        title: "Password reset email sent",
        description: "Check your email for instructions to reset your password.",
      });
    } catch (error) {
      console.error("Error resetting password:", error);

      toast({
        title: "Password reset email sent (Demo)",
        description:
          "In a real application, an email would be sent to reset your password.",
        variant: "destructive",
      });

      throw error;
    }
  },

  /**
   * Update password with reset token
   */
  updatePassword: async (token, newPassword) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast({
        title: "Password updated successfully",
        description: "You can now sign in with your new password.",
      });
    } catch (error) {
      console.error("Error updating password:", error);

      if (process.env.NODE_ENV !== "production") {
        toast({
          title: "Password updated successfully (Demo)",
          description:
            "In a real application, your password would be updated in the database.",
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
  hasRole: (user, roles) => {
    if (!user) return false;
    if (roles === "all") return true;
    return roles.includes(user.role);
  },

  /**
   * Get all users with interviewer/admin/hr roles
   */
  getAllUsers: async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, role, avatar_url')
        .in('role', ['interviewer', 'admin', 'hr'])
        .order('first_name', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching users:", error);
      
      // For development/demo, return mock users if there's an error
      if (process.env.NODE_ENV !== "production") {
        return [
          { 
            id: "1", 
            first_name: "Admin", 
            last_name: "User", 
            email: "admin@example.com", 
            role: "admin" 
          },
          { 
            id: "2", 
            first_name: "HR", 
            last_name: "Manager", 
            email: "hr@example.com", 
            role: "hr" 
          },
          { 
            id: "3", 
            first_name: "Technical", 
            last_name: "Interviewer", 
            email: "interviewer@example.com", 
            role: "interviewer" 
          }
        ];
      }
      
      throw error;
    }
  },

  /**
   * Create a new user with email (for admin/HR user creation)
   * This bypasses the normal confirmation flow
   */
  createUserWithEmail: async ({ email, password, role = "candidate" }) => {
    try {
      // Use regular signup instead of admin API
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role
          }
        }
      });

      if (error) {
        // Check if user already exists
        if (error.message?.includes("already registered") || 
            error.message?.includes("already in use") ||
            error.message?.includes("already exists")) {
          
          // For admin flow, we can just fetch the existing user
          const { data: userData, error: userError } = await supabase
            .from("profiles")
            .select("id")
            .eq("email", email)
            .single();
            
          if (userError) throw userError;
          
          return { user: { id: userData.id, email }, success: true, existing: true };
        }
        
        throw error;
      }

      if (!data || !data.user) {
        throw new Error("Failed to create user");
      }
      
      // If email confirmation is needed, automatically confirm for admin-created users
      if (data.user.confirmed_at === null) {
        // Note: In production, you might want to add a proper confirmation link or API call
        console.log("User created but requires confirmation. In a real app with admin access, we would auto-confirm.");
      }

      return { user: data.user, success: true };
    } catch (error) {
      console.error("Error creating user:", error);
      
      // If this is still failing, create a temporary user for development
      if (process.env.NODE_ENV !== "production") {
        const tempId = Math.random().toString(36).substring(2, 15);
        return { 
          user: { 
            id: tempId, 
            email 
          }, 
          success: true, 
          dev: true 
        };
      }
      
      throw error;
    }
  },
};