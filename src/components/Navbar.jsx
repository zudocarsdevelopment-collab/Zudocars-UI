import { useState } from 'react'
import { Menu, X, Car, Phone } from 'lucide-react'
import { cn } from '../lib/cn'

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Fleet', href: '#fleet' },
  { label: 'About', href: '#about' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'Contact', href: '#contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <a href="#home" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              Zudo<span className="text-blue-600"> cars</span>
            </span>
          </a>

          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <a href="tel:+1234567890" className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors">
              <Phone className="w-4 h-4" />
              +1 (234) 567-890
            </a>
            <a
              href="#booking"
              className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/25"
            >
              Book Now
            </a>
          </div>

          <button
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            className="lg:hidden p-2 rounded-lg bg-black text-white hover:bg-gray-900 transition-colors"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          'lg:hidden overflow-hidden transition-all duration-300',
          open ? 'max-h-96 border-b border-gray-100' : 'max-h-0'
        )}
      >
        <div className="px-4 py-4 space-y-3 bg-white shadow-lg border-t border-gray-100">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block text-base font-bold text-gray-900 hover:text-blue-600 py-3 transition-colors"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#booking"
            className="block bg-blue-600 text-white px-5 py-3 rounded-xl text-base font-bold text-center hover:bg-blue-700 transition-colors mt-3"
          >
            Book Now
          </a>
        </div>
      </div>
    </nav>
  )
}
