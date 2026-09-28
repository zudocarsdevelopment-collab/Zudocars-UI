// Client for the Maintenance Django app (ServiceType, ServiceRecord,
// MaintenanceSchedule). Follows the same pattern as the Vehicles/Estimates
// APIs in Dashboard.jsx: an env override with a default path, confirmed
// against the live endpoints:
//   /api/service-types/  -> ServiceType
//   /api/services/       -> ServiceRecord
//   /api/schedules/      -> MaintenanceSchedule
// Override any of them with the matching VITE_* env var if they ever move.
export const SERVICE_TYPES_API_URL =
  import.meta.env.VITE_SERVICE_TYPES_API_URL ||
  "https://api.zudocars.com/api/service-types/";
export const SERVICE_RECORDS_API_URL =
  import.meta.env.VITE_SERVICE_RECORDS_API_URL ||
  "https://api.zudocars.com/api/services/";
export const MAINTENANCE_SCHEDULES_API_URL =
  import.meta.env.VITE_MAINTENANCE_SCHEDULES_API_URL ||
  "https://api.zudocars.com/api/schedules/";

const API_ORIGIN = (() => {
  try {
    return new URL(SERVICE_RECORDS_API_URL).origin;
  } catch {
    return "";
  }
})();

// DRF's default ModelSerializer serializes a ForeignKey as just the related
// PK, but some setups nest it (e.g. `depth = 1`, or a custom serializer).
// These helpers work either way so the UI doesn't break if that changes.
function relatedId(value) {
  if (value && typeof value === "object") return value.id ?? null;
  return value ?? null;
}
function relatedName(value, fallbackMap) {
  if (value && typeof value === "object") return value.name ?? null;
  if (value == null) return null;
  return fallbackMap?.get(value) ?? null;
}

async function readJson(response) {
  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }
  const data = await response.json();
  // DRF pagination wraps results in { results: [...] }; plain ViewSets
  // return the array directly. Handle both.
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

export async function fetchServiceTypes() {
  const response = await fetch(SERVICE_TYPES_API_URL);
  const rows = await readJson(response);
  return rows.map((t) => ({
    id: t.id,
    name: t.name || "—",
    description: t.description || "",
    active: t.is_active ?? true,
  }));
}

export function mapMaintenanceSchedule(s, serviceTypeNames) {
  return {
    id: s.id,
    carId: relatedId(s.car),
    serviceTypeId: relatedId(s.service_type),
    serviceTypeName: relatedName(s.service_type, serviceTypeNames),
    dueDate: s.due_date || null,
    dueOdometer: s.due_odometer ?? null,
    // 'scheduled' | 'due' | 'overdue' | 'completed' | 'cancelled'
    status: s.status || null,
    notes: s.notes || "",
  };
}

export async function fetchMaintenanceSchedules(serviceTypeNames) {
  const response = await fetch(MAINTENANCE_SCHEDULES_API_URL);
  const rows = await readJson(response);
  return rows.map((s) => mapMaintenanceSchedule(s, serviceTypeNames));
}

export function mapServiceRecord(r, serviceTypeNames) {
  const invoice = r.invoice || null;
  return {
    id: r.id,
    carId: relatedId(r.car),
    serviceTypeId: relatedId(r.service_type),
    serviceTypeName: relatedName(r.service_type, serviceTypeNames),
    serviceDate: r.service_date || null,
    odometerReading: Number(r.odometer_reading) || 0,
    serviceCenter: r.service_center || "—",
    description: r.description || "",
    partsCost: Number(r.parts_cost) || 0,
    laborCost: Number(r.labor_cost) || 0,
    totalCost: Number(r.total_cost) || 0,
    invoiceUrl: invoice
      ? invoice.startsWith("http")
        ? invoice
        : `${API_ORIGIN}${invoice.startsWith("/") ? "" : "/"}${invoice}`
      : null,
    nextServiceDate: r.next_service_date || null,
    nextServiceOdometer: r.next_service_odometer ?? null,
    notes: r.notes || "",
    createdAt: r.created_at || null,
  };
}

export async function fetchServiceRecords(serviceTypeNames) {
  const response = await fetch(SERVICE_RECORDS_API_URL);
  const rows = await readJson(response);
  return rows.map((r) => mapServiceRecord(r, serviceTypeNames));
}

async function postJson(url, payload) {
  const readCsrfToken = () => {
    const cookie = document.cookie
      .split(";")
      .map((value) => value.trim())
      .find((value) => value.startsWith("csrftoken="));
    return cookie ? decodeURIComponent(cookie.slice("csrftoken=".length)) : "";
  };

  let csrfToken = readCsrfToken();
  if (!csrfToken) {
    await fetch(url, { credentials: "include" });
    csrfToken = readCsrfToken();
  }

  const response = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(csrfToken ? { "X-CSRFToken": csrfToken } : {}),
    },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      data.detail || data.error || data.message || JSON.stringify(data) ||
        `Request failed (${response.status})`,
    );
  }
  return data;
}

export function createMaintenanceSchedule(payload) {
  return postJson(MAINTENANCE_SCHEDULES_API_URL, payload);
}

export function createServiceRecord(payload) {
  return postJson(SERVICE_RECORDS_API_URL, payload);
}

// Loads all three collections together, building the service-type
// id→name lookup first so FK-as-PK responses can still show a name.
export async function loadMaintenanceData() {
  const serviceTypes = await fetchServiceTypes();
  const serviceTypeNames = new Map(serviceTypes.map((t) => [t.id, t.name]));
  const [schedules, records] = await Promise.all([
    fetchMaintenanceSchedules(serviceTypeNames),
    fetchServiceRecords(serviceTypeNames),
  ]);
  return { serviceTypes, schedules, records };
}

export const SCHEDULE_STATUS_LABELS = {
  scheduled: "Scheduled",
  due: "Due",
  overdue: "Overdue",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const SCHEDULE_STATUS_COLORS = {
  scheduled: "bg-slate-100 text-slate-600",
  due: "bg-amber-50 text-amber-700",
  overdue: "bg-red-50 text-red-600",
  completed: "bg-teal-50 text-teal-700",
  cancelled: "bg-slate-100 text-slate-400",
};

const CURRENCY = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
export const formatMaintenanceINR = (value) => CURRENCY.format(Number(value) || 0);

export function isSameMonth(dateString, reference = new Date()) {
  if (!dateString) return false;
  const d = new Date(dateString);
  return (
    d.getFullYear() === reference.getFullYear() &&
    d.getMonth() === reference.getMonth()
  );
}