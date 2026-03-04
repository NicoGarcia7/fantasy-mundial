'use client'
/**
 * AutoSaveIndicator — tiny status badge shown in the draft header
 */

import { motion, AnimatePresence } from 'framer-motion'
import { Cloud, CloudOff, Loader2, Check } from 'lucide-react'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface AutoSaveIndicatorProps {
    status: SaveStatus
    lastSaved: Date | null
}

function fmt(d: Date) {
    return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}

export default function AutoSaveIndicator({ status, lastSaved }: AutoSaveIndicatorProps) {
    return (
        <AnimatePresence mode="wait">
            {status === 'saving' && (
                <motion.div
                    key="saving"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="flex items-center gap-1.5 text-slate-400 text-[10px]"
                >
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Guardando…</span>
                </motion.div>
            )}

            {status === 'saved' && (
                <motion.div
                    key="saved"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="flex items-center gap-1.5 text-[#39FF14] text-[10px]"
                >
                    <Check className="w-3 h-3" />
                    <span>Guardado{lastSaved ? ` ${fmt(lastSaved)}` : ''}</span>
                </motion.div>
            )}

            {status === 'error' && (
                <motion.div
                    key="error"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="flex items-center gap-1.5 text-amber-400 text-[10px]"
                >
                    <CloudOff className="w-3 h-3" />
                    <span>Sin conexión — guardado local</span>
                </motion.div>
            )}

            {status === 'idle' && lastSaved && (
                <motion.div
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-1.5 text-slate-600 text-[10px]"
                >
                    <Cloud className="w-3 h-3" />
                    <span>Guardado {fmt(lastSaved)}</span>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
