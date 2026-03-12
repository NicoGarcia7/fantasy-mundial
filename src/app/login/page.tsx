'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

type AuthMode = 'login' | 'signup'

const isSupabaseReady =
    typeof process.env.NEXT_PUBLIC_SUPABASE_URL === 'string' &&
    process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('http')

export default function LoginPage() {
    const router = useRouter()
    const [mode, setMode] = useState<AuthMode>('login')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPass, setShowPass] = useState(false)
    const [loading, setLoading] = useState<'email' | 'google' | null>(null)

    const getSupabase = async () => {
        const { createClient } = await import('@/lib/supabase/client')
        return createClient()
    }

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!isSupabaseReady) { toast.warning('Configurá Supabase en .env.local'); return }
        if (!email || !password) return
        setLoading('email')
        try {
            const supabase = await getSupabase()
            if (mode === 'login') {
                const { error } = await supabase.auth.signInWithPassword({ email, password })
                if (error) throw error
                toast.success('¡Bienvenido de vuelta!')
                router.push('/dashboard')
            } else {
                const { error } = await supabase.auth.signUp({
                    email, password,
                    options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
                })
                if (error) throw error
                toast.success('¡Cuenta creada! Iniciá sesión.')
                setMode('login')
            }
        } catch (err) {
            toast.error((err as Error).message)
        } finally {
            setLoading(null)
        }
    }

    const handleGoogle = async () => {
        if (!isSupabaseReady) { toast.warning('Configurá Supabase'); return }
        setLoading('google')
        try {
            const supabase = await getSupabase()
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: `${window.location.origin}/auth/callback` },
            })
            if (error) throw error
        } catch (err) {
            toast.error((err as Error).message)
            setLoading(null)
        }
    }

    return (
        <main
            className="min-h-screen flex flex-col"
            style={{ background: 'var(--bg)' }}
        >
            {/* ── Top gold bar ─── */}
            <div className="h-1 w-full" style={{ background: 'var(--gold)' }} />

            {/* ── Header ─── */}
            <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="w-full max-w-sm"
                >
                    {/* Brand */}
                    <div className="text-center mb-10">
                        <div className="text-5xl mb-4">⚽</div>
                        <h1
                            className="font-display text-4xl font-bold tracking-widest text-white"
                        >
                            FANTASY
                        </h1>
                        <p
                            className="font-display text-2xl font-bold tracking-widest"
                            style={{ color: 'var(--gold)' }}
                        >
                            MUNDIAL 2026
                        </p>
                        <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                            El fantasy del Mundial más competitivo
                        </p>
                    </div>

                    {/* Card */}
                    <div
                        className="rounded-sm overflow-hidden"
                        style={{
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            borderTop: '2px solid var(--gold)',
                        }}
                    >
                        {/* Mode tabs */}
                        <div className="grid grid-cols-2" style={{ borderBottom: '1px solid var(--border)' }}>
                            {(['login', 'signup'] as const).map((m) => (
                                <button
                                    key={m}
                                    id={`tab-${m}`}
                                    onClick={() => setMode(m)}
                                    className="py-3 text-xs font-bold uppercase tracking-widest font-display transition-colors"
                                    style={{
                                        background: mode === m ? 'var(--gold)' : 'transparent',
                                        color: mode === m ? '#000' : 'var(--text-muted)',
                                        borderBottom: mode === m ? 'none' : undefined,
                                    }}
                                >
                                    {m === 'login' ? 'Iniciar sesión' : 'Registrarse'}
                                </button>
                            ))}
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Supabase warning */}
                            {!isSupabaseReady && (
                                <div
                                    className="p-3 rounded text-xs text-center"
                                    style={{ background: 'rgba(201,168,68,0.08)', border: '1px solid rgba(201,168,68,0.2)', color: 'var(--gold)' }}
                                >
                                    ⚙️ Configurá Supabase en <code>.env.local</code>
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={handleEmailAuth} className="space-y-3">
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                                    <input
                                        id="input-email"
                                        type="email"
                                        placeholder="tu@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full h-11 pl-10 pr-3 text-sm rounded-sm outline-none transition-all"
                                        style={{
                                            background: 'var(--surface-2)',
                                            border: '1px solid var(--border)',
                                            color: 'var(--text)',
                                        }}
                                        onFocus={(e) => e.currentTarget.style.borderColor = 'var(--gold)'}
                                        onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                                    />
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                                    <input
                                        id="input-password"
                                        type={showPass ? 'text' : 'password'}
                                        placeholder="Contraseña"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={6}
                                        className="w-full h-11 pl-10 pr-10 text-sm rounded-sm outline-none transition-all"
                                        style={{
                                            background: 'var(--surface-2)',
                                            border: '1px solid var(--border)',
                                            color: 'var(--text)',
                                        }}
                                        onFocus={(e) => e.currentTarget.style.borderColor = 'var(--gold)'}
                                        onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPass(!showPass)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2"
                                        style={{ color: 'var(--text-muted)' }}
                                    >
                                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>

                                <button
                                    id="btn-email-auth"
                                    type="submit"
                                    disabled={loading !== null}
                                    className="btn-gold w-full h-11 flex items-center justify-center gap-2 disabled:opacity-60"
                                >
                                    {loading === 'email' ? (
                                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Divider */}
                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                                <span className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-subtle)' }}>
                                    o continuar con
                                </span>
                                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                            </div>

                            {/* Google */}
                            <button
                                id="btn-google"
                                type="button"
                                onClick={handleGoogle}
                                disabled={loading !== null}
                                className="w-full h-11 rounded-sm flex items-center justify-center gap-3 text-sm font-semibold transition-colors disabled:opacity-60"
                                style={{ background: '#fff', color: '#111' }}
                            >
                                {loading === 'google' ? (
                                    <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <svg viewBox="0 0 24 24" className="w-4 h-4">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                        </svg>
                                        Google
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <p className="text-center mt-5 text-xs" style={{ color: 'var(--text-subtle)' }}>
                        <a href="/" className="hover:underline" style={{ color: 'var(--text-muted)' }}>
                            ← Volver al inicio
                        </a>
                    </p>
                </motion.div>
            </div>

            {/* ── Bottom gold bar ─── */}
            <div className="h-1 w-full" style={{ background: 'var(--gold)' }} />
        </main>
    )
}
