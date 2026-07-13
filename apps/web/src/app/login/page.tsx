'use client'

import { useState, useRef, useCallback } from 'react'
import { signIn, signUp } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
    const router = useRouter()
    const [isLogin, setIsLogin] = useState(true)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    // Background zoom state
    const bgRef = useRef<HTMLDivElement>(null)
    const [bgTransform, setBgTransform] = useState('scale(1.05)')

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!bgRef.current) return
        const rect = bgRef.current.getBoundingClientRect()
        // Get mouse position as percentage (0 to 1)
        const x = (e.clientX - rect.left) / rect.width
        const y = (e.clientY - rect.top) / rect.height
        // Translate the background slightly based on mouse position
        // This creates a subtle parallax / zoom-follow effect
        const moveX = (x - 0.5) * -20 // shift up to 20px
        const moveY = (y - 0.5) * -20
        setBgTransform(`scale(1.15) translate(${moveX}px, ${moveY}px)`)
    }, [])

    const handleMouseLeave = useCallback(() => {
        setBgTransform('scale(1.05)')
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            if (isLogin) {
                const result = await signIn.email({ email, password })
                if (result.error) {
                    setError(result.error.message || 'Login failed')
                } else {
                    router.push('/dashboard')
                }
            } else {
                const result = await signUp.email({ email, password, name })
                if (result.error) {
                    setError(result.error.message || 'Registration failed')
                } else {
                    router.push('/dashboard')
                }
            }
        } catch (err) {
            setError('Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleLogin = async () => {
        await signIn.social({
            provider: 'google',
            callbackURL: typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : 'http://localhost:3000/dashboard',
        })
    }

    const handleGithubLogin = async () => {
        await signIn.social({
            provider: 'github',
            callbackURL: typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : 'http://localhost:3000/dashboard',
        })
    }

    return (
        <div
            ref={bgRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'system-ui, sans-serif',
                position: 'relative',
                overflow: 'hidden',
                background: '#000',
            }}
        >
            {/* Galaxy Background Image */}
            <div style={{
                position: 'absolute',
                inset: '-40px',
                backgroundImage: 'url(/milkyway-bg.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transform: bgTransform,
                transition: 'transform 0.4s ease-out',
                zIndex: 0,
            }} />
            {/* Dark overlay for readability */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)',
                zIndex: 1,
            }} />
            <div style={{
                width: '100%',
                maxWidth: '420px',
                padding: '40px',
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
                position: 'relative',
                zIndex: 2,
            }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h1 style={{
                        fontSize: '28px',
                        fontWeight: '700',
                        color: '#ffffff',
                        margin: '0 0 8px 0',
                    }}>
                        ResearchOS
                    </h1>
                    <p style={{
                        fontSize: '14px',
                        color: 'rgba(255, 255, 255, 0.5)',
                        margin: 0,
                    }}>
                        {isLogin ? 'Welcome back' : 'Create your account'}
                    </p>
                </div>

                {/* Social Login Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                    <button
                        onClick={handleGoogleLogin}
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '10px',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            background: 'rgba(255, 255, 255, 0.05)',
                            color: '#ffffff',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            transition: 'all 0.2s',
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                    >
                        <svg width="18" height="18" viewBox="0 0 18 18">
                            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
                            <path fill="#34A853" d="M9.003 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009.003 18z" />
                            <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
                            <path fill="#EA4335" d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.428 0 9.002 0A8.997 8.997 0 00.957 4.958L3.964 7.29c.708-2.127 2.692-3.71 5.036-3.71z" />
                        </svg>
                        Continue with Google
                    </button>

                    <button
                        onClick={handleGithubLogin}
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '10px',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            background: 'rgba(255, 255, 255, 0.05)',
                            color: '#ffffff',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            transition: 'all 0.2s',
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                        </svg>
                        Continue with GitHub
                    </button>
                </div>

                {/* Divider */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '24px',
                }}>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
                    <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.3)' }}>OR</span>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
                </div>

                {/* Email/Password Form */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {!isLogin && (
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '10px',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: '#ffffff',
                                fontSize: '14px',
                                outline: 'none',
                                boxSizing: 'border-box',
                            }}
                        />
                    )}
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            borderRadius: '10px',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            background: 'rgba(255, 255, 255, 0.05)',
                            color: '#ffffff',
                            fontSize: '14px',
                            outline: 'none',
                            boxSizing: 'border-box',
                        }}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            borderRadius: '10px',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            background: 'rgba(255, 255, 255, 0.05)',
                            color: '#ffffff',
                            fontSize: '14px',
                            outline: 'none',
                            boxSizing: 'border-box',
                        }}
                    />

                    {error && (
                        <p style={{
                            color: '#ef4444',
                            fontSize: '13px',
                            margin: 0,
                            textAlign: 'center',
                        }}>
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '10px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: '#ffffff',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1,
                            transition: 'all 0.2s',
                        }}
                    >
                        {loading ? '...' : isLogin ? 'Sign In' : 'Create Account'}
                    </button>
                </form>

                {/* Toggle */}
                <p style={{
                    textAlign: 'center',
                    fontSize: '13px',
                    color: 'rgba(255, 255, 255, 0.4)',
                    marginTop: '24px',
                }}>
                    {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
                    <span
                        onClick={() => { setIsLogin(!isLogin); setError('') }}
                        style={{
                            color: '#667eea',
                            cursor: 'pointer',
                            fontWeight: '500',
                        }}
                    >
                        {isLogin ? 'Sign Up' : 'Sign In'}
                    </span>
                </p>
            </div>
        </div>
    )
}
