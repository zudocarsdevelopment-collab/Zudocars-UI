import { ArrowUpRight, Sparkles, Users, Fuel, Settings2, ChevronDown } from 'lucide-react'
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion'
import { useRef } from 'react'
import { Link } from 'react-router-dom'

// The road every car drives along — same curve used by the SVG light trail below,
// expressed as a CSS motion path so cars follow it automatically instead of being hand-positioned.
const ROAD_PATH = "path('M 1150 160 C 950 260, 820 300, 760 380 C 690 470, 560 500, 420 560 C 260 630, 120 660, -80 770')"

// Convoy of cars that continuously drives the light-trail road, looping forever.
// Everyday hatchbacks, sedans, and SUVs — the actual, bookable Zudo fleet.
// Staggered delays + varying base sizes make it read as a real convoy, not clones in lockstep.
const CONVOY = [
  { src: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=600&q=80', baseWidth: 150, duration: 9, delay: 0 },
  { src: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=700&q=80', baseWidth: 170, duration: 9, delay: 1.8 },
  { src: 'https://www.hyundai.com/content/dam/hyundai/in/en/data/find-a-car/Creta/Highlights/kinglimited/cretalimitedkingbig1.jpg', baseWidth: 190, duration: 9, delay: 3.6 },
  { src: 'https://nar.media.audi.com/is/image/audinar/country/us/en/assets/pct/2026/1920x1920_D2_MY27---Q6-e-tron---Front---Profile---Parked---5204.jpg?preferwebp=true', baseWidth: 210, duration: 9, delay: 5.4 },
  { src: 'https://images.unsplash.com/photo-1568844293986-8d0400bd4745?auto=format&fit=crop&w=1100&q=85', baseWidth: 230, duration: 9, delay: 7.2 },
]

// Marque names for the credential strip — the everyday brands Zudo actually stocks.
const MARQUES = ['Maruti Suzuki', 'Hyundai', 'Tata', 'Toyota', 'Kia', 'Honda', 'Mahindra', 'Renault']

// Headline words, split so they can stagger in on load.
const HEADLINE_LINE_1 = ['DRIVE', 'KERALA']
const HEADLINE_LINE_2 = ['YOUR', 'WAY']

export default function Hero() {
  const containerRef = useRef(null)

  const { scrollY } = useScroll()
  const roadY = useTransform(scrollY, [0, 500], [0, 90])
  const textY = useTransform(scrollY, [0, 500], [0, -40])
  const wordmarkY = useTransform(scrollY, [0, 500], [0, 60])

  // Mouse-parallax for the aurora glows — subtle, spring-damped so it never
  // feels twitchy. Falls back to centered/static on touch devices since
  // there's no persistent pointer to react to.
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

  return (
    <section
      ref={containerRef}
      id="home"
      onMouseMove={handlePointerMove}
      className="relative min-h-screen flex items-center bg-[#050710] overflow-hidden pt-28 pb-16 lg:py-0 select-none"
    >
      {/* ================= BACKGROUND ENVIRONMENT & DEPTH LAYERS ================= */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Ambient masking so the convoy fades into the frame */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#050710] via-[#050710]/70 to-[#050710]/20 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050710] via-transparent to-[#050710]/40 z-10" />

        {/* Cinematic aurora glows — drift gently toward the cursor */}
        <motion.div
          style={{ x: glowX, y: glowY }}
          className="absolute top-[-10%] right-[0%] w-[650px] h-[650px] bg-blue-600/10 rounded-full blur-[170px]"
        />
        <motion.div
          style={{ x: useTransform(glowX, (v) => v * -0.6), y: useTransform(glowY, (v) => v * -0.6) }}
          className="absolute bottom-[-15%] left-[5%] w-[550px] h-[550px] bg-cyan-500/10 rounded-full blur-[150px]"
        />

        {/* Fine film-grain texture for a cinematic, non-flat finish */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.035] mix-blend-overlay">
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>

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
                Kerala
              </span>
              <span className="text-gray-400 text-xs font-semibold tracking-wide flex items-center gap-1 group-hover:text-white transition-colors">
                ZUDO — BEST RENTAL CARS IN KERALA <ArrowUpRight className="w-3 h-3 text-gray-500 group-hover:text-blue-400 transition-colors" />
              </span>
            </div>

            {/* Bold headline — words stagger in on load */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[0.95] mb-8 tracking-tighter drop-shadow-[0_4px_30px_rgba(0,0,0,0.6)]">
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
              Hatchbacks for the city, sedans for the highway, SUVs for the ghats. A well-maintained everyday fleet across Kerala, priced for real trips, not showroom dreams.
            </motion.p>

            {/* Single, non-transactional CTA — invites browsing, not booking */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.68 }}
              className="flex flex-wrap gap-4 mb-14"
            >
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex"
              >
                <Link
                  to="/cars"
                  className="bg-white text-black px-9 py-4.5 rounded-2xl font-bold hover:bg-gray-100 transition-colors shadow-xl flex items-center gap-2.5 text-sm uppercase tracking-wider"
                >
                  <Settings2 className="w-4 h-4 stroke-[2.5]" />
                  View The Fleet
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex"
              >
                <Link
                  to="/about"
                  className="bg-transparent border border-white/15 backdrop-blur-md text-white px-9 py-4.5 rounded-2xl font-bold transition-all text-sm uppercase tracking-wider hover:border-white/40"
                >
                  Our Story
                </Link>
              </motion.div>
            </motion.div>

            {/* Micro stats grid — brand credibility, not live data */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="grid grid-cols-3 gap-8 pt-8 border-t border-white/[0.06] max-w-sm"
            >
              <div>
                <p className="text-3xl font-light text-white tracking-tight">500<span className="text-blue-500 font-normal">+</span></p>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Cars In Fleet</p>
              </div>
              <div>
                <p className="text-3xl font-light text-white tracking-tight">14</p>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Kerala Districts</p>
              </div>
              <div>
                <p className="text-3xl font-light text-white tracking-tight">4.8<span className="text-blue-500 font-normal">★</span></p>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Verified Experience</p>
              </div>
            </motion.div>
          </motion.div>

          {/* ================= SPOTLIGHT VEHICLE CARD — a showcase, not a booking widget ================= */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 w-full mt-8 lg:mt-0 lg:-translate-y-16"
          >
            <div className="relative group/card overflow-hidden rounded-[32px] p-[1px] bg-gradient-to-b from-white/10 via-white/[0.02] to-transparent shadow-2xl shadow-black/80">
              <div className="relative bg-[#0d121f]/70 backdrop-blur-3xl rounded-[31px] overflow-hidden">

                {/* Hero image of the spotlighted, everyday car */}
                <div className="relative h-64 sm:h-72 overflow-hidden">
                  <img
                    src="https://www.hyundai.com/content/dam/hyundai/in/en/data/find-a-car/Creta/Highlights/kinglimited/cretalimitedkingbig1.jpg"
                    alt="Spotlighted vehicle in the Zudo fleet"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d121f] via-[#0d121f]/10 to-transparent" />
                  <span className="absolute top-5 left-5 bg-white/10 border border-white/15 backdrop-blur-md text-white/90 text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full">
                    Fleet Spotlight
                  </span>
                  <div className="absolute bottom-5 left-6">
                    <p className="text-2xl font-bold text-white tracking-tight">Hyundai Creta</p>
                    <p className="text-xs text-gray-400 font-medium tracking-wide">Mid-Size SUV — Diesel & Petrol</p>
                  </div>
                </div>

                {/* Static spec plate — everyday specs, not performance numbers */}
                <div className="grid grid-cols-3 divide-x divide-white/[0.06] font-mono border-t border-white/[0.06]">
                  <div className="p-4 text-center">
                    <p className="text-[9px] text-gray-500 tracking-widest uppercase mb-0.5 flex items-center justify-center gap-1">
                      <Users className="w-3 h-3" /> Seats
                    </p>
                    <p className="text-sm font-semibold text-amber-400/90">5</p>
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-[9px] text-gray-500 tracking-widest uppercase mb-0.5 flex items-center justify-center gap-1">
                      <Fuel className="w-3 h-3" /> Mileage
                    </p>
                    <p className="text-sm font-semibold text-amber-400/90">18km/l</p>
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-[9px] text-gray-500 tracking-widest uppercase mb-0.5">Gearbox</p>
                    <p className="text-sm font-semibold text-amber-400/90">Auto/Manual</p>
                  </div>
                </div>

                <div className="p-6 sm:p-7 pt-5">
                  <p className="text-sm text-gray-400 leading-relaxed">
                    One of the everyday picks in the current Zudo collection — comfortable on the highway to Munnar, easy to park in Kochi, roomy enough for a family of five.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

        </div>

        {/* Marque credential strip — infinite marquee of the everyday brands in the fleet */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="hidden lg:block mt-16 pt-8 border-t border-white/[0.06] overflow-hidden"
        >
          <motion.div
            className="flex whitespace-nowrap gap-12"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ repeat: Infinity, ease: 'linear', duration: 22 }}
          >
            {[...MARQUES, ...MARQUES].map((name, i) => (
              <span key={i} className="text-xs font-semibold tracking-[0.15em] uppercase text-gray-600">
                {name}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        className="hidden lg:flex flex-col items-center gap-2 absolute bottom-8 left-1/2 -translate-x-1/2 z-30"
      >
        <span className="text-[10px] tracking-[0.2em] uppercase text-gray-600 font-semibold">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-4 h-4 text-gray-600" />
        </motion.div>
      </motion.div>
    </section>
  )
}