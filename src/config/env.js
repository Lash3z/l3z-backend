import dotenv from 'dotenv';

// Load environment variables when running locally.
if (!process.env.VERCEL) {
  dotenv.config();
}

export const config = {
  port: Number(process.env.PORT || 4000),
  corsOrigin: process.env.CORS_ORIGIN || '*',
  adminToken: process.env.ADMIN_TOKEN || '',
  supabase: {
    url: process.env.SUPABASE_URL || '',
    key: process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_ANON_KEY || ''
  },
  redisUrl:
    process.env.KV_REDIS_URL ||
    process.env.REDIS_URL ||
    process.env.UPSTASH_REDIS_REST_URL ||
    ''
};
