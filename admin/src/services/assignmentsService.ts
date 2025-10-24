import api from './api';

export interface Assignment {
  _id: string;
  courseId: string | null;
  lessonId: string | null;
  title: string;
  date: string;
  timeLimitMin: number;
  totalMarks: number; // Added back since it's needed for display
  type: 'course' | 'general';
  isActive: boolean;
  mandatoryAttendance: boolean;
  hasTimeLimit: boolean; // Added this field
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
  marks: number; // Added marks field
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

// Get all assignments
export const getAssignments = async (): Promise<Assignment[]> => {
  const response = await api.get('/assignments');
  return response.data.data;
};

// Get assignment by ID
export const getAssignmentById = async (id: string): Promise<Assignment> => {
  const response = await api.get(`/assignments/${id}`);
  return response.data.data.assignment;
};

// Create assignment
export const createAssignment = async (assignmentData: Partial<Assignment>): Promise<Assignment> => {
  const response = await api.post('/admin/assignments', assignmentData);
  return response.data.data.assignment;
};

// Update assignment
export const updateAssignment = async (id: string, assignmentData: Partial<Assignment>): Promise<Assignment> => {
  const response = await api.put(`/admin/assignments/${id}`, assignmentData);
  return response.data.data.assignment;
};

// Delete assignment
export const deleteAssignment = async (id: string): Promise<void> => {
  await api.delete(`/admin/assignments/${id}`);
};

// Get questions for an assignment
export const getAssignmentQuestions = async (id: string): Promise<Question[]> => {
  try {
    const response = await api.get(`/questions?examId=${id}&onModel=Assignment`);
    // Ensure we return an array even if the response structure is different
    return response.data.data.questions || response.data.data || [];
  } catch (error) {
    console.error('Error fetching assignment questions:', error);
    return []; // Return empty array in case of error
  }
};

// Create question
export const createQuestion = async (questionData: Partial<Question>): Promise<Question> => {
  const response = await api.post('/admin/questions', questionData);
  return response.data.data.question;
};

// Update question
export const updateQuestion = async (id: string, questionData: Partial<Question>): Promise<Question> => {
  const response = await api.put(`/admin/questions/${id}`, questionData);
  return response.data.data.question;
};

// Delete question
export const deleteQuestion = async (id: string): Promise<void> => {
  await api.delete(`/admin/questions/${id}`);
};

// Submit assignment answers
export const submitAssignmentAnswers = async (id: string, answers: Answer[]): Promise<{ submission: Submission; score: number; totalMarks: number }> => {
  const response = await api.post(`/assignments/${id}/submissions`, { answers });
  return response.data.data;
};

// Get assignment results
export const getAssignmentResults = async (id: string): Promise<Submission> => {
  const response = await api.get(`/assignments/${id}/results`);
  return response.data.data.submission;
};