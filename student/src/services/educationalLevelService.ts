import api from './api';

export interface EducationalLevel {
  _id: string;
  name: string;
  nameAr: string;
  level: 'primary' | 'prep' | 'secondary';
  year: number;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export const getEducationalLevels = async (): Promise<{ data: EducationalLevel[] }> => {
  try {
    const response = await api.get('/educational-levels');
    return response.data;
  } catch (error) {
    console.error('Error fetching educational levels:', error);
    throw error;
  }
};

export const getEducationalLevelById = async (id: string): Promise<{ data: EducationalLevel }> => {
  try {
    const response = await api.get(`/educational-levels/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching educational level ${id}:`, error);
    throw error;
  }
};