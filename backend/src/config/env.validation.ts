import Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),

  PORT: Joi.number().port().default(3002),

  FRONTEND_URL: Joi.string()
    .uri({
      scheme: ['http', 'https'],
    })
    .required(),

  BACKEND_URL: Joi.string()
    .uri({
      scheme: ['http', 'https'],
    })
    .required(),

  DATABASE_URL: Joi.string().required(),

  JWT_ACCESS_SECRET: Joi.string().min(48).required(),
  JWT_ISSUER: Joi.string().min(3).max(100).required(),
  JWT_AUDIENCE: Joi.string().min(3).max(100).required(),

  ACCESS_TOKEN_TTL_SECONDS: Joi.number()
    .integer()
    .min(300)
    .max(3600)
    .default(900),

  REFRESH_TOKEN_TTL_SECONDS: Joi.number()
    .integer()
    .min(3600)
    .max(60 * 60 * 24 * 30)
    .default(604800),

  REFRESH_TOKEN_REMEMBER_TTL_SECONDS: Joi.number()
    .integer()
    .min(3600)
    .max(60 * 60 * 24 * 90)
    .default(2592000),

  TOKEN_PEPPER: Joi.string().min(48).required(),
  OTP_PEPPER: Joi.string().min(48).required(),
  CSRF_SECRET: Joi.string().min(48).required(),

  COOKIE_DOMAIN: Joi.string().allow('').optional(),

  COOKIE_SAME_SITE: Joi.string().valid('lax', 'strict', 'none').default('lax'),

  TRUST_PROXY_HOPS: Joi.number().integer().min(0).max(10).default(1),

  ALLOW_PUBLIC_REGISTRATION: Joi.boolean()
    .truthy('true')
    .falsy('false')
    .default(false),

  SWAGGER_ENABLED: Joi.boolean().truthy('true').falsy('false').default(false),

  SMTP_REQUIRED: Joi.boolean().truthy('true').falsy('false').default(true),

  SMTP_HOST: Joi.string().hostname().required(),
  SMTP_PORT: Joi.number().port().required(),

  SMTP_SECURE: Joi.boolean().truthy('true').falsy('false').default(false),

  SMTP_USER: Joi.string().required(),
  SMTP_PASSWORD: Joi.string().required(),

  SMTP_FROM_EMAIL: Joi.string().email().required(),

  SMTP_FROM_NAME: Joi.string().min(1).max(100).default('LANMIC Polymers'),

  CONTACT_RECIPIENT_EMAIL: Joi.string().email().required(),

  ADMIN_EMAIL: Joi.string().email().optional(),

  ADMIN_USERNAME: Joi.string().min(3).max(64).optional(),

  ADMIN_PASSWORD: Joi.string().min(12).max(128).optional(),

  UPLOAD_DIR: Joi.string().default('uploads'),

  MAX_UPLOAD_BYTES: Joi.number()
    .integer()
    .min(1024)
    .max(10 * 1024 * 1024)
    .default(5242880),
}).custom((value: Record<string, unknown>, helpers) => {
  if (value.NODE_ENV !== 'production') {
    return value;
  }

  const insecurePlaceholder = /(replace|change[-_ ]?me|example|password)/i;

  const protectedSecretKeys = [
    'JWT_ACCESS_SECRET',
    'TOKEN_PEPPER',
    'OTP_PEPPER',
    'CSRF_SECRET',
    'SMTP_PASSWORD',
  ];

  for (const key of protectedSecretKeys) {
    if (insecurePlaceholder.test(String(value[key] ?? ''))) {
      return helpers.message({
        custom: `${key} still contains an insecure placeholder value`,
      });
    }
  }

  if (
    typeof value.FRONTEND_URL !== 'string' ||
    !value.FRONTEND_URL.startsWith('https://')
  ) {
    return helpers.message({
      custom: 'FRONTEND_URL must use HTTPS in production',
    });
  }

  if (
    typeof value.BACKEND_URL !== 'string' ||
    !value.BACKEND_URL.startsWith('https://')
  ) {
    return helpers.message({
      custom: 'BACKEND_URL must use HTTPS in production',
    });
  }

  if (
    value.COOKIE_SAME_SITE === 'none' &&
    typeof value.FRONTEND_URL === 'string' &&
    !value.FRONTEND_URL.startsWith('https://')
  ) {
    return helpers.message({
      custom: 'SameSite=None requires HTTPS',
    });
  }

  return value;
});
