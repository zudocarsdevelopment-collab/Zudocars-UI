import { useState, useMemo } from 'react'
import { Star, Users, Fuel, Settings2, SlidersHorizontal, X, Search, ChevronDown } from 'lucide-react'

const formatINR = (num) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num)

const cars = [
  {
    name: 'Tesla Model 3',
    brand: 'Tesla',
    category: 'Electric',
    price: 89,
    seats: 5,
    fuel: 'Electric',
    transmission: 'Automatic',
    rating: 4.9,
    reviews: 124,
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=600&h=400&fit=crop',
    badge: 'Popular',
    badgeColor: 'bg-blue-600',
  },
  {
    name: 'Tesla Model Y',
    brand: 'Tesla',
    category: 'Electric',
    price: 99,
    seats: 5,
    fuel: 'Electric',
    transmission: 'Automatic',
    rating: 4.8,
    reviews: 76,
    image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=600&h=400&fit=crop',
    badge: 'New',
    badgeColor: 'bg-blue-600',
  },
  {
    name: 'BMW X5',
    brand: 'BMW',
    category: 'SUV',
    price: 129,
    seats: 5,
    fuel: 'Diesel',
    transmission: 'Automatic',
    rating: 4.8,
    reviews: 98,
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&h=400&fit=crop',
    badge: 'Premium',
    badgeColor: 'bg-amber-500',
  },
  {
    name: 'BMW 3 Series',
    brand: 'BMW',
    category: 'Sedan',
    price: 99,
    seats: 5,
    fuel: 'Petrol',
    transmission: 'Automatic',
    rating: 4.6,
    reviews: 64,
    image: 'https://images.unsplash.com/photo-1523983388277-336a66bf9bcd?w=600&h=400&fit=crop',
    badge: 'Popular',
    badgeColor: 'bg-blue-600',
  },
  {
    name: 'Mercedes-Benz C-Class',
    brand: 'Mercedes',
    category: 'Luxury',
    price: 149,
    seats: 5,
    fuel: 'Petrol',
    transmission: 'Automatic',
    rating: 4.9,
    reviews: 156,
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&h=400&fit=crop',
    badge: 'Top Rated',
    badgeColor: 'bg-emerald-500',
  },
  {
    name: 'Mercedes-Benz GLE',
    brand: 'Mercedes',
    category: 'SUV',
    price: 169,
    seats: 5,
    fuel: 'Diesel',
    transmission: 'Automatic',
    rating: 4.8,
    reviews: 71,
    image: 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=600&h=400&fit=crop',
    badge: 'Luxury',
    badgeColor: 'bg-gray-900',
  },
  {
    name: 'Toyota Camry',
    brand: 'Toyota',
    category: 'Sedan',
    price: 59,
    seats: 5,
    fuel: 'Hybrid',
    transmission: 'Automatic',
    rating: 4.7,
    reviews: 203,
    image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=600&h=400&fit=crop',
    badge: 'Best Value',
    badgeColor: 'bg-purple-500',
  },
  {
    name: 'Toyota Innova Crysta',
    brand: 'Toyota',
    category: 'SUV',
    price: 69,
    seats: 7,
    fuel: 'Diesel',
    transmission: 'Manual',
    rating: 4.6,
    reviews: 189,
    image: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=600&h=400&fit=crop',
    badge: 'Family Pick',
    badgeColor: 'bg-purple-500',
  },
  {
    name: 'Ford Mustang',
    brand: 'Ford',
    category: 'Sports',
    price: 119,
    seats: 4,
    fuel: 'Petrol',
    transmission: 'Manual',
    rating: 4.8,
    reviews: 87,
    image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&h=400&fit=crop',
    badge: 'Sporty',
    badgeColor: 'bg-red-500',
  },
  {
    name: 'Range Rover',
    brand: 'Land Rover',
    category: 'SUV',
    price: 179,
    seats: 5,
    fuel: 'Diesel',
    transmission: 'Automatic',
    rating: 4.9,
    reviews: 112,
    image: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=600&h=400&fit=crop',
    badge: 'Luxury',
    badgeColor: 'bg-gray-900',
  },
  {
    name: 'Hyundai Creta',
    brand: 'Hyundai',
    category: 'SUV',
    price: 45,
    seats: 5,
    fuel: 'Petrol',
    transmission: 'Automatic',
    rating: 4.5,
    reviews: 231,
    image: 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=600&h=400&fit=crop',
    badge: 'Best Value',
    badgeColor: 'bg-purple-500',
  },
  {
    name: 'Honda City',
    brand: 'Honda',
    category: 'Sedan',
    price: 42,
    seats: 5,
    fuel: 'Petrol',
    transmission: 'Manual',
    rating: 4.6,
    reviews: 178,
    image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=600&h=400&fit=crop',
    badge: 'Popular',
    badgeColor: 'bg-blue-600',
  },
]

const brands = [...new Set(cars.map((c) => c.brand))].sort()
const categories = [...new Set(cars.map((c) => c.category))].sort()
const MIN_PRICE = Math.min(...cars.map((c) => c.price))
const MAX_PRICE = Math.max(...cars.map((c) => c.price))

