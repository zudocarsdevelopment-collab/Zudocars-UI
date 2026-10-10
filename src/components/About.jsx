import { Link } from 'react-router-dom'
import { ShieldCheck, Truck, Clock, BadgeIndianRupee, Car, Compass, KeyRound, ArrowUpRight, ArrowRight, MessageCircle } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import '../pages/home.css'
import './about.css'
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
  const reduceMotion = useReducedMotion()
  const reveal = {
    initial: reduceMotion ? false : { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.15 },
    transition: { duration: 0.6 },
  }
  return <main className="rental-home about-home">
    <section className="about-hero">
      <img src="/images/Kerala.jpg" alt="Scenic Kerala landscape" className="about-hero-image" fetchPriority="high" />
      <motion.div className="about-hero-content" {...reveal}>
        <span className="about-eyebrow">About Zudo Cars</span>
        <h1>Kerala unlocked.<br/><span>One mile at a time.</span></h1>
        <p>We built Zudo Cars on a single conviction: exploring God's Own Country should feel effortless, exhilarating, and completely transparent. Pristine cars and the freedom of the open road.</p>
        <div className="about-actions">
          <Link className="about-button" to="/cars">Browse cars <ArrowRight size={20}/></Link>
          <a className="about-button about-button-outline" href="https://wa.me/918111946664?text=Hi%20Zudo%20Cars,%20I%20have%20an%20inquiry%20about%20renting%20a%20car" target="_blank" rel="noopener noreferrer"><MessageCircle size={20}/>Chat on WhatsApp</a>
        </div>
      </motion.div>
    </section>
    <div className="rental-content about-content">
      <section className="about-stats" aria-label="Zudo Cars at a glance">
        {stats.map(stat => <article key={stat.label}><strong>{stat.value}</strong><h3>{stat.label}</h3><p>{stat.sub}</p></article>)}
      </section>
      <motion.section className="about-story" {...reveal}>
        <img src="/images/ourStory.jpg" alt="Zudo Cars on a scenic Kerala highway" loading="lazy" />
        <div>
          <span className="about-eyebrow">Our story & mission</span>
          <h2>Born in Kochi.<br/>Made for Kerala roads.</h2>
          <p>Zudo Cars started with three sedans and one frustrating reality: hiring a self-drive car in Kerala too often meant broken odometers, pushy counter agents, and old vehicles that struggled on the first hill climb.</p>
          <p>We rebuilt the experience around driver trust. We maintain our own company-owned fleet, inspect every component prior to departure, and back every journey with 24/7 on-ground assistance across all 14 districts of Kerala.</p>
          <div className="about-story-points"><span><ShieldCheck size={21}/>Company-owned fleet</span><span><BadgeIndianRupee size={21}/>Transparent pricing</span></div>
        </div>
      </motion.section>
      <motion.section className="rental-benefits about-values" {...reveal}>
        <h2>Why drive with Zudo Cars?</h2>
        <div>{values.map(({icon: Icon, title, desc, badge}) => <article key={title}><Icon size={42}/><span className="about-card-label">{badge}</span><h3>{title}</h3><p>{desc}</p></article>)}</div>
      </motion.section>
      <motion.section className="rental-steps about-steps" {...reveal}>
        <h2>Your journey starts here</h2>
        <div>{steps.map(step => <article key={step.number}><span>{step.number}</span><h3>{step.title}</h3><p>{step.desc}</p></article>)}</div>
      </motion.section>
      <motion.section className="rental-collections about-routes" {...reveal}>
        <h2>Explore Kerala your way</h2><p>From mountain roads to the coast, find your next destination.</p>
        <div>{routes.map(route => <Link to="/cars" key={route.place}><img src={route.img} alt={`Explore ${route.place}, Kerala`} loading="lazy"/><h3>{route.place}<ArrowUpRight size={22}/></h3><p>{route.tag}</p><p>{route.detail}</p><p>{route.recommended}</p></Link>)}</div>
      </motion.section>
      <motion.section className="about-cta" {...reveal}>
        <span className="about-eyebrow">Your next drive</span><h2>More Kerala.<br/>More freedom.</h2><p>Find a car for your journey, or speak with our team to plan your rental.</p>
        <div className="about-actions"><Link className="about-button" to="/cars">Find your car <ArrowRight size={20}/></Link><Link className="about-button about-button-outline" to="/contact">Talk to our team</Link></div>
      </motion.section>
    </div>
  </main>
}
