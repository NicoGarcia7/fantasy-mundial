'use client'
/**
 * Profile page — real Supabase user data, avatar picker, invite system, logout
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, Share2, Trophy, Zap, Star, Copy, Pencil, Check, ChevronRight, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import Link from 'next/link'
import { useDraftStore } from '@/store/draftStore'
import { useLeagueStore } from '@/store/leagueStore'

// ── Avatar options ─────────────────────────────────────────────
const AVATARS = [
    { id: 'ball', emoji: '⚽', label: 'Pelota' },
    { id: 'trophy', emoji: '🏆', label: 'Trofeo' },
    { id: 'fire', emoji: '🔥', label: 'Fuego' },
    { id: 'star', emoji: '⭐', label: 'Estrella' },
    { id: 'lion', emoji: '🦁', label: 'León' },
    { id: 'eagle', emoji: '🦅', label: 'Águila' },
    { id: 'bolt', emoji: '⚡', label: 'Rayo' },
    { id: 'crown', emoji: '👑', label: 'Corona' },
    { id: 'rocket', emoji: '🚀', label: 'Cohete' },
    { id: 'wolf', emoji: '🐺', label: 'Lobo' },
    { id: 'dragon', emoji: '🐉', label: 'Dragón' },
    { id: 'shield', emoji: '🛡️', label: 'Escudo' },
]

const TEAM_FLAGS: { code: string; flag: string; name: string }[] = [
    { code: 'ARG', flag: '🇦🇷', name: 'Argentina' },
    { code: 'BRA', flag: '🇧🇷', name: 'Brasil' },
    { code: 'FRA', flag: '🇫🇷', name: 'Francia' },
    { code: 'ESP', flag: '🇪🇸', name: 'España' },
    { code: 'ENG', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', name: 'Inglaterra' },
    { code: 'GER', flag: '🇩🇪', name: 'Alemania' },
    { code: 'POR', flag: '🇵🇹', name: 'Portugal' },
    { code: 'NED', flag: '🇳🇱', name: 'Países Bajos' },
    { code: 'URU', flag: '🇺🇾', name: 'Uruguay' },
    { code: 'MOR', flag: '🇲🇦', name: 'Marruecos' },
    { code: 'MEX', flag: '🇲🇽', name: 'México' },
    { code: 'USA', flag: '🇺🇸', name: 'Estados Unidos' },
    { code: 'COL', flag: '🇨🇴', name: 'Colombia' },
    { code: 'SEN', flag: '🇸🇳', name: 'Senegal' },
    { code: 'JPN', flag: '🇯🇵', name: 'Japón' },
    { code: 'KOR', flag: '🇰🇷', name: 'Corea del Sur' },
]

export default function ProfilePage() {
    const { teamName, squad, bench, budgetUsed } = useDraftStore()
    const { leagues } = useLeagueStore()

    const [user, setUser] = useState<{ email: string; id: string } | null>(null)
    const [avatarId, setAvatarId] = useState('ball')
    const [favoriteTeam, setFavoriteTeam] = useState('ARG')
    const [username, setUsername] = useState('Crack del Fantasy')
    const [editingName, setEditingName] = useState(false)
    const [nameInput, setNameInput] = useState(username)
    const [showAvatarPicker, setShowAvatarPicker] = useState(false)
    const [showTeamPicker, setShowTeamPicker] = useState(false)

    const filledPlayers = [...squad, ...bench].filter(Boolean).length
    const totalPoints = 0 // Will be real from Supabase in live phase
    const inviteCode = 'VIP' + (user?.id?.slice(0, 3).toUpperCase() ?? 'XXX')
    const inviteLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/login?ref=${inviteCode}`

    const avatar = AVATARS.find((a) => a.id === avatarId) ?? AVATARS[0]
    const favTeam = TEAM_FLAGS.find((t) => t.code === favoriteTeam) ?? TEAM_FLAGS[0]

    // Load Supabase user
    useEffect(() => {
        async function load() {
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
            if (!supabaseUrl?.startsWith('http')) return
            const { createClient } = await import('@/lib/supabase/client')
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setUser({ email: user.email ?? '', id: user.id })
                setUsername(user.email?.split('@')[0] ?? 'Crack del Fantasy')
            }
        }
        load()
    }, [])

    const handleLogout = async () => {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        if (supabaseUrl?.startsWith('http')) {
            const { createClient } = await import('@/lib/supabase/client')
            const supabase = createClient()
            await supabase.auth.signOut()
            window.location.href = '/login'
        } else {
            toast.info('Logout funciona cuando Supabase está activo')
        }
    }

    const copyInvite = () => {
        navigator.clipboard.writeText(inviteLink)
        toast.success('¡Link copiado!')
    }

    const share = () => {
        const text = `¡Jugá Fantasy Mundial 2026 conmigo!\n🔑 Código: ${inviteCode}\n👉 ${inviteLink}`
        if (navigator.share) {
            navigator.share({ title: 'Fantasy Mundial 2026', text, url: inviteLink })
        } else copyInvite()
    }

    return (
        <div className="min-h-screen px-4 py-6 max-w-lg mx-auto space-y-5 pb-28">

            {/* ── Profile card ─────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6 text-center space-y-3 relative"
            >
                {/* Avatar */}
                <div className="relative inline-block">
                    <motion.button
                        whileTap={{ scale: 0.93 }}
                        onClick={() => setShowAvatarPicker(true)}
                        id="avatar-picker-btn"
                        className="w-20 h-20 rounded-full flex items-center justify-center text-4xl border-2 border-[#39FF14]/50 hover:border-[#39FF14] transition-colors"
                        style={{ background: 'radial-gradient(circle, rgba(57,255,20,0.15), rgba(0,207,255,0.1))' }}
                    >
                        {avatar.emoji}
                    </motion.button>
                    <button
                        onClick={() => setShowAvatarPicker(true)}
                        className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#39FF14] flex items-center justify-center"
                    >
                        <Pencil className="w-3 h-3 text-black" />
                    </button>
                </div>

                {/* Username */}
                {editingName ? (
                    <div className="flex items-center gap-2 justify-center">
                        <Input
                            value={nameInput}
                            onChange={(e) => setNameInput(e.target.value)}
                            onBlur={() => { setUsername(nameInput || username); setEditingName(false) }}
                            onKeyDown={(e) => e.key === 'Enter' && (setUsername(nameInput || username), setEditingName(false))}
                            className="h-9 bg-slate-800 border-[#39FF14]/40 text-white font-bold text-center w-48 rounded-xl"
                            autoFocus
                            maxLength={20}
                            id="username-input"
                        />
                        <button onClick={() => { setUsername(nameInput || username); setEditingName(false) }}>
                            <Check className="w-4 h-4 text-[#39FF14]" />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => { setEditingName(true); setNameInput(username) }}
                        className="flex items-center gap-1.5 mx-auto group"
                    >
                        <h1 className="font-display text-2xl font-bold text-white group-hover:text-[#39FF14] transition-colors">
                            {username}
                        </h1>
                        <Pencil className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#39FF14] transition-colors" />
                    </button>
                )}

                {/* Email */}
                {user?.email && (
                    <p className="text-slate-500 text-xs">{user.email}</p>
                )}

                {/* Favorite team */}
                <button
                    onClick={() => setShowTeamPicker(true)}
                    id="favorite-team-btn"
                    className="flex items-center gap-2 mx-auto px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 hover:border-slate-500 transition-colors group"
                >
                    <span className="text-base">{favTeam.flag}</span>
                    <span className="text-slate-300 text-xs font-medium group-hover:text-white transition-colors">{favTeam.name}</span>
                    <Pencil className="w-3 h-3 text-slate-600 group-hover:text-slate-400 transition-colors" />
                </button>
            </motion.div>

            {/* ── Stats grid ───────────────────────────────── */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: 'Puntos', value: String(totalPoints), icon: '🏆', color: '#f59e0b' },
                    { label: 'Ligas', value: String(leagues.length), icon: '👥', color: '#00CFFF' },
                    { label: 'Jugadores', value: `${filledPlayers}/15`, icon: '⚽', color: '#39FF14' },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.07 }}
                        className="glass-card p-4 text-center"
                    >
                        <span className="text-2xl">{stat.icon}</span>
                        <p className="font-display text-2xl font-bold mt-1" style={{ color: stat.color }}>{stat.value}</p>
                        <p className="text-slate-500 text-xs">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* ── Mi Equipo quick link ──────────────────────── */}
            <Link href="/draft">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="glass-card p-4 flex items-center gap-4 group cursor-pointer hover:border-[#39FF14]/30 border border-transparent transition-all"
                >
                    <div className="w-12 h-12 rounded-xl bg-[#39FF14]/10 border border-[#39FF14]/20 flex items-center justify-center text-2xl">⚽</div>
                    <div className="flex-1">
                        <p className="text-white font-semibold">{teamName}</p>
                        <p className="text-slate-500 text-xs">{filledPlayers}/15 jugadores · ${budgetUsed.toFixed(1)}M gastados</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-[#39FF14] transition-colors" />
                </motion.div>
            </Link>

            {/* ── Invite section ───────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card p-5 border border-[#39FF14]/15 space-y-3"
            >
                <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-[#39FF14]" />
                    <h2 className="text-white font-semibold text-sm">Mi Código de Invitación</h2>
                </div>

                <div className="bg-slate-900 rounded-xl p-3 flex items-center justify-between border border-slate-700">
                    <div>
                        <p className="text-slate-500 text-[10px] uppercase tracking-widest">Código</p>
                        <p className="font-display text-2xl font-bold text-[#39FF14] tracking-[0.2em]">{inviteCode}</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={copyInvite}
                            id="profile-copy-invite"
                            className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center hover:border-[#39FF14]/40 transition-colors"
                        >
                            <Copy className="w-4 h-4 text-slate-300" />
                        </button>
                    </div>
                </div>

                <div className="text-slate-400 text-xs bg-slate-800/50 rounded-xl p-3">
                    🎁 Por cada <strong className="text-white">3 amigos</strong> que se registren con tu código, ganás <strong className="text-[#39FF14]">+$5M</strong> extra en el Draft
                </div>

                <Button
                    onClick={share}
                    id="profile-share-btn"
                    className="w-full bg-[#39FF14] text-black hover:bg-[#39FF14]/90 font-bold gap-2 shadow-[0_0_15px_rgba(57,255,20,0.3)]"
                >
                    <Share2 className="w-4 h-4" />
                    Compartir en WhatsApp / X
                </Button>
            </motion.div>

            {/* ── Logout ───────────────────────────────────── */}
            <Button
                id="profile-logout-btn"
                variant="outline"
                className="w-full border-red-900/40 text-red-400 hover:bg-red-950/30 hover:border-red-700/50"
                onClick={handleLogout}
            >
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
            </Button>

            {/* ── Avatar Picker Modal ───────────────────────── */}
            <AnimatePresence>
                {showAvatarPicker && (
                    <>
                        <motion.div onClick={() => setShowAvatarPicker(false)}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
                        <motion.div
                            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl p-6"
                            style={{ background: 'rgba(15,23,42,0.98)', borderTop: '1px solid rgba(57,255,20,0.2)' }}
                        >
                            <div className="flex justify-center mb-4"><div className="w-10 h-1 rounded-full bg-slate-700" /></div>
                            <h3 className="font-display text-xl font-bold text-white mb-4">Elegí tu avatar</h3>
                            <div className="grid grid-cols-6 gap-3 pb-4">
                                {AVATARS.map((a) => (
                                    <button key={a.id} onClick={() => { setAvatarId(a.id); setShowAvatarPicker(false) }}
                                        id={`avatar-${a.id}`}
                                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border-2 transition-all ${avatarId === a.id ? 'border-[#39FF14] bg-[#39FF14]/10 shadow-[0_0_10px_rgba(57,255,20,0.3)]' : 'border-slate-700 bg-slate-800'
                                            }`}
                                    >
                                        {a.emoji}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* ── Favorite Team Picker Modal ─────────────────── */}
            <AnimatePresence>
                {showTeamPicker && (
                    <>
                        <motion.div onClick={() => setShowTeamPicker(false)}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
                        <motion.div
                            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl p-6 max-h-[60vh] flex flex-col"
                            style={{ background: 'rgba(15,23,42,0.98)', borderTop: '1px solid rgba(57,255,20,0.2)' }}
                        >
                            <div className="flex justify-center mb-4"><div className="w-10 h-1 rounded-full bg-slate-700" /></div>
                            <h3 className="font-display text-xl font-bold text-white mb-4">Equipo favorito</h3>
                            <div className="overflow-y-auto flex-1 grid grid-cols-2 gap-2 pb-4">
                                {TEAM_FLAGS.map((t) => (
                                    <button key={t.code} onClick={() => { setFavoriteTeam(t.code); setShowTeamPicker(false) }}
                                        id={`fav-team-${t.code}`}
                                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${favoriteTeam === t.code ? 'border-[#39FF14] bg-[#39FF14]/5' : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                                            }`}
                                    >
                                        <span className="text-2xl">{t.flag}</span>
                                        <span className={`text-sm font-medium ${favoriteTeam === t.code ? 'text-[#39FF14]' : 'text-slate-300'}`}>{t.name}</span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
