import api from '@/lib/api';

export const createRound = (interviewId: string, payload: any) => {
  return api.post(`/api/rounds/interview/${interviewId}/round`, payload);
};

export const getRounds = (interviewId: string) => {
  return api.get(`/api/rounds/interview/${interviewId}/rounds`);
};

export const updateRound = (roundId: string, payload: any) => {
  return api.put(`/api/rounds/${roundId}`, payload);
};

export const deleteRound = (roundId: string) => api.delete(`/api/rounds/${roundId}`);
