// ============================================
// USER TYPES
// ============================================
export interface User {
  id: string
  email: string
  name: string
  createdAt: Date
}

// ============================================
// RESEARCH SESSION TYPES
// ============================================
export type ResearchStatus =
  | 'pending'
  | 'planning'
  | 'searching'
  | 'scraping'
  | 'reading'
  | 'writing'
  | 'reviewing'
  | 'completed'
  | 'failed'

export interface ResearchSession {
  id: string
  userId: string
  query: string
  status: ResearchStatus
  createdAt: Date
  updatedAt: Date
}

// ============================================
// STEP LOG TYPES (for streaming)
// ============================================
export type StepType =
  | 'planning'
  | 'searching'
  | 'scraping'
  | 'reading'
  | 'writing'
  | 'reviewing'
  | 'completed'
  | 'error'

export interface StepLog {
  sessionId: string
  step: StepType
  message: string
  timestamp: Date
  metadata?: Record<string, unknown>
}

// ============================================
// SOURCE / ARTICLE TYPES
// ============================================
export interface Source {
  id: string
  sessionId: string
  url: string
  title: string
  summary: string
}

export interface ArticleFinding {
  sourceUrl: string
  title: string
  summary: string
  keyFacts: string[]
  importantNumbers: string[]
  importantDates: string[]
}

// ============================================
// REPORT TYPES
// ============================================
export interface Report {
  id: string
  sessionId: string
  title: string
  content: string      // Full Markdown report
  sources: Source[]
  createdAt: Date
}

// ============================================
// API RESPONSE TYPES
// ============================================
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}
