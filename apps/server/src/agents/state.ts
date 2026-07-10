import { Annotation } from '@langchain/langgraph'

export const ResearchState = Annotation.Root({
    sessionId: Annotation<string>,
    query: Annotation<string>,
    subQuestions: Annotation<string[]>,
    sources: Annotation<Array<{ url: string; title: string; content: string }>>,
    findings: Annotation<string[]>,
    draftReport: Annotation<string>,
    finalReport: Annotation<string>,
})

export type ResearchStateType = typeof ResearchState.State
