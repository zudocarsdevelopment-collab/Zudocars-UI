import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

const CALENDAR_WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function parseDateValue(dateValue) {
  if (!dateValue) return null;
  const parts = dateValue.split("-").map(Number);
  if (parts.length < 3) return null;
  const [year, month, day] = parts;
  return new Date(year, month - 1, day);
}

function dateValue(date) {
  if (!date) return "";
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map((part, index) =>
      index === 0 ? String(part) : String(part).padStart(2, "0"),
    )
    .join("-");
}

export function formatPickerDate(dateValueString) {
  const date = parseDateValue(dateValueString);
  if (!date) return "";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function calculateDaySpan(startStr, endStr) {
  if (!startStr || !endStr) return null;
  const s = parseDateValue(startStr);
  const e = parseDateValue(endStr);
  if (!s || !e) return null;
  const diffTime = e.getTime() - s.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(diffDays, 0);
}

export default function DateRangePicker({
  startDate,
  endDate,
  onRangeChange,
  onClear,
  minDate,
  dark = false,
  children,
  className = "relative",
}) {
  const pickerRef = useRef(null);
  const popoverRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });

  const today = useMemo(() => dateValue(new Date()), []);
  const effectiveMinDate = minDate !== undefined ? minDate : today;

  const [visibleMonth, setVisibleMonth] = useState(() => {
    const initialDate = parseDateValue(startDate) || new Date();
    return new Date(initialDate.getFullYear(), initialDate.getMonth(), 1);
  });
  const [selectionStart, setSelectionStart] = useState(null);
  const [hoveredDate, setHoveredDate] = useState(null);

  const updatePosition = useCallback(() => {
    if (!pickerRef.current) return;
    const bounds = pickerRef.current.getBoundingClientRect();
    const popoverWidth = Math.min(352, window.innerWidth - 32);
    let left = bounds.left;
    if (left + popoverWidth > window.innerWidth - 16) {
      left = window.innerWidth - popoverWidth - 16;
    }
    left = Math.max(16, left);

    const popoverHeight = 420;
    const hasRoomBelow =
      window.innerHeight - bounds.bottom >= popoverHeight + 8;
    const top = hasRoomBelow
      ? bounds.bottom + 8
      : Math.max(16, bounds.top - popoverHeight - 8);

    setPopoverPosition({ top, left });
  }, []);

  const openPicker = () => {
    const initialDate = parseDateValue(startDate) || new Date();
    setVisibleMonth(
      new Date(initialDate.getFullYear(), initialDate.getMonth(), 1),
    );
    setSelectionStart(null);
    setHoveredDate(null);
    updatePosition();
    setIsOpen(true);
  };

  const closePicker = () => {
    setSelectionStart(null);
    setHoveredDate(null);
    setIsOpen(false);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(e.target) &&
        popoverRef.current &&
        !popoverRef.current.contains(e.target)
      ) {
        closePicker();
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closePicker();
      }
    };

    const handleScrollOrResize = () => {
      updatePosition();
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleScrollOrResize);
    window.addEventListener("scroll", handleScrollOrResize, true);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleScrollOrResize);
      window.removeEventListener("scroll", handleScrollOrResize, true);
    };
  }, [isOpen, updatePosition]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth(),
      1,
    );
    const firstCell = new Date(firstDay);
    firstCell.setDate(firstCell.getDate() - firstCell.getDay());
    return Array.from({ length: 42 }, (_, index) => {
      const day = new Date(firstCell);
      day.setDate(firstCell.getDate() + index);
      return day;
    });
  }, [visibleMonth]);

  const handleDateClick = (date) => {
    const selected = dateValue(date);
    if (effectiveMinDate && selected < effectiveMinDate) return;

    if (!selectionStart || selected < selectionStart) {
      setSelectionStart(selected);
      setHoveredDate(null);
      return;
    }

    onRangeChange?.(selectionStart, selected);
    setSelectionStart(null);
    setHoveredDate(null);
    setIsOpen(false);
  };

  const handleClear = () => {
    setSelectionStart(null);
    setHoveredDate(null);
    setIsOpen(false);
    onClear?.();
  };

  const activeRangeEnd = selectionStart
    ? hoveredDate && hoveredDate >= selectionStart
      ? hoveredDate
      : null
    : endDate;

  const currentMonthStart = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1,
  );
  const isPastMonth =
    effectiveMinDate &&
    visibleMonth.getFullYear() <= currentMonthStart.getFullYear() &&
    visibleMonth.getMonth() <= currentMonthStart.getMonth();

  const previewSpan = selectionStart
    ? activeRangeEnd
      ? calculateDaySpan(selectionStart, activeRangeEnd)
      : null
    : calculateDaySpan(startDate, endDate);

  const inputClassName = dark
    ? "w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-2.5 py-2 text-white text-xs font-medium focus:outline-none focus:border-blue-500/50 transition-colors cursor-pointer"
    : "w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all cursor-pointer";

  const pickerTrigger = children ? (
    children({ openPicker, formatDate: formatPickerDate })
  ) : (
    <div className="grid grid-cols-2 gap-2">
      <label className="block cursor-pointer" onClick={openPicker}>
        <span
          className={
            dark
              ? "text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block"
              : "text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1"
          }
        >
          <Calendar className={`w-3.5 h-3.5 ${dark ? "text-blue-400" : "text-blue-600"}`} />
          Start Date
        </span>
        <input
          type="text"
          name="date_from"
          readOnly
          value={formatPickerDate(startDate)}
          placeholder="Start Date"
          onClick={openPicker}
          className={inputClassName}
        />
      </label>
      <label className="block cursor-pointer" onClick={openPicker}>
        <span
          className={
            dark
              ? "text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block"
              : "text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1"
          }
        >
          <Calendar className={`w-3.5 h-3.5 ${dark ? "text-blue-400" : "text-blue-600"}`} />
          End Date
        </span>
        <input
          type="text"
          name="date_to"
          readOnly
          value={formatPickerDate(endDate)}
          placeholder="End Date"
          onClick={openPicker}
          className={inputClassName}
        />
      </label>
    </div>
  );

  return (
    <div ref={pickerRef} className={className}>
      {pickerTrigger}

      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={popoverRef}
            className={`fixed z-[9999] w-[min(22rem,calc(100vw-2rem))] rounded-2xl border p-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150 ${
              dark
                ? "bg-[#0d121f] border-white/10 text-white shadow-black/90 backdrop-blur-2xl"
                : "border-gray-200 bg-white text-gray-900"
            }`}
            style={{
              top: `${popoverPosition.top}px`,
              left: `${popoverPosition.left}px`,
            }}
          >
            {/* Header Month Navigation */}
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                aria-label="Previous month"
                disabled={isPastMonth}
                onClick={() =>
                  setVisibleMonth(
                    (month) =>
                      new Date(month.getFullYear(), month.getMonth() - 1, 1),
                  )
                }
                className={`rounded-lg p-1.5 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed ${
                  dark
                    ? "text-gray-400 hover:bg-white/10 hover:text-white"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className={`text-sm font-bold ${dark ? "text-white" : "text-gray-900"}`}>
                {visibleMonth.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <button
                type="button"
                aria-label="Next month"
                onClick={() =>
                  setVisibleMonth(
                    (month) =>
                      new Date(month.getFullYear(), month.getMonth() + 1, 1),
                  )
                }
                className={`rounded-lg p-1.5 transition-colors ${
                  dark
                    ? "text-gray-400 hover:bg-white/10 hover:text-white"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Guide Badge */}
            <div
              className={`mb-3 px-2.5 py-1.5 rounded-lg border flex items-center justify-between text-xs ${
                dark
                  ? "bg-blue-950/60 border-blue-800/40 text-blue-300"
                  : "bg-blue-50/80 border-blue-100/60 text-blue-900"
              }`}
            >
              <span className="font-medium">
                {selectionStart
                  ? "Click drop-off date"
                  : "Click pickup date"}
              </span>
              {previewSpan !== null && (
                <span
                  className={`font-bold px-2 py-0.5 rounded shadow-sm text-[11px] ${
                    dark
                      ? "bg-blue-900 text-blue-200"
                    : "bg-white text-blue-600"
                }`}
              >
                {previewSpan === 0 ? "Same day" : `${previewSpan} ${previewSpan === 1 ? "day" : "days"}`}
              </span>
            )}
          </div>

          {/* Weekday Names */}
          <div className="grid grid-cols-7 mb-1.5">
            {CALENDAR_WEEKDAYS.map((day) => (
              <span
                key={day}
                className="py-1 text-center text-[11px] font-semibold text-gray-400"
              >
                {day}
              </span>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-y-1">
            {calendarDays.map((date) => {
              const selected = dateValue(date);
              const inCurrentMonth =
                date.getMonth() === visibleMonth.getMonth();
              const isPast = effectiveMinDate ? selected < effectiveMinDate : false;
              const rangeStart = selectionStart || startDate;
              const isStart = selected === rangeStart;
              const isEnd = selected === (selectionStart ? activeRangeEnd : endDate);
              const inRange =
                rangeStart &&
                activeRangeEnd &&
                selected > rangeStart &&
                selected < activeRangeEnd;
              const isToday = selected === today;

              return (
                <button
                  key={selected}
                  type="button"
                  disabled={isPast}
                  onClick={() => handleDateClick(date)}
                  onMouseEnter={() =>
                    selectionStart && setHoveredDate(selected)
                  }
                  className={`relative h-9 text-xs transition-colors rounded-lg ${
                    isPast
                      ? "opacity-30 cursor-not-allowed text-gray-500"
                      : inRange
                        ? dark
                          ? "bg-blue-600/25 text-blue-200 font-medium"
                          : "bg-blue-50 text-blue-900 font-medium"
                        : dark
                          ? "hover:bg-white/10 text-gray-200"
                          : "hover:bg-gray-100 text-gray-700"
                  } ${!inCurrentMonth && !isPast ? (dark ? "text-gray-600" : "text-gray-300") : ""}`}
                >
                  <span
                    className={`relative z-10 mx-auto flex h-8 w-8 items-center justify-center rounded-full transition-all ${
                      isStart || isEnd
                        ? "bg-blue-600 font-bold text-white shadow-sm shadow-blue-500/30"
                        : ""
                    } ${isToday && !isStart && !isEnd ? (dark ? "font-bold text-blue-400 border border-blue-500/50" : "font-bold text-blue-600 border border-blue-300") : ""}`}
                  >
                    {date.getDate()}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Footer Actions */}
          <div
            className={`mt-3 flex items-center justify-between border-t pt-2.5 ${
              dark ? "border-white/10" : "border-gray-100"
            }`}
          >
            <button
              type="button"
              onClick={handleClear}
              className={`text-xs font-semibold transition-colors ${
                dark
                  ? "text-gray-400 hover:text-white"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Clear
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  setVisibleMonth(
                    new Date(now.getFullYear(), now.getMonth(), 1),
                  );
                  setSelectionStart(today);
                  setHoveredDate(null);
                }}
                className={`text-xs font-semibold transition-colors px-2 py-1 rounded ${
                  dark
                    ? "text-blue-400 hover:text-blue-300 hover:bg-white/5"
                    : "text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={closePicker}
                className={`text-xs font-semibold px-2.5 py-1 rounded transition-colors ${
                  dark
                    ? "text-gray-300 hover:text-white hover:bg-white/10"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                Done
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
