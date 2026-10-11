import { useEffect, useRef, useState } from 'react'

const format = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(value)
const cents = value => Math.round(Number(value) * 100)

export default function BulkDailyPriceModal({ cars, onClose, onSave }) {
  const dialogRef = useRef(null)
  const [operation, setOperation] = useState('increase')
  const [amount, setAmount] = useState('100')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    const dialog = dialogRef.current
    dialog.showModal()
    return () => dialog.close()
  }, [])
  const adjustment = cents(amount)
  const rows = cars.map(car => {
    const current = car.dailyPrice === '' || car.dailyPrice == null ? null : cents(car.dailyPrice)
    const next = operation === 'set' ? adjustment : current == null ? null : current + (operation === 'increase' ? adjustment : -adjustment)
    return { car, current, next }
  })
  const validAmount = /^\d+(\.\d{1,2})?$/.test(amount) && adjustment > 0
  const invalid = !validAmount || rows.some(row => row.next == null || row.next < 1 || row.next > 9999999999)
  async function submit(event) {
    event.preventDefault()
    if (invalid || saving) return
    setSaving(true); setError('')
    try {
      await onSave({ operation, amount, vehicles: cars.map(car => ({ id: car.id, daily_price: car.dailyPrice === '' || car.dailyPrice == null ? null : Number(car.dailyPrice).toFixed(2) })) })
      onClose()
    } catch (error) { setError(error.message) }
    finally { setSaving(false) }
  }
  return <dialog ref={dialogRef} aria-labelledby="bulk-price-title" onCancel={event => { event.preventDefault(); if (!saving) onClose() }}
    className="m-auto max-h-[90vh] w-[calc(100%_-_2rem)] max-w-2xl overflow-y-auto rounded-2xl border-0 bg-white p-6 text-slate-800 shadow-2xl backdrop:bg-slate-900/50">
    <h2 id="bulk-price-title" className="text-xl font-medium">Update daily prices</h2>
    <p className="mt-2 text-sm text-slate-500">Update {cars.length} selected vehicle{cars.length === 1 ? '' : 's'}. Existing booking amounts stay the same.</p>
    <form onSubmit={submit} className="mt-5 space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label htmlFor="bulk-price-operation" className="text-sm font-medium">Action<select id="bulk-price-operation" disabled={saving} value={operation} onChange={e => { setOperation(e.target.value); setError('') }} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"><option value="increase">Increase by</option><option value="decrease">Decrease by</option><option value="set">Set daily price to</option></select></label>
        <label htmlFor="bulk-price-amount" className="text-sm font-medium">Amount (₹)<input id="bulk-price-amount" autoFocus required disabled={saving} type="number" min="0.01" max="99999999.99" step="0.01" value={amount} onChange={e => { setAmount(e.target.value); setError('') }} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
      </div>
      <div className="max-h-72 overflow-auto rounded-lg border border-slate-200"><table className="w-full text-left text-sm"><thead className="sticky top-0 bg-slate-50"><tr><th className="p-3">Vehicle</th><th className="p-3">Current / day</th><th className="p-3">New / day</th></tr></thead><tbody className="divide-y divide-slate-100">{rows.map(({ car, current, next }) => <tr key={car.id}><td className="p-3">{car.model || car.name}<p className="text-xs text-slate-500">{car.plateNumber}</p></td><td className="p-3">{current == null ? 'Not set' : format(current / 100)}</td><td className={`p-3 font-medium ${next == null || next < 1 ? 'text-red-600' : 'text-teal-700'}`}>{!validAmount ? '—' : next == null ? 'Set a daily price first' : format(next / 100)}</td></tr>)}</tbody></table></div>
      {invalid && <p className="text-sm text-red-600">Enter a positive amount with up to two decimal places. Every resulting price must be positive and within the allowed range. For vehicles without a daily price, choose “Set daily price to”.</p>}
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
      <div className="flex justify-end gap-3"><button type="button" disabled={saving} onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 text-sm">Cancel</button><button disabled={invalid || saving} className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{saving ? 'Updating…' : `Apply to ${cars.length} vehicle${cars.length === 1 ? '' : 's'}`}</button></div>
    </form>
  </dialog>
}
