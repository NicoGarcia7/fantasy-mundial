'use client'
/**
 * /leagues/[id] — League detail: leaderboard, invite, and info
 */

import { use } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Copy, Share2, Trophy, Crown, Users, Lock, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useLeagueStore } from '@/store/leagueStore'
import { toast } from 'sonner'

// Generated placeholder members for the leaderboard
function mockMembers(count: number) {
    const names = [
        'Vos 🏆', 'Germán', 'Lucía', 'Marcos', 'Valentina',
        'Diego', 'Camila', 'Nicolás', 'Ana', 'Roberto',
        'Federico', 'Sofía', 'Emilio', 'Marina', 'Julián',
    ]
    return Array.from({ length: Math.min(count, names.length) }, (_, i) => ({
        rank: i + 1,
        name: names[i],
        points: Math.max(0, 120 - i * 8 + Math.floor(Math.random() * 12)),
        teamName: ['Los Invictos', 'Crack Total', 'La Máquina', 'Full Defense', 'Goleadores'][Math.floor(Math.random() * 5)],
        isMe: i === 0,
    }))
}

export default function LeagueDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const { getLeagueById } = useLeagueStore()
    const league = getLeagueById(id)

    if (!league) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center gap-4">
                <Trophy className="w-16 h-16 text-slate-700" />
                <h2 className="font-display text-2xl font-bold text-white">Liga no encontrada</h2>
                <p className="text-slate-400 text-sm">Esta liga no existe o ya no eres miembro.</p>
                <Link href="/leagues">
                    <Button variant="outline" className="border-slate-700 text-slate-300">
                        Volver a Ligas
                    </Button>
                </Link>
            </div>
        )
    }

    const members = mockMembers(league.member_count || 5)

    const copyInvite = () => {
        navigator.clipboard.writeText(league.invite_code)
        toast.success(`Código ${league.invite_code} copiado! 📋`)
    }

    const share = () => {
        const text = `¡Sumate a mi liga "${league.name}" en Fantasy Mundial 2026!\n🔑 Código: ${league.invite_code}\n👉 ${window.location.origin}/login`
        if (navigator.share) {
            navigator.share({ title: 'Fantasy Mundial 2026', text, url: window.location.origin + '/login' })
        } else {
            navigator.clipboard.writeText(text)
            toast.success('Link copiado al portapapeles!')
        }
    }

    return (
        <div className="min-h-screen px-4 py-6 max-w-lg mx-auto space-y-5 pb-28">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Link href="/leagues">
                    <button className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors">
                        <ArrowLeft className="w-4 h-4 text-slate-300" />
                    </button>
                </Link>
                <div className="flex-1 min-w-0">
                    <h1 className="font-display text-xl font-bold text-white truncate">{league.name}</h1>
                    <div className="flex items-center gap-2 text-slate-500 text-xs mt-0.5">
                        {league.type === 'private'
                            ? <><Lock className="w-3 h-3" /> Privada</>
                            : <><Globe className="w-3 h-3" /> Pública</>
                        }
                        <span>·</span>
                        <Users className="w-3 h-3" /> {members.length}/{league.max_members}
                    </div>
                </div>
            </div>

            {/* Invite code card */}
            {league.type === 'private' && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-4 flex items-center gap-4 border border-[#39FF14]/20"
                >
                    <div className="flex-1">
                        <p className="text-slate-500 text-xs uppercase tracking-widest">Código de invitación</p>
                        <p className="font-display text-2xl font-bold text-[#39FF14] tracking-[0.2em] mt-0.5">
                            {league.invite_code}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={copyInvite}
                            id="copy-league-code"
                            className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center hover:bg-slate-700 border border-slate-700 transition-colors"
                        >
                            <Copy className="w-4 h-4 text-slate-300" />
                        </button>
                        <button
                            onClick={share}
                            id="share-league"
                            className="w-9 h-9 rounded-xl bg-[#39FF14]/10 border border-[#39FF14]/30 flex items-center justify-center hover:bg-[#39FF14]/20 transition-colors"
                        >
                            <Share2 className="w-4 h-4 text-[#39FF14]" />
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Leaderboard */}
            <div>
                <h2 className="text-slate-300 font-semibold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    Clasificación
                </h2>

                <div className="space-y-2">
                    {members.map((member, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -16 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.06 }}
                            className={`glass-card flex items-center gap-4 px-4 py-3 ${member.isMe
                                    ? 'border border-[#39FF14]/30 shadow-[0_0_12px_rgba(57,255,20,0.1)]'
                                    : ''
                                }`}
                        >
                            {/* Rank */}
                            <div className="w-8 text-center flex-shrink-0">
                                {member.rank <= 3 ? (
                                    <span className="text-lg">
                                        {member.rank === 1 ? '🥇' : member.rank === 2 ? '🥈' : '🥉'}
                                    </span>
                                ) : (
                                    <span className="text-slate-500 font-bold text-sm">#{member.rank}</span>
                                )}
                            </div>

                            {/* Avatar placeholder */}
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${member.isMe
                                    ? 'bg-[#39FF14]/20 border border-[#39FF14]/40 text-[#39FF14]'
                                    : 'bg-slate-800 border border-slate-700 text-slate-300'
                                }`}>
                                {member.isMe ? '👤' : member.name[0]}
                            </div>

                            {/* Name + team */}
                            <div className="flex-1 min-w-0">
                                <p className={`font-semibold text-sm ${member.isMe ? 'text-[#39FF14]' : 'text-white'}`}>
                                    {member.name} {member.isMe && <span className="text-xs font-normal text-slate-400">(vos)</span>}
                                </p>
                                <p className="text-slate-500 text-xs truncate">{member.teamName}</p>
                            </div>

                            {/* Points */}
                            <div className="text-right flex-shrink-0">
                                <p className={`font-display text-lg font-bold ${member.isMe ? 'text-[#39FF14]' : 'text-white'}`}>
                                    {member.points}
                                </p>
                                <p className="text-slate-600 text-xs">pts</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Invite CTA */}
            <div className="glass-card p-4 text-center border border-dashed border-slate-700 space-y-3">
                <p className="text-slate-400 text-sm">¿Querés más rivales?</p>
                <Button
                    onClick={share}
                    id="invite-friends-btn"
                    className="bg-[#39FF14] text-black font-bold hover:bg-[#39FF14]/90 gap-2 shadow-[0_0_15px_rgba(57,255,20,0.3)]"
                >
                    <Share2 className="w-4 h-4" />
                    Invitar amigos 🚀
                </Button>
            </div>
        </div>
    )
}
