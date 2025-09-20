"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiService, User, AuthTokens } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  sendOtp: (email: string) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  registerDetails: (data: {
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
  }) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  verifyEmail: (otp: string) => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;
  
  // Debug authentication state
  useEffect(() => {
    console.log('AuthContext: Authentication state changed', {
      user: !!user,
      isAuthenticated,
      userData: user
    });
  }, [user, isAuthenticated]);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if user is authenticated by calling the profile endpoint
        console.log('AuthContext: Checking authentication status...');
        
        try {
          const response = await apiService.request<{ user: User }>('/auth/profile', { method: 'GET' });
          if (response.user) {
            console.log('AuthContext: User is authenticated, setting user data');
            setUser(response.user);
          }
        } catch (error: any) {
          // Handle 401 errors gracefully (expected after logout)
          if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
            console.log('AuthContext: Not authenticated (expected after logout)');
          } else {
            console.log('AuthContext: Authentication check failed:', error.message);
          }
          setUser(null);
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      setIsLoading(true);
      console.log('AuthContext: Starting login process...');
      const response = await apiService.login(email, password, rememberMe);
      console.log('AuthContext: Login response received:', response);
      console.log('AuthContext: Response user data:', response.user);
      
      // Set user state first
      setUser(response.user);
      console.log('AuthContext: User state updated with:', response.user);
      
      // Force a small delay to ensure state updates
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('AuthContext: Login completed, isAuthenticated should be true');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
      apiService.clearTokens();
    }
  };

  const refreshToken = async () => {
    try {
      const response = await apiService.refreshToken();
      setUser(response.user);
    } catch (error) {
      console.error('Token refresh failed:', error);
      setUser(null);
      apiService.clearTokens();
      throw error;
    }
  };

  const sendOtp = async (email: string) => {
    try {
      await apiService.sendOtp(email);
    } catch (error) {
      console.error('Send OTP failed:', error);
      throw error;
    }
  };

  const verifyOtp = async (email: string, otp: string) => {
    try {
      await apiService.verifyOtp(email, otp);
    } catch (error) {
      console.error('Verify OTP failed:', error);
      throw error;
    }
  };

  const registerDetails = async (data: {
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
  }) => {
    try {
      const response = await apiService.registerDetails(data);
      setUser(response.user);
    } catch (error) {
      console.error('Register details failed:', error);
      throw error;
    }
  };

  const sendVerificationEmail = async () => {
    try {
      await apiService.sendVerificationEmail();
    } catch (error) {
      console.error('Send verification email failed:', error);
      throw error;
    }
  };

  const verifyEmail = async (otp: string) => {
    try {
      console.log('AuthContext: Starting email verification...');
      await apiService.verifyEmail(otp);
      console.log('AuthContext: Email verification successful, refreshing user data...');
      
      // Refresh user data to get updated verification status
      const response = await apiService.request<{ user: User }>('/auth/profile', { method: 'GET' });
      console.log('AuthContext: Profile response after verification:', response);
      
      if (response.user) {
        console.log('AuthContext: Updating user state with verified user:', response.user);
        setUser(response.user);
      }
    } catch (error) {
      console.error('Verify email failed:', error);
      throw error;
    }
  };

  const checkAuthStatus = async () => {
    try {
      console.log('AuthContext: Manually checking authentication status...');
      const response = await apiService.request<{ user: User }>('/auth/profile', { method: 'GET' });
      if (response.user) {
        console.log('AuthContext: User is authenticated, updating user data');
        setUser(response.user);
      }
    } catch (error: any) {
      console.log('AuthContext: Authentication check failed:', error.message);
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshToken,
    sendOtp,
    verifyOtp,
    registerDetails,
    sendVerificationEmail,
    verifyEmail,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
