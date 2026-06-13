export default () => ({
  app: {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.PORT ?? 3002),
    frontendUrl: process.env.FRONTEND_URL,
    backendUrl: process.env.BACKEND_URL,
    trustProxyHops: Number(process.env.TRUST_PROXY_HOPS ?? 1),
    swaggerEnabled: process.env.SWAGGER_ENABLED === 'true',
    allowPublicRegistration: process.env.ALLOW_PUBLIC_REGISTRATION === 'true',
  },

  auth: {
    jwtSecret: process.env.JWT_ACCESS_SECRET,
    issuer: process.env.JWT_ISSUER,
    audience: process.env.JWT_AUDIENCE,

    accessTtlSeconds: Number(process.env.ACCESS_TOKEN_TTL_SECONDS ?? 900),

    refreshTtlSeconds: Number(process.env.REFRESH_TOKEN_TTL_SECONDS ?? 604800),

    refreshRememberTtlSeconds: Number(
      process.env.REFRESH_TOKEN_REMEMBER_TTL_SECONDS ?? 2592000,
    ),

    tokenPepper: process.env.TOKEN_PEPPER,
    otpPepper: process.env.OTP_PEPPER,
    csrfSecret: process.env.CSRF_SECRET,
  },

  cookie: {
    domain: process.env.COOKIE_DOMAIN || undefined,
    sameSite: process.env.COOKIE_SAME_SITE ?? 'lax',
  },

  smtp: {
    required: process.env.SMTP_REQUIRED === 'true',
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    fromEmail: process.env.SMTP_FROM_EMAIL,
    fromName: process.env.SMTP_FROM_NAME ?? 'LANMIC Polymers',
    contactRecipient: process.env.CONTACT_RECIPIENT_EMAIL,
  },

  upload: {
    directory: process.env.UPLOAD_DIR ?? 'uploads',
    maxBytes: Number(process.env.MAX_UPLOAD_BYTES ?? 5242880),
  },
});
