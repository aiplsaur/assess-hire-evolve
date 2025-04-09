import { supabase } from '../lib/supabase'
import { handleError } from '../utils/errorHandler'

export const jobService = {
  async getAllJobs() {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    } catch (error) {
      throw handleError(error, 'getAllJobs')
    }
  },

  async getJobById(jobId) {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      throw handleError(error, 'getJobById')
    }
  },

  async createJob(jobData) {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .insert([jobData])
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      throw handleError(error, 'createJob')
    }
  },

  async updateJob(jobId, updates) {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .update(updates)
        .eq('id', jobId)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      throw handleError(error, 'updateJob')
    }
  }
} 