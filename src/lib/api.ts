// API configuration for ASP Classic backend communication
import { sessionManager } from './session';

const API_BASE_URL = "/admin/api";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Helper function to make API calls with automatic salonId injection
export const apiCall = async <T = any>(
  endpoint: string,
  data?: any,
  method: 'GET' | 'POST' = 'GET',
  includeSalonId: boolean = true
): Promise<ApiResponse<T>> => {
  try {
    const aspEndpoint = `admin_${endpoint}.asp`;
    
    // Inject salonId automatically from session
    let finalData = data || {};
    if (includeSalonId) {
      const salonId = sessionManager.getSalonId();
      if (salonId) {
        finalData = { ...finalData, salonId };
      }
    }

    const url = method === 'GET' && Object.keys(finalData).length > 0
      ? `${API_BASE_URL}/${aspEndpoint}?${new URLSearchParams(finalData).toString()}`
      : `${API_BASE_URL}/${aspEndpoint}`;

    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (method === 'POST' && Object.keys(finalData).length > 0) {
      options.body = JSON.stringify(finalData);
    }

    const response = await fetch(url, options);
    const result = await response.json();
    
    return result;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Salon APIs
export const salonApi = {
  get: () => apiCall('getsadmalon'),
  set: (data: any) => apiCall('setsadmalon', data, 'POST'),
  getThemes: () => apiCall('getadmthemes'),
};

// Professional APIs
export const professionalApi = {
  get: () => apiCall('getadmprofessionals'),
  set: (data: any) => apiCall('setadmprofessionals', data, 'POST'),
  delete: (id: string) => apiCall('deleteadmprofessional', { id }, 'POST'),
};

// Services APIs
export const serviceApi = {
  get: () => apiCall('getadmservices'),
  set: (data: any) => apiCall('setadmservices', data, 'POST'),
  delete: (id: string) => apiCall('deleteadmservice', { id }, 'POST'),
};

// Date and time APIs
export const scheduleApi = {
  getDates: () => apiCall('getadmdates'),
  setDates: (data: any) => apiCall('setadmdates', data, 'POST'),
  deleteDate: (id: string) => apiCall('deleteadmdate', { id }, 'POST'),
  getTimes: () => apiCall('getadmtimes'),
  setTimes: (data: any) => apiCall('setadmtimes', data, 'POST'),
  getBlocks: () => apiCall('getadmtimeblocks'),
  setBlock: (data: any) => apiCall('setadmtimeblock', data, 'POST'),
  deleteBlock: (id: string) => apiCall('deleteadmtimeblock', { id }, 'POST'),
};

// Appointments APIs
export const appointmentApi = {
  get: () => apiCall('getadmappointments'),
  getToday: () => apiCall('getadmappointmentstoday'),
  getByDate: (date: string) => apiCall('getadmappointmentsbydate', { date }),
  set: (data: any) => apiCall('setadmappointments', data, 'POST'),
};

// Client APIs
export const clientApi = {
  get: () => apiCall('getadmclients'),
  getFixed: () => apiCall('getadmfixedclients'),
  setFixed: (data: any) => apiCall('setadmfixedclients', data, 'POST'),
  deleteFixed: (id: string) => apiCall('deleteadmfixedclient', { id }, 'POST'),
  getChurned: () => apiCall('getadmchurnedclients'),
  sendReminder: (data: any) => apiCall('sendclientreminder', data, 'POST'),
  sendBroadcast: (data: any) => apiCall('sendclientbroadcast', data, 'POST'),
};

// Settings APIs
export const settingsApi = {
  get: () => apiCall('getadmsettings'),
  set: (data: any) => apiCall('setadmsettings', data, 'POST'),
  getConfirmation: () => apiCall('getadmconfirmation'),
  setConfirmation: (data: any) => apiCall('setadmconfirmation', data, 'POST'),
  getFinancial: () => apiCall('getadmfinancial'),
  setFinancial: (data: any) => apiCall('setadmfinancial', data, 'POST'),
  getSlotSize: () => apiCall('getadmslotsize'),
  setSlotSize: (data: any) => apiCall('setadmslotsize', data, 'POST'),
};

// Authentication APIs (no salonId needed)
export const authApi = {
  login: (credentials: any) => apiCall('authlogin', credentials, 'POST', false),
  forgotPassword: (data: any) => apiCall('authforgotpassword', data, 'POST', false),
  verify2FA: (data: any) => apiCall('authverify2fa', data, 'POST', false),
  logout: () => apiCall('authlogout', {}, 'POST', false),
};

// Professional Credentials APIs
export const credentialsApi = {
  // Verifica se username já existe (para validação em tempo real)
  checkUsername: (username: string) => apiCall('checkusername', { username }, 'GET'),
  // Salva/atualiza username e senha do profissional
  setCredentials: (data: { professionalId: string; username: string; password: string }) => 
    apiCall('setprofessionalcredentials', data, 'POST'),
  // Obtém status das credenciais (se já criado, se precisa reset, etc.)
  getCredentialsStatus: (professionalId: string) => 
    apiCall('getprofessionalcredentialsstatus', { professionalId }),
  // Envia e-mail com link de redefinição
  sendResetEmail: (professionalId: string) => 
    apiCall('sendcredentialsresetemail', { professionalId }, 'POST'),
};

// Holiday APIs
export const holidayApi = {
  get: () => apiCall('getadmholidays'),
  set: (data: any) => apiCall('setadmholidays', data, 'POST'),
  delete: (id: string) => apiCall('deleteadmholiday', { id }, 'POST'),
  getBlocked: () => apiCall('getadmblockeddates'),
  setBlocked: (data: any) => apiCall('setadmblockeddates', data, 'POST'),
  deleteBlocked: (id: string) => apiCall('deleteadmblockedday', { id }, 'POST'),
};
