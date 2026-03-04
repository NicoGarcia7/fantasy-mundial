'use client'
/**
 * BenchRow — The 4-player bench strip below the pitch
 */

import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X } from 'lucide-react'
import type { Player } from '@/types'
import { getPositionColor } from '@/lib/utils'

interface BenchRowProps {
    bench: (Player | null)[]
    onSlotClick: (index: number) => void
    onRemove: (index: number) => void
    selectedSlot: number | null
}

export default function BenchRow({ bench, onSlotClick, onRemove, selectedSlot }: BenchRowProps) {
    return (
        <div className="glass-card p-3">
            <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold mb-2 text-center">
                Suplentes
            </p>
            <div className="flex justify-around">
                {bench.map((player, i) => {
                    const isSelected = selectedSlot === i
                    const color = player ? getPositionColor(player.position) : '#6b7280'

                    return (
                        <div key={i} className="flex flex-col items-center gap-1">
                            <AnimatePresence mode="wait">
                                {player ? (
                                    <motion.div
                                        key={`bench-filled-${player.id}`}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0 }}
                                        transition={{ type: 'spring', bounce: 0.5 }}
                                        className="relative group cursor-pointer"
                                    >
                                        <div
                                            className="w-10 h-10 rounded-full flex items-center justify-center text-sm border-2"
                                            style={{
                                                background: `radial-gradient(circle, ${color}33, ${color}11)`,
                                                borderColor: color,
                                                boxShadow: `0 0 8px ${color}55`,
                                                opacity: 0.8,
                                            }}
                                        >
                                            {player.flag_emoji}
                                        </div>
                                        {/* Remove */}
                                        <button
                                            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 items-center justify-center hidden group-hover:flex"
                                            onClick={() => onRemove(i)}
                                        >
                                            <X className="w-2.5 h-2.5 text-white" />
                                        </button>
                                        <p className="text-[8px] text-slate-400 text-center max-w-[44px] truncate mt-0.5">
                                            {player.short_name.split(' ').pop()}
                                        </p>
                                    </motion.div>
                                ) : (
                                    <motion.button
                                        key={`bench-empty-${i}`}
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0 }}
                                        onClick={() => onSlotClick(i)}
                                        id={`bench-slot-${i}`}
                                        className={`w-10 h-10 rounded-full border-2 border-dashed flex items-center justify-center transition-all duration-200 ${isSelected
                                                ? 'border-[#39FF14] bg-[#39FF14]/10'
                                                : 'border-slate-600 bg-black/20 hover:border-slate-400'
                                            }`}
                                    >
                                        <Plus className={`w-3.5 h-3.5 ${isSelected ? 'text-[#39FF14]' : 'text-slate-500'}`} />
                                    </motion.button>
                                )}
                            </AnimatePresence>
                            {!player && (
                                <span className="text-[8px] text-slate-600">SUP {i + 1}</span>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
