import { initTRPC, TRPCError } from '@trpc/server'
import { Context } from './context'

const t = initTRPC.context<Context>().create()

export const publicProcedure = t.procedure

const isAuthed = t.middleware(({ next, ctx }) => {
    if (!ctx.user) {
        throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to access this route',
        })
    }

    return next({
        ctx: {
            user: ctx.user,
            session: ctx.session,
        },
    })
})

export const protectedProcedure = t.procedure.use(isAuthed)

export const router = t.router
