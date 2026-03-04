'use client'
/**
 * useSupabaseRealtime
 * Subscribes to a Supabase Realtime channel and calls a handler
 * whenever a matching event arrives. Handles connection/cleanup automatically.
 */

import { useEffect, useRef } from 'react'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

interface UseSupabaseRealtimeOptions<T extends Record<string, unknown>> {
    channel: string
    table: string
    event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*'
    filter?: string
    onEvent: (payload: RealtimePostgresChangesPayload<T>) => void
    enabled?: boolean
}

export function useSupabaseRealtime<T extends Record<string, unknown>>({
    channel,
    table,
    event = '*',
    filter,
    onEvent,
    enabled = true,
}: UseSupabaseRealtimeOptions<T>) {
    const onEventRef = useRef(onEvent)
    onEventRef.current = onEvent

    useEffect(() => {
        if (!enabled) return

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        if (!supabaseUrl || !supabaseUrl.startsWith('http')) return

        let cleanup: (() => void) | undefined

        async function subscribe() {
            const { createClient } = await import('@/lib/supabase/client')
            const supabase = createClient()

            const sub = supabase
                .channel(channel)
                .on(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    'postgres_changes' as any,
                    { event, schema: 'public', table, ...(filter ? { filter } : {}) },
                    (payload: RealtimePostgresChangesPayload<T>) => {
                        onEventRef.current(payload)
                    }
                )
                .subscribe()

            cleanup = () => { supabase.removeChannel(sub) }
        }

        subscribe()

        return () => { cleanup?.() }
    }, [channel, table, event, filter, enabled])
}
