import { supabase } from '../lib/supabase'
import { handleError } from '../utils/errorHandler'

export const applicationService = {
  async getApplicationsByUser(userId) {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          jobs (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    } catch (error) {
      throw handleError(error, 'getApplicationsByUser')
    }
  },

  async createApplication(userId, jobId, coverLetter) {
    try {
      const { data, error } = await supabase
        .from('applications')
        .insert([{
          user_id: userId,
          job_id: jobId,
          cover_letter: coverLetter,
          status: 'pending'
        }])
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      throw handleError(error, 'createApplication')
    }
  },

  async updateApplicationStatus(applicationId, status) {
    try {
      const { data, error } = await supabase
        .from('applications')
        .update({ status })
        .eq('id', applicationId)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      throw handleError(error, 'updateApplicationStatus')
    }
  }
} 