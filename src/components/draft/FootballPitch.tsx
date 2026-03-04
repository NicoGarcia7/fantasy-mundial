'use client'
/**
 * FootballPitch — Interactive SVG football pitch
 * Renders player slots based on the active formation.
 * Clicking an empty slot opens the player picker.
 * Clicking a filled slot removes the player (with confirmation ripple).
 */

import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X } from 'lucide-react'
import type { Player, Formation } from '@/types'
import { FORMATIONS } from '@/lib/constants'
import { getPositionColor } from '@/lib/utils'

interface FootballPitchProps {
    formation: Formation
    squad: (Player | null)[]        // 11 starters
    onSlotClick: (index: number) => void  // open picker for this slot
    onRemovePlayer: (index: number) => void
    selectedSlot: number | null
}

export default function FootballPitch({
    formation,
    squad,
    onSlotClick,
    onRemovePlayer,
    selectedSlot,
}: FootballPitchProps) {
    const positions = FORMATIONS[formation].positions

    return (
        <div className="relative w-full" style={{ paddingBottom: '130%' }}>
            {/* ── Pitch SVG background ─────────────────────────── */}
            <svg
                viewBox="0 0 100 130"
                className="absolute inset-0 w-full h-full"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Pitch gradient fill */}
                <defs>
                    <linearGradient id="pitchGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#052e16" />
                        <stop offset="30%" stopColor="#14532d" />
                        <stop offset="50%" stopColor="#166534" />
                        <stop offset="70%" stopColor="#14532d" />
                        <stop offset="100%" stopColor="#052e16" />
                    </linearGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="0.5" result="coloredBlur" />
                        <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                </defs>

                {/* Pitch base */}
                <rect x="0" y="0" width="100" height="130" fill="url(#pitchGrad)" rx="4" />

                {/* Pitch stripes (alternating darker bands) */}
                {[0, 1, 2, 3, 4, 5].map(i => (
                    <rect key={i} x="0" y={i * 22} width="100" height="11"
                        fill="rgba(0,0,0,0.08)" />
                ))}

                {/* Outer boundary */}
                <rect x="3" y="3" width="94" height="124" fill="none"
                    stroke="rgba(255,255,255,0.25)" strokeWidth="0.5" rx="1" />

                {/* Centre line */}
                <line x1="3" y1="65" x2="97" y2="65"
                    stroke="rgba(255,255,255,0.25)" strokeWidth="0.5" />

                {/* Centre circle */}
                <circle cx="50" cy="65" r="10"
                    fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.5" />
                <circle cx="50" cy="65" r="0.8" fill="rgba(255,255,255,0.4)" />

                {/* Top penalty box */}
                <rect x="22" y="3" width="56" height="18"
                    fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.4" />
                <rect x="36" y="3" width="28" height="8"
                    fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.4" />
                {/* Top penalty spot */}
                <circle cx="50" cy="14" r="0.6" fill="rgba(255,255,255,0.3)" />

                {/* Bottom penalty box */}
                <rect x="22" y="109" width="56" height="18"
                    fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.4" />
                <rect x="36" y="119" width="28" height="8"
                    fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.4" />
                {/* Bottom penalty spot */}
                <circle cx="50" cy="116" r="0.6" fill="rgba(255,255,255,0.3)" />

                {/* Corner arcs */}
                {[[3, 3], [97, 3], [3, 127], [97, 127]].map(([cx, cy], i) => (
                    <circle key={i} cx={cx} cy={cy} r="3"
                        fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.4" />
                ))}

                {/* Top goal */}
                <rect x="41" y="1" width="18" height="3"
                    fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.3)" strokeWidth="0.4" />
                {/* Bottom goal */}
                <rect x="41" y="126" width="18" height="3"
                    fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.3)" strokeWidth="0.4" />
            </svg>

            {/* ── Player Slots (positioned as % of container) ─── */}
            {positions.map((pos, idx) => {
                const player = squad[idx] ?? null
                const isSelected = selectedSlot === idx

                return (
                    <PlayerSlot
                        key={idx}
                        index={idx}
                        x={pos.x}
                        y={pos.y}
                        posLabel={pos.pos}
                        player={player}
                        isSelected={isSelected}
                        onClick={() => !player && onSlotClick(idx)}
                        onRemove={() => onRemovePlayer(idx)}
                    />
                )
            })}
        </div>
    )
}

