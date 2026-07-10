import { ResearchStateType } from '../state'
import { db } from '../../database'
import { researchSessions } from '../../database/schema'
import { eq } from 'drizzle-orm'
import { logStep } from '../utils'
import { getModel } from '../model'

const model = getModel()

export async function plannerNode(state: ResearchStateType) {
    await logStep(state.sessionId, 'planning', 'Analyzing query and creating research plan...')

    await db.update(researchSessions)
        .set({ status: 'planning' })
        .where(eq(researchSessions.id, state.sessionId))

    const prompt = `You are a research planner. Given this query, break it down into 3-5 specific sub-questions to research. Return ONLY a JSON array of strings, nothing else. Do not wrap in markdown.
    
    Query: "${state.query}"`

    const response = await model.invoke(prompt)
    const text = typeof response.content === 'string' ? response.content : ''

    try {
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim()
        const subQuestions = JSON.parse(cleanedText)
        await logStep(state.sessionId, 'planning', `Generated ${subQuestions.length} sub-questions`)
        return { subQuestions }
    } catch {
        return { subQuestions: [state.query] }
    }
}
