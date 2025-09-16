// Environment configuration with type safety
export const config = {
  // API Configuration
  api: {
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002',
    timeout: 10000,
  },
  
  // Application Configuration
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'LANMIC Polymers',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    description: 'LANMIC Polymers - Your trusted partner in polymer solutions',
  },
  
  // Feature Flags
  features: {
    analytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    debug: process.env.NEXT_PUBLIC_ENABLE_DEBUG === 'true',
    devMode: process.env.NEXT_PUBLIC_DEV_MODE === 'true',
  },
  
  // Security Configuration
  security: {
    tokenStorageKey: process.env.NEXT_PUBLIC_TOKEN_STORAGE_KEY || 'lanmic_access_token',
    refreshTokenKey: process.env.NEXT_PUBLIC_REFRESH_TOKEN_KEY || 'lanmic_refresh_token',
    sessionTimeout: 15 * 60 * 1000, // 15 minutes
  },
  
  // Development Configuration
  development: {
    logLevel: process.env.NEXT_PUBLIC_LOG_LEVEL || 'info',
    enableConsoleLogs: process.env.NEXT_PUBLIC_DEV_MODE === 'true',
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
