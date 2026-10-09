import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Headphones } from 'lucide-react'
import TermsModal from './TermsModal'
import DamagePolicyModal from './DamagePolicyModal'
import './footer.css'

export default function Footer() {
  const [isTermsOpen, setIsTermsOpen] = useState(false)
  const [isDamagePolicyOpen, setIsDamagePolicyOpen] = useState(false)
  const [selectedTermSection, setSelectedTermSection] = useState('all')
  const openTerms = (section = 'all') => { setSelectedTermSection(section); setIsTermsOpen(true) }
  return <footer id="contact" className="zudo-footer">
    <div className="zudo-footer-inner">
      <div className="zudo-footer-grid">
        <nav className="footer-main-links" aria-label="Company links">
          <Link to="/about">About Zudo Cars</Link>
          <Link to="/contact">Corporate & long-term rentals</Link>
          <Link to="/#faq">FAQ</Link>
        </nav>
        <nav className="footer-pills" aria-label="Explore rentals">
          <Link to="/cars">Browse cars</Link>
          <Link to="/#fleet">Our fleet</Link>
          <Link to="/cars">Self-drive rentals</Link>
          <Link to="/contact">Long-term hire</Link>
          <Link to="/#">Rent a car in Kerala</Link>
        </nav>
        <nav className="footer-policy-links" aria-label="Rental policies">
          <button type="button" onClick={() => openTerms()}>Terms & conditions</button>
          <button type="button" onClick={() => openTerms('deposit')}>Security deposit policy</button>
          <button type="button" onClick={() => setIsDamagePolicyOpen(true)}>Damage & liability</button>
          <button type="button" onClick={() => openTerms('fines')}>Fines & deductions</button>
        </nav>
        <div className="footer-support">
          <Link className="footer-support-button" to="/contact"><Headphones size={17}/>Contact support</Link>
          <a className="footer-phone" href="tel:+918111946664">+91 81119 46664</a>
          <a className="footer-email" href="mailto:hello@zudocars.com">hello@zudocars.com</a>
          <Link className="footer-wordmark" to="/" aria-label="Zudo Cars home">ZUDO<span>CARS</span></Link>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Zudo Cars. All rights reserved.</p>
        <p>Self-drive car rentals across Kerala. Office hours: 8:00 AM – 8:00 PM. <button type="button" onClick={() => openTerms()}>Rental terms apply.</button></p>
      </div>
    </div>
    <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} initialSection={selectedTermSection}/>
    <DamagePolicyModal isOpen={isDamagePolicyOpen} onClose={() => setIsDamagePolicyOpen(false)}/>
  </footer>
}
