'use client'
/**
 * useDraftCloud
 *
 * Single source of truth for draft persistence.
 * - Loads from Supabase (user_teams.squad_json / bench_json) on mount
 * - Saves to Supabase 1.5s after any change (debounced)
 * - Returns isLoading so the page can show a skeleton
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { useDraftStore } from '@/store/draftStore'
import type { Formation, Player } from '@/types'

const DEBOUNCE_MS = 1500

function isSupabaseReady() {
    return !!process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith('http')
}

export function useDraftCloud() {
    const [isLoading, setIsLoading] = useState(true)
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const isMounted = useRef(true)

    const squad = useDraftStore((s) => s.squad)
    const bench = useDraftStore((s) => s.bench)
    const formation = useDraftStore((s) => s.formation)
    const teamName = useDraftStore((s) => s.teamName)
    const budgetUsed = useDraftStore((s) => s.budgetUsed)
    const replaceAll = useDraftStore((s) => s.replaceAll)

    // ── LOAD from Supabase on mount ──────────────────────────────
    useEffect(() => {
        isMounted.current = true

        async function load() {
            if (!isSupabaseReady()) { setIsLoading(false); return }
            try {
                const { createClient } = await import('@/lib/supabase/client')
                const supabase = createClient()
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) { setIsLoading(false); return }

                const { data: team } = await supabase
                    .from('user_teams')
                    .select('name, formation, budget_used, squad_json, bench_json')
                    .eq('user_id', user.id)
                    .single()

                if (!isMounted.current) return

                if (team) {
                    const savedSquad = Array.isArray(team.squad_json) ? team.squad_json as (Player | null)[] : Array(11).fill(null)
                    const savedBench = Array.isArray(team.bench_json) ? team.bench_json as (Player | null)[] : Array(4).fill(null)
                    const hasPlayers = savedSquad.some(Boolean) || savedBench.some(Boolean)
                    if (hasPlayers) {
                        replaceAll({
                            squad: savedSquad,
                            bench: savedBench,
                            formation: (team.formation as Formation) ?? '4-3-3',
                            teamName: team.name ?? 'Mi Equipo',
                            budgetUsed: team.budget_used ?? 0,
                        })
                    }
                }
            } catch (err) {
                console.warn('[DraftCloud] Load error:', err)
            } finally {
                if (isMounted.current) setIsLoading(false)
            }
        }

        load()
        return () => { isMounted.current = false }
    }, [replaceAll])

    // ── SAVE to Supabase (debounced) ─────────────────────────────
    const doSave = useCallback(async () => {
        if (!isMounted.current || !isSupabaseReady()) return
        try {
            setSaveStatus('saving')
            const { createClient } = await import('@/lib/supabase/client')
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { setSaveStatus('idle'); return }

            // Ensure profile exists
            await supabase.from('profiles').upsert(
                { id: user.id, username: user.email?.split('@')[0] ?? `user_${user.id.slice(0, 6)}` },
                { onConflict: 'id', ignoreDuplicates: true }
            )

            const { error } = await supabase.from('user_teams').upsert(
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

            if (error) throw error
            if (!isMounted.current) return
            setSaveStatus('saved')
            setTimeout(() => isMounted.current && setSaveStatus('idle'), 2000)
        } catch (err) {
            console.warn('[DraftCloud] Save error:', err)
            if (isMounted.current) setSaveStatus('error')
            setTimeout(() => isMounted.current && setSaveStatus('idle'), 4000)
        }
    }, [squad, bench, formation, teamName, budgetUsed])

    useEffect(() => {
        if (isLoading) return                                    // don't save while loading
        if (!squad.some(Boolean) && !bench.some(Boolean)) return // don't save empty squads
        if (timerRef.current) clearTimeout(timerRef.current)
        timerRef.current = setTimeout(doSave, DEBOUNCE_MS)
        return () => { if (timerRef.current) clearTimeout(timerRef.current) }
    }, [squad, bench, formation, teamName, budgetUsed, isLoading, doSave])

    return { isLoading, saveStatus, forceSave: doSave }
}
