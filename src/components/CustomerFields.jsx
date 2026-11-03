import { useEffect, useId, useRef, useState } from 'react'
import { apiUrl } from '../lib/apiConfig'
import { readApiJson } from '../lib/apiResponse'

export default function CustomerFields({ name, phone, email, onChange, disabled, inputClass }) {
  const id = useId()
  const rootRef = useRef(null)
  const [query, setQuery] = useState('')
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)
  useEffect(() => {
    const controller = new AbortController()
    const value = query.trim()
    setMatches([]); setError(''); setSearched(false); setLoading(false)
    if (value.length < 2) return () => controller.abort()
    const timeout = setTimeout(async () => {
      setLoading(true)
      try {
        const user = JSON.parse(localStorage.getItem('zudo_user') || sessionStorage.getItem('zudo_user') || '{}')
        if (!user.token) throw new Error('Sign in again to search saved customers.')
        const response = await fetch(apiUrl(`/api/customers/?q=${encodeURIComponent(value)}`), {
          headers: { Authorization: `Bearer ${user.token}` }, signal: controller.signal,
        })
        const results = await readApiJson(response, 'Unable to search customers.')
        if (!controller.signal.aborted) { setMatches(results); setSearched(true) }
      } catch (error) {
        if (!controller.signal.aborted) setError(error.message)
      } finally { if (!controller.signal.aborted) setLoading(false) }
    }, 250)
    return () => { clearTimeout(timeout); controller.abort() }
  }, [query])
  function change(field, value) {
    onChange({ [field]: value })
    setMatches([]); setSearched(false); setError(''); setQuery(value)
  }
  function close() { setQuery(''); setMatches([]); setSearched(false); setError('') }
  return <div ref={rootRef} className="sm:col-span-2" onKeyDown={event => { if (event.key === 'Escape') { event.stopPropagation(); close() } }} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) close() }}>
    <div className="grid gap-4 sm:grid-cols-2">
      <label htmlFor={`${id}-name`} className="text-sm">Customer name<input id={`${id}-name`} required disabled={disabled} autoComplete="off" maxLength={150} value={name} onChange={event => change('customer_name', event.target.value)} onFocus={() => { if (name.length >= 2) setQuery(name) }} className={inputClass} aria-describedby={`${id}-help`} /></label>
      <label htmlFor={`${id}-phone`} className="text-sm">Mobile number<input id={`${id}-phone`} required disabled={disabled} autoComplete="off" type="tel" pattern="\+?[0-9]{10,15}" title="10–15 digits, optionally starting with +" value={phone} onChange={event => change('customer_phone', event.target.value)} onFocus={() => { if (phone.length >= 2) setQuery(phone) }} className={inputClass} aria-describedby={`${id}-help`} /></label>
    </div>
    <p id={`${id}-help`} className="mt-2 text-xs text-slate-500">Type at least 2 letters or mobile digits to find a saved customer. Select a match to fill their details.</p>
    <div aria-live="polite" className="mt-2 text-sm">
      {loading && <p className="text-slate-500">Searching customers…</p>}
      {error && <p className="text-amber-700">{error} You can still enter details manually.</p>}
      {searched && !matches.length && <p className="text-slate-500">No saved customer found. These details will be saved with the booking.</p>}
    </div>
    {matches.length > 0 && <div aria-label="Matching customers" className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-sm">
      {matches.map(customer => <button key={customer.id} type="button" disabled={disabled} onClick={() => {
        onChange({ customer_name: customer.name, customer_phone: customer.phone, customer_email: customer.email || '' }); close()
      }} className="block w-full border-b border-slate-100 px-3 py-2 text-left text-sm text-slate-900 last:border-0 hover:bg-teal-50 focus:bg-teal-50 focus:outline-none">
        <span className="font-medium">{customer.name}</span><span className="ml-3 text-slate-500">{customer.phone}</span>{customer.email && <span className="block text-xs text-slate-500">{customer.email}</span>}
      </button>)}
    </div>}
    <label htmlFor={`${id}-email`} className="mt-4 block text-sm">Email (optional)<input id={`${id}-email`} disabled={disabled} type="email" autoComplete="off" value={email} onChange={event => onChange({ customer_email: event.target.value })} className={inputClass} /></label>
  </div>
}
