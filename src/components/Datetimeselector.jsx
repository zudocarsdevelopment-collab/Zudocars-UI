import { useEffect, useMemo, useState } from 'react'
import { Calendar, Clock, ChevronRight } from 'lucide-react'

const DURATIONS = [
  { id: '1', label: '1 day' },
  { id: '2', label: '2 days' },
  { id: '3', label: '3 days' },
  { id: 'custom', label: 'Custom' },
]

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function addDays(dateStr, days) {
  if (!dateStr) return todayStr()
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

function formatDateDisplay(dateStr) {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-')
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function DateTimeSelector({ onChange }) {
  const [pickupDate, setPickupDate] = useState(todayStr())
  const [pickupTime, setPickupTime] = useState('10:00')
  const [duration, setDuration] = useState('1')
  const [customReturnDate, setCustomReturnDate] = useState(addDays(todayStr(), 4))

  // Ensure customReturnDate is never earlier than pickupDate when pickupDate shifts
  useEffect(() => {
    if (customReturnDate < pickupDate) {
      setCustomReturnDate(pickupDate)
    }
  }, [pickupDate, customReturnDate])

  const returnDate = useMemo(() => {
    if (duration === 'custom') return customReturnDate
    return addDays(pickupDate, Number(duration))
  }, [duration, pickupDate, customReturnDate])

  // Return time mirrors pickup time
  const returnTime = pickupTime

  useEffect(() => {
    onChange?.({ pickupDate, pickupTime, returnDate, returnTime })
  }, [pickupDate, pickupTime, returnDate, returnTime, onChange])

  return (
    <div className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        
        {/* Component Header */}
        <div className="mb-3">
          <h1 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
            Select your pickup date, time, and rental duration.
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end gap-3 lg:gap-4">

          {/* Pickup date + time */}
          <div className="flex gap-3 flex-1">
            <label className="flex-1">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                <Calendar className="w-3.5 h-3.5" /> Pickup date
              </span>
              <input
                type="date"
                min={todayStr()}
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
            </label>
            <label className="w-32">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                <Clock className="w-3.5 h-3.5" /> Time
              </span>
              <input
                type="time"
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
            </label>
          </div>

          {/* Duration pills */}
          <div className="flex-1">
            <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Rental length
            </span>
            <div className="flex gap-2">
              {DURATIONS.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDuration(d.id)}
                  className={`flex-1 px-3 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                    duration === d.id
                      ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom return date vs. Prescribed Return Preview */}
          {duration === 'custom' ? (
            <label className="lg:w-52">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                <Calendar className="w-3.5 h-3.5" /> Return date
              </span>
              <input
                type="date"
                min={pickupDate}
                value={customReturnDate}
                onChange={(e) => setCustomReturnDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
            </label>
          ) : (
            <div className="lg:w-52 flex flex-col justify-end">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                Return
              </span>
              <div className="px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-sm font-medium text-gray-700 flex items-center justify-between">
                <span>{formatDateDisplay(returnDate)}</span>
                <span className="text-xs text-gray-400 flex items-center gap-0.5">
                  <ChevronRight className="w-3 h-3 text-gray-300" />
                  {returnTime}
                </span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}