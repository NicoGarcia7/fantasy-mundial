'use client'
/**
 * PlayerPicker — Slide-up modal panel for selecting a player
 * Filters by position (forced to match the selected slot),
 * supports search, budget filter, and real-time Supabase data.
 */

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, AlertCircle, Zap } from 'lucide-react'
import { Input } from '@/components/ui/input'
import type { Player, PlayerPosition } from '@/types'
import { useDraftStore } from '@/store/draftStore'
import { getPositionColor, getPositionLabel, formatPrice } from '@/lib/utils'
import { MOCK_PLAYERS } from '@/hooks/useDraftData'

interface PlayerPickerProps {
    isOpen: boolean
    slotPosition: PlayerPosition | null
    onSelect: (player: Player) => void
    onClose: () => void
}

const POS_TABS: { label: string; value: PlayerPosition | 'ALL' }[] = [
    { label: 'Todo', value: 'ALL' },
    { label: 'POR', value: 'GK' },
    { label: 'DEF', value: 'DEF' },
    { label: 'MED', value: 'MID' },
    { label: 'DEL', value: 'FWD' },
]

export default function PlayerPicker({ isOpen, slotPosition, onSelect, onClose }: PlayerPickerProps) {
    const [search, setSearch] = useState('')
    const [posTab, setPosTab] = useState<PlayerPosition | 'ALL'>('ALL')

    const { getBudgetRemaining, getSelectedPlayerIds } = useDraftStore()
    const remaining = getBudgetRemaining()
    const selectedIds = getSelectedPlayerIds()

    // Use the mock players (Supabase data will auto-replace this in Paso 4)
    const filtered = useMemo(() => {
        const activePos = slotPosition ?? posTab
        return MOCK_PLAYERS.filter((p) => {
            if (activePos !== 'ALL' && p.position !== activePos) return false
            if (p.price > remaining) return false
            if (selectedIds.includes(p.id)) return false
            if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
            return true
        }).sort((a, b) => b.form - a.form)
    }, [search, posTab, remaining, selectedIds, slotPosition])

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                        onClick={onClose}
                    />

                    {/* Panel */}
                    <motion.div
                        key="panel"
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 z-50 max-h-[75vh] flex flex-col rounded-t-3xl overflow-hidden"
                        style={{ background: 'rgba(15,23,42,0.98)', borderTop: '1px solid rgba(57,255,20,0.2)' }}
                    >
                        {/* Handle */}
                        <div className="flex justify-center pt-3">
                            <div className="w-10 h-1 rounded-full bg-slate-700" />
                        </div>

                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3">
                            <div>
                                <h3 className="font-display text-xl font-bold text-white">
                                    {slotPosition
                                        ? `Elegir ${getPositionLabel(slotPosition)}`
                                        : 'Elegir Jugador'
                                    }
                                </h3>
                                <p className="text-[#39FF14] text-xs font-semibold">
                                    Disponible: ${remaining.toFixed(1)}M
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors"
                            >
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>

                        {/* Search */}
                        <div className="px-4 mb-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <Input
                                    id="player-search-input"
                                    placeholder="Buscar jugador..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9 h-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 rounded-xl focus:border-[#39FF14]"
                                />
                            </div>
                        </div>

                        {/* Position tabs (only when no slot position forced) */}
                        {!slotPosition && (
                            <div className="flex gap-1.5 px-4 mb-3 overflow-x-auto">
                                {POS_TABS.map((tab) => (
                                    <button
                                        key={tab.value}
                                        onClick={() => setPosTab(tab.value)}
                                        className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${posTab === tab.value
                                                ? 'bg-[#39FF14] text-black border-[#39FF14]'
                                                : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Player list */}
                        <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-2">
                            {filtered.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <AlertCircle className="w-10 h-10 text-slate-600 mb-3" />
                                    <p className="text-slate-400 text-sm">Sin jugadores disponibles</p>
                                    <p className="text-slate-600 text-xs mt-1">
                                        Presupuesto insuficiente o ya los seleccionaste
                                    </p>
                                </div>
                            ) : (
                                filtered.map((player, i) => (
                                    <PlayerRow
                                        key={player.id}
                                        player={player}
                                        index={i}
                                        onSelect={onSelect}
                                    />
                                ))
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

// ── Player row in the picker list ────────────────────────────

function PlayerRow({ player, index, onSelect }: { player: Player; index: number; onSelect: (p: Player) => void }) {
    const color = getPositionColor(player.position)

    return (
        <motion.button
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03, duration: 0.25 }}
            onClick={() => onSelect(player)}
            id={`player-row-${player.id}`}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-[#39FF14]/40 hover:bg-slate-800 transition-all duration-150 group text-left"
        >
            {/* Flag */}
            <div className="text-2xl w-8 text-center flex-shrink-0">{player.flag_emoji}</div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm truncate group-hover:text-[#39FF14] transition-colors">
                    {player.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                        style={{ color, background: `${color}22`, border: `0.5px solid ${color}44` }}>
                        {player.position}
                    </span>
                    <span className="text-slate-500 text-[10px]">{player.team}</span>
                </div>
            </div>

            {/* Form */}
            <div className="flex flex-col items-center flex-shrink-0">
                <div className="flex items-center gap-0.5 text-amber-400">
                    <Zap className="w-3 h-3" />
                    <span className="text-xs font-bold">{player.form}</span>
                </div>
                <span className="text-slate-500 text-[9px]">forma</span>
            </div>

            {/* Price */}
            <div className="flex-shrink-0 text-right">
                <p className="font-display text-base font-bold" style={{ color }}>
                    ${player.price}M
                </p>
                <p className="text-slate-500 text-[9px]">{player.points}pts</p>
            </div>

            {/* Add indicator */}
            <div
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: `${color}33`, border: `1px solid ${color}66` }}
            >
                <span style={{ color }} className="font-bold text-sm leading-none">+</span>
            </div>
        </motion.button>
    )
}
