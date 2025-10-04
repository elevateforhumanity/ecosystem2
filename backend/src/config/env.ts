import dotenv from 'dotenv';

dotenv.config();

interface Config {
  node_env: string;
  port: number;
  database_url: string;
  jwt_secret: string;
  jwt_refresh_secret: string;
  jwt_expires_in: string;
  jwt_refresh_expires_in: string;
  redis_url: string;
  frontend_url: string;
  api_url: string;
  rate_limit_window_ms: number;
  rate_limit_max_requests: number;
  upload_dir: string;
  max_file_size: number;
  stripe_secret_key: string;
  stripe_webhook_secret?: string;
  aws_access_key_id?: string;
  aws_secret_access_key?: string;
  aws_region?: string;
  aws_s3_bucket?: string;
  smtp_host?: string;
  smtp_port?: number;
  smtp_user?: string;
  smtp_password?: string;
  email_from?: string;
  allowed_origins: string;
  log_level: string;
}

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const getEnvVarOptional = (key: string, defaultValue?: string): string | undefined => {
  return process.env[key] || defaultValue;
};

const getEnvVarNumber = (key: string, defaultValue: number): number => {
  const value = process.env[key];
  return value ? parseInt(value, 10) : defaultValue;
};

export const config: Config = {
  node_env: getEnvVar('NODE_ENV', 'development'),
  port: getEnvVarNumber('PORT', 3001),
  database_url: getEnvVar('DATABASE_URL'),
  jwt_secret: getEnvVar('JWT_SECRET'),
  jwt_refresh_secret: getEnvVar('JWT_REFRESH_SECRET'),
  jwt_expires_in: getEnvVar('JWT_EXPIRES_IN', '7d'),
  jwt_refresh_expires_in: getEnvVar('JWT_REFRESH_EXPIRES_IN', '30d'),
  redis_url: getEnvVar('REDIS_URL', 'redis://localhost:6379'),
  frontend_url: getEnvVar('FRONTEND_URL', 'http://localhost:5173'),
  api_url: getEnvVar('API_URL', 'http://localhost:3001'),
  rate_limit_window_ms: getEnvVarNumber('RATE_LIMIT_WINDOW_MS', 900000),
  rate_limit_max_requests: getEnvVarNumber('RATE_LIMIT_MAX_REQUESTS', 100),
  upload_dir: getEnvVar('UPLOAD_DIR', './uploads'),
  max_file_size: getEnvVarNumber('MAX_FILE_SIZE', 10485760),
  stripe_secret_key: getEnvVar('STRIPE_SECRET_KEY'),
  stripe_webhook_secret: getEnvVarOptional('STRIPE_WEBHOOK_SECRET'),
  aws_access_key_id: getEnvVarOptional('AWS_ACCESS_KEY_ID'),
  aws_secret_access_key: getEnvVarOptional('AWS_SECRET_ACCESS_KEY'),
  aws_region: getEnvVarOptional('AWS_REGION'),
  aws_s3_bucket: getEnvVarOptional('AWS_S3_BUCKET'),
  smtp_host: getEnvVarOptional('SMTP_HOST'),
  smtp_port: getEnvVarNumber('SMTP_PORT', 587),
  smtp_user: getEnvVarOptional('SMTP_USER'),
  smtp_password: getEnvVarOptional('SMTP_PASSWORD'),
  email_from: getEnvVarOptional('EMAIL_FROM', 'noreply@elevate.com'),
  allowed_origins: getEnvVar('ALLOWED_ORIGINS', 'http://localhost:5173'),
  log_level: getEnvVar('LOG_LEVEL', 'info'),
};

export const validateConfig = (): void => {
  const requiredVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'STRIPE_SECRET_KEY',
  ];

  const missing = requiredVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file and ensure all required variables are set.'
    );
  }

  if (config.node_env === 'production') {
    if (config.jwt_secret === 'your-super-secret-jwt-key-change-this-in-production') {
      throw new Error('JWT_SECRET must be changed in production');
    }
    if (config.jwt_refresh_secret === 'your-super-secret-refresh-key-change-this-in-production') {
      throw new Error('JWT_REFRESH_SECRET must be changed in production');
    }
  }

  console.log('✅ Environment configuration validated');
};
