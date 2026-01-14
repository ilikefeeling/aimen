import { z } from 'zod';

const envSchema = z.object({
    // Database
    DATABASE_URL: z.string().url(),
    DIRECT_URL: z.string().url().optional(),

    // NextAuth
    NEXTAUTH_URL: z.string().url(),
    NEXTAUTH_SECRET: z.string().min(1),

    // Kakao Auth
    KAKAO_CLIENT_ID: z.string().min(1),
    KAKAO_CLIENT_SECRET: z.string().min(1),

    // Supabase
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
    SUPABASE_SERVICE_KEY: z.string().min(1),

    // Google Gemini
    GEMINI_API_KEY: z.string().min(1),

    // Video API (Internal)
    VIDEO_API_URL: z.string().url().default('http://localhost:3001'),

    // Redis (for video-api)
    REDIS_HOST: z.string().default('localhost'),
    REDIS_PORT: z.string().default('6379').transform((val) => parseInt(val, 10)),
    REDIS_PASSWORD: z.string().optional(),
});

export const env = envSchema.parse({
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    KAKAO_CLIENT_ID: process.env.KAKAO_CLIENT_ID,
    KAKAO_CLIENT_SECRET: process.env.KAKAO_CLIENT_SECRET,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    VIDEO_API_URL: process.env.VIDEO_API_URL,
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
});
