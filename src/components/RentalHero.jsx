import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Search } from 'lucide-react'
import usePickupHubs from '../lib/usePickupHubs'

const localDate = date => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
const initialDate = days => { const date = new Date(); date.setDate(date.getDate()+days); return localDate(date) }
export default function RentalHero() {
  const navigate = useNavigate()
  const { hubs, error: locationError } = usePickupHubs()
  const [pickup, setPickup] = useState('')
  const [dropoff, setDropoff] = useState('')
  const [different, setDifferent] = useState(false)
  const [monthly, setMonthly] = useState(false)
  const [from, setFrom] = useState(initialDate(1))
  const [till, setTill] = useState(initialDate(4))
  const [fromTime, setFromTime] = useState('12:00')
  const [tillTime, setTillTime] = useState('12:00')
  const [error, setError] = useState('')
  useEffect(() => { if(hubs.length && !pickup) { setPickup(String(hubs[0].id)); setDropoff(String(hubs[0].id)) } }, [hubs, pickup])
  const selectPeriod = isMonthly => { setMonthly(isMonthly); const date = new Date(`${from}T12:00:00`); if(Number.isNaN(date.getTime())) return; date.setDate(date.getDate()+(isMonthly?30:3)); setTill(localDate(date)) }
  const search = event => {
    event.preventDefault()
    if (!pickup || (different && !dropoff)) { setError(locationError || 'Please choose a pickup location.'); return }
    if (new Date(`${from}T${fromTime}`) <= new Date()) { setError('Please choose a future pickup date and time.'); return }
    if (new Date(`${till}T${tillTime}`) <= new Date(`${from}T${fromTime}`)) { setError('Return must be after pickup.'); return }
    navigate(`/cars?${new URLSearchParams({date_from:from,time_from:fromTime,date_to:till,time_to:tillTime,pickup_location_id:pickup,dropoff_location_id:different?dropoff:pickup,vehicle_type:'car'})}`)
  }
  return <section className="rental-hero"><div className="rental-hero-content">
    <h1>Rent a car in Kerala</h1><p className="rental-subtitle">Find your next drive<br/>with Zudo Cars</p>
    <div className="rental-tabs" aria-label="Rental period"><button type="button" aria-pressed={!monthly} className={!monthly?'selected':''} onClick={()=>selectPeriod(false)}>Daily rentals</button><button type="button" aria-pressed={monthly} className={monthly?'selected':''} onClick={()=>selectPeriod(true)}>Monthly rentals</button></div>
    <form className="rental-search" onSubmit={search}>
      <label className="location-field"><MapPin size={25}/><span><span className="field-caption">Pickup location</span><select aria-label="Pickup location" value={pickup} onChange={e=>setPickup(e.target.value)} required><option value="" disabled>{hubs.length?'Choose location':'Choose pickup location'}</option>{hubs.map(h=><option key={h.id} value={h.id}>{h.name}</option>)}</select></span></label>
      <div className="rental-date-field"><label><span className="field-caption">From</span><input aria-label="Pickup date" type="date" min={initialDate(0)} value={from} onChange={e=>setFrom(e.target.value)} required/></label><label><span className="field-caption">Time</span><input aria-label="Pickup time" type="time" value={fromTime} onChange={e=>setFromTime(e.target.value)} required/></label></div>
      <div className="rental-date-field"><label><span className="field-caption">Till</span><input aria-label="Return date" type="date" min={from} value={till} onChange={e=>setTill(e.target.value)} required/></label><label><span className="field-caption">Time</span><input aria-label="Return time" type="time" value={tillTime} onChange={e=>setTillTime(e.target.value)} required/></label></div>
      <button className="rental-search-button" type="submit"><Search size={22}/>Search cars</button>
      <div className="rental-return"><label><input type="checkbox" checked={different} onChange={e=>setDifferent(e.target.checked)}/> Return to a different location</label>{different && <select aria-label="Drop-off location" value={dropoff} onChange={e=>setDropoff(e.target.value)}>{hubs.map(h=><option key={h.id} value={h.id}>{h.name}</option>)}</select>}</div>
      {(error || locationError) && <p role="alert" className="rental-error">{error || locationError}</p>}
    </form>
  </div></section>
}
