import { useState } from 'react'

export default function VehicleReturnModal({ booking, car, onClose, onSave }) {
  const minimum = Math.max(car?.odometer || 0, booking.pickupOdometer || 0)
  const [reading, setReading] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  async function submit(event) {
    event.preventDefault()
    const value = Number(reading)
    if (!reading || !Number.isSafeInteger(value) || value < minimum) {
      setError(`Enter an odometer reading of at least ${minimum.toLocaleString('en-IN')} km.`)
      return
    }
    setSaving(true)
    setError('')
    try { await onSave({ return_odometer: value, return_notes: notes }); onClose() }
    catch (failure) { setError(failure.message) }
    finally { setSaving(false) }
  }
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
    <form onSubmit={submit} className="w-full max-w-lg rounded-2xl bg-white p-6 space-y-4">
      <h2 className="text-xl font-bold">Return vehicle</h2>
      <p className="text-sm text-slate-600">{booking.vehicle} · {booking.customerName}</p>
      <p className="text-sm text-slate-500">Current mileage: {minimum.toLocaleString('en-IN')} km. Saving updates mileage and checks maintenance due.</p>
      <label className="block text-sm font-semibold">Return odometer (km)
        <input autoFocus required type="number" min={minimum} step="1" value={reading} onChange={e => setReading(e.target.value)} className="mt-2 w-full rounded-lg border p-3" />
      </label>
      <label className="block text-sm font-semibold">Vehicle condition and return notes
        <textarea maxLength={5000} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Fuel level, damage, cleaning or other checks" className="mt-2 w-full rounded-lg border p-3" />
      </label>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end gap-3">
        <button disabled={saving} type="button" onClick={onClose} className="rounded-lg border px-4 py-2">Cancel</button>
        <button disabled={saving} className="rounded-lg bg-[#047857] px-4 py-2 text-white">{saving ? 'Saving…' : 'Save return & complete trip'}</button>
      </div>
    </form>
  </div>
}
