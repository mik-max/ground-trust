import api from './api';
import type { AuthResponse } from '../types';

export const registerParticipant = (data: {
  name: string;
  email: string;
  password: string;
}) => api.post<AuthResponse>('/auth/register', { ...data, role: 'PARTICIPANT' });

export const registerBusiness = (data: {
  name: string;
  email: string;
  password: string;
  businessName: string;
}) => api.post<AuthResponse>('/auth/register', { ...data, role: 'BUSINESS' });

export const login = (data: { email: string; password: string }) =>
  api.post<AuthResponse>('/auth/login', data);

export const getMe = () => api.get<{ user: AuthResponse['user'] }>('/auth/me');
