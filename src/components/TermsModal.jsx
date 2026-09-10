import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  FileText,
  ShieldCheck,
  AlertTriangle,
  CreditCard,
  Fuel,
  Clock,
  CheckCircle2,
  Printer,
  ShieldAlert,
  AlertCircle,
  Phone,
  MessageCircle,
  Ban,
  Receipt,
  UserCheck,
  Sparkles,
  Info,
} from "lucide-react";

export default function TermsModal({ isOpen, onClose, initialSection = "all" }) {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    if (initialSection) {
      setActiveTab(initialSection);
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, initialSection]);

  if (!isOpen) return null;

  const sections = [
    {
      id: "booking",
      category: "booking",
      title: "BOOKING",
      badge: "Confirmation & Availability",
      icon: CheckCircle2,
      content: (
        <div className="space-y-2.5 text-sm text-slate-300">
          <ul className="list-disc pl-5 space-y-2 text-slate-300">
            <li>
              <strong className="text-white">Booking confirmation:</strong> Rs. 2,000 (non-refundable on cancellation, but transferable to a trip within 1 month)
            </li>
            <li>
              Please call us before booking to confirm car availability
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "deposit",
      category: "booking",
      title: "DEPOSIT (at pickup)",
      badge: "Refundable Security",
      icon: CreditCard,
      content: (
        <div className="space-y-3 text-sm text-slate-300">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
            <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700">
              <span className="text-xs text-slate-400 block mb-0.5">5-Seater</span>
              <span className="text-base font-bold text-cyan-400">Rs. 5,000</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700">
              <span className="text-xs text-slate-400 block mb-0.5">7-Seater</span>
              <span className="text-base font-bold text-cyan-400">Rs. 10,000</span>
            </div>
          </div>
          <ul className="list-disc pl-5 space-y-2 text-slate-300">
            <li>
              <strong className="text-white">5-seater:</strong> Rs. 5,000
            </li>
            <li>
              <strong className="text-white">7-seater:</strong> Rs. 10,000
            </li>
            <li>
              Pay <em className="text-cyan-300 font-semibold not-italic">deposit + total rent</em> at pickup
            </li>
            <li>
              Deposit refunded on the <em className="text-cyan-300 font-semibold not-italic">3rd working day</em> after return following standard inspection
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "timing",
      category: "policy",
      title: "TIMING",
      badge: "Office & Rates",
      icon: Clock,
      content: (
        <div className="space-y-2 text-sm text-slate-300">
          <ul className="list-disc pl-5 space-y-2 text-slate-300">
            <li>
              <strong className="text-white">24 hrs</strong> = calculated from your pickup time (time to time)
            </li>
            <li>
              Office Hours: <em className="text-emerald-400 font-semibold not-italic">8 AM – 8 PM</em>
            </li>
            <li>
              Late drop: <span className="text-amber-400 font-semibold">Rs. 300/hour</span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "documents",
      category: "policy",
      title: "DOCUMENTS NEEDED",
      badge: "Verification",
      icon: UserCheck,
      content: (
        <div className="space-y-2 text-sm text-slate-300">
          <ul className="list-disc pl-5 space-y-2 text-slate-300">
            <li>
              <strong className="text-white">Original Driving Licence</strong> (mandatory)
            </li>
            <li>
              <strong className="text-white">1 ID proof</strong> (Aadhar/PAN/Passport)
            </li>
            <li>
              Renter must be <em className="text-cyan-400 font-semibold not-italic">23+ yrs</em> and present in person to sign physical handover documents
            </li>
            <li>
              Car to be driven only by the person who booked it
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "fuel",
      category: "usage",
      title: "FUEL AND CAR CONDITION",
      badge: "Same-to-Same",
      icon: Fuel,
      content: (
        <div className="space-y-2 text-sm text-slate-300">
          <ul className="list-disc pl-5 space-y-2 text-slate-300">
            <li>Return with same fuel level</li>
            <li>Low fuel = charged | Extra fuel = not refunded</li>
            <li>Return car in same condition as received</li>
          </ul>
        </div>
      ),
    },
    {
      id: "not-allowed",
      category: "usage",
      title: "NOT ALLOWED",
      badge: "Strictly Prohibited",
      icon: Ban,
      content: (
        <div className="space-y-2.5 text-sm text-slate-300">
          <ul className="list-disc pl-5 space-y-2 text-slate-300">
            <li>Learning/training use</li>
            <li>Racing, rallies, competitive events</li>
            <li>
              Illegal transport of contraband, commercial goods, or unauthorized passengers <span className="text-rose-400 font-medium">(Violation = advance amount forfeited)</span>
            </li>
          </ul>
          <p className="text-xs text-rose-400 font-semibold bg-rose-950/40 border border-rose-800/40 rounded-lg p-2.5 mt-2">
            Violation Notice: Any breach of the above will result in the entire advance amount being forfeited.
          </p>
        </div>
      ),
    },
    {
      id: "not-refundable",
      category: "usage",
      title: "NOT REFUNDABLE",
      badge: "Trip Expenses",
      icon: Receipt,
      content: (
        <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 text-sm text-slate-300">
          <p className="text-slate-200 font-medium">
            Toll, parking, permit and interstate tax
          </p>
          <div className="flex flex-wrap gap-2 mt-2.5">
            {["Toll", "Parking", "Permit", "Interstate Tax"].map((item) => (
              <span key={item} className="px-2.5 py-1 text-xs rounded-lg bg-slate-700/70 text-slate-200 border border-slate-600 font-medium">
                {item}
              </span>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "damage-liability",
      category: "liability",
      title: "DAMAGE AND LIABILITY (AVS-POL-DDL-01)",
      badge: "Policy: AVS-POL-DDL-01",
      icon: AlertTriangle,
      content: (
        <div className="space-y-4 text-sm text-slate-300">
          <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/40 text-xs text-amber-200/90 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">Scope (Ref: AVS-POL-DDL-01):</strong> Applies to Four-Wheeler Rentals covering Damage, Downtime, and Insurance liability.
            </div>
          </div>

          <ul className="list-disc pl-5 space-y-1.5 text-slate-300 text-xs sm:text-sm">
            <li>Damage cost up to Rs. 10,000 – customer's responsibility</li>
            <li>Depreciation cost also borne by customer</li>
            <li>
              Max liability: <span className="text-amber-400 font-semibold">Capped at Rs. 50,000 (in eligible accident claims)</span>
            </li>
            <li>Accident towing charges – customer's responsibility</li>
            <li>Legal/criminal liability from negligent driving, drunk driving, traffic violations or accidents – customer's responsibility</li>
          </ul>

          {/* Downtime Charges Slab */}
          <div className="pt-2 space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              Section 1: Downtime Charges (Vehicle off-road repair slab)
            </h4>
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60 text-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400 text-[10px] uppercase tracking-wider font-semibold">
                      <th className="py-2.5 px-3">Vehicle Segment</th>
                      <th className="py-2.5 px-3 text-cyan-300">Up to 15 Days</th>
                      <th className="py-2.5 px-3 text-amber-300">15–30 Days</th>
                      <th className="py-2.5 px-3 text-rose-300">Above 30 Days</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans text-xs">
                    <tr className="hover:bg-slate-800/20">
                      <td className="py-2 px-3 text-white font-medium">Hatchbacks</td>
                      <td className="py-2 px-3 text-cyan-400 font-semibold">₹15,000</td>
                      <td className="py-2 px-3 text-amber-400 font-semibold">₹25,000</td>
                      <td className="py-2 px-3 text-rose-400 font-semibold">₹25,000 + ₹700/day</td>
                    </tr>
                    <tr className="hover:bg-slate-800/20">
                      <td className="py-2 px-3 text-white font-medium">Sedans</td>
                      <td className="py-2 px-3 text-cyan-400 font-semibold">₹20,000</td>
                      <td className="py-2 px-3 text-amber-400 font-semibold">₹35,000</td>
                      <td className="py-2 px-3 text-rose-400 font-semibold">₹35,000 + ₹900/day</td>
                    </tr>
                    <tr className="hover:bg-slate-800/20">
                      <td className="py-2 px-3 text-white font-medium">Premium Sedan / CSUV</td>
                      <td className="py-2 px-3 text-cyan-400 font-semibold">₹25,000</td>
                      <td className="py-2 px-3 text-amber-400 font-semibold">₹45,000</td>
                      <td className="py-2 px-3 text-rose-400 font-semibold">₹45,000 + ₹1,200/day</td>
                    </tr>
                    <tr className="hover:bg-slate-800/20">
                      <td className="py-2 px-3 text-white font-medium">SUV / MUV</td>
                      <td className="py-2 px-3 text-cyan-400 font-semibold">₹30,000</td>
                      <td className="py-2 px-3 text-amber-400 font-semibold">₹55,000</td>
                      <td className="py-2 px-3 text-rose-400 font-semibold">₹55,000 + ₹1,500/day</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Section 2: Customer Responsibility */}
          <div className="pt-2 space-y-1.5 text-xs text-slate-300">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Section 2: Customer Responsibility
            </h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>Return vehicle in the exact delivered condition.</li>
              <li>Customer is responsible for clearing damages or accidents incurred during the rental period.</li>
            </ul>
          </div>

          {/* Section 3: Insurance Processing & Cost Reductions */}
          <div className="pt-2 space-y-1.5 text-xs text-slate-300">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Section 3: Insurance Processing & Cost Reductions
            </h4>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-white">Claim threshold:</strong> Insurance claims will only be processed for damages costing more than ₹10,000.</li>
              <li><strong className="text-white">Customer-incurred costs during insurance processing:</strong> Loss of No-Claim Bonus (NCB), non-covered consumables, half-day rent for workshop duration, and towing/incidental charges.</li>
              <li><strong className="text-white">Maximum cap:</strong> Total customer-borne processing costs capped at <span className="text-amber-400 font-semibold">₹50,000</span>.</li>
            </ul>
          </div>

          {/* Section 4: Exclusions */}
          <div className="pt-2 space-y-1.5 text-xs">
            <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider">
              Section 4: Exclusions
            </h4>
            <div className="p-3 rounded-xl bg-rose-950/25 border border-rose-900/40 text-rose-200 leading-relaxed">
              <strong className="text-rose-100">Third-party damages:</strong> The company will not take up or be liable for any third-party damages.
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "fines",
      category: "liability",
      title: "FINES AND DEDUCTIONS",
      badge: "Security Deposit Withholding",
      icon: ShieldAlert,
      content: (
        <div className="space-y-3 text-sm text-slate-300">
          <p className="text-rose-300 text-xs sm:text-sm font-medium">
            The following are strictly not allowed. Any violation of these rules will result in your security deposit being withheld:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {[
              "Smoking inside the car",
              "Carrying pets/animals",
              "Alcohol consumption inside the car",
              "Overspeeding (above 80 km/hr)",
              "Late drop-off",
              "Food waste left inside the car",
            ].map((rule) => (
              <div key={rule} className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-950/25 border border-rose-900/40 text-xs text-rose-200">
                <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{rule}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 italic pt-1">
            Deduction amount will be communicated to you at the time of vehicle inspection.
          </p>
        </div>
      ),
    },
  ];

  const filteredSections = sections.filter((sec) => {
    const matchesCategory = activeTab === "all" || sec.category === activeTab || sec.id === activeTab;
    const matchesSearch =
      !searchQuery.trim() ||
      sec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sec.badge.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const modalContent = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md transition-opacity duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-modal-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 md:p-6 border-b border-slate-800 bg-slate-950/70 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2
                  id="terms-modal-title"
                  className="text-base sm:text-lg md:text-xl font-bold text-white tracking-tight uppercase"
                >
                  Terms and Conditions – Self Drive Rental
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  ZudoCars
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Thank you for choosing us! Please go through these quickly before your trip.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              title="Print Terms"
              aria-label="Print Terms"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors hidden sm:inline-flex cursor-pointer"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              aria-label="Close Terms modal"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Filter Tabs & Search Bar */}
        <div className="px-5 py-3 border-b border-slate-800 bg-slate-950/40 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto text-xs">
            {[
              { id: "all", label: "All Terms" },
              { id: "booking", label: "Booking & Deposit" },
              { id: "policy", label: "Timing & Docs" },
              { id: "usage", label: "Fuel & Rules" },
              { id: "liability", label: "Damage & Fines" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearchQuery("");
                }}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-48 flex-shrink-0">
            <input
              type="text"
              placeholder="Search terms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700/80 text-xs text-white placeholder-slate-400 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 md:p-6 overflow-y-auto overflow-x-hidden space-y-6 text-slate-300 divide-y divide-slate-800/70">
          {/* Notice banner */}
          <div className="bg-cyan-950/30 border border-cyan-800/40 rounded-xl p-4 text-xs text-cyan-200/90 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-cyan-300 uppercase tracking-wide">
                TERMS AND CONDITIONS – SELF DRIVE RENTAL
              </p>
              <p className="text-slate-300">
                Thank you for choosing us! Please go through these quickly before your trip.
              </p>
            </div>
          </div>

          {filteredSections.map((sec) => {
            const Icon = sec.icon;
            return (
              <section key={sec.id} className="pt-5 first:pt-0">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-md bg-slate-800 text-cyan-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-white text-sm sm:text-base tracking-wide">
                      {sec.title}
                    </h3>
                  </div>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400">
                    {sec.badge}
                  </span>
                </div>
                {sec.content}
              </section>
            );
          })}

          {filteredSections.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-sm">
              No matching terms found. Try clearing your search filter.
            </div>
          )}

          {/* Closing Contact Strip */}
          <div className="pt-5">
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/40 to-slate-900 border border-blue-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div>
                <p className="font-semibold text-white text-sm">Any questions? Just message us, happy to help!</p>
                <p className="text-slate-400 mt-0.5">Office Hours: 8 AM – 8 PM · Instant WhatsApp assistance</p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="https://wa.me/918111946664?text=Hi%20Zudo%20Cars,%20I%20have%20a%20question%20about%20the%20Self%20Drive%20Rental%20terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  WhatsApp
                </a>
                <a
                  href="tel:+918111946664"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Call
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-slate-800 bg-slate-950/70 flex-shrink-0">
          <span className="text-xs text-slate-300 text-center sm:text-left">
            By confirming your booking, you agree to the above terms.
          </span>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-sm font-semibold shadow-md active:scale-95 transition-all cursor-pointer text-center"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : modalContent;
}

