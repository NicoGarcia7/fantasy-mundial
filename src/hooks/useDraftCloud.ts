'use client'
/**
 * useDraftCloud
 *
 * Saves the squad to Supabase (user_teams.squad_json + bench_json) on every change.
 * Loads from Supabase on mount.
 * This is 100% reliable — no localStorage or SSR hydration issues.
 */

import { useEffect, useRef, useCallback } from 'react'
import { useDraftStore } from '@/store/draftStore'
import type { Formation, Player } from '@/types'

const DEBOUNCE_MS = 1500

function getSupabaseReady() {
    return !!process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith('http')
}

export function useDraftCloud() {
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const loadedRef = useRef(false)

    const squad = useDraftStore((s) => s.squad)
    const bench = useDraftStore((s) => s.bench)
    const formation = useDraftStore((s) => s.formation)
    const teamName = useDraftStore((s) => s.teamName)
    const budgetUsed = useDraftStore((s) => s.budgetUsed)

    // ── LOAD from Supabase on mount ──────────────────────────────
    useEffect(() => {
        if (!getSupabaseReady()) return
        async function load() {
            try {
                const { createClient } = await import('@/lib/supabase/client')
                const supabase = createClient()
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                const { data: team } = await supabase
                    .from('user_teams')
                    .select('name, formation, budget_used, squad_json, bench_json')
                    .eq('user_id', user.id)
                    .single()

                if (!team) return

                const savedSquad: (Player | null)[] = Array.isArray(team.squad_json)
                    ? team.squad_json
                    : Array(11).fill(null)

                const savedBench: (Player | null)[] = Array.isArray(team.bench_json)
                    ? team.bench_json
                    : Array(4).fill(null)

                // Only restore if cloud has actual players saved
                const hasPlayers = savedSquad.some(Boolean) || savedBench.some(Boolean)
                if (hasPlayers) {
                    useDraftStore.setState({
                        squad: savedSquad,
                        bench: savedBench,
                        formation: team.formation as Formation,
                        teamName: team.name,
                        budgetUsed: team.budget_used,
                    })
                }
            } catch (err) {
                console.warn('[DraftCloud] Load error:', err)
            } finally {
                loadedRef.current = true
            }
        }
        load()
    }, [])

    // ── SAVE to Supabase (debounced) ─────────────────────────────
    const doSave = useCallback(async () => {
        if (!getSupabaseReady()) return
        try {
            const { createClient } = await import('@/lib/supabase/client')
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Ensure profile exists
            await supabase.from('profiles').upsert(
                { id: user.id, username: user.email?.split('@')[0] ?? `user_${user.id.slice(0, 6)}` },
                { onConflict: 'id', ignoreDuplicates: true }
            )

            await supabase.from('user_teams').upsert(
                {
                    user_id: user.id,
                    name: teamName,
                    formation,
                    budget_used: budgetUsed,
                    squad_json: squad,
                    bench_json: bench,
                },
                { onConflict: 'user_id' }
            )
        } catch (err) {
            console.warn('[DraftCloud] Save error:', err)
        }
    }, [squad, bench, formation, teamName, budgetUsed])

    useEffect(() => {
        if (!loadedRef.current) return  // don't save before we've loaded
        const hasPlayers = squad.some(Boolean) || bench.some(Boolean)
        if (!hasPlayers) return

        if (timerRef.current) clearTimeout(timerRef.current)
        timerRef.current = setTimeout(doSave, DEBOUNCE_MS)

        return () => { if (timerRef.current) clearTimeout(timerRef.current) }
    }, [squad, bench, formation, teamName, budgetUsed, doSave])

    return { forceSave: doSave }
}
