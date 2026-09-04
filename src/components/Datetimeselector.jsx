import { useEffect, useMemo, useState } from "react";
import { Calendar, Clock, ChevronRight, AlertCircle } from "lucide-react";

const DURATIONS = [
  { id: "1", label: "1 day" },
  { id: "2", label: "2 days" },
  { id: "3", label: "3 days" },
  { id: "custom", label: "Custom" },
];

// Minimum lead time between "now" and the pickup date+time, matching the
// booking API's pre_start_cooldown_hours requirement (~9 min, padded to 30).
const MIN_LEAD_MINUTES = 30;

function formatLocalDate(d) {
  if (!d) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseLocalDate(dateStr) {
  if (!dateStr) return new Date();
  const parts = dateStr.split("-").map(Number);
  if (parts.length < 3) return new Date();
  const [year, month, day] = parts;
  return new Date(year, month - 1, day);
}

function todayStr() {
  return formatLocalDate(new Date());
}

function addDays(dateStr, days) {
  if (!dateStr) return todayStr();
  const d = parseLocalDate(dateStr);
  d.setDate(d.getDate() + Number(days));
  return formatLocalDate(d);
}

function formatDateDisplay(dateStr) {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function pad(n) {
  return String(n).padStart(2, "0");
}

// Earliest bookable pickup moment: now + lead time, rounded up to the next
// 5-minute mark so it lines up with what people actually type/pick.
function getEarliestPickup() {
  const d = new Date(Date.now() + MIN_LEAD_MINUTES * 60 * 1000);
  const roundedMinutes = Math.ceil(d.getMinutes() / 5) * 5;
  d.setSeconds(0, 0);
  d.setMinutes(roundedMinutes);
  return {
    date: formatLocalDate(d),
    time: `${pad(d.getHours())}:${pad(d.getMinutes() % 60 === 60 ? 0 : d.getMinutes())}`,
  };
}

function isPickupBookable(dateStr, timeStr) {
  if (!dateStr || !timeStr) return false;
  const selected = new Date(`${dateStr}T${timeStr}:00`);
  const earliestAllowed = new Date(Date.now() + MIN_LEAD_MINUTES * 60 * 1000);
  return selected.getTime() >= earliestAllowed.getTime();
}

export default function DateTimeSelector({ onChange }) {
  const earliest = useMemo(() => getEarliestPickup(), []);

  const [pickupDate, setPickupDate] = useState(earliest.date);
  const [pickupTime, setPickupTime] = useState(earliest.time);
  const [duration, setDuration] = useState("1");
  const [customReturnDate, setCustomReturnDate] = useState(
    addDays(earliest.date, 4),
  );

  // Ensure customReturnDate is never earlier than pickupDate when pickupDate shifts
  useEffect(() => {
    if (customReturnDate < pickupDate) {
      setCustomReturnDate(pickupDate);
    }
  }, [pickupDate, customReturnDate]);

  const returnDate = useMemo(() => {
    if (duration === "custom") return customReturnDate;
    return addDays(pickupDate, Number(duration));
  }, [duration, pickupDate, customReturnDate]);

  // Return time mirrors pickup time
  const returnTime = pickupTime;

  const isToday = pickupDate === todayStr();
  const leadWarning = !isPickupBookable(pickupDate, pickupTime);

  // Native <input type="time"> min only helps browsers that support it, so
  // we still clamp in state - this just improves the picker UI when the
  // browser respects it.
  const minTimeForToday = isToday ? getEarliestPickup().time : undefined;

  function handlePickupDateChange(value) {
    setPickupDate(value);
    // If the newly picked date is today and the current time no longer
    // clears the lead-time bar, bump it up to the earliest valid slot.
    if (value === todayStr() && !isPickupBookable(value, pickupTime)) {
      setPickupTime(getEarliestPickup().time);
    }
  }

  function handlePickupTimeChange(value) {
    setPickupTime(value);
  }

  useEffect(() => {
    onChange?.({
      pickupDate,
      pickupTime,
      returnDate,
      returnTime,
      isValid: isPickupBookable(pickupDate, pickupTime),
    });
  }, [pickupDate, pickupTime, returnDate, returnTime, onChange]);

  return (
    <div className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Component Header */}
        <div className="mb-3">
          <h1 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
            Select your pickup date, time, and rental duration.
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end gap-3 lg:gap-4">
          {/* Pickup date + time */}
          <div className="flex gap-3 flex-1">
            <label className="flex-1">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                <Calendar className="w-3.5 h-3.5" /> Pickup date
              </span>
              <input
                type="date"
                min={todayStr()}
                value={pickupDate}
                onChange={(e) => handlePickupDateChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
            </label>
            <label className="w-32">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                <Clock className="w-3.5 h-3.5" /> Time
              </span>
              <input
                type="time"
                min={minTimeForToday}
                value={pickupTime}
                onChange={(e) => handlePickupTimeChange(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
                  leadWarning
                    ? "border-amber-300 focus:border-amber-500"
                    : "border-gray-200 focus:border-blue-500"
                }`}
              />
            </label>
          </div>

          {/* Duration pills */}
          <div className="flex-1">
            <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Rental length
            </span>
            <div className="flex gap-2">
              {DURATIONS.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDuration(d.id)}
                  className={`flex-1 px-3 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                    duration === d.id
                      ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/20"
                      : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom return date vs. Prescribed Return Preview */}
          {duration === "custom" ? (
            <label className="lg:w-52">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                <Calendar className="w-3.5 h-3.5" /> Return date
              </span>
              <input
                type="date"
                min={pickupDate}
                value={customReturnDate}
                onChange={(e) => setCustomReturnDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
            </label>
          ) : (
            <div className="lg:w-52 flex flex-col justify-end">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                Return
              </span>
              <div className="px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-sm font-medium text-gray-700 flex items-center justify-between">
                <span>{formatDateDisplay(returnDate)}</span>
                <span className="text-xs text-gray-400 flex items-center gap-0.5">
                  <ChevronRight className="w-3 h-3 text-gray-300" />
                  {returnTime}
                </span>
              </div>
            </div>
          )}
        </div>

        {leadWarning && (
          <p className="mt-2.5 flex items-center gap-1.5 text-xs font-medium text-amber-600">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            Pickup time needs to be at least {MIN_LEAD_MINUTES} minutes from now
            — pick a later time.
          </p>
        )}
      </div>
    </div>
  );
}
