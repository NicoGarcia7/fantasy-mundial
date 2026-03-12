'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Save, RotateCcw, CheckCircle2, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import FootballPitch from '@/components/draft/FootballPitch'
import BudgetBar from '@/components/draft/BudgetBar'
import FormationSelector from '@/components/draft/FormationSelector'
import { useDraftCloud } from '@/hooks/useDraftCloud'
import PlayerPicker from '@/components/draft/PlayerPicker'
import BenchRow from '@/components/draft/BenchRow'

import { useDraftStore } from '@/store/draftStore'
import { FORMATIONS } from '@/lib/constants'
import type { Player, PlayerPosition, Formation } from '@/types'

// ── Which position does a squad slot require? ─────────────────
function getSlotPosition(formation: Formation, slotIndex: number): PlayerPosition {
    return FORMATIONS[formation].positions[slotIndex]?.pos as PlayerPosition ?? 'FWD'
}

export default function DraftPage() {
    const {
        formation, squad, bench,
        teamName, budgetUsed,
        setFormation, addPlayer, removePlayer, setTeamName, resetDraft,
        getTotalBudget, getBudgetRemaining,
    } = useDraftStore()

    // Which slot is the picker open for
    const [pickerOpen, setPickerOpen] = useState(false)
    const [activeSlot, setActiveSlot] = useState<{ index: number; isBench: boolean } | null>(null)
    const [editingName, setEditingName] = useState(false)
    const [nameInput, setNameInput] = useState(teamName)
    const [isSaving, setIsSaving] = useState(false)
    const [savedOnce, setSavedOnce] = useState(false)

    // Cloud sync: loads squad from Supabase on mount, saves back on every change
    const { forceSave } = useDraftCloud()

    const filledStarters = squad.filter(Boolean).length
    const filledBench = bench.filter(Boolean).length
    const totalFilled = filledStarters + filledBench
    const isComplete = filledStarters === 11 && filledBench === 4

    // ── Open picker for a starter slot ─────────────────────────
    const handleStarterSlotClick = useCallback((index: number) => {
        setActiveSlot({ index, isBench: false })
        setPickerOpen(true)
    }, [])

    // ── Open picker for a bench slot ───────────────────────────
    const handleBenchSlotClick = useCallback((index: number) => {
        setActiveSlot({ index, isBench: true })
        setPickerOpen(true)
    }, [])

    // ── Player selected from picker ─────────────────────────────
    const handlePlayerSelect = useCallback((player: Player) => {
        if (!activeSlot) return
        const remaining = getBudgetRemaining()
        if (player.price > remaining) {
            toast.error(`Sin presupuesto. Te faltan $${(player.price - remaining).toFixed(1)}M`)
            return
        }
        addPlayer(player, activeSlot.index, activeSlot.isBench)
        setPickerOpen(false)
        setActiveSlot(null)

        // Haptic feedback (mobile)
        if (navigator.vibrate) navigator.vibrate(30)

        toast.success(`${player.flag_emoji} ${player.short_name} agregado`, {
            description: `$${player.price}M · ${player.position}`,
        })
    }, [activeSlot, addPlayer, getBudgetRemaining])

    // ── Remove from starters ────────────────────────────────────
    const handleRemoveStarter = useCallback((index: number) => {
        const p = squad[index]
        if (!p) return
        removePlayer(index, false)
        toast.info(`${p.short_name} eliminado del equipo`)
    }, [squad, removePlayer])

    // ── Remove from bench ───────────────────────────────────────
    const handleRemoveBench = useCallback((index: number) => {
        const p = bench[index]
        if (!p) return
        removePlayer(index, true)
        toast.info(`${p.short_name} eliminado del banco`)
    }, [bench, removePlayer])

    // ── Save team ──────────────────────────────────────────────
    const handleSave = async () => {
        if (filledStarters < 11) {
            toast.error(`Faltan ${11 - filledStarters} titulares`)
            return
        }
        setIsSaving(true)
        await forceSave()
        setIsSaving(false)
        setSavedOnce(true)
        toast.success('¡Equipo guardado! 🏆', {
            description: 'Tu equipo está listo y seguro en la base de datos.',
        })
    }

    // ── Save team name ─────────────────────────────────────────
    const handleSaveName = () => {
        setTeamName(nameInput.trim() || 'Mi Equipo')
        setEditingName(false)
    }

    // ── Active slot position ────────────────────────────────────
    const activeSlotPosition = activeSlot
        ? activeSlot.isBench
            ? null  // bench = any position
            : getSlotPosition(formation, activeSlot.index)
        : null

    return (
        <div className="min-h-screen bg-[#020617] pb-24">
            {/* ── Top section ───────────────────────────────────── */}
            <div className="sticky top-14 z-30 bg-[#020617]/95 backdrop-blur border-b border-slate-800/80 px-4 py-3 space-y-3">
                {/* Team name + save */}
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
                        {/* Auto-save indicator */}
                        <AutoSaveIndicator status={saveStatus} lastSaved={lastSaved} />

                        <Button
                            size="sm"
                            variant="outline"
                            onClick={resetDraft}
                            id="draft-reset-btn"
                            className="border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-700 h-9 px-3"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleSave}
                            disabled={isSaving}
                            id="draft-save-btn"
                            className={`h-9 px-4 font-bold text-sm rounded-xl gap-2 transition-all ${isComplete
                                ? 'bg-[#39FF14] text-black hover:bg-[#39FF14]/90 shadow-[0_0_15px_rgba(57,255,20,0.4)]'
                                : 'bg-slate-700 text-slate-400'
                                }`}
                        >
                            {isSaving ? (
                                <div className="w-4 h-4 border-2 border-black/40 border-t-black rounded-full animate-spin" />
                            ) : savedOnce ? (
                                <><CheckCircle2 className="w-4 h-4" /> Guardado</>
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
                        toast.info(`Formación cambiada a ${f}`)
                    }}
                />

                {/* Budget bar */}
                <BudgetBar />

                {/* Progress */}
                <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                        {filledStarters}/11 titulares · {filledBench}/4 suplentes
                    </span>
                    {isComplete && (
                        <motion.span
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-[#39FF14] font-bold flex items-center gap-1"
                        >
                            <CheckCircle2 className="w-3 h-3" /> ¡Equipo completo!
                        </motion.span>
                    )}
                </div>
            </div>

            {/* ── Pitch ─────────────────────────────────────────── */}
            <div className="px-4 pt-4 pb-2 max-w-sm mx-auto">
                <FootballPitch
                    formation={formation}
                    squad={squad}
                    onSlotClick={handleStarterSlotClick}
                    onRemovePlayer={handleRemoveStarter}
                    selectedSlot={activeSlot && !activeSlot.isBench ? activeSlot.index : null}
                />
            </div>

            {/* ── Bench ─────────────────────────────────────────── */}
            <div className="px-4 max-w-sm mx-auto">
                <BenchRow
                    bench={bench}
                    onSlotClick={handleBenchSlotClick}
                    onRemove={handleRemoveBench}
                    selectedSlot={activeSlot?.isBench ? activeSlot.index : null}
                />
            </div>

            {/* ── Tip card ──────────────────────────────────────── */}
            <div className="px-4 pt-4 max-w-sm mx-auto">
                <div className="glass-card p-3 flex items-start gap-3">
                    <span className="text-lg">💡</span>
                    <p className="text-slate-400 text-xs leading-relaxed">
                        Tocá un círculo vacío en la cancha para elegir un jugador.
                        Presupuesto total: <strong className="text-white">${getTotalBudget()}M</strong>.
                        Los suplentes pueden ser de cualquier posición.
                    </p>
                </div>
            </div>

            {/* ── Player Picker Modal ────────────────────────────── */}
            <PlayerPicker
                isOpen={pickerOpen}
                slotPosition={activeSlotPosition}
                onSelect={handlePlayerSelect}
                onClose={() => { setPickerOpen(false); setActiveSlot(null) }}
            />
        </div>
    )
}
