import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return `$${price.toFixed(1)}M`
}

export function formatPoints(points: number): string {
  return points.toLocaleString()
}

export function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export function getPositionColor(position: string): string {
  const colors: Record<string, string> = {
    GK: '#F59E0B',  // amber
    DEF: '#3B82F6', // blue
    MID: '#8B5CF6', // purple
    FWD: '#22C55E', // green
  }
  return colors[position] ?? '#6B7280'
}

export function getPositionLabel(position: string): string {
  const labels: Record<string, string> = {
    GK: 'Portero',
    DEF: 'Defensa',
    MID: 'Mediocampista',
    FWD: 'Delantero',
  }
  return labels[position] ?? position
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.substring(0, maxLength - 3) + '...'
}
