import api from './api';

export interface Course {
  _id: string;
  title: string;
  educationalLevel: {
    _id: string;
    name: string;
    nameAr: string;
    level: 'primary' | 'prep' | 'secondary';
    year: number;
  };
  shortDescription: string;
  fullDescription: string;
  price: number;
  image: string;
  vodafoneNumber: string;
  month: number;
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  _id: string;
  courseId: string;
  title: string;
  duration: number;
  isLocked: boolean;
  videoUrl?: string;
  description?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

// Get all courses
export const getCourses = async (): Promise<Course[]> => {
  const response = await api.get('/courses');
  return response.data.data;
};

// Get course by ID
export const getCourseById = async (id: string): Promise<Course> => {
  const response = await api.get(`/courses/${id}`);
  return response.data.data.course;
};

// Get lessons for a course
export const getCourseLessons = async (courseId: string): Promise<Lesson[]> => {
  const response = await api.get(`/courses/${courseId}/lessons`);
  return response.data.data;
};

// Get exams for a course
export const getCourseExams = async (courseId: string): Promise<any[]> => {
  const response = await api.get(`/exams?courseId=${courseId}`);
  return response.data.data;
};

// Get assignments for a course
export const getCourseAssignments = async (courseId: string): Promise<any[]> => {
  const response = await api.get(`/assignments?courseId=${courseId}`);
  return response.data.data;
};