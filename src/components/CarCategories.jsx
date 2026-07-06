import { Car, Truck, Zap, Crown, ArrowRight } from 'lucide-react'

const categories = [
  {
    name: 'Sedan',
    description: 'Comfortable & efficient rides for daily commutes',
    icon: Car,
    count: 45,
    color: 'from-blue-500 to-blue-600',
    bg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    name: 'SUV',
    description: 'Spacious vehicles for family adventures',
    icon: Truck,
    count: 32,
    color: 'from-emerald-500 to-emerald-600',
    bg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  {
    name: 'Electric',
    description: 'Eco-friendly drives with zero emissions',
    icon: Zap,
    count: 28,
    color: 'from-purple-500 to-purple-600',
    bg: 'bg-purple-50',
    iconColor: 'text-purple-600',
  },
  {
    name: 'Luxury',
    description: 'Premium vehicles for special occasions',
    icon: Crown,
    count: 18,
    color: 'from-amber-500 to-amber-600',
    bg: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
]

export default function CarCategories() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-blue-600 text-sm font-semibold tracking-wide uppercase">Browse by Category</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-3 mb-4">
            Find Your Perfect Ride
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            From compact city cars to luxury vehicles, we have the right car for every occasion and budget.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => {
            const Icon = cat.icon
            return (
              <div
                key={cat.name}
                className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 cursor-pointer"
              >
                <div className={`w-14 h-14 ${cat.bg} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-7 h-7 ${cat.iconColor}`} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{cat.name}</h3>
                <p className="text-sm text-gray-500 mb-4 leading-relaxed">{cat.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-400">{cat.count} vehicles</span>
                  <div className="w-8 h-8 rounded-full bg-gray-50 group-hover:bg-blue-600 flex items-center justify-center transition-all">
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
