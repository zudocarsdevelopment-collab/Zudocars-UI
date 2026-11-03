export function isOnTrip(booking, now = Date.now()) {
  return booking.status === 'Approved' && !booking.returnedAt &&
    Number.isFinite(Date.parse(booking.startDatetime)) && Date.parse(booking.startDatetime) <= now
}

export function isTripOverdue(booking, now = Date.now()) {
  return isOnTrip(booking, now) && Date.parse(booking.endDatetime) < now
}
