import { useMemo, useState } from "react";
import {
  Landmark,
  Receipt,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  UserCog,
  Users,
  Wallet,
} from "lucide-react";
import { StatusPill } from "./Dashboard";

// Accounts has two sub-tabs: Finance (revenue/expenses) and User Accounts
// (who has access to the dashboard). Revenue numbers here are real — they
// come straight off confirmed bookings, same source Overview uses.
// Expenses have no backend yet (no Django accounting app exists), so that
// side stays an honest empty state rather than a guess. Customer accounts
// are the same story: there's no customer-login system yet, only booking
// contact details, so that panel stays empty until one exists.

const CURRENCY = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const formatINR = (value) => CURRENCY.format(Number(value) || 0);

const SUB_TABS = [
  { id: "finance", label: "Finance", icon: Landmark },
  { id: "users", label: "User Accounts", icon: UserCog },
];

function EmptyState({ icon: Icon, title, hint }) {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-10 text-center">
      <span className="rounded-full bg-slate-50 p-3 text-slate-300">
        <Icon className="h-6 w-6" />
      </span>
      <p className="mt-3 text-sm font-bold text-slate-500">{title}</p>
      {hint && <p className="mt-1 max-w-xs text-xs text-slate-400">{hint}</p>}
    </div>
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

function Finance({ bookings }) {
  const approved = bookings.filter((booking) => booking.status === "Approved");
  const pending = bookings.filter((booking) => booking.status === "Pending");
  const revenue = approved.reduce((total, b) => total + Number(b.amount || 0), 0);
  const outstanding = pending.reduce((total, b) => total + Number(b.amount || 0), 0);

  const cards = [
    {
      label: "Revenue (Confirmed)",
      value: formatINR(revenue),
      sub: `${approved.length} confirmed bookings`,
      icon: TrendingUp,
    },
    {
      label: "Outstanding",
      value: formatINR(outstanding),
      sub: `${pending.length} pending confirmation`,
      icon: Wallet,
    },
    {
      label: "Expenses",
      value: "—",
      sub: "Awaiting accounting API",
      icon: TrendingDown,
    },
    {
      label: "Net Balance",
      value: "—",
      sub: "Revenue minus expenses",
      icon: Landmark,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-black">Revenue entries</h2>
        <p className="mt-1 text-sm text-slate-400">
          From confirmed bookings, most recent first
        </p>
        {approved.length === 0 ? (
          <div className="mt-5">
            <EmptyState
              icon={Receipt}
              title="No confirmed revenue yet"
              hint="Approved bookings will list here as revenue entries."
            />
          </div>
        ) : (
          <div className="mt-5 overflow-hidden rounded-xl border border-slate-100">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-400">
                  <tr>
                    {["Booking", "Customer", "Vehicle", "Amount", "Status"].map(
                      (heading) => (
                        <th key={heading} className="whitespace-nowrap px-4 py-3 font-bold">
                          {heading}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {approved.slice(0, 10).map((booking) => (
                    <tr key={booking.id} className="hover:bg-slate-50/70">
                      <td className="whitespace-nowrap px-4 py-3 font-black text-slate-800">
                        {booking.id}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                        {booking.customerName}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                        {booking.vehicle}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-bold text-slate-800">
                        {formatINR(booking.amount)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill status={booking.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-black">Expenses</h2>
        <p className="mt-1 text-sm text-slate-400">
          Fuel, maintenance, salaries and other outgoings
        </p>
        <div className="mt-5">
          <EmptyState
            icon={TrendingDown}
            title="No expense records yet"
            hint="Populates once an accounting API is connected — maintenance costs can feed in automatically from the Maintenance page."
          />
        </div>
      </section>
    </div>
  );
}

function UserAccounts({ staff, onManageStaff }) {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-black">Staff accounts</h2>
            <p className="mt-1 text-sm text-slate-400">
              Everyone with dashboard access
            </p>
          </div>
          {onManageStaff && (
            <button
              onClick={onManageStaff}
              className="text-sm font-bold text-teal-700"
            >
              Manage in Staff Directory
            </button>
          )}
        </div>
        {staff.length === 0 ? (
          <div className="mt-5">
            <EmptyState icon={Users} title="No staff accounts yet" />
          </div>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {staff.map((member) => (
              <div
                key={member.id}
                className="rounded-xl border border-slate-100 p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold">{member.name}</p>
                  <StatusPill status={member.status} />
                </div>
                <p className="mt-1 text-xs capitalize text-teal-700">
                  {member.role} · {member.department}
                </p>
                <p className="mt-2 text-xs text-slate-400">{member.email}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-black">Customer accounts</h2>
        <p className="mt-1 text-sm text-slate-400">
          Login access for customers, separate from booking contact details
        </p>
        <div className="mt-5">
          <EmptyState
            icon={ShieldCheck}
            title="No customer account system yet"
            hint="Bookings currently store contact details only, not logins. This will list customer accounts once that exists."
          />
        </div>
      </section>
    </div>
  );
}

export default function Accounts({ bookings = [], staff = [], onManageStaff }) {
  const [subTab, setSubTab] = useState("finance");

  return (
    <div className="space-y-6">
      <SubNav active={subTab} onSelect={setSubTab} />
      {subTab === "finance" && <Finance bookings={bookings} />}
      {subTab === "users" && (
        <UserAccounts staff={staff} onManageStaff={onManageStaff} />
      )}
    </div>
  );
}