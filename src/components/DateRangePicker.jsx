import { useMemo, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

const CALENDAR_WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function parseDateValue(dateValue) {
  if (!dateValue) return null;
  const [year, month, day] = dateValue.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function dateValue(date) {
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

export default function DateRangePicker({
  startDate,
  endDate,
  onRangeChange,
  onClear,
  dark = false,
  children,
  className = "relative",
}) {
  const pickerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const initialDate = parseDateValue(startDate) || new Date();
    return new Date(initialDate.getFullYear(), initialDate.getMonth(), 1);
  });
  const [selectionStart, setSelectionStart] = useState(null);
  const [hoveredDate, setHoveredDate] = useState(null);

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

  const openPicker = () => {
    const initialDate = parseDateValue(startDate) || new Date();
    const bounds = pickerRef.current?.getBoundingClientRect();
    if (bounds) {
      const popoverWidth = Math.min(352, window.innerWidth - 32);
      const left = Math.min(bounds.left, window.innerWidth - popoverWidth - 16);
      const popoverHeight = 410;
      const hasRoomBelow =
        window.innerHeight - bounds.bottom >= popoverHeight + 8;
      const top = hasRoomBelow
        ? bounds.bottom + 8
        : Math.max(16, bounds.top - popoverHeight - 8);
      setPopoverPosition({ top, left: Math.max(16, left) });
    }
    setVisibleMonth(
      new Date(initialDate.getFullYear(), initialDate.getMonth(), 1),
    );
    setSelectionStart(null);
    setHoveredDate(null);
    setIsOpen(true);
  };

  const handleDateClick = (date) => {
    const selected = dateValue(date);
    if (!selectionStart || selected < selectionStart) {
      setSelectionStart(selected);
      setHoveredDate(null);
      return;
    }

    onRangeChange(selectionStart, selected);
    setSelectionStart(null);
    setHoveredDate(null);
    setIsOpen(false);
  };

  const handleClear = () => {
    setSelectionStart(null);
    setHoveredDate(null);
    setIsOpen(false);
    onClear();
  };

  const today = dateValue(new Date());
  const rangeEnd = selectionStart
    ? hoveredDate && hoveredDate >= selectionStart
      ? hoveredDate
      : null
    : endDate;
  const inputClassName = dark
    ? "w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-2 py-2 text-white text-xs font-medium focus:outline-none focus:border-blue-500/50 transition-colors [color-scheme:dark] cursor-pointer"
    : "w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all cursor-pointer";
  const pickerTrigger = children ? (
    children({ openPicker, formatDate: formatPickerDate })
  ) : (
    <div className="grid grid-cols-2 gap-2">
      <label className="block">
        <span
          className={
            dark
              ? "text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block"
              : "text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1"
          }
        >
          {!dark && <Calendar className="w-3.5 h-3.5 text-blue-600" />}
          FROM DATE
        </span>
        <input
          type="text"
          name="date_from"
          readOnly
          value={formatPickerDate(startDate)}
          placeholder="FROM DATE"
          onClick={openPicker}
          className={inputClassName}
        />
      </label>
      <label className="block">
        <span
          className={
            dark
              ? "text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block"
              : "text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1"
          }
        >
          {!dark && <Calendar className="w-3.5 h-3.5 text-blue-600" />}
          TO DATE
        </span>
        <input
          type="text"
          name="date_to"
          readOnly
          value={formatPickerDate(endDate)}
          placeholder="TO DATE"
          onClick={openPicker}
          className={inputClassName}
        />
      </label>
    </div>
  );

  return (
    <div ref={pickerRef} className={className}>
      {pickerTrigger}

      {isOpen && (
        <div
          className="fixed z-[100] w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl"
          style={popoverPosition}
        >
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() =>
                setVisibleMonth(
                  (month) =>
                    new Date(month.getFullYear(), month.getMonth() - 1, 1),
                )
              }
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-bold text-gray-900">
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
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <p
            className="mb-3 text-center text-[11px] font-medium text-gray-500"
            aria-live="polite"
          >
            {selectionStart
              ? "Select your drop-off date"
              : "Select your pickup date"}
          </p>

          <div className="grid grid-cols-7 mb-2">
            {CALENDAR_WEEKDAYS.map((day) => (
              <span
                key={day}
                className="py-1 text-center text-[11px] font-semibold text-gray-400"
              >
                {day}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-1">
            {calendarDays.map((date) => {
              const selected = dateValue(date);
              const inCurrentMonth =
                date.getMonth() === visibleMonth.getMonth();
              const isStart = selected === (selectionStart || startDate);
              const isEnd = selected === (selectionStart ? rangeEnd : endDate);
              const rangeStart = selectionStart || startDate;
              const inRange =
                rangeStart &&
                rangeEnd &&
                selected > rangeStart &&
                selected < rangeEnd;
              const isToday = selected === today;

              return (
                <button
                  key={selected}
                  type="button"
                  onClick={() => handleDateClick(date)}
                  onMouseEnter={() =>
                    selectionStart && setHoveredDate(selected)
                  }
                  className={`relative h-9 rounded-lg text-xs transition-colors ${
                    inRange ? "bg-gray-100 text-gray-900" : "hover:bg-gray-100"
                  } ${!inCurrentMonth ? "text-gray-300" : "text-gray-700"}`}
                >
                  <span
                    className={`relative z-10 mx-auto flex h-8 w-8 items-center justify-center rounded-full ${
                      isStart || isEnd ? "bg-gray-900 font-bold text-white" : ""
                    } ${isToday && !isStart && !isEnd ? "font-bold text-blue-600" : ""}`}
                  >
                    {date.getDate()}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
            <button
              type="button"
              onClick={handleClear}
              className="text-xs font-semibold text-gray-500 hover:text-gray-900"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => {
                const date = new Date();
                setVisibleMonth(
                  new Date(date.getFullYear(), date.getMonth(), 1),
                );
                setSelectionStart(today);
                setHoveredDate(null);
              }}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
