import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Car,
  ClipboardList,
  ExternalLink,
  History,
  Loader2,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";
import { FilterSelect, Toolbar } from "./Dashboard";
import {
  SCHEDULE_STATUS_COLORS,
  SCHEDULE_STATUS_LABELS,
  createMaintenanceSchedule,
  createServiceRecord,
  formatMaintenanceINR,
  fetchMaintenanceSchedules,
  fetchServiceRecords,
  fetchServiceTypes,
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

function LoadError({ message, onRetry }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
      <p className="text-sm font-semibold text-red-700">{message}</p>
      <button
        onClick={onRetry}
        className="mt-4 rounded-xl bg-red-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-800"
      >
        Retry
      </button>
    </div>
  );
}

function localDateValue() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

function MaintenanceEntryModal({ mode, cars, serviceTypes, onClose, onSave }) {
  const isSchedule = mode === "schedule";
  const [form, setForm] = useState({
    car: cars[0]?.id ?? "",
    serviceType: serviceTypes[0]?.id ?? "",
    dueDate: localDateValue(),
    dueOdometer: "",
    status: "scheduled",
    serviceDate: localDateValue(),
    odometerReading: "",
    serviceCenter: "",
    description: "",
    partsCost: "0",
    laborCost: "0",
    nextServiceDate: "",
    nextServiceOdometer: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSaving(true);
    const relatedFields = {
      car: Number(form.car),
      service_type: Number(form.serviceType),
    };
    const payload = isSchedule
      ? {
          ...relatedFields,
          due_date: form.dueDate,
          due_odometer: Number(form.dueOdometer),
          status: form.status,
          notes: form.notes,
        }
      : {
          ...relatedFields,
          service_date: form.serviceDate,
          odometer_reading: Number(form.odometerReading),
          service_center: form.serviceCenter.trim(),
          description: form.description.trim(),
          parts_cost: Number(form.partsCost) || 0,
          labor_cost: Number(form.laborCost) || 0,
          total_cost: (Number(form.partsCost) || 0) + (Number(form.laborCost) || 0),
          next_service_date: form.nextServiceDate || null,
          next_service_odometer: form.nextServiceOdometer
            ? Number(form.nextServiceOdometer)
            : null,
          notes: form.notes,
        };

    try {
      await onSave(mode, payload);
      onClose();
    } catch (saveError) {
      setError(saveError.message || "Unable to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/10";
  const fields = isSchedule
    ? [
        { key: "dueDate", label: "Due date", type: "date", required: true },
        { key: "dueOdometer", label: "Due odometer (km)", type: "number", required: true, min: 0 },
      ]
    : [
        { key: "serviceDate", label: "Service date", type: "date", required: true },
        { key: "odometerReading", label: "Odometer reading (km)", type: "number", required: true, min: 0 },
        { key: "serviceCenter", label: "Service centre", type: "text", required: true, wide: true },
        { key: "partsCost", label: "Parts cost (INR)", type: "number", min: 0, step: "0.01" },
        { key: "laborCost", label: "Labour cost (INR)", type: "number", min: 0, step: "0.01" },
        { key: "nextServiceDate", label: "Next service date", type: "date" },
        { key: "nextServiceOdometer", label: "Next service odometer (km)", type: "number", min: 0 },
        { key: "description", label: "Description", type: "text", wide: true },
      ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
      <form
        onSubmit={handleSubmit}
        className="my-auto w-full max-w-2xl rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-black text-slate-900">
              {isSchedule ? "Add service schedule" : "Log completed service"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {isSchedule
                ? "Create a maintenance item in the service queue."
                : "Add a completed visit to service history."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg px-2 py-1 text-xl leading-none text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            ×
          </button>
        </div>

        <div className="grid max-h-[70vh] gap-4 overflow-y-auto px-6 py-5 sm:grid-cols-2">
          <label className="text-xs font-bold text-slate-600">
            Vehicle
            <select
              required
              value={form.car}
              onChange={(event) => update("car", event.target.value)}
              className={inputClass}
            >
              <option value="" disabled>Select vehicle</option>
              {cars.map((car) => (
                <option key={car.id} value={car.id}>
                  {car.model || car.name} · {car.plateNumber}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-bold text-slate-600">
            Service type
            <select
              required
              value={form.serviceType}
              onChange={(event) => update("serviceType", event.target.value)}
              className={inputClass}
            >
              <option value="" disabled>Select service type</option>
              {serviceTypes.map((type) => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </label>

          {isSchedule && (
            <label className="text-xs font-bold text-slate-600">
              Status
              <select
                value={form.status}
                onChange={(event) => update("status", event.target.value)}
                className={inputClass}
              >
                {Object.entries(SCHEDULE_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>
          )}

          {fields.map(({ key, label, type, required, min, step, wide }) => (
            <label key={key} className={`text-xs font-bold text-slate-600 ${wide ? "sm:col-span-2" : ""}`}>
              {label}
              <input
                required={required}
                type={type}
                min={min}
                step={step}
                value={form[key]}
                onChange={(event) => update(key, event.target.value)}
                className={inputClass}
              />
            </label>
          ))}

          <label className="text-xs font-bold text-slate-600 sm:col-span-2">
            Notes
            <textarea
              rows={3}
              value={form.notes}
              onChange={(event) => update("notes", event.target.value)}
              className={inputClass}
            />
          </label>

          {(cars.length === 0 || serviceTypes.length === 0) && (
            <p className="text-xs font-medium text-amber-700 sm:col-span-2">
              Add at least one vehicle and service type before creating a record.
            </p>
          )}
          {error && <p role="alert" className="text-sm font-medium text-red-700 sm:col-span-2">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || cars.length === 0 || serviceTypes.length === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-800 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSchedule ? "Add to queue" : "Save service"}
          </button>
        </div>
      </form>
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
  const [recordError, setRecordError] = useState("");
  const [scheduleError, setScheduleError] = useState("");
  const [serviceTypes, setServiceTypes] = useState([]);
  const [entryMode, setEntryMode] = useState("");

  async function load() {
    setLoading(true);
    setRecordError("");
    setScheduleError("");
    let serviceTypeNames = new Map();
    try {
      const serviceTypes = await fetchServiceTypes();
      setServiceTypes(serviceTypes);
      serviceTypeNames = new Map(serviceTypes.map((type) => [type.id, type.name]));
    } catch {
      setServiceTypes([]);
      // Service records still load when the optional service-type lookup is unavailable.
    }

    const [scheduleResult, recordResult] = await Promise.allSettled([
      fetchMaintenanceSchedules(serviceTypeNames),
      fetchServiceRecords(serviceTypeNames),
    ]);

    if (scheduleResult.status === "fulfilled") {
      setSchedules(scheduleResult.value);
    } else {
      setSchedules([]);
      setScheduleError("Unable to load service schedules. Please try again.");
    }

    if (recordResult.status === "fulfilled") {
      setRecords(recordResult.value);
    } else {
      setRecords([]);
      setRecordError("Unable to load service records. Please try again.");
    }
    setLoading(false);
  }

  async function saveEntry(mode, payload) {
    if (mode === "schedule") {
      await createMaintenanceSchedule(payload);
    } else {
      await createServiceRecord(payload);
    }
    await load();
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SubNav active={subTab} onSelect={setSubTab} />
        <div className="flex gap-2">
          <button
            onClick={() => setEntryMode(subTab === "queue" ? "schedule" : "record")}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-800 px-3 py-2.5 text-sm font-bold text-white hover:bg-teal-900"
          >
            <Plus className="h-4 w-4" />
            {subTab === "queue" ? "Add schedule" : subTab === "history" ? "Log service" : "Log service"}
          </button>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-600 hover:border-teal-600 hover:text-teal-700 disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 text-sm font-semibold text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin text-teal-700" />
            Loading service data...
          </div>
        </div>
      ) : (
        <>
          {subTab === "queue" && (scheduleError ? (
            <LoadError message={scheduleError} onRetry={load} />
          ) : (
            <ServiceQueue cars={cars} schedules={schedules} />
          ))}
          {subTab === "history" && (
            recordError ? (
              <LoadError message={recordError} onRetry={load} />
            ) : (
              <ServiceHistory cars={cars} records={records} schedules={schedules} />
            )
          )}
          {subTab === "centres" && (
            recordError ? (
              <LoadError message={recordError} onRetry={load} />
            ) : (
              <ServiceCentres records={records} />
            )
          )}
        </>
      )}
      {entryMode && (
        <MaintenanceEntryModal
          mode={entryMode}
          cars={cars}
          serviceTypes={serviceTypes}
          onClose={() => setEntryMode("")}
          onSave={saveEntry}
        />
      )}
    </div>
  );
}