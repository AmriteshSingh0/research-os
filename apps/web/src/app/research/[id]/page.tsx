'use client'

import { trpc } from '@/lib/trpc'
import { useSession } from '@/lib/auth-client'
import { useRouter, useParams } from 'next/navigation'
import { useEffect } from 'react'

export default function ResearchPage() {
    const { data: session, isPending: sessionPending } = useSession()
    const router = useRouter()
    const params = useParams()
    const sessionId = params.id as string

    const { data, isLoading, refetch } = trpc.getSession.useQuery(
        { sessionId },
        {
            enabled: !!session && !!sessionId,
            refetchInterval: (query) => {
                const status = query.state.data?.status
                // Auto-refresh every 2s while research is in progress
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
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#0a0a0a',
                color: '#fff',
                fontFamily: 'system-ui, sans-serif',
            }}>
                Loading research session...
            </div>
        )
    }

    if (!data) {
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
        completed: '#34d399',
        failed: '#ef4444',
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
                gap: '16px',
                padding: '16px 32px',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
            }}>
                <button
                    onClick={() => router.push('/dashboard')}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'rgba(255,255,255,0.6)',
                        cursor: 'pointer',
                        fontSize: '14px',
                    }}
                >
                    ← Back
                </button>
                <span style={{
                    fontSize: '12px',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: `${statusColors[data.status] || '#667eea'}20`,
                    color: statusColors[data.status] || '#667eea',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                }}>
                    {data.status}
                </span>
            </nav>

            <main style={{
                maxWidth: '800px',
                margin: '0 auto',
                padding: '40px 32px',
            }}>
                {/* Query */}
                <h1 style={{
                    fontSize: '28px',
                    fontWeight: '700',
                    marginBottom: '32px',
                }}>
                    {data.query}
                </h1>

                {/* Live Steps */}
                <div style={{ marginBottom: '40px' }}>
                    <h3 style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: 'rgba(255,255,255,0.5)',
                        marginBottom: '16px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                    }}>
                        Research Progress
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {data.steps.map((step, i) => (
                            <div
                                key={i}
                                style={{
                                    padding: '12px 16px',
                                    borderRadius: '8px',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                }}
                            >
                                <span style={{
                                    fontSize: '11px',
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    background: `${statusColors[step.step] || '#667eea'}20`,
                                    color: statusColors[step.step] || '#667eea',
                                    fontWeight: '600',
                                    textTransform: 'uppercase',
                                    flexShrink: 0,
                                }}>
                                    {step.step}
                                </span>
                                <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
                                    {step.message}
                                </span>
                            </div>
                        ))}
                        {!['completed', 'failed'].includes(data.status) && (
                            <div style={{
                                padding: '12px 16px',
                                borderRadius: '8px',
                                background: 'rgba(102, 126, 234, 0.05)',
                                border: '1px solid rgba(102, 126, 234, 0.15)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                color: '#667eea',
                                fontSize: '14px',
                            }}>
                                <span style={{ animation: 'pulse 1.5s infinite' }}>●</span>
                                Working...
                            </div>
                        )}
                    </div>
                </div>

                {/* Report */}
                {data.report && (
                    <div style={{ marginBottom: '40px' }}>
                        <h3 style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: 'rgba(255,255,255,0.5)',
                            marginBottom: '16px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                        }}>
                            Report
                        </h3>
                        <div style={{
                            padding: '24px',
                            borderRadius: '12px',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            whiteSpace: 'pre-wrap',
                            lineHeight: '1.7',
                            fontSize: '15px',
                            color: 'rgba(255,255,255,0.85)',
                        }}>
                            {data.report.content}
                        </div>
                    </div>
                )}

                {/* Sources */}
                {data.sources.length > 0 && (
                    <div>
                        <h3 style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: 'rgba(255,255,255,0.5)',
                            marginBottom: '16px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                        }}>
                            Sources ({data.sources.length})
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {data.sources.map((source, i) => (
                                <a
                                    key={i}
                                    href={source.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        padding: '12px 16px',
                                        borderRadius: '8px',
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.06)',
                                        color: '#667eea',
                                        fontSize: '14px',
                                        textDecoration: 'none',
                                        display: 'block',
                                    }}
                                >
                                    {source.title}
                                    <span style={{
                                        display: 'block',
                                        fontSize: '12px',
                                        color: 'rgba(255,255,255,0.4)',
                                        marginTop: '4px',
                                    }}>
                                        {source.url}
                                    </span>
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.3; }
                }
            `}</style>
        </div>
    )
}
