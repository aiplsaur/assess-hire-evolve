import { supabase } from './supabase'
import { handleError } from '../utils/errorHandler'

export const jobService = {
  async getAllJobs(filters = {}) {
    try {
      let query = supabase
        .from('jobs')
        .select(`
          *,
          profiles!created_by (id, first_name, last_name)
        `)
      
      // Apply filters if provided
      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      
      if (filters.department) {
        query = query.eq('department', filters.department)
      }
      
      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`)
      }
      
      if (filters.type) {
        query = query.eq('type', filters.type)
      }
      
      const { data, error } = await query.order('created_at', { ascending: false })
      
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
        .select(`
          *,
          profiles!created_by (id, first_name, last_name)
        `)
        .eq('id', jobId)
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      throw handleError(error, 'getJobById')
    }
  },

  async createJob(userId, jobData) {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .insert([{
          title: jobData.title,
          department: jobData.department,
          location: jobData.location,
          type: jobData.type,
          description: jobData.description,
          requirements: jobData.requirements,
          responsibilities: jobData.responsibilities,
          status: jobData.status || 'draft',
          salary_min: jobData.salaryMin,
          salary_max: jobData.salaryMax,
          created_by: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
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
      const mappedUpdates = {
        ...updates.title && { title: updates.title },
        ...updates.department && { department: updates.department },
        ...updates.location && { location: updates.location },
        ...updates.type && { type: updates.type },
        ...updates.description && { description: updates.description },
        ...updates.requirements && { requirements: updates.requirements },
        ...updates.responsibilities && { responsibilities: updates.responsibilities },
        ...updates.status && { status: updates.status },
        ...updates.salaryMin !== undefined && { salary_min: updates.salaryMin },
        ...updates.salaryMax !== undefined && { salary_max: updates.salaryMax },
        updated_at: new Date().toISOString()
      }
      
      const { data, error } = await supabase
        .from('jobs')
        .update(mappedUpdates)
        .eq('id', jobId)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      throw handleError(error, 'updateJob')
    }
  },
  
  async deleteJob(jobId) {
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId)
      
      if (error) throw error
      return true
    } catch (error) {
      throw handleError(error, 'deleteJob')
    }
  },
  
  async getJobStatistics(jobId) {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('status')
        .eq('job_id', jobId)
      
      if (error) {
        console.error("Error fetching job statistics:", error);
        
        // In development mode, return mock data
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Using mock job statistics due to error');
          return {
            applied: 3,
            screening: 2,
            interview_scheduled: 1,
            total: 6
          };
        }
        
        throw error;
      }
      
      // If data is null or undefined, return empty stats
      if (!data) {
        return { total: 0 };
      }
      
      // Count applications by status
      const stats = data.reduce((acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1
        return acc
      }, {})
      
      // Calculate total applications
      stats.total = data.length
      
      return stats
    } catch (error) {
      // Return empty stats object on error rather than throwing
      console.error('Error in getJobStatistics:', error);
      return { total: 0 };
    }
  }
} 