import { useState, useMemo, useEffect } from 'react'
import {
  Star,
  Users,
  Fuel,
  Settings2,
  SlidersHorizontal,
  X,
  Search,
  ChevronDown,
  Calendar,
  Clock,
  MapPin,
  ShieldAlert,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  AlertTriangle,
} from 'lucide-react'

const API_URL = 'https://api.zudocars.com/api/vehicles/'
const AVAILABLE_API_URL = 'https://api.zudocars.com/api/vehicles/available/'
const ESTIMATE_API_URL = 'https://api.zudocars.com/api/estimates/create/'
const PDF_API_URL = 'https://api.zudocars.com/api/estimates/pdf/'
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1494905998402-395d579af36f?w=600&h=400&fit=crop'

// TODO: these should come from whichever staff member/branch is actually
// handling the booking rather than being hardcoded. Wiring that up needs a
// source of truth for staff-on-duty (a login, a roster, etc.) that this
// frontend doesn't have access to yet - swap these out once that exists.
const STAFF_NAME = 'Ani'
const STAFF_PHONE = '+91 9387005555'
const STAFF_PHONE_DISPLAY = '93870 05555'

const LOCATIONS = [
  { id: 6, name: 'Edapally Lulu', type: 'pickup' },
  { id: 4, name: 'EKM Jn. Rly Stn', type: 'pickup' },
  { id: 5, name: 'EKM Town Rly Stn', type: 'pickup' },
  { id: 8, name: 'Fort Kochi', type: 'pickup' },
  { id: 1, name: 'JLN stadium', type: 'yard' },
  { id: 2, name: 'Kochi Airport', type: 'pickup' },
  { id: 3, name: 'KSRTC Ernakulam', type: 'pickup' },
  { id: 12, name: 'TVM Airport', type: 'pickup' },
]

// --- Delivery / reposition pricing config -----------------------------
// Doorstep delivery is currently disabled - self pickup only. Left here so
// it's a one-line flip (see BookingModal) if doorstep delivery comes back.

// Generate 24-hour time slots in 30-minute intervals
const TIME_SLOTS = Array.from({ length: 48 }).map((_, i) => {
  const hours = Math.floor(i / 2).toString().padStart(2, '0')
  const minutes = i % 2 === 0 ? '00' : '30'
  return `${hours}:${minutes}`
})

// Quick presets so customers don't have to think in hours - "how long do
// you need the car" is a friendlier question than picking two clocks.
const DURATION_PRESETS = [
  { label: '1 Day', days: 1 },
  { label: '2 Days', days: 2 },
  { label: '3 Days', days: 3 },
  { label: '1 Week', days: 7 },
]

const formatINR = (num) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
    Math.round(num || 0)
  )

function deriveBrand(category) {
  if (!category) return 'Other'
  return category.trim().split(' ')[0]
}

function normalizeCar(raw) {
  return {
    id: raw.id,
    name: raw.name || raw.category || 'Unknown Vehicle',
    plate: raw.asset_identifier || raw.plate_number || '—',
    brand: deriveBrand(raw.name || raw.category),
    category: raw.vehicle_type || raw.body_type || 'Car',
    bodyType: raw.body_type || '',
    price: Number(raw.total_incl_tax || raw.hourly_rate || raw.price) || 0,
    deposit: raw.deposit || 0,
    seats: raw.seats || 5,
    fuel: raw.fuel_type || '—',
    kmLimit: raw.km_limit,
    // Rate charged per km once the included km allowance is exceeded. Field
    // name isn't confirmed from the vehicles API - falls back to 0 (shown as
    // "0" on the PDF) until the real field name is confirmed with backend.
    extraKmCharge: Number(raw.extra_km_charge ?? raw.extra_km_rate ?? raw.km_extra_charge ?? 0) || 0,
    availableStock: raw.available_stock,
    transmission: raw.transmission
      ? raw.transmission.charAt(0) + raw.transmission.slice(1).toLowerCase()
      : '—',
    year: raw.year || 2026,
    image: raw.image || raw.vehicle_image || raw.photo_url || FALLBACK_IMAGE,
  }
}

