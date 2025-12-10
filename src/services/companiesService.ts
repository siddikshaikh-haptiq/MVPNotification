import {Company} from '../types/index';
import {apiService} from './api';

export const companiesService = {
  getAll: async (): Promise<Company[]> => {
    // TODO: Replace with actual API call
    // return apiService.get<Company[]>('/companies');
    return [];
  },

  getById: async (id: string): Promise<Company> => {
    // TODO: Replace with actual API call
    // return apiService.get<Company>(`/companies/${id}`);
    throw new Error('Not implemented');
  },

  create: async (company: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>): Promise<Company> => {
    // TODO: Replace with actual API call
    // return apiService.post<Company>('/companies', company);
    const newCompany: Company = {
      ...company,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return newCompany;
  },

  update: async (id: string, company: Partial<Company>): Promise<Company> => {
    // TODO: Replace with actual API call
    // return apiService.put<Company>(`/companies/${id}`, company);
    throw new Error('Not implemented');
  },

  delete: async (id: string): Promise<void> => {
    // TODO: Replace with actual API call
    // return apiService.delete<void>(`/companies/${id}`);
  },
};

