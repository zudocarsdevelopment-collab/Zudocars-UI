import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Car,
  ClipboardList,
  ExternalLink,
  History,
  Loader2,
  RefreshCw,
  Search,
} from "lucide-react";
import { FilterSelect, Toolbar } from "./Dashboard";
import {
  SCHEDULE_STATUS_COLORS,
  SCHEDULE_STATUS_LABELS,
  formatMaintenanceINR,
  loadMaintenanceData,
} from "../lib/maintenanceApi";

// Service Queue reads MaintenanceSchedule, Service History reads
// ServiceRecord, Service Centres is grouped from ServiceRecord.service_center.
// See src/lib/maintenanceApi.js for the fetch/mapping layer. Note the
// schema has no `priority` field on MaintenanceSchedule and no service
// centre on the schedule itself (only once a record is logged), so those
// columns are left out rather than shown as fake "—" placeholders.

const SUB_TABS = [
  { id: "queue", label: "Service Queue", icon: ClipboardList },
  { id: "history", label: "Service History", icon: History },
  { id: "centres", label: "Service Centres", icon: Building2 },
];

function EmptyState({ icon: Icon, title, hint }) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-10 text-center">
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

function SubNav({ active, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm sm:inline-flex">
      {SUB_TABS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onSelect(id)}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
            active === id
              ? "bg-teal-700 text-white shadow-sm"
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
          }`}
        >
          <Icon className="h-4 w-4" />
          {label}
        </button>
      ))}
    </div>
  );
}

function ServiceQueue({ cars, schedules }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const carsById = useMemo(() => {
    const map = new Map();
    cars.forEach((car) => map.set(car.id, car));
    return map;
  }, [cars]);

  const rows = useMemo(
    () =>
      schedules.map((s) => ({
        ...s,
        car: carsById.get(s.carId),
        statusLabel: SCHEDULE_STATUS_LABELS[s.status] || s.status,
      })),
    [schedules, carsById],
  );

  const statusOptions = useMemo(
    () => [...new Set(rows.map((row) => row.statusLabel).filter(Boolean))],
    [rows],
  );

  const filtered = rows.filter((row) => {
    const searchable = [
      row.car?.model,
      row.car?.name,
      row.car?.plateNumber,
      row.serviceTypeName,
    ]
      .join(" ")
      .toLowerCase();
    return (
      searchable.includes(query.toLowerCase()) &&
      (!statusFilter || row.statusLabel === statusFilter)
    );
  });

  return (
    <div className="space-y-5">
      <Toolbar
        title="Service Queue"
        subtitle="Live maintenance schedules from the Django maintenance API"
        query={query}
        setQuery={setQuery}
      >
        {statusOptions.length > 0 && (
          <FilterSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
            placeholder="All statuses"
          />
        )}
      </Toolbar>

      {rows.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No maintenance schedules yet"
          hint="Schedules created in Django admin will show up here."
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Search} title="No schedules match this search or filter" />
      ) : (
        <>
          <p className="text-xs font-semibold text-slate-400">
            Showing {filtered.length} of {rows.length} schedules
          </p>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="sticky top-0 z-10 bg-slate-50 text-xs uppercase tracking-wider text-slate-400">
                  <tr>
                    {["Vehicle", "Reg. No.", "Service", "Due Date", "Due Odometer", "Status"].map(
                      (heading) => (
                        <th key={heading} className="whitespace-nowrap px-4 py-4 font-bold">
                          {heading}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/70">
                      <td className="whitespace-nowrap px-4 py-4 font-black text-slate-800">
                        {row.car ? row.car.model || row.car.name : `Vehicle #${row.carId}`}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                        {row.car?.plateNumber || "—"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                        {row.serviceTypeName || "—"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-slate-600">{row.dueDate || "—"}</td>
                      <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                        {row.dueOdometer ? `${row.dueOdometer.toLocaleString("en-IN")} km` : "—"}
                      </td>
                      <td className="px-4 py-4">
                        <SchedulePill status={row.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-black text-slate-800">{value}</p>
    </div>
  );
}

