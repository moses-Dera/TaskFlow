const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://task-manger-backend-z2yz.onrender.com/api';

// Auth utilities - only store token, fetch user data from API
const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY || 'taskflow_token';
const REQUEST_TIMEOUT = import.meta.env.VITE_REQUEST_TIMEOUT || 15000;
const RETRY_DELAY = import.meta.env.VITE_RETRY_DELAY || 1000;

const getAuthToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

const setAuthToken = (token) => {
  // Validate and sanitize token to prevent XSS
  if (!token || typeof token !== 'string') {
    throw new Error('Invalid token format');
  }

  // Basic token format validation (JWT tokens should match this pattern)
  const tokenPattern = /^[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/;
  if (!tokenPattern.test(token)) {
    throw new Error('Invalid token format');
  }

  localStorage.setItem(TOKEN_KEY, token);
};

const clearAuthToken = () => {
  // Define all possible token keys for cleanup
  const tokenKeys = [
    TOKEN_KEY,
    'taskManagerUser',
    'taskflow_auth',
    'user',
    'token',
    'authToken',
    'currentUser'
  ];

  tokenKeys.forEach(key => localStorage.removeItem(key));
};

// API request helper with retry logic
const apiRequest = async (endpoint, options = {}, retries = 1) => {
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
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  config.signal = controller.signal;

  // Validate and normalize URL to prevent SSRF attacks
  let fullUrl;
  try {
    const baseUrl = API_BASE_URL.replace(/\/+$/, ''); // Remove trailing slashes
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    // Validate base URL is from allowed domain
    const allowedDomains = ['task-manger-backend-z2yz.onrender.com', 'localhost'];
    const baseUrlObj = new URL(baseUrl);
    if (!allowedDomains.includes(baseUrlObj.hostname)) {
      throw new Error('Invalid API domain');
    }

    fullUrl = `${baseUrl}${normalizedEndpoint}`;

    // Final URL validation
    const finalUrlObj = new URL(fullUrl);
    if (!allowedDomains.includes(finalUrlObj.hostname)) {
      throw new Error('Invalid request URL');
    }
  } catch (urlError) {
    throw new Error('Invalid URL format or unauthorized domain');
  }

  try {
    const response = await fetch(fullUrl, config);
    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (e) {
        // If response is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }

      // Retry on server errors (5xx) but not client errors (4xx)
      if (response.status >= 500 && retries > 0) {
        console.warn(`Retrying request to ${endpoint}, attempts left: ${retries}`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return apiRequest(endpoint, options, retries - 1);
      }

      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - please try again');
    }

    // Retry on network errors
    if (retries > 0 && (error.name === 'TypeError' || error.message.includes('fetch'))) {
      console.warn(`Retrying request to ${endpoint} due to network error, attempts left: ${retries}`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return apiRequest(endpoint, options, retries - 1);
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

  uploadProfilePicture: (file) => {
    const formData = new FormData();
    formData.append('profilePicture', file);

    return apiRequest('/users/profile/picture', {
      method: 'POST',
      headers: {}, // Let browser set Content-Type
      body: formData,
    });
  },

  getSettings: () => apiRequest('/users/settings'),

  updateSettings: (settingsData) =>
    apiRequest('/users/settings', {
      method: 'PUT',
      body: JSON.stringify(settingsData),
    }),

  changePassword: (passwordData) =>
    apiRequest('/users/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
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

  markAsRead: (messageId) =>
    apiRequest(`/chat/messages/${messageId}/read`, {
      method: 'PUT',
    }),

  markAllAsRead: (recipientId = null) =>
    apiRequest('/chat/messages/read-all', {
      method: 'PUT',
      body: JSON.stringify({ recipient_id: recipientId }),
    }),

  addReaction: (messageId, emoji) =>
    apiRequest(`/chat/messages/${messageId}/reactions`, {
      method: 'POST',
      body: JSON.stringify({ emoji }),
    }),

  removeReaction: (messageId, emoji) =>
    apiRequest(`/chat/messages/${messageId}/reactions/${emoji}`, {
      method: 'DELETE',
    }),

  searchMessages: (query, recipientId = null) => {
    const params = new URLSearchParams({ query });
    if (recipientId) params.append('recipient_id', recipientId);
    return apiRequest(`/chat/messages/search?${params.toString()}`);
  },

  getUnreadCount: () => apiRequest('/chat/messages/unread-count'),

  editMessage: (messageId, newMessage) =>
    apiRequest(`/chat/messages/${messageId}`, {
      method: 'PUT',
      body: JSON.stringify({ message: newMessage }),
    }),

  deleteMessage: (messageId) =>
    apiRequest(`/chat/messages/${messageId}`, {
      method: 'DELETE',
    }),

  pinMessage: (messageId, isPinned) =>
    apiRequest(`/chat/messages/${messageId}/pin`, {
      method: 'PUT',
      body: JSON.stringify({ isPinned }),
    }),

  getPinnedMessages: (recipientId = null) => {
    const params = recipientId ? new URLSearchParams({ recipient_id: recipientId }) : '';
    return apiRequest(`/chat/messages/pinned${params ? `?${params}` : ''}`);
  },

  uploadAttachment: (files) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    const token = getAuthToken();
    return fetch(`${API_BASE_URL.replace(/\/+$/, '')}/chat/upload-attachment`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    }).then(res => res.json());
  },
};

// Notifications API
export const notificationsAPI = {
  getNotifications: () => apiRequest('/notifications'),

  markAsRead: (id) =>
    apiRequest(`/notifications/${id}/read`, {
      method: 'PUT',
    }),

  markAllAsRead: () =>
    apiRequest('/notifications/mark-all-read', {
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





// Export auth utilities
export { getAuthToken, setAuthToken, clearAuthToken };

