import { supabase } from './supabase'
import { handleError } from '../utils/errorHandler'

export const applicationService = {
  async getApplicationsByCandidate(candidateId) {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          jobs (*)
        `)
        .eq('candidate_id', candidateId)
        .order('applied_at', { ascending: false })
      
      if (error) throw error
      return data
    } catch (error) {
      throw handleError(error, 'getApplicationsByCandidate')
    }
  },
  
  async getApplicationsForJob(jobId) {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          profiles!candidate_id (id, first_name, last_name, email, role, avatar_url)
        `)
        .eq('job_id', jobId)
        .order('applied_at', { ascending: false })
      
      if (error) throw error
      return data
    } catch (error) {
      throw handleError(error, 'getApplicationsForJob')
    }
  },

  async createApplication(jobId, candidateId, applicationData = {}) {
    try {
      const { data, error } = await supabase
        .from('applications')
        .insert([{
          job_id: jobId,
          candidate_id: candidateId,
          status: 'applied',
          resume_url: applicationData.resumeUrl,
          cover_letter: applicationData.coverLetter,
          applied_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
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
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      throw handleError(error, 'updateApplicationStatus')
    }
  },
  
  async getApplicationDetails(applicationId) {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          jobs (*),
          profiles!candidate_id (id, first_name, last_name, email, role, avatar_url),
          assessment_assignments (
            id,
            status,
            score,
            assessments (*)
          ),
          interviews (
            id,
            status,
            scheduled_at,
            profiles!interviewer_id (id, first_name, last_name)
          )
        `)
        .eq('id', applicationId)
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      throw handleError(error, 'getApplicationDetails')
    }
  },
  
  async updateApplication(applicationId, updates) {
    try {
      const { data, error } = await supabase
        .from('applications')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      throw handleError(error, 'updateApplication')
    }
  }
} 