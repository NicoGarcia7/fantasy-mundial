'use client'
/**
 * /live — Live scoring hub
 * Shows: upcoming WC2026 fixtures by group, live match, event feed, player scores
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Circle, ChevronDown, ChevronUp, Clock, Trophy } from 'lucide-react'
import Link from 'next/link'

// ── World Cup 2026 Group Fixtures ───────────────────────────────
const WC2026_GROUPS: Record<string, { home: string; hFlag: string; away: string; aFlag: string; date: string; venue: string }[]> = {
    'A': [
        { home: 'México', hFlag: '🇲🇽', away: 'Sudáfrica', aFlag: '🇿🇦', date: '11 Jun', venue: 'MetLife, Nueva York' },
        { home: 'Corea del Sur', hFlag: '🇰🇷', away: 'TBD Playoff D', aFlag: '🏳️', date: '12 Jun', venue: 'SoFi, Los Ángeles' },
    ],
    'B': [
        { home: 'Canadá', hFlag: '🇨🇦', away: 'TBD Playoff A', aFlag: '🏳️', date: '12 Jun', venue: 'BC Place, Vancouver' },
        { home: 'Qatar', hFlag: '🇶🇦', away: 'Suiza', aFlag: '🇨🇭', date: '13 Jun', venue: 'AT&T, Dallas' },
    ],
    'C': [
        { home: 'Brasil', hFlag: '🇧🇷', away: 'Marruecos', aFlag: '🇲🇦', date: '13 Jun', venue: 'Hard Rock, Miami' },
        { home: 'Haití', hFlag: '🇭🇹', away: 'Escocia', aFlag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', date: '14 Jun', venue: 'Gillette, Boston' },
    ],
    'D': [
        { home: 'Estados Unidos', hFlag: '🇺🇸', away: 'Paraguay', aFlag: '🇵🇾', date: '14 Jun', venue: 'Levi\'s, San Francisco' },
        { home: 'Australia', hFlag: '🇦🇺', away: 'TBD Playoff C', aFlag: '🏳️', date: '15 Jun', venue: 'Rose Bowl, Los Ángeles' },
    ],
    'E': [
        { home: 'Alemania', hFlag: '🇩🇪', away: 'Curaçao', aFlag: '🇨🇼', date: '15 Jun', venue: 'Estadio Azteca, CDMX' },
        { home: 'Costa de Marfil', hFlag: '🇨🇮', away: 'Ecuador', aFlag: '🇪🇨', date: '16 Jun', venue: 'BMO Field, Toronto' },
    ],
    'F': [
        { home: 'Países Bajos', hFlag: '🇳🇱', away: 'Japón', aFlag: '🇯🇵', date: '16 Jun', venue: 'MetLife, Nueva York' },
        { home: 'TBD Playoff B', hFlag: '🏳️', away: 'Túnez', aFlag: '🇹🇳', date: '17 Jun', venue: 'AT&T, Dallas' },
    ],
    'G': [
        { home: 'Bélgica', hFlag: '🇧🇪', away: 'Egipto', aFlag: '🇪🇬', date: '17 Jun', venue: 'SoFi, Los Ángeles' },
        { home: 'Irán', hFlag: '🇮🇷', away: 'Nueva Zelanda', aFlag: '🇳🇿', date: '18 Jun', venue: 'Gillette, Boston' },
    ],
    'H': [
        { home: 'España', hFlag: '🇪🇸', away: 'Cabo Verde', aFlag: '🇨🇻', date: '18 Jun', venue: 'Hard Rock, Miami' },
        { home: 'Arabia Saudita', hFlag: '🇸🇦', away: 'Uruguay', aFlag: '🇺🇾', date: '19 Jun', venue: 'Estadio Azteca, CDMX' },
    ],
    'I': [
        { home: 'Francia', hFlag: '🇫🇷', away: 'Senegal', aFlag: '🇸🇳', date: '19 Jun', venue: 'Levi\'s, San Francisco' },
        { home: 'Noruega', hFlag: '🇳🇴', away: 'TBD Playoff 2', aFlag: '🏳️', date: '20 Jun', venue: 'Rose Bowl, Los Ángeles' },
    ],
    'J': [
        { home: 'Argentina', hFlag: '🇦🇷', away: 'Argelia', aFlag: '🇩🇿', date: '20 Jun', venue: 'MetLife, Nueva York' },
        { home: 'Austria', hFlag: '🇦🇹', away: 'Jordania', aFlag: '🇯🇴', date: '21 Jun', venue: 'BC Place, Vancouver' },
    ],
    'K': [
        { home: 'Portugal', hFlag: '🇵🇹', away: 'TBD Playoff 1', aFlag: '🏳️', date: '21 Jun', venue: 'AT&T, Dallas' },
        { home: 'Uzbekistán', hFlag: '🇺🇿', away: 'Colombia', aFlag: '🇨🇴', date: '22 Jun', venue: 'BMO Field, Toronto' },
    ],
    'L': [
        { home: 'Inglaterra', hFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', away: 'Croacia', aFlag: '🇭🇷', date: '22 Jun', venue: 'SoFi, Los Ángeles' },
        { home: 'Ghana', hFlag: '🇬🇭', away: 'Panamá', aFlag: '🇵🇦', date: '23 Jun', venue: 'Gillette, Boston' },
    ],
}

// ── Demo events for the live feed ───────────────────────────────
const LIVE_EVENTS = [
    { player: 'L. Messi', team: '🇦🇷 ARG', event: 'GOOOL ⚽', points: '+5', time: "23'", color: '#39FF14' },
    { player: 'K. Mbappé', team: '🇫🇷 FRA', event: 'Asistencia 🎯', points: '+4', time: "31'", color: '#00CFFF' },
    { player: 'V. Jr.', team: '🇧🇷 BRA', event: 'GOOOL ⚽', points: '+5', time: "44'", color: '#39FF14' },
    { player: 'J. Bellingham', team: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 ENG', event: 'Tarjeta amarilla 🟨', points: '-1', time: "52'", color: '#f59e0b' },
    { player: 'L. Yamal', team: '🇪🇸 ESP', event: 'GOOOL ⚽', points: '+5', time: "61'", color: '#39FF14' },
]

export default function LivePage() {
    const [pulse, setPulse] = useState(false)
    const [expandedGroup, setExpandedGroup] = useState<string | null>('J') // Default show Group J (Argentina)
    const [activeTab, setActiveTab] = useState<'groups' | 'live'>('groups')

    useEffect(() => {
        const interval = setInterval(() => setPulse((p) => !p), 1500)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="min-h-screen pb-28">
            {/* ── Header ─────────────────────────────────── */}
            <div className="sticky top-14 z-20 bg-[#020617]/95 backdrop-blur border-b border-slate-800/80 px-4 py-3">
                <div className="flex items-center justify-between max-w-lg mx-auto">
                    <h1 className="font-display text-2xl font-bold text-white">EN VIVO</h1>
                    <motion.div
                        animate={{ scale: pulse ? 1.15 : 1, opacity: pulse ? 1 : 0.7 }}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/30"
                    >
                        <Circle className="w-2 h-2 fill-red-500 text-red-500" />
                        <span className="text-red-400 text-xs font-bold">LIVE</span>
                    </motion.div>
                </div>

                {/* Tab bar */}
                <div className="flex gap-1 mt-3 max-w-lg mx-auto bg-slate-800/60 rounded-xl p-1">
                    {(['groups', 'live'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            id={`live-tab-${tab}`}
                            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab
                                    ? 'bg-[#39FF14] text-black shadow-[0_0_10px_rgba(57,255,20,0.3)]'
                                    : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            {tab === 'groups' ? '📅 Grupos' : '⚡ En Vivo'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
                {activeTab === 'groups' ? (
                    /* ── Groups Tab ─────────────────────────── */
                    <div className="space-y-3">
                        <p className="text-slate-500 text-xs uppercase tracking-widest">
                            Mundial 2026 — Primera Fase de Grupos
                        </p>

                        {Object.entries(WC2026_GROUPS).map(([group, matches]) => {
                            const isOpen = expandedGroup === group
                            return (
                                <motion.div
                                    key={group}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="glass-card overflow-hidden"
                                >
                                    {/* Group header */}
                                    <button
                                        onClick={() => setExpandedGroup(isOpen ? null : group)}
                                        id={`group-${group}-toggle`}
                                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-800/30 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-[#39FF14]/10 border border-[#39FF14]/25 flex items-center justify-center">
                                                <span className="font-display font-bold text-[#39FF14] text-sm">{group}</span>
                                            </div>
                                            <div className="text-left">
                                                <p className="text-white font-semibold text-sm">Grupo {group}</p>
                                                <p className="text-slate-500 text-xs">
                                                    {matches.map(m => m.hFlag).join(' ')} {matches.map(m => m.aFlag).join(' ')}
                                                </p>
                                            </div>
                                        </div>
                                        {isOpen
                                            ? <ChevronUp className="w-4 h-4 text-slate-400" />
                                            : <ChevronDown className="w-4 h-4 text-slate-400" />
                                        }
                                    </button>

                                    {/* Matches */}
                                    <AnimatePresence>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="border-t border-slate-800/60"
                                            >
                                                {matches.map((match, i) => (
                                                    <div
                                                        key={i}
                                                        className={`px-4 py-3 flex items-center gap-3 ${i > 0 ? 'border-t border-slate-800/40' : ''}`}
                                                    >
                                                        {/* Teams */}
                                                        <div className="flex-1 flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xl">{match.hFlag}</span>
                                                                <span className="text-white text-sm font-medium truncate max-w-[90px]">{match.home}</span>
                                                            </div>
                                                            <span className="text-slate-600 text-xs font-bold mx-2">VS</span>
                                                            <div className="flex items-center gap-2 justify-end">
                                                                <span className="text-white text-sm font-medium truncate max-w-[90px] text-right">{match.away}</span>
                                                                <span className="text-xl">{match.aFlag}</span>
                                                            </div>
                                                        </div>
                                                        {/* Date & venue */}
                                                        <div className="text-right flex-shrink-0 pl-2">
                                                            <div className="flex items-center gap-1 text-[#39FF14] text-xs font-bold justify-end">
                                                                <Clock className="w-3 h-3" />
                                                                {match.date}
                                                            </div>
                                                            <p className="text-slate-600 text-[10px] mt-0.5 max-w-[110px] text-right leading-tight">{match.venue}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            )
                        })}
                    </div>
                ) : (
                    /* ── Live Tab ───────────────────────────── */
                    <div className="space-y-5">
                        {/* Demo live match */}
                        <div className="glass-card p-5 text-center border border-[#39FF14]/10 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-[#39FF14]/3 to-transparent pointer-events-none" />
                            <p className="text-slate-400 text-xs uppercase tracking-widest mb-4">Grupo J — 2ª Jornada</p>
                            <div className="flex items-center justify-between">
                                <div className="text-center flex-1">
                                    <p className="text-4xl mb-2">🇦🇷</p>
                                    <p className="text-white font-bold text-sm">Argentina</p>
                                </div>
                                <div className="text-center px-4">
                                    <p className="font-display text-5xl font-bold text-white">1 — 0</p>
                                    <motion.p
                                        animate={{ opacity: pulse ? 1 : 0.4 }}
                                        className="text-[#39FF14] text-sm font-bold font-display mt-1"
                                    >
                                        45'+2
                                    </motion.p>
                                    <div className="mt-1 flex items-center justify-center gap-1">
                                        <motion.div animate={{ scale: pulse ? 1.3 : 1 }} className="w-2 h-2 rounded-full bg-red-500" />
                                        <span className="text-red-400 text-[10px] font-bold">LIVE</span>
                                    </div>
                                </div>
                                <div className="text-center flex-1">
                                    <p className="text-4xl mb-2">🇩🇿</p>
                                    <p className="text-white font-bold text-sm">Argelia</p>
                                </div>
                            </div>
                        </div>

                        {/* Live events feed */}
                        <div>
                            <h2 className="text-slate-300 font-semibold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Zap className="w-4 h-4 text-[#39FF14]" />
                                Feed de Eventos
                            </h2>
                            <div className="space-y-2">
                                <AnimatePresence>
                                    {LIVE_EVENTS.map((event, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -24, scale: 0.96 }}
                                            animate={{ opacity: 1, x: 0, scale: 1 }}
                                            transition={{ delay: i * 0.1, type: 'spring', bounce: 0.25 }}
                                            className="glass-card p-3.5 flex items-center gap-3"
                                        >
                                            {/* Minute badge */}
                                            <div
                                                className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold font-display flex-shrink-0"
                                                style={{
                                                    background: `rgba(${event.color === '#39FF14' ? '57,255,20' : event.color === '#00CFFF' ? '0,207,255' : '245,158,11'},0.12)`,
                                                    color: event.color,
                                                    border: `1px solid ${event.color}35`,
                                                }}
                                            >
                                                {event.time}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white font-semibold text-sm">{event.player}</p>
                                                <p className="text-slate-400 text-xs">{event.team} · {event.event}</p>
                                            </div>
                                            <div
                                                className="font-display text-xl font-bold flex-shrink-0"
                                                style={{ color: event.color, textShadow: `0 0 10px ${event.color}60` }}
                                            >
                                                {event.points}
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Realtime note */}
                        <div className="glass-card p-4 flex items-start gap-3 border border-[#39FF14]/10">
                            <Zap className="w-5 h-5 text-[#39FF14] flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-white text-sm font-semibold">Puntos en tiempo real</p>
                                <p className="text-slate-400 text-xs mt-0.5">
                                    Conectado vía <strong className="text-white">Supabase Realtime</strong>. Los puntos se actualizan
                                    automáticamente cuando ingresa un evento — sin recargar la página.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
