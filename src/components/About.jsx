import { Link } from 'react-router-dom'
import {
  ShieldCheck,
  Truck,
  Clock,
  BadgeIndianRupee,
  MapPin,
  Users,
  Car,
  Star,
} from 'lucide-react'
import { cn } from '../lib/cn'

const stats = [
  { label: 'Years on Kerala roads', value: '8+' },
  { label: 'Cars in the fleet', value: '150+' },
  { label: 'Districts covered', value: '14' },
  { label: 'Happy drivers', value: '25K+' },
]

const values = [
  {
    icon: ShieldCheck,
    title: 'Verified, inspected fleet',
    desc: 'Every car passes a 40-point check before it reaches you — tyres, AC, brakes, papers, all sorted.',
  },
  {
    icon: Truck,
    title: 'Doorstep delivery',
    desc: 'Pick a spot anywhere from Kochi to Kasaragod. We drive it to you, no counter queues.',
  },
  {
    icon: Clock,
    title: '24/7 road support',
    desc: 'A flat tyre near Munnar at midnight is still just a phone call away from help.',
  },
  {
    icon: BadgeIndianRupee,
    title: 'Transparent pricing',
    desc: 'The price you see at booking is the price you pay. No surprise "convenience" fees.',
  },
]

const routes = [
  {
    place: 'Munnar',
    tag: 'Hill route',
    detail: '4h 30m from Kochi',
    img: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=800&auto=format&fit=crop',
  },
  {
    place: 'Alleppey',
    tag: 'Backwater route',
    detail: '1h 45m from Kochi',
    img: 'https://images.unsplash.com/photo-1602308176936-b361f0aa2c65?q=80&w=800&auto=format&fit=crop',
  },
  {
    place: 'Wayanad',
    tag: 'Forest route',
    detail: '6h from Kochi',
    img: 'https://images.unsplash.com/photo-1590077428593-a55bb07c4665?q=80&w=800&auto=format&fit=crop',
  },
  {
    place: 'Kovalam',
    tag: 'Coastal route',
    detail: '30m from Trivandrum',
    img: 'https://images.unsplash.com/photo-1602010789026-9c8c67d0a4b6?q=80&w=800&auto=format&fit=crop',
  },
]

export default function About() {
  return (
    <div className="bg-black text-white">

      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-end overflow-hidden pt-24">
        <img
          src="https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=1600&auto=format&fit=crop"
          alt="Kerala backwaters at dusk"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 w-full">
          <span className="inline-block text-xs font-bold tracking-[0.25em] text-cyan-400 uppercase mb-5">
            About Zudocars
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight max-w-3xl leading-[1.05]">
            Kerala, unlocked
            <br />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              one mile at a time.
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-base sm:text-lg text-white/70 leading-relaxed">
            We're a self-drive car rental built for God's Own Country — from
            Kochi's city lanes to Munnar's hairpin bends and Alleppey's
            backwater roads. No agents, no drama. Just a clean car, a full
            tank of trust, and the keys in your hand.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <a
              href="#booking"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-7 py-3.5 rounded-xl text-sm font-bold tracking-wide hover:opacity-95 active:scale-[0.98] transition-all shadow-[0_4px_20px_rgba(37,99,235,0.35)]"
            >
              Book a car
            </a>
            <Link
              to="/cars"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold tracking-wide border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all"
            >
              View the fleet
            </Link>
          </div>
        </div>
      </section>

      {/* Stats strip — overlaps hero/story seam */}
      <section className="relative z-10 -mt-12 sm:-mt-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center lg:text-left">
                <div className="text-3xl sm:text-4xl font-black text-white">{s.value}</div>
                <div className="mt-1 text-xs sm:text-sm text-white/50 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-14 items-center">
          <div className="relative">
            <div className="aspect-[4/5] rounded-2xl overflow-hidden border border-white/10">
              <img
                src="https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=1000&auto=format&fit=crop"
                alt="Winding hill road through Kerala's hills"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 hidden sm:flex items-center gap-3 bg-black border border-white/10 rounded-xl px-5 py-4 shadow-2xl">
              <Star className="w-5 h-5 text-cyan-400 fill-cyan-400" />
              <div>
                <div className="text-sm font-bold">4.8/5 rating</div>
                <div className="text-xs text-white/50">from 6,000+ trips</div>
              </div>
            </div>
          </div>

          <div>
            <span className="text-xs font-bold tracking-[0.25em] text-cyan-400 uppercase">
              Our story
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Started in Kochi, built for every road in Kerala.
            </h2>
            <p className="mt-5 text-white/70 leading-relaxed">
              Zudocars began with three sedans and one simple frustration:
              renting a car in Kerala meant paperwork, pushy agents, and a
              vehicle that had seen better decades. We fixed that — one
              well-maintained car, one honest bill, one district at a time.
            </p>
            <p className="mt-4 text-white/70 leading-relaxed">
              Today the fleet runs from Kochi to Kozhikode, but the promise
              hasn't changed: a car that starts every time, a price you agreed
              to upfront, and someone who actually picks up the phone.
            </p>
            <div className="mt-8 flex items-center gap-8">
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <MapPin className="w-4 h-4 text-cyan-400" /> 14 districts
              </div>
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <Car className="w-4 h-4 text-cyan-400" /> 150+ cars
              </div>
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <Users className="w-4 h-4 text-cyan-400" /> Local drivers
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Zudo */}
      <section className="py-24 sm:py-32 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mb-14">
            <span className="text-xs font-bold tracking-[0.25em] text-cyan-400 uppercase">
              Why Zudo
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-black tracking-tight">
              Built different from the average rental counter.
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group rounded-2xl border border-white/10 bg-white/[0.02] p-6 hover:bg-white/[0.05] hover:border-cyan-400/30 transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-xl bg-cyan-400/10 flex items-center justify-center mb-5 group-hover:bg-cyan-400/20 transition-colors">
                  <Icon className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-white/55 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Signature: Routes we know by heart */}
      <section className="py-24 sm:py-32 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div className="max-w-xl">
              <span className="text-xs font-bold tracking-[0.25em] text-cyan-400 uppercase">
                Where you'll take it
              </span>
              <h2 className="mt-4 text-3xl sm:text-4xl font-black tracking-tight">
                Routes we know by heart.
              </h2>
            </div>
            <p className="text-sm text-white/50 max-w-xs">
              Every route below is one our own team has driven — so the
              pickup point, the fuel stops, and the traffic patterns are
              already worked out for you.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {routes.map((r) => (
              <div
                key={r.place}
                className="group relative rounded-2xl overflow-hidden aspect-[3/4] border border-white/10"
              >
                <img
                  src={r.img}
                  alt={`Road to ${r.place}, Kerala`}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute top-4 left-4 text-[11px] font-bold tracking-wide uppercase text-cyan-300 bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/10">
                  {r.tag}
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="text-xl font-black">{r.place}</h3>
                  <p className="text-xs text-white/60 mt-1">{r.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-cyan-500 px-8 py-14 sm:px-16 sm:py-20 text-center">
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-black/10 rounded-full blur-3xl" />
            <h2 className="relative text-3xl sm:text-4xl font-black tracking-tight text-white">
              Ready to hit the road?
            </h2>
            <p className="relative mt-4 text-white/85 max-w-md mx-auto">
              Pick a car, pick a date, and let Kerala do the rest.
            </p>
            <a
              href="#booking"
              className="relative mt-8 inline-flex items-center gap-2 bg-black text-white px-8 py-3.5 rounded-xl text-sm font-bold tracking-wide hover:bg-black/80 active:scale-[0.98] transition-all"
            >
              Book Now
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}