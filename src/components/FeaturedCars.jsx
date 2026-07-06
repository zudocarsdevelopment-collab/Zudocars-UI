import { Star, Users, Fuel, Settings2 } from 'lucide-react'

const formatINR = (num) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);

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
]

export default function FeaturedCars() {
  return (
    <section id="fleet" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-14">
          <div>
            <span className="text-blue-600 text-sm font-semibold tracking-wide uppercase">Our Fleet</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-3 mb-4">
              Featured Vehicles
            </h2>
            <p className="text-gray-500 max-w-lg">
              Handpicked vehicles that combine comfort, performance, and style for an unmatched driving experience.
            </p>
          </div>
          <a
            href="#"
            className="mt-4 sm:mt-0 text-blue-600 font-semibold text-sm hover:text-blue-700 flex items-center gap-1 transition-colors"
          >
            View All Cars
            <span className="text-lg">→</span>
          </a>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cars.map((car) => (
            <div
              key={car.name}
              className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300"
            >
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
          ))}
        </div>
      </div>
    </section>
  )
}
