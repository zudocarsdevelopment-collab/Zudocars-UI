import { useEffect, useRef } from 'react'
import { Eye, X } from 'lucide-react'

export default function BookingDetailsModal({ booking, onClose }) {
  const dialogRef = useRef(null)
  useEffect(() => {
    const dialog = dialogRef.current
    dialog.showModal()
    return () => dialog.close()
  }, [])
  const rows = [
    ['Vehicle', booking.vehicle],
    ['Customer', booking.customerName],
    ['Mobile', booking.phone],
    ['Booking notes', booking.notes || 'No booking notes added.'],
    ['Pickup odometer', booking.pickupOdometer == null ? 'Not recorded' : `${Number(booking.pickupOdometer).toLocaleString('en-IN')} km`],
    ['Return odometer', booking.returnOdometer == null ? 'Not recorded' : `${Number(booking.returnOdometer).toLocaleString('en-IN')} km`],
    ['Returned on', booking.returnedAt ? new Date(booking.returnedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : 'Not recorded'],
    ['Return notes', booking.returnNotes || 'No return notes added.'],
  ]
  return <dialog ref={dialogRef} aria-labelledby="booking-details-title" onCancel={event => { event.preventDefault(); onClose() }}
    className="m-auto max-h-[90vh] w-[calc(100%_-_2rem)] max-w-lg overflow-y-auto rounded-2xl border-0 bg-white p-6 text-slate-800 shadow-2xl backdrop:bg-slate-900/50">
    <div className="flex items-center justify-between gap-4">
      <h2 id="booking-details-title" className="flex items-center gap-2 text-xl font-medium"><Eye className="h-5 w-5 text-teal-700" aria-hidden="true" />Booking details</h2>
      <button type="button" onClick={onClose} aria-label="Close booking details" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X className="h-4 w-4" /></button>
    </div>
    <p className="mt-2 text-sm text-slate-500">{booking.id}</p>
    <dl className="mt-5 divide-y divide-slate-100">{rows.map(([label, value]) => <div key={label} className="py-3">
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-800">{value}</dd>
    </div>)}</dl>
    <div className="mt-4 flex justify-end"><button type="button" onClick={onClose} className="booking-action booking-action--primary">Close</button></div>
  </dialog>
}
