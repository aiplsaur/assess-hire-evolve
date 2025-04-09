
// This file contains TypeScript definitions for Supabase Edge Functions
// These would be implemented in the Supabase project

export interface SendEmailParams {
  to: string;
  subject: string;
  body: string;
  isHtml?: boolean;
}

export interface GenerateAssessmentParams {
  role: string;
  skills: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: {
    mcq?: number;
    coding?: number;
    text?: number;
  };
}

export interface EvaluateTextResponseParams {
  questionId: string;
  responseId: string;
  questionText: string;
  responseText: string;
  criteria: {
    relevance: boolean;
    clarity: boolean;
    depth: boolean;
    language: boolean;
  };
}

export interface ScheduleSuggestionParams {
  interviewerId: string;
  candidateId: string;
  duration: number; // minutes
  preferredDates: string[]; // ISO date strings
}

export interface RankCandidatesParams {
  jobId: string;
  customWeights?: {
    technicalSkills?: number;
    experience?: number;
    communication?: number;
    cultureFit?: number;
  };
}

export interface WebhookPayload {
  type: string;
  payload: any;
}

// Edge Function Return Types
export type SendEmailResponse = { success: boolean; message?: string };
export type GenerateAssessmentResponse = { success: boolean; assessmentId?: string; error?: string };
export type EvaluateTextResponseResult = { score: number; feedback: string; success: boolean };
export type ScheduleSuggestionResult = { availableSlots: { start: string; end: string }[]; success: boolean };
export type RankCandidatesResult = { rankings: { candidateId: string; score: number; rank: number }[]; success: boolean };
export type WebhookHandlerResult = { success: boolean; message?: string };
