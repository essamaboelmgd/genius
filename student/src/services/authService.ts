import api from './api';

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  phone: string;
  guardianPhone: string;
  educationalLevel: string;
  gender: 'male' | 'female';
  year: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  guardianPhone: string;
  educationalLevel: string;
  gender: 'male' | 'female';
  year: string;
  role: 'student' | 'teacher' | 'admin' | 'assistant';
}

export interface AuthResponse {
  status: string;
  token: string;
  data: {
    user: User;
  };
}

export interface LoginResponse {
  status: string;
  token: string;
  data: {
    user: User;
  };
}

export interface RegisterResponse {
  status: string;
  token: string;
  data: {
    user: User;
  };
}

// Login user
export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await api.post<LoginResponse>('/auth/login', data);
  return response.data;
};

// Register user
export const register = async (data: RegisterRequest): Promise<AuthResponse> => {
  const response = await api.post<RegisterResponse>('/auth/register', data);
  return response.data;
};

// Get current user
export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get('/auth/me');
  return response.data.data.user;
};

// Logout user
export const logout = async (): Promise<void> => {
  await api.post('/auth/logout');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Store token in localStorage
export const setAuthToken = (token: string): void => {
  localStorage.setItem('token', token);
};

// Get token from localStorage
export const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// Store user in localStorage
export const setAuthUser = (user: User): void => {
  localStorage.setItem('user', JSON.stringify(user));
};

// Get user from localStorage
export const getAuthUser = (): User | null => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};
