import { MapPin, Calendar, Clock, Search } from 'lucide-react'

export default function Hero() {
  return (
    <section id="home" className="relative min-h-screen flex items-center bg-[#0b0f19] overflow-hidden pt-24 pb-12 lg:py-0">
      
      {/* --- TRENDING MOVING CAR BACKGROUND LAYER --- */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none overflow-hidden">
        {/* Deep Ambient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b0f19] via-[#0b0f19]/80 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19] via-transparent to-transparent z-10" />
        
        {/* Moving Parallax Highway Lines */}
        <div className="absolute bottom-0 left-0 w-[200%] h-[35vh] opacity-15 z-0 flex flex-col justify-between py-12 animate-road">
          <div className="w-full border-t-2 border-dashed border-blue-500/40" />
          <div className="w-full border-t-[3px] border-dashed border-gray-600/30" />
          <div className="w-full border-t-2 border-dashed border-blue-400/40" />
        </div>

        {/* Ambient Glow Orbs */}
        <div className="absolute top-1/4 right-[-10%] w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 left-[20%] w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px]" />

        {/* High-End Cutout Moving Car Asset */}
        <div className="absolute right-[-5%] bottom-[4%] lg:bottom-[8%] w-[65%] max-w-[850px] hidden md:block z-0 animate-car">
          <img 
            src="https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80" 
            alt="Premium Fleet Car" 
            className="w-full h-auto object-contain mix-blend-lighten drop-shadow-[0_25px_50px_rgba(37,99,235,0.25)] filter contrast-125 brightness-90"
          />
          {/* Neon Underglow Effect under the moving image */}
          <div className="absolute bottom-12 left-1/4 w-1/2 h-6 bg-blue-500/40 rounded-full blur-2xl" />
        </div>
      </div>

      {/* --- CONTENT INTERFACE CONTAINER --- */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Typography Panel */}
          <div className="lg:col-span-7 text-left">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600/10 to-cyan-600/10 border border-blue-500/20 backdrop-blur-md rounded-full px-4 py-1.5 mb-6">
              
              <span className="text-blue-400 text-xs sm:text-sm font-medium tracking-wide uppercase">Best Car Rental Service In Kerala</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.1] mb-6 tracking-tight">
              Drive Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-200 to-cyan-400">
                Dream Car
              </span> <br />
              With Absolute Freedom
            </h1>

            <p className="text-gray-400 text-base sm:text-lg mb-8 max-w-xl leading-relaxed">
              Experience the unmatched luxury of the open road with our handpicked tier-one fleet. 
              From raw supercar performance to sophisticated, spacious premium SUVs.
            </p>

            <div className="flex flex-wrap gap-4 mb-12">
              <a
                href="#booking"
                className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2 group"
              >
                <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Explore Fleet
              </a>
              <a
                href="#about"
                className="bg-gray-800/40 border border-gray-700/60 backdrop-blur-sm text-gray-300 px-8 py-4 rounded-xl font-semibold hover:border-gray-500 hover:text-white transition-all"
              >
                Learn More
              </a>
            </div>

            {/* Micro Stats Counter */}
            <div className="grid grid-cols-3 gap-4 sm:gap-8 pt-8 border-t border-gray-800/60 max-w-md">
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-white">200+</p>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-0.5">Vehicles</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-white">50K+</p>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-0.5">Riders</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-white">4.9★</p>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-0.5">Rating</p>
              </div>
            </div>
          </div>

          {/* Booking Interaction Glassmorphism Form Widget */}
          <div className="lg:col-span-5 w-full">
            <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/50">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white tracking-tight">Book Your Ride</h2>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">Instant premium confirmation in seconds</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Pick-up Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                    <input
                      type="text"
                      placeholder="Enter city or airport station"
                      className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700/60 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Pick-up Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                      <input
                        type="date"
                        className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700/60 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all color-scheme-dark"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Return Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                      <input
                        type="date"
                        className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700/60 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all color-scheme-dark"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Pick-up Time</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                    <select className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700/60 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none">
                      <option className="bg-gray-900">09:00 AM</option>
                      <option className="bg-gray-900">11:00 AM</option>
                      <option className="bg-gray-900">01:00 PM</option>
                      <option className="bg-gray-900">04:00 PM</option>
                    </select>
                  </div>
                </div>

                <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 mt-4 text-sm tracking-wide uppercase">
                  <Search className="w-4 h-4" />
                  Search Premium Cars
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}