import { MapPin, Calendar, Clock, Search } from 'lucide-react'

export default function Hero() {
  return (
    <section id="home" className="relative min-h-screen flex items-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden pt-20">
      <div className="absolute inset-0">
        <div className="absolute top-20 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-6">
              
              <span className="text-blue-400 text-sm font-medium">Premium Car Rental Service</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Drive Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                Dream Car
              </span>
              Today
            </h1>
            <p className="text-gray-400 text-lg mb-8 max-w-lg leading-relaxed">
              Experience the freedom of the open road with our premium fleet of vehicles. 
              From luxury sedans to rugged SUVs — find the perfect ride for every journey.
            </p>

            <div className="flex flex-wrap gap-4">
              <a
                href="#fleet"
                className="bg-blue-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/25 flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Explore Fleet
              </a>
              <a
                href="#about"
                className="border border-gray-600 text-gray-300 px-8 py-3.5 rounded-xl font-semibold hover:border-gray-400 hover:text-white transition-all"
              >
                Learn More
              </a>
            </div>

            <div className="flex items-center gap-8 mt-10 pt-10 border-t border-gray-700/50">
              <div>
                <p className="text-2xl font-bold text-white">200+</p>
                <p className="text-sm text-gray-500">Premium Vehicles</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">50K+</p>
                <p className="text-sm text-gray-500">Happy Customers</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">4.9</p>
                <p className="text-sm text-gray-500">Customer Rating</p>
              </div>
            </div>
          </div>

          <div className="relative" id="booking">
            <div className="bg-white rounded-3xl p-8 shadow-2xl shadow-black/20">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Book Your Ride</h2>
              <p className="text-sm text-gray-500 mb-6">Fill in the details to get started</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Pick-up Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Enter city or airport"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Pick-up Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="date"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Return Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="date"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Pick-up Time</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none">
                      <option>09:00 AM</option>
                      <option>10:00 AM</option>
                      <option>11:00 AM</option>
                      <option>12:00 PM</option>
                      <option>01:00 PM</option>
                      <option>02:00 PM</option>
                      <option>03:00 PM</option>
                      <option>04:00 PM</option>
                      <option>05:00 PM</option>
                    </select>
                  </div>
                </div>

                <button className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 mt-2">
                  <Search className="w-4 h-4" />
                  Search Available Cars
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
