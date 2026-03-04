'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
    LayoutDashboard,
    Swords,
    Users,
    Zap,
    User,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
    { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard },
    { href: '/draft', label: 'Draft', icon: Swords },
    { href: '/leagues', label: 'Ligas', icon: Users },
    { href: '/live', label: 'En Vivo', icon: Zap },
    { href: '/profile', label: 'Perfil', icon: User },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    return (
        <div className="min-h-screen bg-[#020617] flex flex-col">
            {/* Top bar */}
            <header className="sticky top-0 z-40 h-14 glass-card rounded-none border-x-0 border-t-0 flex items-center justify-between px-4">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <span className="text-2xl" style={{ filter: 'drop-shadow(0 0 8px rgba(57,255,20,0.6))' }}>⚽</span>
                    <span className="font-display font-bold text-white text-lg tracking-wider">FANTASY</span>
                    <span className="font-display font-bold text-[#39FF14] text-lg tracking-wider" style={{ textShadow: '0 0 10px rgba(57,255,20,0.5)' }}>MUNDIAL</span>
                </Link>
                <div className="flex items-center gap-3">
                    <div className="px-3 py-1 rounded-full bg-[#39FF14]/10 border border-[#39FF14]/30 text-[#39FF14] text-xs font-bold flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        LIVE
                    </div>
                </div>
            </header>

            {/* Page content */}
            <main className="flex-1 pb-20">
                {children}
            </main>

            {/* Bottom navigation */}
            <nav className="bottom-nav fixed bottom-0 left-0 right-0 z-40 h-16 flex items-center justify-around px-2">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname.startsWith(item.href)
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            id={`nav-${item.label.toLowerCase()}`}
                            className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full relative"
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="active-tab"
                                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-b-full bg-[#39FF14]"
                                    style={{ boxShadow: '0 0 10px rgba(57,255,20,0.8)' }}
                                />
                            )}
                            <item.icon
                                className={cn('w-5 h-5 transition-all duration-200', isActive ? 'text-[#39FF14]' : 'text-slate-500')}
                                style={isActive ? { filter: 'drop-shadow(0 0 6px rgba(57,255,20,0.8))' } : {}}
                            />
                            <span className={cn('text-[10px] font-medium transition-colors duration-200', isActive ? 'text-[#39FF14]' : 'text-slate-500')}>
                                {item.label}
                            </span>
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}
