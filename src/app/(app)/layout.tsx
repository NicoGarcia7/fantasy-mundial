'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { LayoutDashboard, Swords, Users, Zap, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
    { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard },
    { href: '/draft', label: 'Mi Equipo', icon: Swords },
    { href: '/leagues', label: 'Ligas', icon: Users },
    { href: '/live', label: 'En Vivo', icon: Zap },
    { href: '/profile', label: 'Perfil', icon: User },
]

const TICKER_ITEMS = [
    '⚽ ARG vs MEX · Gr. C',
    '🔴 BRA vs FRA · Gr. A',
    '⚪ ESP vs ALE · Gr. D',
    '🏆 Fantasy Mundial 2026',
    '⚽ POR vs ING · Gr. B',
    '🔵 USA vs URU · Gr. E',
]

function Ticker() {
    // Duplicate for seamless loop
    const items = [...TICKER_ITEMS, ...TICKER_ITEMS]
    return (
        <div className="ticker-wrap">
            <div className="ticker-inner">
                {items.map((item, i) => (
                    <span key={i} className="ticker-item">
                        {item}
                    </span>
                ))}
            </div>
        </div>
    )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
            {/* ── Top bar ──────────────────────────────────────── */}
            <header className="sticky top-0 z-40" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                {/* Ticker */}
                <Ticker />

                {/* Brand bar */}
                <div className="h-12 flex items-center justify-between px-4">
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <span className="text-xl">⚽</span>
                        <span className="font-display text-base font-bold text-white tracking-widest">
                            FANTASY
                        </span>
                        <span className="font-display text-base font-bold tracking-widest" style={{ color: 'var(--gold)' }}>
                            MUNDIAL
                        </span>
                        <span className="font-display text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                            2026
                        </span>
                    </Link>

                    <div className="badge-gold">
                        <Zap className="w-2.5 h-2.5" /> LIVE
                    </div>
                </div>
            </header>

            {/* ── Page content ─────────────────────────────────── */}
            <main className="flex-1 pb-20">
                {children}
            </main>

            {/* ── Bottom navigation ─────────────────────────────── */}
            <nav className="bottom-nav fixed bottom-0 left-0 right-0 z-40 h-16 flex items-center justify-around px-1">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname.startsWith(item.href)
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            id={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
                            className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full relative"
                        >
                            {/* Active top bar */}
                            {isActive && (
                                <motion.div
                                    layoutId="nav-active-bar"
                                    className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5"
                                    style={{ background: 'var(--gold)' }}
                                />
                            )}

                            <item.icon
                                className={cn('w-5 h-5 transition-colors duration-150')}
                                style={{ color: isActive ? 'var(--gold)' : 'var(--text-muted)' }}
                            />
                            <span
                                className="text-[9px] font-bold uppercase tracking-wider transition-colors duration-150 font-display"
                                style={{ color: isActive ? 'var(--gold)' : 'var(--text-subtle)' }}
                            >
                                {item.label}
                            </span>
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}
