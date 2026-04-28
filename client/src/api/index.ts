import { http } from './client';
import type { AuthUser, Competition, Pagination, School, User } from '../types';

export const authApi = {
  login: (email: string, password: string) =>
    http.post<{ token: string; user: AuthUser }>('/auth/login', { email, password }),
};

export const schoolsApi = {
  list: (p: { page?: number; limit?: number; search?: string; province?: string } = {}) => {
    const q = new URLSearchParams();
    if (p.page)     q.set('page',     String(p.page));
    if (p.limit)    q.set('limit',    String(p.limit));
    if (p.search)   q.set('search',   p.search);
    if (p.province) q.set('province', p.province);
    return http.get<{ schools: School[]; pagination: Pagination }>(`/schools?${q}`);
  },
  provinces: () => http.get<string[]>('/schools/provinces'),
  create: (data: Partial<School>) => http.post<School>('/schools', data),
};

export const competitionsApi = {
  list: (p: { page?: number; limit?: number; category?: string; search?: string } = {}) => {
    const q = new URLSearchParams();
    if (p.page)     q.set('page',     String(p.page));
    if (p.limit)    q.set('limit',    String(p.limit));
    if (p.category) q.set('category', p.category);
    if (p.search)   q.set('search',   p.search);
    return http.get<{ competitions: Competition[]; pagination: Pagination }>(`/competitions?${q}`);
  },
  create: (data: Partial<Competition>) => http.post<Competition>('/competitions', data),
  update: (id: string, data: Partial<Competition>) => http.put<Competition>(`/competitions/${id}`, data),
  delete: (id: string) => http.delete<{ message: string }>(`/competitions/${id}`),
};

export const usersApi = {
  list: (p: { page?: number; limit?: number; role?: string; search?: string } = {}) => {
    const q = new URLSearchParams();
    if (p.page)   q.set('page',   String(p.page));
    if (p.limit)  q.set('limit',  String(p.limit));
    if (p.role)   q.set('role',   p.role);
    if (p.search) q.set('search', p.search);
    return http.get<{ users: User[]; pagination: Pagination }>(`/users?${q}`);
  },
};

export const notificationsApi = {
  send: (data: {
    title: string; body: string; type: string;
    school_ids: string[];
    competition_id?: string;
    scheduled_for?: string;
  }) => http.post<{ sent: number; schools: number; message: string }>('/notifications/send', data),
};
