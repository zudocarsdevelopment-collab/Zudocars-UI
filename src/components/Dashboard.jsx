import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  BarChart3,
  Bell,
  CalendarDays,
  Car,
  Check,
  Edit3,
  Fuel,
  Gauge,
  Loader2,
  LogOut,
  MapPin,
  Menu,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
  Users,
  X,
  XCircle,
} from "lucide-react";

const APPS_SCRIPT_URL =
  import.meta.env.VITE_APPS_SCRIPT_URL || "YOUR_APPS_SCRIPT_URL_HERE";
const HAS_API_URL = APPS_SCRIPT_URL !== "YOUR_APPS_SCRIPT_URL_HERE";

// Live fleet feed. Vehicles are always read from here, regardless of
// whether the legacy Apps Script backend (bookings/staff/writes) is configured.
const VEHICLES_API_URL =
  import.meta.env.VITE_VEHICLES_API_URL ||
  "https://api.zudocars.com/api/vehicles/";

const CURRENCY = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const formatINR = (value) => CURRENCY.format(Number(value) || 0);

const fallbackCars = [
  {
    id: "car-1",
    externalId: "1",
    plateNumber: "KL07DD8525",
    name: "Alto",
    model: "Alto K10 PETROL MT",
    category: "Alto K10 PETROL MT",
    subCategory: "—",
    year: 2024,
    seats: 5,
    transmission: "Manual",
    fuel: "Petrol",
    bodyType: "Hatchback",
    vehicleType: "Car",
    bookingType: "Hourly (Min)",
    hourlyRate: 50,
    minHoursRate: 1200,
    fastagCharge: 305,
    price: 1200,
    locationBase: "JLN stadium",
    locationCurrent: "",
    rating: 4.8,
    features: "Hatchback, Petrol, Manual",
    image: "",
    active: true,
  },
  {
    id: "car-2",
    externalId: "2",
    plateNumber: "KL07DD9911",
    name: "Creta",
    model: "Creta Diesel AT",
    category: "Creta Diesel AT",
    subCategory: "—",
    year: 2023,
    seats: 5,
    transmission: "Automatic",
    fuel: "Diesel",
    bodyType: "SUV",
    vehicleType: "Car",
    bookingType: "Hourly (Min)",
    hourlyRate: 120,
    minHoursRate: 2800,
    fastagCharge: 305,
    price: 2800,
    locationBase: "Kochi",
    locationCurrent: "",
    rating: 4.9,
    features: "SUV, Diesel, Automatic",
    image: "",
    active: true,
  },
];
const fallbackBookings = [
  {
    id: "BK-0001",
    customerName: "Ananya Menon",
    phone: "9876543210",
    vehicle: "Hyundai Creta",
    pickup: "Cochin Airport",
    dropoff: "Munnar",
    amount: 11200,
    status: "Pending",
    assignedEmail: "",
  },
  {
    id: "BK-0002",
    customerName: "Rahul Nair",
    phone: "9847012345",
    vehicle: "Maruti Baleno",
    pickup: "Kochi",
    dropoff: "Alleppey",
    amount: 5400,
    status: "Approved",
    assignedEmail: "staff@zudocars.com",
  },
];
const fallbackStaff = [
  {
    id: "staff-1",
    name: "Arjun Thomas",
    role: "staff",
    status: "Approved",
    department: "Fleet Operations",
    phone: "9895001122",
    email: "staff@zudocars.com",
    employeeId: "ZC-ST-001",
  },
  {
    id: "staff-2",
    name: "Nisha Varma",
    role: "staff",
    status: "Pending",
    department: "Customer Success",
    phone: "9895002233",
    email: "nisha@zudocars.com",
    employeeId: "ZC-ST-002",
  },
];
const blankCar = {
  name: "",
  model: "",
  category: "",
  subCategory: "",
  plateNumber: "",
  year: "",
  seats: 5,
  transmission: "Automatic",
  fuel: "Petrol",
  bodyType: "Hatchback",
  vehicleType: "Car",
  bookingType: "Hourly (Min)",
  hourlyRate: "",
  minHoursRate: "",
  fastagCharge: "",
  locationBase: "",
  price: "",
  rating: 4.8,
  features: "",
  image: "",
  active: true,
};

