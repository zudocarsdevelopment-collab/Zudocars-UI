import { useEffect, useRef, useState } from 'react'
import { apiUrl, dashboardHeaders } from '../lib/apiConfig'
import { readApiJson } from '../lib/apiResponse'

const money = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(Number(value || 0))
const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
const inputClass = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm'
const fresh = () => ({ request_id: crypto.randomUUID(), date: today(), amount: '', reference: '', notes: '', booking: '', kind: 'receipt', method: 'upi', category: 'fuel', description: '', vehicle: '' })

function VoidDialog({ target, busy, error, onClose, onSubmit }) {
  const ref = useRef(null)
  const [reason, setReason] = useState('')
  useEffect(() => { const dialog = ref.current; dialog.showModal(); return () => dialog.close() }, [])
  return <dialog ref={ref} aria-labelledby="void-title" onCancel={e => { e.preventDefault(); if (!busy) onClose() }} className="m-auto w-[calc(100%_-_2rem)] max-w-md rounded-2xl bg-white p-6 text-slate-800 shadow-xl backdrop:bg-slate-900/50">
    <h2 id="void-title">Void {target.type === 'payments' ? 'payment' : 'expense'} entry?</h2>
    <p className="mt-2 text-sm text-slate-500">{money(target.entry.amount)} will be excluded from totals. The original entry and your reason remain in the history.</p>
    <form onSubmit={e => { e.preventDefault(); onSubmit(reason) }} className="mt-4 space-y-4">
      <label className="block text-sm">Reason<input autoFocus required maxLength={250} value={reason} onChange={e => setReason(e.target.value)} className={inputClass} /></label>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end gap-3"><button type="button" disabled={busy} onClick={onClose}>Cancel</button><button disabled={busy || !reason.trim()} className="rounded-lg bg-red-600 px-4 py-2 text-white disabled:opacity-50">{busy ? 'Voiding…' : 'Void entry'}</button></div>
    </form>
  </dialog>
}

function Ledger({ title, headings, children }) {
  return <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5"><h2>{title}</h2><div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead><tr>{headings.map(h => <th key={h} className="px-3 py-3">{h}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{children}</tbody></table></div></section>
}
const Cell = ({ children }) => <td className="px-3 py-3 align-top">{children}</td>

