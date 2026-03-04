import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Player, Formation, DraftSlot, UserTeam } from '@/types'
import { BUDGET_TOTAL, SQUAD_SIZE, BENCH_SIZE } from '@/types'
import { FORMATIONS } from '@/lib/constants'

interface DraftState {
    formation: Formation
    squad: (Player | null)[]    // 11 starters
    bench: (Player | null)[]    // 4 bench players
    budgetUsed: number
    budgetBonus: number         // earned via invites
    teamName: string
    isDraftLocked: boolean

    // Actions
    setFormation: (f: Formation) => void
    addPlayer: (player: Player, slotIndex: number, isBench: boolean) => void
    removePlayer: (slotIndex: number, isBench: boolean) => void
    swapPlayers: (fromIndex: number, fromBench: boolean, toIndex: number, toBench: boolean) => void
    setTeamName: (name: string) => void
    setBudgetBonus: (bonus: number) => void
    resetDraft: () => void
    getTotalBudget: () => number
    getBudgetRemaining: () => number
    getSelectedPlayerIds: () => string[]
    isPositionValid: (player: Player, slotIndex: number) => boolean
}

const emptySquad = (): (Player | null)[] => Array(SQUAD_SIZE).fill(null)
const emptyBench = (): (Player | null)[] => Array(BENCH_SIZE).fill(null)

export const useDraftStore = create<DraftState>()(
    persist(
        (set, get) => ({
            formation: '4-3-3',
            squad: emptySquad(),
            bench: emptyBench(),
            budgetUsed: 0,
            budgetBonus: 0,
            teamName: 'Mi Equipo',
            isDraftLocked: false,

            setFormation: (formation) => {
                set({ formation, squad: emptySquad(), bench: emptyBench(), budgetUsed: 0 })
            },

            addPlayer: (player, slotIndex, isBench) => {
                const state = get()
                const remaining = state.getBudgetRemaining()
                if (player.price > remaining) return // not enough budget

                if (isBench) {
                    const newBench = [...state.bench]
                    const existing = newBench[slotIndex]
                    newBench[slotIndex] = player
                    set({
                        bench: newBench,
                        budgetUsed: state.budgetUsed + player.price - (existing?.price ?? 0),
                    })
                } else {
                    const newSquad = [...state.squad]
                    const existing = newSquad[slotIndex]
                    newSquad[slotIndex] = player
                    set({
                        squad: newSquad,
                        budgetUsed: state.budgetUsed + player.price - (existing?.price ?? 0),
                    })
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

            swapPlayers: (fromIndex, fromBench, toIndex, toBench) => {
                const state = get()
                const newSquad = [...state.squad]
                const newBench = [...state.bench]
                const fromPlayer = fromBench ? newBench[fromIndex] : newSquad[fromIndex]
                const toPlayer = toBench ? newBench[toIndex] : newSquad[toIndex]
                if (fromBench) newBench[fromIndex] = toPlayer
                else newSquad[fromIndex] = toPlayer
                if (toBench) newBench[toIndex] = fromPlayer
                else newSquad[toIndex] = fromPlayer
                set({ squad: newSquad, bench: newBench })
            },

            setTeamName: (name) => set({ teamName: name }),
            setBudgetBonus: (bonus) => set({ budgetBonus: bonus }),
            resetDraft: () => set({ squad: emptySquad(), bench: emptyBench(), budgetUsed: 0 }),

            getTotalBudget: () => BUDGET_TOTAL + get().budgetBonus,
            getBudgetRemaining: () => get().getTotalBudget() - get().budgetUsed,

            getSelectedPlayerIds: () => {
                const { squad, bench } = get()
                return [...squad, ...bench]
                    .filter((p): p is Player => p !== null)
                    .map((p) => p.id)
            },

            isPositionValid: (player, slotIndex) => {
                const { formation } = get()
                const positions = FORMATIONS[formation].positions
                return positions[slotIndex]?.pos === player.position
            },
        }),
        { name: 'fantasy-draft' }
    )
)
