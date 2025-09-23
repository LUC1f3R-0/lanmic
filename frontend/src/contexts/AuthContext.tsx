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
  sendVerificationEmail: (email: string) => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string, confirmPassword: string) => Promise<{ message: string; requiresReauth?: boolean }>;
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
  
  // Debug authentication state (only in development)
  useEffect(() => {
    // Authentication state changed
  }, [user, isAuthenticated]);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if user is authenticated by calling the profile endpoint
        
        try {
          const response = await apiService.request<{ user: User }>('/auth/profile', { method: 'GET' });
          if (response.user) {
            setUser(response.user);
          }
        } catch (error: any) {
          // Handle 401 errors gracefully (expected when not logged in)
          if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
            // This is expected behavior - user is not authenticated
            // Don't log this as an error to reduce console noise
          } else {
            // Only log unexpected errors
          }
          setUser(null);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Listen for token expiration events and periodic checks
  useEffect(() => {
    const handleTokenExpiration = () => {
      setUser(null);
      apiService.clearTokens();
    };

    // Periodic token validation (every 2 minutes for better security)
    const tokenValidationInterval = setInterval(async () => {
      if (user) {
        try {
          // Make a lightweight request to check if token is still valid
          await apiService.request<{ user: User }>('/auth/profile', { method: 'GET' });
        } catch (error: any) {
          if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
            handleTokenExpiration();
          }
        }
      }
    }, 120000); // Check every 2 minutes for better security

    // Add event listener for token expiration
    window.addEventListener('tokenExpired', handleTokenExpiration);

    // Cleanup event listener and interval on unmount
    return () => {
      window.removeEventListener('tokenExpired', handleTokenExpiration);
      clearInterval(tokenValidationInterval);
    };
  }, [user]);

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      setIsLoading(true);
      const response = await apiService.login(email, password, rememberMe);
      
      // Set user state first
      setUser(response.user);
      
      // Force a small delay to ensure state updates
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      // Logout failed
    } finally {
      // Reset user state completely on logout
      setUser(null);
      apiService.clearTokens();
    }
  };

  const refreshToken = async () => {
    try {
      const response = await apiService.refreshToken();
      setUser(response.user);
    } catch (error) {
      setUser(null);
      apiService.clearTokens();
      throw error;
    }
  };

  const sendOtp = async (email: string) => {
    try {
      await apiService.sendOtp(email);
    } catch (error) {
      throw error;
    }
  };

  const verifyOtp = async (email: string, otp: string) => {
    try {
      await apiService.verifyOtp(email, otp);
    } catch (error) {
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
      throw error;
    }
  };

  const sendVerificationEmail = async (email: string) => {
    try {
      await apiService.sendVerificationEmail(email);
    } catch (error) {
      throw error;
    }
  };


  const checkAuthStatus = async () => {
    try {
      const response = await apiService.request<{ user: User }>('/auth/profile', { method: 'GET' });
      if (response.user) {
        setUser(response.user);
      }
    } catch (error: any) {
      setUser(null);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string, confirmPassword: string) => {
    try {
      const response = await apiService.changePassword(currentPassword, newPassword, confirmPassword);
      return response;
    } catch (error: any) {
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
    sendVerificationEmail,
    checkAuthStatus,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
