const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('cognitive_alarm_jwt_token');
};

export const setAuthToken = (token) => {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem('cognitive_alarm_jwt_token', token);
  } else {
    localStorage.removeItem('cognitive_alarm_jwt_token');
  }
};

export async function apiRequest(endpoint, method = 'GET', data = null) {
  const token = getAuthToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = { method, headers };
  if (data) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result.detail || result.error || `HTTP ${response.status} Request failed`);
    }

    return result;
  } catch (err) {
    console.error(`API Error [${endpoint}]:`, err.message);
    throw err;
  }
}

export const authAPI = {
  login: (email, password) => apiRequest('/auth/login', 'POST', { email, password }),
  signup: (name, email, password) => apiRequest('/auth/signup', 'POST', { name, email, password }),
};

export const userAPI = {
  getProfile: () => apiRequest('/user/profile'),
  updateProfile: (name, email, avatar) => apiRequest('/user/profile', 'PUT', { name, email, avatar }),
  resetStats: () => apiRequest('/user/reset-stats', 'POST'),
};

export const alarmAPI = {
  getAlarms: () => apiRequest('/alarms'),
  createAlarm: async (alarmData) => {
    const res = await apiRequest('/alarms', 'POST', alarmData);
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('alarms-updated'));
    return res;
  },
  toggleAlarm: async (alarmId) => {
    const res = await apiRequest(`/alarms/${alarmId}/toggle`, 'PUT');
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('alarms-updated'));
    return res;
  },
  deleteAlarm: async (alarmId) => {
    const res = await apiRequest(`/alarms/${alarmId}`, 'DELETE');
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('alarms-updated'));
    return res;
  },
};

export const historyAPI = {
  getHistory: () => apiRequest('/history'),
  addHistoryLog: (logData) => apiRequest('/history', 'POST', logData),
  clearHistory: () => apiRequest('/history', 'DELETE'),
};

export const analyticsAPI = {
  getPrediction: () => apiRequest('/analytics/predict'),
};

export const activityAPI = {
  getActivities: () => apiRequest('/activities'),
  logActivity: (type, title, message) => apiRequest('/activities', 'POST', { type, title, message }),
};

export const aiAPI = {
  getRecommendation: () => apiRequest('/ai/recommendation'),
  completeSession: (data) => apiRequest('/ai/session-complete', 'POST', data),
  getUserState: () => apiRequest('/ai/user-state'),
  getAnalytics: () => apiRequest('/ai/analytics'),
  getHistory: () => apiRequest('/ai/recommendation-history'),
};


