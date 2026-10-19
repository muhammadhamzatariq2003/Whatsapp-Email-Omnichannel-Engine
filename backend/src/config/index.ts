import dotenv from 'dotenv';
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  jwtSecret: process.env.JWT_SECRET || 'kajiou_secret_key_jwt_default',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://kajiou_user:kajiou_secure_password@localhost:5432/kajiou_crm?schema=public',
  isDemoMode: process.env.DEMO_MODE !== 'false', // Default to true if not explicitly set to false
  whatsapp: {
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || 'DEMO_PHONE_ID',
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN || 'DEMO_TOKEN',
    verifyToken: process.env.WHATSAPP_VERIFY_TOKEN || 'kajiou_verify_token',
    appSecret: process.env.WHATSAPP_APP_SECRET || 'DEMO_SECRET',
    baseUrl: 'https://graph.facebook.com/v20.0'
  },
  gmail: {
    clientId: process.env.GMAIL_CLIENT_ID || 'DEMO_CLIENT_ID',
    clientSecret: process.env.GMAIL_CLIENT_SECRET || 'DEMO_SECRET',
    redirectUri: process.env.GMAIL_REDIRECT_URI || 'http://localhost:4000/api/v1/gmail/oauth/callback',
    refreshToken: process.env.GMAIL_REFRESH_TOKEN || ''
  },
  ai: {
    apiKey: process.env.AI_API_KEY || process.env.OPENAI_API_KEY || 'DEMO_KEY',
    model: process.env.AI_MODEL || 'gpt-4o-mini',
    confidenceThreshold: 0.75
  },
  n8n: {
    webhookSecret: process.env.KAJIOU_WEBHOOK_SECRET || process.env.N8N_WEBHOOK_SECRET || 'kajiou_internal_secret',
    baseUrl: process.env.N8N_BASE_URL || (process.env.NODE_ENV === 'production' ? 'http://kajiou-n8n:5678' : 'http://localhost:5678')
  }
};

