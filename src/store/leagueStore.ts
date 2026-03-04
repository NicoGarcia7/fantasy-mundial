/**
 * leagueStore — Zustand store for user leagues
 * Persisted to localStorage
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { League, LeagueMember } from '@/types'

interface LeagueState {
    leagues: League[]
    activeLeague: League | null
    leaderboard: LeagueMember[]
    isLoading: boolean

    // Original actions
    setLeagues: (leagues: League[]) => void
    setActiveLeague: (league: League | null) => void
    setLeaderboard: (members: LeagueMember[]) => void
    addLeague: (league: League) => void
    setLoading: (loading: boolean) => void

    // Extended actions
    updateLeague: (id: string, patch: Partial<League>) => void
    removeLeague: (id: string) => void
    getLeagueById: (id: string) => League | undefined
}

export const useLeagueStore = create<LeagueState>()(
    persist(
        (set, get) => ({
            leagues: [],
            activeLeague: null,
            leaderboard: [],
            isLoading: false,

            setLeagues: (leagues) => set({ leagues }),
            setActiveLeague: (activeLeague) => set({ activeLeague }),
            setLeaderboard: (leaderboard) => set({ leaderboard }),
            addLeague: (league) => set((s) => ({ leagues: [...s.leagues, league] })),
            setLoading: (isLoading) => set({ isLoading }),

            updateLeague: (id, patch) =>
                set((s) => ({
                    leagues: s.leagues.map((l) => (l.id === id ? { ...l, ...patch } : l)),
                    activeLeague: s.activeLeague?.id === id ? { ...s.activeLeague, ...patch } : s.activeLeague,
                })),

            removeLeague: (id) =>
                set((s) => ({
                    leagues: s.leagues.filter((l) => l.id !== id),
                    activeLeague: s.activeLeague?.id === id ? null : s.activeLeague,
                })),

            getLeagueById: (id) => get().leagues.find((l) => l.id === id),
        }),
        { name: 'fantasy-leagues' }
    )
)

/** Generate a random 6-char uppercase invite code */
export function generateLeagueCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    return Array.from({ length: 6 }, () =>
        chars[Math.floor(Math.random() * chars.length)]
    ).join('')
}
