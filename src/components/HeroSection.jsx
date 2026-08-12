import { ArrowUpRight, MapPin, CalendarDays, CalendarCheck, Settings2, Clock } from 'lucide-react'
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion'
import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

// The road every car drives along — expressed as a CSS motion path
const ROAD_PATH = "path('M 1150 160 C 950 260, 820 300, 760 380 C 690 470, 560 500, 420 560 C 260 630, 120 660, -80 770')"

const CONVOY = [
  { src: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=600&q=80', baseWidth: 150, duration: 9, delay: 0 },
  { src: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=700&q=80', baseWidth: 170, duration: 9, delay: 1.8 },
  { src: 'https://www.hyundai.com/content/dam/hyundai/in/en/data/find-a-car/Creta/Highlights/kinglimited/cretalimitedkingbig1.jpg', baseWidth: 190, duration: 9, delay: 3.6 },
  { src: 'https://nar.media.audi.com/is/image/audinar/country/us/en/assets/pct/2026/1920x1920_D2_MY27---Q6-e-tron---Front---Profile---Parked---5204.jpg?preferwebp=true', baseWidth: 210, duration: 9, delay: 5.4 },
  { src: 'https://images.unsplash.com/photo-1568844293986-8d0400bd4745?auto=format&fit=crop&w=1100&q=85', baseWidth: 230, duration: 9, delay: 7.2 },
]

// Location list mapped directly to API database IDs
const LOCATIONS = [
  { id: 6, name: 'Ernakulam North' },
  { id: 4, name: 'Kochi Airport (COK)' },
  { id: 1, name: 'Trivandrum Airport (TRV)' },
  { id: 2, name: 'Calicut Airport (CCJ)' },
  { id: 3, name: 'Thrissur Town' },
  { id: 5, name: 'Kottayam Town' },
  { id: 7, name: 'Alleppey Railway Station' },
]

// 24-Hour Time slots mapped for display and API format
const TIME_SLOTS = [
  { display: '06:00 AM', value: '06:00' },
  { display: '07:00 AM', value: '07:00' },
  { display: '08:00 AM', value: '08:00' },
  { display: '09:00 AM', value: '09:00' },
  { display: '10:00 AM', value: '10:00' },
  { display: '11:00 AM', value: '11:00' },
  { display: '12:00 PM', value: '12:00' },
  { display: '01:00 PM', value: '13:00' },
  { display: '02:00 PM', value: '14:00' },
  { display: '03:00 PM', value: '15:00' },
  { display: '04:00 PM', value: '16:00' },
  { display: '05:00 PM', value: '17:00' },
  { display: '06:00 PM', value: '18:00' },
  { display: '06:30 PM', value: '18:30' },
  { display: '07:00 PM', value: '19:00' },
  { display: '08:00 PM', value: '20:00' },
  { display: '09:00 PM', value: '21:00' },
]

const HEADLINE_LINE_1 = ['DRIVE', 'KERALA']
const HEADLINE_LINE_2 = ['YOUR', 'WAY']

export default function Hero() {
  const containerRef = useRef(null)
  const navigate = useNavigate()

  const { scrollY } = useScroll()
  const roadY = useTransform(scrollY, [0, 500], [0, 90])
  const textY = useTransform(scrollY, [0, 500], [0, -40])
  const wordmarkY = useTransform(scrollY, [0, 500], [0, 60])

  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const glowX = useSpring(pointerX, { stiffness: 40, damping: 20 })
  const glowY = useSpring(pointerY, { stiffness: 40, damping: 20 })

  function handlePointerMove(e) {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const relX = (e.clientX - rect.left) / rect.width - 0.5
    const relY = (e.clientY - rect.top) / rect.height - 0.5
    pointerX.set(relX * 60)
    pointerY.set(relY * 60)
  }

  // ============ SEARCH FORM STATE ============
  const [pickupLocationId, setPickupLocationId] = useState(LOCATIONS[0].id)
  const [dropLocationId, setDropLocationId] = useState(LOCATIONS[1].id)
  const [isDifferentDropoff, setIsDifferentDropoff] = useState(false)
  
  const [pickupDate, setPickupDate] = useState('2026-08-15')
  const [pickupTime, setPickupTime] = useState('18:30')
  const [dropDate, setDropDate] = useState('2026-08-19')
  const [dropTime, setDropTime] = useState('18:30')
  
  const [driverOption, setDriverOption] = useState('self-drive')
  const [formError, setFormError] = useState('')

  function handleBookingSubmit(e) {
    e.preventDefault()
    if (!pickupDate || !dropDate) {
      setFormError('Please select both pickup and return dates.')
      return
    }
    if (new Date(`${pickupDate}T${pickupTime}`) >= new Date(`${dropDate}T${dropTime}`)) {
      setFormError('Return date & time must be after pickup date & time.')
      return
    }
    setFormError('')

    // Payload parameters matching POST/GET to /api/vehicles/available/
    const params = new URLSearchParams({
      date_from: pickupDate,
      time_from: pickupTime,
      date_to: dropDate,
      time_to: dropTime,
      pickup_location_id: pickupLocationId.toString(),
      dropoff_location_id: (isDifferentDropoff ? dropLocationId : pickupLocationId).toString(),
      vehicle_type: 'car',
    })

    navigate(`/cars?${params.toString()}`)
  }

  

  return (
    <section
      ref={containerRef}
      id="home"
      onMouseMove={handlePointerMove}
      className="relative min-h-screen flex items-center bg-[#050710] overflow-hidden pt-28 pb-16 lg:py-12 select-none"
    >
      {/* Background & Ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-[#050710] via-[#050710]/70 to-[#050710]/20 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050710] via-transparent to-[#050710]/40 z-10" />

        <motion.div
          style={{ x: glowX, y: glowY }}
          className="absolute top-[-10%] right-[0%] w-[650px] h-[650px] bg-blue-600/10 rounded-full blur-[170px]"
        />
        <motion.div
          style={{ x: useTransform(glowX, (v) => v * -0.6), y: useTransform(glowY, (v) => v * -0.6) }}
          className="absolute bottom-[-15%] left-[5%] w-[550px] h-[550px] bg-cyan-500/10 rounded-full blur-[150px]"
        />

        {/* Wordmark Background */}
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

        {/* Road Track & Moving Fleet Convoy */}
        <motion.div style={{ y: roadY }} className="absolute inset-0 z-10">
          <svg viewBox="0 0 1440 900" preserveAspectRatio="none" className="absolute inset-0 w-full h-full opacity-80">
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
            />
          </svg>
        </motion.div>

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
              />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Main Content Layout */}
      <div className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* Left Hero Text Column */}
          <motion.div
            style={{ y: textY }}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 text-left mt-12 lg:mt-0"
          >
            <div className="inline-flex items-center gap-3 bg-white/[0.03] border border-white/10 backdrop-blur-xl rounded-full pl-2 pr-5 py-1.5 mb-8">
              <span className="bg-blue-600 text-white text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full shadow-md shadow-blue-600/20">
                Kerala
              </span>
              <span className="text-gray-400 text-xs font-semibold tracking-wide flex items-center gap-1">
                ZUDO — CAR RENTALS & DRIVER SERVICES <ArrowUpRight className="w-3 h-3 text-gray-500" />
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[0.95] mb-8 tracking-tighter">
              <span className="block overflow-hidden">
                {HEADLINE_LINE_1.map((word, i) => (
                  <motion.span
                    key={word}
                    initial={{ y: '110%' }}
                    animate={{ y: '0%' }}
                    transition={{ duration: 0.7, delay: 0.1 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                    className="inline-block mr-4"
                  >
                    {word}
                  </motion.span>
                ))}
              </span>
              <span className="block overflow-hidden">
                {HEADLINE_LINE_2.map((word, i) => (
                  <motion.span
                    key={word}
                    initial={{ y: '110%' }}
                    animate={{ y: '0%' }}
                    transition={{ duration: 0.7, delay: 0.28 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                    className="inline-block mr-4 text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-cyan-400"
                  >
                    {word}
                  </motion.span>
                ))}
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.55 }}
              className="text-gray-300 text-lg mb-10 max-w-lg leading-relaxed font-normal"
            >
              Hatchbacks for the city, sedans for the highway, SUVs for the ghats. Fully insured vehicles across all major hubs in Kerala.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.68 }}
              className="flex flex-wrap gap-4 mb-14"
            >
              <Link
                to="/cars"
                className="bg-white text-black px-9 py-4.5 rounded-2xl font-bold hover:bg-gray-100 transition-colors shadow-xl flex items-center gap-2.5 text-sm uppercase tracking-wider"
              >
                <Settings2 className="w-4 h-4 stroke-[2.5]" />
                Browse Fleet
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Search / Booking Card Column */}
          <motion.div
            id="booking"
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 w-full scroll-mt-28"
          >
            <div className="relative overflow-hidden rounded-[32px] p-[1px] bg-gradient-to-b from-white/10 via-white/[0.02] to-transparent shadow-2xl shadow-black/80">
              <div className="relative bg-[#0d121f]/90 backdrop-blur-3xl rounded-[31px] p-6 sm:p-7">

                <div className="relative flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <CalendarCheck className="w-4 h-4 text-blue-400" strokeWidth={2} />
                    <h2 className="text-[11px] font-bold text-blue-300/90 tracking-[0.2em] uppercase font-mono">
                      Check Availability
                    </h2>
                  </div>

                  {/* Driver Option Toggle */}
                  <div className="flex items-center bg-white/[0.04] p-1 rounded-xl border border-white/[0.08]">
                    <button
                      type="button"
                      onClick={() => setDriverOption('self-drive')}
                      className={`text-[10px] font-bold px-3 py-1 rounded-lg transition-all ${
                        driverOption === 'self-drive'
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Self Drive
                    </button>
                    {/* <button
                      type="button"
                      onClick={() => setDriverOption('with-driver')}
                      className={`text-[10px] font-bold px-3 py-1 rounded-lg transition-all ${
                        driverOption === 'with-driver'
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      With Driver
                    </button> */}
                  </div>
                </div>

                <form onSubmit={handleBookingSubmit} className="relative space-y-4">
                  {/* Locations Selection */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label className="block">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-blue-400" /> Pickup Hub
                        </span>
                        <select
                          value={pickupLocationId}
                          onChange={(e) => setPickupLocationId(Number(e.target.value))}
                          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-xs font-medium focus:outline-none focus:border-blue-500/50 transition-colors cursor-pointer"
                        >
                          {LOCATIONS.map((loc) => (
                            <option key={loc.id} value={loc.id} className="bg-[#0d121f] text-white">
                              {loc.name}
                            </option>
                          ))}
                        </select>
                      </label>

                      {isDifferentDropoff && (
                        <label className="block">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-cyan-400" /> Drop-off Hub
                          </span>
                          <select
                            value={dropLocationId}
                            onChange={(e) => setDropLocationId(Number(e.target.value))}
                            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-xs font-medium focus:outline-none focus:border-blue-500/50 transition-colors cursor-pointer"
                          >
                            {LOCATIONS.map((loc) => (
                              <option key={loc.id} value={loc.id} className="bg-[#0d121f] text-white">
                                {loc.name}
                              </option>
                            ))}
                          </select>
                        </label>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsDifferentDropoff(!isDifferentDropoff)}
                      className="text-[10px] font-medium text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 underline underline-offset-2"
                    >
                      {isDifferentDropoff ? 'Same drop-off hub' : '+ Return to a different location'}
                    </button>
                  </div>

                  {/* Date & Time Selectors */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-3 space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                        <CalendarDays className="w-3 h-3 text-blue-400" /> Pickup Schedule
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="date"
                          value={pickupDate}
                          onChange={(e) => setPickupDate(e.target.value)}
                          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-2 py-2 text-white text-xs font-medium focus:outline-none focus:border-blue-500/50 transition-colors [color-scheme:dark]"
                        />
                        <select
                          value={pickupTime}
                          onChange={(e) => setPickupTime(e.target.value)}
                          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-2 py-2 text-white text-xs font-medium focus:outline-none cursor-pointer"
                        >
                          {TIME_SLOTS.map((t) => (
                            <option key={t.value} value={t.value} className="bg-[#0d121f] text-white">
                              {t.display}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-3 space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-blue-400" /> Drop-off Schedule
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="date"
                          value={dropDate}
                          onChange={(e) => setDropDate(e.target.value)}
                          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-2 py-2 text-white text-xs font-medium focus:outline-none focus:border-blue-500/50 transition-colors [color-scheme:dark]"
                        />
                        <select
                          value={dropTime}
                          onChange={(e) => setDropTime(e.target.value)}
                          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-2 py-2 text-white text-xs font-medium focus:outline-none cursor-pointer"
                        >
                          {TIME_SLOTS.map((t) => (
                            <option key={t.value} value={t.value} className="bg-[#0d121f] text-white">
                              {t.display}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {formError && (
                    <p className="text-xs text-red-400 font-medium bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-xl">
                      {formError}
                    </p>
                  )}

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-3.5 rounded-xl font-bold shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2 text-xs tracking-widest uppercase transition-all mt-3"
                  >
                    Find Available Cars
                    <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                  </motion.button>
                </form>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}