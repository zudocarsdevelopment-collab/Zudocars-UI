import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, Users, Fuel, Settings2 } from 'lucide-react'

const AVAILABILITY_URL = 'https://api.zudocars.com/api/vehicles/'

const formatINR = (num) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num)

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1494905998402-395d579af36f?w=600&h=400&fit=crop'

function getBadge(car) {
  const fuel = (car.fuel_type || '').toLowerCase()
  if (fuel === 'electric') return { label: 'Electric', color: 'bg-blue-600' }
  if (fuel === 'hybrid') return { label: 'Hybrid', color: 'bg-purple-500' }
  if ((car.body_type || '').toLowerCase() === 'suv') return { label: 'SUV', color: 'bg-gray-900' }
  return { label: 'Available', color: 'bg-emerald-500' }
}

export default function FleetPage() {
  const navigate = useNavigate()
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCars = async () => {
      setLoading(true)
      setError(null)

      try {
        const res = await fetch(AVAILABILITY_URL)
        if (!res.ok) throw new Error(`Request failed: ${res.status}`)
        const data = await res.json()
        setCars(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCars()
  }, [])

  return (
    <section id="fleet" className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="mb-10">
          <span className="text-blue-600 text-sm font-semibold tracking-wide uppercase">Our fleet</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-3 mb-2">
            Available for your dates
          </h2>
        </div>

        {loading && <div className="text-center text-gray-400 py-16">Checking availability…</div>}

        {error && !loading && (
          <div className="text-center text-red-500 py-16">
            Couldn't load vehicles ({error}). Is the API running at {AVAILABILITY_URL}?
          </div>
        )}

        {!loading && !error && cars.length === 0 && (
          <div className="text-center text-gray-400 py-16">
            No vehicles free for this window — try a different date or duration.
          </div>
        )}

        {!loading && !error && cars.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cars.map((car) => {
              const badge = getBadge(car)
              const image = car.vehicle_image || car.photo_url || FALLBACK_IMAGE
              const priceValue = Number(car.hourly_rate) || 0

              return (
                <div
                  key={car.id}
                  className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={image}
                      alt={car.category}
                      onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE }}
                      className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className={`absolute top-4 left-4 ${badge.color} text-white text-xs font-semibold px-3 py-1 rounded-full`}>
                      {badge.label}
                    </span>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{car.category}</h3>
                        <p className="text-sm text-gray-400">{car.plate_number}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-semibold text-gray-900">{car.year}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-5">
                      <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{car.seats} Seats</div>
                      <div className="flex items-center gap-1.5"><Fuel className="w-3.5 h-3.5" />{car.fuel_type}</div>
                      <div className="flex items-center gap-1.5"><Settings2 className="w-3.5 h-3.5" />{car.transmission}</div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div>
                        <span className="text-2xl font-bold text-gray-900">{formatINR(priceValue)}</span>
                        <span className="text-sm text-gray-400">/hr</span>
                      </div>
                      <button
                        onClick={() => navigate('/cars')}
                        className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

    </section>
  )
}