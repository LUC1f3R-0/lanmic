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

        // If we get a 401, clear authentication state and trigger logout
        if (error.response?.status === 401) {
          // Only log if we were previously authenticated (to reduce noise for initial auth checks)
          if (this.accessToken) {
            console.log('API Service: Received 401 - Token expired, clearing authentication state');
          }
          this.accessToken = null;
          this.clearTokens();
          
          // Dispatch a custom event to notify AuthContext of token expiration
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('tokenExpired'));
          }
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

  // Token management - HTTP-only cookies only
  setAccessToken(token: string | null) {
    // Only store in memory for authentication state tracking
    // Actual tokens are stored in HTTP-only cookies by the backend
    this.accessToken = token;
  }

  clearTokens() {
    // Only clear in-memory state
    // HTTP-only cookies are cleared by the backend on logout
    this.accessToken = null;
  }

  // Authentication endpoints
  async sendOtp(email: string): Promise<OtpResponse> {
    return this.request<OtpResponse>('/auth/register/email', {
      method: 'POST',
      data: { email },
    });
  }

  async verifyRegistrationOtp(email: string, otp: string): Promise<VerifyOtpResponse> {
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

  async login(email: string, password: string, rememberMe: boolean = false): Promise<AuthResponse> {
    console.log('API Service: Starting login request...');
    const authData = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      data: { email, password, rememberMe },
    });
    
    console.log('API Service: Raw login response received:', authData);
    console.log('API Service: User data from response:', authData.user);
    
    // Backend sets HTTP-only cookies, so we don't need to store tokens in localStorage
    // Just mark that we're authenticated
    this.accessToken = 'authenticated'; // Placeholder to indicate authentication
    
    console.log('API Service: Authentication successful, cookies set by backend');
    
    // Return the response with user data (tokens are in HTTP-only cookies)
    const response = {
      accessToken: 'authenticated', // Placeholder
      refreshToken: 'authenticated', // Placeholder
      user: authData.user
    };
    
    console.log('API Service: Returning login response:', response);
    return response;
  }

  async refreshToken(): Promise<AuthResponse> {
    // Since we use HTTP-only cookies, we don't need to send refresh token in body
    const authData = await this.request<AuthResponse>('/auth/refresh', {
      method: 'POST',
      data: {}, // Empty body since backend gets refresh token from cookie
    });
    
    // Update authentication state
    this.accessToken = 'authenticated';
    
    return {
      accessToken: 'authenticated',
      refreshToken: 'authenticated',
      user: authData.user
    };
  }

  async logout(): Promise<{ message: string }> {
    try {
      // Since we use HTTP-only cookies, we don't need to send refresh token
      // The backend will get it from the cookie
      const response = await this.request<{ message: string }>('/auth/logout', {
        method: 'POST',
        data: { refreshToken: '' }, // Empty string since backend uses cookies
      });
      
      // Clear authentication state
      this.accessToken = null;
      this.clearTokens();
      
      return response;
    } catch (error) {
      // Even if logout fails on backend, clear local state
      console.error('Logout request failed:', error);
      this.accessToken = null;
      this.clearTokens();
      return { message: 'Logged out successfully' };
    }
  }

  // Utility methods
  isAuthenticated(): boolean {
    // Since we're using HTTP-only cookies, we can't directly check them from JavaScript
    // This method is kept for backward compatibility but authentication state
    // is now managed by the AuthContext based on user state
    return this.accessToken === 'authenticated';
  }

  // Get axios instance for custom requests
  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }

  // Forgot password endpoints
  async forgotPassword(email: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      data: { email },
    });
  }

  async verifyOtp(email: string, otp: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/verify-otp', {
      method: 'POST',
      data: { email, otp },
    });
  }

  async resetPassword(email: string, newPassword: string, confirmPassword: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      data: { email, newPassword, confirmPassword },
    });
  }

  // Email verification endpoints
  async sendVerificationEmail(email: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/send-verification-email', {
      method: 'POST',
      data: { email },
    });
  }

  async verifyEmail(otp: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/verify-email', {
      method: 'POST',
      data: { otp },
    });
  }

  // Email change endpoints
  async sendCurrentEmailOtp(): Promise<{ message: string; expiresInMinutes: number }> {
    return this.request<{ message: string; expiresInMinutes: number }>('/auth/change-email/verify-current', {
      method: 'POST',
    });
  }

  async verifyCurrentEmailOtp(otp: string): Promise<{ message: string; canProceedToNewEmail: boolean }> {
    return this.request<{ message: string; canProceedToNewEmail: boolean }>('/auth/change-email/verify-current-otp', {
      method: 'POST',
      data: { otp },
    });
  }

  async sendNewEmailOtp(email: string): Promise<{ message: string; expiresInMinutes: number; newEmail: string }> {
    return this.request<{ message: string; expiresInMinutes: number; newEmail: string }>('/auth/change-email/verify-new', {
      method: 'POST',
      data: { email },
    });
  }

  async verifyNewEmailOtp(otp: string): Promise<{ message: string; canProceedToPasswordConfirmation: boolean }> {
    return this.request<{ message: string; canProceedToPasswordConfirmation: boolean }>('/auth/change-email/verify-new-otp', {
      method: 'POST',
      data: { otp },
    });
  }

  async confirmEmailChange(newEmail: string, newPassword: string): Promise<{ message: string; newEmail: string; user?: User; requiresReauth?: boolean }> {
    return this.request<{ message: string; newEmail: string; user?: User; requiresReauth?: boolean }>('/auth/change-email/confirm', {
      method: 'POST',
      data: { newEmail, newPassword },
    });
  }

  async changePassword(currentPassword: string, newPassword: string, confirmPassword: string): Promise<{ message: string; requiresReauth?: boolean }> {
    return this.request<{ message: string; requiresReauth?: boolean }>('/auth/change-password', {
      method: 'POST',
      data: { currentPassword, newPassword, confirmPassword },
    });
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