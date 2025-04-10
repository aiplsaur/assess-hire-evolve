import { supabase } from './supabase'
import { handleError } from '../utils/errorHandler'

export const assessmentService = {
  // Assessment management
  async getAllAssessments() {
    try {
      const { data, error } = await supabase
        .from('assessments')
        .select(`
          *,
          profiles!created_by (id, first_name, last_name)
        `)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    } catch (error) {
      throw handleError(error, 'getAllAssessments')
    }
  },
  
  async getAssessmentById(assessmentId) {
    try {
      const { data, error } = await supabase
        .from('assessments')
        .select(`
          *,
          profiles!created_by (id, first_name, last_name)
        `)
        .eq('id', assessmentId)
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      throw handleError(error, 'getAssessmentById')
    }
  },
  
  async createAssessment(userId, assessmentData) {
    try {
      const { data, error } = await supabase
        .from('assessments')
        .insert([{
          title: assessmentData.title,
          description: assessmentData.description,
          type: assessmentData.type,
          duration_minutes: assessmentData.durationMinutes,
          passing_score: assessmentData.passingScore,
          created_by: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      throw handleError(error, 'createAssessment')
    }
  },
  
  async updateAssessment(assessmentId, updates) {
    try {
      const mappedUpdates = {
        ...updates.title && { title: updates.title },
        ...updates.description && { description: updates.description },
        ...updates.type && { type: updates.type },
        ...updates.durationMinutes && { duration_minutes: updates.durationMinutes },
        ...updates.passingScore !== undefined && { passing_score: updates.passingScore },
        updated_at: new Date().toISOString()
      }
      
      const { data, error } = await supabase
        .from('assessments')
        .update(mappedUpdates)
        .eq('id', assessmentId)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      throw handleError(error, 'updateAssessment')
    }
  },
  
  async deleteAssessment(assessmentId) {
    try {
      const { error } = await supabase
        .from('assessments')
        .delete()
        .eq('id', assessmentId)
      
      if (error) throw error
      return true
    } catch (error) {
      throw handleError(error, 'deleteAssessment')
    }
  },
  
  // MCQ Questions
  async getMcqQuestions(assessmentId) {
    try {
      const { data, error } = await supabase
        .from('mcq_questions')
        .select('*')
        .eq('assessment_id', assessmentId)
      
      if (error) throw error
      return data
    } catch (error) {
      throw handleError(error, 'getMcqQuestions')
    }
  },
  
  async createMcqQuestion(assessmentId, questionData) {
    try {
      const { data, error } = await supabase
        .from('mcq_questions')
        .insert([{
          assessment_id: assessmentId,
          question: questionData.question,
          options: questionData.options,
          correct_option: questionData.correctOption,
          points: questionData.points || 1
        }])
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      throw handleError(error, 'createMcqQuestion')
    }
  },
  
  async updateMcqQuestion(questionId, updates) {
    try {
      const { data, error } = await supabase
        .from('mcq_questions')
        .update(updates)
        .eq('id', questionId)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      throw handleError(error, 'updateMcqQuestion')
    }
  },
  
  async deleteMcqQuestion(questionId) {
    try {
      const { error } = await supabase
        .from('mcq_questions')
        .delete()
        .eq('id', questionId)
      
      if (error) throw error
      return true
    } catch (error) {
      throw handleError(error, 'deleteMcqQuestion')
    }
  },
  
  // Coding Questions
  async getCodingQuestions(assessmentId) {
    try {
      const { data, error } = await supabase
        .from('coding_questions')
        .select('*')
        .eq('assessment_id', assessmentId)
      
      if (error) throw error
      return data
    } catch (error) {
      throw handleError(error, 'getCodingQuestions')
    }
  },
  
  async createCodingQuestion(assessmentId, questionData) {
    try {
      const { data, error } = await supabase
        .from('coding_questions')
        .insert([{
          assessment_id: assessmentId,
          title: questionData.title,
          description: questionData.description,
          starter_code: questionData.starterCode,
          test_cases: questionData.testCases,
          points: questionData.points || 1
        }])
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      throw handleError(error, 'createCodingQuestion')
    }
  },
  
  // Text Questions
  async getTextQuestions(assessmentId) {
    try {
      const { data, error } = await supabase
        .from('text_questions')
        .select('*')
        .eq('assessment_id', assessmentId)
      
      if (error) throw error
      return data
    } catch (error) {
      throw handleError(error, 'getTextQuestions')
    }
  },
  
  async createTextQuestion(assessmentId, questionData) {
    try {
      const { data, error } = await supabase
        .from('text_questions')
        .insert([{
          assessment_id: assessmentId,
          question: questionData.question,
          word_limit: questionData.wordLimit,
          points: questionData.points || 1
        }])
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      throw handleError(error, 'createTextQuestion')
    }
  },
  
  // Assessment Assignments
  async assignAssessment(assessmentId, applicationId) {
    try {
      const { data, error } = await supabase
        .from('assessment_assignments')
        .insert([{
          assessment_id: assessmentId,
          application_id: applicationId,
          status: 'pending',
          created_at: new Date().toISOString()
        }])
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      throw handleError(error, 'assignAssessment')
    }
  },
  
  async getAssessmentAssignments(applicationId) {
    try {
      const { data, error } = await supabase
        .from('assessment_assignments')
        .select(`
          *,
          assessments (*)
        `)
        .eq('application_id', applicationId)
      
      if (error) throw error
      return data
    } catch (error) {
      throw handleError(error, 'getAssessmentAssignments')
    }
  },
  
  async updateAssessmentAssignmentStatus(assignmentId, status, score = null) {
    try {
      const updates = {
        status,
        ...score !== null && { score }
      }
      
      if (status === 'in_progress' && !updates.started_at) {
        updates.started_at = new Date().toISOString()
      }
      
      if (status === 'completed' && !updates.completed_at) {
        updates.completed_at = new Date().toISOString()
      }
      
      if (status === 'evaluated' && !updates.evaluated_at) {
        updates.evaluated_at = new Date().toISOString()
      }
      
      const { data, error } = await supabase
        .from('assessment_assignments')
        .update(updates)
        .eq('id', assignmentId)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      throw handleError(error, 'updateAssessmentAssignmentStatus')
    }
  }
} 