function ServiceHistory({ cars, records, schedules }) {
  const [selectedId, setSelectedId] = useState(cars[0]?.id ?? null);
  const selected = cars.find((car) => car.id === selectedId) || cars[0];

  if (cars.length === 0) {
    return (
      <EmptyState
        icon={Car}
        title="No vehicles in the fleet yet"
        hint="Add vehicles under Fleet to start tracking service history."
      />
    );
  }

  const vehicleRecords = records
    .filter((r) => r.carId === selected?.id)
    .sort((a, b) => (b.serviceDate || "").localeCompare(a.serviceDate || ""));
  const lastService = vehicleRecords[0]?.serviceDate || "—";
  const nextServiceFromRecord = vehicleRecords[0]?.nextServiceDate;
  const nextScheduled = schedules
    .filter((s) => s.carId === selected?.id && s.dueDate)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0]?.dueDate;
  const nextService = nextServiceFromRecord || nextScheduled || "—";
  const totalCost = vehicleRecords.reduce((total, r) => total + r.totalCost, 0);

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm lg:max-h-[560px] lg:overflow-y-auto">
        {cars.map((car) => (
          <button
            key={car.id}
            onClick={() => setSelectedId(car.id)}
            className={`flex w-full flex-col rounded-xl px-4 py-3 text-left text-sm transition ${
              selected?.id === car.id
                ? "bg-teal-50 text-teal-800"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span className="font-bold">{car.model || car.name}</span>
            <span className="text-xs text-slate-400">{car.plateNumber}</span>
          </button>
        ))}
      </div>

      {selected && (
        <div className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-teal-700">
              {selected.plateNumber}
            </p>
            <h2 className="mt-1 text-xl font-black">{selected.model || selected.name}</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-4">
              <Stat
                label="Current mileage"
                value={selected.odometer ? `${selected.odometer.toLocaleString("en-IN")} km` : "—"}
              />
              <Stat label="Last service" value={lastService} />
              <Stat label="Next service" value={nextService} />
              <Stat label="Total service cost" value={formatMaintenanceINR(totalCost)} />
            </div>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-black">Service timeline</h3>
            {vehicleRecords.length === 0 ? (
              <div className="mt-5">
                <EmptyState
                  icon={History}
                  title="No service records yet"
                  hint="Records logged for this vehicle in Django admin will appear here."
                />
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                {vehicleRecords.map((r) => (
                  <div key={r.id} className="rounded-xl border border-slate-100 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold">{r.serviceTypeName || "Service"}</p>
                        <p className="text-xs text-slate-400">
                          {r.serviceDate || "—"} · {r.odometerReading.toLocaleString("en-IN")} km
                        </p>
                      </div>
                      <p className="text-sm font-black">{formatMaintenanceINR(r.totalCost)}</p>
                    </div>
                    <div className="mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
                      <p>Parts: {formatMaintenanceINR(r.partsCost)}</p>
                      <p>Labour: {formatMaintenanceINR(r.laborCost)}</p>
                      <p>Service centre: {r.serviceCenter}</p>
                      <p>
                        Next due:{" "}
                        {r.nextServiceDate ||
                          (r.nextServiceOdometer
                            ? `${r.nextServiceOdometer.toLocaleString("en-IN")} km`
                            : "—")}
                      </p>
                    </div>
                    {r.description && (
                      <p className="mt-2 text-xs text-slate-500">{r.description}</p>
                    )}
                    {r.notes && (
                      <p className="mt-1 text-xs text-slate-400">Notes: {r.notes}</p>
                    )}
                    {r.invoiceUrl && (
                      <a
                        href={r.invoiceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-900"
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> View invoice
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function ServiceCentres({ records }) {
  const centres = useMemo(() => {
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

  if (centres.length === 0) {
    return (
      <EmptyState
        icon={Building2}
        title="No service centres logged yet"
        hint="Each service record's centre name will roll up into a card here — turnaround time and quality score aren't in the schema yet."
      />
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {centres.map((entry) => (
        <div key={entry.centre} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-black">{entry.centre}</h3>
          <div className="mt-4 space-y-2 text-sm text-slate-600">
            <div className="flex justify-between">
              <span className="text-slate-400">Vehicles serviced</span>
              <span className="font-bold">{entry.vehiclesServiced}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Visits</span>
              <span className="font-bold">{entry.visits}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Avg. service cost</span>
              <span className="font-bold">{formatMaintenanceINR(entry.avgCost)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ServiceManagement({ cars = [] }) {
  const [subTab, setSubTab] = useState("queue");
  const [schedules, setSchedules] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SubNav active={subTab} onSelect={setSubTab} />
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-600 hover:border-teal-600 hover:text-teal-700 disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex min-h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 text-sm font-semibold text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin text-teal-700" />
            Loading service data...
          </div>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm font-semibold text-red-700">{error}</p>
          <button
            onClick={load}
            className="mt-4 rounded-xl bg-red-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-800"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {subTab === "queue" && <ServiceQueue cars={cars} schedules={schedules} />}
          {subTab === "history" && (
            <ServiceHistory cars={cars} records={records} schedules={schedules} />
          )}
          {subTab === "centres" && <ServiceCentres records={records} />}
        </>
      )}
    </div>
  );
}