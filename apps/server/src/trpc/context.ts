import * as trpcExpress from '@trpc/server/adapters/express'
import { auth } from '../auth'

export async function createContext({
    req,
    res,
}: trpcExpress.CreateExpressContextOptions) {
    const headers = new Headers()
    Object.entries(req.headers).forEach(([key, value]) => {
        if (value) {
            if (Array.isArray(value)) {
                value.forEach((v) => headers.append(key, v))
            } else {
                headers.set(key, value)
            }
        }
    })
    const session = await auth.api.getSession({
        headers,
    })

    return {
        req,
        res,
        user: session?.user ?? null,
        session: session?.session ?? null,
    }
}

export type Context = Awaited<ReturnType<typeof createContext>>
