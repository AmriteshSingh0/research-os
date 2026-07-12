import { ChatOllama, OllamaEmbeddings } from '@langchain/ollama'
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai'
import { BaseChatModel } from '@langchain/core/language_models/chat_models'
import { Embeddings } from '@langchain/core/embeddings'

// 1. Chat Model Factory
export function getModel(): BaseChatModel {
    if (process.env.OPENAI_API_KEY) {
        return new ChatOpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            model: 'gpt-4o-mini',
            temperature: 0.2,
        })
    }

    const OLLAMA_URL = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434'
    return new ChatOllama({
        baseUrl: OLLAMA_URL,
        model: 'qwen2.5:3b',
        temperature: 0.2,
    })
}

// 2. Embeddings Model Factory
export function getEmbeddings(): Embeddings {
    if (process.env.OPENAI_API_KEY) {
        return new OpenAIEmbeddings({
            apiKey: process.env.OPENAI_API_KEY,
            model: 'text-embedding-3-small', // Fast & cheap
        })
    }

    const OLLAMA_URL = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434'
    return new OllamaEmbeddings({
        baseUrl: OLLAMA_URL,
        model: 'nomic-embed-text',
    })
}
