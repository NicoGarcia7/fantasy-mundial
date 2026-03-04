'use client'
/**
 * BudgetBar — Animated budget status bar
 * Shows remaining budget with color-coded fill and neon animations
 */

import { motion } from 'framer-motion'
import { useDraftStore } from '@/store/draftStore'
import { BUDGET_TOTAL } from '@/types'

export default function BudgetBar() {
    const budgetUsed = useDraftStore((s) => s.budgetUsed)
    const budgetBonus = useDraftStore((s) => s.budgetBonus)
    const getTotalBudget = useDraftStore((s) => s.getTotalBudget)
    const squad = useDraftStore((s) => s.squad)
    const bench = useDraftStore((s) => s.bench)

    const total = getTotalBudget()
    const remaining = total - budgetUsed
    const pct = Math.min((budgetUsed / total) * 100, 100)
    const filledSlots = [...squad, ...bench].filter(Boolean).length

    const barColor =
        pct < 60 ? '#39FF14' :
            pct < 85 ? '#f59e0b' :
                '#ef4444'

    const barGlow =
        pct < 60 ? 'rgba(57,255,20,0.5)' :
            pct < 85 ? 'rgba(245,158,11,0.5)' :
                'rgba(239,68,68,0.5)'

    return (
        <div className="glass-card px-4 py-3 space-y-2">
            {/* Top row */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-xs font-medium">Presupuesto</span>
                    {budgetBonus > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/30 font-bold">
                            +${budgetBonus}M bonus
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-slate-500 text-xs">{filledSlots}/15 jugadores</span>
                </div>
            </div>

            {/* Bar */}
            <div className="relative h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                    className="h-full rounded-full budget-bar-fill"
                    style={{ background: barColor, boxShadow: `0 0 8px ${barGlow}` }}
                    animate={{ width: `${pct}%` }}
                    transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                />
            </div>

            {/* Bottom row */}
            <div className="flex items-center justify-between">
                <div>
                    <span className="text-slate-500 text-[10px]">Gastado: </span>
                    <span className="text-slate-300 text-xs font-bold">${budgetUsed.toFixed(1)}M</span>
                </div>
                <motion.div
                    key={remaining}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    className="flex items-baseline gap-1"
                >
                    <span className="text-slate-400 text-xs">Disponible:</span>
                    <span
                        className="font-display text-lg font-bold leading-none"
                        style={{ color: barColor, textShadow: `0 0 10px ${barGlow}` }}
                    >
                        ${remaining.toFixed(1)}M
                    </span>
                </motion.div>
            </div>
        </div>
    )
}
