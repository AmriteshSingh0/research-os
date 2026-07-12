'use client'

import { useSession } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
    const { data: session, isPending } = useSession()
    const router = useRouter()

    useEffect(() => {
        if (!isPending) {
            if (session) {
                router.replace('/dashboard')
            } else {
                router.replace('/login')
            }
        }
    }, [session, isPending, router])

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
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px',
            }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    border: '3px solid rgba(255,255,255,0.1)',
                    borderTop: '3px solid #667eea',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                }} />
                <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.05em' }}>
                    REDIRECTING...
                </span>
            </div>
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    )
}
