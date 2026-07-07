import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'
import dotenv from 'dotenv'

dotenv.config()

// Pool = a group of reusable database connections
// Instead of opening/closing a connection every request (slow),
// a pool keeps connections open and reuses them (fast)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
})

// `db` is what you import everywhere to run queries
// e.g. db.select().from(schema.users)
export const db = drizzle(pool, { schema })

// Export schema so other files can reference tables easily
export { schema }
