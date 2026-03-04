'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { useState } from 'react'
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

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
        if (!isSupabaseReady) {
            toast.warning('Configurá Supabase en .env.local primero')
            return
        }
        if (!email || !password) return
        setLoading('email')

        try {
            const supabase = await getSupabase()
            if (mode === 'login') {
                const { error } = await supabase.auth.signInWithPassword({ email, password })
                if (error) throw error
                toast.success('¡Bienvenido de vuelta! 🏆')
                router.push('/dashboard')
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
                })
                if (error) throw error
                toast.success('¡Cuenta creada! Revisá tu email para confirmar.')
            }
        } catch (err) {
            toast.error((err as Error).message)
        } finally {
            setLoading(null)
        }
    }

    const handleGoogle = async () => {
        if (!isSupabaseReady) {
            toast.warning('Configurá Supabase en .env.local primero')
            return
        }
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
        <main className="min-h-screen bg-[#020617] flex items-center justify-center px-4 relative overflow-hidden">
            {/* BG glows */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-20 blur-3xl"
                    style={{ background: 'radial-gradient(ellipse, #39FF14, transparent)' }} />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full opacity-10 blur-3xl"
                    style={{ background: 'radial-gradient(ellipse, #f59e0b, transparent)' }} />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="w-full max-w-md relative z-10"
            >
                <div className="glass-card p-8 sm:p-10">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.15, type: 'spring', bounce: 0.5 }}
                            className="text-5xl mb-3"
                            style={{ filter: 'drop-shadow(0 0 20px rgba(57,255,20,0.6))' }}
                        >⚽</motion.div>
                        <h1 className="font-display text-3xl font-bold text-white">FANTASY</h1>
                        <p className="font-display text-xl text-[#39FF14] font-semibold tracking-widest"
                            style={{ textShadow: '0 0 20px rgba(57,255,20,0.6)' }}>
                            MUNDIAL 2026
                        </p>
                    </div>

                    {/* Mode tabs */}
                    <div className="flex bg-slate-800/60 rounded-xl p-1 mb-6">
                        {(['login', 'signup'] as const).map((m) => (
                            <button
                                key={m}
                                id={`tab-${m}`}
                                onClick={() => setMode(m)}
                                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${mode === m
                                        ? 'bg-[#39FF14] text-black shadow'
                                        : 'text-slate-400 hover:text-white'
                                    }`}
                            >
                                {m === 'login' ? 'Iniciar sesión' : 'Registrarse'}
                            </button>
                        ))}
                    </div>

                    {/* Supabase warning */}
                    {!isSupabaseReady && (
                        <div className="mb-5 p-3 rounded-xl bg-amber-900/20 border border-amber-700/30 text-amber-400 text-xs text-center">
                            ⚙️ Configurá Supabase en <code className="font-mono">.env.local</code> para activar el login
                        </div>
                    )}

                    {/* Email form */}
                    <form onSubmit={handleEmailAuth} className="space-y-4">
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <Input
                                id="input-email"
                                type="email"
                                placeholder="tu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-10 h-12 bg-slate-800/60 border-slate-700 text-white placeholder:text-slate-500 focus:border-[#39FF14] focus:ring-[#39FF14]/20 rounded-xl"
                                required
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <Input
                                id="input-password"
                                type={showPass ? 'text' : 'password'}
                                placeholder="Contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-10 pr-10 h-12 bg-slate-800/60 border-slate-700 text-white placeholder:text-slate-500 focus:border-[#39FF14] focus:ring-[#39FF14]/20 rounded-xl"
                                required
                                minLength={6}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass(!showPass)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                            >
                                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>

                        <Button
                            id="btn-email-auth"
                            type="submit"
                            disabled={loading !== null}
                            className="w-full h-12 bg-[#39FF14] hover:bg-[#39FF14]/90 text-black font-bold text-base rounded-xl transition-all shadow-[0_0_20px_rgba(57,255,20,0.3)] hover:shadow-[0_0_30px_rgba(57,255,20,0.6)] disabled:opacity-60"
                        >
                            {loading === 'email' ? (
                                <div className="w-5 h-5 border-2 border-black/40 border-t-black rounded-full animate-spin" />
                            ) : (
                                <span className="flex items-center gap-2">
                                    {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
                                    <ArrowRight className="w-4 h-4" />
                                </span>
                            )}
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="my-5 flex items-center gap-3">
                        <div className="flex-1 h-px bg-slate-700" />
                        <span className="text-slate-500 text-xs">o continuar con</span>
                        <div className="flex-1 h-px bg-slate-700" />
                    </div>

                    {/* Google */}
                    <Button
                        id="btn-google"
                        type="button"
                        onClick={handleGoogle}
                        disabled={loading !== null}
                        className="w-full h-12 bg-white hover:bg-slate-100 text-gray-900 font-semibold text-sm rounded-xl flex items-center gap-3 justify-center disabled:opacity-60"
                    >
                        {loading === 'google' ? (
                            <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-900 rounded-full animate-spin" />
                        ) : (
                            <svg viewBox="0 0 24 24" className="w-5 h-5"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                        )}
                        Google
                    </Button>

                    <p className="text-center text-slate-600 text-xs mt-5">
                        Al continuar aceptás nuestros Términos y Política de Privacidad.
                    </p>
                </div>

                <p className="text-center mt-5 text-slate-500 text-sm">
                    <a href="/" className="hover:text-[#39FF14] transition-colors">← Volver al inicio</a>
                </p>
            </motion.div>
        </main>
    )
}
