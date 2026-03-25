// Environment configuration with type safety
export const config = {
  // API Configuration
  api: {
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002',
    timeout: 10000,
  },
  
  // Application Configuration (now fixed, not from env)
  app: {
    name: 'LANMIC Polymers',
    version: '1.0.0',
    description: 'LANMIC Polymers - Your trusted partner in polymer solutions',
  },
  
  // Feature Flags (fixed for production-like defaults)
  features: {
    analytics: true,
    debug: false,
    devMode: false,
  },
  
  // Security Configuration (fixed keys)
  security: {
    tokenStorageKey: 'lanmic_access_token',
    refreshTokenKey: 'lanmic_refresh_token',
    sessionTimeout: 15 * 60 * 1000, // 15 minutes
  },
  
  // Development / logging configuration (fixed)
  development: {
    logLevel: 'info',
    enableConsoleLogs: false,
  },
} as const;

// Type definitions for better IntelliSense
export type Config = typeof config;

// Helper functions
export const isDevelopment = () => config.features.devMode;
export const isDebugMode = () => config.features.debug;
export const getApiBaseURL = () => config.api.baseURL;
export const getAppName = () => config.app.name;

// Environment validation
export const validateEnvironment = () => {
  const requiredVars = [
    'NEXT_PUBLIC_API_URL',
  ];
  
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0 && isDevelopment()) {
    console.warn('Missing environment variables:', missing);
  }
  
  return missing.length === 0;
};

// Initialize environment validation
if (typeof window !== 'undefined') {
  validateEnvironment();
}
