import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Ban,
  Car,
  Clock,
  History,
  IndianRupee,
  Loader2,
  RefreshCw,
  Wrench,
} from "lucide-react";
import {
  SCHEDULE_STATUS_COLORS,
  SCHEDULE_STATUS_LABELS,
  formatMaintenanceINR,
  isSameMonth,
  loadMaintenanceData,
} from "../lib/maintenanceApi";

// Wired to the real Django maintenance app: ServiceType, ServiceRecord,
// MaintenanceSchedule (see src/lib/maintenanceApi.js). Two things that
// earlier drafts of this page assumed don't actually exist in that schema
// and are called out rather than faked:
//  - MaintenanceSchedule has no `priority` field
//  - There's no "vehicle currently under repair / unavailable" flag
//    anywhere (not on Vehicle, not on MaintenanceSchedule status choices).
// Both are noted inline below with what a small model addition would need.

function EmptyState({ icon: Icon, title, hint }) {
  return (
    <div className="flex min-h-[180px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-8 text-center">
      <span className="rounded-full bg-slate-50 p-3 text-slate-300">
        <Icon className="h-6 w-6" />
      </span>
      <p className="mt-3 text-sm font-bold text-slate-500">{title}</p>
      {hint && <p className="mt-1 max-w-xs text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

function SchedulePill({ status }) {
  if (!status) return <span className="text-xs text-slate-400">—</span>;
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${SCHEDULE_STATUS_COLORS[status] || "bg-slate-100 text-slate-600"}`}
    >
      {SCHEDULE_STATUS_LABELS[status] || status}
    </span>
  );
}

export default function Maintenance({ cars = [], onServices }) {
  const [schedules, setSchedules] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const carsById = useMemo(() => {
    const map = new Map();
    cars.forEach((car) => map.set(car.id, car));
    return map;
  }, [cars]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const { schedules: s, records: r } = await loadMaintenanceData();
      setSchedules(s);
      setRecords(r);
    } catch {
      setSchedules([]);
      setRecords([]);
      setError("Unable to load maintenance data. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const active = cars.filter((car) => car.active).length;
  const scheduledCount = schedules.filter((s) => s.status === "scheduled").length;
  const dueCount = schedules.filter((s) => s.status === "due").length;
  const overdueCount = schedules.filter((s) => s.status === "overdue").length;
  const costThisMonth = records
    .filter((r) => isSameMonth(r.serviceDate))
    .reduce((total, r) => total + r.totalCost, 0);
  const totalSpend = records.reduce((total, r) => total + r.totalCost, 0);

  const cards = [
    { label: "Total Vehicles", value: cars.length, sub: `${active} active in fleet`, icon: Car },
    { label: "Scheduled", value: scheduledCount, sub: "Upcoming, not yet due", icon: Clock },
    { label: "Due", value: dueCount, sub: "Due now", icon: Wrench },
    { label: "Overdue", value: overdueCount, sub: "Past due date", icon: AlertTriangle },
    { label: "Cost This Month", value: formatMaintenanceINR(costThisMonth), sub: "From logged service records", icon: IndianRupee },
    { label: "Total Spend", value: formatMaintenanceINR(totalSpend), sub: "All service records", icon: History },
  ];

  const statusBreakdown = ["scheduled", "due", "overdue", "completed", "cancelled"].map(
    (status) => ({
      status,
      count: schedules.filter((s) => s.status === status).length,
    }),
  );
  const maxStatusCount = Math.max(1, ...statusBreakdown.map((s) => s.count));

  const costByVehicle = useMemo(() => {
    const totals = new Map();
    records.forEach((r) => {
      totals.set(r.carId, (totals.get(r.carId) || 0) + r.totalCost);
    });
    return [...totals.entries()]
      .map(([carId, cost]) => ({ car: carsById.get(carId), carId, cost }))
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 6);
  }, [records, carsById]);
  const maxVehicleCost = Math.max(1, ...costByVehicle.map((v) => v.cost));

  const costByMonth = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        label: d.toLocaleDateString("en-IN", { month: "short" }),
        total: 0,
      });
    }
    const byKey = new Map(months.map((m) => [m.key, m]));
    records.forEach((r) => {
      if (!r.serviceDate) return;
      const d = new Date(r.serviceDate);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const bucket = byKey.get(key);
      if (bucket) bucket.total += r.totalCost;
    });
    return months;
  }, [records]);
  const maxMonthCost = Math.max(1, ...costByMonth.map((m) => m.total));

  const centrePerformance = useMemo(() => {
    const byCentre = new Map();
    records.forEach((r) => {
      const key = r.serviceCenter || "Unknown";
      if (!byCentre.has(key)) byCentre.set(key, { centre: key, cars: new Set(), cost: 0, visits: 0 });
      const entry = byCentre.get(key);
      entry.cars.add(r.carId);
      entry.cost += r.totalCost;
      entry.visits += 1;
    });
    return [...byCentre.values()]
      .map((entry) => ({
        centre: entry.centre,
        vehiclesServiced: entry.cars.size,
        avgCost: entry.cost / entry.visits,
        visits: entry.visits,
      }))
      .sort((a, b) => b.visits - a.visits);
  }, [records]);

  const overdueList = schedules
    .filter((s) => s.status === "overdue")
    .sort((a, b) => (a.dueDate || "").localeCompare(b.dueDate || ""))
    .slice(0, 6);
  const upcomingList = schedules
    .filter((s) => s.status === "due" || s.status === "scheduled")
    .sort((a, b) => (a.dueDate || "").localeCompare(b.dueDate || ""))
    .slice(0, 6);
  const recentActivity = [...records]
    .sort((a, b) => (b.serviceDate || "").localeCompare(a.serviceDate || ""))
    .slice(0, 6);

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 text-sm font-semibold text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin text-teal-700" />
          Loading maintenance data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm font-semibold text-red-700">{error}</p>
        <button
          onClick={load}
          className="mt-4 rounded-xl bg-red-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-800"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <div className="flex justify-end">
        <button
          onClick={load}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-600 hover:border-teal-600 hover:text-teal-700"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(({ label, value, sub, icon: Icon }, index) => (
          <div
            key={label}
            className="db-reveal rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-500">{label}</p>
              <span className="rounded-xl bg-teal-50 p-2.5 text-teal-700">
                <Icon className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-5 text-2xl font-black text-slate-800">{value}</p>
            <p className="mt-1 text-xs text-slate-400">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-black">Maintenance cost over time</h2>
          <p className="mt-1 text-sm text-slate-400">Last 6 months, from service records</p>
          {totalSpend === 0 ? (
            <div className="mt-5">
              <EmptyState icon={IndianRupee} title="No cost history yet" hint="Populates once service records are logged." />
            </div>
          ) : (
            <div className="mt-8 flex h-40 items-end gap-3">
              {costByMonth.map((m) => (
                <div key={m.key} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-32 w-full items-end">
                    <div
                      className="w-full rounded-t-lg bg-teal-600"
                      style={{ height: `${Math.max(4, (m.total / maxMonthCost) * 100)}%` }}
                      title={formatMaintenanceINR(m.total)}
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">{m.label}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-black">Service status distribution</h2>
          <p className="mt-1 text-sm text-slate-400">Across all maintenance schedules</p>
          {schedules.length === 0 ? (
            <div className="mt-5">
              <EmptyState icon={Wrench} title="No maintenance schedules yet" />
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {statusBreakdown.map(({ status, count }) => (
                <div key={status}>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span>{SCHEDULE_STATUS_LABELS[status]}</span>
                    <span>{count}</span>
                  </div>
                  <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-teal-600"
                      style={{ width: `${(count / maxStatusCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-black">Cost by vehicle</h2>
          <p className="mt-1 text-sm text-slate-400">Top spend, all time</p>
          {costByVehicle.length === 0 ? (
            <div className="mt-5">
              <EmptyState icon={Car} title="No per-vehicle cost data yet" />
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {costByVehicle.map(({ car, carId, cost }) => (
                <div key={carId}>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span>{car ? `${car.model || car.name} · ${car.plateNumber}` : `Vehicle #${carId}`}</span>
                    <span>{formatMaintenanceINR(cost)}</span>
                  </div>
                  <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-teal-600"
                      style={{ width: `${(cost / maxVehicleCost) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-black">Service centre performance</h2>
          <p className="mt-1 text-sm text-slate-400">Visits and average cost per centre</p>
          {centrePerformance.length === 0 ? (
            <div className="mt-5">
              <EmptyState
                icon={History}
                title="No service centre data yet"
                hint="Turnaround time and repeat-issue tracking aren't in the schema yet — service_center is just a text field on ServiceRecord today."
              />
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {centrePerformance.map((entry) => (
                <div
                  key={entry.centre}
                  className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-bold">{entry.centre}</p>
                    <p className="text-xs text-slate-400">
                      {entry.vehiclesServiced} vehicle{entry.vehiclesServiced === 1 ? "" : "s"} · {entry.visits} visit{entry.visits === 1 ? "" : "s"}
                    </p>
                  </div>
                  <p className="text-sm font-black">{formatMaintenanceINR(entry.avgCost)} avg</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-black">Overdue services</h2>
            {onServices && (
              <button onClick={onServices} className="text-sm font-bold text-teal-700">
                View all
              </button>
            )}
          </div>
          {overdueList.length === 0 ? (
            <div className="mt-5">
              <EmptyState icon={AlertTriangle} title="Nothing overdue" />
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {overdueList.map((s) => {
                const car = carsById.get(s.carId);
                return (
                  <div key={s.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-4 py-3">
                    <div>
                      <p className="text-sm font-bold">{car ? `${car.model || car.name} · ${car.plateNumber}` : `Vehicle #${s.carId}`}</p>
                      <p className="text-xs text-slate-400">{s.serviceTypeName || "Service"} · due {s.dueDate || "—"}</p>
                    </div>
                    <SchedulePill status={s.status} />
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-black">Upcoming services</h2>
            {onServices && (
              <button onClick={onServices} className="text-sm font-bold text-teal-700">
                View all
              </button>
            )}
          </div>
          {upcomingList.length === 0 ? (
            <div className="mt-5">
              <EmptyState icon={Clock} title="No upcoming services scheduled" />
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {upcomingList.map((s) => {
                const car = carsById.get(s.carId);
                return (
                  <div key={s.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-4 py-3">
                    <div>
                      <p className="text-sm font-bold">{car ? `${car.model || car.name} · ${car.plateNumber}` : `Vehicle #${s.carId}`}</p>
                      <p className="text-xs text-slate-400">{s.serviceTypeName || "Service"} · due {s.dueDate || "—"}</p>
                    </div>
                    <SchedulePill status={s.status} />
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-black">Cars currently under repair</h2>
          <div className="mt-5">
            <EmptyState
              icon={Ban}
              title="Not tracked yet"
              hint="Neither Vehicle nor MaintenanceSchedule has an in-progress/unavailable flag today. Add e.g. is_available on Vehicle, or an 'in_progress' status choice, to populate this."
            />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-black">Recent service activity</h2>
          {recentActivity.length === 0 ? (
            <div className="mt-5">
              <EmptyState icon={History} title="No recent activity" />
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {recentActivity.map((r) => {
                const car = carsById.get(r.carId);
                return (
                  <div key={r.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-4 py-3">
                    <div>
                      <p className="text-sm font-bold">{car ? `${car.model || car.name} · ${car.plateNumber}` : `Vehicle #${r.carId}`}</p>
                      <p className="text-xs text-slate-400">{r.serviceTypeName || "Service"} · {r.serviceDate || "—"}</p>
                    </div>
                    <p className="text-sm font-black">{formatMaintenanceINR(r.totalCost)}</p>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}