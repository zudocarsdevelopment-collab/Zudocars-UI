import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, CalendarDays, Car, Check, ChevronLeft, ChevronRight, Clock, Eye, RefreshCw, Search, TrendingUp, TriangleAlert } from "lucide-react";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/lib/onTrip.js
function isOnTrip(booking, now = Date.now()) {
	return booking.status === "Approved" && !booking.returnedAt && Number.isFinite(Date.parse(booking.startDatetime)) && Date.parse(booking.startDatetime) <= now;
}
function isTripOverdue(booking, now = Date.now()) {
	return isOnTrip(booking, now) && Date.parse(booking.endDatetime) < now;
}
//#endregion
//#region src/lib/planningCalendar.js
var DAY_MS = 864e5;
function indiaDay(value = Date.now()) {
	if (!Number.isFinite(Number(value))) return "";
	return new Date(Number(value) + 198e5).toISOString().slice(0, 10);
}
function dayStart(key) {
	return Date.parse(`${key}T00:00:00+05:30`);
}
function shiftDay(key, days) {
	return indiaDay(dayStart(key) + days * DAY_MS);
}
function planningStatus(booking, now) {
	if (booking.status === "Completed") return "completed";
	if (booking.status === "Rejected") return "cancelled";
	if (isTripOverdue(booking, now)) return "overdue";
	if (isOnTrip(booking, now)) return "running";
	return booking.status === "Approved" ? "confirmed" : "pending";
}
function bookingInterval(booking, now) {
	const start = Date.parse(booking.startDatetime);
	const scheduledEnd = Date.parse(booking.endDatetime);
	const end = booking.status === "Completed" && booking.returnedAt ? Date.parse(booking.returnedAt) : scheduledEnd;
	return {
		start,
		end: isTripOverdue(booking, now) ? Math.max(end, now) : end
	};
}
function layoutBookings(bookings, start, end, now) {
	const laneEnds = [];
	const bars = [];
	const sorted = bookings.map((booking) => ({
		booking,
		...bookingInterval(booking, now)
	})).filter((row) => Number.isFinite(row.start) && Number.isFinite(row.end) && row.end > start && row.start < end && row.end > row.start).sort((a, b) => a.start - b.start || a.end - b.end);
	for (const row of sorted) {
		let lane = laneEnds.findIndex((value) => value <= row.start);
		if (lane < 0) lane = laneEnds.length;
		laneEnds[lane] = row.end;
		bars.push({
			...row,
			lane,
			left: (Math.max(start, row.start) - start) / (end - start) * 100,
			width: (Math.min(end, row.end) - Math.max(start, row.start)) / (end - start) * 100
		});
	}
	return {
		bars,
		lanes: Math.max(1, laneEnds.length)
	};
}
function planningConflicts(bookings, now) {
	const rows = bookings.filter((booking) => ["Pending", "Approved"].includes(booking.status));
	let count = 0;
	for (let i = 0; i < rows.length; i++) for (let j = i + 1; j < rows.length; j++) {
		const a = bookingInterval(rows[i], now), b = bookingInterval(rows[j], now);
		if (rows[i].vehicleId === rows[j].vehicleId && a.start < b.end && b.start < a.end) count++;
	}
	return count;
}
//#endregion
//#region src/components/PlanningCalendar.jsx
var labels = {
	running: "On rent",
	confirmed: "Confirmed",
	pending: "Pending",
	overdue: "Overdue",
	completed: "Completed"
};
var dateLabel = (value, options) => new Date(value).toLocaleDateString("en-IN", {
	timeZone: "Asia/Kolkata",
	...options
});
var timeLabel = (value) => new Date(value).toLocaleTimeString("en-IN", {
	timeZone: "Asia/Kolkata",
	hour: "2-digit",
	minute: "2-digit"
});
function PlanningCalendar({ cars, bookings, now, onRefresh, onView }) {
	const [anchor, setAnchor] = useState(() => shiftDay(indiaDay(), -3));
	const [view, setView] = useState("timeline");
	const [range, setRange] = useState(14);
	const [query, setQuery] = useState("");
	const [category, setCategory] = useState("all");
	const [status, setStatus] = useState("all");
	const [showInactive, setShowInactive] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [refreshError, setRefreshError] = useState("");
	const [updatedAt, setUpdatedAt] = useState(Date.now);
	const refreshingRef = useRef(false);
	const refreshRef = useRef(onRefresh);
	refreshRef.current = onRefresh;
	async function refresh() {
		if (refreshingRef.current) return;
		refreshingRef.current = true;
		setRefreshing(true);
		try {
			await refreshRef.current();
			setUpdatedAt(Date.now());
			setRefreshError("");
		} catch (error) {
			setRefreshError(error.message || "Unable to refresh the calendar.");
		} finally {
			refreshingRef.current = false;
			setRefreshing(false);
		}
	}
	useEffect(() => {
		refresh();
		const timer = setInterval(() => {
			if (!document.hidden) refresh();
		}, 3e4);
		const onVisible = () => {
			if (!document.hidden) refresh();
		};
		document.addEventListener("visibilitychange", onVisible);
		return () => {
			clearInterval(timer);
			document.removeEventListener("visibilitychange", onVisible);
		};
	}, []);
	const today = indiaDay(now);
	const days = view === "day" ? 1 : range;
	const start = dayStart(anchor), end = start + days * DAY_MS;
	const cells = view === "day" ? 24 : days;
	const cellWidth = view === "day" ? 72 : 88;
	const trackWidth = cells * cellWidth;
	const activeCars = cars.filter((car) => car.active);
	const activeIds = new Set(activeCars.map((car) => car.id));
	const liveBookings = bookings.filter((booking) => activeIds.has(booking.vehicleId));
	const out = new Set(liveBookings.filter((booking) => isOnTrip(booking, now)).map((booking) => booking.vehicleId)).size;
	const reserved = new Set(liveBookings.filter((booking) => ["Pending", "Approved"].includes(booking.status) && !booking.returnedAt).map((booking) => booking.vehicleId));
	const dueToday = liveBookings.filter((booking) => booking.status === "Approved" && !booking.returnedAt && indiaDay(Date.parse(booking.endDatetime)) === today).length;
	const pickups = liveBookings.filter((booking) => ["Pending", "Approved"].includes(booking.status) && indiaDay(Date.parse(booking.startDatetime)) === today).length;
	const overdue = liveBookings.filter((booking) => isTripOverdue(booking, now)).length;
	const utilisation = activeCars.length ? Math.round(out / activeCars.length * 100) : 0;
	const stats = [
		{
			label: "On Rent Now",
			value: out,
			sub: "vehicles currently out",
			icon: Car,
			tone: "running"
		},
		{
			label: "Available Now",
			value: activeCars.filter((car) => !reserved.has(car.id)).length,
			sub: "vehicles without an active reservation",
			icon: Check,
			tone: "confirmed"
		},
		{
			label: "Pickups Today",
			value: pickups,
			sub: "scheduled departures",
			icon: ArrowUpRight,
			tone: "pickup"
		},
		{
			label: "Returns Due Today",
			value: dueToday,
			sub: "expected back today",
			icon: ArrowDownLeft,
			tone: "pending"
		},
		{
			label: "Overdue",
			value: overdue,
			sub: "awaiting vehicle return",
			icon: TriangleAlert,
			tone: "overdue"
		},
		{
			label: "Fleet Utilisation",
			value: `${utilisation}%`,
			sub: "active fleet currently on rent",
			icon: TrendingUp,
			tone: "utilisation"
		}
	];
	const categories = [...new Set(cars.map((car) => car.bodyType).filter((value) => value && value !== "—"))].sort();
	const visibleCars = cars.filter((car) => (showInactive || car.active) && (category === "all" || car.bodyType === category) && `${car.model} ${car.plateNumber}`.toLowerCase().includes(query.toLowerCase()));
	const visibleBookings = bookings.filter((booking) => booking.status !== "Rejected" && (status === "all" || planningStatus(booking, now) === status));
	const rows = useMemo(() => visibleCars.map((car) => ({
		car,
		...layoutBookings(visibleBookings.filter((booking) => booking.vehicleId === car.id), start, end, now)
	})), [
		cars,
		bookings,
		query,
		category,
		status,
		showInactive,
		start,
		end,
		now
	]);
	const conflicts = planningConflicts(bookings.filter((booking) => visibleCars.some((car) => car.id === booking.vehicleId)), now);
	const agenda = rows.flatMap((row) => row.bars.map((bar) => ({
		...bar,
		car: row.car
	}))).sort((a, b) => a.start - b.start);
	function goToday() {
		setAnchor(view === "day" ? today : shiftDay(today, -3));
	}
	function switchView(next) {
		if (next === "day" && view !== "day") setAnchor(today);
		setView(next);
	}
	const nowPosition = (now - start) / (end - start) * 100;
	return /* @__PURE__ */ jsxs("section", {
		className: "planning-calendar",
		"aria-label": "Live planning calendar",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "pc-heading",
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h2", { children: "Planning Calendar" }), /* @__PURE__ */ jsxs("p", { children: [
					visibleCars.length,
					" vehicles ",
					/* @__PURE__ */ jsx("span", { className: "pc-live-dot" }),
					" Live · refreshes every 30 seconds"
				] })] }), /* @__PURE__ */ jsxs("button", {
					className: "pc-control",
					onClick: refresh,
					disabled: refreshing,
					children: [/* @__PURE__ */ jsx(RefreshCw, {
						size: 14,
						className: refreshing ? "animate-spin" : ""
					}), refreshing ? "Updating…" : "Refresh"]
				})]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "pc-stats",
				children: stats.map((stat) => /* @__PURE__ */ jsxs("div", {
					className: `pc-stat pc-stat--${stat.tone}`,
					children: [
						/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
							className: "pc-stat-icon",
							children: /* @__PURE__ */ jsx(stat.icon, { size: 16 })
						}), /* @__PURE__ */ jsx("span", { children: stat.label })] }),
						/* @__PURE__ */ jsx("strong", { children: stat.value }),
						/* @__PURE__ */ jsx("small", { children: stat.sub }),
						stat.tone === "utilisation" && /* @__PURE__ */ jsx("div", {
							className: "pc-progress",
							children: /* @__PURE__ */ jsx("span", { style: { width: `${utilisation}%` } })
						})
					]
				}, stat.label))
			}),
			refreshError && /* @__PURE__ */ jsxs("p", {
				role: "alert",
				className: "pc-error",
				children: [
					refreshError,
					" Showing the last loaded data. ",
					/* @__PURE__ */ jsx("button", {
						onClick: refresh,
						children: "Retry"
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "pc-toolbar",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "pc-range",
						children: [
							/* @__PURE__ */ jsx("button", {
								"aria-label": "Previous period",
								onClick: () => setAnchor(shiftDay(anchor, -days)),
								children: /* @__PURE__ */ jsx(ChevronLeft, { size: 16 })
							}),
							/* @__PURE__ */ jsxs("span", { children: [
								dateLabel(start, {
									day: "numeric",
									month: "short"
								}),
								" – ",
								dateLabel(end - 1, {
									day: "numeric",
									month: "short",
									year: "numeric"
								})
							] }),
							/* @__PURE__ */ jsx("button", {
								"aria-label": "Next period",
								onClick: () => setAnchor(shiftDay(anchor, days)),
								children: /* @__PURE__ */ jsx(ChevronRight, { size: 16 })
							})
						]
					}),
					/* @__PURE__ */ jsx("button", {
						className: "pc-control",
						onClick: goToday,
						children: "Today"
					}),
					/* @__PURE__ */ jsx("div", {
						className: "pc-view",
						"aria-label": "Calendar view",
						children: [
							[
								"timeline",
								CalendarDays,
								"Timeline"
							],
							[
								"day",
								Clock,
								"Day"
							],
							[
								"agenda",
								CalendarDays,
								"Agenda"
							]
						].map(([key, Icon, label]) => /* @__PURE__ */ jsxs("button", {
							"aria-pressed": view === key,
							onClick: () => switchView(key),
							children: [/* @__PURE__ */ jsx(Icon, { size: 14 }), label]
						}, key))
					}),
					view !== "day" && /* @__PURE__ */ jsxs("select", {
						"aria-label": "Calendar date range",
						value: range,
						onChange: (event) => setRange(Number(event.target.value)),
						children: [/* @__PURE__ */ jsx("option", {
							value: 14,
							children: "14 days"
						}), /* @__PURE__ */ jsx("option", {
							value: 30,
							children: "30 days"
						})]
					}),
					/* @__PURE__ */ jsxs("select", {
						"aria-label": "Booking status filter",
						value: status,
						onChange: (event) => setStatus(event.target.value),
						children: [/* @__PURE__ */ jsx("option", {
							value: "all",
							children: "All statuses"
						}), Object.entries(labels).map(([key, label]) => /* @__PURE__ */ jsx("option", {
							value: key,
							children: label
						}, key))]
					}),
					/* @__PURE__ */ jsxs("select", {
						"aria-label": "Vehicle category filter",
						value: category,
						onChange: (event) => setCategory(event.target.value),
						children: [/* @__PURE__ */ jsx("option", {
							value: "all",
							children: "All categories"
						}), categories.map((value) => /* @__PURE__ */ jsx("option", { children: value }, value))]
					}),
					/* @__PURE__ */ jsxs("label", {
						className: "pc-search",
						children: [/* @__PURE__ */ jsx(Search, { size: 14 }), /* @__PURE__ */ jsx("input", {
							"aria-label": "Search calendar vehicles",
							placeholder: "Search vehicle or plate",
							value: query,
							onChange: (event) => setQuery(event.target.value)
						})]
					}),
					/* @__PURE__ */ jsxs("label", {
						className: "pc-checkbox",
						children: [/* @__PURE__ */ jsx("input", {
							type: "checkbox",
							checked: showInactive,
							onChange: (event) => setShowInactive(event.target.checked)
						}), "Show inactive"]
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "pc-legend",
				children: [
					Object.entries(labels).map(([key, label]) => /* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx("i", { className: `pc-swatch pc-status--${key}` }), label] }, key)),
					conflicts > 0 && /* @__PURE__ */ jsxs("span", {
						className: "pc-conflicts",
						children: [
							/* @__PURE__ */ jsx(TriangleAlert, { size: 13 }),
							conflicts,
							" scheduling conflict",
							conflicts === 1 ? "" : "s"
						]
					}),
					/* @__PURE__ */ jsxs("small", { children: ["Click a booking for details", view !== "day" ? " · Click a date for hourly view" : ""] })
				]
			}),
			view === "agenda" ? /* @__PURE__ */ jsx("div", {
				className: "pc-agenda",
				children: agenda.length ? agenda.map(({ booking, car }) => /* @__PURE__ */ jsxs("button", {
					onClick: () => onView(booking),
					className: "pc-agenda-row",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: `pc-agenda-status pc-status--${planningStatus(booking, now)}`,
							children: labels[planningStatus(booking, now)]
						}),
						/* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsxs("strong", { children: [
							car.model,
							" · ",
							car.plateNumber
						] }), /* @__PURE__ */ jsxs("small", { children: [
							booking.customerName,
							" · ",
							booking.phone
						] })] }),
						/* @__PURE__ */ jsxs("span", { children: [
							dateLabel(booking.startDatetime, {
								day: "numeric",
								month: "short"
							}),
							" ",
							timeLabel(booking.startDatetime),
							" → ",
							dateLabel(booking.endDatetime, {
								day: "numeric",
								month: "short"
							}),
							" ",
							timeLabel(booking.endDatetime)
						] }),
						/* @__PURE__ */ jsx(Eye, { size: 16 })
					]
				}, booking.id)) : /* @__PURE__ */ jsx("p", {
					className: "pc-empty",
					children: "No bookings in this period."
				})
			}) : /* @__PURE__ */ jsx("div", {
				className: "pc-scroll",
				tabIndex: 0,
				"aria-label": "Vehicle booking timeline. Scroll horizontally to see all dates.",
				children: /* @__PURE__ */ jsxs("div", {
					className: "pc-grid",
					style: { width: trackWidth + 220 },
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "pc-grid-header",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "pc-resource-label",
								children: ["VEHICLE ", /* @__PURE__ */ jsxs("span", { children: [visibleCars.length, " units"] })]
							}), /* @__PURE__ */ jsx("div", {
								className: "pc-days",
								style: { width: trackWidth },
								children: Array.from({ length: cells }, (_, index) => {
									const value = start + index * (view === "day" ? DAY_MS / 24 : DAY_MS);
									const isToday = indiaDay(value) === today;
									return /* @__PURE__ */ jsxs("button", {
										style: { width: cellWidth },
										className: isToday ? "pc-today" : "",
										onClick: () => {
											setAnchor(indiaDay(value));
											setView("day");
										},
										"aria-label": `Hourly view for ${dateLabel(value, {
											day: "numeric",
											month: "long"
										})}`,
										children: [/* @__PURE__ */ jsx("small", { children: view === "day" ? dateLabel(value, { weekday: "short" }) : dateLabel(value, {
											weekday: "short",
											month: "short"
										}) }), /* @__PURE__ */ jsx("strong", { children: view === "day" ? timeLabel(value) : dateLabel(value, { day: "numeric" }) })]
									}, index);
								})
							})]
						}),
						rows.map(({ car, bars, lanes }) => /* @__PURE__ */ jsxs("div", {
							className: "pc-vehicle-row",
							style: { height: Math.max(68, lanes * 38 + 18) },
							children: [/* @__PURE__ */ jsxs("div", {
								className: "pc-resource",
								children: [/* @__PURE__ */ jsx("span", { className: `pc-car-dot ${bookings.some((booking) => booking.vehicleId === car.id && isOnTrip(booking, now)) ? "pc-car-out" : ""}` }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("strong", { children: car.model || car.name }), /* @__PURE__ */ jsxs("small", { children: [car.plateNumber, !car.active ? " · Inactive" : ""] })] })]
							}), /* @__PURE__ */ jsxs("div", {
								className: "pc-track",
								style: {
									width: trackWidth,
									backgroundSize: `${cellWidth}px 100%`
								},
								children: [
									view !== "day" && today >= anchor && dayStart(today) < end && /* @__PURE__ */ jsx("div", {
										className: "pc-today-shade",
										style: {
											left: (dayStart(today) - start) / (end - start) * 100 + "%",
											width: 100 / days + "%"
										}
									}),
									nowPosition >= 0 && nowPosition <= 100 && /* @__PURE__ */ jsx("div", {
										className: "pc-now-line",
										style: { left: nowPosition + "%" }
									}),
									bars.map(({ booking, lane, left, width }) => /* @__PURE__ */ jsxs("button", {
										className: `pc-booking pc-status--${planningStatus(booking, now)}`,
										style: {
											left: `${left}%`,
											width: `${width}%`,
											top: lane * 38 + 10
										},
										onClick: () => onView(booking),
										title: `${booking.customerName} · ${booking.id}\n${dateLabel(booking.startDatetime, {
											day: "numeric",
											month: "short"
										})} ${timeLabel(booking.startDatetime)} → ${dateLabel(booking.endDatetime, {
											day: "numeric",
											month: "short"
										})} ${timeLabel(booking.endDatetime)}\n${labels[planningStatus(booking, now)]}`,
										"aria-label": `View ${booking.customerName}, ${car.plateNumber}, ${labels[planningStatus(booking, now)]}`,
										children: [
											/* @__PURE__ */ jsx("span", { children: timeLabel(booking.startDatetime) }),
											/* @__PURE__ */ jsx("strong", { children: booking.customerName }),
											/* @__PURE__ */ jsx("span", { children: timeLabel(booking.endDatetime) })
										]
									}, booking.id))
								]
							})]
						}, car.id)),
						!rows.length && /* @__PURE__ */ jsx("p", {
							className: "pc-empty",
							children: "No vehicles match these filters."
						})
					]
				})
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "pc-footer",
				children: [/* @__PURE__ */ jsxs("span", { children: [
					/* @__PURE__ */ jsx("span", { className: "pc-live-dot" }),
					"Last updated ",
					timeLabel(updatedAt)
				] }), /* @__PURE__ */ jsx("span", { children: "All times are in India time · Overdue bookings remain active until return is recorded." })]
			})
		]
	});
}
//#endregion
export { PlanningCalendar as default };