const sortOptions = [
  { label: 'Recommended', value: 'recommended' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Rating: High to Low', value: 'rating-desc' },
]

function FilterSidebar({ selectedBrands, toggleBrand, selectedCategories, toggleCategory, priceRange, setPriceRange, clearAll, activeCount }) {
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

      {/* Price filter */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-4">Price per day</h4>
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <span className="font-medium text-gray-900">{formatINR(priceRange[0])}</span>
          <span className="font-medium text-gray-900">{formatINR(priceRange[1])}</span>
        </div>
        <div className="space-y-3">
          <input
            type="range"
            min={MIN_PRICE}
            max={MAX_PRICE}
            value={priceRange[1]}
            onChange={(e) => {
              const val = Number(e.target.value)
              setPriceRange([Math.min(priceRange[0], val), val])
            }}
            className="w-full accent-blue-600 cursor-pointer"
          />
          <input
            type="range"
            min={MIN_PRICE}
            max={MAX_PRICE}
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

      {/* Brand filter */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-4">Brand</h4>
        <div className="space-y-3">
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
                {cars.filter((c) => c.brand === brand).length}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Category filter */}
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
          className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <span className={`absolute top-4 left-4 ${car.badgeColor} text-white text-xs font-semibold px-3 py-1 rounded-full`}>
          {car.badge}
        </span>
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{car.name}</h3>
            <p className="text-sm text-gray-400">{car.category}</p>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-semibold text-gray-900">{car.rating}</span>
            <span className="text-xs text-gray-400">({car.reviews})</span>
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
            <span className="text-2xl font-bold text-gray-900">{formatINR(car.price)}</span>
            <span className="text-sm text-gray-400">/day</span>
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
  const [selectedBrands, setSelectedBrands] = useState([])
  const [selectedCategories, setSelectedCategories] = useState([])
  const [priceRange, setPriceRange] = useState([MIN_PRICE, MAX_PRICE])
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('recommended')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const toggleBrand = (brand) =>
    setSelectedBrands((prev) => (prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]))

  const toggleCategory = (cat) =>
    setSelectedCategories((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]))

  const clearAll = () => {
    setSelectedBrands([])
    setSelectedCategories([])
    setPriceRange([MIN_PRICE, MAX_PRICE])
    setSearch('')
  }

  const activeCount = selectedBrands.length + selectedCategories.length + (priceRange[0] !== MIN_PRICE || priceRange[1] !== MAX_PRICE ? 1 : 0)

  const filteredCars = useMemo(() => {
    let result = cars.filter((car) => {
      const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(car.brand)
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(car.category)
      const matchesPrice = car.price >= priceRange[0] && car.price <= priceRange[1]
      const matchesSearch = car.name.toLowerCase().includes(search.toLowerCase()) || car.brand.toLowerCase().includes(search.toLowerCase())
      return matchesBrand && matchesCategory && matchesPrice && matchesSearch
    })

    switch (sort) {
      case 'price-asc':
        result = [...result].sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        result = [...result].sort((a, b) => b.price - a.price)
        break
      case 'rating-desc':
        result = [...result].sort((a, b) => b.rating - a.rating)
        break
      default:
        break
    }
    return result
  }, [selectedBrands, selectedCategories, priceRange, search, sort])

  return (
    <div className="min-h-screen bg-gray-50 pt-24 lg:pt-28">
      {/* Page header */}
      <div id="cars" className="scroll-mt-28 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-3 mb-3">Browse All Cars</h1>
          <p className="text-gray-500 max-w-xl">
            Filter by brand, vehicle type, and price to find the perfect ride for your trip.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-10">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-8 bg-white rounded-2xl border border-gray-100 p-6">
              <FilterSidebar
                selectedBrands={selectedBrands}
                toggleBrand={toggleBrand}
                selectedCategories={selectedCategories}
                toggleCategory={toggleCategory}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                clearAll={clearAll}
                activeCount={activeCount}
              />
            </div>
          </aside>

          {/* Main content */}
          <div>
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by car name or brand..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
              </div>

              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:border-blue-300 hover:text-blue-600 transition-colors"
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

            {/* Active filter chips */}
            {activeCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                {selectedBrands.map((b) => (
                  <span key={b} className="flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-semibold pl-3 pr-2 py-1.5 rounded-full">
                    {b}
                    <button onClick={() => toggleBrand(b)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {selectedCategories.map((c) => (
                  <span key={c} className="flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-semibold pl-3 pr-2 py-1.5 rounded-full">
                    {c}
                    <button onClick={() => toggleCategory(c)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {(priceRange[0] !== MIN_PRICE || priceRange[1] !== MAX_PRICE) && (
                  <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-semibold pl-3 pr-2 py-1.5 rounded-full">
                    {formatINR(priceRange[0])} - {formatINR(priceRange[1])}
                    <button onClick={() => setPriceRange([MIN_PRICE, MAX_PRICE])}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}

            <p className="text-sm text-gray-500 mb-5">
              Showing <span className="font-semibold text-gray-900">{filteredCars.length}</span> of {cars.length} cars
            </p>

            {/* Results grid */}
            {filteredCars.length > 0 ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCars.map((car) => (
                  <CarCard key={car.name} car={car} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                <p className="text-gray-900 font-semibold mb-1">No cars match your filters</p>
                <p className="text-sm text-gray-500 mb-5">Try widening your price range or clearing a filter.</p>
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
      </div>

      {/* Mobile filter drawer */}
      {mobileFiltersOpen && (
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
              selectedBrands={selectedBrands}
              toggleBrand={toggleBrand}
              selectedCategories={selectedCategories}
              toggleCategory={toggleCategory}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              clearAll={clearAll}
              activeCount={activeCount}
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