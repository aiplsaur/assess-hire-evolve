import { supabase } from './supabase'
import { handleError } from '../utils/errorHandler'

export const notificationService = {
  async getNotifications(userId, options = {}) {
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
      
      // Filter by read status if specified
      if (options.read !== undefined) {
        query = query.eq('read', options.read)
      }
      
      // Filter by type if specified
      if (options.type) {
        query = query.eq('type', options.type)
      }
      
      // Apply limit
      const limit = options.limit || 50
      query = query.limit(limit)
      
      // Order by created_at descending (newest first)
      const { data, error } = await query.order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    } catch (error) {
      throw handleError(error, 'getNotifications')
    }
  },
  
  async createNotification(userId, notificationData) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          user_id: userId,
          title: notificationData.title,
          message: notificationData.message,
          type: notificationData.type || 'info',
          read: false,
          link: notificationData.link,
          created_at: new Date().toISOString()
        }])
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      throw handleError(error, 'createNotification')
    }
  },
  
  async markNotificationAsRead(notificationId) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      throw handleError(error, 'markNotificationAsRead')
    }
  },
  
  async markAllNotificationsAsRead(userId) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false)
      
      if (error) throw error
      return true
    } catch (error) {
      throw handleError(error, 'markAllNotificationsAsRead')
    }
  },
  
  async deleteNotification(notificationId) {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
      
      if (error) throw error
      return true
    } catch (error) {
      throw handleError(error, 'deleteNotification')
    }
  },
  
  async getUnreadCount(userId) {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false)
      
      if (error) throw error
      return count
    } catch (error) {
      throw handleError(error, 'getUnreadCount')
    }
  },
  
  // Helper function to create system notifications for various events
  async createSystemNotification(userId, event, data = {}) {
    try {
      let notificationData = {
        type: 'info',
        user_id: userId
      }
      
      switch (event) {
        case 'application_status_change':
          notificationData.title = 'Application Status Updated'
          notificationData.message = `Your application for ${data.jobTitle} has been updated to ${data.status}.`
          notificationData.link = `/applications/${data.applicationId}`
          break
          
        case 'interview_scheduled':
          notificationData.title = 'Interview Scheduled'
          notificationData.message = `An interview has been scheduled for ${data.jobTitle} on ${new Date(data.scheduledAt).toLocaleString()}.`
          notificationData.link = `/interviews/${data.interviewId}`
          break
          
        case 'interview_feedback':
          notificationData.title = 'Interview Feedback Received'
          notificationData.message = 'Feedback has been submitted for your recent interview.'
          notificationData.link = `/applications/${data.applicationId}`
          break
          
        case 'assessment_assigned':
          notificationData.title = 'New Assessment Assigned'
          notificationData.message = `A new assessment has been assigned for your ${data.jobTitle} application.`
          notificationData.link = `/assessments/${data.assessmentId}`
          break
          
        case 'job_posted':
          notificationData.title = 'New Job Posted'
          notificationData.message = `A new job for ${data.jobTitle} has been posted.`
          notificationData.link = `/jobs/${data.jobId}`
          break
          
        default:
          notificationData.title = data.title || 'Notification'
          notificationData.message = data.message || 'You have a new notification.'
          notificationData.link = data.link
      }
      
      return await this.createNotification(userId, notificationData)
    } catch (error) {
      throw handleError(error, 'createSystemNotification')
    }
  }
} 