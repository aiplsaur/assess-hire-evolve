import { supabase } from '../lib/supabase'
import { handleError } from '../utils/errorHandler'

export const profileService = {
  async getProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      throw handleError(error, 'getProfile')
    }
  },

  async updateProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', userId)
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
        .insert([{ user_id: userId, ...profileData }])
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      throw handleError(error, 'createProfile')
    }
  }
} 