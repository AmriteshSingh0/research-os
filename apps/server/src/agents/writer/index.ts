import { ResearchStateType } from '../state'
import { db } from '../../database'
import { researchSessions } from '../../database/schema'
import { eq } from 'drizzle-orm'
import { logStep } from '../utils'
import { getModel } from '../model'

const model = getModel()

export async function writerNode(state: ResearchStateType) {
    await logStep(state.sessionId, 'writing', 'Synthesizing final research report...')

    await db.update(researchSessions)
        .set({ status: 'writing' })
        .where(eq(researchSessions.id, state.sessionId))

    const findingsList = state.findings.map((f, i) => `${i + 1}. ${f}`).join('\n')

    const prompt = `You are an expert technical writer. Write a comprehensive, high-quality research report answering the query: "${state.query}".
    
    Use the following key findings extracted from web scraping to back up your report. Make sure to cite the sources (like [Source URL](url)) in the text.
    
    Findings:
    ${findingsList}
    
    Write the report in beautiful markdown format with a Title, Executive Summary, Detailed Analysis, and a References section.`

    const response = await model.invoke(prompt)
    const draftReport = typeof response.content === 'string' ? response.content : ''
    return { draftReport }
}
