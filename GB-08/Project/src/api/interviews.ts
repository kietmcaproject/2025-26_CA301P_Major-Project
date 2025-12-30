import api from '@/lib/api';

export interface CreateInterviewPayload {
  company: string;
  role: string;
  date?: string | null;
  location?: string;
  status?: string;
  salary?: string;
  hr?: { name?: string; email?: string; phone?: string };
  feedback?: string;
  nextSteps?: string;
}

export const createInterview = (payload: CreateInterviewPayload) => {
  return api.post('/api/interviews', payload);
};

export const submitInterview = (id: string) => {
  return api.patch(`/api/interviews/${id}/submit`);
};

export const updateInterview = (id: string, payload: Partial<CreateInterviewPayload>) => {
  return api.put(`/api/interviews/${id}`, payload);
};

export const getInterviewById = (id: string) => api.get(`/api/interviews/${id}`);

export const getUserInterviews = () => api.get('/api/interviews');

export const getAISuggestions = (id: string) => api.post(`/api/interviews/${id}/ai-suggestions`);