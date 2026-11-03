import test from 'node:test'
import assert from 'node:assert/strict'
import { DAY_MS, indiaDay, dayStart, shiftDay, planningStatus, layoutBookings, planningConflicts } from './planningCalendar.js'

const now = Date.parse('2026-11-03T12:00:00+05:30')
const start = dayStart('2026-11-03')
const end = start + DAY_MS
const booking = (id, from, to, status = 'Approved', vehicleId = 1) => ({
  id, vehicleId, status, startDatetime: `2026-11-03T${from}:00+05:30`, endDatetime: `2026-11-03T${to}:00+05:30`,
})

test('India dates and navigation cross month and year boundaries', () => {
  assert.equal(indiaDay(Date.parse('2026-11-02T20:00:00Z')), '2026-11-03')
  assert.equal(shiftDay('2026-12-31', 1), '2027-01-01')
  assert.equal(shiftDay('2026-03-01', -1), '2026-02-28')
})

test('running, future, overdue and completed bookings have distinct statuses', () => {
  assert.equal(planningStatus(booking('a', '09:00', '15:00'), now), 'running')
  assert.equal(planningStatus(booking('b', '14:00', '18:00'), now), 'confirmed')
  assert.equal(planningStatus(booking('c', '09:00', '10:00'), now), 'overdue')
  assert.equal(planningStatus(booking('d', '09:00', '10:00', 'Completed'), now), 'completed')
  assert.equal(planningStatus(booking('e', '09:00', '10:00', 'Pending'), now), 'pending')
})

test('overlaps get separate lanes while adjacent bookings share a lane', () => {
  const a = booking('a', '09:00', '15:00')
  const b = booking('b', '10:00', '14:00', 'Pending')
  const c = booking('c', '15:00', '18:00')
  const layout = layoutBookings([c, b, a], start, end, now)
  assert.equal(layout.lanes, 2)
  assert.deepEqual(layout.bars.map(bar => bar.lane), [0, 1, 0])
  assert.equal(planningConflicts([a, b, c], now), 1)
  assert.equal(planningConflicts([a, { ...b, vehicleId: 2 }], now), 0)
})

test('unreturned overdue bookings remain visible beyond their scheduled return', () => {
  const old = { ...booking('old', '09:00', '10:00'), startDatetime: '2026-11-01T09:00:00+05:30', endDatetime: '2026-11-02T09:00:00+05:30' }
  const bars = layoutBookings([old], start, end, now).bars
  assert.equal(bars.length, 1)
  assert.equal(bars[0].end, now)
  assert.equal(layoutBookings([{ ...old, status: 'Completed' }], start, end, now).bars.length, 0)
})

test('bars are clipped to the visible period and invalid dates are excluded', () => {
  const long = { ...booking('long', '09:00', '15:00'), startDatetime: '2026-11-01T09:00:00+05:30', endDatetime: '2026-11-05T09:00:00+05:30' }
  const bar = layoutBookings([long], start, end, now).bars[0]
  assert.equal(bar.left, 0)
  assert.equal(bar.width, 100)
  assert.equal(layoutBookings([{ ...long, startDatetime: 'invalid' }], start, end, now).bars.length, 0)
})
