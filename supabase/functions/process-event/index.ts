// supabase/functions/process-event/index.ts
// Supabase Edge Function — Called by a webhook or admin action
// when a new match_event is inserted.
// Invokes apply_match_event_points() and broadcasts via Realtime.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        )

        const body = await req.json()
        const { event_id } = body

        if (!event_id) {
            return new Response(
                JSON.stringify({ error: 'event_id is required' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Call the SQL function to process points
        const { error } = await supabase.rpc('apply_match_event_points', { event_id })

        if (error) throw error

        // Fetch the processed event for the broadcast payload
        const { data: event } = await supabase
            .from('match_events')
            .select(`
        *,
        player:players(name, short_name, team_code, position),
        fixture:match_fixtures(home_team_code, away_team_code, stage)
      `)
            .eq('id', event_id)
            .single()

        return new Response(
            JSON.stringify({ success: true, event }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    } catch (err) {
        return new Response(
            JSON.stringify({ error: (err as Error).message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
