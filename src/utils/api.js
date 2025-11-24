const API_BASE_URL = 'https://task-manger-backend-z2yz.onrender.com/api';

// Auth utilities - only store token, fetch user data from API
const TOKEN_KEY = 'taskflow_token';

const getAuthToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

const setAuthToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

const clearAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  // Clear all old data
  localStorage.removeItem('taskManagerUser');
  localStorage.removeItem('taskflow_auth');
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');
};

// API request helper
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  // Add timeout for requests
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

  config.signal = controller.signal;

  // Normalize URL to prevent double slashes
  const baseUrl = API_BASE_URL.replace(/\/+$/, ''); // Remove trailing slashes
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fullUrl = `${baseUrl}${normalizedEndpoint}`;

  try {
    const response = await fetch(fullUrl, config);
    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch (e) {
        // If response is not JSON, use default message
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - please try again');
    }
    console.error('API request failed:', error);
    throw error;
  }
};

// Auth API
export const authAPI = {
  login: (credentials) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  signup: (userData) =>
    apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  getCurrentUser: () => apiRequest('/auth/me'),

  forgotPassword: (email) =>
    apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token, password) =>
    apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    }),
};

// Tasks API
export const tasksAPI = {
  getTasks: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/tasks${query ? `?${query}` : ''}`);
  },

  getTask: (id) => apiRequest(`/tasks/${id}`),

  createTask: (taskData) =>
    apiRequest('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    }),

  updateTask: (id, updates) =>
    apiRequest(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  uploadFile: (taskId, file) => {
    const formData = new FormData();
    formData.append('file', file);

    return apiRequest(`/tasks/${taskId}/files`, {
      method: 'POST',
      headers: {}, // Remove Content-Type to let browser set it for FormData
      body: formData,
    });
  },

  getTaskFiles: (taskId) => apiRequest(`/tasks/${taskId}/files`),

  getPerformanceStats: () => apiRequest('/tasks/performance/stats'),
};

// Users API
export const usersAPI = {
  getProfile: () => apiRequest('/users/profile'),

  updateProfile: (profileData) =>
    apiRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),
};

// Team API (Manager/Admin only)
export const teamAPI = {
  getEmployees: () => apiRequest('/team/employees'),
  getPerformance: () => apiRequest('/team/performance'),
  assignTask: (taskData) =>
    apiRequest('/team/assign-task', {
      method: 'POST',
      body: JSON.stringify(taskData),
    }),
  inviteUser: (email, role = 'employee') =>
    apiRequest('/team/invite', {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    }),
  updateUser: (userId, userData) =>
    apiRequest(`/team/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    }),
  deleteUser: (userId) =>
    apiRequest(`/team/users/${userId}`, {
      method: 'DELETE',
    }),
  notifyTeamMeeting: (meetingData) =>
    apiRequest('/team/notify-meeting', {
      method: 'POST',
      body: JSON.stringify(meetingData),
    }),
};

// Chat API
export const chatAPI = {
  getTeamMembers: () => apiRequest('/chat/team-members'),

  getMessages: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/chat/messages${query ? `?${query}` : ''}`);
  },

  sendMessage: (messageData) =>
    apiRequest('/chat/messages', {
      method: 'POST',
      body: JSON.stringify(messageData),
    }),
};

// Notifications API
export const notificationsAPI = {
  getNotifications: () => apiRequest('/notifications'),

  markAsRead: (id) =>
    apiRequest(`/notifications/${id}/read`, {
      method: 'PUT',
    }),

  createNotification: (notificationData) =>
    apiRequest('/notifications', {
      method: 'POST',
      body: JSON.stringify(notificationData),
    }),
};

// Logs API (Admin only)
export const logsAPI = {
  getLogs: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/logs${query ? `?${query}` : ''}`);
  },
};

// System API (Admin only)
export const systemAPI = {
  getSystemMetrics: () => apiRequest('/system/metrics'),
  getActivityLogs: () => apiRequest('/system/activity-logs'),
};

// Fix user API
export const fixUserAPI = {
  fixUser: (company = 'MyCompany') =>
    apiRequest('/fix/fix-user', {
      method: 'POST',
      body: JSON.stringify({ company }),
    }),
};

// Settings API
export const settingsAPI = {
  updateSettings: (settingsData) =>
    apiRequest('/users/settings', {
      method: 'PUT',
      body: JSON.stringify(settingsData),
    }),

  getSettings: () => apiRequest('/users/settings'),

  changePassword: (passwordData) =>
    apiRequest('/users/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    }),
};

// Export auth utilities
export { getAuthToken, setAuthToken, clearAuthToken };

// Example usage in components:
/*
import { tasksAPI, getAuthData } from '../utils/api';

// In your component
const loadTasks = async () => {
  try {
    const tasks = await tasksAPI.getTasks({ status: 'pending' });
    setTasks(tasks);
  } catch (error) {
    console.error('Failed to load tasks:', error);
  }
};
*/