export default function AccountsFinance() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [mode, setMode] = useState('payments')
  const [form, setForm] = useState(fresh)
  const [notice, setNotice] = useState('')
  const [voidTarget, setVoidTarget] = useState(null)
  const [voidError, setVoidError] = useState('')
  async function load() {
    setLoading(true)
    try {
      const response = await fetch(apiUrl('/api/accounts/summary/'), { headers: dashboardHeaders() })
      setData(await readApiJson(response, 'Unable to load accounts.')); setError('')
    } catch (e) { setError(e.message); setData(null) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])
  const update = (key, value) => setForm(current => ({ ...current, [key]: value, request_id: crypto.randomUUID() }))
  async function save(e) {
    e.preventDefault(); if (busy) return
    setBusy(true); setError(''); setNotice('')
    const { request_id, amount, date, reference, notes, booking, kind, method, category, description, vehicle } = form
    const payload = { request_id, amount, date, reference, notes, ...(mode === 'payments' ? { booking, kind, method } : { category, description, vehicle: vehicle ? Number(vehicle) : null }) }
    try {
      const response = await fetch(apiUrl(`/api/accounts/${mode}/`), { method: 'POST', headers: dashboardHeaders(), body: JSON.stringify(payload) })
      await readApiJson(response, 'Unable to record transaction.')
      setForm(fresh()); setNotice('Transaction recorded.'); await load()
    } catch (e) { setError(e.message) }
    finally { setBusy(false) }
  }
  async function voidEntry(reason) {
    if (busy) return
    setBusy(true); setVoidError('')
    try {
      const response = await fetch(apiUrl(`/api/accounts/${voidTarget.type}/${voidTarget.entry.id}/void/`), { method: 'POST', headers: dashboardHeaders(), body: JSON.stringify({ reason }) })
      await readApiJson(response, 'Unable to void entry.')
      setVoidTarget(null); setNotice('Entry voided.'); await load()
    } catch (e) { setVoidError(e.message) }
    finally { setBusy(false) }
  }
  const voidButton = (entry, type) => entry.voided_at ? <span className="text-slate-500">Voided: {entry.void_reason}</span> : <button disabled={busy} className="text-red-600" onClick={() => { setVoidError(''); setVoidTarget({ entry, type }) }}>Void</button>
  const cards = [['Booked revenue', 'revenue'], ['Net payments received', 'received'], ['Outstanding payments', 'outstanding'], ['Total expenses', 'expenses'], ['Net balance', 'net_balance'], ['Customer credits / deposits', 'customer_credit']]
  return <div className="space-y-6">
    <div className="flex items-center justify-between"><h2>Finance</h2><button disabled={loading || busy} onClick={load} className="text-sm text-teal-700">{loading ? 'Refreshing…' : 'Refresh'}</button></div>
    {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
    {notice && <p role="status" className="text-sm text-teal-700">{notice}</p>}
    {loading && <p role="status">Loading accounts…</p>}
    {data && <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{cards.map(([label, key]) => <div key={key} className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">{label}</p><p className="mt-3 text-2xl font-semibold text-slate-800">{money(data[key])}</p></div>)}</div>
      <p className="text-sm text-slate-500">All-time totals in INR. Booked revenue includes confirmed and completed bookings. Net balance is booked revenue minus recorded expenses, not a bank balance. Customer credits include deposits on pending bookings and amounts awaiting refund. Maintenance costs are included automatically; record only additional costs here.</p>
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2>Record a transaction</h2>
        <div className="my-4 flex gap-3">{[['payments', 'Payment / refund'], ['expenses', 'Expense']].map(([id, label]) => <button key={id} disabled={busy} onClick={() => { setMode(id); setForm(fresh()) }} aria-pressed={mode === id} className={`rounded-lg px-4 py-2 text-sm ${mode === id ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-700'}`}>{label}</button>)}</div>
        <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
          {mode === 'payments' ? <>
            <label className="text-sm">Booking<select required disabled={busy} value={form.booking} onChange={e => update('booking', e.target.value)} className={inputClass}><option value="">Choose booking</option>{data.bookings.map(b => <option key={b.reference} value={b.reference}>{b.reference} · {b.customer} · {b.status}</option>)}</select></label>
            <label className="text-sm">Transaction type<select disabled={busy} value={form.kind} onChange={e => update('kind', e.target.value)} className={inputClass}><option value="receipt">Payment received</option><option value="refund">Refund paid</option></select></label>
            <label className="text-sm">Payment method<select disabled={busy} value={form.method} onChange={e => update('method', e.target.value)} className={inputClass}>{['upi', 'cash', 'bank', 'card'].map(x => <option key={x} value={x}>{x === 'upi' ? 'UPI' : x === 'bank' ? 'Bank transfer' : x[0].toUpperCase() + x.slice(1)}</option>)}</select></label>
          </> : <>
            <label className="text-sm">Category<select disabled={busy} value={form.category} onChange={e => update('category', e.target.value)} className={inputClass}>{['fuel', 'salary', 'insurance', 'rent', 'maintenance', 'other'].map(x => <option key={x} value={x}>{x[0].toUpperCase() + x.slice(1)}</option>)}</select></label>
            <label className="text-sm">Description<input required disabled={busy} maxLength={250} value={form.description} onChange={e => update('description', e.target.value)} className={inputClass} /></label>
            <label className="text-sm">Vehicle (optional)<select disabled={busy} value={form.vehicle} onChange={e => update('vehicle', e.target.value)} className={inputClass}><option value="">General expense</option>{data.vehicles.map(v => <option key={v.id} value={v.id}>{v.plate_number}</option>)}</select></label>
          </>}
          <label className="text-sm">Amount (INR)<input required disabled={busy} type="number" step="0.01" min="0.01" max="9999999999.99" value={form.amount} onChange={e => update('amount', e.target.value)} className={inputClass} /></label>
          <label className="text-sm">Date<input required disabled={busy} type="date" max={today()} value={form.date} onChange={e => update('date', e.target.value)} className={inputClass} /></label>
          <label className="text-sm">Transaction / invoice reference<input disabled={busy} maxLength={100} value={form.reference} onChange={e => update('reference', e.target.value)} className={inputClass} /></label>
          <label className="text-sm">Notes<textarea disabled={busy} value={form.notes} onChange={e => update('notes', e.target.value)} className={inputClass} /></label>
          <div><button disabled={busy} className="rounded-lg bg-teal-700 px-4 py-2 text-white disabled:opacity-50">{busy ? 'Saving…' : 'Record transaction'}</button></div>
        </form>
      </section>
      <Ledger title="Booking balances" headings={['Booking / customer', 'Status', 'Booked revenue', 'Net received', 'Outstanding', 'Credit']}>
        {data.bookings.map(b => <tr key={b.reference}><Cell>{b.reference}<p className="text-slate-500">{b.customer} · {b.vehicle}</p></Cell><Cell>{b.status}</Cell><Cell>{money(b.billed)}</Cell><Cell>{money(b.received)}</Cell><Cell>{money(b.outstanding)}</Cell><Cell>{money(b.credit)}</Cell></tr>)}
        {!data.bookings.length && <tr><td colSpan={6} className="p-4 text-slate-500">No bookings yet.</td></tr>}
      </Ledger>
      <Ledger title="Payment and refund history" headings={['Date', 'Booking', 'Type / method', 'Amount', 'Reference / notes', 'Action']}>
        {data.payments.map(p => <tr key={p.id} className={p.voided_at ? 'opacity-60' : ''}><Cell>{p.date}</Cell><Cell>{p.booking}</Cell><Cell>{p.kind} · {p.method}</Cell><Cell>{money(p.amount)}</Cell><Cell>{p.reference || '—'}<p>{p.notes}</p><p className="text-xs text-slate-500">Recorded by {p.created_by_name} · {new Date(p.created_at).toLocaleString('en-IN')}</p></Cell><Cell>{voidButton(p, 'payments')}</Cell></tr>)}
        {!data.payments.length && <tr><td colSpan={6} className="p-4 text-slate-500">No payments recorded. Existing bookings are unpaid until receipts are entered.</td></tr>}
      </Ledger>
      <Ledger title="Expense history" headings={['Date', 'Category / source', 'Description', 'Amount', 'Reference / notes', 'Action']}>
        {data.expense_entries.map(e => <tr key={`expense-${e.id}`} className={e.voided_at ? 'opacity-60' : ''}><Cell>{e.date}</Cell><Cell>{e.category}</Cell><Cell>{e.description}{e.vehicle && <p className="text-slate-500">{data.vehicles.find(v => v.id === e.vehicle)?.plate_number || `Vehicle #${e.vehicle}`}</p>}</Cell><Cell>{money(e.amount)}</Cell><Cell>{e.reference || '—'}<p>{e.notes}</p><p className="text-xs text-slate-500">Recorded by {e.created_by_name} · {new Date(e.created_at).toLocaleString('en-IN')}</p></Cell><Cell>{voidButton(e, 'expenses')}</Cell></tr>)}
        {data.maintenance_entries.map(e => <tr key={`service-${e.id}`}><Cell>{e.date}</Cell><Cell>Maintenance · automatic</Cell><Cell>{e.description} · {e.vehicle}</Cell><Cell>{money(e.amount)}</Cell><Cell>Service #{e.id}</Cell><Cell>Manage in Service History</Cell></tr>)}
        {!data.expense_entries.length && !data.maintenance_entries.length && <tr><td colSpan={6} className="p-4 text-slate-500">No expenses recorded.</td></tr>}
      </Ledger>
    </>}
    {voidTarget && <VoidDialog target={voidTarget} busy={busy} error={voidError} onClose={() => { if (!busy) setVoidTarget(null) }} onSubmit={voidEntry} />}
  </div>
}