// Normalizes a raw record from the vehicles API into the shape the dashboard uses.
function mapVehicle(v) {
  const transmission =
    String(v.transmission || "").toUpperCase() === "MANUAL"
      ? "Manual"
      : String(v.transmission || "").toUpperCase() === "AUTOMATIC"
        ? "Automatic"
        : v.transmission || "—";
  const hourlyRate = Number(v.hourly_rate) || 0;
  const minHoursRate = Number(v.min_hours_rate) || 0;
  return {
    id: v.id ?? v.external_id,
    externalId: v.external_id,
    plateNumber: v.plate_number || "—",
    name: (v.category || "").split(" ")[0] || v.category || "Vehicle",
    model: v.category || "",
    category: v.category || "",
    subCategory: v.sub_category && v.sub_category !== "—" ? v.sub_category : "",
    year: v.year || "",
    odometer: Number(v.odometer) || 0,
    seats: Number(v.seats) || 0,
    transmission,
    fuel: v.fuel_type || "—",
    bodyType: v.body_type || "—",
    vehicleType: v.vehicle_type || "Car",
    bookingType: v.booking_type || "",
    hourlyRate,
    minHoursRate,
    fastagCharge: Number(v.fastag_charge) || 0,
    // Used wherever the UI needs a single headline price.
    price: minHoursRate || hourlyRate,
    locationBase: v.location_base || "—",
    locationCurrent: v.location_current || "",
    image: v.photo_url || v.vehicle_image || "",
    dateAdded: v.date_added || "",
    rating: 4.8,
    active: true,
    features: [v.body_type, v.fuel_type, transmission].filter(Boolean).join(", "),
    _raw: v,
  };
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [tab, setTab] = useState("overview");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("");
  const [carModal, setCarModal] = useState(null);
  const [staffModal, setStaffModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [adminPrompt, setAdminPrompt] = useState(null);
  const isAdmin = currentUser?.role === "admin";

  useEffect(() => {
    const stored =
      localStorage.getItem("zudo_user") || sessionStorage.getItem("zudo_user");
    if (!stored) {
      navigate("/login", { replace: true });
      return;
    }
    try {
      setCurrentUser(JSON.parse(stored));
    } catch {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (!currentUser) return;
    let mounted = true;
    async function loadData() {
      setLoading(true);
      setError("");
      try {
        const [carData, bookingData, staffData] = await Promise.all([
          getFleet(),
          getBookings(),
          getStaff(),
        ]);
        if (!mounted) return;
        setCars(listFrom(carData, ["cars", "vehicles"], fallbackCars));
        const allBookings = listFrom(
          bookingData,
          ["bookings", "data"],
          fallbackBookings,
        );
        setBookings(
          currentUser.role === "staff"
            ? allBookings.filter(
                (booking) => booking.assignedEmail === currentUser.email,
              )
            : allBookings,
        );
        setStaff(
          listFrom(staffData, ["users", "staff", "data"], fallbackStaff),
        );
      } catch (loadError) {
        if (!mounted) return;
        setError(loadError.message || "Unable to load dashboard data.");
        setCars(fallbackCars);
        setBookings(
          currentUser.role === "staff"
            ? fallbackBookings.filter(
                (booking) => booking.assignedEmail === currentUser.email,
              )
            : fallbackBookings,
        );
        setStaff(fallbackStaff);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, [currentUser]);

  const pendingBookings = bookings.filter(
    (booking) => String(booking.status).toLowerCase() === "pending",
  ).length;
  const pendingStaff = staff.filter(
    (member) => String(member.status).toLowerCase() === "pending",
  ).length;

  // Fleet now sits above Bookings and is visible to every signed-in role;
  // only admins get the add/edit/delete controls inside the tab itself.
  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "fleet", label: "Fleet", icon: Car },
    {
      id: "bookings",
      label: "Bookings",
      icon: CalendarDays,
      badge: pendingBookings,
    },
    ...(isAdmin
      ? [
          {
            id: "staff",
            label: "Staff Directory",
            icon: Users,
            badge: pendingStaff,
          },
        ]
      : []),
  ];

  function guarded(actionName, callback) {
    const key = sessionStorage.getItem("zudo_admin_key");
    if (key) {
      callback(key);
      return;
    }
    setAdminPrompt({ actionName, callback });
  }
  async function write(actionName, payload, after) {
    setAction(actionName);
    setError("");
    try {
      await postAction(actionName, payload);
      after();
    } catch (writeError) {
      setError(writeError.message || `Unable to complete ${actionName}.`);
    } finally {
      setAction("");
    }
  }
  function updateBookingStatus(booking, status) {
    guarded(`update booking ${booking.id}`, () =>
      write("updateBookingStatus", { bookingId: booking.id, status }, () =>
        setBookings((items) =>
          items.map((item) =>
            item.id === booking.id ? { ...item, status } : item,
          ),
        ),
      ),
    );
  }
  function assignBooking(booking, assignedEmail) {
    guarded(`assign booking ${booking.id}`, () =>
      write("assignBooking", { bookingId: booking.id, assignedEmail }, () =>
        setBookings((items) =>
          items.map((item) =>
            item.id === booking.id ? { ...item, assignedEmail } : item,
          ),
        ),
      ),
    );
  }
  function saveCar(car) {
    const actionName = car.id ? "updateCar" : "addCar";
    guarded(actionName, () =>
      write(actionName, car, () => {
        setCars((items) =>
          car.id
            ? items.map((item) => (item.id === car.id ? car : item))
            : [{ ...car, id: `car-${Date.now()}` }, ...items],
        );
        setCarModal(null);
      }),
    );
  }
  function toggleCar(car) {
    guarded("updateCar", () =>
      write("updateCar", { ...car, active: !car.active }, () =>
        setCars((items) =>
          items.map((item) =>
            item.id === car.id ? { ...item, active: !item.active } : item,
          ),
        ),
      ),
    );
  }
  function deleteCar(car) {
    guarded("deleteCar", () =>
      write("deleteCar", { id: car.id }, () => {
        setCars((items) => items.filter((item) => item.id !== car.id));
        setDeleteTarget(null);
      }),
    );
  }
  function saveStaff(member) {
    guarded("updateUser", () =>
      write("updateUser", member, () => {
        setStaff((items) =>
          items.map((item) => (item.id === member.id ? member : item)),
        );
        setStaffModal(null);
      }),
    );
  }
  function updateStaffStatus(member, status) {
    guarded("updateUserStatus", () =>
      write("updateUserStatus", { id: member.id, status }, () =>
        setStaff((items) =>
          items.map((item) =>
            item.id === member.id ? { ...item, status } : item,
          ),
        ),
      ),
    );
  }
  function deleteStaff(member) {
    guarded("deleteUser", () =>
      write("deleteUser", { id: member.id }, () => {
        setStaff((items) => items.filter((item) => item.id !== member.id));
        setDeleteTarget(null);
      }),
    );
  }
  function signOut() {
    localStorage.removeItem("zudo_user");
    sessionStorage.removeItem("zudo_user");
    navigate("/login", { replace: true });
  }

  if (!currentUser) return <div className="min-h-screen bg-slate-950" />;
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <Sidebar
        tabs={tabs}
        active={tab}
        onSelect={(next) => {
          setTab(next);
          setDrawerOpen(false);
        }}
        mobileOpen={drawerOpen}
        setMobileOpen={setDrawerOpen}
        onSignOut={signOut}
        user={currentUser}
      />
      <main className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 px-5 py-4 backdrop-blur-xl sm:px-8">
          <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDrawerOpen(true)}
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">
                  Zudocars Self-Drive
                </p>
                <h1 className="mt-1 text-xl font-black sm:text-2xl">
                  {tabs.find((item) => item.id === tab)?.label}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-bold">
                  Welcome back, {currentUser.name || currentUser.email}
                </p>
                <p className="text-xs capitalize text-slate-400">
                  {currentUser.role} · Kerala operations
                </p>
              </div>
              <button className="relative rounded-xl border border-slate-200 p-2.5 text-slate-500">
                <Bell className="h-5 w-5" />
                {pendingBookings > 0 && (
                  <span className="absolute -right-1 -top-1 rounded-full bg-teal-700 px-1.5 text-[10px] font-black text-white">
                    {pendingBookings}
                  </span>
                )}
              </button>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 font-black text-teal-800">
                {(currentUser.name || currentUser.email || "Z")
                  .slice(0, 1)
                  .toUpperCase()}
              </div>
            </div>
          </div>
        </header>
        <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8">
          {error && (
            <AlertBanner message={error} onClose={() => setError("")} />
          )}
          {loading ? (
            <Skeleton />
          ) : (
            <>
              {tab === "overview" && (
                <Overview
                  cars={cars}
                  bookings={bookings}
                  staff={staff}
                  onBookings={() => setTab("bookings")}
                  onFleet={() => setTab("fleet")}
                />
              )}
              {tab === "fleet" && (
                <Fleet
                  cars={cars}
                  isAdmin={isAdmin}
                  query={search}
                  setQuery={setSearch}
                  onAdd={() => setCarModal("new")}
                  onEdit={setCarModal}
                  onToggle={toggleCar}
                  onDelete={setDeleteTarget}
                  action={action}
                />
              )}
              {tab === "bookings" && (
                <Bookings
                  bookings={bookings}
                  staff={staff}
                  admin={isAdmin}
                  currentUser={currentUser}
                  query={search}
                  setQuery={setSearch}
                  onStatus={updateBookingStatus}
                  onAssign={assignBooking}
                  action={action}
                />
              )}
              {tab === "staff" && isAdmin && (
                <Staff
                  staff={staff}
                  query={search}
                  setQuery={setSearch}
                  onEdit={setStaffModal}
                  onStatus={updateStaffStatus}
                  onDelete={setDeleteTarget}
                  action={action}
                />
              )}
            </>
          )}
        </div>
      </main>
      {carModal && (
        <CarFormModal
          car={carModal === "new" ? blankCar : carModal}
          onClose={() => setCarModal(null)}
          onSave={saveCar}
          loading={action === "addCar" || action === "updateCar"}
        />
      )}
      {staffModal && (
        <StaffFormModal
          member={staffModal}
          onClose={() => setStaffModal(null)}
          onSave={saveStaff}
          loading={action === "updateUser"}
        />
      )}
      {deleteTarget && (
        <DeleteConfirmModal
          target={deleteTarget}
          kind={deleteTarget.email ? "staff member" : "vehicle"}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() =>
            deleteTarget.email
              ? deleteStaff(deleteTarget)
              : deleteCar(deleteTarget)
          }
          loading={Boolean(action)}
        />
      )}
      {adminPrompt && (
        <AdminKeyModal
          action={adminPrompt.actionName}
          onClose={() => setAdminPrompt(null)}
          onVerified={(key) => {
            sessionStorage.setItem("zudo_admin_key", key);
            const callback = adminPrompt.callback;
            setAdminPrompt(null);
            callback(key);
          }}
        />
      )}
    </div>
  );
}

