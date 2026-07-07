import { relations } from 'drizzle-orm'
import {
    pgTable,
    text,
    timestamp,
    boolean,
    index,
    pgEnum,
} from 'drizzle-orm/pg-core'
import { randomUUID } from 'crypto'


// ── Better Auth Tables ───────────────────────────────────────────
// These are managed by Better Auth — do not modify the column names

export const user = pgTable('user', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: boolean('email_verified').default(false).notNull(),
    image: text('image'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
})

export const session = pgTable('session', {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').$onUpdate(() => new Date()).notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
}, (table) => [index('session_userId_idx').on(table.userId)])

export const account = pgTable('account', {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').$onUpdate(() => new Date()).notNull(),
}, (table) => [index('account_userId_idx').on(table.userId)])

export const verification = pgTable('verification', {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [index('verification_identifier_idx').on(table.identifier)])

// ── ResearchOS Tables ────────────────────────────────────────────

export const researchStatusEnum = pgEnum('research_status', [
    'pending', 'planning', 'searching', 'scraping',
    'reading', 'writing', 'reviewing', 'completed', 'failed',
])

export const researchSessions = pgTable('research_sessions', {
    id: text('id').primaryKey().$defaultFn(() => randomUUID()),
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    query: text('query').notNull(),
    status: researchStatusEnum('status').default('pending').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const researchSteps = pgTable('research_steps', {
    id: text('id').primaryKey().$defaultFn(() => randomUUID()),
    sessionId: text('session_id').notNull().references(() => researchSessions.id, { onDelete: 'cascade' }),
    step: text('step').notNull(),
    message: text('message').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const reports = pgTable('reports', {
    id: text('id').primaryKey().$defaultFn(() => randomUUID()),
    sessionId: text('session_id').notNull().references(() => researchSessions.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    content: text('content').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const sources = pgTable('sources', {
    id: text('id').primaryKey().$defaultFn(() => randomUUID()),
    sessionId: text('session_id').notNull().references(() => researchSessions.id, { onDelete: 'cascade' }),
    url: text('url').notNull(),
    title: text('title').notNull(),
    summary: text('summary').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ── Relations ────────────────────────────────────────────────────

export const userRelations = relations(user, ({ many }) => ({
    sessions: many(session),
    accounts: many(account),
    researchSessions: many(researchSessions),
}))

export const sessionRelations = relations(session, ({ one }) => ({
    user: one(user, { fields: [session.userId], references: [user.id] }),
}))

export const accountRelations = relations(account, ({ one }) => ({
    user: one(user, { fields: [account.userId], references: [user.id] }),
}))

export const researchSessionRelations = relations(researchSessions, ({ one, many }) => ({
    user: one(user, { fields: [researchSessions.userId], references: [user.id] }),
    steps: many(researchSteps),
    report: many(reports),
    sources: many(sources),
}))

// ── Type Exports ─────────────────────────────────────────────────

export type User = typeof user.$inferSelect
export type ResearchSession = typeof researchSessions.$inferSelect
export type NewResearchSession = typeof researchSessions.$inferInsert
export type Report = typeof reports.$inferSelect
export type NewReport = typeof reports.$inferInsert
export type Source = typeof sources.$inferSelect
export type NewSource = typeof sources.$inferInsert
