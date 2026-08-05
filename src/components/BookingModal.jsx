import { useEffect, useState, useMemo, useRef } from 'react'
import { X, MapPin, User, Phone, CheckCircle2, ChevronLeft, ShieldCheck, Navigation } from 'lucide-react'

const formatINR = (num) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num)

const STEPS = ['Delivery', 'Your details', 'Deposit & terms', 'Review & confirm']

// Preset locations charge a flat rate — no distance lookup needed.
const PRESET_LOCATIONS = [
  { id: 'branch', label: 'Self pickup — branch', fee: 0 },
  { id: 'airport', label: 'Airport Terminal, Trivandrum', fee: 300 },
  { id: 'railway', label: 'Railway Station', fee: 200 },
]

// Per-km rate depends on service zone. Zones are set by the business —
// Google Maps supplies the distance, this table supplies the rate.
// The "remote" tier covers the agent-return-transport problem: a higher
// per-km rate on distant/underserved bookings covers their Uber back.
const ZONE_RATES = [
  { id: 'standard', label: 'Standard zone (within city)', ratePerKm: 15, maxKm: 20 },
  { id: 'extended', label: 'Extended zone', ratePerKm: 20, maxKm: 45 },
  { id: 'remote', label: 'Remote / outstation', ratePerKm: 30, maxKm: 999 },
]
const FREE_KM = 5 // first 5km of delivery are free everywhere

/**
 * Placeholder for the real distance lookup.
 * In production this calls YOUR backend (never Google directly from the
 * client, to keep the API key server-side), e.g.:
 *   GET /api/delivery-fee/?destination=<address or place_id>
 * which internally calls Google's Distance Matrix / Routes API against a
 * fixed origin (your branch) and returns { km, zone }.
 * Swap this mock for that fetch call once the endpoint exists.
 */
async function fetchDeliveryDistance(address) {
  await new Promise((r) => setTimeout(r, 600))
  // Mocked distance — replace with real backend response.
  const mockKm = 8 + (address.length % 30)
  const zone = ZONE_RATES.find((z) => mockKm <= z.maxKm) || ZONE_RATES[ZONE_RATES.length - 1]
  return { km: mockKm, zone }
}

