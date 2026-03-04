'use client'

import { motion } from 'framer-motion'
import { Trophy, Zap, Users, TrendingUp, Star, ArrowRight, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const UPCOMING_MATCHES = [
    { home: 'Argentina', homeFlag: '🇦🇷', away: 'Argelia', awayFlag: '🇩🇿', time: '20 Jun', stage: 'Grupo J · MetLife, NY' },
    { home: 'Brasil', homeFlag: '🇧🇷', away: 'Marruecos', awayFlag: '🇲🇦', time: '13 Jun', stage: 'Grupo C · Hard Rock, Miami' },
    { home: 'Francia', homeFlag: '🇫🇷', away: 'Senegal', awayFlag: '🇸🇳', time: '19 Jun', stage: 'Grupo I · Levi\'s, SF' },
]

const QUICK_ACTIONS = [
    { label: 'Armar Equipo', icon: '⚽', href: '/draft', color: 'from-green-900/50 to-green-800/30', border: 'border-green-700/30', glow: 'rgba(34,197,94,0.15)' },
    { label: 'Crear Liga', icon: '🏆', href: '/leagues/create', color: 'from-amber-900/50 to-amber-800/30', border: 'border-amber-700/30', glow: 'rgba(245,158,11,0.15)' },
    { label: 'Puntos en Vivo', icon: '⚡', href: '/live', color: 'from-blue-900/50 to-blue-800/30', border: 'border-blue-700/30', glow: 'rgba(59,130,246,0.15)' },
    { label: 'Mi Perfil', icon: '👤', href: '/profile', color: 'from-purple-900/50 to-purple-800/30', border: 'border-purple-700/30', glow: 'rgba(139,92,246,0.15)' },
]

const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
}
const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function DashboardPage() {
    return (
        <div className="min-h-screen px-4 py-6 max-w-lg mx-auto space-y-6">
            {/* Greeting */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div>
                    <p className="text-slate-400 text-sm">Bienvenido de vuelta 👋</p>
                    <h1 className="font-display text-3xl font-bold text-white">Tu Dashboard</h1>
                </div>
                <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#39FF14]/30 to-[#00CFFF]/30 border border-[#39FF14]/40 flex items-center justify-center text-2xl">
                        ⭐
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#39FF14] rounded-full border-2 border-[#020617]" />
                </div>
            </motion.div>

            {/* Points card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-6 relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-[#39FF14]/5 to-transparent pointer-events-none" />
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-[#f59e0b]" />
                        <span className="text-slate-300 font-medium">Mis Puntos</span>
                    </div>
                    <span className="text-xs text-[#39FF14] border border-[#39FF14]/30 rounded-full px-2 py-0.5">
                        Ronda 1
                    </span>
                </div>
                <div className="flex items-end gap-4">
                    <div>
                        <p className="font-display text-6xl font-bold text-[#39FF14]" style={{ textShadow: '0 0 20px rgba(57,255,20,0.4)' }}>
                            0
                        </p>
                        <p className="text-slate-500 text-sm mt-1">puntos totales</p>
                    </div>
                    <div className="flex-1 text-right">
                        <p className="text-slate-400 text-sm">Ranking</p>
                        <p className="font-display text-3xl font-bold text-slate-200">#—</p>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <TrendingUp className="w-4 h-4" />
                        Configurá tu equipo para empezar
                    </div>
                    <Link href="/draft">
                        <Button size="sm" id="dashboard-draft-btn" className="bg-[#39FF14] text-black hover:bg-[#39FF14]/90 font-bold text-xs">
                            Draft <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                    </Link>
                </div>
            </motion.div>

            {/* Quick actions */}
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
                <h2 className="text-slate-300 font-semibold text-sm uppercase tracking-wider mb-3">Acciones rápidas</h2>
                <div className="grid grid-cols-2 gap-3">
                    {QUICK_ACTIONS.map((action) => (
                        <motion.div key={action.label} variants={itemVariants}>
                            <Link href={action.href} id={`quick-${action.label.toLowerCase().replace(' ', '-')}`}>
                                <div
                                    className={`glass-card glass-card-hover p-4 bg-gradient-to-br ${action.color} border ${action.border} flex items-center gap-3 group`}
                                    style={{ transition: 'box-shadow 0.25s' }}
                                >
                                    <span className="text-2xl">{action.icon}</span>
                                    <span className="font-semibold text-white text-sm group-hover:text-[#39FF14] transition-colors">
                                        {action.label}
                                    </span>
                                    <ChevronRight className="w-4 h-4 text-slate-500 ml-auto group-hover:text-[#39FF14] transition-colors" />
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Upcoming matches */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-slate-300 font-semibold text-sm uppercase tracking-wider">Próximos Partidos</h2>
                    <Link href="/live">
                        <span className="flex items-center gap-1 text-[#39FF14] text-xs hover:underline">
                            <Zap className="w-3 h-3" /> Ver en vivo
                        </span>
                    </Link>
                </div>
                <div className="space-y-3">
                    {UPCOMING_MATCHES.map((match, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + i * 0.08 }}
                            className="glass-card p-4 flex items-center gap-3"
                        >
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-white font-semibold text-sm">
                                        {match.homeFlag} {match.home}
                                    </span>
                                    <span className="text-slate-500 text-xs font-bold mx-3">VS</span>
                                    <span className="text-white font-semibold text-sm text-right">
                                        {match.away} {match.awayFlag}
                                    </span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[#39FF14] font-bold text-sm">{match.time}</p>
                                <p className="text-slate-500 text-xs">{match.stage}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Viral nudge */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="glass-card p-5 border border-[#f59e0b]/20 bg-gradient-to-r from-amber-900/20 to-transparent"
            >
                <div className="flex items-center gap-4">
                    <span className="text-3xl">🔥</span>
                    <div className="flex-1">
                        <p className="text-white font-semibold text-sm">¡Invitá 3 amigos!</p>
                        <p className="text-slate-400 text-xs">Desbloqueá <strong className="text-[#f59e0b]">$5M extra</strong> para tu draft</p>
                    </div>
                    <Link href="/leagues/create">
                        <Button size="sm" id="dashboard-invite-btn" className="bg-[#f59e0b] hover:bg-[#fbbf24] text-black font-bold text-xs">
                            Invitar
                        </Button>
                    </Link>
                </div>
            </motion.div>
        </div>
    )
}
