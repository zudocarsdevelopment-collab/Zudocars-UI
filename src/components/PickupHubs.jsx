import { useEffect, useState } from 'react'
import { apiUrl, dashboardHeaders } from '../lib/apiConfig'

const emptyHub = { name: '', location: '', city: '', address: '', phone: '', is_active: true }
const emptyLocation = { name: '', is_active: true }
export default function PickupHubs() {
  const [hubs, setHubs] = useState([])
  const [locations, setLocations] = useState([])
  const [locationForm, setLocationForm] = useState(emptyLocation)
  const [locationSaving, setLocationSaving] = useState(false)
  const [form, setForm] = useState(emptyHub)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  async function load() {
    const response = await fetch(apiUrl('/api/pickup-hubs/?include_inactive=1'), { headers: dashboardHeaders() })
    if (!response.ok) throw new Error('Unable to load hubs.')
    setHubs(await response.json())
    const locationResponse = await fetch(apiUrl('/api/locations/?include_inactive=1'), { headers: dashboardHeaders() })
    if (!locationResponse.ok) throw new Error('Unable to load locations.')
    setLocations(await locationResponse.json())
  }
  useEffect(() => { load().catch((error) => setError(error.message)) }, [])
  async function saveLocation(event) {
    event.preventDefault(); setLocationSaving(true); setError('')
    try {
      const response = await fetch(apiUrl(`/api/locations/${locationForm.id ? `${locationForm.id}/` : ''}`), {
        method: locationForm.id ? 'PATCH' : 'POST', headers: dashboardHeaders(), body: JSON.stringify(locationForm),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || data.detail || Object.values(data).flat().join(' '))
      setLocationForm(emptyLocation); await load()
    } catch (error) { setError(error.message) }
    finally { setLocationSaving(false) }
  }
  async function removeLocation(location) {
    if (!window.confirm(`Delete location ${location.name}?`)) return
    setError('')
    try {
      const response = await fetch(apiUrl(`/api/locations/${location.id}/`), { method: 'DELETE', headers: dashboardHeaders() })
      if (!response.ok) { const data = await response.json(); throw new Error(data.error || data.detail || 'Unable to delete location.') }
      await load()
    } catch (error) { setError(error.message) }
  }
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
    <h2 className="text-xl font-bold">Locations & pickup hubs</h2>
    <p className="text-sm text-slate-500">Add a location, such as Kochi, then add its pickup hubs and assign vehicles to a hub.</p>
    {error && <p role="alert" className="text-red-600">{error}</p>}
    <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
      <h3 className="font-bold">Locations</h3>
      <form onSubmit={saveLocation} className="flex flex-wrap items-end gap-4">
        <label className="text-sm font-semibold">Location name<input required maxLength={100} value={locationForm.name} onChange={e => setLocationForm({ ...locationForm, name: e.target.value })} placeholder="e.g. Kochi" className="mt-2 block rounded-lg border px-3 py-2" /></label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={locationForm.is_active} onChange={e => setLocationForm({ ...locationForm, is_active: e.target.checked })} />Active location</label>
        <button disabled={locationSaving} className="rounded-lg bg-[#047857] px-4 py-2 text-white">{locationForm.id ? 'Save location' : 'Add location'}</button>
        {locationForm.id && <button type="button" onClick={() => setLocationForm(emptyLocation)}>Cancel edit</button>}
      </form>
      <div className="flex flex-wrap gap-3">{locations.map(location => <div key={location.id} className="rounded-lg border p-3 text-sm">
        <strong>{location.name}</strong> · {location.is_active ? 'Active' : 'Inactive'}
        <button onClick={() => setLocationForm(location)} className="ml-3 text-[#047857]">Edit</button>
        <button onClick={() => removeLocation(location)} className="ml-3 text-red-600">Delete</button>
      </div>)}</div>
    </section>
    <form onSubmit={save} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
      <label className="text-sm font-semibold">Location<select required value={form.location ?? ''} onChange={e => setForm({ ...form, location: Number(e.target.value) })} className="mt-2 w-full rounded-lg border px-3 py-2">
        <option value="">Choose location</option>
        {locations.filter(location => location.is_active || location.id === form.location).map(location => <option key={location.id} value={location.id}>{location.name}{location.is_active ? '' : ' (inactive)'}</option>)}
      </select></label>
      {['name', 'address', 'phone'].map((field) => <label key={field} className="text-sm font-semibold capitalize">{field}
        <input required={field === 'name'} value={form[field]} onChange={(event) => setForm({ ...form, [field]: event.target.value })} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2" />
      </label>)}
      <label className="flex items-center gap-2"><input type="checkbox" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} />Active hub</label>
      <div className="flex gap-3"><button disabled={saving} className="rounded-lg bg-teal-700 px-4 py-2 text-white">{form.id ? 'Save changes' : 'Add hub'}</button>
        {form.id && <button type="button" onClick={() => setForm(emptyHub)}>Cancel edit</button>}</div>
    </form>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{hubs.map((hub) => <div key={hub.id} className="rounded-2xl border border-slate-200 bg-white p-5">
      <h3 className="font-bold">{hub.name}</h3><p className="text-sm text-slate-500">{hub.location_name || hub.city} · {hub.is_active ? 'Active' : 'Inactive'}</p>
      <p className="mt-2 text-sm">{hub.address}</p><p className="text-sm">{hub.phone}</p>
      <div className="mt-4 flex gap-4"><button onClick={() => setForm(hub)} className="text-teal-700">Edit</button><button onClick={() => remove(hub)} className="text-red-600">Delete</button></div>
    </div>)}</div>
    {!hubs.length && <p className="text-slate-500">Add a hub, then assign vehicles in Fleet.</p>}
  </div>
}
