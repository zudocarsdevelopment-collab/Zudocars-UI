import { useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  FileText,
  ShieldCheck,
  AlertTriangle,
  CreditCard,
  Fuel,
  Car,
  Clock,
  CheckCircle2,
  Printer,
} from "lucide-react";

export default function TermsModal({ isOpen, onClose }) {
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

  const sections = [
    {
      id: "eligibility",
      title: "1. Eligibility & Driver Verification",
      icon: ShieldCheck,
      content: (
        <div className="space-y-2 text-sm text-slate-300">
          <p>
            To rent and operate a ZudoCars vehicle, the primary renter and any authorized co-driver must meet the following criteria:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
            <li>
              <strong className="text-white">Minimum Age:</strong> The driver must be at least <span className="text-cyan-400 font-semibold">21 years of age</span> at the time of booking.
            </li>
            <li>
              <strong className="text-white">Driving License:</strong> Must possess an original, valid Indian Driving License (held for at least 1 year) or a valid International Driving Permit (IDP) alongside a domestic license. Learner licenses or expired permits are strictly not accepted.
            </li>
            <li>
              <strong className="text-white">Identity Proof:</strong> Submission of an original government-issued photo ID (Aadhaar Card, Passport, or Voter ID) is mandatory during pickup/delivery verification.
            </li>
            <li>
              <strong className="text-white">Authorized Driver Only:</strong> Only the verified individual registered in the booking is permitted to operate the vehicle. Sub-leasing or transferring custody to unverified individuals is strictly prohibited.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "deposit-payments",
      title: "2. Security Deposit & Payment Terms",
      icon: CreditCard,
      content: (
        <div className="space-y-2 text-sm text-slate-300">
          <p>
            All bookings must be confirmed through advance payment, and a refundable security deposit is mandatory for every vehicle dispatch:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
            <li>
              <strong className="text-white">Refundable Security Deposit:</strong> A refundable deposit (varying by car segment) is collected prior to or at vehicle delivery to safeguard against unforeseen damages, late fees, or unpaid tolls.
            </li>
            <li>
              <strong className="text-white">Deposit Refund Timeline:</strong> Following a clean vehicle return and inspection, the security deposit is processed and refunded within <span className="text-cyan-400 font-semibold">3 to 7 working days</span> back to your original payment method/bank account.
            </li>
            <li>
              <strong className="text-white">Payment Methods:</strong> We accept UPI, major credit/debit cards, and secure online net banking. Cash deposits must be pre-authorized by ZudoCars operations.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "usage-rules",
      title: "3. Vehicle Usage & Safe Driving Rules",
      icon: Car,
      content: (
        <div className="space-y-2 text-sm text-slate-300">
          <p>
            Renters must exercise due diligence, safety, and care when driving ZudoCars vehicles:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
            <li>
              <strong className="text-white">Lawful Operation:</strong> Vehicles must be operated strictly in adherence to the Indian Motor Vehicles Act and Kerala State Traffic Rules.
            </li>
            <li>
              <strong className="text-white">Zero Tolerance on Intoxication:</strong> Operating a vehicle under the influence of alcohol, narcotics, or intoxicating drugs is illegal and constitutes a fundamental breach. This results in immediate vehicle retrieval, forfeiture of security deposit, and police reporting.
            </li>
            <li>
              <strong className="text-white">Speed Regulations:</strong> Fleet vehicles are equipped with GPS telemetry for safety. Renters must respect posted highway speed limits (generally 80–100 km/h). Severe overspeeding triggers telematics alerts and safety penalties.
            </li>
            <li>
              <strong className="text-white">Prohibited Uses:</strong> Off-roading, commercial taxi usage, speed testing/racing, towing, carrying illegal or hazardous materials, or exceeding the registered passenger seating capacity is prohibited.
            </li>
            <li>
              <strong className="text-white">No Smoking Policy:</strong> All ZudoCars vehicles are 100% smoke-free. An interior sanitization and detailing penalty of up to ₹2,500 applies if smoke odor or residue is detected upon return.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "fuel-tolls",
      title: "4. Fuel Policy & FASTag / Tolls",
      icon: Fuel,
      content: (
        <div className="space-y-2 text-sm text-slate-300">
          <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
            <li>
              <strong className="text-white">Same-to-Same Fuel Policy:</strong> The vehicle is delivered with a recorded fuel level and must be returned with the same amount of fuel. If returned with less fuel, the renter is billed for the difference plus a nominal refueling service fee. No refund or cash credit is given for surplus fuel.
            </li>
            <li>
              <strong className="text-white">FASTag & Toll Charges:</strong> All vehicles come with active FASTag RFID tags. Toll fees, parking charges, and inter-state permit tariffs incurred during the rental trip are the hirer's responsibility and will be settled at drop-off or adjusted against the security deposit.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "extension-late",
      title: "5. Return, Extension & Late Charges",
      icon: Clock,
      content: (
        <div className="space-y-2 text-sm text-slate-300">
          <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
            <li>
              <strong className="text-white">Punctual Return:</strong> The vehicle must be returned to the agreed location at or before the scheduled booking end time.
            </li>
            <li>
              <strong className="text-white">Trip Extension:</strong> If you wish to extend your rental duration, requests must be submitted at least <span className="text-cyan-400 font-semibold">4 hours</span> before the drop-off time. Extensions are subject to vehicle availability and applicable extension rates.
            </li>
            <li>
              <strong className="text-white">Late Return Penalty:</strong> Unauthorized delays beyond a 30-minute grace period will be charged at the vehicle's standard hourly rate plus an additional late turnover surcharge for each delayed hour.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "insurance-accidents",
      title: "6. Insurance, Accidents & Damage Liability",
      icon: AlertTriangle,
      content: (
        <div className="space-y-2 text-sm text-slate-300">
          <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
            <li>
              <strong className="text-white">Comprehensive Insurance:</strong> All ZudoCars vehicles are covered under valid commercial vehicle insurance policies.
            </li>
            <li>
              <strong className="text-white">Accidental Damage Liability:</strong> In the event of minor accidental damage where terms and traffic laws were fully honored, customer financial liability is capped at the pre-agreed insurance deductible / deposit amount.
            </li>
            <li>
              <strong className="text-white">Negligence & Gross Violations:</strong> In cases of drunk driving, unauthorized drivers, intentional vandalism, or criminal negligence, the insurance cover becomes void, and the customer is 100% liable for all repair costs, downtime losses, and third-party liabilities.
            </li>
            <li>
              <strong className="text-white">Emergency Support:</strong> In case of an accident or breakdown, the renter must notify the ZudoCars 24/7 Roadside Assistance Team immediately before moving or repairing the vehicle.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "cancellation",
      title: "7. Cancellation & Refund Policy",
      icon: CheckCircle2,
      content: (
        <div className="space-y-2 text-sm text-slate-300">
          <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
            <li>
              <strong className="text-white">Full Refund:</strong> Cancellations made more than 24 hours prior to the scheduled pickup time are eligible for a 100% refund of the booking advance.
            </li>
            <li>
              <strong className="text-white">Late Cancellation:</strong> Cancellations made within 24 hours of the pickup window incur a cancellation fee equivalent to one day's rental or the advance deposit.
            </li>
            <li>
              <strong className="text-white">No-Show:</strong> Failure to turn up for the vehicle handover without prior communication will result in booking cancellation with zero refund of the advance amount.
            </li>
          </ul>
        </div>
      ),
    },
  ];

  const modalContent = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md transition-opacity duration-200"
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
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 md:p-6 border-b border-slate-800 bg-slate-950/60 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  id="terms-modal-title"
                  className="text-lg md:text-xl font-bold text-white tracking-tight"
                >
                  Terms & Conditions
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  ZudoCars
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Official self-drive rental terms, conditions & policy guidelines
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

        {/* Modal Scrollable Body */}
        <div className="p-5 md:p-6 overflow-y-auto space-y-6 text-slate-300 divide-y divide-slate-800/70">
          <div className="bg-cyan-950/30 border border-cyan-800/40 rounded-xl p-4 text-xs text-cyan-200/90 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <p>
              By accessing the ZudoCars platform, reserving a vehicle, or taking delivery of any car from our fleet across Kerala, you acknowledge and agree to comply with all terms stated herein.
            </p>
          </div>

          {sections.map((sec) => {
            const Icon = sec.icon;
            return (
              <section key={sec.id} className="pt-5 first:pt-0">
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className="p-1.5 rounded-md bg-slate-800 text-cyan-400">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-semibold text-white text-base">
                    {sec.title}
                  </h3>
                </div>
                {sec.content}
              </section>
            );
          })}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-800 bg-slate-950/70 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-sm font-semibold shadow-md active:scale-95 transition-all cursor-pointer"
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
