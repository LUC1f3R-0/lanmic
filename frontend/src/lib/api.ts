const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
  private baseURL: string;
  private accessToken: string | null = null;

  constructor() {
    this.baseURL = API_BASE_URL;
    
    // Initialize token from localStorage if available
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('accessToken');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add authorization header if token exists
    if (this.accessToken) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${this.accessToken}`,
      };
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Token management
  setAccessToken(token: string | null) {
    this.accessToken = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('accessToken', token);
      } else {
        localStorage.removeItem('accessToken');
      }
    }
  }

  setRefreshToken(token: string | null) {
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('refreshToken', token);
      } else {
        localStorage.removeItem('refreshToken');
      }
    }
  }

  getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refreshToken');
    }
    return null;
  }

  clearTokens() {
    this.setAccessToken(null);
    this.setRefreshToken(null);
  }

  // Authentication endpoints
  async sendOtp(email: string): Promise<OtpResponse> {
    const response = await this.request<OtpResponse>('/auth/register/email', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    return response as OtpResponse;
  }

  async verifyOtp(email: string, otp: string): Promise<VerifyOtpResponse> {
    const response = await this.request<VerifyOtpResponse>('/auth/register/otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
    return response as VerifyOtpResponse;
  }

  async registerDetails(data: {
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
  }): Promise<RegisterResponse> {
    const response = await this.request<RegisterResponse>('/auth/register/details', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response as RegisterResponse;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    const authData = response as AuthResponse;
    
    // Store tokens
    this.setAccessToken(authData.accessToken);
    this.setRefreshToken(authData.refreshToken);
    
    return authData;
  }

  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.request<AuthResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
    
    const authData = response as AuthResponse;
    
    // Update tokens
    this.setAccessToken(authData.accessToken);
    this.setRefreshToken(authData.refreshToken);
    
    return authData;
  }

  async logout(): Promise<{ message: string }> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.request<{ message: string }>('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
    
    // Clear tokens
    this.clearTokens();
    
    return response as { message: string };
  }

  // Utility method to check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }
}

export const apiService = new ApiService();
export default apiService;
