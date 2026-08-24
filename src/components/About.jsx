import { Link } from "react-router-dom";
import { useState } from "react";
import {
  ShieldCheck,
  Truck,
  Clock,
  BadgeIndianRupee,
  MapPin,
  Users,
  Car,
  Star,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  PhoneCall,
  MessageCircle,
  Compass,
  KeyRound,
  ShieldAlert,
} from "lucide-react";
import EnquiryModal from "./EnquiryModal";

const stats = [
  {
    label: "Years on Kerala Roads",
    value: "8+",
    sub: "Pioneering premium self-drive",
  },
  {
    label: "Fleet Vehicles",
    value: "150+",
    sub: "Modern automatics & SUVs",
  },
  {
    label: "Districts Covered",
    value: "14",
    sub: "Statewide 24/7 support",
  },
  {
    label: "Happy Roadtrippers",
    value: "25K+",
    sub: "4.9/5 verified rating",
  },
];

const values = [
  {
    icon: ShieldCheck,
    title: "40-Point Pre-Trip Audit",
    desc: "Every vehicle undergoes thorough multi-point checks — AC chiller performance, tyre tread depth, suspension balance, brake response, and medical-grade sanitization.",
    badge: "Certified Fleet",
  },
  {
    icon: Truck,
    title: "Airport & Doorstep Delivery",
    desc: "Direct handovers at Cochin International Airport (COK), Trivandrum (TRV), railway stations, luxury resorts, or your doorstep with zero counter queues.",
    badge: "24/7 Handover",
  },
  {
    icon: Clock,
    title: "24/7 Dedicated Roadside SOS",
    desc: "Whether you encounter a flat tyre on the Munnar Ghats at midnight or need quick route guidance, our regional breakdown mechanics are just a call away.",
    badge: "Always Active",
  },
  {
    icon: BadgeIndianRupee,
    title: "100% Transparent Pricing",
    desc: "The quote you see is what you pay. No surprise convenience charges, no hidden cleaning fees, and prompt, zero-stress security deposit handling.",
    badge: "Zero Hidden Fees",
  },
];

const steps = [
  {
    number: "01",
    icon: Car,
    title: "Choose Your Machine",
    desc: "Select from our verified lineup of fuel-efficient city hatchbacks, comfortable highway sedans, or rugged 7-seater automatic SUVs.",
  },
  {
    number: "02",
    icon: KeyRound,
    title: "Instant 2-Minute KYC",
    desc: "Upload your valid Driving License and ID proof online. Complete digital verification without tedious physical paperwork.",
  },
  {
    number: "03",
    icon: Compass,
    title: "Collect & Hit the Road",
    desc: "Meet our representative at the airport terminal or your preferred hub, collect the keys in under 60 seconds, and explore Kerala freely.",
  },
];

const routes = [
  {
    place: "Munnar",
    tag: "Highland Tea Route",
    detail: "4h 30m from Kochi · 1,600m Altitude",
    recommended: "Recommended: Compact or AWD SUV",
    img: "/images/Munnar.jpg",
  },
  {
    place: "Alleppey",
    tag: "Backwater Serenity",
    detail: "1h 45m from Kochi · Coastal Highway",
    recommended: "Recommended: Smooth Automatic Sedan",
    img: "/images/Alleppey.jpg",
  },
  {
    place: "Wayanad",
    tag: "Misty Rainforest Trail",
    detail: "6h from Kochi · 9 Hairpin Ghats",
    recommended: "Recommended: High Ground Clearance SUV",
    img: "/images/wayannad.jpg",
  },
  {
    place: "Kovalam",
    tag: "Southern Beach Coast",
    detail: "30m from Trivandrum · Ocean Boulevard",
    recommended: "Recommended: Premium Sedan or Hatchback",
    img: "/images/Kovalam.jpg",
  },
];

