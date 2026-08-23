import { useEffect, useState } from "react";
import { X } from "lucide-react";

const initialForm = {
  seatingCapacity: "5 Seater (Sedan/Compact SUV)",
  pickupLocation: "",
  returnLocation: "",
  sameReturnLocation: true,
  pickupDateTime: "",
  returnDateTime: "",
  fullName: "",
  mobileNumber: "",
};

const inputClass =
  "mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10";

export default function EnquiryModal({ onClose }) {
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
      ...(field === "pickupLocation" && current.sameReturnLocation
        ? { returnLocation: value }
        : {}),
    }));
  }

  function handleSameReturnChange(checked) {
    setForm((current) => ({
      ...current,
      sameReturnLocation: checked,
      returnLocation: checked ? current.pickupLocation : current.returnLocation,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
    setForm(initialForm);
    window.setTimeout(onClose, 1800);
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="enquiry-form-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close enquiry form"
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
        >
          <X className="h-5 w-5" />
        </button>

        {submitted ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center px-6 py-12 text-center sm:px-12">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-3xl text-teal-700">
              ✓
            </div>
            <h2 className="text-2xl font-black text-slate-900">
              Enquiry received
            </h2>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-500">
              Thanks for choosing Zudocars. Our Kerala road team will contact
              you shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 sm:p-9">
            <div className="mb-7 pr-10">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">
                Zudocars · Kerala
              </p>
              <h2
                id="enquiry-form-title"
                className="mt-2 text-3xl font-black tracking-tight text-slate-900"
              >
                Enquiry Form
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Tell us about your trip and we&apos;ll help you find the right
                self-drive car.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
                Seating Capacity (Car Only)
                <select
                  value={form.seatingCapacity}
                  onChange={(event) =>
                    updateField("seatingCapacity", event.target.value)
                  }
                  className={inputClass}
                >
                  <option>4 Seater (Hatchback/Compact)</option>
                  <option>5 Seater (Sedan/Compact SUV)</option>
                  <option>7 Seater (MUV/Full-size SUV)</option>
                  <option>8+ Seater (Van/Tempo Traveller)</option>
                </select>
              </label>

              <label className="text-sm font-semibold text-slate-700">
                Pickup Location
                <input
                  required
                  type="text"
                  value={form.pickupLocation}
                  onChange={(event) =>
                    updateField("pickupLocation", event.target.value)
                  }
                  placeholder="Kochi, Munnar, or another pickup point"
                  className={inputClass}
                />
              </label>

              <div className="flex items-end pb-3 sm:justify-end">
                <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-600">
                  <input
                    type="checkbox"
                    checked={form.sameReturnLocation}
                    onChange={(event) =>
                      handleSameReturnChange(event.target.checked)
                    }
                    className="h-4 w-4 rounded border-slate-300 accent-teal-700"
                  />
                  Same return location
                </label>
              </div>

              {!form.sameReturnLocation && (
                <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
                  Return Location
                  <input
                    required
                    type="text"
                    value={form.returnLocation}
                    onChange={(event) =>
                      updateField("returnLocation", event.target.value)
                    }
                    placeholder="Where should the car be returned?"
                    className={inputClass}
                  />
                </label>
              )}

              <label className="text-sm font-semibold text-slate-700">
                Pickup Date &amp; Time
                <input
                  required
                  type="datetime-local"
                  value={form.pickupDateTime}
                  onChange={(event) =>
                    updateField("pickupDateTime", event.target.value)
                  }
                  className={inputClass}
                />
              </label>

              <label className="text-sm font-semibold text-slate-700">
                Return Date &amp; Time
                <input
                  required
                  type="datetime-local"
                  value={form.returnDateTime}
                  onChange={(event) =>
                    updateField("returnDateTime", event.target.value)
                  }
                  className={inputClass}
                />
              </label>

              <label className="text-sm font-semibold text-slate-700">
                Full Name
                <input
                  required
                  type="text"
                  value={form.fullName}
                  onChange={(event) =>
                    updateField("fullName", event.target.value)
                  }
                  placeholder="Your full name"
                  className={inputClass}
                />
              </label>

              <label className="text-sm font-semibold text-slate-700">
                Mobile Number
                <input
                  required
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  value={form.mobileNumber}
                  onChange={(event) =>
                    updateField(
                      "mobileNumber",
                      event.target.value.replace(/\D/g, ""),
                    )
                  }
                  placeholder="10-digit mobile number"
                  title="Enter a valid 10-digit mobile number"
                  className={inputClass}
                />
              </label>
            </div>

            <button
              type="submit"
              className="mt-7 w-full rounded-xl bg-teal-800 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-900/20 transition hover:bg-teal-900 focus:outline-none focus:ring-4 focus:ring-teal-600/20"
            >
              Submit Enquiry
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
