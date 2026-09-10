import { useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  FileText,
  ShieldAlert,
  AlertTriangle,
  Clock,
  Car,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Info,
  Phone,
  MessageCircle,
} from "lucide-react";

export default function DamagePolicyModal({ isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return;

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
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const downtimeSlabs = [
    {
      category: "Hatchbacks",
      examples: "Swift, i20, Tiago, Baleno",
      upTo15: "₹15,000",
      day15To30: "₹25,000",
      above30: "₹25,000 + ₹700/day",
    },
    {
      category: "Sedans",
      examples: "Dzire, Amaze, Etios, Aura",
      upTo15: "₹20,000",
      day15To30: "₹35,000",
      above30: "₹35,000 + ₹900/day",
    },
    {
      category: "Premium Sedan / CSUV",
      examples: "Creta, Seltos, City, Verna, Brezza",
      upTo15: "₹25,000",
      day15To30: "₹45,000",
      above30: "₹45,000 + ₹1,200/day",
    },
    {
      category: "SUV / MUV",
      examples: "Innova, Crysta, Hycross, Fortuner, XUV700",
      upTo15: "₹30,000",
      day15To30: "₹55,000",
      above30: "₹55,000 + ₹1,500/day",
    },
  ];

  const modalContent = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md transition-opacity duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="damage-policy-modal-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 md:p-6 border-b border-slate-800 bg-slate-950/80 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2
                  id="damage-policy-modal-title"
                  className="text-base sm:text-lg md:text-xl font-bold text-white tracking-tight uppercase"
                >
                  Damage, Downtime & Liability Policy
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  Ref: AVS-POL-DDL-01
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Applies to Four-Wheeler Rentals covering Damage, Downtime, and Insurance liability.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              title="Print Policy"
              aria-label="Print Policy"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors hidden sm:inline-flex cursor-pointer"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 md:p-6 overflow-y-auto overflow-x-hidden space-y-6 text-slate-300 divide-y divide-slate-800/70">
          {/* Document Scope Banner */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 flex items-start gap-3">
            <Info className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">Policy Scope & Governance</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">Official Document</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                This document defines the financial, operational, and insurance liabilities governing vehicle damages, workshop turnaround downtime, and customer responsibilities for self-drive vehicle hire under ZudoCars.
              </p>
            </div>
          </div>

          {/* Section 1: Downtime Charges */}
          <div className="pt-6 first:pt-0 space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-slate-800 text-amber-400">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-white text-base tracking-wide">
                Section 1: Downtime Charges (Vehicle off-road repair slab)
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              When a vehicle is placed off-road for accidental repairs, bodywork, or mechanical restoration due to incidents occurring during the rental tenure, downtime charges apply based on vehicle segment and garage turnover duration:
            </p>

            {/* Responsive Table / Cards */}
            <div className="border border-slate-700/80 rounded-xl overflow-hidden bg-slate-950/50">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse min-w-[560px]">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-300 uppercase text-[11px] tracking-wider font-semibold">
                      <th className="py-3 px-4">Vehicle Segment</th>
                      <th className="py-3 px-4 text-cyan-300">Up to 15 Days</th>
                      <th className="py-3 px-4 text-amber-300">15–30 Days</th>
                      <th className="py-3 px-4 text-rose-300">Above 30 Days</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                    {downtimeSlabs.map((slab) => (
                      <tr key={slab.category} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 px-4 font-sans font-medium text-white">
                          <div>{slab.category}</div>
                          <div className="text-[10px] text-slate-500 font-sans font-normal mt-0.5">{slab.examples}</div>
                        </td>
                        <td className="py-3.5 px-4 text-cyan-400 font-bold font-sans">{slab.upTo15}</td>
                        <td className="py-3.5 px-4 text-amber-400 font-bold font-sans">{slab.day15To30}</td>
                        <td className="py-3.5 px-4 text-rose-400 font-bold font-sans">{slab.above30}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 italic">
              * Off-road duration is calculated from the time of workshop check-in until the vehicle is certified roadworthy and returned to active fleet deployment.
            </p>
          </div>

          {/* Section 2: Customer Responsibility */}
          <div className="pt-6 space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-slate-800 text-blue-400">
                <Car className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-white text-base tracking-wide">
                Section 2: Customer Responsibility
              </h3>
            </div>
            <ul className="list-disc pl-5 space-y-2 text-sm text-slate-300">
              <li>
                <strong className="text-white">Delivery Condition:</strong> Renter must return the vehicle in the exact delivered physical and mechanical condition as received during handover inspection.
              </li>
              <li>
                <strong className="text-white">Clearance of Liabilities:</strong> The customer is solely responsible for clearing and settling all costs associated with damages, collisions, scratch repairs, dent removals, or accidental losses incurred during the booking window.
              </li>
            </ul>
          </div>

          {/* Section 3: Insurance Processing & Cost Reductions */}
          <div className="pt-6 space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-slate-800 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-white text-base tracking-wide">
                Section 3: Insurance Processing & Cost Reductions
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1 font-medium">Claim Eligibility Threshold</span>
                <span className="text-base font-bold text-cyan-400">Damages &gt; ₹10,000</span>
                <p className="text-xs text-slate-400 mt-1">
                  Insurance claims will only be processed for damages costing more than ₹10,000. Minor damages below ₹10,000 are settled directly by the customer.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1 font-medium">Customer-Borne Processing Cap</span>
                <span className="text-base font-bold text-emerald-400">Capped at ₹50,000</span>
                <p className="text-xs text-slate-400 mt-1">
                  Maximum liability for eligible insurance claims where safe driving rules were upheld is strictly capped at ₹50,000.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2 text-sm">
              <p className="text-white font-semibold text-xs uppercase tracking-wider">
                Customer-Incurred Costs During Insurance Processing:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-300">
                <li>Loss of company No-Claim Bonus (NCB) on vehicle commercial insurance policy.</li>
                <li>Non-covered workshop consumables, nuts/bolts, paint blending, clip sets, and depreciation components.</li>
                <li>Half-day rental fee for active workshop and inspection duration.</li>
                <li>Emergency towing, recovery vehicle transit, and incidental logistic expenses.</li>
              </ul>
            </div>
          </div>

          {/* Section 4: Exclusions */}
          <div className="pt-6 space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-rose-950/50 text-rose-400 border border-rose-800/40">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-white text-base tracking-wide">
                Section 4: Exclusions
              </h3>
            </div>

            <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/40 text-xs sm:text-sm text-rose-200/90 leading-relaxed">
              <p className="font-semibold text-rose-200 mb-1">Third-Party Damages Disclaimer:</p>
              <p>
                The company will not take up, process, or be held liable for any third-party damages, third-party bodily injuries, or third-party vehicle/property losses. Any legal, civil, or criminal liabilities arising from collisions or traffic violations are 100% the renter's personal responsibility.
              </p>
            </div>
          </div>

          {/* Support Strip */}
          <div className="pt-5">
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/40 to-slate-900 border border-blue-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div>
                <p className="font-semibold text-white text-sm">Need help or accident emergency support?</p>
                <p className="text-slate-400 mt-0.5">Contact 24/7 Roadside Assistance & Fleet Operations</p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="https://wa.me/918111946664?text=Hi%20Zudo%20Cars,%20I%20have%20an%20inquiry%20regarding%20Damage%20and%20Liability%20policy"
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
                  Call Support
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 border-t border-slate-800 bg-slate-950/80 flex-shrink-0">
          <span className="text-xs text-slate-400 hidden sm:inline">
            Official Policy Ref: AVS-POL-DDL-01
          </span>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-sm font-semibold shadow-md active:scale-95 transition-all cursor-pointer text-center"
          >
            I Understand & Acknowledge
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : modalContent;
}
