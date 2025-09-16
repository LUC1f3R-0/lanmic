"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiService, User, AuthTokens } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
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

  const isAuthenticated = !!user && apiService.isAuthenticated();
  
  // Debug authentication state
  useEffect(() => {
    console.log('AuthContext: Authentication state changed', {
      user: !!user,
      apiAuthenticated: apiService.isAuthenticated(),
      isAuthenticated,
      accessTokenState: apiService.accessToken
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
            apiService.accessToken = 'authenticated';
          }
        } catch (error) {
          console.log('AuthContext: Not authenticated or session expired');
          apiService.accessToken = null;
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        apiService.accessToken = null;
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await apiService.login(email, password);
      console.log('AuthContext: Login response received:', response);
      
      // Set user state first
      setUser(response.user);
      console.log('AuthContext: User state updated');
      
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
