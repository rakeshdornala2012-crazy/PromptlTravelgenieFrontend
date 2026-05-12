import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Plane,
  Hotel,
  Compass,
  Utensils,
  Calendar,
  Clock,
  Star,
  Navigation,
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Nav from "@/components/Nav";
import { useTrips, type SavedTrip, type TripActivity } from "@/hooks/useTrips";
import { getCityCenter, type LatLng } from "@/lib/geocode";

// ── Day colors ────────────────────────────────────────────────
const DAY_COLORS = [
  "#3B82F6", // blue
  "#10B981", // emerald
  "#F59E0B", // amber
  "#EF4444", // red
  "#8B5CF6", // violet
  "#EC4899", // pink
  "#06B6D4", // cyan
  "#F97316", // orange
];

const HOTEL_COLOR = "#F59E0B";

// ── Custom marker icons ───────────────────────────────────────
function createDayIcon(day: number) {
  const color = DAY_COLORS[(day - 1) % DAY_COLORS.length];
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="
      width: 28px; height: 28px;
      background: ${color};
      border: 2px solid white;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 700; color: white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    ">${day}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });
}

function createHotelIcon() {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="
      width: 32px; height: 32px;
      background: ${HOTEL_COLOR};
      border: 2px solid white;
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      font-size: 14px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    ">🏨</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
}

// ── Map bounds fitter ─────────────────────────────────────────
function FitBounds({ points }: { points: LatLng[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
  }, [points, map]);
  return null;
}

// ── Filter type ───────────────────────────────────────────────
type FilterType = "all" | "attractions" | "hotels" | "food";

