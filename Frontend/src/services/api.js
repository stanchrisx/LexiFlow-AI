import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';
const TOKEN_KEY = 'lexiflow_token';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor - Add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          localStorage.removeItem(TOKEN_KEY);
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          break;
        case 403:
          console.error('Access forbidden:', error.response.data);
          break;
        case 404:
          console.error('Resource not found:', error.response.data);
          break;
        case 500:
          console.error('Server error:', error.response.data);
          break;
        default:
          console.error('API error:', error.response.data);
      }
    } else if (error.request) {
      console.error('Network error - no response from server');
    } else {
      console.error('Request setup error:', error.message);
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', {
        full_name: userData.fullName,
        email: userData.email,
        password: userData.password,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      const { access_token } = response.data;
      localStorage.setItem(TOKEN_KEY, access_token);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
  },

  getProfile: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  verifyToken: async () => {
    try {
      const response = await api.get('/auth/verify');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  isAuthenticated: () => {
    return !!localStorage.getItem(TOKEN_KEY);
  },

  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  },
};

export const pdfAPI = {
  upload: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/pdf/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getDocuments: async () => {
    try {
      const response = await api.get('/pdf/documents');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getDocument: async (documentId) => {
    try {
      const response = await api.get(`/pdf/document/${documentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getDocumentPage: async (documentId, pageNumber) => {
    try {
      const response = await api.get(`/pdf/document/${documentId}/page/${pageNumber}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  updateContent: async (documentId, pageNumber, blockOrder, newContent) => {
    try {
      const response = await api.put(`/pdf/document/${documentId}/content`, {
        page_number: pageNumber,
        block_order: blockOrder,
        new_content: newContent,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  deleteDocument: async (documentId) => {
    try {
      const response = await api.delete(`/pdf/document/${documentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default api;

