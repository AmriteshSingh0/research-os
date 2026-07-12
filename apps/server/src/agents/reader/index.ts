import { ResearchStateType } from '../state'
import { db } from '../../database'
import { researchSessions, sources as dbSources } from '../../database/schema'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'crypto'
import * as cheerio from 'cheerio'
import { logStep } from '../utils'
import { getModel, getEmbeddings } from '../model' // 👈 Import both factories

const model = getModel()
const embeddings = getEmbeddings() // 👈 Get the correct embeddings model

// Helper 1: Math formula to measure vector similarity
function cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dotProduct = 0.0
    let normA = 0.0
    let normB = 0.0
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i]
        normA += vecA[i] * vecA[i]
        normB += vecB[i] * vecB[i]
    }
    if (normA === 0 || normB === 0) return 0
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

// Helper 2: Cut webpage text into paragraphs
function chunkText(text: string, chunkSize = 800): string[] {
    const sentences = text.match(/[^.!?]+[.!?]+(\s|$)/g) || [text]
    const chunks: string[] = []
    let currentChunk = ""

    for (const sentence of sentences) {
        if ((currentChunk + sentence).length > chunkSize) {
            if (currentChunk.trim()) chunks.push(currentChunk.trim())
            currentChunk = sentence
        } else {
            currentChunk += sentence
        }
    }
    if (currentChunk.trim()) chunks.push(currentChunk.trim())
    return chunks
}

function calculateKeywordScore(chunk: string, query: string): number {
    console.log("🛑🛑we have hit the falback in the olaama🛑🛑")
    const stopWords = new Set(['the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'of', 'in', 'to', 'for', 'with', 'that', 'this', 'it', 'by', 'as', 'are', 'was', 'were'])
    const clean = (text: string) => text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w && !stopWords.has(w))

    const chunkWords = new Set(clean(chunk))
    const queryWords = clean(query)

    if (queryWords.length === 0) return 0

    let matches = 0
    for (const word of queryWords) {
        if (chunkWords.has(word)) {
            matches++
        }
    }
    return matches / queryWords.length
}

export async function scraperNode(state: ResearchStateType) {
    await db.update(researchSessions)
        .set({ status: 'reading' })
        .where(eq(researchSessions.id, state.sessionId))

    await logStep(state.sessionId, 'reading', `Starting parallel crawl of ${Math.min(state.sources.length, 5)} websites...`)

    // ─── STEP 1: PARALLEL WEB CRAWLING ──────────────────────────────────
    const scrapePromises = state.sources.slice(0, 5).map(async (source) => {
        try {
            const res = await fetch(source.url, { signal: AbortSignal.timeout(4000) })
            const html = await res.text()

            const $ = cheerio.load(html)
            $('script, style, nav, footer, iframe, header, noscript').remove()
            const rawText = $('body').text().replace(/\s+/g, ' ').trim()

            console.log(`[ResearchOS] [READER] Crawled ${rawText.length} characters from ${source.url}`)

            await db.insert(dbSources).values({
                id: randomUUID(),
                sessionId: state.sessionId,
                url: source.url,
                title: source.title,
                summary: rawText.slice(0, 500),
            })

            return { url: source.url, text: rawText }
        } catch (err) {
            await logStep(state.sessionId, 'reading', `Could not scrape: ${source.title}`)
            return null
        }
    })

    const scrapedData = (await Promise.all(scrapePromises)).filter(Boolean) as Array<{ url: string; text: string }>

    // ─── STEP 2: VECTOR EMBEDDING & RAG RETRIEVAL ───────────────────────
    const findings: string[] = []

    for (const data of scrapedData) {
        try {
            const chunks = chunkText(data.text, 800)
            if (chunks.length === 0) continue

            try {
                // Try LangChain Vector Embedding Search
                const vectors = await embeddings.embedDocuments(chunks)
                const validEmbeddings = chunks.map((chunk, idx) => ({
                    chunk,
                    embedding: vectors[idx]
                }))

                for (const question of state.subQuestions) {
                    const questionEmbedding = await embeddings.embedQuery(question)

                    const scoredChunks = validEmbeddings.map(item => ({
                        chunk: item.chunk,
                        score: cosineSimilarity(item.embedding, questionEmbedding)
                    }))

                    scoredChunks.sort((a, b) => b.score - a.score)
                    const topMatch = scoredChunks[0]

                    if (topMatch) {
                        console.log(`[ResearchOS] [READER] [Vector Match] Score: ${topMatch.score.toFixed(3)} | Question: "${question}"`)
                    }

                    if (topMatch && topMatch.score > 0.35) {
                        findings.push(`${topMatch.chunk} (Source: ${data.url})`)
                    }
                }
            } catch (embedError) {
                // Fallback: If Ollama embeddings fail, run local Keyword Overlap RAG
                console.warn(`[ResearchOS] [READER] ⚠️ Embeddings failed. Falling back to Keyword matching for ${data.url}...`)

                for (const question of state.subQuestions) {
                    const scoredChunks = chunks.map(chunk => ({
                        chunk,
                        score: calculateKeywordScore(chunk, question)
                    }))

                    scoredChunks.sort((a, b) => b.score - a.score)
                    const topMatch = scoredChunks[0]

                    if (topMatch) {
                        console.log(`[ResearchOS] [READER] [Keyword Match] Score: ${topMatch.score.toFixed(3)} | Question: "${question}"`)
                    }

                    if (topMatch && topMatch.score >= 0.20) {
                        findings.push(`${topMatch.chunk} (Source: ${data.url})`)
                    }
                }
            }
        } catch (e) {
            console.error(`[ResearchOS] [READER] ❌ Processing failed for ${data.url}:`, e)
        }
    }

    await logStep(state.sessionId, 'reading', `Extracted ${findings.length} key facts using vector RAG`)
    return { findings }
}
