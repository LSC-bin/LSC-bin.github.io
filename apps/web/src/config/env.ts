import { z } from 'zod'

const envSchema = z.object({
  VITE_FIREBASE_API_KEY: z.string().min(1, 'VITE_FIREBASE_API_KEY is required'),
  VITE_FIREBASE_AUTH_DOMAIN: z.string().min(1, 'VITE_FIREBASE_AUTH_DOMAIN is required'),
  VITE_FIREBASE_PROJECT_ID: z.string().min(1, 'VITE_FIREBASE_PROJECT_ID is required'),
  VITE_FIREBASE_STORAGE_BUCKET: z.string().min(1, 'VITE_FIREBASE_STORAGE_BUCKET is required'),
  VITE_FIREBASE_MESSAGING_SENDER_ID: z
    .string()
    .min(1, 'VITE_FIREBASE_MESSAGING_SENDER_ID is required'),
  VITE_FIREBASE_APP_ID: z.string().min(1, 'VITE_FIREBASE_APP_ID is required'),
  VITE_FIREBASE_MEASUREMENT_ID: z.string().optional(),
})

type EnvSchema = z.infer<typeof envSchema>

let cachedEnv: EnvSchema | null = null

export const getEnv = (): EnvSchema => {
  if (cachedEnv) {
    return cachedEnv
  }

  const parsed = envSchema.safeParse(import.meta.env)

  if (!parsed.success) {
    const formatted = parsed.error.format()
    console.error('❌ Invalid environment configuration:', formatted)
    throw new Error('Failed to parse environment variables. Check your Vite env file.')
  }

  cachedEnv = parsed.data
  return cachedEnv
}

export type FirebaseEnv = ReturnType<typeof getEnv>


