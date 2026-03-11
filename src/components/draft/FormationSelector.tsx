'use client'
/**
 * FormationSelector — Horizontal scrollable formation picker
 * Shows confirmation dialog if the squad already has players selected
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import type { Formation } from '@/types'
import { FORMATIONS } from '@/lib/constants'
import { useDraftStore } from '@/store/draftStore'

const formations = Object.keys(FORMATIONS) as Formation[]

interface FormationSelectorProps {
    current: Formation
    onChange: (f: Formation) => void
}

export default function FormationSelector({ current, onChange }: FormationSelectorProps) {
    const squad = useDraftStore((s) => s.squad)
    const [pendingFormation, setPendingFormation] = useState<Formation | null>(null)

    const hasPlayers = squad.some(Boolean)

    const handleClick = (f: Formation) => {
        if (f === current) return
        if (hasPlayers) {
            // Ask confirmation before clearing squad
            setPendingFormation(f)
        } else {
            onChange(f)
        }
    }

    const confirmChange = () => {
        if (pendingFormation) {
            onChange(pendingFormation)
            setPendingFormation(null)
        }
    }

    return (
        <>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {formations.map((f) => {
                    const isActive = f === current
                    return (
                        <motion.button
                            key={f}
                            id={`formation-${f}`}
                            whileTap={{ scale: 0.93 }}
                            onClick={() => handleClick(f)}
                            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold border transition-all duration-200 ${isActive
                                ? 'bg-[#39FF14] text-black border-[#39FF14] shadow-[0_0_15px_rgba(57,255,20,0.5)]'
                                : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-white'
                                }`}
                        >
                            {f}
                        </motion.button>
                    )
                })}
            </div>

            {/* Confirmation dialog */}
            <AnimatePresence>
                {pendingFormation && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
                        onClick={() => setPendingFormation(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.85, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.85, opacity: 0 }}
                            transition={{ type: 'spring', bounce: 0.3 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#0f172a] border border-slate-700 rounded-2xl p-6 max-w-xs w-full space-y-4 shadow-2xl"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-white font-bold text-sm">¿Cambiar formación?</p>
                                    <p className="text-slate-400 text-xs">{current} → {pendingFormation}</p>
                                </div>
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Cambiar la formación <span className="text-white font-semibold">limpiará tu equipo actual</span>. Vas a perder los jugadores seleccionados.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setPendingFormation(null)}
                                    className="flex-1 h-10 rounded-xl border border-slate-700 text-slate-400 text-sm font-semibold hover:border-slate-500 hover:text-white transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    id="confirm-formation-change"
                                    onClick={confirmChange}
                                    className="flex-1 h-10 rounded-xl bg-amber-500 text-black text-sm font-bold hover:bg-amber-400 transition-all"
                                >
                                    Sí, cambiar
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
