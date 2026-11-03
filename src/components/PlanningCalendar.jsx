import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, CalendarDays, Car, Check, ChevronLeft, ChevronRight, Clock, Eye, RefreshCw, Search, TrendingUp, TriangleAlert } from 'lucide-react'
import { isOnTrip, isTripOverdue } from '../lib/onTrip'
import { DAY_MS, indiaDay, dayStart, shiftDay, planningStatus, bookingInterval, layoutBookings, planningConflicts } from '../lib/planningCalendar'
import './planning-calendar.css'

const labels = { running: 'On rent', confirmed: 'Confirmed', pending: 'Pending', overdue: 'Overdue', completed: 'Completed' }
const dateLabel = (value, options) => new Date(value).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', ...options })
const timeLabel = value => new Date(value).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })

export default function PlanningCalendar({ cars, bookings, now, onRefresh, onView }) {
  const [anchor, setAnchor] = useState(() => shiftDay(indiaDay(), -3))
  const [view, setView] = useState('timeline')
  const [range, setRange] = useState(14)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [status, setStatus] = useState('all')
  const [showInactive, setShowInactive] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [refreshError, setRefreshError] = useState('')
  const [updatedAt, setUpdatedAt] = useState(Date.now)
  const refreshingRef = useRef(false)
  const refreshRef = useRef(onRefresh)
  refreshRef.current = onRefresh
  async function refresh() {
    if (refreshingRef.current) return
    refreshingRef.current = true; setRefreshing(true)
    try { await refreshRef.current(); setUpdatedAt(Date.now()); setRefreshError('') }
    catch (error) { setRefreshError(error.message || 'Unable to refresh the calendar.') }
    finally { refreshingRef.current = false; setRefreshing(false) }
  }
  useEffect(() => {
    refresh()
    const timer = setInterval(() => { if (!document.hidden) refresh() }, 30000)
    const onVisible = () => { if (!document.hidden) refresh() }
    document.addEventListener('visibilitychange', onVisible)
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', onVisible) }
  }, [])
  const today = indiaDay(now)
  const days = view === 'day' ? 1 : range
  const start = dayStart(anchor), end = start + days * DAY_MS
  const cells = view === 'day' ? 24 : days
  const cellWidth = view === 'day' ? 72 : 88
  const trackWidth = cells * cellWidth
  const activeCars = cars.filter(car => car.active)
  const activeIds = new Set(activeCars.map(car => car.id))
  const liveBookings = bookings.filter(booking => activeIds.has(booking.vehicleId))
  const out = new Set(liveBookings.filter(booking => isOnTrip(booking, now)).map(booking => booking.vehicleId)).size
  const reserved = new Set(liveBookings.filter(booking => ['Pending', 'Approved'].includes(booking.status) && !booking.returnedAt).map(booking => booking.vehicleId))
  const dueToday = liveBookings.filter(booking => booking.status === 'Approved' && !booking.returnedAt && indiaDay(Date.parse(booking.endDatetime)) === today).length
  const pickups = liveBookings.filter(booking => ['Pending', 'Approved'].includes(booking.status) && indiaDay(Date.parse(booking.startDatetime)) === today).length
  const overdue = liveBookings.filter(booking => isTripOverdue(booking, now)).length
  const utilisation = activeCars.length ? Math.round(out / activeCars.length * 100) : 0
  const stats = [
    { label: 'On Rent Now', value: out, sub: 'vehicles currently out', icon: Car, tone: 'running' },
    { label: 'Available Now', value: activeCars.filter(car => !reserved.has(car.id)).length, sub: 'vehicles without an active reservation', icon: Check, tone: 'confirmed' },
    { label: 'Pickups Today', value: pickups, sub: 'scheduled departures', icon: ArrowUpRight, tone: 'pickup' },
    { label: 'Returns Due Today', value: dueToday, sub: 'expected back today', icon: ArrowDownLeft, tone: 'pending' },
    { label: 'Overdue', value: overdue, sub: 'awaiting vehicle return', icon: TriangleAlert, tone: 'overdue' },
    { label: 'Fleet Utilisation', value: `${utilisation}%`, sub: 'active fleet currently on rent', icon: TrendingUp, tone: 'utilisation' },
  ]
  const categories = [...new Set(cars.map(car => car.bodyType).filter(value => value && value !== '—'))].sort()
  const visibleCars = cars.filter(car => (showInactive || car.active) && (category === 'all' || car.bodyType === category) && `${car.model} ${car.plateNumber}`.toLowerCase().includes(query.toLowerCase()))
  const visibleBookings = bookings.filter(booking => booking.status !== 'Rejected' && (status === 'all' || planningStatus(booking, now) === status))
  const rows = useMemo(() => visibleCars.map(car => ({ car, ...layoutBookings(visibleBookings.filter(booking => booking.vehicleId === car.id), start, end, now) })), [cars, bookings, query, category, status, showInactive, start, end, now])
  const conflicts = planningConflicts(bookings.filter(booking => {
    const interval = bookingInterval(booking, now)
    return visibleCars.some(car => car.id === booking.vehicleId) && interval.start < end && interval.end > start
  }), now)
  const agenda = rows.flatMap(row => row.bars.map(bar => ({ ...bar, car: row.car }))).sort((a, b) => a.start - b.start)
  function goToday() { setAnchor(view === 'day' ? today : shiftDay(today, -3)) }
  function switchView(next) { if (next === 'day' && view !== 'day') setAnchor(today); setView(next) }
  const nowPosition = (now - start) / (end - start) * 100

  return <section className="planning-calendar" aria-label="Live planning calendar">
    <div className="pc-heading"><div><h2>Planning Calendar</h2><p>{visibleCars.length} vehicles <span className="pc-live-dot" /> Live · refreshes every 30 seconds</p></div>
      <button className="pc-control" onClick={refresh} disabled={refreshing}><RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />{refreshing ? 'Updating…' : 'Refresh'}</button>
    </div>
    <div className="pc-stats">{stats.map(stat => <div key={stat.label} className={`pc-stat pc-stat--${stat.tone}`}><div><span className="pc-stat-icon"><stat.icon size={16} /></span><span>{stat.label}</span></div><strong>{stat.value}</strong><small>{stat.sub}</small>{stat.tone === 'utilisation' && <div className="pc-progress"><span style={{ width: `${utilisation}%` }} /></div>}</div>)}</div>
    {refreshError && <p role="alert" className="pc-error">{refreshError} Showing the last loaded data. <button onClick={refresh}>Retry</button></p>}
    <div className="pc-toolbar">
      <div className="pc-range"><button aria-label="Previous period" onClick={() => setAnchor(shiftDay(anchor, -days))}><ChevronLeft size={16} /></button><span>{dateLabel(start, { day: 'numeric', month: 'short' })} – {dateLabel(end - 1, { day: 'numeric', month: 'short', year: 'numeric' })}</span><button aria-label="Next period" onClick={() => setAnchor(shiftDay(anchor, days))}><ChevronRight size={16} /></button></div>
      <button className="pc-control" onClick={goToday}>Today</button>
      <input className="pc-date-input" type="date" aria-label="Calendar start date" value={anchor} onChange={event => { if (event.target.value) setAnchor(event.target.value) }} />
      <div className="pc-view" aria-label="Calendar view">{[['timeline', CalendarDays, 'Timeline'], ['day', Clock, 'Day'], ['agenda', CalendarDays, 'Agenda']].map(([key, Icon, label]) => <button key={key} aria-pressed={view === key} onClick={() => switchView(key)}><Icon size={14} />{label}</button>)}</div>
      {view !== 'day' && <select aria-label="Calendar date range" value={range} onChange={event => setRange(Number(event.target.value))}><option value={14}>14 days</option><option value={30}>30 days</option></select>}
      <select aria-label="Booking status filter" value={status} onChange={event => setStatus(event.target.value)}><option value="all">All statuses</option>{Object.entries(labels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>
      <select aria-label="Vehicle category filter" value={category} onChange={event => setCategory(event.target.value)}><option value="all">All categories</option>{categories.map(value => <option key={value}>{value}</option>)}</select>
      <label className="pc-search"><Search size={14} /><input aria-label="Search calendar vehicles" placeholder="Search vehicle or plate" value={query} onChange={event => setQuery(event.target.value)} /></label>
      <label className="pc-checkbox"><input type="checkbox" checked={showInactive} onChange={event => setShowInactive(event.target.checked)} />Show inactive</label>
    </div>
    <div className="pc-legend">{Object.entries(labels).map(([key, label]) => <span key={key}><i className={`pc-swatch pc-status--${key}`} />{label}</span>)}{conflicts > 0 && <span className="pc-conflicts"><TriangleAlert size={13} />{conflicts} scheduling conflict{conflicts === 1 ? '' : 's'}</span>}<small>Click a booking for details{view !== 'day' ? ' · Click a date for hourly view' : ''}</small></div>
    {view === 'agenda' ? <div className="pc-agenda">{agenda.length ? agenda.map(({ booking, car }) => <button key={booking.id} onClick={() => onView(booking)} className="pc-agenda-row"><span className={`pc-agenda-status pc-status--${planningStatus(booking, now)}`}>{labels[planningStatus(booking, now)]}</span><span><strong>{car.model} · {car.plateNumber}</strong><small>{booking.customerName} · {booking.phone}</small></span><span>{dateLabel(booking.startDatetime, { day: 'numeric', month: 'short' })} {timeLabel(booking.startDatetime)} → {dateLabel(booking.endDatetime, { day: 'numeric', month: 'short' })} {timeLabel(booking.endDatetime)}</span><Eye size={16} /></button>) : <p className="pc-empty">No bookings in this period.</p>}</div> : <div className="pc-scroll" tabIndex={0} aria-label="Vehicle booking timeline. Scroll horizontally to see all dates."><div className="pc-grid" style={{ width: trackWidth + 220 }}>
      <div className="pc-grid-header"><div className="pc-resource-label">VEHICLE <span>{visibleCars.length} units</span></div><div className="pc-days" style={{ width: trackWidth }}>{Array.from({ length: cells }, (_, index) => {
        const value = start + index * (view === 'day' ? DAY_MS / 24 : DAY_MS)
        const isToday = indiaDay(value) === today
        return <button key={index} style={{ width: cellWidth }} className={isToday ? 'pc-today' : ''} onClick={() => { setAnchor(indiaDay(value)); setView('day') }} aria-label={`Hourly view for ${dateLabel(value, { day: 'numeric', month: 'long' })}`}><small>{view === 'day' ? dateLabel(value, { weekday: 'short' }) : dateLabel(value, { weekday: 'short', month: 'short' })}</small><strong>{view === 'day' ? timeLabel(value) : dateLabel(value, { day: 'numeric' })}</strong></button>
      })}</div></div>
      {rows.map(({ car, bars, lanes }) => <div key={car.id} className="pc-vehicle-row" style={{ height: Math.max(68, lanes * 38 + 18) }}><div className="pc-resource"><span className={`pc-car-dot ${bookings.some(booking => booking.vehicleId === car.id && isOnTrip(booking, now)) ? 'pc-car-out' : ''}`} /><div><strong>{car.model || car.name}</strong><small>{car.plateNumber}{!car.active ? ' · Inactive' : ''}</small></div></div><div className="pc-track" style={{ width: trackWidth, backgroundSize: `${cellWidth}px 100%` }}>
        {view !== 'day' && today >= anchor && dayStart(today) < end && <div className="pc-today-shade" style={{ left: (dayStart(today) - start) / (end - start) * 100 + '%', width: 100 / days + '%' }} />}
        {nowPosition >= 0 && nowPosition <= 100 && <div className="pc-now-line" style={{ left: nowPosition + '%' }} />}
        {bars.map(({ booking, lane, left, width }) => <button key={booking.id} className={`pc-booking pc-status--${planningStatus(booking, now)}`} style={{ left: `${left}%`, width: `${width}%`, top: lane * 38 + 10 }} onClick={() => onView(booking)} title={`${booking.customerName} · ${booking.id}\n${dateLabel(booking.startDatetime, { day: 'numeric', month: 'short' })} ${timeLabel(booking.startDatetime)} → ${dateLabel(booking.endDatetime, { day: 'numeric', month: 'short' })} ${timeLabel(booking.endDatetime)}\n${labels[planningStatus(booking, now)]}`} aria-label={`View ${booking.customerName}, ${car.plateNumber}, ${labels[planningStatus(booking, now)]}`}><span>{timeLabel(booking.startDatetime)}</span><strong>{booking.customerName}</strong><span>{timeLabel(booking.endDatetime)}</span></button>)}
      </div></div>)}
      {!rows.length && <p className="pc-empty">No vehicles match these filters.</p>}
    </div></div>}
    <div className="pc-footer"><span><span className="pc-live-dot" />Last updated {timeLabel(updatedAt)}</span><span>All times are in India time · Overdue bookings remain active until return is recorded.</span></div>
  </section>
}
