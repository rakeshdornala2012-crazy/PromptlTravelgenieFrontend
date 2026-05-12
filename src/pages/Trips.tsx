import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, MapPin, ArrowUpRight, Plus, Trash2 } from "lucide-react";
import Nav from "@/components/Nav";
import PageTransition from "@/components/PageTransition";
import { useCurrency } from "@/lib/currency";
import { useTrips } from "@/hooks/useTrips";

const Trips = () => {
  const { trips, removeTrip } = useTrips();
  const { format } = useCurrency();
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  const filtered = trips.filter((t) => t.status === tab);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const daysUntil = (iso: string) => {
    const start = new Date(iso).getTime();
    const now = Date.now();
    const days = Math.ceil((start - now) / (1000 * 60 * 60 * 24));
    if (days < 0) return null;
    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    return days + " days away";
  };

  return (
    <PageTransition>
      <main className="min-h-screen bg-background text-foreground">
        <Nav />

        <section className="pt-32 pb-12 px-4">
          <div className="mx-auto max-w-5xl">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <h1 className="font-display text-5xl font-light leading-tight">
                  My <span className="italic text-primary">trips</span>
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Everywhere you've been and everywhere you're going
                </p>
              </div>
              <Link
                to="/plan"
                className="group inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2.5 text-sm font-medium text-background hover:bg-primary hover:text-primary-foreground transition-colors w-fit"
              >
                <Plus className="h-4 w-4" />
                Plan a new trip
              </Link>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 rounded-full border border-white/10 bg-secondary/30 p-1 w-fit mb-8">
              {(["upcoming", "past"] as const).map((t) => {
                const count = trips.filter((tr) => tr.status === t).length;
                return (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={
                      "rounded-full px-4 py-1.5 text-sm transition-all " +
                      (tab === t
                        ? "bg-primary/20 text-primary"
                        : "text-muted-foreground hover:text-foreground")
                    }
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                    <span className="ml-1.5 text-xs opacity-60">{count}</span>
                  </button>
                );
              })}
            </div>

            {/* Trips grid */}
            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filtered.map((trip, i) => (
                  <motion.div
                    key={trip.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                    whileHover={{ y: -4 }}
                    className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-card transition-all hover:border-primary/30"
                  >
                    {/* Cover */}
                    <div className="relative h-44 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent flex items-center justify-center">
                      <span className="text-7xl">{trip.emoji}</span>
                      {trip.status === "upcoming" && daysUntil(trip.startDate) && (
                        <div className="absolute top-3 left-3 rounded-full bg-primary/20 backdrop-blur border border-primary/40 px-2.5 py-1 text-[10px] uppercase tracking-widest text-primary">
                          {daysUntil(trip.startDate)}
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          if (confirm("Remove " + trip.destination + "?")) {
                            removeTrip(trip.id);
                          }
                        }}
                        className="absolute top-3 right-3 grid h-7 w-7 place-items-center rounded-full bg-black/40 backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500/30"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Body */}
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-display text-2xl">
                            {trip.destination}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {trip.country} · {trip.nights} nights
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                            Total
                          </div>
                          <div className="font-display text-lg text-primary">
                            {format(trip.total)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3 w-3" />
                          {formatDate(trip.startDate)} → {formatDate(trip.endDate)}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link
                          to={"/itinerary?dest=" + trip.destination}
                          className="group/btn flex-1 flex items-center justify-between rounded-2xl border border-white/10 px-4 py-2.5 text-sm hover:border-primary/40 hover:bg-secondary/60 transition-all"
                        >
                          <span className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5" />
                            View itinerary
                          </span>
                          <ArrowUpRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                        </Link>
                        {trip.itinerary && (
                          <Link
                            to={`/trips/${trip.id}/map`}
                            className="group/map flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-2.5 text-sm text-emerald-400 hover:border-emerald-500/40 hover:bg-emerald-500/10 transition-all"
                          >
                            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                              <line x1="8" y1="2" x2="8" y2="18" />
                              <line x1="16" y1="6" x2="16" y2="22" />
                            </svg>
                            Map
                          </Link>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl border border-dashed border-white/10 p-12 text-center"
              >
                <div className="text-5xl mb-4">{tab === "upcoming" ? "✈️" : "📸"}</div>
                <div className="font-display text-xl mb-2">
                  No {tab} trips yet
                </div>
                <div className="text-sm text-muted-foreground mb-6">
                  {tab === "upcoming"
                    ? "Plan your next adventure — Voya's got you."
                    : "Once you take a trip, it'll show up here."}
                </div>
                <Link
                  to="/explore"
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  Explore destinations
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </motion.div>
            )}
          </div>
        </section>
      </main>
    </PageTransition>
  );
};

export default Trips;
