import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
    baseURL: 'http://localhost:3001',
})

// Export individual functions for easy use
export const {
    signIn,
    signUp,
    signOut,
    useSession,
} = authClient
