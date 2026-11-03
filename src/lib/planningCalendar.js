import { isOnTrip, isTripOverdue } from './onTrip.js'

export const DAY_MS = 86400000
export function indiaDay(value = Date.now()) {
  if (!Number.isFinite(Number(value))) return ''
  return new Date(Number(value) + 19800000).toISOString().slice(0, 10)
}
export function dayStart(key) { return Date.parse(`${key}T00:00:00+05:30`) }
export function shiftDay(key, days) { return indiaDay(dayStart(key) + days * DAY_MS) }
export function planningStatus(booking, now) {
  if (booking.status === 'Completed') return 'completed'
  if (booking.status === 'Rejected') return 'cancelled'
  if (isTripOverdue(booking, now)) return 'overdue'
  if (isOnTrip(booking, now)) return 'running'
  return booking.status === 'Approved' ? 'confirmed' : 'pending'
}
export function bookingInterval(booking, now) {
  const start = Date.parse(booking.startDatetime)
  const scheduledEnd = Date.parse(booking.endDatetime)
  const end = booking.status === 'Completed' && booking.returnedAt ? Date.parse(booking.returnedAt) : scheduledEnd
  return { start, end: isTripOverdue(booking, now) ? Math.max(end, now) : end }
}
export function layoutBookings(bookings, start, end, now) {
  const laneEnds = []
  const bars = []
  const sorted = bookings.map(booking => ({ booking, ...bookingInterval(booking, now) }))
    .filter(row => Number.isFinite(row.start) && Number.isFinite(row.end) && row.end > start && row.start < end && row.end > row.start)
    .sort((a, b) => a.start - b.start || a.end - b.end)
  for (const row of sorted) {
    let lane = laneEnds.findIndex(value => value <= row.start)
    if (lane < 0) lane = laneEnds.length
    laneEnds[lane] = row.end
    bars.push({ ...row, lane, left: (Math.max(start, row.start) - start) / (end - start) * 100,
      width: (Math.min(end, row.end) - Math.max(start, row.start)) / (end - start) * 100 })
  }
  return { bars, lanes: Math.max(1, laneEnds.length) }
}
export function planningConflicts(bookings, now) {
  const rows = bookings.filter(booking => ['Pending', 'Approved'].includes(booking.status))
  let count = 0
  for (let i = 0; i < rows.length; i++) for (let j = i + 1; j < rows.length; j++) {
    const a = bookingInterval(rows[i], now), b = bookingInterval(rows[j], now)
    if (rows[i].vehicleId === rows[j].vehicleId && a.start < b.end && b.start < a.end) count++
  }
  return count
}
