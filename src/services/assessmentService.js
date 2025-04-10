import { supabase } from './supabase'
import { handleError } from '../utils/errorHandler'

export const assessmentService = {
  // Get all assessments with optional filters
  async getAllAssessments(options = {}) {
    try {
      let query = supabase
        .from('assessments')
        .select('*')
      
      // Apply filters if provided
      if (options.type) {
        query = query.eq('type', options.type)
      }
      
      if (options.status) {
        query = query.eq('status', options.status)
      }
      
      if (options.search) {
        query = query.or(`title.ilike.%${options.search}%,description.ilike.%${options.search}%`)
      }
      
      // Execute query with ordering and limits
      const { data, error } = await query
        .order(options.orderBy || 'created_at', { ascending: options.ascending || false })
        .limit(options.limit || 50)
      
      if (error) {
        // If we hit RLS policy issues, return mock data in development
        if ((error.code === '42501' || error.code === 'PGRST301') && process.env.NODE_ENV !== 'production') {
          console.warn('RLS policy prevented fetching assessments - using mock data in development');
          return this.getMockAssessments(options);
        }
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getAllAssessments:', error);
      
      // For development, fallback to mock data
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Using mock assessment data due to error');
        return this.getMockAssessments(options);
      }
      
      throw handleError(error, 'getAllAssessments');
    }
  },
  
  // Helper method to generate mock assessment data
  getMockAssessments(options = {}) {
    const mockAssessments = [
      {
        id: 'mock-1',
        title: 'Frontend Developer Technical Assessment',
        description: 'This assessment evaluates a candidate\'s proficiency in core frontend technologies including HTML, CSS, JavaScript, and React.js.',
        type: 'mcq',
        duration_minutes: 60,
        passing_score: 70,
        status: 'active',
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'mock-2',
        title: 'Product Management Knowledge Test',
        description: 'Evaluate product management methodology and skills.',
        type: 'mcq',
        duration_minutes: 45,
        passing_score: 75,
        status: 'active',
        created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'mock-3',
        title: 'UX Design Challenge',
        description: 'Assess UX design thinking and problem-solving abilities.',
        type: 'text',
        duration_minutes: 90,
        passing_score: 80,
        status: 'active',
        created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'mock-4',
        title: 'Backend Development Assessment',
        description: 'Test backend skills including API design, database knowledge, and system architecture.',
        type: 'coding',
        duration_minutes: 75,
        passing_score: 65,
        status: 'active',
        created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'mock-5',
        title: 'Marketing Strategy Case Study',
        description: 'Evaluate marketing strategy formulation and analytical skills.',
        type: 'text',
        duration_minutes: 120,
        passing_score: 70,
        status: 'draft',
        created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    
    // Apply filters
    let filteredData = [...mockAssessments];
    
    if (options.type) {
      filteredData = filteredData.filter(item => item.type === options.type);
    }
    
    if (options.status) {
      filteredData = filteredData.filter(item => item.status === options.status);
    }
    
    if (options.search) {
      const searchLower = options.search.toLowerCase();
      filteredData = filteredData.filter(item => 
        item.title.toLowerCase().includes(searchLower) || 
        item.description.toLowerCase().includes(searchLower)
      );
    }
    
    return filteredData;
  },
  
  // Get assessment by ID
  async getAssessmentById(assessmentId) {
    try {
      const { data, error } = await supabase
        .from('assessments')
        .select(`
          *,
          coding_questions (*)
        `)
        .eq('id', assessmentId)
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      throw handleError(error, 'getAssessmentById')
    }
  },
  
  // Create a new assessment
  async createAssessment(assessmentData) {
    try {
      // Get the current user's ID from the auth session
      const { data: session } = await supabase.auth.getSession();
      const userId = session?.session?.user?.id;
      
      if (!userId) {
        throw new Error("You must be logged in to create an assessment");
      }
      
      const { data, error } = await supabase
        .from('assessments')
        .insert([{
          title: assessmentData.title,
          description: assessmentData.description,
          type: assessmentData.type,
          duration_minutes: assessmentData.durationMinutes,
          passing_score: assessmentData.passingScore,
          status: assessmentData.status || 'draft',
          created_by: userId, // Important: Add the user ID as creator
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) {
        // If we hit RLS policy issues, try using mock data in development
        if (error.code === '42501' && process.env.NODE_ENV !== 'production') {
          console.warn('RLS policy prevented assessment creation - using mock response in development');
          
          // Return a mock assessment with a generated ID
          return {
            id: `mock-${Math.random().toString(36).substring(2, 11)}`,
            title: assessmentData.title,
            description: assessmentData.description,
            type: assessmentData.type,
            duration_minutes: assessmentData.durationMinutes,
            passing_score: assessmentData.passingScore,
            status: assessmentData.status || 'draft',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        }
        
        throw error;
      }
      
      return data;
    } catch (error) {
      throw handleError(error, 'createAssessment');
    }
  },
  
  // Update an existing assessment
  async updateAssessment(assessmentId, assessmentData) {
    try {
      const updates = {
        updated_at: new Date().toISOString()
      }
      
      // Only update fields that are provided
      if (assessmentData.title !== undefined) updates.title = assessmentData.title
      if (assessmentData.description !== undefined) updates.description = assessmentData.description
      if (assessmentData.type !== undefined) updates.type = assessmentData.type
      if (assessmentData.durationMinutes !== undefined) updates.duration_minutes = assessmentData.durationMinutes
      if (assessmentData.passingScore !== undefined) updates.passing_score = assessmentData.passingScore
      if (assessmentData.status !== undefined) updates.status = assessmentData.status
      
      const { data, error } = await supabase
        .from('assessments')
        .update(updates)
        .eq('id', assessmentId)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      throw handleError(error, 'updateAssessment')
    }
  },
  
  // Delete an assessment
  async deleteAssessment(assessmentId) {
    try {
      const { error } = await supabase
        .from('assessments')
        .delete()
        .eq('id', assessmentId)
      
      if (error) throw error
      return { success: true }
    } catch (error) {
      throw handleError(error, 'deleteAssessment')
    }
  },
  
  // Get assessment results
  async getAssessmentResults(assessmentId) {
    try {
      // First get the assignments
      const { data: assignments, error: assignmentsError } = await supabase
        .from('assessment_assignments')
        .select(`
          *,
          assessments (id, title, type, passing_score)
        `)
        .eq('assessment_id', assessmentId)
      
      if (assignmentsError) throw assignmentsError
      
      // If no assignments, return empty array
      if (!assignments || assignments.length === 0) {
        return []
      }
      
      // Process each assignment to get candidate info and format the result
      const resultsWithCandidateInfo = await Promise.all(
        assignments.map(async (assignment) => {
          try {
            // Get candidate profile if candidate_id exists
            if (assignment.candidate_id) {
              const { data: candidateProfile, error: profileError } = await supabase
                .from('profiles')
                .select('id, first_name, last_name, email, avatar_url')
                .eq('id', assignment.candidate_id)
                .single()
              
              if (!profileError && candidateProfile) {
                return {
                  ...assignment,
                  candidate_name: `${candidateProfile.first_name} ${candidateProfile.last_name}`,
                  candidate_email: candidateProfile.email,
                  candidate_avatar: candidateProfile.avatar_url
                }
              }
            }
            
            // If no candidate info found, return assignment as is
            return {
              ...assignment,
              candidate_name: 'Unknown Candidate',
              candidate_email: '',
              candidate_avatar: ''
            }
          } catch (error) {
            console.error('Error fetching candidate profile:', error)
            return assignment
          }
        })
      )
      
      return resultsWithCandidateInfo
    } catch (error) {
      throw handleError(error, 'getAssessmentResults')
    }
  },
  
  // Assign assessment to candidates
  async assignAssessment(assessmentId, candidateIds) {
    try {
      const assignments = candidateIds.map(candidateId => ({
        assessment_id: assessmentId,
        candidate_id: candidateId,
        status: 'assigned',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))
      
      const { data, error } = await supabase
        .from('assessment_assignments')
        .insert(assignments)
        .select()
      
      if (error) throw error
      return data
    } catch (error) {
      throw handleError(error, 'assignAssessment')
    }
  },
  
  // Get assessment completion stats
  async getAssessmentStats(assessmentId) {
    try {
      // If it's a mock ID, return mock stats
      if (assessmentId.startsWith('mock-')) {
        return {
          completionCount: Math.floor(Math.random() * 50),
          questionCount: Math.floor(Math.random() * 20) + 5
        };
      }
      
      // Count completions
      const { count, error: countError } = await supabase
        .from('assessment_assignments')
        .select('*', { count: 'exact', head: true })
        .eq('assessment_id', assessmentId)
        .eq('status', 'completed')
      
      if (countError) {
        if (countError.code === '42501' && process.env.NODE_ENV !== 'production') {
          return {
            completionCount: Math.floor(Math.random() * 30),
            questionCount: Math.floor(Math.random() * 15) + 5
          };
        }
        throw countError;
      }
      
      // Get questions count
      const { data: questions, error: questionsError } = await supabase
        .from('coding_questions')
        .select('*', { count: 'exact', head: true })
        .eq('assessment_id', assessmentId)
      
      if (questionsError) {
        if (questionsError.code === '42501' && process.env.NODE_ENV !== 'production') {
          return {
            completionCount: count || Math.floor(Math.random() * 30),
            questionCount: Math.floor(Math.random() * 15) + 5
          };
        }
        throw questionsError;
      }
      
      return {
        completionCount: count || 0,
        questionCount: questions?.length || 0
      };
    } catch (error) {
      console.error('Error getting assessment stats:', error);
      
      // In development, return mock stats
      if (process.env.NODE_ENV !== 'production') {
        return {
          completionCount: Math.floor(Math.random() * 30),
          questionCount: Math.floor(Math.random() * 15) + 5
        };
      }
      
      throw handleError(error, 'getAssessmentStats');
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