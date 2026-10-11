import { useState } from "react";
import AccountsFinance from "./AccountsFinance";
import {
  Landmark,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react";
import { StatusPill } from "./Dashboard";

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

export default function Accounts({ staff = [], onManageStaff }) {
  const [subTab, setSubTab] = useState("finance");

  return (
    <div className="space-y-6">
      <SubNav active={subTab} onSelect={setSubTab} />
      {subTab === "finance" && <AccountsFinance />}
      {subTab === "users" && (
        <UserAccounts staff={staff} onManageStaff={onManageStaff} />
      )}
    </div>
  );
}