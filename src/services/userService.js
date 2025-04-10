import { supabase } from './supabase'
import { handleError } from '../utils/errorHandler'

export const userService = {
  // Get basic user information from auth
  async getUser(userId) {
    try {
      const { data, error } = await supabase.auth.admin.getUserById(userId)
      
      if (error) throw error
      return data?.user
    } catch (error) {
      throw handleError(error, 'getUser')
    }
  },
  
  // Get combined user data with profile information
  async getUserWithProfile(userId) {
    try {
      // First get the profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (profileError) throw profileError
      
      return profile
    } catch (error) {
      throw handleError(error, 'getUserWithProfile')
    }
  },
  
  // List users with various filters
  async listUsers(options = {}) {
    try {
      let query = supabase
        .from('profiles')
        .select('*')
      
      if (options.role) {
        query = query.eq('role', options.role)
      }
      
      if (options.search) {
        query = query.or(`first_name.ilike.%${options.search}%,last_name.ilike.%${options.search}%,email.ilike.%${options.search}%`)
      }
      
      const { data, error } = await query
        .limit(options.limit || 50)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    } catch (error) {
      throw handleError(error, 'listUsers')
    }
  },
  
  // Invite a new user to the application
  async inviteUser(email, options = {}) {
    try {
      // This is a placeholder - in a real Supabase app, you would use the admin API or auth.api.inviteUserByEmail
      // For now, we'll simulate a successful invite
      
      // Create a user entry in profiles table for the invited user
      const { data, error } = await supabase
        .from('profiles')
        .insert([{
          id: 'temp-' + Math.random().toString(36).substring(2, 11),
          email: email,
          role: options.role || 'candidate',
          first_name: options.firstName || '',
          last_name: options.lastName || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
      
      if (error) throw error
      
      return {
        success: true,
        user: data[0]
      }
    } catch (error) {
      throw handleError(error, 'inviteUser')
    }
  },
  
  // Change a user's role
  async changeUserRole(userId, role) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          role,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      throw handleError(error, 'changeUserRole')
    }
  }
} 