// ── Individual Slot ───────────────────────────────────────────

interface PlayerSlotProps {
    index: number
    x: number   // % from left
    y: number   // % from top  (pitch coordinate)
    posLabel: string
    player: Player | null
    isSelected: boolean
    onClick: () => void
    onRemove: () => void
}

function PlayerSlot({ index, x, y, posLabel, player, isSelected, onClick, onRemove }: PlayerSlotProps) {
    const color = getPositionColor(posLabel)

    // Map y from pitch coords (0-100) to padded container (5%-95%)
    const topPct = 4 + (y / 100) * 92

    return (
        <div
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${x}%`, top: `${topPct}%` }}
        >
            <AnimatePresence mode="wait">
                {player ? (
                    // ── Filled slot ──────────────────────────────────
                    <motion.div
                        key={`filled-${player.id}`}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', bounce: 0.5, duration: 0.4 }}
                        className="relative group cursor-pointer"
                        onClick={onClick}
                    >
                        {/* Avatar circle */}
                        <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 shadow-lg"
                            style={{
                                background: `radial-gradient(circle at 40% 35%, ${color}55, ${color}22)`,
                                borderColor: color,
                                boxShadow: `0 0 12px ${color}66`,
                            }}
                        >
                            {player.flag_emoji}
                        </div>

                        {/* Remove button on hover */}
                        <motion.button
                            initial={{ opacity: 0, scale: 0 }}
                            whileHover={{ opacity: 1, scale: 1 }}
                            className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            onClick={(e) => { e.stopPropagation(); onRemove() }}
                        >
                            <X className="w-2.5 h-2.5 text-white" />
                        </motion.button>

                        {/* Name label */}
                        <div
                            className="absolute top-full mt-0.5 left-1/2 -translate-x-1/2 whitespace-nowrap px-1.5 py-0.5 rounded text-[9px] font-bold text-white max-w-[56px] truncate"
                            style={{ background: 'rgba(2,6,23,0.85)', border: `0.5px solid ${color}55` }}
                        >
                            {player.short_name.split(' ').pop()}
                        </div>

                        {/* Price tag */}
                        <div
                            className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap px-1 rounded text-[8px] font-semibold"
                            style={{ color, background: 'rgba(2,6,23,0.7)' }}
                        >
                            ${player.price}M
                        </div>
                    </motion.div>
                ) : (
                    // ── Empty slot ───────────────────────────────────
                    <motion.button
                        key={`empty-${index}`}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={onClick}
                        className="flex flex-col items-center gap-0.5 group"
                        id={`slot-${index}`}
                    >
                        <div
                            className={`w-10 h-10 rounded-full border-2 border-dashed flex items-center justify-center transition-all duration-200
                ${isSelected
                                    ? 'border-[#39FF14] bg-[#39FF14]/10 shadow-[0_0_12px_rgba(57,255,20,0.5)]'
                                    : 'border-white/30 bg-black/20 group-hover:border-white/60 group-hover:bg-black/30'}`}
                            style={!isSelected ? { borderColor: `${color}66` } : {}}
                        >
                            <Plus className={`w-3.5 h-3.5 ${isSelected ? 'text-[#39FF14]' : 'text-white/50 group-hover:text-white/80'}`} />
                        </div>
                        <span
                            className="text-[9px] font-bold px-1 py-0.5 rounded"
                            style={{ color, background: 'rgba(2,6,23,0.7)' }}
                        >
                            {posLabel}
                        </span>
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    )
}