export default function About() {
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);

  return (
    <div className="bg-[#050710] text-white min-h-screen font-sans selection:bg-cyan-500 selection:text-black">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] lg:min-h-[90vh] flex items-center overflow-hidden pt-24 lg:pt-28">
        {/* Background Image with Deep Cinematic Gradients */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/Kerala.jpg"
            alt="Scenic Kerala landscape"
            className="w-full h-full object-cover object-center filter brightness-[0.45] contrast-[1.1] scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050710] via-[#050710]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050710] via-[#050710]/80 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-500/15 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 w-full">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/10 backdrop-blur-md mb-6">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs font-semibold text-cyan-300 uppercase tracking-widest font-mono">
                The Zudo Experience
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08] mb-6">
              Kerala Unlocked.{" "}
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                One Mile at a Time.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-gray-300 leading-relaxed max-w-2xl mb-9">
              We built Zudo Cars on a single conviction: exploring God's Own Country should feel effortless, exhilarating, and completely transparent. No old beaters, no counter queues, no surprise billing — just pristine cars and the freedom of the open road.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/cars"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold px-7 py-3.5 rounded-xl text-sm tracking-wide shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/35 transition-all"
              >
                Browse Fleet & Book
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="https://wa.me/919387005555?text=Hi%20Zudo%20Cars,%20I%20have%20an%20inquiry%20about%20renting%20a%20car"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold bg-white/[0.05] hover:bg-white/[0.1] border border-white/15 text-white hover:border-cyan-400/40 backdrop-blur-md transition-all"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                WhatsApp Concierge
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Key Metrics Strip */}
      <section className="relative z-20 -mt-10 sm:-mt-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 bg-[#0d121f]/95 border border-white/10 backdrop-blur-2xl rounded-3xl p-5 sm:p-7 shadow-2xl shadow-black/80">
          {stats.map((s) => (
            <div
              key={s.label}
              className="p-3 sm:p-4 rounded-2xl hover:bg-white/[0.02] transition-colors"
            >
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">
                {s.value}
              </div>
              <div className="text-xs sm:text-sm font-bold text-cyan-300 mt-1">
                {s.label}
              </div>
              <div className="text-[11px] text-gray-400 mt-0.5 hidden sm:block">
                {s.sub}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Story & Origin Section */}
      <section className="py-20 sm:py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left: Image Showcase with Floating Glass Badges */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden border border-white/10 aspect-[4/5] shadow-2xl shadow-black/90">
                <img
                  src="/images/ourStory.jpg"
                  alt="Zudo Cars on scenic Kerala highway"
                  className="w-full h-full object-cover object-center filter contrast-[1.05]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050710] via-transparent to-transparent opacity-80" />
              </div>

              {/* Floating Review Badge */}
              <div className="absolute -bottom-6 -right-4 sm:right-6 bg-[#0d121f]/95 border border-white/10 backdrop-blur-xl rounded-2xl p-4 shadow-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  <Star className="w-5 h-5 text-cyan-400 fill-cyan-400" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">4.9 / 5.0 Rating</div>
                  <div className="text-xs text-gray-400">Over 6,500+ Verified Trips</div>
                </div>
              </div>

              {/* Floating Quality Seal Badge */}
              <div className="absolute -top-4 -left-4 bg-[#0d121f]/95 border border-white/10 backdrop-blur-xl rounded-2xl px-3.5 py-2 shadow-2xl flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-gray-200">100% Sanitized Fleet</span>
              </div>
            </div>

            {/* Right: Narrative & Core Advantages */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider font-mono">
                Our Story & Mission
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                Born in Kochi.{" "}
                <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  Engineered for Every Kerala Road.
                </span>
              </h2>

              <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                Zudo Cars started with three sedans and one frustrating reality: hiring a self-drive car in Kerala too often meant broken odometers, pushy counter agents, and old vehicles that struggled on the first hill climb.
              </p>

              <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                We rebuilt the entire experience around driver trust. We maintain our own company-owned fleet, inspect every component prior to departure, and back every journey with 24/7 on-ground assistance across all 14 districts of Kerala.
              </p>

              {/* Key Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-cyan-500/30 transition-all">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400 mb-2" />
                  <h3 className="text-sm font-bold text-white mb-1">Company-Owned Fleet</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Zero third-party middlemen. Every car is serviced directly at authorized brand centres.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-cyan-500/30 transition-all">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400 mb-2" />
                  <h3 className="text-sm font-bold text-white mb-1">Zero Security Friction</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Fast digital verification and prompt deposit releases with zero hidden charges.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The 3-Step Simple Journey */}
      <section className="py-20 sm:py-28 bg-[#090d18] border-y border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold tracking-[0.25em] text-cyan-400 uppercase font-mono">
              Simple 3-Step Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-2 mb-3">
              How Renting with Zudo Works
            </h2>
            <p className="text-xs sm:text-sm text-gray-400">
              From selection to key handover in less than 2 minutes. No paperwork delays.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.number}
                  className="relative p-6 sm:p-8 rounded-3xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.04] hover:border-cyan-500/40 transition-all duration-300 group"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                      <Icon className="w-6 h-6 text-cyan-400" />
                    </div>
                    <span className="text-3xl font-black text-white/15 font-mono">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Core Values & Fleet Guarantees */}
      <section className="py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-14">
            <span className="text-xs font-bold tracking-[0.25em] text-cyan-400 uppercase font-mono">
              Why Drivers Trust Zudo
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mt-2 mb-3">
              The 4 Uncompromising Standards.
            </h2>
            <p className="text-sm text-gray-400">
              Built deliberately different from the traditional rental counter.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map(({ icon: Icon, title, desc, badge }) => (
              <div
                key={title}
                className="group rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-7 hover:bg-white/[0.05] hover:border-cyan-400/40 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-400/10 flex items-center justify-center group-hover:bg-cyan-400/20 transition-colors">
                      <Icon className="w-6 h-6 text-cyan-400" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-400/10 px-2.5 py-1 rounded-full border border-cyan-400/20">
                      {badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-2.5 group-hover:text-cyan-300 transition-colors">
                    {title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Signature Kerala Routes */}
      <section className="py-20 sm:py-32 bg-[#090d18] border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12 flex-wrap gap-6">
            <div className="max-w-xl">
              <span className="text-xs font-bold tracking-[0.25em] text-cyan-400 uppercase font-mono">
                Curated Roadtrips
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mt-2">
                Routes We Know by Heart.
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 max-w-sm leading-relaxed">
              Every route has been driven and verified by our road team — with optimal fuel stop recommendations and highway insights.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {routes.map((r) => (
              <div
                key={r.place}
                className="group relative rounded-3xl overflow-hidden aspect-[3/4] border border-white/10 shadow-xl shadow-black/80"
              >
                <img
                  src={r.img}
                  alt={`Road to ${r.place}, Kerala`}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050710] via-[#050710]/40 to-transparent opacity-95 group-hover:opacity-85 transition-opacity" />

                <div className="absolute top-4 left-4 text-[11px] font-bold tracking-wide uppercase text-cyan-300 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/15">
                  {r.tag}
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                  <h3 className="text-xl sm:text-2xl font-black text-white mb-1 group-hover:text-cyan-300 transition-colors">
                    {r.place}
                  </h3>
                  <p className="text-xs text-gray-300 mb-2">{r.detail}</p>
                  <p className="text-[11px] text-cyan-400 font-medium">{r.recommended}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-16 sm:py-24 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 p-8 sm:p-12 md:p-16 text-center shadow-2xl shadow-blue-600/30 flex flex-col items-center justify-center">
            {/* Ambient Background Glows */}
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-white/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-black/30 rounded-full blur-3xl pointer-events-none" />

            {/* Badge */}
            <div className="relative mb-5">
              <span className="inline-flex items-center justify-center text-xs font-semibold uppercase tracking-wider text-cyan-200 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20">
                Onam Special Offers
              </span>
            </div>

            {/* Main Heading */}
            <h2 className="relative text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mb-4 max-w-2xl mx-auto leading-tight">
              Book Now for Amazing Onam Offers.
            </h2>

            {/* Subtitle / Description */}
            <p className="relative text-sm sm:text-base text-white/90 max-w-xl mx-auto mb-8 leading-relaxed font-normal">
              Celebrate the festive season with special Onam deals on premium self-drive cars across Kerala. Book online in 60 seconds or speak directly with our team.
            </p>

            {/* CTA Buttons Container */}
            <div className="relative flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 w-full sm:w-auto">
              <Link
                to="/cars"
                className="w-full sm:w-auto inline-flex items-center justify-center bg-black hover:bg-black/80 text-white px-8 py-3.5 rounded-xl text-sm font-bold tracking-wide transition-all shadow-xl hover:scale-102 min-w-[180px]"
              >
                Browse All Cars
              </Link>
              <a
                href="https://wa.me/919387005555?text=Hi%20Zudo%20Cars,%20I%20would%20like%20to%20know%20about%20the%20Onam%20Offers%20and%20reserve%20a%20car"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center bg-white/20 hover:bg-white/30 text-white border border-white/30 px-8 py-3.5 rounded-xl text-sm font-bold tracking-wide transition-all backdrop-blur-md min-w-[180px]"
              >
                WhatsApp Us Directly
              </a>
            </div>
          </div>
        </div>
      </section>

      {isEnquiryOpen && (
        <EnquiryModal onClose={() => setIsEnquiryOpen(false)} />
      )}
    </div>
  );
}
