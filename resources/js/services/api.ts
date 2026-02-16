import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Environment configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const REGISTER_PATH = import.meta.env.VITE_API_REGISTER_PATH || '/register';
const SESSION_MODE = import.meta.env.VITE_SESSION_MODE === 'true';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: SESSION_MODE, // For Sanctum CSRF cookies
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// CSRF token handling for Sanctum
let csrfToken: string | null = null;

export const fetchCSRFToken = async (): Promise<string> => {
  if (!SESSION_MODE) return '';
  
  try {
    const response = await axios.get(`${API_URL}/sanctum/csrf-cookie`, {
      withCredentials: true,
    });
    
    // Extract CSRF token from cookies or response
    const cookies = document.cookie.split(';');
    const xsrfCookie = cookies.find(cookie => cookie.trim().startsWith('XSRF-TOKEN='));
    
    if (xsrfCookie) {
      csrfToken = decodeURIComponent(xsrfCookie.split('=')[1]);
    }
    
    return csrfToken || '';
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
    return '';
  }
};

// Request interceptor to add CSRF token
api.interceptors.request.use(async (config) => {
  if (SESSION_MODE && csrfToken) {
    config.headers['X-XSRF-TOKEN'] = csrfToken;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 419) {
      // CSRF token mismatch, try to refresh
      fetchCSRFToken();
    }
    return Promise.reject(error);
  }
);

// Types
export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface RegisterResponse {
  message?: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface ValidationError {
  message: string;
  errors: {
    [key: string]: string[];
  };
}

// API functions
export const registerUser = async (data: RegisterData): Promise<RegisterResponse> => {
  try {
    // Fetch CSRF token if in session mode
    if (SESSION_MODE) {
      await fetchCSRFToken();
    }

    const response = await api.post(REGISTER_PATH, data);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw error.response.data;
    }
    throw error;
  }
};

export default api;
