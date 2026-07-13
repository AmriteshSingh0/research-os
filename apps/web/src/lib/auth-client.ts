import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
})

// Export individual functions for easy use
export const {
    signIn,
    signUp,
    signOut,
    useSession,
} = authClient
