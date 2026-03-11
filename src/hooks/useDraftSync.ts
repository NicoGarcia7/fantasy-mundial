'use client'

import { useEffect, useRef } from 'react'
import { useDraftStore } from '@/store/draftStore'
import { createClient } from '@/lib/supabase/client'
import type { Player, Formation } from '@/types'

export function useDraftSync() {
    const isMounted = useRef(true)
    const { setFormation, setTeamName, squad, bench, addPlayer } = useDraftStore()

    useEffect(() => {
        isMounted.current = true
        async function loadFromSupabase() {
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
            if (!supabaseUrl || !supabaseUrl.startsWith('http')) return

            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) return

            // 1. Fetch team metadata
            const { data: team, error: teamErr } = await supabase
                .from('user_teams')
                .select('id, name, formation, budget_used')
                .eq('user_id', user.id)
                .single()

            if (teamErr || !team) return // No team saved yet, keep local state

            // 2. Fetch players
            const { data: teamPlayers, error: playersErr } = await supabase
                .from('user_team_players')
                .select(`
                    slot_index,
                    is_bench,
                    players (*)
                `)
                .eq('team_id', team.id)

            if (playersErr || !teamPlayers) return

            if (!isMounted.current) return

            // 3. Apply to store
            setTeamName(team.name)
            setFormation(team.formation as Formation)

            // Clear current squad briefly before injecting Supabase state
            // It's mostly to ensure clean sync. In a real app we'd dispatch a full REPLACE action.
            useDraftStore.setState({
                squad: Array(11).fill(null),
                bench: Array(4).fill(null),
                budgetUsed: 0
            })

            teamPlayers.forEach(tp => {
                const p = tp.players as unknown as Player
                // Map DB player to expected frontend Player format if needed
                if (p) {
                    addPlayer(p, tp.slot_index >= 11 ? tp.slot_index - 11 : tp.slot_index, tp.is_bench)
                }
            })
        }

        loadFromSupabase()

        return () => { isMounted.current = false }
    }, [setFormation, setTeamName, addPlayer])
}
