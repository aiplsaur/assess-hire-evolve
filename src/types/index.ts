
// User Roles
export type UserRole = 'admin' | 'hr' | 'interviewer' | 'candidate';

// User Profile
export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  avatar_url?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

// Job Postings
export interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'remote';
  description: string;
  requirements: string;
  responsibilities: string;
  status: 'draft' | 'published' | 'closed';
  salary_min?: number;
  salary_max?: number;
  created_at: string;
  updated_at: string;
  created_by: string;
}

// Application Status
export type ApplicationStatus = 
  | 'applied' 
  | 'screening' 
  | 'assessment' 
  | 'interview_scheduled' 
  | 'interview_completed' 
  | 'offered' 
  | 'hired' 
  | 'rejected';

// Job Applications
export interface JobApplication {
  id: string;
  job_id: string;
  candidate_id: string;
  status: ApplicationStatus;
  resume_url?: string;
  cover_letter?: string;
  applied_at: string;
  updated_at: string;
}

// Assessment Types
export type AssessmentType = 'mcq' | 'coding' | 'text';

// Assessment
export interface Assessment {
  id: string;
  title: string;
  description: string;
  type: AssessmentType;
  duration_minutes: number;
  passing_score?: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Assessment Questions
export interface MCQQuestion {
  id: string;
  assessment_id: string;
  question: string;
  options: string[];
  correct_option: number;
  points: number;
}

export interface CodingQuestion {
  id: string;
  assessment_id: string;
  title: string;
  description: string;
  starter_code?: string;
  test_cases: {
    input: string;
    expected_output: string;
  }[];
  points: number;
}

export interface TextQuestion {
  id: string;
  assessment_id: string;
  question: string;
  word_limit?: number;
  points: number;
}

// Assessment Assignment
export interface AssessmentAssignment {
  id: string;
  assessment_id: string;
  application_id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'evaluated';
  score?: number;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  evaluated_at?: string;
}

// Interview
export interface Interview {
  id: string;
  application_id: string;
  interviewer_id: string;
  scheduled_at: string;
  duration_minutes: number;
  location?: string;
  meeting_link?: string;
  status: 'scheduled' | 'completed' | 'canceled' | 'rescheduled';
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Feedback
export interface FeedbackCriteria {
  id: string;
  name: string;
  description: string;
  weight: number;
}

export interface InterviewFeedback {
  id: string;
  interview_id: string;
  interviewer_id: string;
  criteria_scores: {
    criteria_id: string;
    score: number; // 1-5
    comment?: string;
  }[];
  overall_comment: string;
  recommendation: 'strong_yes' | 'yes' | 'neutral' | 'no' | 'strong_no';
  created_at: string;
  updated_at: string;
}

// Dashboard Statistics
export interface DashboardStats {
  open_positions: number;
  active_candidates: number;
  scheduled_interviews: number;
  pending_assessments: number;
  recent_hires: number;
}

// Notification
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  link?: string;
  created_at: string;
}