function addDaysToDate(dateStr, days) {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

// The API needs date_from/time_from to sit at least `pre_start_cooldown_hours`
// (currently 0.15h ≈ 9 min) in the future - anything earlier, including "now",
// gets rejected with a 422. We pad that to 30 min and round up to the nearest
// slot so the default the page opens with is always bookable, and so we can
// warn the customer before they hit a submit that's guaranteed to fail.
const MIN_LEAD_MINUTES = 30

function getSafeDefaultStart() {
  const d = new Date(Date.now() + MIN_LEAD_MINUTES * 60 * 1000)
  const roundedMinutes = Math.ceil(d.getMinutes() / 30) * 30
  d.setMinutes(0, 0, 0)
  d.setMinutes(roundedMinutes)
  const date = d.toISOString().split('T')[0]
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes() % 60).padStart(2, '0')}`
  return { date, time }
}

function isStartTimeBookable(dateStr, timeStr) {
  const selected = new Date(`${dateStr}T${timeStr}:00`)
  const earliestAllowed = new Date(Date.now() + MIN_LEAD_MINUTES * 60 * 1000)
  return selected.getTime() >= earliestAllowed.getTime()
}

async function extractApiError(res, fallback) {
  try {
    const data = await res.json()
    return data.error || data.msg || fallback
  } catch {
    return fallback
  }
}

// Ops WhatsApp number that should get pinged with every new booking enquiry.
const BOOKING_ENQUIRY_WHATSAPP_NUMBER = '918589900964'

function locationName(id) {
  return LOCATIONS.find((l) => l.id === id)?.name || `Location #${id}`
}

function buildBookingEnquiryMessage({ car, searchParams, customerName, customerPhone, estimate, pdfUrl }) {
  const lines = [
    '🚗 New booking enquiry',
    '',
    `Vehicle: ${car.name} (${car.plate})`,
    `Trip: ${searchParams.date_from} ${searchParams.time_from} → ${searchParams.date_to} ${searchParams.time_to}`,
    `Pickup location: ${locationName(searchParams.pickup_location_id)}`,
    `Dropoff location: ${locationName(searchParams.dropoff_location_id)}`,
    '',
    `Customer: ${customerName}`,
    `Phone: +91 ${customerPhone}`,
  ]
  if (estimate?.estimate_id) {
    lines.push('', `Estimate ID: ${estimate.estimate_id}`)
  }
  // Prefer the Zudo-branded PDF; fall back to the raw therentos link if PDF
  // generation failed or hasn't come back yet.
  const linkToShow = pdfUrl || estimate?.public_url
  if (linkToShow) lines.push(`Estimate PDF: ${linkToShow}`)
  return lines.join('\n')
}

