import { db } from '../database'
import { researchSteps } from '../database/schema'
import { randomUUID } from 'crypto'

export async function logStep(sessionId: string, stepName: string, message: string) {
    await db.insert(researchSteps).values({
        id: randomUUID(),
        sessionId,
        step: stepName,
        message,
    })
}
