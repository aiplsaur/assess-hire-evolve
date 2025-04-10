import { supabase } from './supabase'
import { handleError } from '../utils/errorHandler'
import { format, subMonths, parseISO } from 'date-fns'

export const reportService = {
  // Get hiring overview data: applications, interviews, hires over time
  async getHiringOverview(timeRange = '180') {
    try {
      const endDate = new Date()
      const startDate = subMonths(endDate, parseInt(timeRange) / 30)
      
      // Get applications over time
      const { data: applications, error: appError } = await supabase
        .from('applications')
        .select('applied_at, status')
        .gte('applied_at', startDate.toISOString())
        .lte('applied_at', endDate.toISOString())
      
      if (appError) throw appError
      
      // Get interviews (applications with interview status)
      const { data: interviews, error: interviewError } = await supabase
        .from('applications')
        .select('applied_at, updated_at, status')
        .in('status', ['interview_scheduled', 'interview_completed'])
        .gte('updated_at', startDate.toISOString())
        .lte('updated_at', endDate.toISOString())
      
      if (interviewError) throw interviewError
      
      // Get hires (applications with status = 'hired')
      const { data: hires, error: hiresError } = await supabase
        .from('applications')
        .select('applied_at, updated_at, status')
        .eq('status', 'hired')
        .gte('updated_at', startDate.toISOString())
        .lte('updated_at', endDate.toISOString())
      
      if (hiresError) throw hiresError
      
      // Process data by month
      const months = []
      let currentDate = new Date(startDate)
      
      while (currentDate <= endDate) {
        months.push(format(currentDate, 'MMM'))
        currentDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1))
      }
      
      const result = months.map(month => {
        const monthApps = applications.filter(app => 
          format(parseISO(app.applied_at), 'MMM') === month
        ).length
        
        const monthInterviews = interviews.filter(interview => 
          format(parseISO(interview.updated_at), 'MMM') === month
        ).length
        
        const monthHires = hires.filter(hire => 
          format(parseISO(hire.updated_at), 'MMM') === month
        ).length
        
        return {
          name: month,
          applications: monthApps,
          interviews: monthInterviews,
          hires: monthHires
        }
      })
      
      return {
        monthlyData: result,
        totals: {
          applications: applications.length,
          interviews: interviews.length,
          hires: hires.length
        }
      }
    } catch (error) {
      throw handleError(error, 'getHiringOverview')
    }
  },
  
  // Get application sources data
  async getApplicationSources(timeRange = '180') {
    try {
      const endDate = new Date()
      const startDate = subMonths(endDate, parseInt(timeRange) / 30)
      
      // Since we don't have a source field, let's group by job title instead
      const { data, error } = await supabase
        .from('applications')
        .select(`
          id,
          jobs (
            title
          ),
          applied_at
        `)
        .gte('applied_at', startDate.toISOString())
        .lte('applied_at', endDate.toISOString())
      
      if (error) throw error
      
      // Count applications by job
      const sources = {}
      data.forEach(app => {
        const source = app.jobs?.title || 'Other'
        sources[source] = (sources[source] || 0) + 1
      })
      
      // Format data for pie chart
      const result = Object.keys(sources).map(source => ({
        name: source,
        value: Math.round((sources[source] / data.length) * 100)
      }))
      
      // Sort by value and limit to top 5
      result.sort((a, b) => b.value - a.value)
      return result.slice(0, 5)
    } catch (error) {
      throw handleError(error, 'getApplicationSources')
    }
  },
  
  // Get time to hire by department
  async getTimeToHire(timeRange = '180') {
    try {
      const endDate = new Date()
      const startDate = subMonths(endDate, parseInt(timeRange) / 30)
      
      // Get hired applications with job details
      const { data, error } = await supabase
        .from('applications')
        .select(`
          id,
          applied_at,
          updated_at,
          jobs (
            department
          )
        `)
        .eq('status', 'hired')
        .gte('updated_at', startDate.toISOString())
        .lte('updated_at', endDate.toISOString())
      
      if (error) throw error
      
      // Calculate time to hire by department
      const departments = {}
      
      data.forEach(app => {
        const department = app.jobs?.department || 'Unknown'
        const appliedAt = new Date(app.applied_at)
        const hiredAt = new Date(app.updated_at)
        const daysToHire = Math.round((hiredAt - appliedAt) / (1000 * 60 * 60 * 24))
        
        if (!departments[department]) {
          departments[department] = { total: 0, count: 0 }
        }
        
        departments[department].total += daysToHire
        departments[department].count += 1
      })
      
      // Calculate average time to hire by department
      const result = Object.keys(departments).map(department => ({
        department,
        days: Math.round(departments[department].total / departments[department].count)
      }))
      
      // Sort by days
      result.sort((a, b) => b.days - a.days)
      
      // Calculate overall average
      const overallAverage = result.length > 0 
        ? Math.round(result.reduce((acc, curr) => acc + curr.days, 0) / result.length)
        : 0
      
      return {
        departmentData: result,
        overallAverage
      }
    } catch (error) {
      throw handleError(error, 'getTimeToHire')
    }
  },
  
  // Get job positions: open vs. filled
  async getJobPositions() {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          id, 
          title,
          status,
          applications (
            status
          )
        `)
      
      if (error) throw error
      
      // Process data
      const result = data.map(job => {
        const hiredApplications = job.applications.filter(app => app.status === 'hired').length
        const isOpen = job.status === 'published'
        
        return {
          position: job.title,
          open: isOpen ? 1 : 0, // If published, count as 1 open position
          filled: hiredApplications
        }
      })
      
      // Get only active jobs (published or with hired applications)
      const filteredResults = result.filter(job => job.open > 0 || job.filled > 0)
      
      // Calculate totals
      const totalOpen = filteredResults.reduce((sum, job) => sum + job.open, 0)
      const totalFilled = filteredResults.reduce((sum, job) => sum + job.filled, 0)
      
      return {
        positionData: filteredResults.slice(0, 5), // Limit to top 5 positions
        totals: {
          open: totalOpen,
          filled: totalFilled
        }
      }
    } catch (error) {
      throw handleError(error, 'getJobPositions')
    }
  }
} 