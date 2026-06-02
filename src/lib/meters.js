import content from './content.js'

export const METER_DEFS = content.meters.map((m) => ({
  id: m.id,
  name: m.name,
  icon: m.icon,
  accent: `var(--accent-${m.id})`,
}))

export function meterZone(value) {
  if (value <= 10 || value >= 90) return 'danger'
  if (value <= 20 || value >= 80) return 'warning'
  return 'neutral'
}

export function formatDelta(n) {
  const v = n ?? 0
  if (v === 0) return '±0'
  return v > 0 ? `+${v}` : `${v}`
}