export default function BookingModal({ car, slot, onClose }) {
  const [step, setStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState({})
  const addressInputRef = useRef(null)

  const [form, setForm] = useState({
    deliveryType: 'branch', // 'branch' | preset id | 'custom'
    customAddress: '',
    distanceKm: 0,
    deliveryFee: 0,
    zoneLabel: '',
    fullName: '',
    phone: '',
    notes: '',
    agreedToTerms: false,
  })
  const [distanceLoading, setDistanceLoading] = useState(false)

  // Lock background scroll + close on Escape
  useEffect(() => {
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => { document.body.style.overflow = original; window.removeEventListener('keydown', handler) }
  }, [onClose])

  const hourlyRate = Number(car?.hourly_rate) || 0
  const deposit = Number(car?.deposit_amount) || Math.round(hourlyRate * 10)

  const totalHours = useMemo(() => {
    if (!slot) return 0
    const start = new Date(`${slot.pickupDate}T${slot.pickupTime}`)
    const end = new Date(`${slot.returnDate}T${slot.returnTime}`)
    const diffMs = end - start
    if (isNaN(diffMs) || diffMs <= 0) return 0
    return Math.ceil(diffMs / (1000 * 60 * 60))
  }, [slot])

  const rentalCost = totalHours * hourlyRate
  const estimatedTotal = rentalCost + form.deliveryFee

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }))
  }

  async function selectDeliveryOption(optionId) {
    if (optionId === 'branch') {
      update('deliveryType', 'branch')
      update('deliveryFee', 0)
      update('zoneLabel', '')
      return
    }
    const preset = PRESET_LOCATIONS.find((p) => p.id === optionId)
    if (preset) {
      update('deliveryType', optionId)
      update('deliveryFee', preset.fee)
      update('zoneLabel', preset.label)
      return
    }
    update('deliveryType', 'custom')
  }

  async function lookupCustomAddress() {
    if (!form.customAddress.trim()) return
    setDistanceLoading(true)
    try {
      const { km, zone } = await fetchDeliveryDistance(form.customAddress.trim())
      const chargeableKm = Math.max(0, km - FREE_KM)
      const fee = Math.round(chargeableKm * zone.ratePerKm)
      setForm((f) => ({ ...f, distanceKm: km, deliveryFee: fee, zoneLabel: `${zone.label} · ${km} km` }))
    } catch {
      setErrors((e) => ({ ...e, customAddress: 'Could not calculate distance. Try again.' }))
    } finally {
      setDistanceLoading(false)
    }
  }

  function validateStep(current) {
    const next = {}
    if (current === 0) {
      if (form.deliveryType === 'custom' && !form.customAddress.trim()) {
        next.customAddress = 'Enter a delivery address.'
      }
      if (form.deliveryType === 'custom' && form.distanceKm === 0 && !distanceLoading) {
        next.customAddress = 'Calculate the delivery fee before continuing.'
      }
    }
    if (current === 1) {
      if (!form.fullName.trim()) next.fullName = 'Enter your full name.'
      if (!/^\d{10}$/.test(form.phone.trim())) next.phone = 'Enter a valid 10-digit phone number.'
    }
    if (current === 2) {
      if (!form.agreedToTerms) next.agreedToTerms = 'You need to accept the terms to continue.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function goNext() {
    if (!validateStep(step)) return
    if (step < STEPS.length - 1) setStep(step + 1)
    else setSubmitted(true)
  }

  function goBack() {
    if (step > 0) setStep(step - 1)
  }

  if (!car || !slot) return null

  const image = car.vehicle_image || car.photo_url ||
    'https://images.unsplash.com/photo-1494905998402-395d579af36f?w=600&h=400&fit=crop'

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true" aria-label={`Book ${car.category}`}>
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" onClick={onClose} />

      <div className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col animate-[slideUp_0.25s_ease-out] overflow-hidden">
        <button onClick={onClose} aria-label="Close booking form" className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors">
          <X className="w-4 h-4" />
        </button>

        {submitted ? (
          <Confirmation car={car} form={form} totalHours={totalHours} estimatedTotal={estimatedTotal} onClose={onClose} />
        ) : (
          <>
            <div className="flex items-center gap-4 p-5 pb-4 border-b border-gray-100">
              <img src={image} alt={car.category} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Booking request</p>
                <h3 className="text-lg font-bold text-gray-900 truncate">{car.category}</h3>
                <p className="text-sm text-gray-400">
                  {slot.pickupDate} {slot.pickupTime} → {slot.returnDate} {slot.returnTime}
                </p>
              </div>
            </div>

            <div className="px-6 pt-5 pb-1">
              <div className="flex items-center gap-2 mb-2">
                {STEPS.map((label, i) => (
                  <div key={label} className="flex-1">
                    <div className={`h-1.5 rounded-full transition-colors duration-300 ${i <= step ? 'bg-blue-600' : 'bg-gray-100'}`} />
                  </div>
                ))}
              </div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Step {step + 1} of {STEPS.length} · {STEPS[step]}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {step === 0 && (
                <DeliveryStep
                  form={form}
                  errors={errors}
                  distanceLoading={distanceLoading}
                  update={update}
                  selectDeliveryOption={selectDeliveryOption}
                  lookupCustomAddress={lookupCustomAddress}
                  addressInputRef={addressInputRef}
                />
              )}
              {step === 1 && <RenterDetailsStep form={form} update={update} errors={errors} />}
              {step === 2 && (
                <DepositTermsStep form={form} update={update} errors={errors} deposit={deposit} />
              )}
              {step === 3 && (
                <ReviewStep car={car} form={form} totalHours={totalHours} rentalCost={rentalCost} estimatedTotal={estimatedTotal} hourlyRate={hourlyRate} deposit={deposit} />
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/60 flex items-center gap-3">
              {step > 0 ? (
                <button onClick={goBack} className="flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-gray-900 px-4 py-3 transition-colors">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
              ) : <span className="flex-shrink-0" />}
              <button onClick={goNext} className="flex-1 bg-blue-600 text-white py-3.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20">
                {step < STEPS.length - 1 ? 'Continue' : 'Confirm booking'}
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px) } to { opacity: 1; transform: translateY(0) } }
        @media (min-width: 640px) {
          @keyframes slideUp { from { opacity: 0; transform: translateY(12px) scale(0.98) } to { opacity: 1; transform: translateY(0) scale(1) } }
        }
      `}</style>
    </div>
  )
}

function Field({ label, icon: Icon, error, children }) {
  return (
    <label className="block mb-4">
      <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {label}
      </span>
      {children}
      {error && <span className="block text-xs text-red-500 mt-1.5">{error}</span>}
    </label>
  )
}

const inputClass = 'w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all'

function DeliveryStep({ form, errors, distanceLoading, update, selectDeliveryOption, lookupCustomAddress, addressInputRef }) {
  const options = [{ id: 'branch', label: PRESET_LOCATIONS[0].label, fee: 0 }, ...PRESET_LOCATIONS.slice(1)]

  return (
    <div>
      <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Where should we bring the car?</span>
      <div className="space-y-2 mb-4">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => selectDeliveryOption(opt.id)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-colors ${
              form.deliveryType === opt.id ? 'border-blue-500 bg-blue-50/60' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <span className="flex items-center gap-2 text-sm font-semibold text-gray-800">
              <MapPin className="w-4 h-4 text-gray-400" /> {opt.label}
            </span>
            <span className="text-sm font-semibold text-gray-500">{opt.fee === 0 ? 'Free' : formatINR(opt.fee)}</span>
          </button>
        ))}

        <button
          onClick={() => selectDeliveryOption('custom')}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-colors ${
            form.deliveryType === 'custom' ? 'border-blue-500 bg-blue-50/60' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <span className="flex items-center gap-2 text-sm font-semibold text-gray-800">
            <Navigation className="w-4 h-4 text-gray-400" /> Other address
          </span>
          <span className="text-xs text-gray-400">Fee based on distance</span>
        </button>
      </div>

      {form.deliveryType === 'custom' && (
        <div className="rounded-xl bg-gray-50 p-4">
          <Field label="Delivery address" error={errors.customAddress}>
            <div className="flex gap-2">
              <input
                ref={addressInputRef}
                type="text"
                placeholder="Search your address"
                className={inputClass}
                value={form.customAddress}
                onChange={(e) => update('customAddress', e.target.value)}
              />
              <button
                onClick={lookupCustomAddress}
                disabled={distanceLoading}
                className="px-4 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {distanceLoading ? 'Checking…' : 'Get fee'}
              </button>
            </div>
          </Field>
          {form.zoneLabel && form.deliveryType === 'custom' && (
            <div className="flex items-center justify-between text-sm bg-white rounded-xl px-4 py-3 border border-gray-100">
              <span className="text-gray-500">{form.zoneLabel} · first {FREE_KM}km free</span>
              <span className="font-bold text-gray-900">{formatINR(form.deliveryFee)}</span>
            </div>
          )}
          <p className="text-xs text-gray-400 mt-2">
            Distance is calculated automatically from our branch to your address via Google Maps.
          </p>
        </div>
      )}
    </div>
  )
}

function RenterDetailsStep({ form, update, errors }) {
  return (
    <div>
      <Field label="Full name" icon={User} error={errors.fullName}>
        <input type="text" placeholder="As on your driving license" className={inputClass} value={form.fullName} onChange={(e) => update('fullName', e.target.value)} />
      </Field>
      <Field label="Phone number" icon={Phone} error={errors.phone}>
        <input type="tel" placeholder="10-digit mobile" className={inputClass} value={form.phone} onChange={(e) => update('phone', e.target.value.replace(/\D/g, '').slice(0, 10))} />
      </Field>
      <Field label="Notes for the team (optional)">
        <textarea rows={2} placeholder="Child seat, extra driver, anything else we should know" className={`${inputClass} resize-none`} value={form.notes} onChange={(e) => update('notes', e.target.value)} />
      </Field>
    </div>
  )
}

function DepositTermsStep({ form, update, errors, deposit }) {
  return (
    <div>
      <div className="rounded-2xl border border-gray-100 p-4 mb-5 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-gray-900">Refundable deposit</p>
          <p className="text-sm text-gray-500 mb-1">Held at pickup, refunded after a clean return.</p>
          <p className="text-xl font-bold text-gray-900">{formatINR(deposit)}</p>
        </div>
      </div>

      <div className="rounded-2xl bg-gray-50 p-4 mb-4 max-h-48 overflow-y-auto text-sm text-gray-600 space-y-2">
        <p>By booking, you agree to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Return the vehicle to the agreed location by the booked return time.</li>
          <li>A late return is charged at the vehicle's hourly rate for every hour past the booked return time.</li>
          <li>The deposit is refunded after the vehicle is inspected on return, minus any late fees or damage charges.</li>
          <li>Delivery fees for custom addresses are estimated from distance and confirmed at pickup.</li>
          <li>A valid driving license must be presented at pickup.</li>
        </ul>
      </div>

      <label className="flex items-start gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          checked={form.agreedToTerms}
          onChange={(e) => update('agreedToTerms', e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500/30"
        />
        <span className="text-sm text-gray-700">I have read and agree to the rental terms and conditions.</span>
      </label>
      {errors.agreedToTerms && <p className="text-xs text-red-500 mt-2">{errors.agreedToTerms}</p>}
    </div>
  )
}

function ReviewStep({ car, form, totalHours, rentalCost, estimatedTotal, hourlyRate, deposit }) {
  const rows = [
    ['Vehicle', `${car.category} · ${car.plate_number}`],
    ['Delivery to', form.zoneLabel || 'Self pickup — branch'],
    ['Renter', form.fullName],
    ['Phone', form.phone],
  ]

  return (
    <div>
      <div className="rounded-2xl border border-gray-100 divide-y divide-gray-100 mb-5">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-start justify-between gap-4 px-4 py-3 text-sm">
            <span className="text-gray-400 font-medium flex-shrink-0">{label}</span>
            <span className="text-gray-900 font-semibold text-right">{value || '—'}</span>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-blue-50 px-4 py-4 space-y-1.5">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{formatINR(hourlyRate)}/hr × {totalHours} hrs</span>
          <span>{formatINR(rentalCost)}</span>
        </div>
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Delivery fee</span>
          <span>{form.deliveryFee ? formatINR(form.deliveryFee) : 'Free'}</span>
        </div>
        <div className="flex items-center justify-between pt-2 mt-2 border-t border-blue-100">
          <span className="text-sm font-semibold text-gray-900">Payable at pickup</span>
          <span className="text-xl font-bold text-blue-700">{formatINR(estimatedTotal)}</span>
        </div>
        <div className="flex items-center justify-between text-sm text-gray-500 pt-1">
          <span>+ refundable deposit</span>
          <span>{formatINR(deposit)}</span>
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-3">
        Late returns are charged hourly at {formatINR(hourlyRate)}/hr beyond the booked return time. No payment is taken now — our team will call to verify your booking.
      </p>
    </div>
  )
}

function Confirmation({ car, form, totalHours, estimatedTotal, onClose }) {
  return (
    <div className="flex flex-col items-center text-center px-8 py-14">
      <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-5">
        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">Booking request sent</h3>
      <p className="text-sm text-gray-500 max-w-xs mb-6">
        We've received your request for the <span className="font-semibold text-gray-700">{car.category}</span>.
        Our team will call {form.phone} shortly to confirm your {totalHours}-hour booking.
      </p>
      <div className="w-full rounded-2xl bg-gray-50 px-4 py-3 mb-6 flex items-center justify-between">
        <span className="text-sm text-gray-500">Payable at pickup</span>
        <span className="text-lg font-bold text-gray-900">{formatINR(estimatedTotal)}</span>
      </div>
      <button onClick={onClose} className="w-full bg-blue-600 text-white py-3.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20">
        Done
      </button>
    </div>
  )
}