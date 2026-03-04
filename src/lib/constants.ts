import type { Formation } from '@/types'

export const FORMATIONS: Record<Formation, { label: string; positions: { pos: string; x: number; y: number }[] }> = {
    '4-3-3': {
        label: '4-3-3',
        positions: [
            { pos: 'GK', x: 50, y: 88 },
            { pos: 'DEF', x: 15, y: 68 }, { pos: 'DEF', x: 38, y: 68 }, { pos: 'DEF', x: 62, y: 68 }, { pos: 'DEF', x: 85, y: 68 },
            { pos: 'MID', x: 20, y: 46 }, { pos: 'MID', x: 50, y: 46 }, { pos: 'MID', x: 80, y: 46 },
            { pos: 'FWD', x: 18, y: 22 }, { pos: 'FWD', x: 50, y: 22 }, { pos: 'FWD', x: 82, y: 22 },
        ],
    },
    '4-4-2': {
        label: '4-4-2',
        positions: [
            { pos: 'GK', x: 50, y: 88 },
            { pos: 'DEF', x: 15, y: 68 }, { pos: 'DEF', x: 38, y: 68 }, { pos: 'DEF', x: 62, y: 68 }, { pos: 'DEF', x: 85, y: 68 },
            { pos: 'MID', x: 15, y: 46 }, { pos: 'MID', x: 38, y: 46 }, { pos: 'MID', x: 62, y: 46 }, { pos: 'MID', x: 85, y: 46 },
            { pos: 'FWD', x: 35, y: 22 }, { pos: 'FWD', x: 65, y: 22 },
        ],
    },
    '3-5-2': {
        label: '3-5-2',
        positions: [
            { pos: 'GK', x: 50, y: 88 },
            { pos: 'DEF', x: 22, y: 70 }, { pos: 'DEF', x: 50, y: 70 }, { pos: 'DEF', x: 78, y: 70 },
            { pos: 'MID', x: 10, y: 50 }, { pos: 'MID', x: 30, y: 46 }, { pos: 'MID', x: 50, y: 46 }, { pos: 'MID', x: 70, y: 46 }, { pos: 'MID', x: 90, y: 50 },
            { pos: 'FWD', x: 35, y: 22 }, { pos: 'FWD', x: 65, y: 22 },
        ],
    },
    '4-2-3-1': {
        label: '4-2-3-1',
        positions: [
            { pos: 'GK', x: 50, y: 88 },
            { pos: 'DEF', x: 15, y: 70 }, { pos: 'DEF', x: 38, y: 70 }, { pos: 'DEF', x: 62, y: 70 }, { pos: 'DEF', x: 85, y: 70 },
            { pos: 'MID', x: 32, y: 56 }, { pos: 'MID', x: 68, y: 56 },
            { pos: 'MID', x: 15, y: 37 }, { pos: 'MID', x: 50, y: 37 }, { pos: 'MID', x: 85, y: 37 },
            { pos: 'FWD', x: 50, y: 18 },
        ],
    },
    '5-3-2': {
        label: '5-3-2',
        positions: [
            { pos: 'GK', x: 50, y: 88 },
            { pos: 'DEF', x: 10, y: 68 }, { pos: 'DEF', x: 28, y: 68 }, { pos: 'DEF', x: 50, y: 70 }, { pos: 'DEF', x: 72, y: 68 }, { pos: 'DEF', x: 90, y: 68 },
            { pos: 'MID', x: 22, y: 46 }, { pos: 'MID', x: 50, y: 46 }, { pos: 'MID', x: 78, y: 46 },
            { pos: 'FWD', x: 35, y: 22 }, { pos: 'FWD', x: 65, y: 22 },
        ],
    },
}

export const AVATAR_LIST = [
    { id: 'eagle', emoji: '🦅', label: 'Águila' },
    { id: 'lion', emoji: '🦁', label: 'León' },
    { id: 'wolf', emoji: '🐺', label: 'Lobo' },
    { id: 'tiger', emoji: '🐯', label: 'Tigre' },
    { id: 'dragon', emoji: '🐉', label: 'Dragón' },
    { id: 'fire', emoji: '🔥', label: 'Fuego' },
    { id: 'star', emoji: '⭐', label: 'Estrella' },
    { id: 'rocket', emoji: '🚀', label: 'Cohete' },
    { id: 'crown', emoji: '👑', label: 'Corona' },
    { id: 'thunder', emoji: '⚡', label: 'Rayo' },
    { id: 'ghost', emoji: '👻', label: 'Fantasma' },
    { id: 'ninja', emoji: '🥷', label: 'Ninja' },
]

export const WORLD_CUP_TEAMS = [
    { code: 'ARG', name: 'Argentina', flag: '🇦🇷' },
    { code: 'BRA', name: 'Brasil', flag: '🇧🇷' },
    { code: 'FRA', name: 'Francia', flag: '🇫🇷' },
    { code: 'ESP', name: 'España', flag: '🇪🇸' },
    { code: 'ENG', name: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { code: 'GER', name: 'Alemania', flag: '🇩🇪' },
    { code: 'POR', name: 'Portugal', flag: '🇵🇹' },
    { code: 'NED', name: 'Países Bajos', flag: '🇳🇱' },
    { code: 'URU', name: 'Uruguay', flag: '🇺🇾' },
    { code: 'MEX', name: 'México', flag: '🇲🇽' },
    { code: 'USA', name: 'Estados Unidos', flag: '🇺🇸' },
    { code: 'ITA', name: 'Italia', flag: '🇮🇹' },
    { code: 'COL', name: 'Colombia', flag: '🇨🇴' },
    { code: 'MOR', name: 'Marruecos', flag: '🇲🇦' },
    { code: 'SEN', name: 'Senegal', flag: '🇸🇳' },
    { code: 'JPN', name: 'Japón', flag: '🇯🇵' },
]
