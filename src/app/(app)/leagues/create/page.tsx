'use client'
/**
 * /leagues/create — Form to create a new league
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Lock, Globe, Loader2, CheckCircle2, Copy } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useLeagueStore, generateLeagueCode } from '@/store/leagueStore'
import type { League, LeagueType } from '@/types'
import Link from 'next/link'

export default function CreateLeaguePage() {
    const router = useRouter()
    const { addLeague } = useLeagueStore()

    const [name, setName] = useState('')
    const [type, setType] = useState<LeagueType>('private')
    const [status, setStatus] = useState<'idle' | 'creating' | 'done'>('idle')
    const [createdCode, setCreatedCode] = useState('')
    const [createdId, setCreatedId] = useState('')

    const isValid = name.trim().length >= 3

    const handleCreate = async () => {
        if (!isValid) return
        setStatus('creating')

        try {
            const code = generateLeagueCode()
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
            const isSupabaseReady = supabaseUrl?.startsWith('http')

            let newLeague: League

            if (isSupabaseReady) {
                const { createClient } = await import('@/lib/supabase/client')
                const supabase = createClient()

                const { data: { user } } = await supabase.auth.getUser()
                if (!user) throw new Error('Not authenticated')

                // ── Ensure profile exists (may not if trigger failed) ─────
                const { error: profileErr } = await supabase
                    .from('profiles')
                    .upsert(
                        {
                            id: user.id,
                            username: user.email?.split('@')[0] ?? `user_${user.id.slice(0, 6)}`,
                        },
                        { onConflict: 'id', ignoreDuplicates: true }
                    )
                if (profileErr) console.warn('[Profile upsert]', profileErr.message)

                // ── Create the league (no member limit = 9999) ────────────
                const { data, error } = await supabase
                    .from('leagues')
                    .insert({
                        name: name.trim(),
                        type,
                        invite_code: code,
                        created_by: user.id,
                        max_members: 9999, // effectively unlimited
                    })
                    .select()
                    .single()

                if (error) throw error

                // ── Auto-join as first member ─────────────────────────────
                const { error: joinErr } = await supabase
                    .from('league_members')
                    .insert({ league_id: data.id, user_id: user.id })
                if (joinErr) console.warn('[Auto-join]', joinErr.message)

                newLeague = data as League
            } else {
                // Dev fallback
                await new Promise((r) => setTimeout(r, 700))
                newLeague = {
                    id: `league-${Date.now()}`,
                    name: name.trim(),
                    type,
                    invite_code: code,
                    created_by: 'local-user',
                    max_members: 9999,
                    member_count: 1,
                    created_at: new Date().toISOString(),
                }
            }

            addLeague(newLeague)
            setCreatedCode(newLeague.invite_code)
            setCreatedId(newLeague.id)
            setStatus('done')
        } catch (err) {
            console.error('[CreateLeague]', err)
            toast.error('Error al crear la liga: ' + (err as Error).message)
            setStatus('idle')
        }
    }

    const copyCode = () => {
        navigator.clipboard.writeText(createdCode)
        toast.success('¡Código copiado!')
    }

    const shareCode = () => {
        const text = `¡Unite a mi liga de Fantasy Mundial 2026!\n🔑 Código: ${createdCode}\n👉 ${window.location.origin}/login`
        if (navigator.share) {
            navigator.share({ title: 'Fantasy Mundial 2026', text, url: window.location.origin + '/login' })
        } else {
            copyCode()
        }
    }

    if (status === 'done') {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', bounce: 0.4 }}
                    className="glass-card p-8 text-center max-w-sm w-full space-y-6"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', bounce: 0.6 }}
                        className="w-20 h-20 rounded-full bg-[#39FF14]/10 border-2 border-[#39FF14] flex items-center justify-center mx-auto"
                    >
                        <CheckCircle2 className="w-10 h-10 text-[#39FF14]" />
                    </motion.div>

                    <div>
                        <h2 className="font-display text-2xl font-bold text-white">¡Liga creada!</h2>
                        <p className="text-slate-400 text-sm mt-1">Compartí este código para invitar amigos — sin límite de participantes</p>
                    </div>

                    {/* Invite code */}
                    <div className="bg-slate-800/80 rounded-2xl p-5 border border-[#39FF14]/20 space-y-2">
                        <p className="text-slate-500 text-xs uppercase tracking-widest">Código de invitación</p>
                        <p className="font-display text-4xl font-bold text-[#39FF14] tracking-[0.3em]">
                            {createdCode}
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            onClick={copyCode}
                            variant="outline"
                            id="copy-code-btn"
                            className="flex-1 border-slate-700 text-slate-300 hover:border-[#39FF14]/40 gap-2"
                        >
                            <Copy className="w-4 h-4" /> Copiar
                        </Button>
                        <Button
                            onClick={shareCode}
                            className="flex-1 bg-[#39FF14] text-black font-bold hover:bg-[#39FF14]/90"
                            id="share-code-btn"
                        >
                            Compartir 🚀
                        </Button>
                    </div>

                    <Link href="/leagues">
                        <Button variant="ghost" className="w-full text-slate-400 hover:text-white">
                            Ver mis ligas
                        </Button>
                    </Link>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen px-4 py-6 max-w-lg mx-auto space-y-6 pb-28">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Link href="/leagues">
                    <button className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors">
                        <ArrowLeft className="w-4 h-4 text-slate-300" />
                    </button>
                </Link>
                <h1 className="font-display text-2xl font-bold text-white">Crear Liga</h1>
            </div>

            {/* Form */}
            <div className="space-y-5">
                {/* League name */}
                <div className="space-y-2">
                    <label className="text-slate-300 text-sm font-semibold">Nombre de la liga</label>
                    <Input
                        id="league-name-input"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ej: Los Cracks del Barrio 🏆"
                        maxLength={40}
                        className="h-12 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-[#39FF14] rounded-xl"
                    />
                    <p className="text-slate-600 text-xs text-right">{name.length}/40</p>
                </div>

                {/* Type toggle */}
                <div className="space-y-2">
                    <label className="text-slate-300 text-sm font-semibold">Tipo de liga</label>
                    <div className="grid grid-cols-2 gap-3">
                        {(['private', 'public'] as LeagueType[]).map((t) => {
                            const isActive = type === t
                            return (
                                <motion.button
                                    key={t}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => setType(t)}
                                    id={`league-type-${t}`}
                                    className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all duration-200 ${isActive
                                        ? 'border-[#39FF14] bg-[#39FF14]/5 shadow-[0_0_12px_rgba(57,255,20,0.2)]'
                                        : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                                        }`}
                                >
                                    {t === 'private'
                                        ? <Lock className={`w-6 h-6 ${isActive ? 'text-[#39FF14]' : 'text-slate-500'}`} />
                                        : <Globe className={`w-6 h-6 ${isActive ? 'text-[#39FF14]' : 'text-slate-500'}`} />
                                    }
                                    <span className={`font-semibold text-sm ${isActive ? 'text-white' : 'text-slate-400'}`}>
                                        {t === 'private' ? 'Privada 🔒' : 'Pública 🌍'}
                                    </span>
                                    <span className="text-slate-600 text-xs text-center">
                                        {t === 'private' ? 'Solo por código — sin límite' : 'Cualquiera puede unirse'}
                                    </span>
                                </motion.button>
                            )
                        })}
                    </div>
                </div>

                {/* Info box */}
                <div className="glass-card p-4 flex items-start gap-3 border border-slate-700/50">
                    <span className="text-lg">⚽</span>
                    <p className="text-slate-400 text-xs leading-relaxed">
                        Las ligas no tienen límite de participantes. Invitá a todos tus amigos con el código que te damos al crear la liga.
                    </p>
                </div>
            </div>

            {/* Create CTA */}
            <Button
                id="create-league-submit"
                onClick={handleCreate}
                disabled={!isValid || status === 'creating'}
                className={`w-full h-12 font-bold text-base rounded-xl gap-2 transition-all ${isValid
                    ? 'bg-[#39FF14] text-black hover:bg-[#39FF14]/90 shadow-[0_0_20px_rgba(57,255,20,0.3)]'
                    : 'bg-slate-700 text-slate-500'
                    }`}
            >
                {status === 'creating'
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Creando liga…</>
                    : '🏆 Crear Liga'
                }
            </Button>
        </div>
    )
}
