import { supabase } from './supabase';

// Error handling helper
const handleError = (error, functionName) => {
  console.error(`Error in assessmentQuestionService.${functionName}:`, error);
  
  if (error.message) {
    return new Error(error.message);
  }
  
  return new Error(`An error occurred in ${functionName}`);
};

export const assessmentQuestionService = {
  // Get all MCQ questions for a specific assessment
  async getMcqQuestions(assessmentId) {
    try {
      const { data, error } = await supabase
        .from('mcq_questions')
        .select('*')
        .eq('assessment_id', assessmentId);
          
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw handleError(error, 'getMcqQuestions');
    }
  },

  // Submit answer for an MCQ question
  async submitMcqAnswer(assignmentId, questionId, selectedOption) {
    try {
      // Get the correct option from the MCQ question
      const { data: question, error: questionError } = await supabase
        .from('mcq_questions')
        .select('correct_option, points')
        .eq('id', questionId)
        .single();
        
      if (questionError) throw questionError;
      
      // Determine if the answer is correct
      const isCorrect = question.correct_option === selectedOption;
      
      // Insert the response
      const { data, error } = await supabase
        .from('mcq_responses')
        .insert({
          assessment_assignment_id: assignmentId,
          question_id: questionId,
          selected_option: selectedOption,
          is_correct: isCorrect
        })
        .select();
        
      if (error) throw error;
      
      return {
        response: data[0],
        isCorrect,
        points: isCorrect ? question.points : 0
      };
    } catch (error) {
      throw handleError(error, 'submitMcqAnswer');
    }
  },

  // Get candidate's previous MCQ answers for an assessment
  async getCandidateAnswers(assignmentId) {
    try {
      // Fetch MCQ responses
      const { data: mcqResponses, error: mcqError } = await supabase
        .from('mcq_responses')
        .select('*')
        .eq('assessment_assignment_id', assignmentId);
        
      if (mcqError) throw mcqError;
      
      // Create a map of question_id -> response for easier lookup
      const responseMap = {};
      
      (mcqResponses || []).forEach(response => {
        responseMap[response.question_id] = {
          type: 'mcq',
          selected_option: response.selected_option,
          is_correct: response.is_correct
        };
      });
      
      return responseMap;
    } catch (error) {
      throw handleError(error, 'getCandidateAnswers');
    }
  },

  // Calculate MCQ score for an assessment
  async calculateMcqScore(assignmentId) {
    try {
      // Get all MCQ responses for this assignment
      const { data: responses, error: responsesError } = await supabase
        .from('mcq_responses')
        .select('question_id, is_correct')
        .eq('assessment_assignment_id', assignmentId);
        
      if (responsesError) throw responsesError;
      
      if (!responses || responses.length === 0) {
        return {
          score: 0,
          totalPoints: 0,
          correctAnswers: 0,
          totalQuestions: 0
        };
      }
      
      // Get the assessment ID from the assignment
      const { data: assignment, error: assignmentError } = await supabase
        .from('assessment_assignments')
        .select('assessment_id')
        .eq('id', assignmentId)
        .single();
        
      if (assignmentError) throw assignmentError;
      
      // Get all questions for this assessment to calculate total points
      const { data: questions, error: questionsError } = await supabase
        .from('mcq_questions')
        .select('id, points')
        .eq('assessment_id', assignment.assessment_id);
        
      if (questionsError) throw questionsError;
      
      if (!questions || questions.length === 0) {
        return {
          score: 0,
          totalPoints: 0,
          correctAnswers: 0,
          totalQuestions: 0
        };
      }
      
      // Create a map of question_id -> points
      const questionsMap = {};
      questions.forEach(q => {
        questionsMap[q.id] = q.points || 1;
      });
      
      // Calculate score
      let earnedPoints = 0;
      let totalPoints = 0;
      let correctAnswers = 0;
      
      responses.forEach(response => {
        const points = questionsMap[response.question_id] || 1;
        totalPoints += points;
        
        if (response.is_correct) {
          earnedPoints += points;
          correctAnswers++;
        }
      });
      
      // Calculate percentage score (rounded to 2 decimal places)
      const scorePercentage = totalPoints > 0 
        ? Math.round((earnedPoints / totalPoints) * 10000) / 100
        : 0;
      
      return {
        score: scorePercentage,
        totalPoints,
        earnedPoints,
        correctAnswers,
        totalQuestions: questions.length
      };
    } catch (error) {
      throw handleError(error, 'calculateMcqScore');
    }
  },

  // Get detailed response data for a specific assignment submission
  async getAssessmentResponseDetails(assignmentId) {
    try {
      // Get the assignment with assessment details
      const { data: assignment, error: assignmentError } = await supabase
        .from('assessment_assignments')
        .select(`
          id,
          assessment_id,
          application_id,
          status,
          score,
          started_at,
          completed_at,
          assessments:assessment_id (
            id,
            title,
            description,
            type,
            passing_score
          )
        `)
        .eq('id', assignmentId)
        .single();
        
      if (assignmentError) throw assignmentError;
      
      if (!assignment) {
        throw new Error("Assessment submission not found");
      }
      
      // Get all questions for this assessment
      const { data: questions, error: questionsError } = await supabase
        .from('mcq_questions')
        .select('*')
        .eq('assessment_id', assignment.assessment_id);
        
      if (questionsError) throw questionsError;
      
      // Get candidate's responses
      const { data: mcqResponses, error: mcqResponsesError } = await supabase
        .from('mcq_responses')
        .select('*')
        .eq('assessment_assignment_id', assignmentId);
          
      if (mcqResponsesError) throw mcqResponsesError;
      
      // Create a map of question_id -> response
      const responses = {};
      (mcqResponses || []).forEach(response => {
        responses[response.question_id] = response;
      });
      
      // Get candidate information
      let candidateProfile = null;
      
      // Get candidate info from application
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
          .single();
          
        if (!applicationError && application && application.profiles) {
          candidateProfile = application.profiles;
        }
      }
      
      // If still no candidate info, use a placeholder
      if (!candidateProfile) {
        candidateProfile = {
          id: assignment.application_id || 'unknown',
          first_name: 'Unknown',
          last_name: 'Candidate',
          email: '',
          avatar_url: ''
        };
      }
      
      // Combine questions with responses
      const questionsWithResponses = questions.map(question => {
        const response = responses[question.id] || null;
        
        return {
          id: question.id,
          question: question.question,
          type: 'mcq',
          points: question.points || 1,
          options: Array.isArray(question.options) ? question.options : [],
          correct_option: question.correct_option,
          response: response ? {
            selected_option: response.selected_option,
            is_correct: response.is_correct
          } : null
        };
      });
      
      return {
        assignment: {
          id: assignment.id,
          status: assignment.status,
          score: assignment.score,
          started_at: assignment.started_at,
          completed_at: assignment.completed_at
        },
        assessment: {
          id: assignment.assessments.id,
          title: assignment.assessments.title,
          description: assignment.assessments.description,
          type: assignment.assessments.type,
          passing_score: assignment.assessments.passing_score
        },
        candidate: candidateProfile,
        responses: questionsWithResponses,
        questionCount: questions.length,
        answeredCount: Object.keys(responses).length
      };
    } catch (error) {
      throw handleError(error, 'getAssessmentResponseDetails');
    }
  }
}; 