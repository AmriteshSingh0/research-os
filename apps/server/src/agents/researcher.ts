import { db } from '../database'
import { researchSessions, researchSteps, reports, sources } from '../database/schema'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'crypto'

const OLLAMA_URL = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434'
const MODEL_NAME = 'qwen2.5:3b'

// Simple direct HTTP call to Ollama
async function generateOllamaText(prompt: string): Promise<string> {
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: MODEL_NAME,
            prompt: prompt,
            stream: false
        })
    })
    
    if (!response.ok) {
        throw new Error(`Ollama generation failed: ${response.statusText}`)
    }
    
    const data = await response.json() as { response: string }
    return data.response
}

// Step 1: Plan the research
async function planResearch(query: string): Promise<string[]> {
    const text = await generateOllamaText(`You are a research planner. Given this research query, break it down into 3-5 specific sub-questions that need to be answered. Return ONLY a valid JSON array of strings, nothing else. No markdown wrapper tags.

Query: "${query}"

Example output: ["What is X?", "How does X work?", "What are recent developments in X?"]`)

    try {
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim()
        return JSON.parse(cleanedText)
    } catch {
        return [query] // fallback to original query
    }
}

// Step 2: Search the web using Tavily
async function searchWeb(query: string): Promise<{ url: string; title: string; content: string }[]> {
    const apiKey = process.env.TAVILY_API_KEY
    if (!apiKey) {
        console.warn('TAVILY_API_KEY not set, skipping web search')
        return []
    }

    const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            api_key: apiKey,
            query,
            max_results: 5,
            include_raw_content: false,
        }),
    })

    const data = await response.json()
    return (data.results || []).map((r: any) => ({
        url: r.url,
        title: r.title,
        content: r.content,
    }))
}

// Step 3: Synthesize a report from all gathered information
async function writeReport(
    query: string,
    searchResults: { url: string; title: string; content: string }[]
): Promise<{ title: string; content: string }> {
    const sourceSummaries = searchResults
        .map((r, i) => `Source ${i + 1} (${r.title}):\n${r.content}`)
        .join('\n\n---\n\n')

    const text = await generateOllamaText(`You are an expert research writer. Using the following sources, write a comprehensive, well-structured research report answering this query:

Query: "${query}"

Sources:
${sourceSummaries}

Write the report in markdown format with:
- A clear title
- An executive summary
- Key findings organized by topic
- A conclusion

Be thorough, accurate, and cite sources where relevant.`)

    // Extract title from first line or generate one
    const lines = text.split('\n').filter(l => l.trim())
    const title = lines[0]?.replace(/^#\s*/, '') || `Research: ${query}`

    return { title, content: text }
}

// Main research function
export async function runResearch(sessionId: string, query: string) {
    try {
        // Update status to planning
        await db.update(researchSessions)
            .set({ status: 'planning' })
            .where(eq(researchSessions.id, sessionId))

        await db.insert(researchSteps).values({
            id: randomUUID(),
            sessionId,
            step: 'planning',
            message: 'Breaking down your research query...',
        })

        // Step 1: Plan
        const subQuestions = await planResearch(query)

        await db.insert(researchSteps).values({
            id: randomUUID(),
            sessionId,
            step: 'planning',
            message: `Identified ${subQuestions.length} sub-questions to research`,
        })

        // Step 2: Search
        await db.update(researchSessions)
            .set({ status: 'searching' })
            .where(eq(researchSessions.id, sessionId))

        const allResults: { url: string; title: string; content: string }[] = []

        for (const question of subQuestions) {
            await db.insert(researchSteps).values({
                id: randomUUID(),
                sessionId,
                step: 'searching',
                message: `Searching: "${question}"`,
            })

            const results = await searchWeb(question)
            allResults.push(...results)
        }

        await db.insert(researchSteps).values({
            id: randomUUID(),
            sessionId,
            step: 'searching',
            message: `Found ${allResults.length} sources`,
        })

        // Save sources to database
        for (const result of allResults) {
            await db.insert(sources).values({
                id: randomUUID(),
                sessionId,
                url: result.url,
                title: result.title,
                summary: result.content.slice(0, 500),
            })
        }

        // Step 3: Write report
        await db.update(researchSessions)
            .set({ status: 'writing' })
            .where(eq(researchSessions.id, sessionId))

        await db.insert(researchSteps).values({
            id: randomUUID(),
            sessionId,
            step: 'writing',
            message: 'Writing comprehensive report...',
        })

        const report = await writeReport(query, allResults)

        await db.insert(reports).values({
            id: randomUUID(),
            sessionId,
            title: report.title,
            content: report.content,
        })

        // Mark as completed
        await db.update(researchSessions)
            .set({ status: 'completed' })
            .where(eq(researchSessions.id, sessionId))

        await db.insert(researchSteps).values({
            id: randomUUID(),
            sessionId,
            step: 'completed',
            message: 'Research complete! Report is ready.',
        })

    } catch (error) {
        console.error('Research failed:', error)

        await db.update(researchSessions)
            .set({ status: 'failed' })
            .where(eq(researchSessions.id, sessionId))

        await db.insert(researchSteps).values({
            id: randomUUID(),
            sessionId,
            step: 'failed',
            message: `Research failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        })
    }
}
