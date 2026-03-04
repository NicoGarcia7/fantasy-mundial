'use client'
/**
 * FormationSelector — Horizontal scrollable formation picker
 */

import { motion } from 'framer-motion'
import type { Formation } from '@/types'
import { FORMATIONS } from '@/lib/constants'

const formations = Object.keys(FORMATIONS) as Formation[]

interface FormationSelectorProps {
    current: Formation
    onChange: (f: Formation) => void
}

export default function FormationSelector({ current, onChange }: FormationSelectorProps) {
    return (
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {formations.map((f) => {
                const isActive = f === current
                return (
                    <motion.button
                        key={f}
                        id={`formation-${f}`}
                        whileTap={{ scale: 0.93 }}
                        onClick={() => onChange(f)}
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
    )
}