// ── Main Component ────────────────────────────────────────────
export default function TripMapView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { trips } = useTrips();

  const trip = trips.find((t) => t.id === id);
  const [selectedDay, setSelectedDay] = useState<number | null>(null); // null = overview
  const [filter, setFilter] = useState<FilterType>("all");

  const itinerary = trip?.itinerary;
  const destination = trip?.destination || "";
  const nights = trip?.nights || 0;
  const totalDays = nights + 1;

  // Get all activities, filtered by day + category
  const activities = useMemo(() => {
    if (!itinerary) return [];
    let items = itinerary.activities || [];
    if (selectedDay !== null) {
      items = items.filter((a) => a.day === selectedDay);
    }
    if (filter === "food") {
      items = items.filter((a) => a.category.toLowerCase().includes("culinar") || a.category.toLowerCase().includes("food"));
    } else if (filter === "attractions") {
      items = items.filter((a) => !a.category.toLowerCase().includes("culinar") && !a.category.toLowerCase().includes("food"));
    }
    return items;
  }, [itinerary?.activities, selectedDay, filter]);

  // Points for map bounds (ignore corrupted coords)
  const mapPoints = useMemo(() => {
    const points: LatLng[] = [];
    if (itinerary?.hotel && !isNaN(itinerary.hotel.lat) && !isNaN(itinerary.hotel.lng)) {
      points.push({ lat: itinerary.hotel.lat, lng: itinerary.hotel.lng });
    }
    activities.forEach((a) => {
      if (!isNaN(a.lat) && !isNaN(a.lng)) {
        points.push({ lat: a.lat, lng: a.lng });
      }
    });
    if (points.length === 0 && destination) {
      const center = getCityCenter(destination);
      points.push(center);
    }
    return points;
  }, [activities, itinerary?.hotel, destination]);

  // Route lines grouped by day (ignoring invalid coordinates)
  const routeLines = useMemo(() => {
    if (!itinerary) return [];
    const lines: { day: number; positions: [number, number][] }[] = [];
    const activitiesArr = itinerary.activities || [];
    const days = selectedDay !== null ? [selectedDay] : Array.from(new Set(activitiesArr.map((a) => a.day || 1))).sort();

    for (const day of days) {
      const dayActivities = activitiesArr
        .filter((a) => (a.day || 1) === day && !isNaN(a.lat) && !isNaN(a.lng))
        .sort((a, b) => activitiesArr.indexOf(a) - activitiesArr.indexOf(b));

      if (dayActivities.length > 0) {
        const positions: [number, number][] = [];
        // Start from hotel
        if (itinerary.hotel && !isNaN(itinerary.hotel.lat) && !isNaN(itinerary.hotel.lng)) {
          positions.push([itinerary.hotel.lat, itinerary.hotel.lng]);
        }
        dayActivities.forEach((a) => positions.push([a.lat, a.lng]));
        // Return to hotel
        if (itinerary.hotel && !isNaN(itinerary.hotel.lat) && !isNaN(itinerary.hotel.lng)) {
          positions.push([itinerary.hotel.lat, itinerary.hotel.lng]);
        }
        if (positions.length > 0) {
          lines.push({ day, positions });
        }
      }
    }
    return lines;
  }, [itinerary, selectedDay]);

  if (!trip || !itinerary) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <Nav />
        <div className="mx-auto max-w-3xl px-4 pt-32 text-center">
          <p className="text-muted-foreground">No itinerary data found — redirecting...</p>
          <button
            onClick={() => navigate("/trips")}
            className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground"
          >
            Back to Trips
          </button>
        </div>
      </main>
    );
  }

  const inr = (n: number) => "₹" + (n || 0).toLocaleString("en-IN");

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Nav />

      <div className="pt-20 h-screen flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/trips")}
              className="h-8 w-8 rounded-lg border border-white/10 grid place-items-center hover:bg-white/5 transition"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="font-display text-xl">
                {trip.emoji} {destination} <span className="text-muted-foreground font-light">Itinerary</span>
              </h1>
              <p className="text-xs text-muted-foreground">
                {trip.country} · {nights} nights · {inr(trip.total)}
              </p>
            </div>
          </div>

          {/* Filter pills */}
          <div className="hidden sm:flex items-center gap-1.5">
            {([
              { key: "all", label: "All", icon: Compass },
              { key: "attractions", label: "Attractions", icon: MapPin },
              { key: "hotels", label: "Hotels", icon: Hotel },
              { key: "food", label: "Food", icon: Utensils },
            ] as const).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                  filter === key
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "text-muted-foreground hover:text-foreground border border-white/10 hover:border-white/20"
                }`}
              >
                <Icon className="h-3 w-3" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Split pane: Timeline + Map */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* LEFT: Day tabs + Timeline */}
          <div className="lg:w-[400px] xl:w-[440px] shrink-0 flex flex-col border-r border-white/10 overflow-hidden">
            {/* Day tabs */}
            <div className="flex items-center gap-1 px-4 py-3 border-b border-white/10 overflow-x-auto shrink-0">
              <button
                onClick={() => setSelectedDay(null)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                  selectedDay === null
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "text-muted-foreground border border-white/10 hover:border-white/20"
                }`}
              >
                Overview
              </button>
              {Array.from({ length: totalDays }, (_, i) => i + 1).map((day) => {
                const color = DAY_COLORS[(day - 1) % DAY_COLORS.length];
                const isActive = selectedDay === day;
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                      isActive
                        ? "text-white border"
                        : "text-muted-foreground border border-white/10 hover:border-white/20"
                    }`}
                    style={isActive ? { background: `${color}20`, borderColor: `${color}50`, color } : {}}
                  >
                    Day {day}
                  </button>
                );
              })}
            </div>

            {/* Timeline content */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {/* Hotel card */}
              {itinerary.hotel && (filter === "all" || filter === "hotels") && (
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-8 w-8 rounded-lg bg-amber-500/20 grid place-items-center">
                      <Hotel className="h-4 w-4 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{itinerary.hotel.name}</p>
                      <p className="text-[10px] text-muted-foreground">{itinerary.hotel.area} · {inr(itinerary.hotel.pricePerNight)}/night</p>
                    </div>
                  </div>
                  <p className="text-xs text-amber-400/80">
                    🏨 Stay for {nights} nights · {inr(itinerary.hotel.price)} total
                  </p>
                </motion.div>
              )}

              {/* Flight card */}
              {itinerary.flight && selectedDay === null && (
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 }}
                  className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-4"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-sky-500/20 grid place-items-center">
                      <Plane className="h-4 w-4 text-sky-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{itinerary.flight.carrier}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {itinerary.flight.route} · {inr(itinerary.flight.price)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* "To be planned" section */}
              {selectedDay !== null && activities.length === 0 && (
                <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center">
                  <p className="text-muted-foreground text-sm">No activities for Day {selectedDay}</p>
                  <p className="text-xs text-muted-foreground mt-1">This day is free to explore!</p>
                </div>
              )}

              {/* Activity cards */}
              <AnimatePresence mode="popLayout">
                {activities.map((activity, i) => {
                  const safeDay = activity.day || 1;
                  const color = DAY_COLORS[(safeDay - 1) % DAY_COLORS.length] || DAY_COLORS[0];
                  return (
                    <motion.div
                      key={`${activity.name}-${safeDay}-${i}`}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ delay: i * 0.04 }}
                      className="relative rounded-2xl border border-white/10 bg-gradient-card p-4 hover:border-white/20 transition-all group"
                    >
                      {/* Day color bar */}
                      <div
                        className="absolute left-0 top-3 bottom-3 w-1 rounded-full"
                        style={{ background: color }}
                      />
                      <div className="pl-4">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-medium">{activity.name}</p>
                            <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                              <span
                                className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5"
                                style={{ background: `${color}15`, color }}
                              >
                                Day {safeDay}
                              </span>
                              <span className="flex items-center gap-0.5">
                                <Clock className="h-2.5 w-2.5" />
                                {activity.duration}
                              </span>
                              <span>{activity.category}</span>
                            </div>
                          </div>
                          {activity.price !== undefined && activity.price > 0 && (
                            <span className="text-xs font-medium text-primary shrink-0">{inr(activity.price)}</span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Transport */}
              {itinerary.transport && selectedDay === null && filter === "all" && (
                <div className="rounded-2xl border border-white/10 bg-gradient-card p-4 mt-4">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Navigation className="h-3 w-3" /> Transport
                  </p>
                  {itinerary.transport.map((t) => (
                    <div key={t.name} className="flex items-center justify-between text-sm py-1">
                      <span>{t.name}</span>
                      <span className="text-primary">{inr(t.price)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Interactive Map */}
          <div className="flex-1 relative min-h-[300px]">
            <MapContainer
              center={[mapPoints[0]?.lat ?? 0, mapPoints[0]?.lng ?? 0]}
              zoom={12}
              style={{ height: "100%", width: "100%", background: "#1a1a2e" }}
              zoomControl={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />

              <FitBounds points={mapPoints} />

              {/* Hotel marker */}
              {itinerary.hotel && (filter === "all" || filter === "hotels") && (
                <Marker
                  position={[itinerary.hotel.lat, itinerary.hotel.lng]}
                  icon={createHotelIcon()}
                >
                  <Popup>
                    <div style={{ color: "#1a1a2e", minWidth: 160 }}>
                      <strong>{itinerary.hotel.name}</strong>
                      <br />
                      <span style={{ fontSize: 11 }}>{itinerary.hotel.area}</span>
                      <br />
                      <span style={{ fontSize: 11, color: "#c98a3a" }}>
                        {inr(itinerary.hotel.pricePerNight)}/night · {nights}n
                      </span>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Activity markers */}
              {activities.filter(a => !isNaN(a.lat) && !isNaN(a.lng)).map((activity, i) => {
                const safeDay = activity.day || 1;
                return (
                <Marker
                  key={`${activity.name}-${safeDay}-${i}`}
                  position={[activity.lat, activity.lng]}
                  icon={createDayIcon(safeDay)}
                >
                  <Popup>
                    <div style={{ color: "#1a1a2e", minWidth: 140 }}>
                      <strong>{activity.name}</strong>
                      <br />
                      <span style={{ fontSize: 11 }}>
                        Day {safeDay} · {activity.duration} · {activity.category}
                      </span>
                      {activity.price !== undefined && activity.price > 0 && (
                        <>
                          <br />
                          <span style={{ fontSize: 11, color: "#c98a3a" }}>{inr(activity.price)}</span>
                        </>
                      )}
                    </div>
                  </Popup>
                </Marker>
              )})}

              {/* Route polylines */}
              {routeLines.map((line) => (
                <Polyline
                  key={`route-${line.day}`}
                  positions={line.positions}
                  pathOptions={{
                    color: DAY_COLORS[(line.day - 1) % DAY_COLORS.length],
                    weight: 3,
                    opacity: 0.7,
                    dashArray: "8 6",
                  }}
                />
              ))}
            </MapContainer>

            {/* Day legend overlay */}
            <div className="absolute bottom-4 left-4 z-[1000] flex flex-wrap gap-1.5">
              {Array.from(new Set(itinerary?.activities.map((a) => a.day || 1) || []))
                .sort()
                .map((day) => {
                  const color = DAY_COLORS[(day - 1) % DAY_COLORS.length] || DAY_COLORS[0];
                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(selectedDay === day ? null : day)}
                      className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium backdrop-blur-xl transition-all"
                      style={{
                        background: selectedDay === day ? `${color}30` : "rgba(0,0,0,0.6)",
                        border: `1px solid ${selectedDay === day ? color : "rgba(255,255,255,0.15)"}`,
                        color: selectedDay === day ? color : "rgba(255,255,255,0.7)",
                      }}
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: color }}
                      />
                      Day {day}
                    </button>
                  );
                })}
            </div>

            {/* Price summary overlay */}
            <div className="absolute top-4 right-4 z-[1000] backdrop-blur-xl rounded-2xl border border-white/10 bg-black/60 p-3">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Trip Total</p>
              <p className="font-display text-2xl text-primary">{inr(trip.total)}</p>
              <p className="text-[10px] text-muted-foreground">{destination} · {nights}n</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
