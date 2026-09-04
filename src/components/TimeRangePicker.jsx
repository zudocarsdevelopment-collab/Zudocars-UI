import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { Clock, Check, ChevronDown } from "lucide-react";

// Generate 24-hour time slots in 30-minute intervals
export const TIME_SLOTS = Array.from({ length: 48 }).map((_, i) => {
  const hours = Math.floor(i / 2).toString().padStart(2, "0");
  const minutes = i % 2 === 0 ? "00" : "30";
  return `${hours}:${minutes}`;
});

export function formatTime12h(timeStr) {
  if (!timeStr) return "";
  const parts = timeStr.split(":").map(Number);
  if (parts.length < 2) return timeStr;
  const [h, m] = parts;
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(hour12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`;
}

export default function TimeRangePicker({
  timeFrom = "10:00",
  timeTo = "10:00",
  syncEndTime = true,
  onTimeChange,
  onSyncToggle,
  dark = false,
  className = "relative",
  children,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);
  const pickupListRef = useRef(null);
  const returnListRef = useRef(null);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const bounds = triggerRef.current.getBoundingClientRect();
    const popoverWidth = Math.min(320, window.innerWidth - 32);
    let left = bounds.left;
    if (left + popoverWidth > window.innerWidth - 16) {
      left = window.innerWidth - popoverWidth - 16;
    }
    left = Math.max(16, left);

    const popoverHeight = 360;
    const hasRoomBelow =
      window.innerHeight - bounds.bottom >= popoverHeight + 8;
    const top = hasRoomBelow
      ? bounds.bottom + 8
      : Math.max(16, bounds.top - popoverHeight - 8);

    setPopoverPosition({ top, left });
  }, []);

  const openPicker = () => {
    updatePosition();
    setIsOpen(true);
  };

  const closePicker = () => {
    setIsOpen(false);
  };

  // Scroll active elements into view when opening
  useEffect(() => {
    if (!isOpen) return;
    setTimeout(() => {
      const activePickup = pickupListRef.current?.querySelector('[data-selected="true"]');
      activePickup?.scrollIntoView({ block: "nearest", behavior: "smooth" });
      const activeReturn = returnListRef.current?.querySelector('[data-selected="true"]');
      activeReturn?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }, 50);
  }, [isOpen]);

  // Handle outside click & escape
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target) &&
        popoverRef.current &&
        !popoverRef.current.contains(e.target)
      ) {
        closePicker();
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") closePicker();
    };

    const handleResize = () => updatePosition();

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize, true);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize, true);
    };
  }, [isOpen, updatePosition]);

  const handleSelectPickup = (t) => {
    onTimeChange?.({
      time_from: t,
      time_to: syncEndTime ? t : timeTo,
    });
  };

  const handleSelectReturn = (t) => {
    onTimeChange?.({
      time_from: timeFrom,
      time_to: t,
    });
  };

  const pickerTrigger = children ? (
    children({ openPicker, formatTime: formatTime12h })
  ) : (
    <>
      <div className="h-5 flex items-center justify-between mb-1.5">
        <label
          className={`text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap ${
            dark ? "text-gray-400" : "text-gray-600"
          }`}
        >
          <Clock
            className={`w-3.5 h-3.5 ${
              dark ? "text-blue-400" : "text-blue-600"
            } shrink-0`}
          />{" "}
          Time
        </label>
        {syncEndTime && (
          <span
            className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
              dark
                ? "text-blue-300 bg-blue-950/60 border border-blue-800/40"
                : "text-blue-600 bg-blue-50"
            }`}
          >
            Same
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={openPicker}
        className={`w-full h-[38px] rounded-xl px-2.5 py-2 text-xs font-medium transition-all text-left flex items-center justify-between ${
          dark
            ? "bg-white/[0.04] border border-white/[0.08] text-white hover:border-blue-500/50 hover:bg-white/[0.06]"
            : "bg-white border border-gray-300 text-gray-800 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
        }`}
      >
        <span className="truncate flex items-center gap-1">
          <span>{formatTime12h(timeFrom)}</span>
          <span className="text-gray-400">→</span>
          <span>{formatTime12h(timeTo)}</span>
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0 ml-1" />
      </button>
    </>
  );

  return (
    <div ref={triggerRef} className={className}>
      {pickerTrigger}

      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={popoverRef}
            className={`fixed z-[9999] w-[min(20rem,calc(100vw-2rem))] rounded-2xl border p-3.5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 ${
              dark
                ? "bg-[#0d121f] border-white/10 text-white shadow-black/90 backdrop-blur-2xl"
                : "border-gray-200 bg-white text-gray-900"
            }`}
            style={{
              top: `${popoverPosition.top}px`,
              left: `${popoverPosition.left}px`,
            }}
          >
            {/* Popover Header */}
            <div className={`flex items-center justify-between pb-2.5 mb-2.5 border-b ${dark ? "border-white/10" : "border-gray-100"}`}>
              <span className={`text-xs font-bold ${dark ? "text-white" : "text-gray-900"}`}>Trip Times</span>
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={syncEndTime}
                  onChange={(e) => onSyncToggle?.(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className={`text-xs font-medium ${dark ? "text-gray-300" : "text-gray-600"}`}>Same return time</span>
              </label>
            </div>

            {/* Time Columns */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              {/* Pickup Time List */}
              <div>
                <span className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Pickup Time
                </span>
                <div
                  ref={pickupListRef}
                  className={`h-44 overflow-y-auto rounded-lg border p-1 space-y-0.5 ${
                    dark ? "border-white/10 bg-white/[0.02]" : "border-gray-200"
                  }`}
                >
                  {TIME_SLOTS.map((t) => {
                    const isSelected = t === timeFrom;
                    return (
                      <button
                        key={t}
                        type="button"
                        data-selected={isSelected}
                        onClick={() => handleSelectPickup(t)}
                        className={`w-full px-2 py-1.5 rounded-md text-xs font-medium text-left flex items-center justify-between transition-colors ${
                          isSelected
                            ? "bg-blue-600 text-white font-semibold shadow-sm"
                            : dark
                              ? "text-gray-300 hover:bg-white/10"
                              : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <span>{formatTime12h(t)}</span>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Drop-off Time List */}
              <div>
                <span className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Drop-off Time
                </span>
                <div
                  ref={returnListRef}
                  className={`h-44 overflow-y-auto rounded-lg border p-1 space-y-0.5 ${
                    syncEndTime
                      ? dark
                        ? "bg-white/[0.01] border-white/5 opacity-40 pointer-events-none"
                        : "bg-gray-50/70 border-gray-200 opacity-60 pointer-events-none"
                      : dark
                        ? "border-white/10 bg-white/[0.02]"
                        : "border-gray-200"
                  }`}
                >
                  {TIME_SLOTS.map((t) => {
                    const isSelected = syncEndTime ? t === timeFrom : t === timeTo;
                    return (
                      <button
                        key={t}
                        type="button"
                        disabled={syncEndTime}
                        data-selected={isSelected}
                        onClick={() => handleSelectReturn(t)}
                        className={`w-full px-2 py-1.5 rounded-md text-xs font-medium text-left flex items-center justify-between transition-colors ${
                          isSelected
                            ? "bg-blue-600 text-white font-semibold shadow-sm"
                            : dark
                              ? "text-gray-300 hover:bg-white/10"
                              : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <span>{formatTime12h(t)}</span>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quick Presets */}
            <div className={`flex items-center gap-1.5 pb-2 mb-2 border-b ${dark ? "border-white/10" : "border-gray-100"}`}>
              <span className="text-[10px] font-semibold text-gray-400 uppercase">Quick:</span>
              {["09:00", "12:00", "18:00", "21:00"].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleSelectPickup(preset)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors ${
                    timeFrom === preset
                      ? dark
                        ? "bg-blue-900/60 border-blue-600 text-blue-300 font-semibold"
                        : "bg-blue-50 border-blue-300 text-blue-700 font-semibold"
                      : dark
                        ? "bg-white/[0.03] border-white/10 text-gray-300 hover:border-white/20"
                        : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {formatTime12h(preset).replace(":00", "")}
                </button>
              ))}
            </div>

            {/* Footer Done Button */}
            <button
              type="button"
              onClick={closePicker}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-1.5 rounded-xl transition-colors shadow-sm"
            >
              Apply Time
            </button>
          </div>,
          document.body
        )}
    </div>
  );
}
