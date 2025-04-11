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
  },
  
  async getAllApplications(options = {}) {
    try {
      let query = supabase
        .from('applications')
        .select(`
          id,
          candidate_id,
          job_id,
          status,
          profiles!candidate_id (id, first_name, last_name, email, avatar_url),
          jobs (id, title)
        `)
      
      // Apply status filter if provided
      if (options.status) {
        if (Array.isArray(options.status)) {
          query = query.in('status', options.status);
        } else {
          query = query.eq('status', options.status);
        }
      }
      
      // Apply job filter if provided
      if (options.jobId) {
        query = query.eq('job_id', options.jobId);
      }
      
      // Apply search if provided
      if (options.search) {
        const term = options.search.toLowerCase();
        query = query.or(`profiles.first_name.ilike.%${term}%,profiles.last_name.ilike.%${term}%,profiles.email.ilike.%${term}%`);
      }
      
      const { data, error } = await query.order('applied_at', { ascending: false })
      
      if (error) throw error
      return data
    } catch (error) {
      // If we're in development mode and there's an error, return mock data
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Using mock application data due to error:', error);
        return [
          { id: 'mock-app-1', candidate_id: 'mock-candidate-1', job_id: 'mock-job-1', status: 'applied' },
          { id: 'mock-app-2', candidate_id: 'mock-candidate-2', job_id: 'mock-job-2', status: 'interview' },
          { id: 'mock-app-3', candidate_id: 'mock-candidate-3', job_id: 'mock-job-3', status: 'offered' }
        ];
      }
      
      throw handleError(error, 'getAllApplications')
    }
  },

  async getApplicationById(applicationId) {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          profiles!candidate_id (id, first_name, last_name, email, avatar_url),
          jobs (id, title, department)
        `)
        .eq('id', applicationId)
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      throw handleError(error, 'getApplicationById')
    }
  },
  
  async searchCandidates(searchTerm, statuses = ["screening", "interview", "assessment"]) {
    try {
      let query = supabase
        .from('applications')
        .select(`
          id,
          profiles!candidate_id (id, first_name, last_name, email, avatar_url),
          jobs (id, title)
        `)
      
      // Apply status filter
      if (statuses && statuses.length > 0) {
        query = query.in('status', statuses);
      }
      
      // Make separate queries if search is provided
      let data;
      let error;
      
      if (searchTerm && searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase().trim();
        const likeQuery = `%${term}%`;
        
        // Query for first name matches
        const { data: firstNameMatches, error: firstNameError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email, avatar_url')
          .ilike('first_name', likeQuery);
          
        if (firstNameError) throw firstNameError;
        
        // Query for last name matches
        const { data: lastNameMatches, error: lastNameError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email, avatar_url')
          .ilike('last_name', likeQuery);
          
        if (lastNameError) throw lastNameError;
        
        // Query for email matches
        const { data: emailMatches, error: emailError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email, avatar_url')
          .ilike('email', likeQuery);
          
        if (emailError) throw emailError;
        
        // Combine results and get applications for these candidates
        const candidateIds = [...new Set([
          ...firstNameMatches.map(c => c.id),
          ...lastNameMatches.map(c => c.id),
          ...emailMatches.map(c => c.id)
        ])];
        
        // If we found matches, get their applications
        if (candidateIds.length > 0) {
          const appQuery = supabase
            .from('applications')
            .select(`
              id,
              profiles!candidate_id (id, first_name, last_name, email, avatar_url),
              jobs (id, title)
            `)
            .in('candidate_id', candidateIds);
            
          if (statuses && statuses.length > 0) {
            appQuery.in('status', statuses);
          }
          
          const appResult = await appQuery.order('applied_at', { ascending: false });
          data = appResult.data;
          error = appResult.error;
        } else {
          data = [];
          error = null;
        }
      } else {
        // Just get all applications with the status filter
        const result = await query.order('applied_at', { ascending: false });
        data = result.data;
        error = result.error;
      }
      
      if (error) throw error
      
      // Process the results to extract unique candidates
      const uniqueCandidates = {};
      if (data) {
        data.forEach(app => {
          if (app.profiles) {
            const candidate = app.profiles;
            if (!uniqueCandidates[candidate.id]) {
              uniqueCandidates[candidate.id] = {
                ...candidate,
                application_id: app.id
              };
            }
          }
        });
      }
      
      return Object.values(uniqueCandidates);
    } catch (error) {
      console.error("Error searching candidates:", error);
      throw handleError(error, 'searchCandidates')
    }
  }
} 