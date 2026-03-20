// src/lib/types.ts

export type UserRole = 'student' | 'admin';
export type QuestionType = 'MCQ' | 'TF';

export interface User {
  id: string;
  line_id: string;
  display_name: string | null;
  avatar_url: string | null;
  class_id?: string | null;
  classes?: { id: string; name: string } | null;
  is_blocked: boolean;
  role: UserRole;
  created_at: string;
}

export interface Class {
  id: string;
  name: string;
  created_at: string;
}

export interface Subject {
  id: string;
  name: string;
  description: string | null;
  icon_url: string | null;
  class_id: string | null;   // ← new field
  created_at: string;
}

export interface Exam {
  id: string;
  subject_id: string;
  title: string;
  description: string | null;
  time_limit_minutes: number | null;
  created_at: string;
}

export interface Question {
  id: string;
  exam_id: string;
  q_num: number;
  type: QuestionType;
  stem: string;
  stem_img_url: string | null;
  opt_a: string | null;
  opt_b: string | null;
  opt_c: string | null;
  opt_d: string | null;
  opt_e: string | null;
  answer: string; // 'A'|'B'|'C'|'D'|'E' for MCQ, 'T'|'F' for TF
  explanation: string | null;
  explanation_img_url: string | null; // optional image shown below explanation text
  created_at: string;
}

export interface ExamAttempt {
  id: string;
  user_id: string;
  exam_id: string;
  score: number | null;
  is_completed: boolean;
  started_at: string;
  completed_at: string | null;
}

export interface AttemptAnswer {
  id: string;
  attempt_id: string;
  question_id: string;
  user_response: string;
  is_correct: boolean;
}

// Derived: question + user's answer for the results view
export interface ReviewItem {
  question: Question;
  userResponse: string;
  isCorrect: boolean;
}
