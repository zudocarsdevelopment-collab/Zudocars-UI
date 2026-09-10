import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  ArrowRight,
  Phone,
  Mail,
  Clock,
  MapPin,
  MessageCircle,
} from "lucide-react";
import TermsModal from "./TermsModal";
import DamagePolicyModal from "./DamagePolicyModal";

export default function Footer() {
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isDamagePolicyOpen, setIsDamagePolicyOpen] = useState(false);
  const [selectedTermSection, setSelectedTermSection] = useState("all");

  const openTerms = (sectionId = "all") => {
    setSelectedTermSection(sectionId);
    setIsTermsOpen(true);
  };

  return (
    <footer id="contact" className="bg-gray-950 text-gray-400 py-12 border-t border-gray-800 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Self-Drive Rental Terms & Conditions Highlights Card */}
        <div className="mb-12 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-800/70 to-slate-900/90 border border-slate-700/60 shadow-xl overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-700/50">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-white font-bold text-sm sm:text-base tracking-wide uppercase">
                    Self-Drive Rental Terms & Guidelines
                  </h4>
                  <span className="px-2 py-0.5 text-[10px] font-semibold uppercase rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                    Official
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 truncate">
                  Thank you for choosing ZudoCars! Please review these terms quickly before your trip.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => openTerms("all")}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-semibold transition-all shadow-md hover:shadow-cyan-500/20 active:scale-95 cursor-pointer flex-shrink-0 self-start sm:self-auto"
            >
              <span>View Full Terms & Conditions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 pt-5 text-xs">
            <button
              type="button"
              onClick={() => openTerms("booking")}
              className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 hover:border-cyan-500/40 text-left transition-colors cursor-pointer group min-w-0"
            >
              <span className="text-slate-400 block font-medium group-hover:text-cyan-300 transition-colors truncate">Booking Advance</span>
              <span className="text-white font-bold text-sm mt-0.5 block truncate">Rs. 2,000</span>
              <span className="text-[11px] text-slate-400 block mt-1 leading-snug">Non-refundable · Transferable (1 mo.)</span>
            </button>

            <button
              type="button"
              onClick={() => openTerms("deposit")}
              className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 hover:border-cyan-500/40 text-left transition-colors cursor-pointer group min-w-0"
            >
              <span className="text-slate-400 block font-medium group-hover:text-cyan-300 transition-colors truncate">Security Deposit</span>
              <span className="text-cyan-400 font-bold text-sm mt-0.5 block truncate">5-Str: ₹5,000 · 7-Str: ₹10,000</span>
              <span className="text-[11px] text-slate-400 block mt-1 leading-snug">Refunded on 3rd working day</span>
            </button>

            <button
              type="button"
              onClick={() => openTerms("policy")}
              className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 hover:border-cyan-500/40 text-left transition-colors cursor-pointer group min-w-0"
            >
              <span className="text-slate-400 block font-medium group-hover:text-cyan-300 transition-colors truncate">Timing & Office Hours</span>
              <span className="text-white font-bold text-sm mt-0.5 block truncate">8 AM – 8 PM</span>
              <span className="text-[11px] text-amber-400 block mt-1 leading-snug">Late drop: Rs. 300 / hr</span>
            </button>

            <button
              type="button"
              onClick={() => setIsDamagePolicyOpen(true)}
              className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 hover:border-amber-500/40 text-left transition-colors cursor-pointer group min-w-0"
            >
              <span className="text-slate-400 block font-medium group-hover:text-amber-300 transition-colors truncate">Damage & Liability</span>
              <span className="text-amber-400 font-bold text-sm mt-0.5 block truncate">Downtime Slabs & Cap</span>
              <span className="text-[11px] text-slate-400 block mt-1 leading-snug">Policy Ref: AVS-POL-DDL-01</span>
            </button>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">

          {/* Brand Column */}
          <div className="col-span-2 space-y-4">
            <Link to="/" className="inline-block text-2xl font-black text-white tracking-tight">
              Zudo<span className="text-cyan-400 font-medium">cars</span>
            </Link>
            <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
              Premium self-drive car rental service across Kerala. Simple reservations, transparent terms, and well-maintained fleet.
            </p>

            <div className="space-y-2 text-xs text-gray-300">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span>Office Hours: 8:00 AM – 8:00 PM</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <a href="tel:+918111946664" className="hover:text-white transition-colors">
                  +91 81119 46664
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <a href="mailto:hello@zudocars.com" className="hover:text-white transition-colors">
                  hello@zudocars.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span>Kochi, Kerala (JLN Stadium · Airport · Edapally)</span>
              </div>
            </div>
          </div>

          {/* Company Column */}
          <div className="col-span-1">
            <h4 className="text-gray-200 font-semibold text-xs tracking-wider uppercase mb-3.5">
              Company
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/cars" className="hover:text-white transition-colors">Our Fleet</Link>
              </li>
              <li>
                <a href="/#fleet" className="hover:text-white transition-colors">Vehicle Categories</a>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
              </li>
            </ul>
          </div>

          {/* Services Column */}
          <div className="col-span-1">
            <h4 className="text-gray-200 font-semibold text-xs tracking-wider uppercase mb-3.5">
              Services
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/cars" className="hover:text-white transition-colors">Self Drive Rental</Link>
              </li>
              <li>
                <Link to="/cars" className="hover:text-white transition-colors">Airport Delivery</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">Long Term Hire</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">Corporate Booking</Link>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div className="col-span-1">
            <h4 className="text-gray-200 font-semibold text-xs tracking-wider uppercase mb-3.5">
              Rental Terms
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => openTerms("all")}
                  className="hover:text-white text-left transition-colors cursor-pointer"
                >
                  Terms and Conditions
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openTerms("deposit")}
                  className="hover:text-white text-left transition-colors cursor-pointer"
                >
                  Security Deposit Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setIsDamagePolicyOpen(true)}
                  className="hover:text-white text-left transition-colors cursor-pointer flex items-center gap-1.5 group"
                >
                  <span className="group-hover:text-amber-300 transition-colors">Damage & Liability</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    Policy
                  </span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openTerms("fines")}
                  className="hover:text-white text-left transition-colors cursor-pointer"
                >
                  Fines & Deductions
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© 2026 ZudoCars. All rights reserved.</p>

          <div className="flex items-center gap-5">
            <a
              href="https://wa.me/918111946664?text=Hi%20Zudo%20Cars,%20I%20have%20an%20inquiry"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan-400 transition-colors inline-flex items-center gap-1.5 text-gray-400"
            >
              <MessageCircle className="w-4 h-4 text-emerald-500" />
              WhatsApp Support
            </a>
            <a href="tel:+918111946664" className="hover:text-white transition-colors">
              +91 81119 46664
            </a>
          </div>
        </div>

      </div>

      {/* Terms and Conditions Modal */}
      <TermsModal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
        initialSection={selectedTermSection}
      />

      {/* Detailed Damage, Downtime & Liability Policy Modal (AVS-POL-DDL-01) */}
      <DamagePolicyModal
        isOpen={isDamagePolicyOpen}
        onClose={() => setIsDamagePolicyOpen(false)}
      />
    </footer>
  );
}
