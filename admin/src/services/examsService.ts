import api from './api';

export interface Exam {
  _id: string;
  courseId: string | null;
  lessonId: string | null;
  title: string;
  date: string;
  timeLimitMin: number;
  totalMarks: number;
  type: 'course' | 'general';
  isActive: boolean;
  mandatoryAttendance: boolean; // New field
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  _id: string;
  examId: string;
  onModel: 'Exam' | 'Assignment';
  type: 'text' | 'image';
  content: string;
  options: { id: string; text: string }[];
  correct: string;
  explanation: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Answer {
  questionId: string;
  selectedOption: string;
}

export interface Submission {
  _id: string;
  userId: string;
  examId: string;
  onModel: 'Exam' | 'Assignment';
  answers: Answer[];
  score: number;
  totalMarks: number;
  submittedAt: string;
  isGraded: boolean;
  gradedAt: string;
  gradedBy: string;
  createdAt: string;
  updatedAt: string;
}

// Get all exams
export const getExams = async (): Promise<Exam[]> => {
  const response = await api.get('/exams');
  return response.data.data;
};

// Get exam by ID
export const getExamById = async (id: string): Promise<Exam> => {
  const response = await api.get(`/exams/${id}`);
  return response.data.data.exam;
};

// Get questions for an exam
export const getExamQuestions = async (id: string): Promise<Question[]> => {
  const response = await api.get(`/exams/${id}/questions`);
  return response.data.data.questions;
};

// Submit exam answers
export const submitExamAnswers = async (id: string, answers: Answer[]): Promise<{ submission: Submission; score: number; totalMarks: number }> => {
  const response = await api.post(`/exams/${id}/submissions`, { answers });
  return response.data.data;
};

// Get exam results
export const getExamResults = async (id: string): Promise<Submission> => {
  const response = await api.get(`/exams/${id}/results`);
  return response.data.data.submission;
};