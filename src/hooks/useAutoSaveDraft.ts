'use client'
/**
 * useAutoSaveDraft
 *
 * Watches the Zustand draftStore and debounces saves to Supabase.
 * Falls back to localStorage-only (already handled by the persist middleware).
 *
 * Returns: { saveStatus: 'idle' | 'saving' | 'saved' | 'error', lastSaved: Date | null }
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { useDraftStore } from '@/store/draftStore'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

const DEBOUNCE_MS = 2000   // 2s after last change
const isSupabaseReady = () =>
    typeof process.env.NEXT_PUBLIC_SUPABASE_URL === 'string' &&
    process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('http')

export function useAutoSaveDraft() {
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
    const [lastSaved, setLastSaved] = useState<Date | null>(null)
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const isMounted = useRef(true)

    // Watch the fields that matter for a save
    const squad = useDraftStore((s) => s.squad)
    const bench = useDraftStore((s) => s.bench)
    const formation = useDraftStore((s) => s.formation)
    const teamName = useDraftStore((s) => s.teamName)
    const budgetUsed = useDraftStore((s) => s.budgetUsed)

    const doSave = useCallback(async () => {
        if (!isMounted.current) return

        // localStorage is always up-to-date via Zustand persist.
        // Only push to Supabase if configured.
        if (!isSupabaseReady()) {
            // Still mark as "saved" — it's safe in localStorage
            setSaveStatus('saved')
            setLastSaved(new Date())
            setTimeout(() => isMounted.current && setSaveStatus('idle'), 3000)
            return
        }

        setSaveStatus('saving')
        try {
            const { createClient } = await import('@/lib/supabase/client')
            const supabase = createClient()

            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                // Not logged in — localStorage save is sufficient
                setSaveStatus('saved')
                setLastSaved(new Date())
                setTimeout(() => isMounted.current && setSaveStatus('idle'), 3000)
                return
            }

            // Upsert the team record
            const { data: team, error: teamErr } = await supabase
                .from('user_teams')
                .upsert(
                    { user_id: user.id, name: teamName, formation, budget_used: budgetUsed },
                    { onConflict: 'user_id' }
                )
                .select('id')
                .single()

            if (teamErr) throw teamErr

            // Delete existing player slots and re-insert
            await supabase.from('user_team_players').delete().eq('team_id', team.id)

            const playerRows = [
                ...squad.map((p, i) => p ? { team_id: team.id, player_id: p.id, slot_index: i, is_bench: false } : null),
                ...bench.map((p, i) => p ? { team_id: team.id, player_id: p.id, slot_index: i + 11, is_bench: true } : null),
            ].filter(Boolean)

            if (playerRows.length > 0) {
                const { error: playersErr } = await supabase
                    .from('user_team_players')
                    .insert(playerRows)
                if (playersErr) throw playersErr
            }

            if (!isMounted.current) return
            setSaveStatus('saved')
            setLastSaved(new Date())
            setTimeout(() => isMounted.current && setSaveStatus('idle'), 3000)
        } catch (err) {
            console.error('[AutoSave] Error:', err)
            if (!isMounted.current) return
            setSaveStatus('error')
            setTimeout(() => isMounted.current && setSaveStatus('idle'), 5000)
        }
    }, [squad, bench, formation, teamName, budgetUsed])

    // Debounce: restart timer on every store change
    useEffect(() => {
        // Don't auto-save if the squad is completely empty (fresh state)
        const hasAnyPlayer = squad.some(Boolean) || bench.some(Boolean)
        if (!hasAnyPlayer) return

        setSaveStatus('idle')
        if (timerRef.current) clearTimeout(timerRef.current)
        timerRef.current = setTimeout(doSave, DEBOUNCE_MS)

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current)
        }
    }, [squad, bench, formation, teamName, doSave])

    // Cleanup on unmount
    useEffect(() => {
        isMounted.current = true
        return () => { isMounted.current = false }
    }, [])

    return { saveStatus, lastSaved, forceSave: doSave }
}
