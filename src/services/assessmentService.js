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
            // Get candidate info through application
            if (assignment.application_id) {
              const { data: application, error: applicationError } = await supabase
                .from('applications')
                .select(`
                  id,
                  profiles:candidate_id (
                    id,
                    first_name,
                    last_name,
                    email,
                    avatar_url
                  )
                `)
                .eq('id', assignment.application_id)
                .single()
              
              if (!applicationError && application && application.profiles) {
                return {
                  ...assignment,
                  candidate: {
                    id: application.profiles.id,
                    first_name: application.profiles.first_name,
                    last_name: application.profiles.last_name,
                    email: application.profiles.email,
                    avatar_url: application.profiles.avatar_url
                  }
                }
              }
            }
            
            // If no candidate info found through application
            return {
              ...assignment,
              candidate: {
                id: assignment.application_id || 'unknown',
                first_name: 'Unknown',
                last_name: 'Candidate',
                email: '',
                avatar_url: ''
              }
            }
          } catch (error) {
            console.error('Error fetching candidate profile:', error)
            return {
              ...assignment,
              candidate: {
                id: assignment.application_id || 'unknown',
                first_name: 'Unknown',
                last_name: 'Candidate',
                email: '',
                avatar_url: ''
              }
            }
          }
        })
      )
      
      return resultsWithCandidateInfo
    } catch (error) {
      throw handleError(error, 'getAssessmentResults')
    }
  },
  
  // Assign assessment to candidates
  async assignAssessment(assessmentId, applicationIds) {
    try {
      const assignments = applicationIds.map(applicationId => ({
        assessment_id: assessmentId,
        application_id: applicationId,
        status: 'pending',
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
  },
  
  // Add the assignAssessmentToApplication method
  async assignAssessmentToApplication(assessmentId, applicationId) {
    try {
      const { data, error } = await supabase
        .from('assessment_assignments')
        .insert({
          assessment_id: assessmentId,
          application_id: applicationId,
          status: 'pending',
        })
        .select();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error("Error assigning assessment:", error);
      throw handleError(error, 'assignAssessmentToApplication');
    }
  },
  
  // Methods for candidates taking assessments
  async getAssessmentForTaking(assessmentId, assignmentId) {
    try {
      // First, verify the assignment exists
      const { data: assignment, error: assignmentError } = await supabase
        .from('assessment_assignments')
        .select('id, assessment_id, status')
        .eq('id', assignmentId)
        .single();
        
      if (assignmentError) throw assignmentError;
      
      if (!assignment) {
        throw new Error("Assessment assignment not found");
      }

      // Check if the status is valid for taking the assessment
      if (assignment.status !== 'pending' && assignment.status !== 'in_progress') {
        throw new Error("Assessment has already been completed or is not available");
      }
      
      // Now get the assessment details
      const { data: assessment, error: assessmentError } = await supabase
        .from('assessments')
        .select('id, title, description, type, duration_minutes, passing_score')
        .eq('id', assessmentId)
        .single();
        
      if (assessmentError) throw assessmentError;
      
      if (!assessment) {
        throw new Error("Assessment not found");
      }
      
      // Get questions based on assessment type
      let questions = [];
      
      if (assessment.type === 'mcq') {
        const { data: mcqQuestions, error: mcqError } = await supabase
          .from('mcq_questions')
          .select('*')
          .eq('assessment_id', assessmentId);
          
        if (!mcqError && mcqQuestions) {
          questions = mcqQuestions.map((q, index) => ({
            id: q.id,
            question: q.question,
            type: 'mcq',
            order_num: q.order_num || index,
            options: Array.isArray(q.options) ? 
              q.options.map((opt, idx) => ({
                id: `${q.id}_opt_${idx}`,
                text: opt
              })) : 
              [{ id: `${q.id}_default`, text: 'Sample option' }]
          }));
        }
      } else if (assessment.type === 'coding') {
        const { data: codingQuestions, error: codingError } = await supabase
          .from('coding_questions')
          .select('*')
          .eq('assessment_id', assessmentId);
          
        if (!codingError && codingQuestions) {
          questions = codingQuestions.map((q, index) => ({
            id: q.id,
            question: q.title || q.question || 'Coding question',
            description: q.description,
            type: 'coding',
            order_num: q.order_num || index
          }));
        }
      } else if (assessment.type === 'text') {
        const { data: textQuestions, error: textError } = await supabase
          .from('text_questions')
          .select('*')
          .eq('assessment_id', assessmentId);
          
        if (!textError && textQuestions) {
          questions = textQuestions.map((q, index) => ({
            id: q.id,
            question: q.question,
            type: 'text',
            order_num: q.order_num || index
          }));
        }
      }
      
      // If no questions found, create a sample question
      if (questions.length === 0) {
        console.warn(`No questions found for assessment ${assessmentId}`);
        questions = [{
          id: 'sample-question-1',
          question: 'Sample question (No real questions found for this assessment)',
          type: assessment.type,
          order_num: 1,
          options: assessment.type === 'mcq' ? [
            { id: 'sample-opt-1', text: 'Option 1' },
            { id: 'sample-opt-2', text: 'Option 2' }
          ] : undefined
        }];
      }
      
      // Sort questions by order number
      questions.sort((a, b) => (a.order_num || 0) - (b.order_num || 0));
      
      return {
        ...assessment,
        questions
      };
    } catch (error) {
      console.error("Error getting assessment for taking:", error);
      throw handleError(error, 'getAssessmentForTaking');
    }
  },
  
  async startAssessment(assignmentId) {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('assessment_assignments')
        .update({
          status: 'in_progress',
          started_at: now
        })
        .eq('id', assignmentId)
        .eq('status', 'pending')
        .select();
        
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error("Error starting assessment:", error);
      throw handleError(error, 'startAssessment');
    }
  },
  
  async submitAssessment(assignmentId, submissionData) {
    try {
      const now = new Date().toISOString();
      let calculatedScore = null;
      
      // Get the assessment type
      const { data: assignment, error: assignmentError } = await supabase
        .from('assessment_assignments')
        .select(`
          assessment_id,
          assessments!assessment_id (
            type
          )
        `)
        .eq('id', assignmentId)
        .single();
      
      if (assignmentError) throw assignmentError;
      
      const assessmentType = assignment.assessments.type;
      
      // Import the assessment question service
      const { assessmentQuestionService } = await import('./assessmentQuestionService');
      
      // Process MCQ answers
      if (assessmentType === 'mcq') {
        // Submit each MCQ answer
        for (const answer of submissionData.answers) {
          if (answer.answer !== null && answer.answer !== undefined) {
            await assessmentQuestionService.submitMcqAnswer(
              assignmentId,
              answer.question_id,
              answer.answer
            );
          }
        }
        
        // Calculate the score automatically
        const scoreResult = await assessmentQuestionService.calculateMcqScore(assignmentId);
        calculatedScore = scoreResult.score;
      }
      
      // Update assignment status to completed
      const updateData = {
        status: 'completed',
        completed_at: now
      };
      
      // Add score if it was calculated
      if (calculatedScore !== null) {
        updateData.score = calculatedScore;
      }
      
      // Mark the assignment as completed
      const { data, error } = await supabase
        .from('assessment_assignments')
        .update(updateData)
        .eq('id', assignmentId)
        .eq('status', 'in_progress')
        .select();
        
      if (error) throw error;
      
      return {
        ...data[0],
        calculatedScore
      };
    } catch (error) {
      console.error("Error submitting assessment:", error);
      throw handleError(error, 'submitAssessment');
    }
  },

  // Get assessments assigned to the current user
  async getUserAssignments() {
    try {
      const { data: userProfile } = await supabase.auth.getUser();
      
      if (!userProfile || !userProfile.user) {
        throw new Error("User not authenticated");
      }
      
      const userId = userProfile.user.id;
      
      const { data, error } = await supabase
        .from('assessment_assignments')
        .select(`
          id,
          status,
          score,
          started_at,
          completed_at,
          created_at,
          assessments!assessment_id (
            id,
            title,
            description,
            type,
            duration_minutes,
            passing_score
          ),
          applications!application_id (
            id,
            jobs (
              id,
              title
            )
          )
        `)
        .in('status', ['pending', 'in_progress', 'completed'])
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error("Error getting user assignments:", error);
      throw handleError(error, 'getUserAssignments');
    }
  }
} 