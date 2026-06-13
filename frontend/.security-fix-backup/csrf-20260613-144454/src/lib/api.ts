import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
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
  sessionId?: string;
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

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: config.api.baseURL,
      timeout: config.api.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    this.accessToken = null;
    this.setupInterceptors();
  }

  private getCookie(name: string): string | null {
    if (typeof document === 'undefined') {
      return null;
    }

    const cookies = document.cookie.split(';');

    for (const cookie of cookies) {
      const [key, ...valueParts] = cookie.trim().split('=');

      if (key === name) {
        return decodeURIComponent(valueParts.join('='));
      }
    }

    return null;
  }

  private isUnsafeMethod(method?: string): boolean {
    const normalizedMethod = method?.toUpperCase();

    return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(normalizedMethod || '');
  }

  private isCsrfEndpoint(url?: string): boolean {
    if (!url) {
      return false;
    }

    return url.includes('/auth/csrf_token');
  }

  private async ensureCsrfToken(): Promise<string | null> {
    let csrfToken = this.getCookie('csrf_token');

    if (csrfToken) {
      return csrfToken;
    }

    try {
      const response = await axios.get<{ csrfToken: string }>(
        `${config.api.baseURL}/auth/csrf_token`,
        {
          withCredentials: true,
          headers: {
          },
        },
      );

      csrfToken = response.data?.csrfToken || this.getCookie('csrf_token');

      return csrfToken;
    } catch (error) {
      if (isDebugMode()) {
        console.error('Failed to get CSRF token:', error);
      }

      return null;
    }
  }

  private setupInterceptors() {
    this.axiosInstance.interceptors.request.use(
      async (requestConfig: InternalAxiosRequestConfig) => {
        requestConfig.withCredentials = true;

        if (!requestConfig.headers) {
          requestConfig.headers = {} as any;
        }


        if (requestConfig.data instanceof FormData) {
          delete requestConfig.headers['Content-Type'];
          delete requestConfig.headers['content-type'];
        }

        const shouldAttachCsrf =
          this.isUnsafeMethod(requestConfig.method) &&
          !this.isCsrfEndpoint(requestConfig.url);

        if (shouldAttachCsrf) {
          const csrfToken = await this.ensureCsrfToken();

          if (csrfToken) {
            requestConfig.headers['x-csrf-token'] = csrfToken;
          }
        }

        if (isDebugMode()) {
          console.log('API Request:', {
            method: requestConfig.method,
            url: requestConfig.url,
            hasCsrf: !!requestConfig.headers['x-csrf-token'],
            withCredentials: requestConfig.withCredentials,
          });
        }

        return requestConfig;
      },
      (error) => {
        if (isDebugMode()) {
          console.error('API Request Error:', error);
        }

        return Promise.reject(error);
      },
    );

    this.axiosInstance.interceptors.response.use(
      (response) => {
        if (isDebugMode()) {
          console.log('API Response:', {
            status: response.status,
            url: response.config.url,
          });
        }

        return response;
      },
      async (error: AxiosError<any>) => {
        if (isDebugMode()) {
          console.error('API Response Error:', error.response?.data || error);
        }

        if (error.response?.status === 401) {
          this.accessToken = null;
          this.clearTokens();

          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('tokenExpired'));
          }
        }

        return Promise.reject(error);
      },
    );
  }

  public async request<T>(
    endpoint: string,
    requestConfig: AxiosRequestConfig = {},
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.request({
        url: endpoint,
        ...requestConfig,
      });

      return response.data;
    } catch (error: any) {
      if (error.response) {
        const responseMessage = error.response.data?.message;
        const responseError = error.response.data?.error;

        const errorMessage = Array.isArray(responseMessage)
          ? responseMessage.join(', ')
          : responseMessage ||
            responseError ||
            `HTTP error! status: ${error.response.status}`;

        throw new Error(errorMessage);
      }

      if (error.request) {
        throw new Error('Network error: No response from server');
      }

      throw new Error(error.message || 'An unexpected error occurred');
    }
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  clearTokens() {
    this.accessToken = null;
  }

  isAuthenticated(): boolean {
    return this.accessToken === 'authenticated';
  }

  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }

  async getCsrfToken(): Promise<{ csrfToken: string }> {
    return this.request<{ csrfToken: string }>('/auth/csrf_token', {
      method: 'GET',
    });
  }

  async sendOtp(email: string): Promise<OtpResponse> {
    return this.request<OtpResponse>('/auth/register/email', {
      method: 'POST',
      data: { email },
    });
  }

  async verifyRegistrationOtp(
    email: string,
    otp: string,
  ): Promise<VerifyOtpResponse> {
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

  async login(
    email: string,
    password: string,
    rememberMe: boolean = false,
  ): Promise<AuthResponse> {
    const authData = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      data: { email, password, rememberMe },
    });

    this.accessToken = 'authenticated';

    return {
      accessToken: 'authenticated',
      refreshToken: 'authenticated',
      user: authData.user,
    };
  }

  async refreshToken(): Promise<AuthResponse> {
    const authData = await this.request<AuthResponse>('/auth/refresh', {
      method: 'POST',
      data: {},
    });

    this.accessToken = 'authenticated';

    return {
      accessToken: 'authenticated',
      refreshToken: 'authenticated',
      user: authData.user,
    };
  }

  async logout(): Promise<{ message: string }> {
    try {
      const response = await this.request<{ message: string }>('/auth/logout', {
        method: 'POST',
        data: {},
      });

      this.accessToken = null;
      this.clearTokens();

      return response;
    } catch (error) {
      this.accessToken = null;
      this.clearTokens();

      return { message: 'Logged out successfully' };
    }
  }

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

  async resetPassword(
    email: string,
    newPassword: string,
    confirmPassword: string,
  ): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      data: { email, newPassword, confirmPassword },
    });
  }

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

  async sendCurrentEmailOtp(): Promise<{
    message: string;
    expiresInMinutes: number;
  }> {
    return this.request<{ message: string; expiresInMinutes: number }>(
      '/auth/change-email/verify-current',
      {
        method: 'POST',
      },
    );
  }

  async verifyCurrentEmailOtp(otp: string): Promise<{
    message: string;
    canProceedToNewEmail: boolean;
  }> {
    return this.request<{
      message: string;
      canProceedToNewEmail: boolean;
    }>('/auth/change-email/verify-current-otp', {
      method: 'POST',
      data: { otp },
    });
  }

  async sendNewEmailOtp(email: string): Promise<{
    message: string;
    expiresInMinutes: number;
    newEmail: string;
  }> {
    return this.request<{
      message: string;
      expiresInMinutes: number;
      newEmail: string;
    }>('/auth/change-email/verify-new', {
      method: 'POST',
      data: { email },
    });
  }

  async verifyNewEmailOtp(otp: string): Promise<{
    message: string;
    canProceedToPasswordConfirmation: boolean;
  }> {
    return this.request<{
      message: string;
      canProceedToPasswordConfirmation: boolean;
    }>('/auth/change-email/verify-new-otp', {
      method: 'POST',
      data: { otp },
    });
  }

  async confirmEmailChange(
    newEmail: string,
    newPassword: string,
  ): Promise<{
    message: string;
    newEmail: string;
    user?: User;
    requiresReauth?: boolean;
  }> {
    return this.request<{
      message: string;
      newEmail: string;
      user?: User;
      requiresReauth?: boolean;
    }>('/auth/change-email/confirm', {
      method: 'POST',
      data: { newEmail, newPassword },
    });
  }

  async changePassword(
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
  ): Promise<{ message: string; requiresReauth?: boolean }> {
    return this.request<{ message: string; requiresReauth?: boolean }>(
      '/auth/change-password',
      {
        method: 'POST',
        data: { currentPassword, newPassword, confirmPassword },
      },
    );
  }

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request<{ status: string; timestamp: string }>('/health', {
      method: 'GET',
    });
  }
}

export const apiService = new ApiService();
export default apiService;