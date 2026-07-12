'use client'

import { trpc } from '@/lib/trpc'
import { useSession } from '@/lib/auth-client'
import { useRouter, useParams } from 'next/navigation'
import { useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import Sidebar from '@/components/Sidebar'

export default function ResearchPage() {
    const { data: session, isPending: sessionPending } = useSession()
    const router = useRouter()
    const params = useParams()
    const sessionId = params.id as string

    const { data, isLoading } = trpc.getSession.useQuery(
        { sessionId },
        {
            enabled: !!session && !!sessionId,
            refetchInterval: (query) => {
                const status = query.state.data?.status
                if (status && !['completed', 'failed'].includes(status)) {
                    return 2000
                }
                return false
            },
        }
    )

    useEffect(() => {
        if (!sessionPending && !session) {
            router.push('/login')
        }
    }, [session, sessionPending, router])

    if (sessionPending || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white font-sans">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-white/10 border-t-indigo-500 rounded-full animate-spin" />
                    <span className="text-sm text-zinc-500 tracking-wider">LOADING RESEARCH...</span>
                </div>
            </div>
        )
    }

    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white font-sans">
                Session not found
            </div>
        )
    }

    const statusColors: Record<string, string> = {
        pending: '#667eea',
        planning: '#a78bfa',
        searching: '#f59e0b',
        reading: '#06b6d4',
        writing: '#8b5cf6',
        reviewing: '#8b5cf6',
        completed: '#34d399',
        failed: '#ef4444',
    }

    const isInProgress = !['completed', 'failed'].includes(data.status)
    const latestStep = data.steps.length > 0 ? data.steps[data.steps.length - 1] : null

    return (
        <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans flex">

            <Sidebar activeSessionId={sessionId} />

            {/* ─── MAIN CONTENT ──────────────────────────────────────── */}
            <main className="flex-1 overflow-y-auto h-screen">
                <div className="max-w-3xl mx-auto px-4 sm:px-8 py-6 sm:py-10">
                    {/* Query */}
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 text-white mt-8 md:mt-0">{data.query}</h1>

                    {/* Single Status Box */}
                    <div className="mb-8 sm:mb-10">
                        {isInProgress ? (
                            <div
                                className="flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-4 rounded-xl border"
                                style={{
                                    background: `${statusColors[data.status] || '#667eea'}08`,
                                    borderColor: `${statusColors[data.status] || '#667eea'}25`,
                                }}
                            >
                                <div
                                    className="w-2 h-2 rounded-full animate-pulse shrink-0"
                                    style={{ backgroundColor: statusColors[data.status] || '#667eea' }}
                                />
                                <div className="flex flex-col gap-0.5 min-w-0">
                                    <span
                                        className="text-[11px] font-semibold uppercase tracking-wider"
                                        style={{ color: statusColors[data.status] || '#667eea' }}
                                    >
                                        {data.status}
                                    </span>
                                    <span className="text-xs sm:text-sm text-white/70 truncate">
                                        {latestStep ? latestStep.message : 'Starting research...'}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div
                                className="flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-4 rounded-xl border"
                                style={{
                                    background: `${statusColors[data.status] || '#667eea'}08`,
                                    borderColor: `${statusColors[data.status] || '#667eea'}25`,
                                }}
                            >
                                <span
                                    className="w-2.5 h-2.5 rounded-full shrink-0"
                                    style={{ backgroundColor: statusColors[data.status] || '#667eea' }}
                                />
                                <span
                                    className="text-sm font-semibold uppercase tracking-wider"
                                    style={{ color: statusColors[data.status] || '#667eea' }}
                                >
                                    {data.status === 'completed' ? 'Research Complete' : 'Research Failed'}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Report */}
                    {data.report && (
                        <div className="mb-8 sm:mb-10">
                            <h3 className="text-xs font-semibold text-white/50 mb-4 uppercase tracking-wider">
                                Report
                            </h3>
                            <div className="px-4 sm:px-8 py-4 sm:py-6 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                                <ReactMarkdown
                                    components={{
                                        h1: ({ children }) => (
                                            <h1 className="text-xl sm:text-2xl font-bold text-white mt-8 mb-4 first:mt-0 pb-2 border-b border-white/10">
                                                {children}
                                            </h1>
                                        ),
                                        h2: ({ children }) => (
                                            <h2 className="text-lg sm:text-xl font-bold text-white mt-8 mb-3 first:mt-0 pb-1.5 border-b border-white/5">
                                                {children}
                                            </h2>
                                        ),
                                        h3: ({ children }) => (
                                            <h3 className="text-base sm:text-lg font-semibold text-white/90 mt-6 mb-2">
                                                {children}
                                            </h3>
                                        ),
                                        h4: ({ children }) => (
                                            <h4 className="text-sm sm:text-base font-semibold text-white/80 mt-5 mb-2">
                                                {children}
                                            </h4>
                                        ),
                                        h5: ({ children }) => (
                                            <h5 className="text-sm font-semibold text-white/70 mt-4 mb-1.5">
                                                {children}
                                            </h5>
                                        ),
                                        p: ({ children }) => (
                                            <p className="text-sm sm:text-[15px] leading-6 sm:leading-7 text-white/80 mb-4">
                                                {children}
                                            </p>
                                        ),
                                        ul: ({ children }) => (
                                            <ul className="list-disc list-outside pl-5 sm:pl-6 mb-4 space-y-1.5 text-sm sm:text-[15px] text-white/80 leading-6 sm:leading-7">
                                                {children}
                                            </ul>
                                        ),
                                        ol: ({ children }) => (
                                            <ol className="list-decimal list-outside pl-5 sm:pl-6 mb-4 space-y-1.5 text-sm sm:text-[15px] text-white/80 leading-6 sm:leading-7">
                                                {children}
                                            </ol>
                                        ),
                                        li: ({ children }) => (
                                            <li className="text-white/80">{children}</li>
                                        ),
                                        strong: ({ children }) => (
                                            <strong className="font-semibold text-white">{children}</strong>
                                        ),
                                        em: ({ children }) => (
                                            <em className="italic text-white/70">{children}</em>
                                        ),
                                        blockquote: ({ children }) => (
                                            <blockquote className="border-l-2 border-indigo-500/40 pl-4 my-4 text-white/60 italic">
                                                {children}
                                            </blockquote>
                                        ),
                                        hr: () => (
                                            <hr className="my-6 border-white/10" />
                                        ),
                                        a: ({ children, href }) => (
                                            <span
                                                className="inline text-[10px] sm:text-xs font-mono px-1 sm:px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300/60 mx-0.5 break-all"
                                                title={href}
                                            >
                                                {children}
                                            </span>
                                        ),
                                        code: ({ children }) => (
                                            <code className="text-sm font-mono bg-white/5 text-amber-300/80 px-1.5 py-0.5 rounded">
                                                {children}
                                            </code>
                                        ),
                                        pre: ({ children }) => (
                                            <pre className="bg-white/5 rounded-lg p-3 sm:p-4 my-4 overflow-x-auto border border-white/5 text-sm">
                                                {children}
                                            </pre>
                                        ),
                                    }}
                                >
                                    {data.report.content}
                                </ReactMarkdown>
                            </div>
                        </div>
                    )}

                    {/* Sources */}
                    {data.sources.length > 0 && (
                        <div className="pb-8">
                            <h3 className="text-xs font-semibold text-white/50 mb-4 uppercase tracking-wider">
                                Sources ({data.sources.length})
                            </h3>
                            <div className="flex flex-col gap-2">
                                {data.sources.map((source, i) => (
                                    <a
                                        key={i}
                                        href={source.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block px-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.06] text-indigo-400 hover:bg-white/[0.05] hover:border-white/10 transition no-underline"
                                    >
                                        <span className="text-sm">{source.title}</span>
                                        <span className="block text-xs text-white/40 mt-1 truncate">
                                            {source.url}
                                        </span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
