
// This file defines the TypeScript types for the Supabase schema
// It would be generated from the actual Supabase database

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          email: string
          role: 'admin' | 'hr' | 'interviewer' | 'candidate'
          first_name: string
          last_name: string
          avatar_url: string | null
          phone: string | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          email: string
          role: 'admin' | 'hr' | 'interviewer' | 'candidate'
          first_name: string
          last_name: string
          avatar_url?: string | null
          phone?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          email?: string
          role?: 'admin' | 'hr' | 'interviewer' | 'candidate'
          first_name?: string
          last_name?: string
          avatar_url?: string | null
          phone?: string | null
        }
      }
      jobs: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          department: string
          location: string
          type: 'full-time' | 'part-time' | 'contract' | 'remote'
          description: string
          requirements: string
          responsibilities: string
          status: 'draft' | 'published' | 'closed'
          salary_min: number | null
          salary_max: number | null
          created_by: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          department: string
          location: string
          type: 'full-time' | 'part-time' | 'contract' | 'remote'
          description: string
          requirements: string
          responsibilities: string
          status: 'draft' | 'published' | 'closed'
          salary_min?: number | null
          salary_max?: number | null
          created_by: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          department?: string
          location?: string
          type?: 'full-time' | 'part-time' | 'contract' | 'remote'
          description?: string
          requirements?: string
          responsibilities?: string
          status?: 'draft' | 'published' | 'closed'
          salary_min?: number | null
          salary_max?: number | null
          created_by?: string
        }
      }
      applications: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          job_id: string
          candidate_id: string
          status: 'applied' | 'screening' | 'assessment' | 'interview_scheduled' | 'interview_completed' | 'offered' | 'hired' | 'rejected'
          resume_url: string | null
          cover_letter: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          job_id: string
          candidate_id: string
          status: 'applied' | 'screening' | 'assessment' | 'interview_scheduled' | 'interview_completed' | 'offered' | 'hired' | 'rejected'
          resume_url?: string | null
          cover_letter?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          job_id?: string
          candidate_id?: string
          status?: 'applied' | 'screening' | 'assessment' | 'interview_scheduled' | 'interview_completed' | 'offered' | 'hired' | 'rejected'
          resume_url?: string | null
          cover_letter?: string | null
        }
      }
      assessments: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          description: string
          type: 'mcq' | 'coding' | 'text'
          duration_minutes: number
          passing_score: number | null
          created_by: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          description: string
          type: 'mcq' | 'coding' | 'text'
          duration_minutes: number
          passing_score?: number | null
          created_by: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          description?: string
          type?: 'mcq' | 'coding' | 'text'
          duration_minutes?: number
          passing_score?: number | null
          created_by?: string
        }
      }
      mcq_questions: {
        Row: {
          id: string
          created_at: string
          assessment_id: string
          question: string
          options: string[]
          correct_option: number
          points: number
        }
        Insert: {
          id?: string
          created_at?: string
          assessment_id: string
          question: string
          options: string[]
          correct_option: number
          points: number
        }
        Update: {
          id?: string
          created_at?: string
          assessment_id?: string
          question?: string
          options?: string[]
          correct_option?: number
          points?: number
        }
      }
      coding_questions: {
        Row: {
          id: string
          created_at: string
          assessment_id: string
          title: string
          description: string
          starter_code: string | null
          test_cases: Json
          points: number
        }
        Insert: {
          id?: string
          created_at?: string
          assessment_id: string
          title: string
          description: string
          starter_code?: string | null
          test_cases: Json
          points: number
        }
        Update: {
          id?: string
          created_at?: string
          assessment_id?: string
          title?: string
          description?: string
          starter_code?: string | null
          test_cases?: Json
          points?: number
        }
      }
      text_questions: {
        Row: {
          id: string
          created_at: string
          assessment_id: string
          question: string
          word_limit: number | null
          points: number
        }
        Insert: {
          id?: string
          created_at?: string
          assessment_id: string
          question: string
          word_limit?: number | null
          points: number
        }
        Update: {
          id?: string
          created_at?: string
          assessment_id?: string
          question?: string
          word_limit?: number | null
          points?: number
        }
      }
      assessment_assignments: {
        Row: {
          id: string
          created_at: string
          assessment_id: string
          application_id: string
          status: 'pending' | 'in_progress' | 'completed' | 'evaluated'
          score: number | null
          started_at: string | null
          completed_at: string | null
          evaluated_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          assessment_id: string
          application_id: string
          status: 'pending' | 'in_progress' | 'completed' | 'evaluated'
          score?: number | null
          started_at?: string | null
          completed_at?: string | null
          evaluated_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          assessment_id?: string
          application_id?: string
          status?: 'pending' | 'in_progress' | 'completed' | 'evaluated'
          score?: number | null
          started_at?: string | null
          completed_at?: string | null
          evaluated_at?: string | null
        }
      }
      mcq_responses: {
        Row: {
          id: string
          created_at: string
          assessment_assignment_id: string
          question_id: string
          selected_option: number
          is_correct: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          assessment_assignment_id: string
          question_id: string
          selected_option: number
          is_correct: boolean
        }
        Update: {
          id?: string
          created_at?: string
          assessment_assignment_id?: string
          question_id?: string
          selected_option?: number
          is_correct?: boolean
        }
      }
      coding_responses: {
        Row: {
          id: string
          created_at: string
          assessment_assignment_id: string
          question_id: string
          submitted_code: string
          test_results: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          assessment_assignment_id: string
          question_id: string
          submitted_code: string
          test_results?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          assessment_assignment_id?: string
          question_id?: string
          submitted_code?: string
          test_results?: Json | null
        }
      }
      text_responses: {
        Row: {
          id: string
          created_at: string
          assessment_assignment_id: string
          question_id: string
          response: string
          score: number | null
          feedback: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          assessment_assignment_id: string
          question_id: string
          response: string
          score?: number | null
          feedback?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          assessment_assignment_id?: string
          question_id?: string
          response?: string
          score?: number | null
          feedback?: string | null
        }
      }
      interviews: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          application_id: string
          interviewer_id: string
          scheduled_at: string
          duration_minutes: number
          location: string | null
          meeting_link: string | null
          status: 'scheduled' | 'completed' | 'canceled' | 'rescheduled'
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          application_id: string
          interviewer_id: string
          scheduled_at: string
          duration_minutes: number
          location?: string | null
          meeting_link?: string | null
          status: 'scheduled' | 'completed' | 'canceled' | 'rescheduled'
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          application_id?: string
          interviewer_id?: string
          scheduled_at?: string
          duration_minutes?: number
          location?: string | null
          meeting_link?: string | null
          status?: 'scheduled' | 'completed' | 'canceled' | 'rescheduled'
          notes?: string | null
        }
      }
      feedback_criteria: {
        Row: {
          id: string
          created_at: string
          name: string
          description: string
          weight: number
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description: string
          weight: number
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string
          weight?: number
        }
      }
      interview_feedback: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          interview_id: string
          interviewer_id: string
          criteria_scores: Json
          overall_comment: string
          recommendation: 'strong_yes' | 'yes' | 'neutral' | 'no' | 'strong_no'
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          interview_id: string
          interviewer_id: string
          criteria_scores: Json
          overall_comment: string
          recommendation: 'strong_yes' | 'yes' | 'neutral' | 'no' | 'strong_no'
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          interview_id?: string
          interviewer_id?: string
          criteria_scores?: Json
          overall_comment?: string
          recommendation?: 'strong_yes' | 'yes' | 'neutral' | 'no' | 'strong_no'
        }
      }
      notifications: {
        Row: {
          id: string
          created_at: string
          user_id: string
          title: string
          message: string
          type: 'info' | 'success' | 'warning' | 'error'
          read: boolean
          link: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          title: string
          message: string
          type: 'info' | 'success' | 'warning' | 'error'
          read?: boolean
          link?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          title?: string
          message?: string
          type?: 'info' | 'success' | 'warning' | 'error'
          read?: boolean
          link?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_candidate_score: {
        Args: {
          application_id: string
        }
        Returns: number
      }
      rank_candidates: {
        Args: {
          job_id: string
        }
        Returns: {
          candidate_id: string
          total_score: number
          interview_score: number
          assessment_score: number
          rank: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
