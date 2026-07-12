import { ResearchStateType } from './state'
import { db } from '../database'
import { researchSessions } from '../database/schema'
import { eq } from 'drizzle-orm'
import { logStep } from './utils'

export async function searcherNode(state: ResearchStateType) {
    await db.update(researchSessions)
        .set({ status: 'searching' })
        .where(eq(researchSessions.id, state.sessionId))

    const apiKey = process.env.TAVILY_API_KEY
    if (!apiKey) {
        await logStep(state.sessionId, 'searching', 'Tavily key missing, skipping web search')
        return { sources: [] }
    }

    const results: Array<{ url: string; title: string; content: string }> = []

    for (const question of state.subQuestions) {
        await logStep(state.sessionId, 'searching', `Searching: "${question}"`)
        console.log(`[ResearchOS] [SEARCHER] Calling Tavily API for: "${question}"...`)

        try {
            const response = await fetch('https://api.tavily.com/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ api_key: apiKey, query: question, max_results: 3 }),
            })
            const data = await response.json()
            if (data.results) {
                results.push(...data.results.map((r: any) => ({
                    url: r.url,
                    title: r.title,
                    content: r.content,
                })))
            }
        } catch (e) {
            console.error(`[ResearchOS] [SEARCHER] ❌ Tavily API failed for "${question}":`, e)
        }
    }

    // Deduplicate by URL
    const uniqueSources = Array.from(new Map(results.map(item => [item.url, item])).values())
    await logStep(state.sessionId, 'searching', `Found ${uniqueSources.length} relevant URLs`)
    return { sources: uniqueSources }
}
