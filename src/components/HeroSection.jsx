import { MapPin, Calendar, Clock, Search, ArrowUpRight, Sparkles } from 'lucide-react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

// The road every car drives along — same curve used by the SVG light trail below,
// expressed as a CSS motion path so cars follow it automatically instead of being hand-positioned.
const ROAD_PATH = "path('M 1150 160 C 950 260, 820 300, 760 380 C 690 470, 560 500, 420 560 C 260 630, 120 660, -80 770')"

// Convoy of cars that continuously drives the light-trail road, looping forever.
// Staggered delays + varying base sizes make it read as a real convoy, not clones in lockstep.
const CONVOY = [
  { src: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80', baseWidth: 150, duration: 9, delay: 0 },
  { src: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=700&q=80', baseWidth: 170, duration: 9, delay: 1.8 },
  { src: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=800&q=80', baseWidth: 190, duration: 9, delay: 3.6 },
  { src: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=900&q=80', baseWidth: 210, duration: 9, delay: 5.4 },
  { src: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1100&q=85', baseWidth: 230, duration: 9, delay: 7.2 },
]

export default function Hero() {
  const containerRef = useRef(null)

  const { scrollY } = useScroll()
  const roadY = useTransform(scrollY, [0, 500], [0, 90])
  const textY = useTransform(scrollY, [0, 500], [0, -40])
  const wordmarkY = useTransform(scrollY, [0, 500], [0, 60])

  return (
    <section
      ref={containerRef}
      id="home"
      className="relative min-h-screen flex items-center bg-[#050710] overflow-hidden pt-28 pb-16 lg:py-0 select-none"
    >
      {/* ================= BACKGROUND ENVIRONMENT & DEPTH LAYERS ================= */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Ambient masking so the convoy fades into the frame */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#050710] via-[#050710]/70 to-[#050710]/20 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050710] via-transparent to-[#050710]/40 z-10" />

        {/* Cinematic aurora glows */}
        <div className="absolute top-[-10%] right-[0%] w-[650px] h-[650px] bg-blue-600/10 rounded-full blur-[170px]" />
        <div className="absolute bottom-[-15%] left-[5%] w-[550px] h-[550px] bg-cyan-500/10 rounded-full blur-[150px]" />

        {/* 1. MOVING ZUDO WORDMARK — infinite marquee, three copies for a seamless loop */}
        <motion.div
          style={{ y: wordmarkY }}
          className="absolute top-[6%] lg:top-[4%] left-0 w-full overflow-hidden z-0"
        >
          <motion.div
            className="flex whitespace-nowrap"
            animate={{ x: ['0%', '-33.333%'] }}
            transition={{ repeat: Infinity, ease: 'linear', duration: 26 }}
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="text-[24vw] font-black leading-none text-transparent bg-clip-text bg-gradient-to-b from-white/[0.06] to-transparent tracking-tighter uppercase font-sans px-10"
              >
                ZUDO
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* 2. LIGHT-TRAIL ROAD — animated flowing SVG path the convoy rides on */}
        <motion.div style={{ y: roadY }} className="absolute inset-0 z-10">
          <svg
            viewBox="0 0 1440 900"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full opacity-80"
          >
            <defs>
              <linearGradient id="trailGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
                <stop offset="45%" stopColor="#3b82f6" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M 1150 160 C 950 260, 820 300, 760 380 C 690 470, 560 500, 420 560 C 260 630, 120 660, -60 760"
              fill="none"
              stroke="url(#trailGrad)"
              strokeWidth="3"
              strokeLinecap="round"
              filter="drop-shadow(0 0 8px rgba(59,130,246,0.6))"
            />
            <motion.path
              d="M 1150 160 C 950 260, 820 300, 760 380 C 690 470, 560 500, 420 560 C 260 630, 120 660, -60 760"
              fill="none"
              stroke="#7dd3fc"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="18 340"
              animate={{ strokeDashoffset: [0, -358] }}
              transition={{ repeat: Infinity, ease: 'linear', duration: 2.6 }}
            />
          </svg>
        </motion.div>

        {/* 3. THE CONVOY — cutout cars that continuously drive the light-trail road, looping forever.
             Each car rides ROAD_PATH via CSS motion-path (offsetDistance 0%→100%), growing as it
             approaches camera (bottom-left) and fading in/out at the seam so the loop is invisible. */}
        <motion.div style={{ y: roadY }} className="absolute inset-0 z-20">
          {CONVOY.map((car, idx) => (
            <motion.div
              key={idx}
              className="absolute top-0 left-0"
              style={{
                offsetPath: ROAD_PATH,
                offsetRotate: '0deg',
                width: car.baseWidth,
              }}
              animate={{
                offsetDistance: ['0%', '100%'],
                scale: [0.55, 0.7, 0.95, 1.25, 1.55],
                opacity: [0, 1, 1, 1, 0],
              }}
              transition={{
                repeat: Infinity,
                ease: 'linear',
                duration: car.duration,
                delay: car.delay,
                times: [0, 0.08, 0.4, 0.75, 1],
              }}
            >
              <img
                src={car.src}
                alt="Zudo fleet vehicle"
                className="w-full h-auto object-contain mix-blend-lighten filter contrast-[1.15] brightness-95"
                style={{ filter: 'drop-shadow(0 25px 40px rgba(59,130,246,0.3))' }}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Sparkle accent, lower right — echoes the reference composition */}
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4], scale: [0.9, 1.1, 0.9] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          className="absolute bottom-[10%] right-[6%] z-20 hidden lg:block"
        >
          <Sparkles className="w-8 h-8 text-blue-300/70" strokeWidth={1.5} />
        </motion.div>
      </div>

      {/* ================= INTERFACE CONTENT LAYER ================= */}
      <div className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-12 gap-16 items-end">

          {/* Asymmetrical typography panel — anchored bottom-left like the reference */}
          <motion.div
            style={{ y: textY }}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 text-left mt-[38vw] sm:mt-[30vw] lg:mt-[24vw]"
          >
            {/* Tagline badge */}
            <div className="inline-flex items-center gap-3 bg-white/[0.03] border border-white/10 backdrop-blur-xl rounded-full pl-2 pr-5 py-1.5 mb-8 group cursor-pointer hover:border-blue-500/40 transition-all duration-300">
              <span className="bg-blue-600 text-white text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full shadow-md shadow-blue-600/20">
                Live
              </span>
              <span className="text-gray-400 text-xs font-semibold tracking-wide flex items-center gap-1 group-hover:text-white transition-colors">
                ZUDO BEST RENTAL CARS IN KERALA <ArrowUpRight className="w-3 h-3 text-gray-500 group-hover:text-blue-400 transition-colors" />
              </span>
            </div>

            {/* Bold headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[0.95] mb-8 tracking-tighter drop-shadow-[0_4px_30px_rgba(0,0,0,0.6)]">
              DRIVE THE <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-cyan-400">
                UNIMAGINABLE
              </span>
            </h1>

            <p className="text-gray-300 text-lg mb-10 max-w-lg leading-relaxed font-normal">
              Redefining automotive freedom across Kerala. Gain on-demand access to an ultra-curated stable of supercars and elite tier-one luxury vehicles.
            </p>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-4 mb-14">
              <motion.a
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                href="#booking"
                className="bg-white text-black px-9 py-4.5 rounded-2xl font-bold hover:bg-gray-100 transition-colors shadow-xl flex items-center gap-2.5 text-sm uppercase tracking-wider"
              >
                <Search className="w-4 h-4 stroke-[2.5]" />
                Explore Fleet
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                href="#about"
                className="bg-transparent border border-white/15 backdrop-blur-md text-white px-9 py-4.5 rounded-2xl font-bold transition-all text-sm uppercase tracking-wider hover:border-white/40"
              >
                Learn More
              </motion.a>
            </div>

            {/* Micro stats grid */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-white/[0.06] max-w-sm">
              <div>
                <p className="text-3xl font-light text-white tracking-tight">250<span className="text-blue-500 font-normal">+</span></p>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Supercars</p>
              </div>
              <div>
                <p className="text-3xl font-light text-white tracking-tight">99<span className="text-blue-500 font-normal">%</span></p>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Satis. Rate</p>
              </div>
              <div>
                <p className="text-3xl font-light text-white tracking-tight">4.9<span className="text-blue-500 font-normal">★</span></p>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Verified Experience</p>
              </div>
            </div>
          </motion.div>

          {/* ================= MONOLITHIC GLASS CONSOLE ================= */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 w-full mt-8 lg:mt-0 lg:-translate-y-16"
          >
            <div className="relative group/card overflow-hidden rounded-[32px] p-[1px] bg-gradient-to-b from-white/10 via-white/[0.02] to-transparent shadow-2xl shadow-black/80">
              <div className="relative bg-[#0d121f]/70 backdrop-blur-3xl rounded-[31px] p-8 sm:p-9">

                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white tracking-tight">Secure Your Ride</h2>
                  <p className="text-xs text-gray-400 mt-1.5">Instant availability, zero friction points</p>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">Pick-up Location</label>
                    <div className="relative group/input">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400 group-focus-within/input:text-white transition-colors" />
                      <input
                        type="text"
                        placeholder="Cochin International Airport (COK)..."
                        className="w-full pl-11 pr-4 py-3.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:bg-white/[0.06] focus:border-transparent transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">Departure</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                        <input
                          type="date"
                          className="w-full pl-11 pr-4 py-3.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:bg-white/[0.06] transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">Return</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                        <input
                          type="date"
                          className="w-full pl-11 pr-4 py-3.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:bg-white/[0.06] transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">Target Timeframe</label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                      <select className="w-full pl-11 pr-4 py-3.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:bg-white/[0.06] transition-all appearance-none cursor-pointer">
                        <option className="bg-[#0b0f19]">09:00 AM (Standard Window)</option>
                        <option className="bg-[#0b0f19]">1:00 PM (Midday Window)</option>
                        <option className="bg-[#000000]">07:00 PM (Twilight Dispatch)</option>
                      </select>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-4.5 rounded-xl font-bold shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 mt-6 text-xs tracking-widest uppercase transition-all"
                  >
                    <Search className="w-4 h-4 stroke-[2.5]" />
                    Initialize Engine Search
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}