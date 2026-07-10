import { ChatOllama } from '@langchain/ollama'
import { ChatOpenAI } from '@langchain/openai'
import { BaseChatModel } from '@langchain/core/language_models/chat_models'

export function getModel(): BaseChatModel {
    // If we have an OpenAI API key, use ChatGPT (Production)
    if (process.env.OPENAI_API_KEY) {
        return new ChatOpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            model: 'gpt-4o-mini', // Fast and cheap for agent steps
            temperature: 0.2,
        })
    }

    // Otherwise, default to local Ollama (Development)
    const OLLAMA_URL = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434'
    return new ChatOllama({
        baseUrl: OLLAMA_URL,
        model: 'qwen2.5:3b',
        temperature: 0.2,
    })
}
