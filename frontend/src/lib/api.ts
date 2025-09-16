import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { config, isDebugMode } from './config';

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  statusCode?: number;
  error?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: number;
  email: string;
  username: string;
  isVerified: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface OtpResponse {
  message: string;
  expiresInMinutes: number;
}

export interface VerifyOtpResponse {
  message: string;
  canProceed: boolean;
}

export interface RegisterResponse {
  message: string;
  user: User;
}

class ApiService {
  private axiosInstance: AxiosInstance;
  public accessToken: string | null = null;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (error?: any) => void;
  }> = [];

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: config.api.baseURL,
      timeout: config.api.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // Important: Include cookies in requests
    });

    // Initialize authentication state
    this.accessToken = null;

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - no need to add auth headers since we use HTTP-only cookies
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Ensure credentials are included for all requests
        config.withCredentials = true;
        
        if (isDebugMode()) {
          console.log('API Request:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            baseURL: config.baseURL,
            withCredentials: config.withCredentials,
          });
        }
        
        return config;
      },
      (error) => {
        if (isDebugMode()) {
          console.error('Request Error:', error);
        }
        return Promise.reject(error);
      }
    );

    // Response interceptor for HTTP-only cookies
    this.axiosInstance.interceptors.response.use(
      (response) => {
        if (isDebugMode()) {
          console.log('API Response:', {
            status: response.status,
            url: response.config.url,
            data: response.data,
          });
        }
        return response;
      },
      async (error) => {
        if (isDebugMode()) {
          console.error('Response Error:', {
            status: error.response?.status,
            url: error.config?.url,
            message: error.message,
            data: error.response?.data,
          });
        }

        // If we get a 401, clear authentication state
        if (error.response?.status === 401) {
          this.accessToken = null;
        }

        return Promise.reject(error);
      }
    );
  }

  private processQueue(error: any) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
    
    this.failedQueue = [];
  }

  public async request<T>(
    endpoint: string,
    config: AxiosRequestConfig = {}
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.request({
        url: endpoint,
        ...config,
      });
      return response.data;
    } catch (error: any) {
      // Handle axios errors
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.message || 
                           error.response.data?.error || 
                           `HTTP error! status: ${error.response.status}`;
        throw new Error(errorMessage);
      } else if (error.request) {
        // Request was made but no response received
        throw new Error('Network error: No response from server');
      } else {
        // Something else happened
        throw new Error(error.message || 'An unexpected error occurred');
      }
    }
  }

  // Token management
  setAccessToken(token: string | null) {
    this.accessToken = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem(config.security.tokenStorageKey, token);
      } else {
        localStorage.removeItem(config.security.tokenStorageKey);
      }
    }
  }

  setRefreshToken(token: string | null) {
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem(config.security.refreshTokenKey, token);
      } else {
        localStorage.removeItem(config.security.refreshTokenKey);
      }
    }
  }

  getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(config.security.refreshTokenKey);
    }
    return null;
  }

  clearTokens() {
    this.setAccessToken(null);
    this.setRefreshToken(null);
  }

  // Authentication endpoints
  async sendOtp(email: string): Promise<OtpResponse> {
    return this.request<OtpResponse>('/auth/register/email', {
      method: 'POST',
      data: { email },
    });
  }

  async verifyOtp(email: string, otp: string): Promise<VerifyOtpResponse> {
    return this.request<VerifyOtpResponse>('/auth/register/otp', {
      method: 'POST',
      data: { email, otp },
    });
  }

  async registerDetails(data: {
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
  }): Promise<RegisterResponse> {
    return this.request<RegisterResponse>('/auth/register/details', {
      method: 'POST',
      data,
    });
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const authData = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      data: { email, password },
    });
    
    console.log('API Service: Login response received:', authData);
    
    // Backend sets HTTP-only cookies, so we don't need to store tokens in localStorage
    // Just mark that we're authenticated
    this.accessToken = 'authenticated'; // Placeholder to indicate authentication
    
    console.log('API Service: Authentication successful, cookies set by backend');
    
    // Return the response with user data (tokens are in HTTP-only cookies)
    return {
      accessToken: 'authenticated', // Placeholder
      refreshToken: 'authenticated', // Placeholder
      user: authData.user
    };
  }

  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const authData = await this.request<AuthResponse>('/auth/refresh', {
      method: 'POST',
      data: { refreshToken },
    });
    
    // Update tokens
    this.setAccessToken(authData.accessToken);
    this.setRefreshToken(authData.refreshToken);
    
    return authData;
  }

  async logout(): Promise<{ message: string }> {
    // Get refresh token from localStorage for logout (if available)
    const refreshToken = this.getRefreshToken();
    
    const response = await this.request<{ message: string }>('/auth/logout', {
      method: 'POST',
      data: { refreshToken: refreshToken || '' }, // Send refresh token for logout
    });
    
    // Clear authentication state
    this.accessToken = null;
    this.clearTokens();
    
    return response;
  }

  // Utility methods
  isAuthenticated(): boolean {
    // Since we're using HTTP-only cookies, we can't directly check them from JavaScript
    // We'll rely on the instance token which is set to 'authenticated' after successful login
    // In a real app, you might want to make a request to a /me endpoint to verify authentication
    return this.accessToken === 'authenticated';
  }

  // Get axios instance for custom requests
  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request<{ status: string; timestamp: string }>('/health', {
      method: 'GET',
    });
  }
}

export const apiService = new ApiService();
export default apiService;