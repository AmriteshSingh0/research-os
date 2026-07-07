import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '../database'

export const auth = betterAuth({
    // ── Database ─────────────────────────────────────────────
    database: drizzleAdapter(db, {
        provider: 'pg',
    }),

    // ── Email & Password ─────────────────────────────────────
    emailAndPassword: {
        enabled: true,
        autoSignIn: true,
    },

    // ── Social Providers ─────────────────────────────────────
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
        github: {
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
        },
    },

    // ── Security ─────────────────────────────────────────────
    trustedOrigins: [
        process.env.FRONTEND_URL || 'http://localhost:3000'
    ],
})

export type Auth = typeof auth
