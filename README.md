
# InterviewPro - Advanced Interview Assessment Management System

InterviewPro is a comprehensive platform for managing the entire hiring process, from job postings to final candidate selection.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Authentication and Access Control](#authentication-and-access-control)
- [API Design](#api-design)
- [Edge Functions](#edge-functions)
- [Getting Started](#getting-started)
- [Deployment](#deployment)

## Overview

InterviewPro streamlines the recruitment workflow with skill-based assessments, automated scoring, and intelligent candidate ranking. It supports role-based access for Administrators, HR Managers, Interviewers, and Candidates.

## Features

### Role-Based Access
- **Admin**: Complete system access, user management, reporting
- **HR**: Job posting creation, candidate management, interview scheduling
- **Interviewer**: View assigned interviews, provide structured feedback
- **Candidate**: Apply to jobs, take assessments, view application status

### Job Management
- Create and publish job postings
- Track application status
- Generate shareable job links

### Candidate Assessment
- Multiple assessment types:
  - Multiple-choice questions (MCQs)
  - Coding challenges
  - Text-based responses
- Automated scoring with AI evaluation
- Custom assessment generation

### Interview Management
- Interview scheduling with calendar integration
- Video conference links
- Structured feedback forms
- Candidate scoring

### Automated Ranking
- Algorithmic candidate ranking
- Customizable evaluation criteria
- Comparison views

### Analytics and Reporting
- Hiring funnel metrics
- Time-to-hire tracking
- Assessment performance analytics

## Tech Stack

### Frontend
- **React**: UI library
- **TypeScript**: Type-safe JavaScript
- **TailwindCSS**: Utility-first CSS framework
- **shadcn/ui**: Component library
- **React Query**: Data fetching and state management
- **React Router**: Routing

### Backend
- **Supabase**: Backend-as-a-Service
  - Authentication
  - Database
  - Storage
  - Realtime
  - Edge Functions

## Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── ui/             # shadcn UI components
│   ├── dashboard/      # Dashboard specific components
│   ├── jobs/           # Job management components
│   ├── assessments/    # Assessment components 
│   └── ...
├── context/            # React context providers
├── hooks/              # Custom React hooks
├── pages/              # Application pages
│   ├── auth/           # Authentication pages
│   ├── dashboard/      # Dashboard pages
│   ├── jobs/           # Job management pages
│   ├── candidates/     # Candidate management pages
│   └── ...
├── services/           # API services
├── types/              # TypeScript type definitions
├── lib/                # Utility functions
└── ...
```

## Database Schema

The application uses the following tables in Supabase:

1. **profiles**: User profiles with role information
2. **jobs**: Job postings
3. **applications**: Job applications from candidates
4. **assessments**: Assessment templates
5. **mcq_questions**: Multiple-choice questions
6. **coding_questions**: Coding challenges
7. **text_questions**: Text-based questions
8. **assessment_assignments**: Assigned assessments to candidates
9. **mcq_responses**: Candidate responses to MCQs
10. **coding_responses**: Candidate responses to coding challenges
11. **text_responses**: Candidate responses to text questions
12. **interviews**: Scheduled interviews
13. **feedback_criteria**: Evaluation criteria for interviews
14. **interview_feedback**: Interviewer feedback
15. **notifications**: User notifications

## Authentication and Access Control

The application uses Supabase Authentication for user management and Row-Level Security (RLS) policies for data access control.

### RLS Policies

- **Profiles**: Users can read all profiles but only edit their own
- **Jobs**: 
  - Admin/HR can create, read, update, and delete jobs
  - Interviewers can read jobs
  - Candidates can read published jobs
- **Applications**:
  - Admin/HR can read all applications
  - Interviewers can read applications for interviews they're assigned to
  - Candidates can read their own applications
- **Assessments**:
  - Admin/HR/Interviewers can create and read assessments
  - Candidates can read assessments assigned to them

## API Design

The application uses Supabase's client library for CRUD operations and Supabase Realtime for live updates.

### Key API Endpoints

- **/auth**: Authentication endpoints
- **/jobs**: Job management
- **/applications**: Application management
- **/assessments**: Assessment management
- **/interviews**: Interview scheduling
- **/feedback**: Interview feedback

## Edge Functions

Supabase Edge Functions are used for serverless operations:

1. **sendEmail**: Email notifications
2. **generateAssessment**: AI-powered assessment generation
3. **evaluateTextResponse**: AI evaluation of text responses
4. **scheduleSuggestion**: Intelligent interview scheduling
5. **rankCandidates**: Algorithmic candidate ranking
6. **webhookHandler**: Integration with external services

## Getting Started

1. **Clone the repository**
```bash
git clone <repository-url>
cd interview-pro
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up Supabase**
   - Create a Supabase project
   - Execute SQL setup scripts
   - Configure environment variables

4. **Run the development server**
```bash
npm run dev
```

## Deployment

1. **Build the application**
```bash
npm run build
```

2. **Deploy the frontend**
   - Deploy the built application to a hosting service

3. **Configure Supabase**
   - Set up production environment
   - Configure security settings

4. **Connect domain and SSL**
   - Configure custom domain
   - Set up SSL certificates
