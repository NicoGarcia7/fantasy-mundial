import type { Config } from 'tailwindcss'

const config: Config = {
    darkMode: 'class',
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
                display: ['var(--font-teko)', 'system-ui', 'sans-serif'],
            },
            colors: {
                // Brand palette – World Cup 2026
                pitch: {
                    DEFAULT: '#14532d', // deep green
                    light: '#166534',
                    dark: '#052e16',
                    neon: '#22c55e',
                },
                gold: {
                    DEFAULT: '#f59e0b',
                    light: '#fbbf24',
                    dark: '#d97706',
                },
                neon: {
                    green: '#39FF14',
                    blue: '#00CFFF',
                    pink: '#FF007F',
                    purple: '#BF5FFF',
                },
                surface: {
                    DEFAULT: '#0f172a',   // slate-950
                    card: '#1e293b',      // slate-800
                    border: '#334155',    // slate-700
                    elevated: '#263147',
                },
            },
            backgroundImage: {
                'pitch-gradient': 'linear-gradient(180deg, #052e16 0%, #14532d 50%, #052e16 100%)',
                'gold-gradient': 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #d97706 100%)',
                'neon-gradient': 'linear-gradient(135deg, #39FF14 0%, #00CFFF 100%)',
                'hero-gradient': 'radial-gradient(ellipse at 50% 0%, rgba(57,255,20,0.15) 0%, transparent 70%), linear-gradient(180deg, #0f172a 0%, #020617 100%)',
                'card-gradient': 'linear-gradient(135deg, rgba(30,41,59,0.95) 0%, rgba(15,23,42,0.95) 100%)',
            },
            boxShadow: {
                'neon-green': '0 0 20px rgba(57,255,20,0.4), 0 0 40px rgba(57,255,20,0.2)',
                'neon-gold': '0 0 20px rgba(245,158,11,0.4), 0 0 40px rgba(245,158,11,0.2)',
                'neon-blue': '0 0 20px rgba(0,207,255,0.4), 0 0 40px rgba(0,207,255,0.2)',
                'card': '0 4px 24px rgba(0,0,0,0.4)',
                'card-hover': '0 8px 40px rgba(57,255,20,0.15)',
            },
            animation: {
                'pulse-neon': 'pulse-neon 2s ease-in-out infinite',
                'float': 'float 3s ease-in-out infinite',
                'score-pop': 'score-pop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                'slide-up': 'slide-up 0.3s ease-out',
                'glow': 'glow 2s ease-in-out infinite alternate',
            },
            keyframes: {
                'pulse-neon': {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(57,255,20,0.4)' },
                    '50%': { boxShadow: '0 0 40px rgba(57,255,20,0.8), 0 0 60px rgba(57,255,20,0.4)' },
                },
                'float': {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-8px)' },
                },
                'score-pop': {
                    '0%': { transform: 'scale(0.5)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                'slide-up': {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                'glow': {
                    '0%': { filter: 'brightness(1)' },
                    '100%': { filter: 'brightness(1.3)' },
                },
            },
        },
    },
    plugins: [],
}

export default config
