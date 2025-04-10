import { supabase } from './supabase'
import { handleError } from '../utils/errorHandler'

export const interviewService = {
  // Interview Management
  async scheduleInterview(applicationId, interviewData) {
    try {
      const { data, error } = await supabase
        .from('interviews')
        .insert([{
          application_id: applicationId,
          interviewer_id: interviewData.interviewerId,
          scheduled_at: interviewData.scheduledAt,
          duration_minutes: interviewData.durationMinutes || 60,
          location: interviewData.location,
          meeting_link: interviewData.meetingLink,
          status: 'scheduled',
          notes: interviewData.notes,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      throw handleError(error, 'scheduleInterview')
    }
  },
  
  async getInterviewsByApplication(applicationId) {
    try {
      const { data, error } = await supabase
        .from('interviews')
        .select(`
          *,
          profiles!interviewer_id (id, first_name, last_name, email, role, avatar_url)
        `)
        .eq('application_id', applicationId)
        .order('scheduled_at', { ascending: true })
      
      if (error) throw error
      return data
    } catch (error) {
      throw handleError(error, 'getInterviewsByApplication')
    }
  },
  
  async getInterviewsByInterviewer(interviewerId) {
    try {
      const { data, error } = await supabase
        .from('interviews')
        .select(`
          *,
          applications (
            *,
            jobs (*),
            profiles!candidate_id (id, first_name, last_name, email, avatar_url)
          )
        `)
        .eq('interviewer_id', interviewerId)
        .order('scheduled_at', { ascending: true })
      
      if (error) throw error
      return data
    } catch (error) {
      throw handleError(error, 'getInterviewsByInterviewer')
    }
  },
  
  async updateInterviewStatus(interviewId, status, notes = null) {
    try {
      const updates = {
        status,
        updated_at: new Date().toISOString()
      }
      
      if (notes !== null) {
        updates.notes = notes
      }
      
      const { data, error } = await supabase
        .from('interviews')
        .update(updates)
        .eq('id', interviewId)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      throw handleError(error, 'updateInterviewStatus')
    }
  },
  
  async rescheduleInterview(interviewId, scheduledAt, durationMinutes = null) {
    try {
      const updates = {
        scheduled_at: scheduledAt,
        status: 'rescheduled',
        updated_at: new Date().toISOString()
      }
      
      if (durationMinutes !== null) {
        updates.duration_minutes = durationMinutes
      }
      
      const { data, error } = await supabase
        .from('interviews')
        .update(updates)
        .eq('id', interviewId)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      throw handleError(error, 'rescheduleInterview')
    }
  },
  
  // Feedback Criteria Management
  async getAllFeedbackCriteria() {
    try {
      const { data, error } = await supabase
        .from('feedback_criteria')
        .select('*')
        .order('name', { ascending: true })
      
      if (error) throw error
      return data
    } catch (error) {
      throw handleError(error, 'getAllFeedbackCriteria')
    }
  },
  
  async createFeedbackCriteria(criteriaData) {
    try {
      const { data, error } = await supabase
        .from('feedback_criteria')
        .insert([{
          name: criteriaData.name,
          description: criteriaData.description,
          weight: criteriaData.weight || 1.0
        }])
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      throw handleError(error, 'createFeedbackCriteria')
    }
  },
  
  async updateFeedbackCriteria(criteriaId, updates) {
    try {
      const { data, error } = await supabase
        .from('feedback_criteria')
        .update(updates)
        .eq('id', criteriaId)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      throw handleError(error, 'updateFeedbackCriteria')
    }
  },
  
  // Interview Feedback
  async submitInterviewFeedback(interviewId, interviewerId, feedbackData) {
    try {
      const { data, error } = await supabase
        .from('interview_feedback')
        .insert([{
          interview_id: interviewId,
          interviewer_id: interviewerId,
          criteria_scores: feedbackData.criteriaScores,
          overall_comment: feedbackData.overallComment,
          recommendation: feedbackData.recommendation,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()
      
      if (error) throw error
      
      // Update the interview status to completed
      await supabase
        .from('interviews')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', interviewId)
      
      return data
    } catch (error) {
      throw handleError(error, 'submitInterviewFeedback')
    }
  },
  
  async getInterviewFeedback(interviewId) {
    try {
      const { data, error } = await supabase
        .from('interview_feedback')
        .select(`
          *,
          profiles!interviewer_id (id, first_name, last_name, email, role, avatar_url)
        `)
        .eq('interview_id', interviewId)
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      throw handleError(error, 'getInterviewFeedback')
    }
  },
  
  async getAllInterviewFeedbackForApplication(applicationId) {
    try {
      const { data, error } = await supabase
        .from('interviews')
        .select(`
          id,
          scheduled_at,
          interview_feedback (
            *,
            profiles!interviewer_id (id, first_name, last_name, role)
          )
        `)
        .eq('application_id', applicationId)
        .eq('status', 'completed')
      
      if (error) throw error
      return data
    } catch (error) {
      throw handleError(error, 'getAllInterviewFeedbackForApplication')
    }
  }
} 