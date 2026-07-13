'use client'

import { useSession, signOut } from '@/lib/auth-client'
import { trpc } from '@/lib/trpc'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

interface SidebarProps {
    activeSessionId?: string
}

const dotColors: Record<string, string> = {
    completed: 'bg-emerald-400',
    failed: 'bg-rose-400',
    pending: 'bg-indigo-400',
    planning: 'bg-purple-400',
    searching: 'bg-amber-400',
    reading: 'bg-cyan-400',
    writing: 'bg-fuchsia-400',
}

export default function Sidebar({ activeSessionId }: SidebarProps) {
    const { data: session } = useSession()
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)

    const sessions = trpc.getSessions.useQuery(undefined, {
        enabled: !!session,
    })

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setIsOpen(false)
    }, [activeSessionId])

    // Close sidebar when clicking outside on mobile
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsOpen(false)
            }
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    return (
        <>
            {/* ─── HAMBURGER BUTTON (visible on mobile only) ─────────── */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed top-4 left-4 z-40 md:hidden p-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition cursor-pointer"
                aria-label="Open sidebar"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
            </button>

            {/* ─── OVERLAY BACKDROP (mobile only) ────────────────────── */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* ─── SIDEBAR ───────────────────────────────────────────── */}
            <aside
                className={`
                    fixed md:sticky top-0 left-0 z-50 h-screen w-64 shrink-0
                    bg-[#09090b] border-r border-white/5
                    flex flex-col justify-between p-4
                    transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                `}
            >
                <div className="flex flex-col gap-6 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-2">
                        <h1
                            onClick={() => { router.push('/dashboard'); setIsOpen(false) }}
                            className="font-semibold text-white tracking-wider text-base cursor-pointer hover:text-indigo-400 transition"
                        >
                            ResearchOS
                        </h1>
                        {/* Close button (mobile only) */}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="md:hidden text-zinc-500 hover:text-white transition cursor-pointer"
                            aria-label="Close sidebar"
                        >
                            ✕
                        </button>
                    </div>

                    {/* New Research Button */}
                    <button
                        onClick={() => { router.push('/dashboard'); setIsOpen(false) }}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-sm font-medium text-white transition duration-200 cursor-pointer"
                    >
                        <span>+</span> New Research
                    </button>

                    {/* Scrollable History */}
                    <div className="flex flex-col gap-2 overflow-y-auto flex-1 scrollbar-hide" style={{ direction: 'rtl' }}>
                        <div style={{ direction: 'ltr' }}>
                            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider px-2">
                                Recent History
                            </span>

                            {sessions.isLoading ? (
                                <div className="py-8 text-center text-xs text-zinc-600">Loading...</div>
                            ) : sessions.data && sessions.data.length > 0 ? (
                                <div className="flex flex-col gap-1.5 mt-2">
                                    {sessions.data.map((s) => {
                                        const isActive = s.id === activeSessionId
                                        const isRunning = !['completed', 'failed'].includes(s.status)
                                        return (
                                            <div
                                                key={s.id}
                                                onClick={() => { router.push(`/research/${s.id}`); setIsOpen(false) }}
                                                className={`group w-full flex items-center gap-2.5 text-left py-2 px-3 rounded-lg cursor-pointer border transition duration-150 ${
                                                    isActive
                                                        ? 'bg-indigo-500/10 border-indigo-500/20'
                                                        : 'hover:bg-white/5 border-transparent hover:border-white/5'
                                                }`}
                                            >
                                                <span className={`w-2 h-2 rounded-full shrink-0 ${
                                                    isActive && isRunning
                                                        ? 'bg-indigo-400 animate-pulse'
                                                        : dotColors[s.status] || 'bg-zinc-500'
                                                }`} />
                                                <span className={`text-xs truncate w-full ${
                                                    isActive ? 'text-white font-medium' : 'text-zinc-400 group-hover:text-white'
                                                }`}>
                                                    {s.query}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="py-8 text-center text-xs text-zinc-600 px-2 italic">No history yet</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                {session && (
                    <div className="pt-4 border-t border-white/5 flex flex-col gap-3">
                        <div className="flex flex-col px-2">
                            <span className="text-xs text-zinc-400 font-medium truncate">{session.user.name}</span>
                            <span className="text-[10px] text-zinc-500 truncate">{session.user.email}</span>
                        </div>
                        <button
                            onClick={async () => {
                                try {
                                    await signOut({ fetchOptions: { onSuccess: () => router.push('/login') } })
                                } catch {
                                    // Even if sign-out API fails, redirect to login
                                    router.push('/login')
                                }
                            }}
                            className="w-full py-2 px-3 rounded-lg bg-red-950/20 hover:bg-red-950/40 text-red-400 border border-red-900/20 hover:border-red-900/30 text-xs font-semibold tracking-wide transition duration-200 cursor-pointer text-center"
                        >
                            Sign Out
                        </button>
                    </div>
                )}
            </aside>
        </>
    )
}
