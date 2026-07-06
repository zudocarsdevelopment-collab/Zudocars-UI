import { useEffect, useRef, useState } from "react";
import { Search, Car, Check, ArrowRight, Flag } from "lucide-react";

const steps = [
  {
    num: 1,
    icon: <Search className="w-6 h-6" />,
    title: "Search Cars",
    desc: "Browse our extensive fleet and find your perfect match",
  },
  {
    num: 2,
    icon: <Car className="w-6 h-6" />,
    title: "Choose",
    desc: "Select your vehicle based on preferences and budget",
  },
  {
    num: 3,
    icon: <Check className="w-6 h-6" />,
    title: "Book & Confirm",
    desc: "Complete your reservation with instant confirmation",
  },
  {
    num: 4,
    icon: <ArrowRight className="w-6 h-6" />,
    title: "Pickup & Drive",
    desc: "Collect your keys and hit the road",
  },
];

const LOOP_DURATION = 6000; // ms for one full Search -> Drive lap
const PAUSE_AT_END = 600; // ms the car rests at step 4 before restarting

export default function HowItWorks() {
  const sectionRef = useRef(null);
  const [inView, setInView] = useState(false);
  const [progress, setProgress] = useState(0); // 0 -> 1 across the whole journey
  const [activeStep, setActiveStep] = useState(0);
  const rafRef = useRef(null);
  const startRef = useRef(null);

  // Only animate while the section is actually visible, so it doesn't run forever off-screen.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion) {
      setProgress(1);
      setActiveStep(steps.length - 1);
      return;
    }

    if (!inView) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    const cycle = LOOP_DURATION + PAUSE_AT_END;

    const tick = (timestamp) => {
      if (startRef.current === null) startRef.current = timestamp;
      const elapsed = (timestamp - startRef.current) % cycle;

      const clamped =
        elapsed >= LOOP_DURATION ? 1 : elapsed / LOOP_DURATION;

      // ease in/out so the car gently accelerates away from each stop
      const eased =
        clamped < 0.5
          ? 2 * clamped * clamped
          : 1 - Math.pow(-2 * clamped + 2, 2) / 2;

      setProgress(eased);
      setActiveStep(
        Math.min(steps.length - 1, Math.floor(eased * steps.length))
      );

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      startRef.current = null;
    };
  }, [inView]);

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="relative overflow-hidden bg-white py-20"
    >
      <style>{`
        @keyframes hiw-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .hiw-car-bounce { animation: hiw-bounce 0.6s ease-in-out infinite; }
        .hiw-node {
          transition: transform 0.45s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.45s ease, background-color 0.45s ease;
        }
        .hiw-badge {
          transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1), background-color 0.4s ease, color 0.4s ease, border-color 0.4s ease;
        }
        .hiw-card {
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        @media (prefers-reduced-motion: reduce) {
          .hiw-car-bounce { animation: none !important; }
          .hiw-node, .hiw-badge, .hiw-card { transition: none !important; }
        }
      `}</style>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-[#2411ce]">
            Simple Process
          </span>
          <h2 className="mb-4 mt-3 text-4xl font-bold text-gray-900">
            How It Works
          </h2>
          <p className="mx-auto max-w-2xl text-gray-600">
            Get on the road in four easy steps
          </p>
        </div>

        <div className="relative grid gap-x-8 gap-y-16 md:grid-cols-4">
          {/* Track line */}
          <div className="absolute left-[12%] right-[12%] top-12 hidden h-1 overflow-visible rounded-full bg-gray-100 md:block">
            {/* Filled progress */}
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#220eda] to-red-400"
              style={{
                width: `${progress * 100}%`,
                transition: "width 0.1s linear",
              }}
            />

            {/* The car driving along the line */}
            <div
              className="hiw-car-bounce absolute -top-[18px] -ml-5"
              style={{
                left: `${progress * 100}%`,
                transition: "left 0.1s linear",
              }}
            >
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg ring-2 ring-[#E53E3E]">
                <Car className="h-5 w-5 text-[#3c24c4]" strokeWidth={2.5} />
              </div>
              {/* exhaust / motion puffs */}
              <span className="absolute right-full top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-red-200 opacity-70" />
              <span className="absolute right-[140%] top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-red-100 opacity-50" />
            </div>

            {/* Finish flag at the end of the line */}
            <Flag className="absolute -top-[14px] -right-2 h-4 w-4 text-gray-300" />
          </div>

          {steps.map((step, index) => {
            const isActive = index <= activeStep && progress > 0;
            const isCurrent = index === activeStep && progress < 1;

            return (
              <div key={step.num} className="relative text-center">
                <div className="relative z-10">
                  <div
                    className={`hiw-node relative mx-auto mb-6 h-24 w-28 ${
                      isCurrent ? "scale-110" : "scale-100"
                    }`}
                  >
                    {/* Car-shaped badge */}
                    <svg
                      viewBox="0 0 120 80"
                      className={`h-full w-full drop-shadow-md transition-colors duration-500 ${
                        isActive ? "text-[#573ee5]" : "text-gray-200"
                      }`}
                    >
                      <ellipse cx="60" cy="68" rx="46" ry="4" className="fill-black/10" />
                      <path
                        d="M10 50 C10 40 20 33 33 31 L46 18 C51 13 60 10 70 10 L88 10 C98 10 106 14 111 21 L118 32 C123 33 128 38 128 45 L128 50 C128 55 124 58 119 58 L14 58 C9 58 9 54 9 50 Z"
                        fill="currentColor"
                        className={isActive ? "shadow-lg" : ""}
                      />
                      <path
                        d="M50 14 L70 14 L84 31 L42 31 Z"
                        className={isActive ? "fill-white/25" : "fill-white/60"}
                      />
                      <circle cx="33" cy="58" r="11" className="fill-gray-900" />
                      <circle cx="33" cy="58" r="4.5" className="fill-gray-500" />
                      <circle cx="98" cy="58" r="11" className="fill-gray-900" />
                      <circle cx="98" cy="58" r="4.5" className="fill-gray-500" />
                      <ellipse
                        cx="120"
                        cy="38"
                        rx="3.5"
                        ry="2.5"
                        className={isActive ? "fill-[#FFD166]" : "fill-white"}
                      />
                    </svg>

                    {/* Step icon riding inside the windshield */}
                    <div
                      className={`absolute left-1/2 top-[28%] -translate-x-1/2 -translate-y-1/2 transition-colors duration-500 ${
                        isActive ? "text-white" : "text-gray-400"
                      }`}
                    >
                      {step.icon}
                    </div>
                  </div>

                  <div
                    className={`hiw-badge -mt-2 mb-4 mx-auto flex h-8 w-8 items-center justify-center rounded-full border-2 bg-white text-sm font-bold shadow-md ${
                      isActive
                        ? "border-[#3e57e5] text-[#8c3ee5]"
                        : "border-gray-200 text-gray-400"
                    } ${isCurrent ? "scale-125" : "scale-100"}`}
                  >
                    {step.num}
                  </div>
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-600">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}