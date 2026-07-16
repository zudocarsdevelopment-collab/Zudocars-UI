import { useState } from 'react'
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2, MessageCircle, Globe, Link2, Share2 } from 'lucide-react'

const contactInfo = [
  {
    icon: Phone,
    label: 'Call Us',
    value: '+91 98765 43210',
    sub: 'Mon - Sun, 8am - 10pm',
  },
  {
    icon: Mail,
    label: 'Email Us',
    value: 'hello@zudocars.com',
    sub: "We'll respond within 24 hours",
  },
  {
    icon: MapPin,
    label: 'Visit Us',
    value: '4th Block, Koramangala',
    sub: 'Bengaluru, Karnataka 560034',
  },
  {
    icon: Clock,
    label: 'Working Hours',
    value: '8:00 AM - 10:00 PM',
    sub: 'Open all days of the week',
  },
]

const topics = ['General Inquiry', 'Booking Support', 'Fleet Partnership', 'Corporate Rentals', 'Feedback']

const faqs = [
  {
    q: 'How quickly will I get a response?',
    a: 'Our support team typically replies within a few hours, and always within 24 hours on business days.',
  },
  {
    q: 'Can I modify or cancel a booking?',
    a: 'Yes, bookings can be modified or cancelled from your account up to 6 hours before pickup, free of charge.',
  },
  {
    q: 'Do you offer corporate or long-term rentals?',
    a: 'Absolutely. Select "Corporate Rentals" above and our fleet team will reach out with custom pricing.',
  },
]

function FloatingField({ label, type = 'text', value, onChange, required = true, as = 'input' }) {
  const [focused, setFocused] = useState(false)
  const hasValue = value && value.length > 0
  const Component = as

  return (
    <div className="relative">
      <Component
        type={as === 'input' ? type : undefined}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required={required}
        rows={as === 'textarea' ? 5 : undefined}
        className={`peer w-full px-4 pt-5 pb-2 rounded-xl border text-sm text-gray-900 bg-white transition-colors focus:outline-none resize-none ${
          focused ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-200'
        }`}
      />
      <label
        className={`absolute left-4 transition-all pointer-events-none text-gray-400 ${
          focused || hasValue ? 'top-2 text-xs font-medium text-blue-600' : 'top-1/2 -translate-y-1/2 text-sm'
        }`}
      >
        {label}
      </label>
    </div>
  )
}

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', topic: topics[0], message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      setSubmitted(true)
    }, 900)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <span className="text-blue-600 text-sm font-semibold tracking-wide uppercase">Get In Touch</span>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-3 mb-3">Contact Zudo Cars</h1>
          <p className="text-gray-500 max-w-xl">
            Questions about a booking, our fleet, or a partnership? Our team is here to help — reach out and
            we'll get back to you quickly.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {/* Info cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
          {contactInfo.map(({ icon: Icon, label, value, sub }) => (
            <div
              key={label}
              className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300"
            >
              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
              <p className="text-base font-bold text-gray-900 mb-0.5">{value}</p>
              <p className="text-sm text-gray-400">{sub}</p>
            </div>
          ))}
        </div>

        <div className="lg:grid lg:grid-cols-[1fr_420px] lg:gap-10">
          {/* Left: form */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
            {submitted ? (
              <div className="flex flex-col items-center justify-center text-center py-16">
                <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-5">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Message sent</h3>
                <p className="text-gray-500 max-w-sm mb-6">
                  Thanks for reaching out, {form.name.split(' ')[0] || 'there'}. Our team will get back to you at{' '}
                  {form.email || 'your email'} shortly.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false)
                    setForm({ name: '', email: '', phone: '', topic: topics[0], message: '' })
                  }}
                  className="text-blue-600 font-semibold text-sm hover:text-blue-700 transition-colors"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Send us a message</h2>
                  <p className="text-sm text-gray-400">Fill out the form and we'll be in touch within 24 hours.</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <FloatingField label="Full name" value={form.name} onChange={update('name')} />
                  <FloatingField label="Phone number" type="tel" value={form.phone} onChange={update('phone')} required={false} />
                </div>

                <FloatingField label="Email address" type="email" value={form.email} onChange={update('email')} />

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">What's this about?</p>
                  <div className="flex flex-wrap gap-2">
                    {topics.map((t) => (
                      <button
                        type="button"
                        key={t}
                        onClick={() => setForm((prev) => ({ ...prev, topic: t }))}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                          form.topic === t
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <FloatingField label="Your message" as="textarea" value={form.message} onChange={update('message')} />

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-7 py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    'Sending...'
                  ) : (
                    <>
                      Send Message
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Right: map + social + faq */}
          <div className="mt-10 lg:mt-0 space-y-6">
            <div className="rounded-2xl border border-gray-100 overflow-hidden h-56 bg-gradient-to-br from-blue-50 to-gray-100 flex flex-col items-center justify-center text-center p-6">
              <MapPin className="w-8 h-8 text-blue-600 mb-3" />
              <p className="text-sm font-semibold text-gray-900">Zudo Cars HQ</p>
              <p className="text-sm text-gray-500">4th Block, Koramangala, Bengaluru</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <p className="text-sm font-bold text-gray-900 mb-4">Prefer to chat?</p>
              <a
                href="#"
                className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-colors mb-3"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">WhatsApp Support</p>
                  <p className="text-xs text-gray-400">Usually replies in minutes</p>
                </div>
              </a>
              <div className="flex items-center gap-3 pt-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Follow</p>
                <div className="flex items-center gap-2">
                  {[Globe, Link2, Share2].map((Icon, i) => (
                    <a
                      key={i}
                      href="#"
                      className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-blue-600 hover:text-white transition-colors"
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <p className="text-sm font-bold text-gray-900 mb-4">Quick answers</p>
              <div className="space-y-4">
                {faqs.map((f) => (
                  <div key={f.q} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                    <p className="text-sm font-semibold text-gray-900 mb-1">{f.q}</p>
                    <p className="text-sm text-gray-500 leading-relaxed">{f.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}