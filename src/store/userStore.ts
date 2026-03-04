import { create } from 'zustand'
import type { UserProfile } from '@/types'

interface UserState {
    profile: UserProfile | null
    isLoading: boolean
    setProfile: (profile: UserProfile | null) => void
    setLoading: (loading: boolean) => void
    updateProfile: (updates: Partial<UserProfile>) => void
}

export const useUserStore = create<UserState>((set) => ({
    profile: null,
    isLoading: true,
    setProfile: (profile) => set({ profile, isLoading: false }),
    setLoading: (isLoading) => set({ isLoading }),
    updateProfile: (updates) =>
        set((state) => ({
            profile: state.profile ? { ...state.profile, ...updates } : null,
        })),
}))
