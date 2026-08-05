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
} from 'lucide-react'

const API_URL = 'http://52.90.158.246:8000/api/vehicles/'
const AVAILABLE_API_URL = 'http://52.90.158.246:8000/api/vehicles/available/'
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1494905998402-395d579af36f?w=600&h=400&fit=crop'

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

// Generate 24-hour time slots in 30-minute intervals
const TIME_SLOTS = Array.from({ length: 48 }).map((_, i) => {
  const hours = Math.floor(i / 2).toString().padStart(2, '0')
  const minutes = i % 2 === 0 ? '00' : '30'
  return `${hours}:${minutes}`
})

const formatINR = (num) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num)

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
    availableStock: raw.available_stock,
    transmission: raw.transmission
      ? raw.transmission.charAt(0) + raw.transmission.slice(1).toLowerCase()
      : '—',
    year: raw.year || 2026,
    image: raw.image || raw.vehicle_image || raw.photo_url || FALLBACK_IMAGE,
  }
}

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

function CarCard({ car }) {
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
          <button className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20">
            Book Now
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CarsPage() {
  const todayStr = new Date().toISOString().split('T')[0]

  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isSearched, setIsSearched] = useState(false)

  const [searchParams, setSearchParams] = useState({
    date_from: todayStr,
    time_from: '00:00',
    date_to: todayStr,
    time_to: '02:30',
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

  const handleAvailabilitySearch = async (e) => {
    if (e) e.preventDefault()
    setSearchLoading(true)
    setError(null)

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
        throw new Error('Failed to fetch available vehicles.')
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
            Search vehicle availability by choosing your pickup/dropoff locations and schedule.
          </p>

          {/* Clean, UI/UX-optimized Search Availability Form */}
          <form
            onSubmit={handleAvailabilitySearch}
            className="bg-gray-50 border border-gray-200 rounded-2xl p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 shadow-sm"
          >
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
                <option value="suv">SUV</option>
                <option value="sedan">Sedan</option>
                <option value="hatchback">Hatchback</option>
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
                {searchLoading ? 'Searching…' : 'Search Cars'}
              </button>
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
                    <CarCard key={car.id} car={car} />
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
    </div>
  )
}