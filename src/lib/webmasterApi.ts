// Webmaster-specific API calls
// These APIs will be implemented in the backend
// For now, they return the expected structure for frontend development

import { apiCall, ApiResponse } from './api';

export interface WmSalon {
  id: string;
  name: string;
  slug: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  active: boolean;
  createdAt?: string;
  professionalsCount?: number;
  appointmentsCount?: number;
}

export interface WmUser {
  id: string;
  name: string;
  username: string;
  email?: string;
  phone?: string;
  role: 'admin' | 'manager' | 'staff';
  salonId: string;
  salonName?: string;
  active: boolean;
  lastLogin?: string;
}

export interface WmImpersonateResponse {
  sessionId: string;
  salonId: string;
  userName: string;
  userId: string;
  slug: string;
  role: 'admin' | 'manager' | 'staff';
}

// Webmaster APIs - não injetam salonId automaticamente
export const webmasterApi = {
  // Lista todos os salões do sistema
  getAllSalons: (params?: { search?: string; page?: number; limit?: number }) =>
    apiCall<WmSalon[]>('wmgetallsalons', params, 'GET', false),

  // Lista todos os usuários do sistema
  getAllUsers: (params?: { search?: string; salonId?: string; role?: string; page?: number; limit?: number }) =>
    apiCall<WmUser[]>('wmgetallusers', params, 'GET', false),

  // Impersona um salão (gera sessão como admin do salão)
  impersonateSalon: (salonId: string) =>
    apiCall<WmImpersonateResponse>('wmimpersonatesalon', { salonId }, 'POST', false),

  // Impersona um usuário específico
  impersonateUser: (userId: string) =>
    apiCall<WmImpersonateResponse>('wmimpersonateuser', { userId }, 'POST', false),

  // Atualiza dados de um salão
  updateSalon: (data: Partial<WmSalon>) =>
    apiCall('wmupdatesalon', data, 'POST', false),

  // Atualiza dados de um usuário
  updateUser: (data: Partial<WmUser>) =>
    apiCall('wmupdateuser', data, 'POST', false),

  // Ativa/desativa salão
  toggleSalonActive: (salonId: string, active: boolean) =>
    apiCall('wmtogglesalonactive', { salonId, active }, 'POST', false),

  // Ativa/desativa usuário
  toggleUserActive: (userId: string, active: boolean) =>
    apiCall('wmtoggleuseractive', { userId, active }, 'POST', false),
};
