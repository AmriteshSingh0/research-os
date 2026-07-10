import { z } from 'zod'
import { router, publicProcedure, protectedProcedure } from './trpc'
import { db } from '../database'
import { researchSessions, researchSteps, reports, sources } from '../database/schema'
import { eq, desc } from 'drizzle-orm'
import { randomUUID } from 'crypto'
import { researchGraph } from '../agents/researchGraph'

export const appRouter = router({
    hello: publicProcedure
        .input(z.object({ text: z.string() }))
        .query(({ input }) => {
            return { greeting: `Hello ${input.text}!` }
        }),

    // Start a new research session
    startResearch: protectedProcedure
        .input(z.object({ query: z.string().min(3) }))
        .mutation(async ({ ctx, input }) => {
            const sessionId = randomUUID()

            await db.insert(researchSessions).values({
                id: sessionId,
                userId: ctx.user.id,
                query: input.query,
                status: 'pending',
            })

            // Run research in background (don't await)
            // Run LangGraph workflow in the background (don't await)
            researchGraph.invoke({
                sessionId,
                query: input.query,
                subQuestions: [],
                sources: [],
                findings: [],
                draftReport: '',
                finalReport: '',
            }).catch(err => {
                console.error('LangGraph research failed:', err)
            })


            return { sessionId }
        }),

    // Get all sessions for the logged-in user
    getSessions: protectedProcedure.query(async ({ ctx }) => {
        return db.select()
            .from(researchSessions)
            .where(eq(researchSessions.userId, ctx.user.id))
            .orderBy(desc(researchSessions.createdAt))
    }),

    // Get a single session with its steps, report, and sources
    getSession: protectedProcedure
        .input(z.object({ sessionId: z.string() }))
        .query(async ({ ctx, input }) => {
            const [session] = await db.select()
                .from(researchSessions)
                .where(eq(researchSessions.id, input.sessionId))

            if (!session || session.userId !== ctx.user.id) {
                return null
            }

            const steps = await db.select()
                .from(researchSteps)
                .where(eq(researchSteps.sessionId, input.sessionId))

            const [report] = await db.select()
                .from(reports)
                .where(eq(reports.sessionId, input.sessionId))

            const sessionSources = await db.select()
                .from(sources)
                .where(eq(sources.sessionId, input.sessionId))

            return {
                ...session,
                steps,
                report: report ?? null,
                sources: sessionSources,
            }
        }),
})

export type AppRouter = typeof appRouter
