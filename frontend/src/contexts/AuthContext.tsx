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

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (apiService.isAuthenticated()) {
          // Try to refresh token to get user data
          await refreshToken();
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        // Clear invalid tokens
        apiService.clearTokens();
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
      setUser(response.user);
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
