import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL || "";

const testimonials = [
  {
    quote:
      "The Cochin Airport pickup was effortless. The car was clean, ready, and exactly what we booked.",
    name: "Ananya Menon",
    detail: "Kochi to Munnar",
  },
  {
    quote:
      "We took the hairpin bends to Munnar without a single surprise charge. Honest billing makes a difference.",
    name: "Rahul Nair",
    detail: "Munnar road trip",
  },
  {
    quote:
      "Dropping the car in Kozhikode was just as simple as collecting it. Zudocars made the whole route feel easy.",
    name: "Meera Joseph",
    detail: "Alleppey to Kozhikode",
  },
];

const inputClass =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 pb-3 pt-6 text-sm text-slate-900 outline-none transition placeholder:text-transparent focus:border-teal-700 focus:ring-4 focus:ring-teal-700/10";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTestimonialIndex((current) => (current + 1) % testimonials.length);
    }, 5500);
    return () => window.clearInterval(timer);
  }, []);

  function validate() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return "Enter a valid email address.";
    }
    if (password.length < 6) return "Password must be at least 6 characters.";
    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      let responseData = { role: "user" };
      if (APPS_SCRIPT_URL) {
        const response = await fetch(APPS_SCRIPT_URL, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({
            action: "login",
            email: email.trim(),
            password,
          }),
        });
        if (!response.ok) throw new Error("Unable to reach the login service.");
        responseData = await response.json();
        if (responseData.success === false || responseData.error) {
          throw new Error(
            responseData.error || "Email or password is incorrect.",
          );
        }
      }

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem(
        "zudo_user",
        JSON.stringify({
          email: email.trim(),
          role: responseData.role || "user",
        }),
      );
      setSuccess(true);
      window.setTimeout(() => {
        const role = responseData.role || "user";
        navigate(role === "admin" || role === "staff" ? "/dashboard" : "/");
      }, 1100);
    } catch (submitError) {
      setError(
        submitError.message || "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7faf9] text-slate-900 lg:grid lg:grid-cols-[minmax(0,1.04fr)_minmax(480px,0.96fr)]">
      <section className="relative hidden min-h-screen overflow-hidden bg-[#0f1115] px-10 py-10 text-white lg:flex lg:flex-col xl:px-16">
        <div className="absolute inset-0 bg-[url('/images/Kerala.jpg')] bg-cover bg-center opacity-25" />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(15,17,21,0.98)_0%,rgba(15,17,21,0.78)_48%,rgba(15,17,21,0.96)_100%)]" />
        <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-teal-700/25 blur-3xl" />
        <div className="absolute -bottom-24 right-10 h-96 w-96 rounded-full bg-emerald-500/15 blur-3xl" />

        <BrandMark />
        <div className="relative z-10 mt-auto max-w-xl pb-8">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.28em] text-teal-300">
            Self-drive cars across Kerala
          </p>
          <h1 className="max-w-2xl text-5xl font-black leading-[1.03] tracking-tight xl:text-7xl">
            Your road starts here.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-white/65">
            Built for God&apos;s Own Country — from Kochi&apos;s city lanes to
            Munnar&apos;s hairpin bends. Clean cars, no hidden fees, and honest
            billing.
          </p>

          <div className="mt-12 min-h-[142px]">
            <div
              key={testimonialIndex}
              className="animate-[lg-float_0.45s_ease-out]"
            >
              <p className="max-w-lg text-lg font-medium leading-relaxed text-white/90">
                “{testimonials[testimonialIndex].quote}”
              </p>
              <p className="mt-4 text-sm font-semibold text-teal-300">
                {testimonials[testimonialIndex].name}
              </p>
              <p className="mt-1 text-xs text-white/45">
                {testimonials[testimonialIndex].detail}
              </p>
            </div>
            <div className="mt-7 flex gap-2">
              {testimonials.map((testimonial, index) => (
                <button
                  key={testimonial.name}
                  type="button"
                  aria-label={`Show testimonial ${index + 1}`}
                  onClick={() => setTestimonialIndex(index)}
                  className={`h-1.5 rounded-full transition-all ${index === testimonialIndex ? "w-10 bg-teal-400" : "w-2 bg-white/25"}`}
                />
              ))}
            </div>
          </div>

          <div className="mt-12 flex flex-wrap gap-3">
            {[
              "All 14 Districts Covered",
              "100% Self-Drive",
              "Zero Pushy Agents",
            ].map((badge) => (
              <span
                key={badge}
                className="rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-2 text-xs font-semibold text-white/70"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-8 sm:px-10">
        <div className="absolute -right-28 top-10 h-72 w-72 rounded-full bg-teal-100/70 blur-3xl" />
        <div className="absolute -bottom-28 left-0 h-72 w-72 rounded-full bg-emerald-100/70 blur-3xl" />
        <div className="relative z-10 w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <BrandMark dark />
          </div>
          <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_24px_80px_rgba(15,118,110,0.12)]">
            <div className="h-1.5 bg-gradient-to-r from-teal-800 via-emerald-500 to-teal-300" />
            {success ? (
              <div className="flex min-h-[480px] flex-col items-center justify-center px-8 text-center">
                <div className="animate-[lg-pop_0.45s_ease-out] rounded-full bg-teal-50 p-5 text-teal-700">
                  <ShieldCheck className="h-12 w-12" />
                </div>
                <h2 className="mt-6 text-2xl font-black">You&apos;re in.</h2>
                <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-500">
                  Your Zudocars account is ready. Taking you to the right road
                  now.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-7 sm:p-10">
                <div className="mb-9">
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-teal-700">
                    Welcome back
                  </p>
                  <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                    Sign in to Zudocars
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Your next Kerala drive is closer than you think.
                  </p>
                </div>

                <div className="space-y-5">
                  <FloatingField
                    label="Email address"
                    icon={Mail}
                    value={email}
                    onChange={setEmail}
                    type="email"
                    error={error && !email ? error : ""}
                  />
                  <FloatingField
                    label="Password"
                    icon={LockKeyhole}
                    value={password}
                    onChange={setPassword}
                    type={showPassword ? "text" : "password"}
                    error={error && email ? error : ""}
                    onKeyDown={(event) =>
                      setCapsLock(event.getModifierState("CapsLock"))
                    }
                    onKeyUp={(event) =>
                      setCapsLock(event.getModifierState("CapsLock"))
                    }
                    adornment={
                      <button
                        type="button"
                        onClick={() => setShowPassword((current) => !current)}
                        className="text-slate-400 transition hover:text-teal-700"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    }
                  />
                </div>
                {capsLock && (
                  <p className="mt-2 text-xs font-medium text-amber-700">
                    Caps Lock is on.
                  </p>
                )}

                <div className="mt-5 flex items-center justify-between gap-3 text-sm">
                  <label className="flex items-center gap-2 text-slate-500">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(event) => setRememberMe(event.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 accent-teal-700"
                    />
                    Remember me
                  </label>
                  <button
                    type="button"
                    className="font-semibold text-teal-700 hover:text-teal-900"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-800 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-900/20 transition hover:bg-teal-900 disabled:cursor-wait disabled:opacity-70"
                >
                  {loading ? (
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <>
                      Continue to your account{" "}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
                <p className="mt-6 text-center text-xs leading-relaxed text-slate-400">
                  By continuing, you agree to Zudocars&apos; honest billing and
                  booking terms.
                </p>
              </form>
            )}
          </div>
          <p className="mt-6 text-center text-xs text-slate-400">
            © 2026 Zudocars · Kochi, Kerala
          </p>
        </div>
      </section>
      <style>{`
        @keyframes lg-float { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes lg-shine { from { transform: translateX(-120%) } to { transform: translateX(120%) } }
        @keyframes lg-shake { 0%, 100% { transform: translateX(0) } 25% { transform: translateX(-5px) } 75% { transform: translateX(5px) } }
        @keyframes lg-drift { 0%, 100% { transform: translate3d(0, 0, 0) } 50% { transform: translate3d(0, -12px, 0) } }
        @keyframes lg-pop { from { opacity: 0; transform: scale(.8) } to { opacity: 1; transform: scale(1) } }
        @keyframes lg-progress { from { width: 0 } to { width: 100% } }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; scroll-behavior: auto !important; }
        }
      `}</style>
    </main>
  );
}

function BrandMark({ dark = false }) {
  return (
    <div className={`relative z-10 ${dark ? "text-slate-950" : "text-white"}`}>
      <p className="text-2xl font-black tracking-tight">
        Zudo<span className="font-medium text-cyan-400">cars</span>
      </p>
      <p
        className={`mt-1 text-[10px] font-bold uppercase tracking-[0.2em] ${dark ? "text-slate-400" : "text-white/45"}`}
      >
        Drive Kerala freely
      </p>
    </div>
  );
}

function FloatingField({
  label,
  icon: Icon,
  value,
  onChange,
  type,
  error,
  adornment,
  onKeyDown,
  onKeyUp,
}) {
  return (
    <label
      className={`relative block ${error ? "animate-[lg-shake_0.35s_ease-in-out]" : ""}`}
    >
      <Icon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition peer-focus:text-teal-700" />
      <input
        required
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        placeholder=" "
        className={`${inputClass} peer pl-12 ${adornment ? "pr-12" : ""} ${error ? "border-red-400 ring-4 ring-red-500/10" : ""}`}
      />
      <span className="pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 text-sm text-slate-400 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:text-[10px] peer-focus:font-bold peer-focus:uppercase peer-focus:tracking-wider peer-focus:text-teal-700 peer-not-placeholder-shown:top-3 peer-not-placeholder-shown:text-[10px] peer-not-placeholder-shown:font-bold peer-not-placeholder-shown:uppercase peer-not-placeholder-shown:tracking-wider">
        {label}
      </span>
      {adornment && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2">
          {adornment}
        </span>
      )}
      {error && (
        <span className="mt-1.5 block pl-2 text-xs font-medium text-red-600">
          {error}
        </span>
      )}
    </label>
  );
}
