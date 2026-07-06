import { pgTable, text, timestamp, uuid, pgEnum } from 'drizzle-orm/pg-core'

// ── Enums ────────────────────────────────────────────────────────
// An enum is a column that only accepts specific values
// This prevents typos like status = "compelted" instead of "completed"
export const researchStatusEnum = pgEnum('research_status', [
    'pending',
    'planning',
    'searching',
    'scraping',
    'reading',
    'writing',
    'reviewing',
    'completed',
    'failed',
])

// ── Users Table ──────────────────────────────────────────────────
export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull().unique(),
    name: text('name').notNull(),
    passwordHash: text('password_hash').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ── Research Sessions Table ──────────────────────────────────────
// One row per research run (e.g. "Research AI Coding Agents")
export const researchSessions = pgTable('research_sessions', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    query: text('query').notNull(),
    status: researchStatusEnum('status').default('pending').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ── Research Steps Table ─────────────────────────────────────────
// Stores each agent step log — used for streaming progress to frontend
export const researchSteps = pgTable('research_steps', {
    id: uuid('id').primaryKey().defaultRandom(),
    sessionId: uuid('session_id').notNull().references(() => researchSessions.id, { onDelete: 'cascade' }),
    step: text('step').notNull(),       // e.g. "planning", "searching"
    message: text('message').notNull(), // e.g. "Found 6 articles to read"
    createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ── Reports Table ────────────────────────────────────────────────
// The final generated report — one per session
export const reports = pgTable('reports', {
    id: uuid('id').primaryKey().defaultRandom(),
    sessionId: uuid('session_id').notNull().references(() => researchSessions.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    content: text('content').notNull(), // Full Markdown report
    createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ── Sources Table ────────────────────────────────────────────────
// Every URL scraped for a report — used for citations [1][2][3]
export const sources = pgTable('sources', {
    id: uuid('id').primaryKey().defaultRandom(),
    sessionId: uuid('session_id').notNull().references(() => researchSessions.id, { onDelete: 'cascade' }),
    url: text('url').notNull(),
    title: text('title').notNull(),
    summary: text('summary').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ── Type Exports ─────────────────────────────────────────────────
// These let TypeScript know the shape of a row from each table
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export type ResearchSession = typeof researchSessions.$inferSelect
export type NewResearchSession = typeof researchSessions.$inferInsert

export type Report = typeof reports.$inferSelect
export type NewReport = typeof reports.$inferInsert

export type Source = typeof sources.$inferSelect
export type NewSource = typeof sources.$inferInsert
