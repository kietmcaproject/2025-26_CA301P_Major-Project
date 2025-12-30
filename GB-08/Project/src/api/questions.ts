import api from '@/lib/api';

export const createQuestion = (payload: any) => api.post('/api/questions', payload);

export const getQuestionsByRound = (roundId: string) => api.get(`/api/questions/round/${roundId}`);

export const updateQuestion = (id: string, payload: any) => api.put(`/api/questions/${id}`, payload);

export const deleteQuestion = (id: string) => api.delete(`/api/questions/${id}`);
