import axios from 'axios';
import type { DraftPlan, DraftPlanDetailData, DraftPlanListItem, HeroCache } from './types';

const api = axios.create({
  baseURL: '/api'
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getDraftPlans = () => api.get<DraftPlanListItem[]>('/draft-plans').then(res => res.data);
export const createDraftPlan = (data: { name: string, description?: string }) => api.post<DraftPlan>('/draft-plans', data).then(res => res.data);
export const getDraftPlan = (id: number) => api.get<DraftPlanDetailData>(`/draft-plans/${id}`).then(res => res.data);

export const getHeroes = () => api.get<HeroCache[]>('/heroes').then(res => res.data);

export const login = (data: any) => api.post('/auth/login', data).then(res => res.data);
export const register = (data: any) => api.post('/auth/register', data).then(res => res.data);

export const addListHero = (planId: number, data: any) => api.post(`/draft-plans/${planId}/heroes`, data).then(res => res.data);
export const updateListHero = (heroId: number, data: any) => api.put(`/draft-plans/heroes/${heroId}`, data).then(res => res.data);
export const removeListHero = (heroId: number) => api.delete(`/draft-plans/heroes/${heroId}`).then(res => res.data);

export const addThreat = (planId: number, data: any) => api.post(`/draft-plans/${planId}/threats`, data).then(res => res.data);
export const updateThreat = (threatId: number, data: any) => api.put(`/draft-plans/threats/${threatId}`, data).then(res => res.data);
export const removeThreat = (threatId: number) => api.delete(`/draft-plans/threats/${threatId}`).then(res => res.data);

export const addItemTiming = (planId: number, data: any) => api.post(`/draft-plans/${planId}/item-timings`, data).then(res => res.data);
export const updateItemTiming = (timingId: number, data: any) => api.put(`/draft-plans/item-timings/${timingId}`, data).then(res => res.data);
export const removeItemTiming = (timingId: number) => api.delete(`/draft-plans/item-timings/${timingId}`).then(res => res.data);
