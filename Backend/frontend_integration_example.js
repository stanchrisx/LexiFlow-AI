/**
 * Frontend API Integration Example for LexiFlow AI
 * 
 * This file demonstrates how to integrate the FastAPI backend with your React frontend.
 * Copy this code to your Frontend/src/services/api.js
 */

import axios from 'axios';

// API Configuration
const API_BASE_URL = 'http://localhost:8000';
const TOKEN_KEY = 'lexiflow_token';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
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
      // Server responded with error status
      switch (error.response.status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem(TOKEN_KEY);
          window.location.href = '/login';
          break;
        case 403:
          // Forbidden
          console.error('Access forbidden:', error.response.data);
          break;
        case 404:
          // Not found
          console.error('Resource not found:', error.response.data);
          break;
        case 500:
          // Server error
          console.error('Server error:', error.response.data);
          break;
        default:
          console.error('API error:', error.response.data);
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('Network error - no response from server');
    } else {
      // Error setting up the request
      console.error('Request setup error:', error.message);
    }
    return Promise.reject(error);
  }
);

/**
 * Authentication API
 */
export const authAPI = {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @param {string} userData.fullName - User's full name
   * @param {string} userData.email - User's email
   * @param {string} userData.password - User's password
   * @returns {Promise} Response with success message
   */
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

  /**
   * Login user
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - User's email
   * @param {string} credentials.password - User's password
   * @returns {Promise} Response with access token
   */
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      const { access_token } = response.data;
      
      // Store token in localStorage
      localStorage.setItem(TOKEN_KEY, access_token);
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Logout user (client-side)
   */
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
  },

  /**
   * Get current user profile
   * @returns {Promise} User profile data
   */
  getProfile: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Verify if token is valid
   * @returns {Promise} Verification response
   */
  verifyToken: async () => {
    try {
      const response = await api.get('/auth/verify');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} True if token exists
   */
  isAuthenticated: () => {
    return !!localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Get stored token
   * @returns {string|null} Token or null
   */
  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  },
};

export default api;


/**
 * Usage Examples in React Components:
 */

// Example 1: Login Component
/*
import { authAPI } from '../services/api';

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  
  try {
    const response = await authAPI.login({
      email: formData.email,
      password: formData.password,
    });
    
    console.log('Login successful:', response);
    navigate('/dashboard');
  } catch (error) {
    console.error('Login failed:', error);
    setErrors({ general: error.detail || 'Login failed' });
  } finally {
    setIsLoading(false);
  }
};
*/

// Example 2: Register Component
/*
import { authAPI } from '../services/api';

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  
  try {
    const response = await authAPI.register({
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
    });
    
    console.log('Registration successful:', response);
    navigate('/login', { 
      state: { message: 'Registration successful! Please sign in.' } 
    });
  } catch (error) {
    console.error('Registration failed:', error);
    setErrors({ general: error.detail || 'Registration failed' });
  } finally {
    setIsLoading(false);
  }
};
*/

// Example 3: Protected Route Component
/*
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  
  useEffect(() => {
    const checkAuth = async () => {
      if (!authAPI.isAuthenticated()) {
        setIsAuthenticated(false);
        return;
      }
      
      try {
        await authAPI.verifyToken();
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
  }, []);
  
  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
*/

// Example 4: Get User Profile
/*
import { useEffect, useState } from 'react';
import { authAPI } from '../services/api';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await authAPI.getProfile();
        setUser(profile);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };
    
    fetchUserProfile();
  }, []);
  
  return (
    <div>
      <h1>Welcome, {user?.full_name}!</h1>
      <p>Email: {user?.email}</p>
    </div>
  );
};
*/

// Example 5: Logout Handler
/*
import { authAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const handleLogout = () => {
  authAPI.logout();
  navigate('/login');
};
*/

