import { StateGraph, START, END } from '@langchain/langgraph'
import { ResearchState } from './state'
import { plannerNode } from './planner'
import { searcherNode } from './searcher'
import { scraperNode } from './reader'
import { writerNode } from './writer'
import { reviewerNode } from './reviewer'

const workflow = new StateGraph(ResearchState)
    .addNode('planner', plannerNode)
    .addNode('searcher', searcherNode)
    .addNode('scraper', scraperNode)
    .addNode('writer', writerNode)
    .addNode('reviewer', reviewerNode)
    .addEdge(START, 'planner')
    .addEdge('planner', 'searcher')
    .addEdge('searcher', 'scraper')
    .addEdge('scraper', 'writer')
    .addEdge('writer', 'reviewer')
    .addEdge('reviewer', END)

export const researchGraph = workflow.compile()
