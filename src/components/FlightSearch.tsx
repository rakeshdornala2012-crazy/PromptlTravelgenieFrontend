import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Plane, Search, ArrowRight, Clock, Users, ChevronDown, Loader2, ArrowLeftRight } from "lucide-react";
import { searchFlights, searchAirport, AIRPORT_MAP, type Flight, type FlightSearchParams } from "@/lib/flights";

const inr = (n: number) => "₹" + n.toLocaleString("en-IN");

const formatTime = (iso: string) => {
  if (!iso) return "--:--";
  try { return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false }); }
  catch { return iso; }
};

const CABIN_CLASSES = ["economy", "premium_economy", "business", "first"] as const;
const POPULAR_ROUTES = [
  { from: "DEL", to: "DPS", label: "Delhi → Bali" },
  { from: "DEL", to: "MLE", label: "Delhi → Maldives" },
  { from: "BOM", to: "DXB", label: "Mumbai → Dubai" },
  { from: "BLR", to: "SIN", label: "Bengaluru → Singapore" },
  { from: "DEL", to: "HKT", label: "Delhi → Phuket" },
];

interface AirportOption { skyId: string; entityId: string; name: string; iata: string }

export default function FlightSearch() {
  const [fromCode, setFromCode] = useState("DEL");
  const [toCode, setToCode] = useState("DPS");
  const [fromSearch, setFromSearch] = useState("Delhi (DEL)");
  const [toSearch, setToSearch] = useState("Bali (DPS)");
  const [fromResults, setFromResults] = useState<AirportOption[]>([]);
  const [toResults, setToResults] = useState<AirportOption[]>([]);
  const [date, setDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  });
  const [adults, setAdults] = useState(1);
  const [cabinClass, setCabinClass] = useState<FlightSearchParams["cabinClass"]>("economy");
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchingFrom, setSearchingFrom] = useState(false);
  const [searchingTo, setSearchingTo] = useState(false);

  const handleAirportSearch = async (query: string, direction: "from" | "to") => {
    if (query.length < 2) return;
    const results = await searchAirport(query);
    // Supplement with local map
    const localMatches = Object.entries(AIRPORT_MAP)
      .filter(([code, info]) =>
        code.toLowerCase().includes(query.toLowerCase()) ||
        info.name.toLowerCase().includes(query.toLowerCase())
      )
      .map(([code, info]) => ({ skyId: info.skyId, entityId: info.entityId, name: info.name, iata: code }));

    const merged = [...localMatches, ...results.filter(r => !localMatches.find(l => l.iata === r.iata))].slice(0, 5);
    if (direction === "from") setFromResults(merged);
    else setToResults(merged);
  };

  const swap = () => {
    setFromCode(toCode); setToCode(fromCode);
    setFromSearch(toSearch); setToSearch(fromSearch);
  };

  const handleSearch = async () => {
    const origin = AIRPORT_MAP[fromCode];
    const dest = AIRPORT_MAP[toCode];
    if (!origin || !dest) return;

    setLoading(true);
    setSearched(true);
    const results = await searchFlights({
      originSkyId: origin.skyId,
      destinationSkyId: dest.skyId,
      originEntityId: origin.entityId,
      destinationEntityId: dest.entityId,
      date,
      adults,
      cabinClass,
      currency: "INR",
    });
    setFlights(results);
    setLoading(false);
  };

  return (
    <div className="w-full">
      {/* Search Card */}
      <div className="glass rounded-3xl p-6 shadow-elegant">
        <div className="flex items-center gap-2 mb-5">
          <div className="h-8 w-8 rounded-xl bg-primary/15 grid place-items-center">
            <Plane className="h-4 w-4 text-primary" />
          </div>
          <span className="font-display text-lg">Search Flights</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          {/* From */}
          <div className="relative">
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1.5">From</label>
            <div className="relative">
              <input
                value={fromSearch}
                onChange={(e) => { setFromSearch(e.target.value); setSearchingFrom(true); handleAirportSearch(e.target.value, "from"); }}
                onBlur={() => setTimeout(() => setSearchingFrom(false), 200)}
                placeholder="City or airport"
                className="w-full rounded-xl border border-white/10 bg-secondary/50 px-4 py-3 text-sm outline-none focus:border-primary/40 transition-colors"
              />
              {searchingFrom && fromResults.length > 0 && (
                <div className="absolute top-full mt-1 left-0 right-0 z-50 rounded-xl border border-white/10 bg-background/95 backdrop-blur shadow-xl overflow-hidden">
                  {fromResults.map((r) => (
                    <button key={r.iata} onMouseDown={() => { setFromCode(r.iata); setFromSearch(`${r.name} (${r.iata})`); setFromResults([]); }}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 transition-colors flex items-center gap-2">
                      <span className="font-mono text-xs text-primary">{r.iata}</span>
                      <span className="text-muted-foreground truncate">{r.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* To */}
          <div className="relative">
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1.5">To</label>
            <div className="relative flex gap-2">
              <button onClick={swap} className="shrink-0 h-11 w-11 rounded-xl border border-white/10 bg-secondary/50 grid place-items-center hover:bg-white/10 transition-colors">
                <ArrowLeftRight className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
              <div className="flex-1 relative">
                <input
                  value={toSearch}
                  onChange={(e) => { setToSearch(e.target.value); setSearchingTo(true); handleAirportSearch(e.target.value, "to"); }}
                  onBlur={() => setTimeout(() => setSearchingTo(false), 200)}
                  placeholder="City or airport"
                  className="w-full rounded-xl border border-white/10 bg-secondary/50 px-4 py-3 text-sm outline-none focus:border-primary/40 transition-colors"
                />
                {searchingTo && toResults.length > 0 && (
                  <div className="absolute top-full mt-1 left-0 right-0 z-50 rounded-xl border border-white/10 bg-background/95 backdrop-blur shadow-xl overflow-hidden">
                    {toResults.map((r) => (
                      <button key={r.iata} onMouseDown={() => { setToCode(r.iata); setToSearch(`${r.name} (${r.iata})`); setToResults([]); }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 transition-colors flex items-center gap-2">
                        <span className="font-mono text-xs text-primary">{r.iata}</span>
                        <span className="text-muted-foreground truncate">{r.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div>
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1.5">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} min={new Date().toISOString().split("T")[0]}
              className="w-full rounded-xl border border-white/10 bg-secondary/50 px-4 py-3 text-sm outline-none focus:border-primary/40 transition-colors" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1.5">Passengers</label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <select value={adults} onChange={(e) => setAdults(Number(e.target.value))}
                className="w-full rounded-xl border border-white/10 bg-secondary/50 pl-8 pr-4 py-3 text-sm outline-none appearance-none">
                {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} Adult{n > 1 ? "s" : ""}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1.5">Class</label>
            <select value={cabinClass} onChange={(e) => setCabinClass(e.target.value as any)}
              className="w-full rounded-xl border border-white/10 bg-secondary/50 px-4 py-3 text-sm outline-none appearance-none capitalize">
              {CABIN_CLASSES.map(c => <option key={c} value={c}>{c.replace("_", " ")}</option>)}
            </select>
          </div>
        </div>

        {/* Popular routes */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {POPULAR_ROUTES.map((r) => (
            <button key={r.label} onClick={() => {
              setFromCode(r.from); setToCode(r.to);
              const o = AIRPORT_MAP[r.from]; const d = AIRPORT_MAP[r.to];
              setFromSearch(`${o?.name ?? r.from} (${r.from})`);
              setToSearch(`${d?.name ?? r.to} (${r.to})`);
            }}
              className="rounded-full border border-white/10 px-3 py-1 text-[11px] text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors">
              {r.label}
            </button>
          ))}
        </div>

        <button onClick={handleSearch} disabled={loading}
          className="w-full rounded-xl bg-gradient-amber py-3 font-medium text-sm text-primary-foreground flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          {loading ? "Searching flights..." : "Search Flights"}
        </button>
      </div>

      {/* Results */}
      <AnimatePresence>
        {searched && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg">
                {loading ? "Searching..." : `${flights.length} flights found`}
              </h3>
              {!loading && <span className="text-xs text-muted-foreground">{fromCode} → {toCode} · {new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>}
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="glass rounded-2xl p-4 animate-pulse">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="h-4 w-24 bg-white/10 rounded" />
                        <div className="h-3 w-16 bg-white/5 rounded" />
                      </div>
                      <div className="h-6 w-20 bg-white/10 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              flights.map((f, i) => (
                <motion.div key={f.flightNumber + i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                  className="glass rounded-2xl p-4 hover:border-primary/20 transition-colors cursor-pointer group">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      {f.logo ? (
                        <img src={f.logo} alt={f.airline} className="h-8 w-8 rounded-lg object-contain bg-white/10 p-1" />
                      ) : (
                        <div className="h-8 w-8 rounded-lg bg-primary/10 grid place-items-center shrink-0">
                          <Plane className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium">{f.airline}</div>
                        <div className="text-xs text-muted-foreground">{f.flightNumber}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-1 justify-center">
                      <div className="text-center">
                        <div className="font-display text-base">{formatTime(f.departure.scheduled)}</div>
                        <div className="text-[10px] text-muted-foreground">{f.departure.iata}</div>
                      </div>
                      <div className="flex-1 flex flex-col items-center gap-0.5">
                        <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" />{f.duration}
                        </div>
                        <div className="w-full flex items-center gap-1">
                          <div className="flex-1 h-px bg-white/20" />
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <div className="flex-1 h-px bg-white/20" />
                        </div>
                        <div className="text-[10px] text-muted-foreground">{f.stops}</div>
                      </div>
                      <div className="text-center">
                        <div className="font-display text-base">{formatTime(f.arrival.scheduled)}</div>
                        <div className="text-[10px] text-muted-foreground">{f.arrival.iata}</div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-display text-lg text-primary">{f.price ? inr(f.price) : "—"}</div>
                      <div className="text-[10px] text-muted-foreground">per person</div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-widest ${f.stops === "Direct" ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"}`}>
                        {f.stops}
                      </span>
                      <span className="text-[10px] text-muted-foreground capitalize">{cabinClass.replace("_", " ")}</span>
                    </div>
                    <button className="text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      Book now <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}

            {!loading && flights.length === 0 && (
              <div className="text-center py-10 text-muted-foreground">
                <div className="text-3xl mb-2">✈️</div>
                <div className="text-sm">No flights found for this route and date</div>
                <div className="text-xs mt-1">Try changing the date or route</div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
