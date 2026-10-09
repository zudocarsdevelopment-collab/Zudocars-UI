import { useEffect, useState } from 'react'
import { apiUrl, dashboardHeaders } from '../lib/apiConfig'

const emptyHub = { name: '', city: '', address: '', phone: '', is_active: true }
export default function PickupHubs() {
  const [hubs, setHubs] = useState([])
  const [form, setForm] = useState(emptyHub)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  async function load() {
    const response = await fetch(apiUrl('/api/pickup-hubs/?include_inactive=1'), { headers: dashboardHeaders() })
    if (!response.ok) throw new Error('Unable to load hubs.')
    setHubs(await response.json())
  }
  useEffect(() => { load().catch((error) => setError(error.message)) }, [])
  async function save(event) {
    event.preventDefault(); setSaving(true); setError('')
    try {
      const response = await fetch(apiUrl(`/api/pickup-hubs/${form.id ? `${form.id}/` : ''}`), {
        method: form.id ? 'PATCH' : 'POST', headers: dashboardHeaders(), body: JSON.stringify(form),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || data.detail || JSON.stringify(data))
      setForm(emptyHub); await load()
    } catch (error) { setError(error.message) }
    finally { setSaving(false) }
  }
  async function remove(hub) {
    if (!window.confirm(`Delete pickup hub ${hub.name}?`)) return
    setError('')
    try {
      const response = await fetch(apiUrl(`/api/pickup-hubs/${hub.id}/`), { method: 'DELETE', headers: dashboardHeaders() })
      if (!response.ok) { const data = await response.json(); throw new Error(data.error || JSON.stringify(data)) }
      await load()
    } catch (error) { setError(error.message) }
  }
  return <div className="space-y-6">
    <h2 className="text-xl font-bold">Pickup hubs</h2>
    {error && <p role="alert" className="text-red-600">{error}</p>}
    <form onSubmit={save} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
      {['name', 'city', 'address', 'phone'].map((field) => <label key={field} className="text-sm font-semibold capitalize">{field}
        <input required={field === 'name'} value={form[field]} onChange={(event) => setForm({ ...form, [field]: event.target.value })} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2" />
      </label>)}
      <label className="flex items-center gap-2"><input type="checkbox" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} />Active hub</label>
      <div className="flex gap-3"><button disabled={saving} className="rounded-lg bg-teal-700 px-4 py-2 text-white">{form.id ? 'Save changes' : 'Add hub'}</button>
        {form.id && <button type="button" onClick={() => setForm(emptyHub)}>Cancel edit</button>}</div>
    </form>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{hubs.map((hub) => <div key={hub.id} className="rounded-2xl border border-slate-200 bg-white p-5">
      <h3 className="font-bold">{hub.name}</h3><p className="text-sm text-slate-500">{hub.city} · {hub.is_active ? 'Active' : 'Inactive'}</p>
      <p className="mt-2 text-sm">{hub.address}</p><p className="text-sm">{hub.phone}</p>
      <div className="mt-4 flex gap-4"><button onClick={() => setForm(hub)} className="text-teal-700">Edit</button><button onClick={() => remove(hub)} className="text-red-600">Delete</button></div>
    </div>)}</div>
    {!hubs.length && <p className="text-slate-500">Add a hub, then assign vehicles in Fleet.</p>}
  </div>
}
