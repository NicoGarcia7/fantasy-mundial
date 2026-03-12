'use client'
/**
 * Draft Page — clean rewrite
 *
 * Features:
 * - Formation selector with confirmation dialog (via FormationSelector)
 * - Football pitch visualization
 * - Budget bar
 * - Player picker modal
 * - Bench row
 * - Cloud sync: loads from / saves to Supabase automatically
 */

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Save, RotateCcw, CheckCircle2, Pencil, Cloud, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import FootballPitch from '@/components/draft/FootballPitch'
import BudgetBar from '@/components/draft/BudgetBar'
import FormationSelector from '@/components/draft/FormationSelector'
import PlayerPicker from '@/components/draft/PlayerPicker'
import BenchRow from '@/components/draft/BenchRow'
import { useDraftCloud } from '@/hooks/useDraftCloud'

import { useDraftStore } from '@/store/draftStore'
import { FORMATIONS } from '@/lib/constants'
import type { Player, PlayerPosition, Formation } from '@/types'

function getSlotPosition(formation: Formation, slotIndex: number): PlayerPosition {
    return (FORMATIONS[formation].positions[slotIndex]?.pos as PlayerPosition) ?? 'FWD'
}

// ── Save status indicator ────────────────────────────────────────
function SaveBadge({ status }: { status: 'idle' | 'saving' | 'saved' | 'error' }) {
    if (status === 'idle') return null
    const map = {
        saving: { label: 'Guardando…', cls: 'text-slate-400', icon: <Loader2 className="w-3 h-3 animate-spin" /> },
        saved: { label: 'Guardado', cls: 'text-[#39FF14]', icon: <Cloud className="w-3 h-3" /> },
        error: { label: 'Error', cls: 'text-red-400', icon: null },
    }
    const item = map[status]
    return (
        <span className={`flex items-center gap-1 text-xs font-medium ${item.cls}`}>
            {item.icon}{item.label}
        </span>
    )
}

