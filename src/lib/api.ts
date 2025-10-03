// API configuration for ASP Classic backend communication
const API_BASE_URL = "/api";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Helper function to make API calls
export const apiCall = async <T = any>(
  endpoint: string,
  data?: any,
  method: 'GET' | 'POST' = 'GET'
): Promise<ApiResponse<T>> => {
  try {
    const aspEndpoint = `admin_${endpoint}.asp`;
    const url = method === 'GET' && data 
      ? `${API_BASE_URL}/${aspEndpoint}?${new URLSearchParams(data).toString()}`
      : `${API_BASE_URL}/${aspEndpoint}`;

    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (method === 'POST' && data) {
      options.body = JSON.stringify(data);
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
  getTimes: () => apiCall('getadmtimes'),
  setTimes: (data: any) => apiCall('setadmtimes', data, 'POST'),
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
};

// Authentication APIs
export const authApi = {
  login: (credentials: any) => apiCall('authlogin', credentials, 'POST'),
  forgotPassword: (data: any) => apiCall('authforgotpassword', data, 'POST'),
  verify2FA: (data: any) => apiCall('authverify2fa', data, 'POST'),
  logout: () => apiCall('authlogout', {}, 'POST'),
};

// Holiday APIs
export const holidayApi = {
  getMunicipal: () => apiCall('getadmmunicipalidays'),
  setMunicipal: (data: any) => apiCall('setadmmunicipalidays', data, 'POST'),
  getBlocked: () => apiCall('getadmblockeddates'),
  setBlocked: (data: any) => apiCall('setadmblockeddates', data, 'POST'),
};