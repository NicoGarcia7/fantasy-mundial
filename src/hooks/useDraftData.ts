'use client'
/**
 * useDraftData
 * Fetches players from Supabase and exposes search/filter capabilities.
 * Works with the Zustand draftStore for local budget/squad management.
 */

import { useState, useEffect, useCallback } from 'react'
import type { Player, PlayerPosition } from '@/types'

interface UseDraftDataOptions {
    position?: PlayerPosition | 'ALL'
    search?: string
    maxPrice?: number
    sortBy?: 'price' | 'points' | 'form' | 'name'
}

export function useDraftData({
    position = 'ALL',
    search = '',
    maxPrice,
    sortBy = 'points',
}: UseDraftDataOptions = {}) {
    const [players, setPlayers] = useState<Player[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchPlayers = useCallback(async () => {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
            setPlayers(MOCK_PLAYERS)
            return
        }

        setIsLoading(true)
        setError(null)
        try {
            const { createClient } = await import('@/lib/supabase/client')
            const supabase = createClient()

            let query = supabase
                .from('players')
                .select('*')
                .order(sortBy === 'name' ? 'name' : sortBy, { ascending: sortBy === 'name' })

            if (position !== 'ALL') query = query.eq('position', position)
            if (maxPrice) query = query.lte('price', maxPrice)
            if (search) query = query.ilike('name', `%${search}%`)

            const { data, error: sbError } = await query
            if (sbError) throw sbError
            setPlayers((data as Player[]) ?? [])
        } catch (err) {
            setError((err as Error).message)
        } finally {
            setIsLoading(false)
        }
    }, [position, maxPrice, search, sortBy])

    useEffect(() => {
        fetchPlayers()
    }, [fetchPlayers])

    return { players, isLoading, error, refetch: fetchPlayers }
}

// ── Mock player builder ──────────────────────────────────────────
const mk = (
    id: string, name: string, short_name: string,
    nationality: string, flag: string, team: string,
    pos: Player['position'], price: number, form: number
): Player => ({
    id, name, short_name, nationality,
    flag_emoji: flag, team, team_short: team,
    position: pos, price, points: 0,
    goals: 0, assists: 0, clean_sheets: 0,
    yellow_cards: 0, red_cards: 0,
    is_injured: false, is_suspended: false, form,
})

