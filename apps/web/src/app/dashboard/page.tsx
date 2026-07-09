'use client'

import { useSession, signOut } from '@/lib/auth-client'
import { trpc } from '@/lib/trpc'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function DashboardPage() {
    const { data: session, isPending } = useSession()
    const router = useRouter()
    const [query, setQuery] = useState('')

    // tRPC hooks
    const startResearch = trpc.startResearch.useMutation({
        onSuccess: (data) => {
            router.push(`/research/${data.sessionId}`)
        },
    })
    const sessions = trpc.getSessions.useQuery(undefined, {
        enabled: !!session, // Only fetch if logged in
    })

    useEffect(() => {
        if (!isPending && !session) {
            router.push('/login')
        }
    }, [session, isPending, router])

    if (isPending) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#0a0a0a',
                color: '#fff',
                fontFamily: 'system-ui, sans-serif',
            }}>
                Loading...
            </div>
        )
    }

    if (!session) return null

    const handleResearch = () => {
        if (query.trim().length < 3) return
        startResearch.mutate({ query: query.trim() })
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: '#0a0a0a',
            color: '#fff',
            fontFamily: 'system-ui, sans-serif',
        }}>
            {/* Top Nav */}
            <nav style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 32px',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
            }}>
                <h1 style={{ fontSize: '20px', fontWeight: '700' }}>🔬 ResearchOS</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
                        {session.user.email}
                    </span>
                    <button
                        onClick={() => signOut({ fetchOptions: { onSuccess: () => router.push('/login') } })}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            border: '1px solid rgba(255,255,255,0.15)',
                            background: 'rgba(255,255,255,0.05)',
                            color: '#fff',
                            fontSize: '13px',
                            cursor: 'pointer',
                        }}
                    >
                        Sign Out
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <main style={{
                maxWidth: '800px',
                margin: '0 auto',
                padding: '60px 32px',
                textAlign: 'center',
            }}>
                <h2 style={{
                    fontSize: '36px',
                    fontWeight: '700',
                    marginBottom: '16px',
                }}>
                    Welcome, {session.user.name} 👋
                </h2>
                <p style={{
                    fontSize: '16px',
                    color: 'rgba(255,255,255,0.5)',
                    marginBottom: '48px',
                }}>
                    Start a deep research session powered by AI agents
                </p>

                {/* Research Input */}
                <div style={{
                    display: 'flex',
                    gap: '12px',
                    maxWidth: '600px',
                    margin: '0 auto 48px',
                }}>
                    <input
                        type="text"
                        placeholder="What would you like to research?"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleResearch()}
                        style={{
                            flex: 1,
                            padding: '14px 20px',
                            borderRadius: '12px',
                            border: '1px solid rgba(255,255,255,0.15)',
                            background: 'rgba(255,255,255,0.05)',
                            color: '#fff',
                            fontSize: '15px',
                            outline: 'none',
                        }}
                    />
                    <button
                        onClick={handleResearch}
                        disabled={startResearch.isPending || query.trim().length < 3}
                        style={{
                            padding: '14px 28px',
                            borderRadius: '12px',
                            border: 'none',
                            background: startResearch.isPending
                                ? 'rgba(102, 126, 234, 0.5)'
                                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: '#fff',
                            fontSize: '15px',
                            fontWeight: '600',
                            cursor: startResearch.isPending ? 'not-allowed' : 'pointer',
                            opacity: query.trim().length < 3 ? 0.5 : 1,
                        }}
                    >
                        {startResearch.isPending ? 'Starting...' : 'Research'}
                    </button>
                </div>

                {/* Past Sessions */}
                {sessions.data && sessions.data.length > 0 && (
                    <div style={{ textAlign: 'left', maxWidth: '600px', margin: '0 auto' }}>
                        <h3 style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            marginBottom: '16px',
                            color: 'rgba(255,255,255,0.7)',
                        }}>
                            Recent Research
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {sessions.data.map((s) => (
                                <div
                                    key={s.id}
                                    onClick={() => router.push(`/research/${s.id}`)}
                                    style={{
                                        padding: '14px 18px',
                                        borderRadius: '10px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        background: 'rgba(255,255,255,0.03)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        transition: 'background 0.2s',
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                >
                                    <span style={{ fontSize: '14px' }}>{s.query}</span>
                                    <span style={{
                                        fontSize: '12px',
                                        padding: '4px 10px',
                                        borderRadius: '6px',
                                        background: s.status === 'completed'
                                            ? 'rgba(52, 211, 153, 0.15)'
                                            : s.status === 'failed'
                                                ? 'rgba(239, 68, 68, 0.15)'
                                                : 'rgba(102, 126, 234, 0.15)',
                                        color: s.status === 'completed'
                                            ? '#34d399'
                                            : s.status === 'failed'
                                                ? '#ef4444'
                                                : '#667eea',
                                    }}>
                                        {s.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
