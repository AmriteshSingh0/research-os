import { ResearchStateType } from '../state'
import { db } from '../../database'
import { researchSessions, sources as dbSources } from '../../database/schema'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'crypto'
import * as cheerio from 'cheerio'
import { logStep } from '../utils'
import { getModel } from '../model'

const model = getModel()

export async function scraperNode(state: ResearchStateType) {
    await db.update(researchSessions)
        .set({ status: 'reading' })
        .where(eq(researchSessions.id, state.sessionId))

    const findings: string[] = []

    for (let i = 0; i < Math.min(state.sources.length, 5); i++) {
        const source = state.sources[i]
        await logStep(state.sessionId, 'reading', `Scraping & Reading: ${source.title}`)

        try {
            const res = await fetch(source.url, { signal: AbortSignal.timeout(5000) })
            const html = await res.text()

            const $ = cheerio.load(html)
            $('script, style, nav, footer, iframe, header, noscript').remove()
            const rawText = $('body').text().replace(/\s+/g, ' ').trim()
            const cleanText = rawText.slice(0, 4000)

            const readerPrompt = `You are a research analyst. Read the following text scraped from "${source.url}" and extract 3-5 key facts relevant to our query: "${state.query}".
            
            Text:
            ${cleanText}
            
            Return ONLY a JSON array of strings representing the key findings.`

            const response = await model.invoke(readerPrompt)
            const text = typeof response.content === 'string' ? response.content : ''

            try {
                const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim()
                const facts = JSON.parse(cleanedText)
                findings.push(...facts.map((fact: string) => `${fact} (Source: ${source.url})`))
            } catch {
                findings.push(`Analyzed details for ${source.title} (Source: ${source.url})`)
            }

            await db.insert(dbSources).values({
                id: randomUUID(),
                sessionId: state.sessionId,
                url: source.url,
                title: source.title,
                summary: source.content.slice(0, 500),
            })

        } catch (err) {
            await logStep(state.sessionId, 'reading', `Could not fully scrape: ${source.title}`)
        }
    }

    return { findings }
}
