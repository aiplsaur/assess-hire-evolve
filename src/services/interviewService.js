import { supabase } from './supabase'
import { handleError } from '../utils/errorHandler'

export const interviewService = {
  // Interview Management
  async scheduleInterview(interviewData) {
    try {
      const { data, error } = await supabase
        .from('interviews')
        .insert([{
          application_id: interviewData.application_id,
          interviewer_id: interviewData.interviewer_id,
          scheduled_at: interviewData.scheduled_at,
          duration_minutes: interviewData.duration_minutes || 60,
          type: interviewData.type,
          location: interviewData.location,
          meeting_link: interviewData.meeting_link,
          status: interviewData.status || 'scheduled',
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
  },
  
  // Get all interviews for the interviews page
  async getAllInterviews(filters = {}) {
    try {
      let query = supabase
        .from('interviews')
        .select(`
          *,
          applications (
            id,
            jobs (id, title),
            profiles!candidate_id (id, first_name, last_name, email, avatar_url)
          ),
          profiles!interviewer_id (id, first_name, last_name, email, avatar_url),
          interview_feedback (id, interviewer_id)
        `)
        .order('scheduled_at', { ascending: filters.ascending ?? true });
      
      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters.interviewerId) {
        query = query.eq('interviewer_id', filters.interviewerId);
      }
      
      if (filters.from) {
        query = query.gte('scheduled_at', filters.from);
      }
      
      if (filters.to) {
        query = query.lte('scheduled_at', filters.to);
      }
      
      if (filters.search) {
        query = query.or(
          `applications.jobs.title.ilike.%${filters.search}%,applications.profiles.first_name.ilike.%${filters.search}%,applications.profiles.last_name.ilike.%${filters.search}%`
        );
      }
      
      // Execute the query
      const { data, error } = await query;
      
      if (error) {
        // For development fallback to mock data
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Using mock interview data due to error', error);
          return this.getMockInterviews(filters);
        }
        throw error;
      }
      
      // Transform the data to match the expected format
      const formattedData = data.map(interview => {
        const candidateProfile = interview.applications?.profiles;
        const job = interview.applications?.jobs;
        
        return {
          id: interview.id,
          candidate: candidateProfile ? {
            id: candidateProfile.id,
            name: `${candidateProfile.first_name} ${candidateProfile.last_name}`,
            avatar: candidateProfile.avatar_url
          } : null,
          interviewers: [{
            id: interview.profiles.id,
            name: `${interview.profiles.first_name} ${interview.profiles.last_name}`,
            avatar: interview.profiles.avatar_url
          }],
          position: job ? job.title : 'Unknown Position',
          scheduledAt: new Date(interview.scheduled_at),
          duration: interview.duration_minutes,
          type: interview.location ? 'onsite' : 'remote',
          location: interview.location,
          meetingLink: interview.meeting_link,
          status: interview.status,
          notes: interview.notes,
          feedbackSubmitted: interview.interview_feedback?.length > 0
        };
      });
      
      return formattedData;
    } catch (error) {
      console.error('Error fetching interviews:', error);
      
      // For development, fallback to mock data
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Using mock interview data due to error');
        return this.getMockInterviews(filters);
      }
      
      throw handleError(error, 'getAllInterviews');
    }
  },
  
  // Helper method for mock data
  getMockInterviews(filters = {}) {
    const now = new Date();
    const mockInterviews = [
      {
        id: "1",
        candidate: {
          id: "c1",
          name: "Jane Cooper",
          avatar: "",
        },
        interviewers: [
          {
            id: "i1",
            name: "Robert Fox",
            avatar: "",
          },
          {
            id: "i2",
            name: "Alex Johnson",
            avatar: "",
          },
        ],
        position: "Frontend Developer",
        scheduledAt: new Date(now.getTime() + 3 * 60 * 60 * 1000), // 3 hours from now
        duration: 45,
        type: "remote",
        meetingLink: "https://zoom.us/j/123456789",
        status: "scheduled",
        feedbackSubmitted: false,
      },
      {
        id: "2",
        candidate: {
          id: "c2",
          name: "Devon Lane",
          avatar: "",
        },
        interviewers: [
          {
            id: "i3",
            name: "Michael Wilson",
            avatar: "",
          },
        ],
        position: "Product Manager",
        scheduledAt: new Date(now.getTime() + 24 * 60 * 60 * 1000), // 1 day from now
        duration: 60,
        type: "onsite",
        location: "Main Office - Room 302",
        status: "scheduled",
        feedbackSubmitted: false,
      },
      {
        id: "3",
        candidate: {
          id: "c3",
          name: "Robert Fox",
          avatar: "",
        },
        interviewers: [
          {
            id: "i1",
            name: "Robert Fox",
            avatar: "",
          },
        ],
        position: "UX Designer",
        scheduledAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        duration: 30,
        type: "remote",
        meetingLink: "https://meet.google.com/abc-defg-hij",
        status: "completed",
        feedbackSubmitted: true,
      },
      {
        id: "4",
        candidate: {
          id: "c4",
          name: "Leslie Alexander",
          avatar: "",
        },
        interviewers: [
          {
            id: "i4",
            name: "Jessica Taylor",
            avatar: "",
          },
        ],
        position: "Marketing Specialist",
        scheduledAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        duration: 45,
        type: "remote",
        meetingLink: "https://zoom.us/j/987654321",
        status: "completed",
        feedbackSubmitted: false,
      },
      {
        id: "5",
        candidate: {
          id: "c5",
          name: "Cameron Williamson",
          avatar: "",
        },
        interviewers: [
          {
            id: "i6",
            name: "David Chen",
            avatar: "",
          },
        ],
        position: "DevOps Engineer",
        scheduledAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        duration: 60,
        type: "onsite",
        location: "Main Office - Room 201",
        status: "scheduled",
        feedbackSubmitted: false,
      },
    ];

    // Apply filters
    let filteredInterviews = [...mockInterviews];
    if (filters.status) {
      filteredInterviews = filteredInterviews.filter(i => i.status === filters.status);
    }
    
    if (filters.from) {
      const fromDate = new Date(filters.from);
      filteredInterviews = filteredInterviews.filter(i => i.scheduledAt >= fromDate);
    }
    
    if (filters.to) {
      const toDate = new Date(filters.to);
      filteredInterviews = filteredInterviews.filter(i => i.scheduledAt <= toDate);
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredInterviews = filteredInterviews.filter(i => 
        i.position.toLowerCase().includes(searchLower) || 
        i.candidate.name.toLowerCase().includes(searchLower)
      );
    }
    
    return filteredInterviews;
  }
} 