import { useEffect, useState } from 'react'
import { apiUrl, dashboardHeaders } from '../lib/apiConfig'
import { readApiJson } from '../lib/apiResponse'
import DeleteConfirmation from './DeleteConfirmation'

const emptyHub = { name: '', location: '', city: '', address: '', phone: '', is_active: true, booking_amount: '' }
const emptyLocation = { name: '', is_active: true, booking_amount: '' }
export default function PickupHubs() {
  const [hubs, setHubs] = useState([])
  const [locations, setLocations] = useState([])
  const [locationForm, setLocationForm] = useState(emptyLocation)
  const [locationSaving, setLocationSaving] = useState(false)
  const [form, setForm] = useState(emptyHub)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  async function load() {
    const response = await fetch(apiUrl('/api/pickup-hubs/?include_inactive=1'), { headers: dashboardHeaders() })
    setHubs(await readApiJson(response, 'Unable to load locations.'))
    const locationResponse = await fetch(apiUrl('/api/locations/?include_inactive=1'), { headers: dashboardHeaders() })
    setLocations(await readApiJson(locationResponse, 'Unable to load hubs.'))
  }
  useEffect(() => { load().catch((error) => setError(error.message)) }, [])
  async function saveLocation(event) {
    event.preventDefault(); setLocationSaving(true); setError('')
    try {
      const response = await fetch(apiUrl(`/api/locations/${locationForm.id ? `${locationForm.id}/` : ''}`), {
        method: locationForm.id ? 'PATCH' : 'POST', headers: dashboardHeaders(), body: JSON.stringify({ ...locationForm, booking_amount: locationForm.booking_amount === '' ? null : locationForm.booking_amount }),
      })
      await readApiJson(response, 'Unable to save hub.')
      setLocationForm(emptyLocation); await load()
    } catch (error) { setError(error.message) }
    finally { setLocationSaving(false) }
  }
  function requestDelete(item, kind) {
    setDeleteError('')
    setDeleteTarget({ item, kind })
  }
  async function confirmDelete() {
    if (deleting || !deleteTarget) return
    const { item, kind } = deleteTarget
    setDeleting(true)
    setDeleteError('')
    setError('')
    try {
      const resource = kind === 'location' ? 'locations' : 'pickup-hubs'
      const response = await fetch(apiUrl(`/api/${resource}/${item.id}/`), { method: 'DELETE', headers: dashboardHeaders() })
      if (!response.ok) await readApiJson(response, `Unable to delete ${kind === 'location' ? 'hub' : 'location'}.`)
      if (kind === 'location') {
        setLocations(current => current.filter(location => location.id !== item.id))
        if (locationForm.id === item.id) setLocationForm(emptyLocation)
      } else {
        setHubs(current => current.filter(hub => hub.id !== item.id))
        if (form.id === item.id) setForm(emptyHub)
      }
      setDeleteTarget(null)
      await load().catch(error => setError(error.message))
    } catch (error) { setDeleteError(error.message) }
    finally { setDeleting(false) }
  }
  async function save(event) {
    event.preventDefault(); setSaving(true); setError('')
    try {
      const response = await fetch(apiUrl(`/api/pickup-hubs/${form.id ? `${form.id}/` : ''}`), {
        method: form.id ? 'PATCH' : 'POST', headers: dashboardHeaders(), body: JSON.stringify({ ...form, booking_amount: form.booking_amount === '' ? null : form.booking_amount }),
      })
      await readApiJson(response, 'Unable to save location.')
      setForm(emptyHub); await load()
    } catch (error) { setError(error.message) }
    finally { setSaving(false) }
  }
  return <div className="space-y-6">
    <h2 className="text-xl font-bold">Hubs & locations</h2>
    <p className="text-sm text-slate-500">Add a hub, such as Kochi, then add locations under it and assign vehicles to a location.</p>
    <p className="text-sm text-slate-500">Set a default booking charge for each hub. A location can override it; leave its amount blank to use the hub charge. Enter 0 for no charge.</p>
    {error && <p role="alert" className="text-red-600">{error}</p>}
    <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
      <h3 className="font-bold">Hubs</h3>
      <form onSubmit={saveLocation} className="flex flex-wrap items-end gap-4">
        <label className="text-sm font-semibold">Hub name<input required maxLength={100} value={locationForm.name} onChange={e => setLocationForm({ ...locationForm, name: e.target.value })} placeholder="e.g. Kochi" className="mt-2 block rounded-lg border px-3 py-2" /></label>
        <label className="text-sm font-semibold">Default booking charge (INR)<input type="number" min="0" max="99999999.99" step="0.01" value={locationForm.booking_amount ?? ''} onChange={e => setLocationForm({ ...locationForm, booking_amount: e.target.value })} placeholder="Standard charge" className="mt-2 block rounded-lg border px-3 py-2" /></label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={locationForm.is_active} onChange={e => setLocationForm({ ...locationForm, is_active: e.target.checked })} />Active hub</label>
        <button disabled={locationSaving} className="rounded-lg bg-[#047857] px-4 py-2 text-white">{locationForm.id ? 'Save hub' : 'Add hub'}</button>
        {locationForm.id && <button type="button" onClick={() => setLocationForm(emptyLocation)}>Cancel edit</button>}
      </form>
      <div className="flex flex-wrap gap-3">{locations.map(location => <div key={location.id} className="rounded-lg border p-3 text-sm">
        <strong>{location.name}</strong> · {location.is_active ? 'Active' : 'Inactive'}
        <p className="mt-1 text-xs text-slate-500">Booking charge: {location.booking_amount == null ? 'Standard charge' : `INR ${Number(location.booking_amount).toLocaleString('en-IN')}`}</p>
        <button onClick={() => setLocationForm(location)} className="ml-3 text-[#047857]">Edit</button>
        <button onClick={() => requestDelete(location, 'location')} className="ml-3 text-red-600">Delete</button>
      </div>)}</div>
    </section>
    <form onSubmit={save} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
      <h3 className="font-bold sm:col-span-2">Locations</h3>
      <label className="text-sm font-semibold">Hub<select required value={form.location ?? ''} onChange={e => setForm({ ...form, location: Number(e.target.value) })} className="mt-2 w-full rounded-lg border px-3 py-2">
        <option value="">Choose hub</option>
        {locations.filter(location => location.is_active || location.id === form.location).map(location => <option key={location.id} value={location.id}>{location.name}{location.is_active ? '' : ' (inactive)'}</option>)}
      </select></label>
      {['name', 'address', 'phone'].map((field) => <label key={field} className="text-sm font-semibold capitalize">{field === 'name' ? 'Location name' : field}
        <input required={field === 'name'} value={form[field]} onChange={(event) => setForm({ ...form, [field]: event.target.value })} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2" />
      </label>)}
      <label className="text-sm font-semibold">Booking charge override (INR)<input type="number" min="0" max="99999999.99" step="0.01" value={form.booking_amount ?? ''} onChange={e => setForm({ ...form, booking_amount: e.target.value })} placeholder="Use hub charge" className="mt-2 w-full rounded-lg border px-3 py-2" /><span className="mt-1 block text-xs font-normal text-slate-500">Leave blank to inherit the hub charge.</span></label>
      <label className="flex items-center gap-2"><input type="checkbox" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} />Active location</label>
      <div className="flex gap-3"><button disabled={saving} className="rounded-lg bg-teal-700 px-4 py-2 text-white">{form.id ? 'Save changes' : 'Add location'}</button>
        {form.id && <button type="button" onClick={() => setForm(emptyHub)}>Cancel edit</button>}</div>
    </form>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{hubs.map((hub) => <div key={hub.id} className="rounded-2xl border border-slate-200 bg-white p-5">
      <h3 className="font-bold">{hub.name}</h3><p className="text-sm text-slate-500">{hub.location_name || hub.city} · {hub.is_active ? 'Active' : 'Inactive'}</p>
      <p className="mt-2 text-sm">Booking charge: INR {Number(hub.effective_booking_amount || 0).toLocaleString('en-IN')} {hub.booking_amount == null ? '(hub / standard default)' : '(location override)'}</p>
      <p className="mt-2 text-sm">{hub.address}</p><p className="text-sm">{hub.phone}</p>
      <div className="mt-4 flex gap-4"><button onClick={() => setForm(hub)} className="text-teal-700">Edit</button><button onClick={() => requestDelete(hub, 'pickup hub')} className="text-red-600">Delete</button></div>
    </div>)}</div>
    {!hubs.length && <p className="text-slate-500">Add a location under a hub, then assign vehicles in Fleet.</p>}
    {deleteTarget && <DeleteConfirmation name={deleteTarget.item.name} kind={deleteTarget.kind === 'location' ? 'hub' : 'location'} loading={deleting} error={deleteError} onClose={() => { if (!deleting) setDeleteTarget(null) }} onConfirm={confirmDelete} />}
  </div>
}