function buildWhatsappLink(message) {
  return `https://wa.me/${BOOKING_ENQUIRY_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

// Generates the Zudo-branded PDF for a just-created estimate. Best-effort:
// if this fails, the booking itself already succeeded, so callers should
// fall back to the raw therentos public_url instead of blocking on this.
async function generateEstimatePdf({ car, searchParams, customerName, customerPhone, estimateResponse }) {
  const payload = {
    customer_name: customerName,
    customer_phone: customerPhone,
    customer_country_code: '91',
    vehicle_name: car.name,
    transmission: car.transmission,
    fuel_type: car.fuel,
    pickup_location_name: locationName(searchParams.pickup_location_id),
    dropoff_location_name: locationName(searchParams.dropoff_location_id),
    date_from: searchParams.date_from,
    time_from: searchParams.time_from,
    date_to: searchParams.date_to,
    time_to: searchParams.time_to,
    extra_km_charge: car.extraKmCharge || 0,
    staff_name: STAFF_NAME,
    staff_phone: STAFF_PHONE,
    staff_phone_display: STAFF_PHONE_DISPLAY,
    therentos_response: estimateResponse,
  }

  const res = await fetch(PDF_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(await extractApiError(res, `PDF generation failed (${res.status})`))
  const data = await res.json()
  if (data.success === false || !data.pdf_url) throw new Error(data.error || 'PDF generation did not return a URL.')
  return data.pdf_url
}

// ------------------------------------------------------------------
// Doorstep delivery / distance-based fees are disabled for now - self
// pickup only. The estimateDistanceKm stub and related pricing logic were
// removed; see git history if doorstep delivery needs to come back.
// ------------------------------------------------------------------

function FilterSidebar({
  brands,
  categories,
  minPrice,
  maxPrice,
  selectedBrands,
  toggleBrand,
  selectedCategories,
  toggleCategory,
  priceRange,
  setPriceRange,
  clearAll,
  activeCount,
  carsForCount,
}) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Filters</h3>
        {activeCount > 0 && (
          <button
            onClick={clearAll}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            Clear all ({activeCount})
          </button>
        )}
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-4">Price per hour</h4>
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <span className="font-medium text-gray-900">{formatINR(priceRange[0])}</span>
          <span className="font-medium text-gray-900">{formatINR(priceRange[1])}</span>
        </div>
        <div className="space-y-3">
          <input
            type="range"
            min={minPrice}
            max={maxPrice}
            value={priceRange[1]}
            onChange={(e) => {
              const val = Number(e.target.value)
              setPriceRange([Math.min(priceRange[0], val), val])
            }}
            className="w-full accent-blue-600 cursor-pointer"
          />
          <input
            type="range"
            min={minPrice}
            max={maxPrice}
            value={priceRange[0]}
            onChange={(e) => {
              const val = Number(e.target.value)
              setPriceRange([val, Math.max(priceRange[1], val)])
            }}
            className="w-full accent-blue-600 cursor-pointer"
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">Drag either handle to set your range</p>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-4">Model</h4>
        <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
          {brands.map((brand) => (
            <label key={brand} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedBrands.includes(brand)}
                onChange={() => toggleBrand(brand)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{brand}</span>
              <span className="ml-auto text-xs text-gray-400">
                {carsForCount.filter((c) => c.brand === brand).length}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-4">Vehicle type</h4>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const active = selectedCategories.includes(cat)
            return (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  active
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600'
                }`}
              >
                {cat}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function CarCard({ car, onBook }) {
  return (
    <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300">
      <div className="relative overflow-hidden">
        <img
          src={car.image}
          alt={car.name}
          onError={(e) => {
            e.currentTarget.src = FALLBACK_IMAGE
          }}
          className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <span className="absolute top-4 left-4 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
          {car.category}
        </span>
        {car.availableStock !== undefined && (
          <span className="absolute top-4 right-4 bg-gray-900/80 backdrop-blur-md text-white text-xs font-medium px-2.5 py-1 rounded-full">
            Stock: {car.availableStock}
          </span>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{car.name}</h3>
            <p className="text-sm text-gray-400">{car.plate}</p>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-semibold text-gray-900">{car.year}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-500 mb-5">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            {car.seats} Seats
          </div>
          <div className="flex items-center gap-1.5">
            <Fuel className="w-3.5 h-3.5" />
            {car.fuel}
          </div>
          <div className="flex items-center gap-1.5">
            <Settings2 className="w-3.5 h-3.5" />
            {car.transmission}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div>
            {car.deposit > 0 && (
              <div className="text-xs text-gray-400 mb-0.5">Deposit: {formatINR(car.deposit)}</div>
            )}
            <span className="text-2xl font-bold text-gray-900">{formatINR(car.price)}</span>
            <span className="text-sm text-gray-400"> /total</span>
          </div>
          <button
            onClick={() => onBook(car)}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================= Booking flow =============================
// Step 1: your details
// Step 2: terms + fare summary + confirm (self pickup only, no delivery fees)

function BookingModal({ car, searchParams, onClose }) {
  const [step, setStep] = useState(1) // 1: your details, 2: review & confirm

  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')

  const [agreeTerms, setAgreeTerms] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [enquiryWhatsappLink, setEnquiryWhatsappLink] = useState(null)
  const [estimateResult, setEstimateResult] = useState(null)
  const [pdfUrl, setPdfUrl] = useState(null)

  const pickupLocationName = locationName(searchParams.pickup_location_id)

  const ADVANCE_AMOUNT = 2000
  const BASE_TO_DELIVERY_FEE = 500
  const RETURN_TO_BASE_FEE = 500

  const baseFare = car.price
  const depositAmount = car.deposit || 0
  const totalPayable = baseFare + BASE_TO_DELIVERY_FEE + RETURN_TO_BASE_FEE
  const balanceDueOnPickup = Math.max(totalPayable - ADVANCE_AMOUNT, 0)

  const canGoToStep2 = customerName.trim().length > 1 && customerPhone.trim().length >= 10

  async function handleConfirm() {
    setSubmitError(null)

    if (!isStartTimeBookable(searchParams.date_from, searchParams.time_from)) {
      setSubmitError(
        `Your pickup time has passed while you were booking. Please go back and pick a time at least ${MIN_LEAD_MINUTES} minutes from now.`
      )
      return
    }

    setSubmitting(true)
    const payload = {
      send_whatsapp: 0,
      customer_name: customerName.trim(),
      customer_country_code: '91',
      customer_phone: customerPhone.trim(),
      estimate_priority: 'medium',
      booking_source: '',
      date_from: searchParams.date_from,
      time_from: searchParams.time_from,
      date_to: searchParams.date_to,
      time_to: searchParams.time_to,
      cooldown_hours: 0.15,
      pre_start_cooldown_hours: 0.15,
      vehicle_type: searchParams.vehicle_type,
      pickup_location_id: searchParams.pickup_location_id,
      dropoff_location_id: searchParams.dropoff_location_id,
      cart_vehicle: car.id,
      cart_services: '[]',
      cart_km_packages: '[]',
      selected_pricing_label: car.kmLimit ? `Basic · ${car.kmLimit} km` : 'Basic',
      // "Base to delivery" / "Return to base" - fixed at ₹500 each for
      // every booking. (These also happen to sidestep the backend's
      // ZeroDivisionError that fires when this is sent as exactly 0 - see
      // earlier notes - but the ₹500 amount itself is the actual pricing
      // decision, not just a crash workaround.)
      reposition_to_pickup_incl: 500,
      reposition_return_incl: 500,
    }

    try {
      const res = await fetch(ESTIMATE_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(await extractApiError(res, `Booking failed (${res.status})`))
      const data = await res.json()
      if (data.success === false) throw new Error(data.error || 'Booking could not be created.')

      // Generate our own branded PDF. Best-effort: the booking already
      // succeeded, so a PDF failure shouldn't block the confirmation - we
      // just fall back to the therentos link in that case.
      let generatedPdfUrl = null
      try {
        generatedPdfUrl = await generateEstimatePdf({
          car,
          searchParams,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          estimateResponse: data,
        })
        setPdfUrl(generatedPdfUrl)
      } catch (pdfErr) {
        console.error('PDF generation failed, falling back to therentos link:', pdfErr)
      }

      const message = buildBookingEnquiryMessage({
        car,
        searchParams,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        estimate: data,
        pdfUrl: generatedPdfUrl,
      })
      const waLink = buildWhatsappLink(message)
      setEnquiryWhatsappLink(waLink)
      setEstimateResult(data)
      // Best-effort auto-open so the ops team is notified immediately; if the
      // browser blocks the popup (common on some mobile browsers), the
      // "Notify our team" button on the confirmation screen is the fallback.
      window.open(waLink, '_blank', 'noopener,noreferrer')

      setSubmitSuccess(true)
    } catch (err) {
      setSubmitError(err.message || 'Something went wrong while creating your booking.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-gray-900/50" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-4xl sm:rounded-2xl rounded-t-2xl max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
              Step {step} of 2
            </p>
            <h2 className="text-lg font-bold text-gray-900">
              {step === 1 && 'Your details'}
              {step === 2 && 'Review & confirm'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {submitSuccess ? (
          <div className="p-10 text-center">
            <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Booking request sent</h3>
            <p className="text-gray-500 mb-6">
              We've received your request for the {car.name}. Our team will confirm your booking on WhatsApp / call
              shortly. Pay the {formatINR(ADVANCE_AMOUNT)} advance to lock it in.
            </p>
            {enquiryWhatsappLink && (
              <a
                href={enquiryWhatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors mb-3"
              >
                Notify our team on WhatsApp
              </a>
            )}
            <br />
            <button
              onClick={onClose}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Done
            </button>
            {estimateResult && (
              <div className="flex items-center justify-center gap-4 mt-5 text-xs">
                {pdfUrl ? (
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Download PDF
                  </a>
                ) : (
                  estimateResult.public_url && (
                    <a
                      href={estimateResult.public_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View estimate
                    </a>
                  )
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-[1fr_1.1fr] gap-0">
            {/* Left: vehicle */}
            <div className="p-6 border-b md:border-b-0 md:border-r border-gray-100">
              <img
                src={car.image}
                alt={car.name}
                onError={(e) => (e.currentTarget.src = FALLBACK_IMAGE)}
                className="w-full h-44 object-cover rounded-xl mb-4"
              />
              <h3 className="text-lg font-bold text-gray-900">{car.name}</h3>
              <p className="text-sm text-gray-400 mb-3">{car.plate}</p>
              <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> {car.seats} Seats
                </div>
                <div className="flex items-center gap-1.5">
                  <Fuel className="w-3.5 h-3.5" /> {car.fuel}
                </div>
                <div className="flex items-center gap-1.5">
                  <Settings2 className="w-3.5 h-3.5" /> {car.transmission}
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500 space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-gray-700">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" /> Trip
                </div>
                <p>
                  {searchParams.date_from} · {searchParams.time_from} → {searchParams.date_to} ·{' '}
                  {searchParams.time_to}
                </p>
                <p>Pickup branch: {pickupLocationName}</p>
                <p className="pt-1 text-gray-400">Self pickup only — collect at this branch, no delivery fee.</p>
              </div>
            </div>

            {/* Right: steps */}
            <div className="p-6">
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600">Full name</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Your name"
                      className="mt-1 w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600">Phone number</label>
                    <div className="mt-1 flex gap-2">
                      <span className="px-3 py-2.5 bg-gray-100 rounded-lg text-sm text-gray-500 font-medium">
                        +91
                      </span>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="10-digit mobile number"
                        maxLength={10}
                        className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">
                    We'll send booking confirmation and pickup/delivery details to this number.
                  </p>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2.5 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Rental fare</span>
                      <span className="font-medium text-gray-900">{formatINR(baseFare)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Base to delivery</span>
                      <span className="font-medium text-gray-900">{formatINR(BASE_TO_DELIVERY_FEE)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Return to base</span>
                      <span className="font-medium text-gray-900">{formatINR(RETURN_TO_BASE_FEE)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Refundable deposit</span>
                      <span className="font-medium text-gray-900">{formatINR(depositAmount)}</span>
                    </div>
                    <div className="pt-2.5 border-t border-gray-200 flex justify-between font-bold text-gray-900">
                      <span>Total payable</span>
                      <span>{formatINR(totalPayable)}</span>
                    </div>
                    <div className="flex justify-between text-blue-700 font-semibold">
                      <span>Advance to confirm now</span>
                      <span>{formatINR(ADVANCE_AMOUNT)}</span>
                    </div>
                    <div className="flex justify-between text-gray-400 text-xs">
                      <span>Balance on pickup</span>
                      <span>{formatINR(balanceDueOnPickup)}</span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 bg-amber-50 border border-amber-100 rounded-xl p-3.5 space-y-1.5">
                    <p className="font-semibold text-amber-700">Terms & conditions</p>
                    <p>Minimum booking duration is 1 day. Returning the car late may attract additional charges — our team will confirm the exact late-return policy for your booking.</p>
                    <p>The deposit shown above is refunded after the vehicle is returned in its original condition, subject to inspection.</p>
                  </div>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600"
                    />
                    <span className="text-sm text-gray-600">I agree to the terms & conditions above.</span>
                  </label>

                  {submitError && (
                    <p className="text-xs text-red-600 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" /> {submitError}
                    </p>
                  )}
                </div>
              )}

              {/* Nav buttons */}
              <div className="flex items-center justify-between mt-8 pt-5 border-t border-gray-100">
                <button
                  onClick={() => (step === 1 ? onClose() : setStep(step - 1))}
                  className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> {step === 1 ? 'Cancel' : 'Back'}
                </button>

                {step < 2 && (
                  <button
                    onClick={() => setStep(step + 1)}
                    disabled={!canGoToStep2}
                    className="flex items-center gap-1.5 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 transition-colors"
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                )}
                {step === 2 && (
                  <button
                    onClick={handleConfirm}
                    disabled={!agreeTerms || submitting}
                    className="flex items-center gap-1.5 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 transition-colors"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {submitting ? 'Booking…' : `Pay ${formatINR(ADVANCE_AMOUNT)} advance`}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function CarsPage() {
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isSearched, setIsSearched] = useState(false)
  const [bookingCar, setBookingCar] = useState(null)

  const safeDefaultStart = getSafeDefaultStart()
  const [searchParams, setSearchParams] = useState({
    date_from: safeDefaultStart.date,
    time_from: safeDefaultStart.time,
    date_to: addDaysToDate(safeDefaultStart.date, 1),
    time_to: safeDefaultStart.time,
    pickup_location_id: 6,
    dropoff_location_id: 6,
    vehicle_type: 'car',
  })

  const [selectedBrands, setSelectedBrands] = useState([])
  const [selectedCategories, setSelectedCategories] = useState([])
  const [priceRange, setPriceRange] = useState([0, 0])
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('recommended')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function fetchCars() {
      try {
        const res = await fetch(API_URL)
        if (!res.ok) throw new Error(`Request failed: ${res.status}`)
        const data = await res.json()
        if (!isMounted) return

        const normalized = data.map(normalizeCar)
        setCars(normalized)

        const prices = normalized.map((c) => c.price)
        const min = prices.length ? Math.min(...prices) : 0
        const max = prices.length ? Math.max(...prices) : 0
        setPriceRange([min, max])
      } catch (err) {
        if (isMounted) setError(err.message)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchCars()
    return () => {
      isMounted = false
    }
  }, [])

  const handleParamChange = (e) => {
    const { name, value } = e.target
    setSearchParams((prev) => ({
      ...prev,
      [name]: name.includes('location_id') ? Number(value) : value,
    }))
  }

  const applyDurationPreset = (days) => {
    setSearchParams((prev) => ({
      ...prev,
      date_to: addDaysToDate(prev.date_from, days),
      time_to: prev.time_from,
    }))
  }

  const handleAvailabilitySearch = async (e) => {
    if (e) e.preventDefault()
    setError(null)

    if (!isStartTimeBookable(searchParams.date_from, searchParams.time_from)) {
      setError(`Pickup time needs to be at least ${MIN_LEAD_MINUTES} minutes from now. Please choose a later time.`)
      return
    }

    setSearchLoading(true)

    const payload = {
      date_from: searchParams.date_from,
      time_from: searchParams.time_from,
      date_to: searchParams.date_to,
      time_to: searchParams.time_to,
      pickup_location_id: searchParams.pickup_location_id,
      dropoff_location_id: searchParams.dropoff_location_id,
      vehicle_type: searchParams.vehicle_type,
    }

    try {
      const response = await fetch(AVAILABLE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(await extractApiError(response, 'Failed to fetch available vehicles.'))
      }

      const data = await response.json()
      const rawVehicles = data.vehicles || (Array.isArray(data) ? data : [])
      const normalized = rawVehicles.map(normalizeCar)

      setCars(normalized)
      setIsSearched(true)

      const prices = normalized.map((c) => c.price)
      const min = prices.length ? Math.min(...prices) : 0
      const max = prices.length ? Math.max(...prices) : 0
      setPriceRange([min, max])
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.')
    } finally {
      setSearchLoading(false)
    }
  }

  const brands = useMemo(() => [...new Set(cars.map((c) => c.brand))].sort(), [cars])
  const categories = useMemo(() => [...new Set(cars.map((c) => c.category))].sort(), [cars])
  const minPrice = useMemo(() => (cars.length ? Math.min(...cars.map((c) => c.price)) : 0), [cars])
  const maxPrice = useMemo(() => (cars.length ? Math.max(...cars.map((c) => c.price)) : 0), [cars])

  const toggleBrand = (brand) =>
    setSelectedBrands((prev) => (prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]))

  const toggleCategory = (cat) =>
    setSelectedCategories((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]))

  const clearAll = () => {
    setSelectedBrands([])
    setSelectedCategories([])
    setPriceRange([minPrice, maxPrice])
    setSearch('')
  }

  const activeCount =
    selectedBrands.length +
    selectedCategories.length +
    (priceRange[0] !== minPrice || priceRange[1] !== maxPrice ? 1 : 0)

  const sortOptions = [
    { label: 'Recommended', value: 'recommended' },
    { label: 'Price: Low to High', value: 'price-asc' },
    { label: 'Price: High to Low', value: 'price-desc' },
  ]

  const filteredCars = useMemo(() => {
    let result = cars.filter((car) => {
      const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(car.brand)
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(car.category)
      const matchesPrice = car.price >= priceRange[0] && car.price <= priceRange[1]
      const matchesSearch =
        car.name.toLowerCase().includes(search.toLowerCase()) ||
        car.brand.toLowerCase().includes(search.toLowerCase()) ||
        car.plate.toLowerCase().includes(search.toLowerCase())
      return matchesBrand && matchesCategory && matchesPrice && matchesSearch
    })

    switch (sort) {
      case 'price-asc':
        result = [...result].sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        result = [...result].sort((a, b) => b.price - a.price)
        break
      default:
        break
    }
    return result
  }, [cars, selectedBrands, selectedCategories, priceRange, search, sort])

  return (
    <div className="min-h-screen bg-gray-50 pt-24 lg:pt-28 font-sans">
      <div id="cars" className="scroll-mt-28 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Browse All Cars</h1>
          <p className="text-gray-500 max-w-xl mb-6">
            Pick your dates, and we'll show you only the cars that are actually free for that window.
          </p>

          <form
            onSubmit={handleAvailabilitySearch}
            className="bg-gray-50 border border-gray-200 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm"
          >
            {/* Quick duration presets */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 mr-1">Quick pick:</span>
              {DURATION_PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => applyDurationPreset(p.days)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-300 bg-white text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Pickup & Dropoff Locations */}
              <div className="flex flex-col gap-1 md:col-span-2 lg:col-span-1">
                <label className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" /> Locations
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    name="pickup_location_id"
                    value={searchParams.pickup_location_id}
                    onChange={handleParamChange}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                  >
                    {LOCATIONS.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        P/U: {loc.name}
                      </option>
                    ))}
                  </select>
                  <select
                    name="dropoff_location_id"
                    value={searchParams.dropoff_location_id}
                    onChange={handleParamChange}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                  >
                    {LOCATIONS.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        D/O: {loc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pickup Date & Time Block */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" /> Start Date & Time
                </label>
                <div className="grid grid-cols-[1fr_90px] gap-2">
                  <input
                    type="date"
                    name="date_from"
                    value={searchParams.date_from}
                    onChange={handleParamChange}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all cursor-pointer"
                  />
                  <select
                    name="time_from"
                    value={searchParams.time_from}
                    onChange={handleParamChange}
                    className="w-full bg-white border border-gray-300 rounded-xl px-2 py-2 text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all cursor-pointer"
                  >
                    {TIME_SLOTS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dropoff Date & Time Block */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-600" /> End Date & Time
                </label>
                <div className="grid grid-cols-[1fr_90px] gap-2">
                  <input
                    type="date"
                    name="date_to"
                    value={searchParams.date_to}
                    onChange={handleParamChange}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all cursor-pointer"
                  />
                  <select
                    name="time_to"
                    value={searchParams.time_to}
                    onChange={handleParamChange}
                    className="w-full bg-white border border-gray-300 rounded-xl px-2 py-2 text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all cursor-pointer"
                  >
                    {TIME_SLOTS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Vehicle Type */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                  <Settings2 className="w-3.5 h-3.5 text-blue-600" /> Type
                </label>
                <select
                  name="vehicle_type"
                  value={searchParams.vehicle_type}
                  onChange={handleParamChange}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                >
                  <option value="car">Car</option>
                  
                </select>
              </div>

              {/* Submit Action */}
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={searchLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 disabled:opacity-50 text-xs sm:text-sm h-[38px]"
                >
                  <Search className="w-4 h-4" />
                  {searchLoading ? 'Searching…' : 'Show Available Cars'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {(loading || searchLoading) && (
          <div className="text-center text-gray-400 py-24">Loading vehicles…</div>
        )}

        {error && !loading && !searchLoading && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-6 text-center my-8 flex items-center justify-center gap-3">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span>Couldn't fetch vehicles ({error}). Please try again.</span>
          </div>
        )}

        {!loading && !searchLoading && !error && (
          <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-10">
            <aside className="hidden lg:block">
              <div className="sticky top-8 bg-white rounded-2xl border border-gray-100 p-6">
                <FilterSidebar
                  brands={brands}
                  categories={categories}
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  selectedBrands={selectedBrands}
                  toggleBrand={toggleBrand}
                  selectedCategories={selectedCategories}
                  toggleCategory={toggleCategory}
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                  clearAll={clearAll}
                  activeCount={activeCount}
                  carsForCount={cars}
                />
              </div>
            </aside>

            <div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by model, brand, or plate..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 bg-white"
                  />
                </div>

                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className="lg:hidden flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:border-blue-300 hover:text-blue-600 transition-colors bg-white"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                  {activeCount > 0 && (
                    <span className="bg-blue-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {activeCount}
                    </span>
                  )}
                </button>

                <div className="relative">
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="appearance-none pl-4 pr-9 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 cursor-pointer bg-white"
                  >
                    {sortOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {activeCount > 0 && (
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  {selectedBrands.map((b) => (
                    <span
                      key={b}
                      className="flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-semibold pl-3 pr-2 py-1.5 rounded-full"
                    >
                      {b}
                      <button onClick={() => toggleBrand(b)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {selectedCategories.map((c) => (
                    <span
                      key={c}
                      className="flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-semibold pl-3 pr-2 py-1.5 rounded-full"
                    >
                      {c}
                      <button onClick={() => toggleCategory(c)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {(priceRange[0] !== minPrice || priceRange[1] !== maxPrice) && (
                    <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-semibold pl-3 pr-2 py-1.5 rounded-full">
                      {formatINR(priceRange[0])} - {formatINR(priceRange[1])}
                      <button onClick={() => setPriceRange([minPrice, maxPrice])}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
              )}

              <p className="text-sm text-gray-500 mb-5">
                Showing <span className="font-semibold text-gray-900">{filteredCars.length}</span> of {cars.length} cars
                {isSearched && <span className="ml-1 text-blue-600 font-medium">(Search Results)</span>}
              </p>

              {filteredCars.length > 0 ? (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredCars.map((car) => (
                    <CarCard key={car.id} car={car} onBook={setBookingCar} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                  <p className="text-gray-900 font-semibold mb-1">No cars match your filters</p>
                  <p className="text-sm text-gray-500 mb-5">
                    Try widening your price range, choosing alternate dates/times, or clearing a filter.
                  </p>
                  <button
                    onClick={clearAll}
                    className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {mobileFiltersOpen && !loading && !error && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-gray-900/40" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Filters</h2>
              <button onClick={() => setMobileFiltersOpen(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <FilterSidebar
              brands={brands}
              categories={categories}
              minPrice={minPrice}
              maxPrice={maxPrice}
              selectedBrands={selectedBrands}
              toggleBrand={toggleBrand}
              selectedCategories={selectedCategories}
              toggleCategory={toggleCategory}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              clearAll={clearAll}
              activeCount={activeCount}
              carsForCount={cars}
            />
            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="w-full mt-8 bg-blue-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Show {filteredCars.length} cars
            </button>
          </div>
        </div>
      )}

      {bookingCar && (
        <BookingModal car={bookingCar} searchParams={searchParams} onClose={() => setBookingCar(null)} />
      )}
    </div>
  )
}