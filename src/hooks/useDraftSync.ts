'use client'

import { useEffect, useRef } from 'react'
import { useDraftStore } from '@/store/draftStore'
import { createClient } from '@/lib/supabase/client'
import type { Player, Formation } from '@/types'

export function useDraftSync() {
    const isMounted = useRef(true)
    // Use setFormationOnly so we don't wipe the squad on load
    const { setFormationOnly, setTeamName, addPlayer } = useDraftStore()

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

            if (teamErr || !team) return // No team saved yet — keep localStorage state

            // 2. Fetch players in that team
            const { data: teamPlayers, error: playersErr } = await supabase
                .from('user_team_players')
                .select(`slot_index, is_bench, players (*)`)
                .eq('team_id', team.id)

            if (playersErr || !teamPlayers || teamPlayers.length === 0) {
                // Team exists but no players yet — just restore name/formation
                if (!isMounted.current) return
                setTeamName(team.name)
                setFormationOnly(team.formation as Formation)
                return
            }

            if (!isMounted.current) return

            // 3. Apply to store — formation first (without clearing squad)
            setTeamName(team.name)
            setFormationOnly(team.formation as Formation)

            // 4. Reset squad/bench cleanly before injecting DB state
            useDraftStore.setState({
                squad: Array(11).fill(null),
                bench: Array(4).fill(null),
                budgetUsed: 0,
            })

            // 5. Add players from DB
            teamPlayers.forEach(tp => {
                const p = tp.players as unknown as Player
                if (p) {
                    const idx = tp.is_bench
                        ? tp.slot_index - 11
                        : tp.slot_index
                    addPlayer(p, idx >= 0 ? idx : tp.slot_index, tp.is_bench)
                }
            })
        }

        loadFromSupabase()
        return () => { isMounted.current = false }
    }, [setFormationOnly, setTeamName, addPlayer])
}
