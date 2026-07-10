import { ResearchStateType } from '../state'
import { db } from '../../database'
import { researchSessions, reports } from '../../database/schema'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'crypto'
import { logStep } from '../utils'
import { getModel } from '../model'

const model = getModel()

export async function reviewerNode(state: ResearchStateType) {
    await logStep(state.sessionId, 'reviewing', 'Reviewing and polishing formatting...')

    await db.update(researchSessions)
        .set({ status: 'reviewing' })
        .where(eq(researchSessions.id, state.sessionId))

    const prompt = `You are an editor. Review this draft report, fix any formatting issues, check that all citations are correctly formatted markdown links, and polish the text. Return only the polished report.
    
    Draft:
    ${state.draftReport}`

    const response = await model.invoke(prompt)
    const finalReport = typeof response.content === 'string' ? response.content : ''

    const lines = finalReport.split('\n').filter(l => l.trim())
    const title = lines[0]?.replace(/^#\s*/, '') || `Research: ${state.query}`

    await db.insert(reports).values({
        id: randomUUID(),
        sessionId: state.sessionId,
        title,
        content: finalReport,
    })

    await db.update(researchSessions)
        .set({ status: 'completed' })
        .where(eq(researchSessions.id, state.sessionId))

    await logStep(state.sessionId, 'completed', 'Research complete! Report compiled successfully.')
    return { finalReport }
}
