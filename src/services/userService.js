import { supabase } from '../lib/supabase'
import { handleError } from '../utils/errorHandler'

export const userService = {
  async getUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      throw handleError(error, 'getUserProfile')
    }
  },

  async updateUserProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      throw handleError(error, 'updateUserProfile')
    }
  }
} 