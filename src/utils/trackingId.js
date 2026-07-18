export function generateTrackingId() {
  const random = Math.floor(1000 + Math.random() * 9000)
  return `BS-2026-${random}`
}
