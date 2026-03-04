'use client'

import { motion, type Variants } from 'framer-motion'
import Link from 'next/link'
import { Trophy, Zap, Users, Globe2, Star, ArrowRight, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

const FEATURES = [
  {
    icon: Trophy,
    title: 'Draft Épico',
    description: 'Arma tu equipo de 15 jugadores con presupuesto estratégico. Drag & drop en la cancha.',
    color: 'text-neon-gold',
    glow: 'rgba(245,158,11,0.3)',
  },
  {
    icon: Zap,
    title: 'Puntos en Vivo',
    description: 'Seguí los goles, asistencias y tarjetas en tiempo real mientras ocurren los partidos.',
    color: 'text-neon-green',
    glow: 'rgba(57,255,20,0.3)',
  },
  {
    icon: Users,
    title: 'Ligas Privadas',
    description: 'Creá tu liga con amigos, compartí el link y activá el modo trash-talk en el chat.',
    color: 'text-neon-blue',
    glow: 'rgba(0,207,255,0.3)',
  },
  {
    icon: Globe2,
    title: 'Mundial 2026',
    description: '48 equipos, 104 partidos. Seguí la fase de grupos hasta la gran final.',
    color: 'text-purple-400',
    glow: 'rgba(167,139,250,0.3)',
  },
]

const STATS = [
  { value: '48', label: 'Equipos' },
  { value: '800+', label: 'Jugadores' },
  { value: '104', label: 'Partidos' },
  { value: '∞', label: 'Rivalidades' },
]

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#020617] overflow-x-hidden">
      {/* ─── Hero ───────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 text-center">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full opacity-20 blur-3xl"
            style={{ background: 'radial-gradient(ellipse, #39FF14 0%, transparent 70%)' }}
          />
          <div
            className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-10 blur-3xl"
            style={{ background: 'radial-gradient(ellipse, #00CFFF 0%, transparent 70%)' }}
          />
          <div
            className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full opacity-10 blur-3xl"
            style={{ background: 'radial-gradient(ellipse, #f59e0b 0%, transparent 70%)' }}
          />
        </div>

        {/* Animated football */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
          className="text-8xl mb-6 select-none"
          style={{ filter: 'drop-shadow(0 0 30px rgba(57,255,20,0.5))' }}
        >
          ⚽
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-5xl"
        >
          <motion.div variants={itemVariants} className="mb-4">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase bg-[#39FF14]/10 border border-[#39FF14]/30 text-[#39FF14]">
              <Star className="w-3 h-3" />
              Mundial 2026 · USA · CAN · MEX
            </span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="font-display text-6xl sm:text-8xl lg:text-[120px] font-bold leading-none tracking-tight mb-6"
          >
            <span className="text-white">FANTASY</span>
            <br />
            <span className="text-neon-green" style={{ textShadow: '0 0 40px rgba(57,255,20,0.7)' }}>
              MUNDIAL
            </span>
            <br />
            <span className="text-[#f59e0b]" style={{ textShadow: '0 0 40px rgba(245,158,11,0.7)' }}>
              2026
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-slate-300 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            El juego de fantasy más viral del Mundial. Armá tu equipo, creá ligas con amigos
            y seguí los puntos <strong className="text-white">en vivo</strong> con cada gol.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button
                size="lg"
                className="group relative overflow-hidden bg-[#39FF14] hover:bg-[#39FF14] text-black font-bold text-lg px-10 py-6 rounded-2xl shadow-[0_0_30px_rgba(57,255,20,0.5)] hover:shadow-[0_0_50px_rgba(57,255,20,0.8)] transition-all duration-300"
                id="cta-start-btn"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Empezar Gratis
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </Link>
            <Link href="#features">
              <Button
                size="lg"
                variant="outline"
                className="text-white border-white/20 hover:bg-white/5 font-semibold text-lg px-10 py-6 rounded-2xl"
                id="cta-learn-btn"
              >
                ¿Cómo funciona?
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-8 sm:gap-16"
        >
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-display text-3xl sm:text-4xl font-bold text-[#39FF14]" style={{ textShadow: '0 0 20px rgba(57,255,20,0.5)' }}>
                {stat.value}
              </p>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 8, 0] }}
          transition={{ delay: 1.5, duration: 2, repeat: Infinity }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-slate-600"
        >
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </section>

      {/* ─── Features ───────────────────────────────────── */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-5xl sm:text-6xl font-bold text-white mb-4">
              TODO LO QUE <span className="text-[#39FF14]">NECESITÁS</span>
            </h2>
            <p className="text-slate-400 text-lg">Una experiencia completa para el mayor torneo del mundo</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="glass-card p-8 group cursor-default"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110"
                  style={{ background: `rgba(${feature.glow.replace('rgba(', '').replace(')', '')})`, boxShadow: `0 0 20px ${feature.glow}` }}
                >
                  <feature.icon className={`w-7 h-7 ${feature.color}`} />
                </div>
                <h3 className="font-display text-2xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Viral / Invite Section ──────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-card p-12 relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: 'repeating-linear-gradient(45deg, #39FF14 0px, #39FF14 1px, transparent 1px, transparent 40px)',
              }} />
            </div>
            <div className="relative z-10">
              <p className="text-5xl mb-6">🔥</p>
              <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
                INVITA 3 AMIGOS,<br />
                <span className="text-[#39FF14]">GANÁS $5M EXTRA</span>
              </h2>
              <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto">
                Fichar a Mbappé o Haaland cuesta cara. Invitá a tus amigos y desbloqueá
                presupuesto extra para hacerte el equipo de tus sueños.
              </p>
              <Link href="/login">
                <Button
                  size="lg"
                  id="cta-viral-btn"
                  className="bg-[#f59e0b] hover:bg-[#fbbf24] text-black font-bold text-lg px-10 py-6 rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:shadow-[0_0_50px_rgba(245,158,11,0.8)] transition-all"
                >
                  ¡Empezar a invitar! 🚀
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────── */}
      <footer className="border-t border-slate-800 py-8 px-4 text-center text-slate-600 text-sm">
        <p>⚽ Fantasy Mundial 2026 — Hecho para los verdaderos fanáticos del fútbol</p>
      </footer>
    </main>
  )
}
