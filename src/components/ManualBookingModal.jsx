import { useEffect, useRef, useState } from 'react'
import usePickupHubs from '../lib/usePickupHubs'
import CustomerFields from './CustomerFields'

function indiaDateTime(value) {
  if (!value) return ''
  const date = new Date(new Date(value).getTime() + 330 * 60000)
  return date.toISOString().slice(0, 19)
}

export default function ManualBookingModal({ cars, booking, onClose, onSave }) {
  const dialogRef = useRef(null)
  const { hubs, error: hubError } = usePickupHubs()
  const [form, setForm] = useState({ cart_vehicle: '', customer_name: '', customer_phone: '', customer_email: '', start: '', end: '', dropoff_location_id: '', rental_amount: '', delivery_amount: '0', notes: '', ...(booking ? { cart_vehicle: String(booking.vehicle), customer_name: booking.customer_name, customer_phone: booking.customer_phone, customer_email: booking.customer_email || '', start: indiaDateTime(booking.start_datetime), end: indiaDateTime(booking.end_datetime), dropoff_location_id: String(booking.dropoff_location_id), rental_amount: booking.rental_amount, delivery_amount: booking.delivery_amount, notes: booking.notes || '' } : {}) })
  const [feeEdited, setFeeEdited] = useState(false)
  const [discountType, setDiscountType] = useState(booking?.discount_type || 'flat')
  const [discountValue, setDiscountValue] = useState(booking?.discount_value || '0')
  const rental = Number(form.rental_amount) || 0
  const discount = Math.round((discountType === 'percentage' ? rental * Number(discountValue) / 100 : Number(discountValue)) * 100) / 100
  const discountInvalid = !Number.isFinite(discount) || Number(discountValue) < 0 || (discountType === 'percentage' && Number(discountValue) > 100) || discount > rental
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const car = cars.find(car => String(car.id) === form.cart_vehicle)
  const pickupLocation = hubs.find(location => location.id === Number(car?.pickupHub))
  useEffect(() => {
    if (!booking && !feeEdited && pickupLocation) {
      setForm(current => ({ ...current, delivery_amount: pickupLocation.effective_booking_amount ?? '0' }))
    }
  }, [booking, feeEdited, pickupLocation])
  useEffect(() => { const dialog = dialogRef.current; dialog.showModal(); return () => dialog.close() }, [])
  const update = (key, value) => setForm(current => {
    const next = { ...current, [key]: value }
    if (['cart_vehicle', 'start', 'end'].includes(key)) {
      const vehicle = cars.find(item => String(item.id) === next.cart_vehicle)
      const duration = Date.parse(`${next.end}+05:30`) - Date.parse(`${next.start}+05:30`)
      let rental = ''
      if (vehicle && Number.isFinite(duration) && duration > 0) {
        const hours = Math.ceil(duration / 3600000)
        if (vehicle.dailyPrice !== '' && vehicle.dailyPrice != null) {
          if (Number(vehicle.dailyPrice) > 0) rental = (Math.ceil(hours / 24) * Number(vehicle.dailyPrice)).toFixed(2)
        } else if (Number(vehicle.hourlyRate) > 0) {
          rental = Math.max(hours * Number(vehicle.hourlyRate), Number(vehicle.minHoursRate) || 0).toFixed(2)
        }
      }
      next.rental_amount = rental
    }
    return next
  })
  const historical = form.end && new Date(`${form.end}+05:30`) <= new Date()
  async function save(event) {
    event.preventDefault()
    if (saving) return
    if (discountInvalid) { setError('Discount must not exceed the rental amount; percentage must be between 0 and 100.'); return }
    if (new Date(form.end) <= new Date(form.start)) { setError('Return time must be after pickup time.'); return }
    setSaving(true); setError('')
    try {
      await onSave({ customer_name: form.customer_name.trim(), customer_phone: form.customer_phone.trim(), customer_email: form.customer_email,
        cart_vehicle: Number(form.cart_vehicle), pickup_location_id: car.pickupHub, dropoff_location_id: Number(form.dropoff_location_id),
        date_from: form.start.slice(0, 10), time_from: form.start.slice(11), date_to: form.end.slice(0, 10), time_to: form.end.slice(11),
        rental_amount: form.rental_amount, discount_type: discountType, discount_value: discountValue || '0', delivery_amount: form.delivery_amount, notes: form.notes })
      onClose()
    } catch (error) { setError(error.message || 'Unable to save booking.') }
    finally { setSaving(false) }
  }
  const inputClass = 'mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-slate-900'
  return <dialog ref={dialogRef} aria-labelledby="manual-booking-title" onCancel={event => { event.preventDefault(); if (!saving) onClose() }} className="m-auto max-h-[90vh] w-[calc(100%_-_2rem)] max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 text-slate-800 shadow-2xl backdrop:bg-slate-900/50">
    <h2 id="manual-booking-title" className="text-xl font-semibold">{booking ? 'Edit booking' : 'Add booking'}</h2>
    <p className="mt-2 text-sm text-slate-500">{booking ? 'Correct the booking details below. Saving keeps its current status and return records.' : 'Enter a new or old booking. Past returns are saved as completed; other bookings are confirmed.'} Dates and times are in India time.</p>
    <form onSubmit={save} className="mt-5 space-y-4">
      <fieldset disabled={saving} className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm sm:col-span-2">Vehicle<select autoFocus required value={form.cart_vehicle} onChange={event => update('cart_vehicle', event.target.value)} className={inputClass}><option value="">Select vehicle</option>{cars.map(car => <option key={car.id} value={car.id}>{car.model} · {car.plateNumber}</option>)}</select></label>
        <CustomerFields name={form.customer_name} phone={form.customer_phone} email={form.customer_email} disabled={saving} inputClass={inputClass}
          onChange={details => setForm(current => ({ ...current, ...details }))} />
        <label className="text-sm">Pickup date & time<input required type="datetime-local" step="1" value={form.start} onChange={event => update('start', event.target.value)} className={inputClass} /></label>
        <label className="text-sm">Return date & time<input required type="datetime-local" step="1" value={form.end} onChange={event => update('end', event.target.value)} className={inputClass} /></label>
        <p className="self-center text-sm">Pickup location: {car?.locationBase || 'Select a vehicle'}</p>
        <label className="text-sm">Return location<select required value={form.dropoff_location_id} onChange={event => update('dropoff_location_id', event.target.value)} className={inputClass}><option value="">Select return location</option>{hubs.map(hub => <option key={hub.id} value={hub.id}>{hub.name}</option>)}</select></label>
        <label className="text-sm">Rental amount (₹)<input required type="number" min="0" max="99999999.99" step="0.01" value={form.rental_amount} onChange={event => update('rental_amount', event.target.value)} className={inputClass} /></label>
        <p className="self-center text-xs text-slate-500">Rental amount is calculated from the vehicle rate and rental duration. Each started day is charged as a full day; vehicles without a daily rate use hourly pricing. You can adjust the amount manually.</p>
        <label className="text-sm">Location charge (₹)<input required type="number" min="0" max="99999999.99" step="0.01" value={form.delivery_amount} onChange={event => { setFeeEdited(true); update('delivery_amount', event.target.value) }} className={inputClass} /></label>
        {pickupLocation && <p className="text-xs text-slate-500 sm:col-span-2">Location default: INR {Number(pickupLocation.effective_booking_amount || 0).toLocaleString('en-IN')}. <button type="button" className="font-medium text-teal-700 underline" onClick={() => { setFeeEdited(true); update('delivery_amount', pickupLocation.effective_booking_amount ?? '0') }}>Use location default</button></p>}
        <label className="text-sm sm:col-span-2">Notes (optional)<textarea maxLength={5000} rows={3} value={form.notes} onChange={event => update('notes', event.target.value)} className={inputClass} /></label>
        <label className="text-sm">Discount type<select value={discountType} onChange={event => { setDiscountType(event.target.value); setDiscountValue('0') }} className={inputClass}><option value="flat">Flat amount (₹)</option><option value="percentage">Percentage (%)</option></select></label>
        <label className="text-sm">Discount {discountType === 'percentage' ? '(%)' : '(₹)'}<input type="number" min="0" max={discountType === 'percentage' ? 100 : rental} step="0.01" value={discountValue} onChange={event => setDiscountValue(event.target.value)} className={inputClass} /></label>
        <p className="text-xs text-slate-500 sm:col-span-2">Discount applies to the rental amount only. Location charges are added separately.</p>
      </fieldset>
      {discountInvalid && <p role="alert" className="text-sm text-red-600">Enter a valid discount within the rental amount (maximum 100%).</p>}
      <p className="text-sm">Discount: ₹{(discountInvalid ? 0 : discount).toLocaleString('en-IN')}</p>
      <p className="text-sm font-medium">Total: ₹{(rental - (discountInvalid ? 0 : discount) + Number(form.delivery_amount)).toLocaleString('en-IN')} · {booking ? booking.status : historical ? 'Completed' : 'Confirmed'}</p>
      {(error || hubError) && <p role="alert" className="text-sm text-red-600">{error || hubError}</p>}
      <div className="flex justify-end gap-3"><button type="button" disabled={saving} onClick={onClose} className="rounded-lg border px-4 py-2">Cancel</button><button disabled={saving || !car || !hubs.length} className="rounded-lg bg-teal-700 px-4 py-2 text-white disabled:opacity-50">{saving ? 'Saving…' : booking ? 'Save changes' : 'Add booking'}</button></div>
    </form>
  </dialog>
}
