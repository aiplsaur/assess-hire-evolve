import { supabase } from './supabase'
import { handleError } from '../utils/errorHandler'

export const profileService = {
  async getProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      throw handleError(error, 'getProfile')
    }
  },

  async updateProfile(userId, updates) {
    try {
      const mappedUpdates = {
        ...updates.firstName && { first_name: updates.firstName },
        ...updates.lastName && { last_name: updates.lastName },
        ...updates.avatarUrl && { avatar_url: updates.avatarUrl },
        ...updates.phone && { phone: updates.phone },
        ...updates.bio && { bio: updates.bio },
        ...updates.headline && { headline: updates.headline },
        ...updates.location && { location: updates.location },
        updated_at: new Date().toISOString()
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .update(mappedUpdates)
        .eq('id', userId)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      throw handleError(error, 'updateProfile')
    }
  },

  async createProfile(userId, profileData) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([{ 
          id: userId, 
          first_name: profileData.firstName || '',
          last_name: profileData.lastName || '',
          email: profileData.email || '',
          role: profileData.role || 'candidate',
          avatar_url: profileData.avatarUrl,
          phone: profileData.phone,
          bio: profileData.bio,
          headline: profileData.headline,
          location: profileData.location,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      throw handleError(error, 'createProfile')
    }
  },
  
  async getProfiles(role = null, limit = 100) {
    try {
      let query = supabase
        .from('profiles')
        .select('*')
      
      if (role) {
        query = query.eq('role', role)
      }
      
      const { data, error } = await query
        .limit(limit)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    } catch (error) {
      throw handleError(error, 'getProfiles')
    }
  },
  
  async searchProfiles(searchTerm, role = null) {
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
      
      if (role) {
        query = query.eq('role', role)
      }
      
      const { data, error } = await query
        .limit(50)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    } catch (error) {
      throw handleError(error, 'searchProfiles')
    }
  }
} 