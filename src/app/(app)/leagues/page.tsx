'use client'
/**
 * /leagues — Main leagues hub
 * Shows: user's leagues, CTA to create/join
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Plus, Lock, Globe, ChevronRight, Trophy, Hash, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useLeagueStore } from '@/store/leagueStore'
import type { League } from '@/types'
import JoinLeagueModal from '@/components/leagues/JoinLeagueModal'

export default function LeaguesPage() {
    const { leagues } = useLeagueStore()
    const [joinOpen, setJoinOpen] = useState(false)

    return (
        <div className="min-h-screen px-4 py-6 max-w-lg mx-auto space-y-6 pb-28">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="font-display text-3xl font-bold text-white">MIS LIGAS</h1>
                <Link href="/leagues/create">
                    <Button
                        id="leagues-create-btn"
                        size="sm"
                        className="bg-[#39FF14] text-black hover:bg-[#39FF14]/90 font-bold shadow-[0_0_12px_rgba(57,255,20,0.3)] gap-1.5"
                    >
                        <Plus className="w-4 h-4" /> Nueva
                    </Button>
                </Link>
            </div>

            {/* League list */}
            {leagues.length > 0 ? (
                <div className="space-y-3">
                    {leagues.map((league, i) => (
                        <LeagueCard key={league.id} league={league} index={i} />
                    ))}
                </div>
            ) : (
                /* Empty state */
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-8 text-center border border-dashed border-slate-700 space-y-3"
                >
                    <Trophy className="w-12 h-12 text-slate-600 mx-auto" />
                    <p className="text-slate-300 font-semibold">Todavía no estás en ninguna liga</p>
                    <p className="text-slate-500 text-sm">Crea una con tus amigos o unite a una pública</p>
                </motion.div>
            )}

            {/* Join / Create CTAs */}
            <div className="grid grid-cols-2 gap-3">
                <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setJoinOpen(true)}
                    id="leagues-join-btn"
                    className="glass-card p-5 flex flex-col items-center gap-3 border border-slate-700 hover:border-[#39FF14]/40 transition-all"
                >
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                        <Hash className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="text-center">
                        <p className="text-white font-semibold text-sm">Unirme</p>
                        <p className="text-slate-500 text-xs">con código</p>
                    </div>
                </motion.button>

                <Link href="/leagues/create" className="block">
                    <motion.div
                        whileTap={{ scale: 0.97 }}
                        className="glass-card p-5 flex flex-col items-center gap-3 border border-slate-700 hover:border-[#39FF14]/40 transition-all h-full"
                    >
                        <div className="w-12 h-12 rounded-full bg-[#39FF14]/10 border border-[#39FF14]/30 flex items-center justify-center">
                            <UserPlus className="w-6 h-6 text-[#39FF14]" />
                        </div>
                        <div className="text-center">
                            <p className="text-white font-semibold text-sm">Crear Liga</p>
                            <p className="text-slate-500 text-xs">privada o pública</p>
                        </div>
                    </motion.div>
                </Link>
            </div>

            {/* Viral tip */}
            <div className="glass-card p-4 flex items-start gap-3">
                <span className="text-xl">🎁</span>
                <div>
                    <p className="text-white text-sm font-semibold">Invita amigos, ganás presupuesto</p>
                    <p className="text-slate-400 text-xs mt-1">
                        Por cada 3 amigos que se registren con tu código, recibís <strong className="text-[#39FF14]">+$5M</strong> para el Draft.
                    </p>
                </div>
            </div>

            <JoinLeagueModal isOpen={joinOpen} onClose={() => setJoinOpen(false)} />
        </div>
    )
}

// ── League card ──────────────────────────────────────────────
function LeagueCard({ league, index }: { league: League; index: number }) {
    const topMember = { rank: 1, points: 0 }

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08 }}
        >
            <Link href={`/leagues/${league.id}`}>
                <div className="glass-card glass-card-hover p-4 flex items-center gap-4 group cursor-pointer">
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center flex-shrink-0 border border-slate-700 group-hover:border-[#39FF14]/30 transition-colors">
                        {league.type === 'private'
                            ? <Lock className="w-5 h-5 text-slate-400" />
                            : <Globe className="w-5 h-5 text-blue-400" />
                        }
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold truncate">{league.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-slate-500 text-xs">
                                {league.type === 'private' ? 'Privada' : 'Pública'}
                            </span>
                            <span className="text-slate-700">·</span>
                            <span className="text-slate-500 text-xs flex items-center gap-1">
                                <Users className="w-3 h-3" /> {league.member_count}/{league.max_members}
                            </span>
                        </div>
                    </div>

                    {/* Points / Rank */}
                    <div className="text-right flex-shrink-0">
                        <p className="font-display text-xl font-bold text-[#39FF14]">0pts</p>
                        <p className="text-slate-500 text-xs">#1 de {league.member_count}</p>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0" />
                </div>
            </Link>
        </motion.div>
    )
}
