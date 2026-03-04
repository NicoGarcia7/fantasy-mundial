'use client'
/**
 * useShare
 * Provides One-Click share functionality with Web Share API fallback
 */

import { useCallback } from 'react'
import { toast } from 'sonner'

interface ShareOptions {
    title: string
    text?: string
    url: string
}

export function useShare() {
    const share = useCallback(async ({ title, text, url }: ShareOptions) => {
        try {
            if (navigator.share) {
                await navigator.share({ title, text, url })
                return true
            }
        } catch (err) {
            // User cancelled — don't show error
            if ((err as Error).name === 'AbortError') return false
        }

        // Fallback: copy to clipboard
        try {
            await navigator.clipboard.writeText(url)
            toast.success('✅ Link copiado al portapapeles', {
                description: 'Pegalo en WhatsApp, Twitter o donde quieras.',
            })
            return true
        } catch {
            toast.error('No se pudo copiar el link')
            return false
        }
    }, [])

    const shareTeam = useCallback((leagueCode: string) => {
        const url = `${window.location.origin}/join/${leagueCode}`
        return share({
            title: '¡Desafiame en Fantasy Mundial 2026! 🏆⚽',
            text: '¡Unite a mi liga y veamos quién arma el mejor equipo del Mundial!',
            url,
        })
    }, [share])

    const shareResult = useCallback((myPoints: number, opponentName: string) => {
        return share({
            title: `¡Le gané a ${opponentName} en Fantasy Mundial! 🔥`,
            text: `Terminé con ${myPoints} puntos esta jornada. ¡Fantasy Mundial 2026 es una locura!`,
            url: window.location.origin,
        })
    }, [share])

    return { share, shareTeam, shareResult }
}