// ── Fallback mock data ─────────────────────────────────────────
// 85+ players across all positions and all price tiers.
// With $100M budget: e.g. 1×GK($5) + 4×DEF($6 avg) + 3×MID($7 avg) + 3×FWD($9 avg) + 4×bench($5 avg) ≈ $98M ✅
export const MOCK_PLAYERS: Player[] = [
    // ── GOALKEEPERS ────────────────────────────────────
    // Premium ($7-8M)
    mk('gk1', 'Emiliano Martínez', 'E. Martínez', 'Argentina', '🇦🇷', 'ARG', 'GK', 8.0, 8.8),
    mk('gk2', 'Alisson Becker', 'Alisson', 'Brasil', '🇧🇷', 'BRA', 'GK', 7.5, 8.5),
    mk('gk3', 'Gianluigi Donnarumma', 'G. Donnarumma', 'Italia', '🇮🇹', 'ITA', 'GK', 7.5, 8.5),
    mk('gk4', 'Mike Maignan', 'M. Maignan', 'Francia', '🇫🇷', 'FRA', 'GK', 7.0, 8.2),
    // Mid ($5.5-6.5M)
    mk('gk5', 'Jordan Pickford', 'J. Pickford', 'Inglaterra', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'ENG', 'GK', 6.0, 7.5),
    mk('gk6', 'Unai Simón', 'U. Simón', 'España', '🇪🇸', 'ESP', 'GK', 6.0, 7.8),
    mk('gk7', 'Ederson', 'Ederson', 'Brasil', '🇧🇷', 'BRA', 'GK', 6.5, 7.8),
    mk('gk8', 'Marc-André ter Stegen', 'ter Stegen', 'Alemania', '🇩🇪', 'GER', 'GK', 6.0, 7.5),
    // Budget ($4-5M)
    mk('gk9', 'Gregor Kobel', 'G. Kobel', 'Suiza', '🇨🇭', 'SUI', 'GK', 5.0, 7.2),
    mk('gk10', 'Guglielmo Vicario', 'G. Vicario', 'Italia', '🇮🇹', 'ITA', 'GK', 4.5, 7.0),
    mk('gk11', 'Bono', 'Bono', 'Marruecos', '🇲🇦', 'MOR', 'GK', 4.5, 7.3),
    mk('gk12', 'Weverton', 'Weverton', 'Brasil', '🇧🇷', 'BRA', 'GK', 4.0, 7.0),
    mk('gk13', 'Matt Turner', 'M. Turner', 'EE. UU.', '🇺🇸', 'USA', 'GK', 4.0, 6.8),

    // ── DEFENDERS ───────────────────────────────────────
    // Premium ($7.5-8.5M)
    mk('d1', 'Virgil van Dijk', 'V. van Dijk', 'Países Bajos', '🇳🇱', 'NED', 'DEF', 8.5, 8.8),
    mk('d2', 'Achraf Hakimi', 'A. Hakimi', 'Marruecos', '🇲🇦', 'MOR', 'DEF', 8.5, 8.8),
    mk('d3', 'William Saliba', 'W. Saliba', 'Francia', '🇫🇷', 'FRA', 'DEF', 8.0, 8.5),
    mk('d4', 'Rúben Dias', 'R. Dias', 'Portugal', '🇵🇹', 'POR', 'DEF', 8.0, 8.5),
    mk('d5', 'Alejandro Grimaldo', 'A. Grimaldo', 'España', '🇪🇸', 'ESP', 'DEF', 8.0, 8.5),
    // Choice ($6.5-7.5M)
    mk('d6', 'Cristian Romero', 'C. Romero', 'Argentina', '🇦🇷', 'ARG', 'DEF', 7.5, 8.0),
    mk('d7', 'Theo Hernández', 'T. Hernández', 'Francia', '🇫🇷', 'FRA', 'DEF', 7.5, 8.0),
    mk('d8', 'Ronald Araújo', 'R. Araújo', 'Uruguay', '🇺🇾', 'URU', 'DEF', 7.5, 8.0),
    mk('d9', 'Trent Alexander-Arnold', 'T. Arnold', 'Inglaterra', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'ENG', 'DEF', 7.5, 8.2),
    mk('d10', 'Marquinhos', 'Marquinhos', 'Brasil', '🇧🇷', 'BRA', 'DEF', 7.0, 8.0),
    mk('d11', 'Nahuel Molina', 'N. Molina', 'Argentina', '🇦🇷', 'ARG', 'DEF', 7.0, 7.8),
    mk('d12', 'Éder Militão', 'E. Militão', 'Brasil', '🇧🇷', 'BRA', 'DEF', 7.0, 7.5),
    mk('d13', 'Antonio Rüdiger', 'A. Rüdiger', 'Alemania', '🇩🇪', 'GER', 'DEF', 7.0, 7.8),
    mk('d14', 'Kalidou Koulibaly', 'K. Koulibaly', 'Senegal', '🇸🇳', 'SEN', 'DEF', 6.5, 7.5),
    mk('d15', 'Mathias Olivera', 'M. Olivera', 'Uruguay', '🇺🇾', 'URU', 'DEF', 6.5, 7.3),
    // Mid ($5-6M)
    mk('d16', 'Vanderson', 'Vanderson', 'Brasil', '🇧🇷', 'BRA', 'DEF', 6.0, 7.0),
    mk('d17', 'Kyle Walker', 'K. Walker', 'Inglaterra', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'ENG', 'DEF', 5.5, 7.0),
    mk('d18', 'Nicolás Tagliafico', 'N. Tagliafico', 'Argentina', '🇦🇷', 'ARG', 'DEF', 5.5, 7.0),
    // Budget ($4-5M)
    mk('d19', 'Nayef Aguerd', 'N. Aguerd', 'Marruecos', '🇲🇦', 'MOR', 'DEF', 5.0, 6.8),
    mk('d20', 'Edmond Tapsoba', 'E. Tapsoba', 'Alemania', '🇩🇪', 'GER', 'DEF', 5.0, 6.8),
    mk('d21', 'Tim Ream', 'T. Ream', 'EE. UU.', '🇺🇸', 'USA', 'DEF', 4.5, 6.5),
    mk('d22', 'Ozan Kabak', 'O. Kabak', 'Turquía', '🇹🇷', 'TUR', 'DEF', 4.5, 6.5),
    mk('d23', 'James Sands', 'J. Sands', 'EE. UU.', '🇺🇸', 'USA', 'DEF', 4.0, 6.2),
    mk('d24', 'Hamari Traoré', 'H. Traoré', 'Senegal', '🇸🇳', 'SEN', 'DEF', 4.0, 6.3),

    // ── MIDFIELDERS ─────────────────────────────────────
    // Premium ($9-13M)
    mk('m1', 'Jude Bellingham', 'J. Bellingham', 'Inglaterra', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'ENG', 'MID', 13.0, 9.5),
    mk('m2', 'Florian Wirtz', 'F. Wirtz', 'Alemania', '🇩🇪', 'GER', 'MID', 12.0, 9.3),
    mk('m3', 'Phil Foden', 'P. Foden', 'Inglaterra', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'ENG', 'MID', 11.5, 9.0),
    mk('m4', 'Jamal Musiala', 'J. Musiala', 'Alemania', '🇩🇪', 'GER', 'MID', 11.5, 9.0),
    mk('m5', 'Pedri', 'Pedri', 'España', '🇪🇸', 'ESP', 'MID', 11.0, 9.2),
    mk('m6', 'Federico Valverde', 'F. Valverde', 'Uruguay', '🇺🇾', 'URU', 'MID', 11.0, 9.0),
    mk('m7', 'Bruno Fernandes', 'B. Fernandes', 'Portugal', '🇵🇹', 'POR', 'MID', 10.5, 8.8),
    mk('m8', 'Rodri', 'Rodri', 'España', '🇪🇸', 'ESP', 'MID', 10.0, 9.0),
    // Choice ($8-9.5M)
    mk('m9', 'Dani Olmo', 'D. Olmo', 'España', '🇪🇸', 'ESP', 'MID', 9.5, 8.5),
    mk('m10', 'Declan Rice', 'D. Rice', 'Inglaterra', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'ENG', 'MID', 9.5, 8.8),
    mk('m11', 'Bernardo Silva', 'B. Silva', 'Portugal', '🇵🇹', 'POR', 'MID', 9.5, 8.8),
    mk('m12', 'Gavi', 'Gavi', 'España', '🇪🇸', 'ESP', 'MID', 9.0, 8.5),
    mk('m13', 'João Neves', 'J. Neves', 'Portugal', '🇵🇹', 'POR', 'MID', 9.0, 8.5),
    mk('m14', 'Bruno Guimarães', 'B. Guimarães', 'Brasil', '🇧🇷', 'BRA', 'MID', 9.0, 8.6),
    mk('m15', 'Alexis Mac Allister', 'A. Mac Allister', 'Argentina', '🇦🇷', 'ARG', 'MID', 9.0, 8.3),
    mk('m16', 'Enzo Fernández', 'E. Fernández', 'Argentina', '🇦🇷', 'ARG', 'MID', 8.5, 7.8),
    mk('m17', 'Lucas Paquetá', 'L. Paquetá', 'Brasil', '🇧🇷', 'BRA', 'MID', 8.5, 8.0),
    mk('m18', 'Rodrigo De Paul', 'R. De Paul', 'Argentina', '🇦🇷', 'ARG', 'MID', 8.0, 7.8),
    mk('m19', 'Tijjani Reijnders', 'T. Reijnders', 'Países Bajos', '🇳🇱', 'NED', 'MID', 8.0, 8.2),
    // Mid ($6.5-7.5M)
    mk('m20', 'Christian Eriksen', 'C. Eriksen', 'Dinamarca', '🇩🇰', 'DEN', 'MID', 7.5, 8.0),
    mk('m21', 'James Rodríguez', 'J. Rodríguez', 'Colombia', '🇨🇴', 'COL', 'MID', 7.5, 8.2),
    mk('m22', 'Luka Modrić', 'L. Modrić', 'Croacia', '🇭🇷', 'CRO', 'MID', 7.5, 8.0),
    mk('m23', 'Mateo Kovačić', 'M. Kovačić', 'Croacia', '🇭🇷', 'CRO', 'MID', 7.0, 7.8),
    mk('m24', 'Hakim Ziyech', 'H. Ziyech', 'Marruecos', '🇲🇦', 'MOR', 'MID', 7.0, 7.5),
    mk('m25', 'Sofyan Amrabat', 'S. Amrabat', 'Marruecos', '🇲🇦', 'MOR', 'MID', 7.0, 7.8),
    mk('m26', 'Aurelien Tchouaméni', 'A. Tchouaméni', 'Francia', '🇫🇷', 'FRA', 'MID', 7.0, 7.8),
    mk('m27', 'Xavi Simons', 'X. Simons', 'Países Bajos', '🇳🇱', 'NED', 'MID', 6.5, 7.2),
    mk('m28', 'Sandro Tonali', 'S. Tonali', 'Italia', '🇮🇹', 'ITA', 'MID', 6.5, 7.5),
    mk('m29', 'Casemiro', 'Casemiro', 'Brasil', '🇧🇷', 'BRA', 'MID', 6.5, 7.0),
    // Budget ($4.5-6M)
    mk('m30', 'Leandro Paredes', 'L. Paredes', 'Argentina', '🇦🇷', 'ARG', 'MID', 6.0, 7.0),
    mk('m31', 'Thiago Almada', 'T. Almada', 'Argentina', '🇦🇷', 'ARG', 'MID', 6.0, 7.2),
    mk('m32', 'Richard Ríos', 'R. Ríos', 'Colombia', '🇨🇴', 'COL', 'MID', 6.0, 7.5),
    mk('m33', 'Weston McKennie', 'W. McKennie', 'EE. UU.', '🇺🇸', 'USA', 'MID', 6.0, 7.0),
    mk('m34', 'Adrien Rabiot', 'A. Rabiot', 'Francia', '🇫🇷', 'FRA', 'MID', 5.5, 6.8),
    mk('m35', 'Ismael Koné', 'I. Koné', 'Canadá', '🇨🇦', 'CAN', 'MID', 5.0, 6.8),
    mk('m36', 'Ellyes Skhiri', 'E. Skhiri', 'Túnez', '🇹🇳', 'TUN', 'MID', 5.0, 6.8),
    mk('m37', 'Yunus Musah', 'Y. Musah', 'EE. UU.', '🇺🇸', 'USA', 'MID', 5.0, 7.0),
    mk('m38', 'Jefferson Lerma', 'J. Lerma', 'Colombia', '🇨🇴', 'COL', 'MID', 4.5, 6.8),

    // ── FORWARDS ────────────────────────────────────────
    // Premium ($12-15.5M)
    mk('f1', 'Lionel Messi', 'L. Messi', 'Argentina', '🇦🇷', 'ARG', 'FWD', 15.5, 9.8),
    mk('f2', 'Kylian Mbappé', 'K. Mbappé', 'Francia', '🇫🇷', 'FRA', 'FWD', 15.0, 9.5),
    mk('f3', 'Erling Haaland', 'E. Haaland', 'Países Bajos', '🇳🇴', 'NED', 'FWD', 14.5, 9.8),
    mk('f4', 'Vinicius Junior', 'V. Jr.', 'Brasil', '🇧🇷', 'BRA', 'FWD', 14.0, 9.5),
    mk('f5', 'Lamine Yamal', 'L. Yamal', 'España', '🇪🇸', 'ESP', 'FWD', 12.5, 9.5),
    mk('f6', 'Harry Kane', 'H. Kane', 'Inglaterra', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'ENG', 'FWD', 12.5, 9.2),
    mk('f7', 'Lautaro Martínez', 'L. Martínez', 'Argentina', '🇦🇷', 'ARG', 'FWD', 12.0, 8.8),
    // Choice ($9-11.5M)
    mk('f8', 'Rodrygo Goes', 'Rodrygo', 'Brasil', '🇧🇷', 'BRA', 'FWD', 11.5, 8.8),
    mk('f9', 'Darwin Núñez', 'D. Núñez', 'Uruguay', '🇺🇾', 'URU', 'FWD', 11.5, 8.5),
    mk('f10', 'Bukayo Saka', 'B. Saka', 'Inglaterra', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'ENG', 'FWD', 11.0, 8.8),
    mk('f11', 'Julian Álvarez', 'J. Álvarez', 'Argentina', '🇦🇷', 'ARG', 'FWD', 11.0, 8.5),
    mk('f12', 'Endrick', 'Endrick', 'Brasil', '🇧🇷', 'BRA', 'FWD', 10.5, 8.2),
    mk('f13', 'Antoine Griezmann', 'A. Griezmann', 'Francia', '🇫🇷', 'FRA', 'FWD', 10.5, 8.3),
    mk('f14', 'Raphinha', 'Raphinha', 'Brasil', '🇧🇷', 'BRA', 'FWD', 10.0, 8.3),
    mk('f15', 'Rafael Leão', 'R. Leão', 'Portugal', '🇵🇹', 'POR', 'FWD', 10.0, 8.5),
    mk('f16', 'Cristiano Ronaldo', 'C. Ronaldo', 'Portugal', '🇵🇹', 'POR', 'FWD', 10.0, 7.5),
    mk('f17', 'Ousmane Dembélé', 'O. Dembélé', 'Francia', '🇫🇷', 'FRA', 'FWD', 9.5, 7.8),
    mk('f18', 'Cody Gakpo', 'C. Gakpo', 'Países Bajos', '🇳🇱', 'NED', 'FWD', 9.5, 8.5),
    mk('f19', 'Luis Díaz', 'L. Díaz', 'Colombia', '🇨🇴', 'COL', 'FWD', 9.0, 8.5),
    mk('f20', 'Álvaro Morata', 'Á. Morata', 'España', '🇪🇸', 'ESP', 'FWD', 8.5, 7.5),
    mk('f21', 'Christian Pulisic', 'C. Pulisic', 'EE. UU.', '🇺🇸', 'USA', 'FWD', 8.5, 8.2),
    mk('f22', 'Rasmus Højlund', 'R. Højlund', 'Dinamarca', '🇩🇰', 'DEN', 'FWD', 8.5, 8.2),
    mk('f23', 'Sadio Mané', 'S. Mané', 'Senegal', '🇸🇳', 'SEN', 'FWD', 8.0, 7.8),
    // Mid ($6.5-7.5M)
    mk('f24', 'Federico Chiesa', 'F. Chiesa', 'Italia', '🇮🇹', 'ITA', 'FWD', 7.5, 7.8),
    mk('f25', 'Kai Havertz', 'K. Havertz', 'Alemania', '🇩🇪', 'GER', 'FWD', 7.5, 7.8),
    mk('f26', 'Jonathan David', 'J. David', 'Canadá', '🇨🇦', 'CAN', 'FWD', 7.0, 7.8),
    mk('f27', 'Folarin Balogun', 'F. Balogun', 'EE. UU.', '🇺🇸', 'USA', 'FWD', 7.0, 7.5),
    mk('f28', 'Niclas Füllkrug', 'N. Füllkrug', 'Alemania', '🇩🇪', 'GER', 'FWD', 6.5, 7.2),
    mk('f29', 'Giacomo Raspadori', 'G. Raspadori', 'Italia', '🇮🇹', 'ITA', 'FWD', 6.5, 7.3),
    // Budget ($4-6M)
    mk('f30', 'Ángel Correa', 'Á. Correa', 'Argentina', '🇦🇷', 'ARG', 'FWD', 6.0, 7.0),
    mk('f31', 'Cyriel Dessers', 'C. Dessers', 'Nigeria', '🇳🇬', 'NGR', 'FWD', 5.5, 7.0),
    mk('f32', 'Borja Iglesias', 'B. Iglesias', 'España', '🇪🇸', 'ESP', 'FWD', 5.5, 6.8),
    mk('f33', 'Amine Gouiri', 'A. Gouiri', 'Argelia', '🇩🇿', 'MOR', 'FWD', 5.0, 7.0),
    mk('f34', 'Emre Demir', 'E. Demir', 'Turquía', '🇹🇷', 'TUR', 'FWD', 5.0, 6.8),
    mk('f35', 'Héctor Herrera', 'H. Herrera', 'México', '🇲🇽', 'MEX', 'FWD', 4.5, 6.5),
]
