const HeroSection = () => {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16 sm:px-8 lg:px-12">
      <section className="w-full max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 shadow-2xl shadow-blue-950/40 backdrop-blur-xl">
        <div className="grid gap-10 p-8 sm:p-10 lg:grid-cols-[1.15fr_0.85fr] lg:p-14">
          <div className="flex flex-col justify-center">
            <span className="mb-4 w-fit rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-200">
              Development in progress
            </span>
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Zudo Cars is getting ready for launch.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-300 sm:text-xl">
              We’re building an exciting new experience for car buyers and enthusiasts. This hero page is the first step while the full site is still being crafted.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#"
                className="rounded-full bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-400"
              >
                Stay updated
              </a>
              <a
                href="#"
                className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
              >
                Contact us
              </a>
            </div>
          </div>

          <div className="flex items-center justify-center rounded-2xl border border-white/10 bg-slate-950/70 p-6">
            <div className="w-full max-w-md rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/20 via-slate-900 to-slate-950 p-6 shadow-inner shadow-blue-500/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Current status</p>
                  <p className="mt-1 text-xl font-semibold text-white">Launching soon</p>
                </div>
                <div className="rounded-full bg-emerald-500/15 px-3 py-1 text-sm font-medium text-emerald-300">
                  Live build
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="h-3 w-full rounded-full bg-slate-800">
                  <div className="h-3 w-3/4 rounded-full bg-gradient-to-r from-blue-400 to-cyan-300"></div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm text-slate-400">Design</p>
                    <p className="mt-1 text-lg font-semibold text-white">In progress</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm text-slate-400">Development</p>
                    <p className="mt-1 text-lg font-semibold text-white">On track</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default HeroSection;
