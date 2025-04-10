import { supabase } from './supabase'
import { handleError } from '../utils/errorHandler'

export const candidateService = {
  async getAllCandidates() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          applications (
            id,
            status,
            applied_at,
            resume_url,
            jobs (
              id,
              title,
              department,
              location
            )
          )
        `)
        .eq('role', 'candidate')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    } catch (error) {
      throw handleError(error, 'getAllCandidates')
    }
  },

  async searchCandidates(searchTerm) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          applications (
            id,
            status,
            applied_at,
            resume_url,
            jobs (
              id,
              title,
              department,
              location
            )
          )
        `)
        .eq('role', 'candidate')
        .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    } catch (error) {
      throw handleError(error, 'searchCandidates')
    }
  },

  async getCandidateById(candidateId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          applications (
            id,
            status,
            applied_at,
            resume_url,
            updated_at,
            cover_letter,
            jobs (
              id,
              title,
              department,
              location
            ),
            interviews (
              id,
              status,
              scheduled_at,
              notes,
              duration_minutes,
              location,
              meeting_link,
              profiles!interviewer_id (id, first_name, last_name)
            ),
            assessment_assignments (
              id,
              status,
              score,
              assessments (*)
            )
          )
        `)
        .eq('id', candidateId)
        .eq('role', 'candidate')
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      throw handleError(error, 'getCandidateById')
    }
  },

  async getCandidatesByStatus(status) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          applications!inner (
            id,
            status,
            applied_at,
            resume_url,
            jobs (
              id,
              title,
              department,
              location
            )
          )
        `)
        .eq('role', 'candidate')
        .eq('applications.status', status)
        .order('applications.applied_at', { ascending: false })
      
      if (error) throw error
      return data
    } catch (error) {
      throw handleError(error, 'getCandidatesByStatus')
    }
  },

  async getRecentCandidates(limit = 5) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          applications (
            id,
            status,
            applied_at,
            resume_url,
            jobs (
              id,
              title,
              department,
              location
            )
          )
        `)
        .eq('role', 'candidate')
        .order('created_at', { ascending: false })
        .limit(limit)
      
      if (error) throw error
      return data
    } catch (error) {
      throw handleError(error, 'getRecentCandidates')
    }
  },

  async createCandidate(candidateData) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([{ 
          id: candidateData.id,
          first_name: candidateData.firstName,
          last_name: candidateData.lastName,
          email: candidateData.email,
          phone: candidateData.phone || '',
          location: candidateData.location || '',
          headline: candidateData.headline || '',
          bio: candidateData.bio || '',
          role: 'candidate',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      throw handleError(error, 'createCandidate')
    }
  },

  async updateCandidate(candidateId, candidateData) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          first_name: candidateData.first_name,
          last_name: candidateData.last_name,
          email: candidateData.email,
          phone: candidateData.phone || '',
          location: candidateData.location || '',
          headline: candidateData.headline || '',
          bio: candidateData.bio || '',
          updated_at: new Date().toISOString()
        })
        .eq('id', candidateId)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      throw handleError(error, 'updateCandidate')
    }
  }
} 