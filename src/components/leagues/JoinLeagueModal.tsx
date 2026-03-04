'use client'
/**
 * JoinLeagueModal — slide-up modal to join a league via 6-char invite code
 * Tries Supabase first, falls back to local store for dev
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Hash, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useLeagueStore } from '@/store/leagueStore'
import { toast } from 'sonner'
import type { League } from '@/types'

interface JoinLeagueModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function JoinLeagueModal({ isOpen, onClose }: JoinLeagueModalProps) {
    const [code, setCode] = useState('')
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [errorMsg, setErrorMsg] = useState('')
    const { addLeague, leagues } = useLeagueStore()

    const handleJoin = async () => {
        const clean = code.toUpperCase().trim()
        if (clean.length !== 6) {
            setErrorMsg('El código debe tener 6 caracteres')
            setStatus('error')
            return
        }

        // Check if already in this league
        if (leagues.some((l) => l.invite_code === clean)) {
            setErrorMsg('Ya sos miembro de esta liga')
            setStatus('error')
            return
        }

        setStatus('loading')
        setErrorMsg('')

        try {
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
            const isSupabaseReady = supabaseUrl?.startsWith('http')

            if (isSupabaseReady) {
                const { createClient } = await import('@/lib/supabase/client')
                const supabase = createClient()

                // Find the league by invite code
                const { data: league, error } = await supabase
                    .from('leagues')
                    .select('*')
                    .eq('invite_code', clean)
                    .single()

                if (error || !league) {
                    setStatus('error')
                    setErrorMsg('Código inválido o liga no encontrada')
                    return
                }

                // Join the league
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) throw new Error('Not authenticated')

                const { error: joinErr } = await supabase
                    .from('league_members')
                    .insert({ league_id: league.id, user_id: user.id })

                if (joinErr) {
                    setStatus('error')
                    setErrorMsg('No se pudo unir a la liga')
                    return
                }

                addLeague(league as League)
            } else {
                // Dev fallback — simulate finding a league
                await new Promise((r) => setTimeout(r, 800))
                const mockLeague: League = {
                    id: `league-${clean}`,
                    name: `Liga ${clean}`,
                    type: 'private',
                    invite_code: clean,
                    created_by: 'other-user',
                    max_members: 20,
                    member_count: 5,
                    created_at: new Date().toISOString(),
                }
                addLeague(mockLeague)
            }

            setStatus('success')
            toast.success('¡Te uniste a la liga! 🏆')
            setTimeout(() => {
                onClose()
                setCode('')
                setStatus('idle')
            }, 1200)
        } catch (err) {
            setStatus('error')
            setErrorMsg('Error de conexión. Intentá de nuevo.')
        }
    }

    const handleCodeChange = (val: string) => {
        const clean = val.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
        setCode(clean)
        if (status === 'error') setStatus('idle')
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                        onClick={onClose}
                    />

                    <motion.div
                        key="modal"
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden"
                        style={{ background: 'rgba(15,23,42,0.98)', borderTop: '1px solid rgba(57,255,20,0.2)' }}
                    >
                        {/* Handle */}
                        <div className="flex justify-center pt-3">
                            <div className="w-10 h-1 rounded-full bg-slate-700" />
                        </div>

                        <div className="px-6 py-6 space-y-6">
                            {/* Header */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-display text-2xl font-bold text-white">Unirme a Liga</h3>
                                    <p className="text-slate-400 text-sm mt-0.5">Ingresá el código de invitación</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center"
                                >
                                    <X className="w-4 h-4 text-slate-400" />
                                </button>
                            </div>

                            {/* Code input */}
                            <div className="space-y-3">
                                <div className="relative">
                                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <Input
                                        id="league-code-input"
                                        value={code}
                                        onChange={(e) => handleCodeChange(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                                        placeholder="ABC123"
                                        maxLength={6}
                                        className="pl-12 h-14 text-center text-2xl font-display font-bold tracking-[0.3em] bg-slate-800 border-slate-700 text-white placeholder:text-slate-600 focus:border-[#39FF14] rounded-xl uppercase"
                                    />
                                </div>

                                {/* Character dots */}
                                <div className="flex justify-center gap-2">
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="w-8 h-8 rounded-lg border flex items-center justify-center font-display font-bold text-sm transition-all"
                                            style={{
                                                borderColor: code[i] ? '#39FF14' : 'rgba(100,116,139,0.4)',
                                                color: code[i] ? '#39FF14' : 'transparent',
                                                background: code[i] ? 'rgba(57,255,20,0.08)' : 'transparent',
                                            }}
                                        >
                                            {code[i] ?? '·'}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Error message */}
                            <AnimatePresence>
                                {status === 'error' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="flex items-center gap-2 text-red-400 text-sm"
                                    >
                                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                        <span>{errorMsg}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* CTA */}
                            <Button
                                id="join-league-submit"
                                onClick={handleJoin}
                                disabled={code.length < 6 || status === 'loading' || status === 'success'}
                                className="w-full h-12 font-bold text-base rounded-xl gap-2 bg-[#39FF14] text-black hover:bg-[#39FF14]/90 disabled:bg-slate-700 disabled:text-slate-500 shadow-[0_0_20px_rgba(57,255,20,0.3)]"
                            >
                                {status === 'loading' && <Loader2 className="w-4 h-4 animate-spin" />}
                                {status === 'success' && <CheckCircle2 className="w-4 h-4" />}
                                {status === 'idle' && '¡Unirme!'}
                                {status === 'loading' && 'Buscando liga…'}
                                {status === 'success' && '¡Listo!'}
                                {status === 'error' && '¡Unirme!'}
                            </Button>

                            <p className="text-slate-600 text-xs text-center pb-2">
                                Pedile el código al organizador de la liga
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
