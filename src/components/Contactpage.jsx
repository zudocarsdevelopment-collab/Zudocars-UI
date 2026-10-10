import { useState } from 'react'
import '../pages/home.css'
import './contact.css'
import usePickupHubs from '../lib/usePickupHubs'
import {
  Phone,
  Mail,
  MapPin,
  Send,
  CheckCircle2,
  MessageCircle,
  ExternalLink,
  ChevronDown,
} from 'lucide-react'

const contactInfo = [
  {
    icon: Phone,
    label: 'Call Us',
    value: '+91 81119 46664',
    sub: 'Available 24/7 for booking support',
    href: 'tel:+918111946664',
    actionText: 'Call now',
    color: 'text-[#047857]',
    bg: 'bg-[#047857]/10',
  },
  {
    icon: MessageCircle,
    label: 'WhatsApp',
    value: '+91 81119 46664',
    sub: 'Instant replies in under 5 minutes',
    href: 'https://wa.me/918111946664?text=Hi%20Zudo%20Cars,%20I%20have%20an%20inquiry',
    actionText: 'Chat on WhatsApp',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    icon: Mail,
    label: 'Email Us',
    value: 'hello@zudocars.com',
    sub: 'Detailed estimates & corporate quotes',
    href: 'mailto:hello@zudocars.com',
    actionText: 'Send email',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
  },
  {
    icon: MapPin,
    label: 'Main Hub',
    value: 'Kochi, Kerala',
    sub: 'JLN Stadium · Airport · Edapally',
    href: 'https://maps.google.com/?q=Kochi+Kerala',
    actionText: 'View on map',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
]

const topics = [
  'General Inquiry',
  'Booking Support',
  'Fleet Partnership',
  'Corporate Rentals',
  'Long-Term Hire',
  'Feedback',
]

const faqs = [
  {
    q: 'What documents are required to rent a car?',
    a: 'You will need an original valid Driving License and an ID proof (Aadhaar / Passport). International drivers require an International Driving Permit along with their passport.',
  },
  {
    q: 'How quickly will I get a response?',
    a: 'For urgent inquiries, our WhatsApp and phone lines respond in minutes. Email queries are answered within 2 to 4 business hours.',
  },
  {
    q: 'Can I cancel or modify my booking?',
    a: 'Yes, cancellations or modifications are hassle-free up to 6 hours before scheduled pickup time.',
  },
  {
    q: 'Do you provide airport pickup and drop-off?',
    a: 'Yes! We offer seamless handover at Cochin International Airport (COK) and Trivandrum Airport (TRV) with 24/7 terminal service.',
  },
]

export default function ContactPage() {
  const { hubs, error: hubError, loading: hubsLoading } = usePickupHubs()
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    topic: topics[0],
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [openFaq, setOpenFaq] = useState(0)

  const update = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      setSubmitted(true)
    }, 800)
  }

  return (
    <div className="rental-home contact-home">
      {/* Page Header */}
      <div className="contact-hero">
        <img className="contact-hero-image" src="https://www.motorbeam.com/wp-content/uploads/2018-Volkswagen-Virtus-Front-And-Side.jpg" alt="Volkswagen Virtus viewed from the front and side" fetchPriority="high" />
        <div className="contact-container">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#047857]/10 text-[#047857] border border-[#047857]/20">
              We're here to help
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight mb-3">
            Talk to us about your next drive.
          </h1>
          <p className="text-gray-500 text-sm sm:text-base max-w-2xl leading-relaxed">
            Have questions about booking a car, airport pickups, long-term rentals, or need immediate roadside support?
            Our friendly support team is reachable 24/7.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="contact-container">
        {/* Quick Contact Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-10 sm:mb-14">
          {contactInfo.map(({ icon: Icon, label, value, sub, href, actionText, color, bg }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith('http') ? '_blank' : undefined}
              rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="contact-card group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <span className="text-[11px] font-semibold text-gray-400 group-hover:text-[#047857] flex items-center gap-1 transition-colors">
                    {actionText} <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  {label}
                </p>
                <p className="text-base font-bold text-gray-900 mb-1 group-hover:text-[#047857] transition-colors">
                  {value}
                </p>
                <p className="text-xs text-gray-500 leading-relaxed">{sub}</p>
              </div>
            </a>
          ))}
        </div>

        {/* 2-Column Split: Form (Left) & Support Sidebar (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Contact Form (col-span-7) */}
          <div className="contact-form-panel lg:col-span-7 p-6 sm:p-8">
            {submitted ? (
              <div className="flex flex-col items-center justify-center text-center py-16 px-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-5 ring-8 ring-emerald-50/50">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Message Sent Successfully!</h3>
                <p className="text-gray-500 max-w-md mb-8 text-sm leading-relaxed">
                  Thank you for contacting us, <span className="font-semibold text-gray-800">{form.name.split(' ')[0] || 'there'}</span>.
                  A customer specialist will review your inquiry regarding <span className="font-medium text-gray-800">"{form.topic}"</span> and get in touch with you shortly at <span className="font-semibold text-gray-800">{form.email || form.phone}</span>.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false)
                    setForm({ name: '', email: '', phone: '', topic: topics[0], message: '' })
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#047857] hover:bg-[#065f46] text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-none"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1.5">
                    Send Us a Message
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Fill in your details below and our team will get back to you with all required assistance.
                  </p>
                </div>

                {/* Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={form.name}
                      onChange={update('name')}
                      className="w-full h-11 px-3.5 rounded-xl border border-gray-300 text-sm text-gray-900 placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#047857]/20 focus:border-[#047857] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 81119 46664"
                      value={form.phone}
                      onChange={update('phone')}
                      className="w-full h-11 px-3.5 rounded-xl border border-gray-300 text-sm text-gray-900 placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#047857]/20 focus:border-[#047857] transition-all"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. rahul@example.com"
                    value={form.email}
                    onChange={update('email')}
                    className="w-full h-11 px-3.5 rounded-xl border border-gray-300 text-sm text-gray-900 placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#047857]/20 focus:border-[#047857] transition-all"
                  />
                </div>

                {/* Topic Selector */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Inquiry Topic
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {topics.map((t) => (
                      <button
                        type="button"
                        key={t}
                        onClick={() => setForm((prev) => ({ ...prev, topic: t }))}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                          form.topic === t
                            ? 'bg-[#047857] border-[#047857] text-white shadow-sm shadow-none'
                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-[#047857] hover:text-[#047857]'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Your Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tell us your rental dates, preferred vehicle, pickup location, or any specific requirements..."
                    value={form.message}
                    onChange={update('message')}
                    className="w-full p-3.5 rounded-xl border border-gray-300 text-sm text-gray-900 placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#047857]/20 focus:border-[#047857] transition-all resize-none"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto min-w-[180px] h-12 flex items-center justify-center gap-2 bg-[#047857] hover:bg-[#065f46] text-white px-8 rounded-xl text-sm font-semibold transition-all shadow-md shadow-none disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <span>Sending message...</span>
                  ) : (
                    <>
                      <span>Send Message</span>
                      <Send className="w-4 h-4 ml-1" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Support & FAQs (col-span-5) */}
          <div className="lg:col-span-5 space-y-6">
            {/* WhatsApp Fast Support Card */}
            <div className="contact-support rounded-3xl p-6 sm:p-7 text-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Fast WhatsApp Booking</h3>
                  <p className="text-xs text-emerald-100">Live agents available now</p>
                </div>
              </div>
              <p className="text-xs text-emerald-50 leading-relaxed mb-5">
                Need an immediate rate estimate or car confirmation in Kochi or Trivandrum? Chat directly with our reservations desk.
              </p>
              <a
                href="https://wa.me/918111946664?text=Hi%20Zudo%20Cars,%20I%20would%20like%20to%20book%20a%20car"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-white hover:bg-emerald-50 text-emerald-800 font-bold text-xs sm:text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                Start WhatsApp Chat
              </a>
            </div>

            {/* Operating Hubs Card */}
            <div className="contact-panel p-6">
              <div className="flex items-center gap-2.5 mb-3.5">
                <MapPin className="w-5 h-5 text-[#047857]" />
                <h3 className="text-base font-bold text-gray-900">Kerala Hub Locations</h3>
              </div>
              <div className="space-y-2.5 text-xs text-gray-600">
                {hubsLoading && <p role="status">Loading locations...</p>}
                {hubError && <p role="alert">{hubError} Please contact our team for pickup details.</p>}
                {!hubsLoading && !hubError && hubs.length === 0 && <p>No pickup locations are available yet. Please contact our team.</p>}
                {hubs.map(hub => <div key={hub.id} className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="font-semibold text-gray-800">{hub.name}</span>
                  {hub.city && <p className="text-gray-500 mt-1">{hub.city}</p>}
                  {hub.address && <p className="text-gray-500 mt-1">{hub.address}</p>}
                </div>)}
              </div>
            </div>

            {/* Frequently Asked Questions */}
            <div className="contact-panel p-6">
              <h3 className="text-base font-bold text-gray-900 mb-4">
                Frequently Asked Questions
              </h3>
              <div className="space-y-3">
                {faqs.map((faq, index) => {
                  const isOpen = openFaq === index
                  return (
                    <div
                      key={faq.q}
                      className="border border-gray-100 rounded-2xl overflow-hidden transition-colors"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? -1 : index)}
                        className="w-full px-4 py-3.5 text-left flex items-center justify-between gap-3 text-xs font-semibold text-gray-800 hover:text-[#047857] transition-colors"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown
                          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${
                            isOpen ? 'rotate-180 text-[#047857]' : ''
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-3.5 pt-0 text-xs text-gray-500 leading-relaxed border-t border-gray-50">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
