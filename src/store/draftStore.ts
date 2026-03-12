import { create } from 'zustand'
import type { Player, Formation } from '@/types'
import { BUDGET_TOTAL, SQUAD_SIZE, BENCH_SIZE } from '@/types'
import { FORMATIONS } from '@/lib/constants'

// ── Types ────────────────────────────────────────────────────────
interface DraftState {
    formation: Formation
    squad: (Player | null)[]
    bench: (Player | null)[]
    budgetUsed: number
    budgetBonus: number
    teamName: string
    isDraftLocked: boolean

    setFormation: (f: Formation) => void
    setFormationOnly: (f: Formation) => void
    addPlayer: (player: Player, slotIndex: number, isBench: boolean) => void
    removePlayer: (slotIndex: number, isBench: boolean) => void
    setTeamName: (name: string) => void
    setBudgetBonus: (bonus: number) => void
    resetDraft: () => void
    replaceAll: (state: Partial<DraftState>) => void
    getTotalBudget: () => number
    getBudgetRemaining: () => number
    getSelectedPlayerIds: () => string[]
}

const emptySquad = () => Array<Player | null>(SQUAD_SIZE).fill(null)
const emptyBench = () => Array<Player | null>(BENCH_SIZE).fill(null)

// ── Store (no persist — cloud sync handles persistence) ──────────
export const useDraftStore = create<DraftState>()((set, get) => ({
    formation: '4-3-3',
    squad: emptySquad(),
    bench: emptyBench(),
    budgetUsed: 0,
    budgetBonus: 0,
    teamName: 'Mi Equipo',
    isDraftLocked: false,

    setFormation: (formation) =>
        set({ formation, squad: emptySquad(), bench: emptyBench(), budgetUsed: 0 }),

    setFormationOnly: (formation) => set({ formation }),

    addPlayer: (player, slotIndex, isBench) => {
        const state = get()
        if (player.price > state.getBudgetRemaining()) return
        if (isBench) {
            const newBench = [...state.bench]
            const existing = newBench[slotIndex]
            newBench[slotIndex] = player
            set({ bench: newBench, budgetUsed: state.budgetUsed + player.price - (existing?.price ?? 0) })
        } else {
            const newSquad = [...state.squad]
            const existing = newSquad[slotIndex]
            newSquad[slotIndex] = player
            set({ squad: newSquad, budgetUsed: state.budgetUsed + player.price - (existing?.price ?? 0) })
        }
    },

    removePlayer: (slotIndex, isBench) => {
        const state = get()
        if (isBench) {
            const newBench = [...state.bench]
            const removed = newBench[slotIndex]
            newBench[slotIndex] = null
            set({ bench: newBench, budgetUsed: state.budgetUsed - (removed?.price ?? 0) })
        } else {
            const newSquad = [...state.squad]
            const removed = newSquad[slotIndex]
            newSquad[slotIndex] = null
            set({ squad: newSquad, budgetUsed: state.budgetUsed - (removed?.price ?? 0) })
        }
    },

    setTeamName: (name) => set({ teamName: name }),
    setBudgetBonus: (bonus) => set({ budgetBonus: bonus }),
    resetDraft: () => set({ squad: emptySquad(), bench: emptyBench(), budgetUsed: 0 }),

    // Used by cloud sync to restore the full state from DB
    replaceAll: (partial) => set(partial),

    getTotalBudget: () => BUDGET_TOTAL + get().budgetBonus,
    getBudgetRemaining: () => get().getTotalBudget() - get().budgetUsed,
    getSelectedPlayerIds: () =>
        [...get().squad, ...get().bench]
            .filter((p): p is Player => p !== null)
            .map((p) => p.id),
}))
