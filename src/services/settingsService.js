import { supabase } from './supabase';
import { handleError } from '../utils/errorHandler';
import { authService } from './authService';

export const settingsService = {
  // Get user preferences
  async getUserPreferences(userId) {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      // If no data was found, create default preferences
      if (!data) {
        return this.createDefaultPreferences(userId);
      }

      return data;
    } catch (error) {
      console.error('Error in getUserPreferences:', error);
      throw handleError(error, 'getUserPreferences');
    }
  },

  // Create default preferences for a new user
  async createDefaultPreferences(userId) {
    try {
      const defaultPreferences = {
        user_id: userId,
        email_notifications: true,
        dark_mode: false,
        notifications: {
          new_applications: true,
          interview_schedule: true,
          assessment_completed: true,
          team_activity: false,
          in_app_all: true,
          in_app_messages: true
        }
      };

      const { data, error } = await supabase
        .from('user_preferences')
        .insert([defaultPreferences])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw handleError(error, 'createDefaultPreferences');
    }
  },

  // Update user profile information
  async updateProfile(userId, profileData) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          phone: profileData.phoneNumber,
          location: profileData.location,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw handleError(error, 'updateProfile');
    }
  },

  // Update user preferences
  async updatePreferences(userId, preferences) {
    try {
      // Check if preferences exist
      const { data: existingPrefs, error: checkError } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking for preferences:', checkError);
        throw checkError;
      }

      // If preferences don't exist, create them; otherwise, update them
      if (!existingPrefs) {
        const newPrefs = {
          user_id: userId,
          ...preferences
        };
        
        const { data, error } = await supabase
          .from('user_preferences')
          .insert([newPrefs])
          .select()
          .single();
          
        if (error) {
          console.error('Error inserting preferences:', error);
          throw error;
        }
        
        return data;
      } else {
        const { data, error } = await supabase
          .from('user_preferences')
          .update(preferences)
          .eq('user_id', userId)
          .select()
          .single();
          
        if (error) {
          console.error('Error updating preferences:', error);
          throw error;
        }
        
        return data;
      }
    } catch (error) {
      console.error('Error in updatePreferences:', error);
      throw handleError(error, 'updatePreferences');
    }
  },

  // Update company information
  async updateCompanyInfo(userId, companyData) {
    try {
      // Check if company info exists
      const { data: existingCompany, error: checkError } = await supabase
        .from('company_profiles')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') throw checkError;

      // If company doesn't exist, create it; otherwise, update it
      if (!existingCompany) {
        const newCompany = {
          user_id: userId,
          name: companyData.name,
          website: companyData.website,
          industry: companyData.industry,
          size: companyData.size,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        const { data, error } = await supabase
          .from('company_profiles')
          .insert([newCompany])
          .select()
          .single();
          
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('company_profiles')
          .update({
            name: companyData.name,
            website: companyData.website,
            industry: companyData.industry,
            size: companyData.size,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .select()
          .single();
          
        if (error) throw error;
        return data;
      }
    } catch (error) {
      throw handleError(error, 'updateCompanyInfo');
    }
  },

  // Update notification settings
  async updateNotificationSettings(userId, notificationSettings) {
    try {
      return await this.updatePreferences(userId, {
        notifications: notificationSettings
      });
    } catch (error) {
      throw handleError(error, 'updateNotificationSettings');
    }
  },

  // Change password
  async changePassword(userId, currentPassword, newPassword) {
    try {
      // First, verify the current password is correct
      const { error: verifyError } = await authService.signInWithEmail(
        userId, 
        currentPassword
      );
      
      if (verifyError) throw new Error('Current password is incorrect');
      
      // If verification passes, update the password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      throw handleError(error, 'changePassword');
    }
  },

  // Enable/disable two-factor authentication
  async updateTwoFactorAuth(userId, enable) {
    try {
      // In a real app, you would handle 2FA setup here
      // For our purposes, we'll just update a preference
      return await this.updatePreferences(userId, {
        two_factor_enabled: enable
      });
    } catch (error) {
      throw handleError(error, 'updateTwoFactorAuth');
    }
  },
  
  // Get company information
  async getCompanyInfo(userId) {
    try {
      // Use correct query method instead of directly building the URL
      const { data, error } = await supabase
        .from('company_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle(); // Use maybeSingle instead of single to handle missing records without error

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data || null;
    } catch (error) {
      console.error('Error in getCompanyInfo:', error);
      throw handleError(error, 'getCompanyInfo');
    }
  }
}; 