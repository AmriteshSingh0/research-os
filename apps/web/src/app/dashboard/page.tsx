'use client'

import { useSession } from '@/lib/auth-client'
import { trpc } from '@/lib/trpc'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import Sidebar from '@/components/Sidebar'

export default function DashboardPage() {
    const { data: session, isPending } = useSession()
    const router = useRouter()
    const [query, setQuery] = useState('')
    const [showLimitPopup, setShowLimitPopup] = useState(false)

    const startResearch = trpc.startResearch.useMutation({
        onSuccess: (data) => {
            router.push(`/research/${data.sessionId}`)
        },
        onError: (err) => {
            if (err.message === 'LIMIT_REACHED') {
                setShowLimitPopup(true)
            }
        }
    })

    useEffect(() => {
        if (!isPending && !session) {
            router.push('/login')
        }
    }, [session, isPending, router])

    // Generate 45 twinkling stars (must be before any early returns — React Rules of Hooks)
    const stars = useMemo(() => {
        const colors = ['#818cf8', '#a78bfa', '#c084fc', '#e879f9', '#f472b6']
        return Array.from({ length: 45 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 2 + 1,
            color: colors[Math.floor(Math.random() * colors.length)],
            delay: Math.random() * 4,
            duration: 1.5 + Math.random() * 1.5,
        }))
    }, [])

    if (isPending) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white font-sans">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-white/10 border-t-indigo-500 rounded-full animate-spin" />
                    <span className="text-sm text-zinc-500 tracking-wider">LOADING PROFILE...</span>
                </div>
            </div>
        )
    }

    if (!session) return null

    const handleResearch = (searchQuery = query) => {
        const trimmed = searchQuery.trim()
        if (trimmed.length < 3) return
        startResearch.mutate({ query: trimmed })
    }

    const suggestions = [
        { title: "Space Exploration", query: "Latest discoveries from the James Webb Space Telescope in 2025" },
        { title: "Battery Tech", query: "Current state of solid-state battery technology for EVs" },
        { title: "Gene Editing", query: "Recent breakthroughs in CRISPR gene editing for human diseases" }
    ]

    return (
        <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans flex">

            <Sidebar />

            {/* ─── MAIN CONTENT AREA ─────────────────────────────────── */}
            <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 mx-auto h-screen overflow-y-auto relative">

                {/* Twinkling Stars */}
                {stars.map((star) => (
                    <div
                        key={star.id}
                        className="absolute rounded-full pointer-events-none"
                        style={{
                            left: `${star.x}%`,
                            top: `${star.y}%`,
                            width: `${star.size}px`,
                            height: `${star.size}px`,
                            backgroundColor: star.color,
                            animation: `twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
                            opacity: 0,
                        }}
                    />
                ))}
                <style>{`
                    @keyframes twinkle {
                        0%, 100% { opacity: 0; transform: scale(0.5); }
                        50% { opacity: 0.8; transform: scale(1); }
                    }
                `}</style>

                <div className="w-full max-w-2xl flex flex-col gap-8 sm:gap-12 text-center py-8">

                    {/* Header */}
                    <div className="flex flex-col gap-3 mt-8 md:mt-0">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            What do you want to discover?
                        </h2>
                        <p className="text-xs sm:text-sm text-zinc-500 max-w-lg mx-auto px-4">
                            Deploy a multi-agent LangGraph RAG pipeline to crawl websites, index facts, and write reports.
                        </p>
                    </div>

                    {/* Search Input */}
                    <div className="w-full max-w-2xl mx-auto p-[1px] rounded-xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 focus-within:from-indigo-500 focus-within:to-purple-600 transition-all duration-300 shadow-2xl shadow-purple-500/5">
                        <div className="bg-[#09090b] rounded-xl p-2 sm:p-3 flex items-center gap-2 sm:gap-3">
                            <input
                                type="text"
                                placeholder="Ask anything to start research..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleResearch()}
                                className="flex-1 bg-transparent text-white text-sm outline-none placeholder-zinc-500 border-none p-2 w-full focus:ring-0 focus:outline-none"
                            />
                            <button
                                onClick={() => handleResearch()}
                                disabled={startResearch.isPending || query.trim().length < 3}
                                className="p-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-30 text-white font-medium text-sm transition duration-200 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center w-10 h-10 shrink-0 shadow-lg shadow-indigo-500/20"
                            >
                                {startResearch.isPending ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <span>→</span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Suggestion Cards */}
                    <div className="w-full max-w-2xl mx-auto flex flex-col sm:flex-row gap-3 text-left px-2 sm:px-0">
                        {suggestions.map((s, idx) => (
                            <div
                                key={idx}
                                onClick={() => {
                                    setQuery(s.query)
                                    handleResearch(s.query)
                                }}
                                className="flex-1 bg-[#09090b] border border-white/5 hover:border-indigo-500/20 p-4 rounded-xl hover:bg-white/5 cursor-pointer transition duration-200 shadow-sm"
                            >
                                <h4 className="text-xs font-semibold text-indigo-400 mb-1.5 uppercase tracking-wider">
                                    {s.title}
                                </h4>
                                <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                                    {s.query}
                                </p>
                            </div>
                        ))}
                    </div>

                </div>
            </main>

            {/* ─── LIMIT EXCEEDED POPUP MODAL ───────────────────────── */}
            {showLimitPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity duration-350">
                    <div className="w-full max-w-md bg-[#09090b] border-2 border-purple-500/30 rounded-2xl p-6 sm:p-8 text-center shadow-[0_0_50px_rgba(168,85,247,0.15)] relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Glow effect background */}
                        <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

                        {/* Icon */}
                        <div className="mx-auto w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mb-6 text-purple-400">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                        </div>

                        {/* Heading */}
                        <h3 className="text-xl font-bold text-white mb-3 tracking-wide">
                            Limit Reached
                        </h3>

                        {/* Message content */}
                        <p className="text-sm leading-relaxed text-purple-300/90 font-medium mb-8">
                            Hey there! Looks like your limit has been reached (max 3 searches). Since this project is only for learning, the developer can't allow infinite searches, otherwise they would be on the streets. <span className="text-purple-400 font-bold block mt-3 tracking-wide">IF YOU LIKE IT, PLEASE OFFER THE DEVELOPER A ROLE IN YOUR ORG!</span>
                        </p>

                        {/* Got it Button */}
                        <button
                            onClick={() => setShowLimitPopup(false)}
                            className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/35 transition duration-200 cursor-pointer"
                        >
                            Got it
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
