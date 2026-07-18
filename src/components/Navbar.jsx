import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X, Phone } from 'lucide-react'
import { cn } from '../lib/cn'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Cars', href: '/cars' },
  { label: 'Fleet', href: '/#fleet' },
  { label: 'About', href: '/#about' },
  { label: 'Testimonials', href: '/#testimonials' },
  { label: 'Contact', href: '/contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Track page scroll to tighten the bar height + deepen the shadow
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-black border-b',
        scrolled
          ? 'border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.6)] h-16 lg:h-20'
          : 'border-white/[0.06] h-20 lg:h-24'
      )}
    >
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-full">

          {/* Logo Brand Frame */}
          <Link to="/" className="flex items-center gap-3 group">
            <span className="text-2xl md:text-xl font-black text-white tracking-tight transition-colors">
              Zudo<span className="text-cyan-400 font-medium">cars</span>
            </span>
          </Link>

          {/* Center-Aligned Interactive Link Grid */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isRouterLink = link.href.startsWith('/')
              const LinkComponent = isRouterLink ? Link : 'a'

              return (
                <LinkComponent
                  key={link.label}
                  to={isRouterLink ? link.href : undefined}
                  href={!isRouterLink ? link.href : undefined}
                  className="relative px-4 py-2 text-sm font-semibold text-white/90 hover:text-white transition-colors duration-300 group"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-cyan-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                </LinkComponent>
              )
            })}
          </div>

          {/* Desktop Right Actions Utility Deck */}
          <div className="hidden lg:flex items-center gap-6">
            

            <a
              href="#booking"
              className="relative inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold tracking-wide hover:opacity-95 active:scale-[0.98] transition-all shadow-[0_4px_20px_rgba(37,99,235,0.35)]"
            >
              Book Now
            </a>
          </div>

          {/* Custom Hamburger Trigger Toggle */}
          <button
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            className="lg:hidden p-2.5 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white hover:bg-white/[0.12] transition-all"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Slide Panel Overlay */}
      <div
        className={cn(
          'lg:hidden overflow-hidden transition-all duration-300 bg-black border-b border-white/10',
          open ? 'max-h-[420px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        )}
      >
        <div className="px-4 py-6 space-y-2">
          {navLinks.map((link) => {
            const isRouterLink = link.href.startsWith('/')
            const LinkComponent = isRouterLink ? Link : 'a'

            return (
              <LinkComponent
                key={link.label}
                to={isRouterLink ? link.href : undefined}
                href={!isRouterLink ? link.href : undefined}
                onClick={() => setOpen(false)}
                className="block text-lg font-bold px-3 py-3 rounded-xl text-white hover:text-cyan-400 transition-all"
              >
                {link.label}
              </LinkComponent>
            )
          })}

          <div className="pt-4 border-t border-white/10 space-y-4">
           
            <a
              href="/#booking"
              onClick={() => setOpen(false)}
              className="block bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-5 py-3.5 rounded-xl text-base font-bold text-center shadow-[0_4px_15px_rgba(37,99,235,0.3)]"
            >
              Book Now
            </a>
          </div>
        </div>
      </div>
    </nav>
  )
}