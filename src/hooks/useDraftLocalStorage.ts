'use client'
/**
 * useDraftLocalStorage
 *
 * Explicitly saves the draft state to localStorage on every change,
 * and restores it on mount. This bypasses Zustand persist's SSR
 * hydration quirks in Next.js App Router.
 */

import { useEffect, useRef } from 'react'
import { useDraftStore } from '@/store/draftStore'

const STORAGE_KEY = 'fm_draft_v2'

export function useDraftLocalStorage() {
    const initialized = useRef(false)
    const squad = useDraftStore((s) => s.squad)
    const bench = useDraftStore((s) => s.bench)
    const formation = useDraftStore((s) => s.formation)
    const teamName = useDraftStore((s) => s.teamName)
    const budgetUsed = useDraftStore((s) => s.budgetUsed)

    // ── LOAD from localStorage on mount (runs once) ──────────────
    useEffect(() => {
        if (initialized.current) return
        initialized.current = true
        try {
            const raw = localStorage.getItem(STORAGE_KEY)
            if (!raw) return
            const saved = JSON.parse(raw)
            if (saved && typeof saved === 'object') {
                useDraftStore.setState({
                    squad: saved.squad ?? Array(11).fill(null),
                    bench: saved.bench ?? Array(4).fill(null),
                    formation: saved.formation ?? '4-3-3',
                    teamName: saved.teamName ?? 'Mi Equipo',
                    budgetUsed: saved.budgetUsed ?? 0,
                })
            }
        } catch {
            // ignore corrupt storage
        }
    }, [])

    // ── SAVE to localStorage on every state change ───────────────
    useEffect(() => {
        if (!initialized.current) return
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({ squad, bench, formation, teamName, budgetUsed })
            )
        } catch {
            // ignore quota exceeded or private mode
        }
    }, [squad, bench, formation, teamName, budgetUsed])
}