function Sidebar({
  tabs,
  active,
  onSelect,
  mobileOpen,
  setMobileOpen,
  onSignOut,
  user,
}) {
  const nav = (
    <nav className="mt-12 space-y-2">
      {tabs.map(({ id, label, icon: Icon, badge }) => (
        <button
          key={id}
          onClick={() => onSelect(id)}
          className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${active === id ? "bg-teal-700 text-white shadow-lg shadow-teal-950/20" : "text-white/55 hover:bg-white/[0.06] hover:text-white"}`}
        >
          <Icon className="h-5 w-5" />
          {label}
          {badge > 0 && (
            <span className="ml-auto rounded-full bg-teal-200 px-2 py-0.5 text-[10px] font-black text-teal-900">
              {badge}
            </span>
          )}
        </button>
      ))}
    </nav>
  );
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col bg-[#0f1115] px-5 py-6 text-white lg:flex">
        <Brand />
        {nav}
        <div className="mt-auto">
          <p className="truncate text-sm font-bold">
            {user.name || user.email}
          </p>
          <p className="mt-1 text-xs capitalize text-teal-300">{user.role}</p>
          <button
            onClick={onSignOut}
            className="mt-5 flex items-center gap-2 text-sm text-white/55 hover:text-white"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[#0f1115] px-5 py-6 text-white transition-transform lg:hidden ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between">
          <Brand />
          <button onClick={() => setMobileOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>
        {nav}
        <button
          onClick={onSignOut}
          className="mt-auto flex items-center gap-2 text-sm text-white/55"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </aside>
    </>
  );
}
function Brand() {
  return (
    <div>
      <p className="text-2xl font-black tracking-tight">
        Zudo<span className="font-medium text-cyan-400">cars</span>
      </p>
      <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-white/40">
        Self-Drive Kerala
      </p>
    </div>
  );
}
function Overview({ cars, bookings, staff, onBookings, onFleet }) {
  const approvedRevenue = bookings
    .filter((booking) => booking.status === "Approved")
    .reduce((total, booking) => total + Number(booking.amount), 0);
  const cards = [
    {
      label: "Total Fleet",
      value: cars.length,
      sub: `${cars.filter((car) => car.active).length} active`,
      icon: Car,
      onClick: onFleet,
    },
    {
      label: "Active Bookings",
      value: bookings.filter((booking) => booking.status === "Approved").length,
      sub: `${bookings.filter((booking) => booking.status === "Pending").length} pending confirmation`,
      icon: CalendarDays,
      onClick: onBookings,
    },
    {
      label: "Staff Members",
      value: staff.length,
      sub: `${staff.filter((member) => member.status === "Approved").length} approved`,
      icon: Users,
    },
    {
      label: "Approved Revenue",
      value: formatINR(approvedRevenue),
      sub: "Across confirmed bookings",
      icon: BarChart3,
    },
  ];
  const active = cars.filter((car) => car.active).length;
  return (
    <div className="space-y-7">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, sub, icon: Icon, onClick }, index) => (
          <div
            key={label}
            onClick={onClick}
            className={`db-reveal rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${onClick ? "cursor-pointer transition hover:border-teal-200 hover:shadow-md" : ""}`}
            style={{ animationDelay: `${index * 70}ms` }}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-500">{label}</p>
              <span className="rounded-xl bg-teal-50 p-2.5 text-teal-700">
                <Icon className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-5 text-3xl font-black">{value}</p>
            <p className="mt-1 text-xs text-slate-400">{sub}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-black">Recent bookings</h2>
              <p className="mt-1 text-sm text-slate-400">
                Kochi, Munnar, Alleppey, Kozhikode and Trivandrum
              </p>
            </div>
            <button
              onClick={onBookings}
              className="text-sm font-bold text-teal-700"
            >
              View all
            </button>
          </div>
          <div className="mt-5 space-y-3">
            {bookings.slice(0, 5).map((booking) => (
              <div
                key={booking.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-bold">
                    {booking.customerName}{" "}
                    <span className="ml-2 text-xs font-medium text-slate-400">
                      {booking.id}
                    </span>
                  </p>
                  <a
                    href={`tel:${booking.phone}`}
                    className="mt-1 block text-xs text-slate-400"
                  >
                    {booking.phone}
                  </a>
                  <p className="mt-1 text-xs text-slate-400">
                    {booking.vehicle} · {booking.pickup} → {booking.dropoff}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <b className="text-sm">{formatINR(booking.amount)}</b>
                  <StatusPill status={booking.status} />
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-black">Fleet status</h2>
          <p className="mt-1 text-sm text-slate-400">
            Active vs inactive vehicle ratio
          </p>
          <p className="mt-8 text-4xl font-black">
            {active}
            <span className="text-lg text-slate-400">/{cars.length}</span>
          </p>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-teal-600"
              style={{
                width: `${cars.length ? (active / cars.length) * 100 : 0}%`,
              }}
            />
          </div>
          <div className="mt-4 flex justify-between text-xs text-slate-400">
            <span>{active} active</span>
            <span>{cars.length - active} inactive</span>
          </div>
          <button
            onClick={onFleet}
            className="mt-5 text-sm font-bold text-teal-700"
          >
            View fleet →
          </button>
        </section>
      </div>
    </div>
  );
}
function Toolbar({ title, subtitle, query, setQuery, onAdd, addLabel, children }) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h2 className="text-2xl font-black">{title}</h2>
        <p className="mt-1 text-sm text-slate-400">
          {subtitle || "Zudocars operations across Kerala."}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {children}
        <label className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search"
            className="w-44 rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-teal-600"
          />
        </label>
        {onAdd && (
          <button
            onClick={onAdd}
            className="flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-800"
          >
            <Plus className="h-4 w-4" /> {addLabel || "Add vehicle"}
          </button>
        )}
      </div>
    </div>
  );
}
function FilterSelect({ value, onChange, options, placeholder }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-teal-600"
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}
function Fleet({
  cars,
  isAdmin,
  query,
  setQuery,
  onAdd,
  onEdit,
  onToggle,
  onDelete,
  action,
}) {
  const [fuelFilter, setFuelFilter] = useState("");
  const [transmissionFilter, setTransmissionFilter] = useState("");
  const [bodyFilter, setBodyFilter] = useState("");

  const fuelOptions = useMemo(
    () => [...new Set(cars.map((car) => car.fuel).filter(Boolean))],
    [cars],
  );
  const transmissionOptions = useMemo(
    () => [...new Set(cars.map((car) => car.transmission).filter(Boolean))],
    [cars],
  );
  const bodyOptions = useMemo(
    () => [...new Set(cars.map((car) => car.bodyType).filter(Boolean))],
    [cars],
  );

  const filtered = cars.filter((car) => {
    const haystack = `${car.name} ${car.model} ${car.plateNumber || ""} ${car.locationBase || ""}`.toLowerCase();
    if (!haystack.includes(query.toLowerCase())) return false;
    if (fuelFilter && car.fuel !== fuelFilter) return false;
    if (transmissionFilter && car.transmission !== transmissionFilter)
      return false;
    if (bodyFilter && car.bodyType !== bodyFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <Toolbar
        title="Fleet management"
        subtitle="Live vehicle feed from api.zudocars.com"
        query={query}
        setQuery={setQuery}
        onAdd={isAdmin ? onAdd : undefined}
      >
        {fuelOptions.length > 1 && (
          <FilterSelect
            value={fuelFilter}
            onChange={setFuelFilter}
            options={fuelOptions}
            placeholder="All fuel types"
          />
        )}
        {transmissionOptions.length > 1 && (
          <FilterSelect
            value={transmissionFilter}
            onChange={setTransmissionFilter}
            options={transmissionOptions}
            placeholder="All transmissions"
          />
        )}
        {bodyOptions.length > 1 && (
          <FilterSelect
            value={bodyFilter}
            onChange={setBodyFilter}
            options={bodyOptions}
            placeholder="All body types"
          />
        )}
      </Toolbar>
      <p className="text-xs font-semibold text-slate-400">
        Showing {filtered.length} of {cars.length} vehicles
      </p>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((car) => (
          <article
            key={car.id}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="flex h-40 items-center justify-center bg-slate-100">
              {car.image ? (
                <img
                  src={car.image}
                  alt={`${car.name} ${car.model}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Car className="h-16 w-16 text-teal-800/20" />
              )}
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-black">{car.model || car.name}</h3>
                  <p className="mt-1 text-xs font-bold uppercase tracking-wide text-teal-700">
                    {car.plateNumber}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {car.year || "—"} · {car.seats || "—"} seats ·{" "}
                    {car.transmission} · {car.fuel}
                  </p>
                </div>
                <StatusPill status={car.active ? "Active" : "Inactive"} />
              </div>
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {car.locationBase}
                </span>
                <span className="flex items-center gap-1">
                  <Fuel className="h-3.5 w-3.5" /> {car.bodyType}
                </span>
                {Boolean(car.odometer) && (
                  <span className="flex items-center gap-1">
                    <Gauge className="h-3.5 w-3.5" /> {car.odometer} km
                  </span>
                )}
              </div>
              <div className="mt-5 flex items-end justify-between">
                <div>
                  <p className="text-xl font-black">
                    {formatINR(car.minHoursRate || car.price)}
                    <span className="text-xs font-medium text-slate-400">
                      {" "}
                      min hours
                    </span>
                  </p>
                  {Boolean(car.hourlyRate) && (
                    <p className="text-xs text-slate-400">
                      {formatINR(car.hourlyRate)}/hr
                      {Boolean(car.fastagCharge) &&
                        ` · FASTag ${formatINR(car.fastagCharge)}`}
                    </p>
                  )}
                </div>
                <span className="text-sm font-bold text-amber-500">
                  ★ {car.rating}
                </span>
              </div>
              {isAdmin && (
                <div className="mt-5 flex gap-2 border-t border-slate-100 pt-4">
                  <button
                    onClick={() => onEdit(car)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-slate-50 py-2.5 text-xs font-bold text-slate-600"
                  >
                    <Edit3 className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => onToggle(car)}
                    disabled={action === "updateCar"}
                    className="rounded-xl border border-slate-200 px-3 text-xs font-bold text-teal-700"
                  >
                    {car.active ? "Disable" : "Enable"}
                  </button>
                  <button
                    onClick={() => onDelete(car)}
                    className="rounded-xl border border-red-100 px-3 text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </article>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full rounded-2xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-400">
            No vehicles match this search or filter.
          </p>
        )}
      </div>
    </div>
  );
}
function Bookings({
  bookings,
  staff,
  admin,
  currentUser,
  query,
  setQuery,
  onStatus,
  onAssign,
  action,
}) {
  const filtered = bookings.filter((booking) =>
    `${booking.id} ${booking.customerName} ${booking.vehicle}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <div className="space-y-6">
      <Toolbar title="Bookings" query={query} setQuery={setQuery} />
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-400">
              <tr>
                {[
                  "Booking ID",
                  "Customer",
                  "Vehicle",
                  "Pickup",
                  "Dropoff",
                  "Amount",
                  "Status",
                  ...(admin ? ["Assigned staff"] : []),
                  "Actions",
                ].map((heading) => (
                  <th key={heading} className="px-5 py-4 font-bold">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((booking) => (
                <tr
                  key={booking.id}
                  className={
                    booking.assignedEmail === currentUser.email
                      ? "bg-teal-50/40"
                      : ""
                  }
                >
                  <td className="px-5 py-4 font-black text-teal-700">
                    {booking.id}
                  </td>
                  <td className="px-5 py-4">
                    <b>{booking.customerName}</b>
                    <a
                      href={`tel:${booking.phone}`}
                      className="mt-1 block text-xs text-slate-400"
                    >
                      {booking.phone}
                    </a>
                  </td>
                  <td className="px-5 py-4 font-semibold">{booking.vehicle}</td>
                  <td className="px-5 py-4 text-xs text-slate-500">
                    {booking.pickup}
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-500">
                    {booking.dropoff}
                  </td>
                  <td className="px-5 py-4 font-black">
                    {formatINR(booking.amount)}
                  </td>
                  <td className="px-5 py-4">
                    <StatusPill status={booking.status} />
                    {booking.assignedEmail === currentUser.email && (
                      <span className="ml-2 rounded-full bg-teal-100 px-2 py-1 text-[10px] font-bold text-teal-800">
                        You
                      </span>
                    )}
                  </td>
                  {admin && (
                    <td className="px-5 py-4">
                      <select
                        value={booking.assignedEmail || ""}
                        onChange={(event) =>
                          onAssign(booking, event.target.value)
                        }
                        className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs"
                      >
                        <option value="">Unassigned</option>
                        {staff
                          .filter((member) => member.status === "Approved")
                          .map((member) => (
                            <option key={member.email} value={member.email}>
                              {member.name}
                            </option>
                          ))}
                      </select>
                    </td>
                  )}
                  <td className="px-5 py-4">
                    {booking.status === "Pending" && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => onStatus(booking, "Approved")}
                          disabled={action === "updateBookingStatus"}
                          className="rounded-lg p-2 text-teal-700 hover:bg-teal-50"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onStatus(booking, "Rejected")}
                          disabled={action === "updateBookingStatus"}
                          className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                        {action === "updateBookingStatus" && (
                          <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
function Staff({ staff, query, setQuery, onEdit, onStatus, onDelete, action }) {
  const filtered = staff.filter((member) =>
    `${member.name} ${member.email} ${member.department}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <div className="space-y-6">
      <Toolbar title="Staff directory" query={query} setQuery={setQuery} />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((member) => (
          <article
            key={member.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 font-black text-teal-800">
                  {member.name?.slice(0, 1)}
                </div>
                <div>
                  <h3 className="font-black">{member.name}</h3>
                  <p className="text-xs capitalize text-teal-700">
                    {member.role} · {member.department}
                  </p>
                </div>
              </div>
              <StatusPill status={member.status} />
            </div>
            <div className="mt-5 space-y-2 text-sm text-slate-500">
              <p>{member.email}</p>
              <p>
                {member.phone} · {member.employeeId}
              </p>
            </div>
            <div className="mt-5 flex gap-2 border-t border-slate-100 pt-4">
              {member.status === "Pending" && (
                <>
                  <button
                    onClick={() => onStatus(member, "Approved")}
                    disabled={action === "updateUserStatus"}
                    className="flex-1 rounded-xl bg-teal-700 py-2.5 text-xs font-bold text-white"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => onStatus(member, "Rejected")}
                    disabled={action === "updateUserStatus"}
                    className="rounded-xl border border-red-100 px-3 text-xs font-bold text-red-600"
                  >
                    Reject
                  </button>
                </>
              )}
              <button
                onClick={() => onEdit(member)}
                className="rounded-xl border border-slate-200 px-3 text-slate-600"
              >
                <Edit3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete(member)}
                className="rounded-xl border border-red-100 px-3 text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
function StatusPill({ status }) {
  const colors = {
    Pending: "bg-amber-50 text-amber-700",
    Approved: "bg-teal-50 text-teal-700",
    Rejected: "bg-red-50 text-red-600",
    Active: "bg-teal-50 text-teal-700",
    Inactive: "bg-slate-100 text-slate-500",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${colors[status] || colors.Pending}`}
    >
      {status}
    </span>
  );
}
function Skeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="h-32 rounded-2xl bg-slate-200" />
        ))}
      </div>
      <div className="h-96 rounded-2xl bg-slate-200" />
    </div>
  );
}
function AlertBanner({ message, onClose }) {
  return (
    <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      <AlertCircle className="h-5 w-5 shrink-0" />
      <span>{message}</span>
      <button className="ml-auto" onClick={onClose}>
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
function Modal({ title, onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <h2 className="text-xl font-black">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
function ModalActions({ onClose, onConfirm, loading, label }) {
  return (
    <div className="mt-7 flex justify-end gap-3 border-t border-slate-100 pt-5">
      <button
        onClick={onClose}
        className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-500"
      >
        Cancel
      </button>
      <button
        onClick={onConfirm}
        disabled={loading}
        className="flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-800 disabled:opacity-60"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {label}
      </button>
    </div>
  );
}
function CarFormModal({ car, onClose, onSave, loading }) {
  const [form, setForm] = useState(car);
  const update = (field, value) =>
    setForm((current) => ({ ...current, [field]: value }));
  return (
    <Modal title={car.id ? "Edit vehicle" : "Add vehicle"} onClose={onClose}>
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          ["name", "Name"],
          ["model", "Category / Model"],
          ["plateNumber", "Plate number"],
          ["year", "Year"],
          ["seats", "Seats"],
          ["locationBase", "Base location"],
          ["hourlyRate", "Hourly rate"],
          ["minHoursRate", "Min-hours rate"],
          ["fastagCharge", "FASTag charge"],
          ["rating", "Rating"],
          ["image", "Photo URL"],
        ].map(([field, label]) => (
          <label key={field} className="text-sm font-semibold text-slate-700">
            {label}
            <input
              value={form[field] ?? ""}
              onChange={(event) => update(field, event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-600"
            />
          </label>
        ))}
        <Select
          label="Transmission"
          value={form.transmission}
          options={["Manual", "Automatic"]}
          onChange={(value) => update("transmission", value)}
        />
        <Select
          label="Fuel"
          value={form.fuel}
          options={["Petrol", "Diesel", "Electric", "Hybrid", "CNG"]}
          onChange={(value) => update("fuel", value)}
        />
        <Select
          label="Body type"
          value={form.bodyType}
          options={["Hatchback", "Sedan", "SUV", "MUV", "Luxury"]}
          onChange={(value) => update("bodyType", value)}
        />
        <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
          Features (comma-separated)
          <input
            value={form.features}
            onChange={(event) => update("features", event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-600"
          />
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold sm:col-span-2">
          <input
            type="checkbox"
            checked={Boolean(form.active)}
            onChange={(event) => update("active", event.target.checked)}
            className="h-4 w-4 accent-teal-700"
          />{" "}
          Active and bookable
        </label>
      </div>
      <ModalActions
        onClose={onClose}
        onConfirm={() =>
          onSave({
            ...form,
            year: Number(form.year),
            seats: Number(form.seats),
            hourlyRate: Number(form.hourlyRate) || 0,
            minHoursRate: Number(form.minHoursRate) || 0,
            fastagCharge: Number(form.fastagCharge) || 0,
            price: Number(form.minHoursRate) || Number(form.hourlyRate) || 0,
            rating: Number(form.rating),
          })
        }
        loading={loading}
        label="Save vehicle"
      />
    </Modal>
  );
}
function StaffFormModal({ member, onClose, onSave, loading }) {
  const [form, setForm] = useState(member);
  const update = (field, value) =>
    setForm((current) => ({ ...current, [field]: value }));
  return (
    <Modal title="Edit staff member" onClose={onClose}>
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          ["name", "Name"],
          ["employeeId", "Employee ID"],
          ["phone", "Phone"],
          ["department", "Department"],
          ["email", "Email"],
        ].map(([field, label]) => (
          <label key={field} className="text-sm font-semibold text-slate-700">
            {label}
            <input
              value={form[field] || ""}
              onChange={(event) => update(field, event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-600"
            />
          </label>
        ))}
        <Select
          label="Role"
          value={form.role}
          options={["staff", "admin"]}
          onChange={(value) => update("role", value)}
        />
        <Select
          label="Status"
          value={form.status}
          options={["Pending", "Approved", "Rejected"]}
          onChange={(value) => update("status", value)}
        />
      </div>
      <ModalActions
        onClose={onClose}
        onConfirm={() => onSave(form)}
        loading={loading}
        label="Save changes"
      />
    </Modal>
  );
}
function Select({ label, value, options, onChange }) {
  return (
    <label className="text-sm font-semibold text-slate-700">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-600"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}
function DeleteConfirmModal({ target, kind, onClose, onConfirm, loading }) {
  return (
    <Modal title={`Delete ${kind}?`} onClose={onClose}>
      <div className="flex gap-3 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <p>
          This permanently removes {target.name || target.model}. This action
          cannot be undone.
        </p>
      </div>
      <ModalActions
        onClose={onClose}
        onConfirm={onConfirm}
        loading={loading}
        label="Confirm delete"
      />
    </Modal>
  );
}
function AdminKeyModal({ action, onClose, onVerified }) {
  const [key, setKey] = useState("");
  return (
    <Modal title="Admin verification" onClose={onClose}>
      <div className="flex gap-3 rounded-2xl bg-teal-50 p-4 text-sm text-teal-800">
        <ShieldCheck className="h-5 w-5 shrink-0" />
        <p>
          Enter the admin key to {action}. It will be saved in this session as{" "}
          <b>zudo_admin_key</b>.
        </p>
      </div>
      <input
        autoFocus
        type="password"
        value={key}
        onChange={(event) => setKey(event.target.value)}
        onKeyDown={(event) => event.key === "Enter" && key && onVerified(key)}
        placeholder="Admin secret key"
        className="mt-5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-600"
      />
      <ModalActions
        onClose={onClose}
        onConfirm={() => onVerified(key)}
        loading={false}
        label="Verify & continue"
      />
    </Modal>
  );
}
function listFrom(data, keys, fallback) {
  if (Array.isArray(data)) return data;
  for (const key of keys) if (Array.isArray(data?.[key])) return data[key];
  return fallback;
}

// Fleet is always read from the live vehicles API and mapped into the
// dashboard's internal car shape.
async function getFleet() {
  const response = await fetch(VEHICLES_API_URL);
  const data = await readResponse(response);
  const list = Array.isArray(data)
    ? data
    : data?.results || data?.data || data?.vehicles || [];
  return { cars: list.map(mapVehicle) };
}
async function getBookings() {
  if (!HAS_API_URL) return { bookings: fallbackBookings };
  const response = await fetch(`${APPS_SCRIPT_URL}?action=getBookings`);
  return readResponse(response);
}
async function getStaff() {
  if (!HAS_API_URL) return { users: fallbackStaff };
  const response = await fetch(`${APPS_SCRIPT_URL}?action=getUsers`);
  return readResponse(response);
}
async function readResponse(response) {
  if (!response.ok) throw new Error(`Request failed (${response.status}).`);
  return response.json();
}
async function postAction(action, payload) {
  if (APPS_SCRIPT_URL === "YOUR_APPS_SCRIPT_URL_HERE") return { success: true };
  const response = await fetch(APPS_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action, ...payload }),
  });
  const data = await readResponse(response);
  if (data.success === false || data.error)
    throw new Error(data.error || `Could not complete ${action}.`);
  return data;
}