export default function DraftPage() {
    const {
        formation, squad, bench, teamName, budgetUsed,
        setFormation, addPlayer, removePlayer, setTeamName, resetDraft,
        getTotalBudget, getBudgetRemaining,
    } = useDraftStore()

    // Cloud sync: auto-loads on mount, auto-saves on change
    const { isLoading, saveStatus, forceSave } = useDraftCloud()

    // UI state
    const [pickerOpen, setPickerOpen] = useState(false)
    const [activeSlot, setActiveSlot] = useState<{ index: number; isBench: boolean } | null>(null)
    const [editingName, setEditingName] = useState(false)
    const [nameInput, setNameInput] = useState(teamName)

    const filledStarters = squad.filter(Boolean).length
    const filledBench = bench.filter(Boolean).length
    const isComplete = filledStarters === 11 && filledBench === 4

    // ── Open picker ─────────────────────────────────────────────
    const openPickerForStarter = useCallback((index: number) => {
        setActiveSlot({ index, isBench: false })
        setPickerOpen(true)
    }, [])

    const openPickerForBench = useCallback((index: number) => {
        setActiveSlot({ index, isBench: true })
        setPickerOpen(true)
    }, [])

    // ── Player selected ─────────────────────────────────────────
    const handlePlayerSelect = useCallback((player: Player) => {
        if (!activeSlot) return
        const remaining = getBudgetRemaining()
        if (player.price > remaining) {
            toast.error(`Sin presupuesto: te faltan $${(player.price - remaining).toFixed(1)}M`)
            return
        }
        addPlayer(player, activeSlot.index, activeSlot.isBench)
        setPickerOpen(false)
        setActiveSlot(null)
        if (navigator.vibrate) navigator.vibrate(30)
        toast.success(`${player.flag_emoji} ${player.short_name} agregado`, {
            description: `$${player.price}M · ${player.position}`,
        })
    }, [activeSlot, addPlayer, getBudgetRemaining])

    // ── Remove player ───────────────────────────────────────────
    const handleRemoveStarter = useCallback((index: number) => {
        const p = squad[index]
        if (!p) return
        removePlayer(index, false)
        toast.info(`${p.short_name} eliminado`)
    }, [squad, removePlayer])

    const handleRemoveBench = useCallback((index: number) => {
        const p = bench[index]
        if (!p) return
        removePlayer(index, true)
        toast.info(`${p.short_name} eliminado del banco`)
    }, [bench, removePlayer])

    // ── Save team ───────────────────────────────────────────────
    const handleSave = async () => {
        if (filledStarters < 11) {
            toast.error(`Faltan ${11 - filledStarters} titulares`)
            return
        }
        await forceSave()
        toast.success('¡Equipo guardado! 🏆')
    }

    // ── Save name ───────────────────────────────────────────────
    const handleSaveName = () => {
        setTeamName(nameInput.trim() || 'Mi Equipo')
        setEditingName(false)
    }

    const activeSlotPosition = activeSlot
        ? activeSlot.isBench ? null : getSlotPosition(formation, activeSlot.index)
        : null

    // ── Loading skeleton ────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-2 border-[#39FF14]/30 border-t-[#39FF14] rounded-full animate-spin" />
                    <p className="text-slate-400 text-sm">Cargando tu equipo…</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#020617] pb-28">
            {/* ── Sticky header ─────────────────────────────── */}
            <div className="sticky top-14 z-30 bg-[#020617]/95 backdrop-blur border-b border-slate-800/80 px-4 py-3 space-y-3">
                {/* Team name + actions */}
                <div className="flex items-center gap-3">
                    {editingName ? (
                        <div className="flex gap-2 flex-1">
                            <Input
                                id="team-name-input"
                                value={nameInput}
                                onChange={(e) => setNameInput(e.target.value)}
                                onBlur={handleSaveName}
                                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                                className="h-9 bg-slate-800 border-[#39FF14]/40 text-white font-bold focus:border-[#39FF14] rounded-xl"
                                autoFocus
                                maxLength={30}
                            />
                        </div>
                    ) : (
                        <button
                            onClick={() => { setEditingName(true); setNameInput(teamName) }}
                            className="flex items-center gap-2 flex-1 group"
                            id="team-name-btn"
                        >
                            <h1 className="font-display text-2xl font-bold text-white group-hover:text-[#39FF14] transition-colors truncate">
                                {teamName}
                            </h1>
                            <Pencil className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#39FF14] transition-colors flex-shrink-0" />
                        </button>
                    )}

                    <div className="flex items-center gap-2 flex-shrink-0">
                        <SaveBadge status={saveStatus} />
                        <Button
                            size="sm" variant="outline"
                            onClick={() => { resetDraft(); toast.info('Equipo reiniciado') }}
                            id="draft-reset-btn"
                            className="border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-700 h-9 px-3"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleSave}
                            id="draft-save-btn"
                            className={`h-9 px-4 font-bold text-sm rounded-xl gap-2 transition-all ${isComplete
                                    ? 'bg-[#39FF14] text-black hover:bg-[#39FF14]/90 shadow-[0_0_15px_rgba(57,255,20,0.4)]'
                                    : 'bg-slate-700 text-slate-400'
                                }`}
                        >
                            {saveStatus === 'saving' ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <><Save className="w-4 h-4" /> Guardar</>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Formation selector */}
                <FormationSelector
                    current={formation}
                    onChange={(f) => {
                        setFormation(f)
                        toast.info(`Formación: ${f}`)
                    }}
                />

                {/* Budget bar */}
                <BudgetBar />

                {/* Progress */}
                <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                        {filledStarters}/11 titulares · {filledBench}/4 suplentes
                    </span>
                    <AnimatePresence>
                        {isComplete && (
                            <motion.span
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-[#39FF14] font-bold flex items-center gap-1"
                            >
                                <CheckCircle2 className="w-3 h-3" /> ¡Equipo completo!
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* ── Football pitch ─────────────────────────────── */}
            <div className="px-4 pt-4 pb-2 max-w-sm mx-auto">
                <FootballPitch
                    formation={formation}
                    squad={squad}
                    onSlotClick={openPickerForStarter}
                    onRemovePlayer={handleRemoveStarter}
                    selectedSlot={activeSlot && !activeSlot.isBench ? activeSlot.index : null}
                />
            </div>

            {/* ── Bench ─────────────────────────────────────── */}
            <div className="px-4 max-w-sm mx-auto">
                <BenchRow
                    bench={bench}
                    onSlotClick={openPickerForBench}
                    onRemove={handleRemoveBench}
                    selectedSlot={activeSlot?.isBench ? activeSlot.index : null}
                />
            </div>

            {/* ── Tip ───────────────────────────────────────── */}
            <div className="px-4 pt-4 max-w-sm mx-auto">
                <div className="glass-card p-3 flex items-start gap-3">
                    <span className="text-lg">💡</span>
                    <p className="text-slate-400 text-xs leading-relaxed">
                        Tocá un círculo vacío para elegir un jugador.
                        Presupuesto total: <strong className="text-white">${getTotalBudget()}M</strong>.
                        El equipo se guarda automáticamente en la nube.
                    </p>
                </div>
            </div>

            {/* ── Player Picker Modal ────────────────────────── */}
            <PlayerPicker
                isOpen={pickerOpen}
                slotPosition={activeSlotPosition}
                onSelect={handlePlayerSelect}
                onClose={() => { setPickerOpen(false); setActiveSlot(null) }}
            />
        </div>
    )
}
