import { useEffect, useRef, useState } from 'react'

export default function BookingNotesModal({ booking, onClose, onSave }) {
  const dialogRef = useRef(null)
  const [notes, setNotes] = useState(booking.notes || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    const dialog = dialogRef.current
    dialog.showModal()
    return () => dialog.close()
  }, [])
  async function save(event) {
    event.preventDefault()
    if (saving) return
    setSaving(true); setError('')
    try { await onSave(booking, notes); onClose() }
    catch (error) { setError(error.message || 'Unable to save booking notes.') }
    finally { setSaving(false) }
  }
  return <dialog ref={dialogRef} aria-labelledby="booking-notes-title" onCancel={event => { event.preventDefault(); if (!saving) onClose() }}
    className="m-auto w-[calc(100%_-_2rem)] max-w-lg rounded-2xl border-0 bg-white p-6 text-slate-800 shadow-2xl backdrop:bg-slate-900/50">
    <h2 id="booking-notes-title" className="text-xl font-medium">Edit booking notes</h2>
    <p className="mt-2 text-sm text-slate-500">{booking.id} · {booking.customerName}</p>
    <form onSubmit={save} className="mt-5 space-y-4">
      <label htmlFor="booking-notes" className="block text-sm font-medium">Notes</label>
      <textarea id="booking-notes" autoFocus rows={6} disabled={saving} value={notes} onChange={event => setNotes(event.target.value)} placeholder="Add instructions or details for this booking…"
        className="w-full resize-y rounded-xl border border-slate-300 p-3 text-sm outline-none focus:border-teal-700" />
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
      <div className="flex justify-end gap-3">
        <button type="button" disabled={saving} onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 text-sm">Cancel</button>
        <button disabled={saving} className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{saving ? 'Saving…' : 'Save notes'}</button>
      </div>
    </form>
  </dialog>
}
