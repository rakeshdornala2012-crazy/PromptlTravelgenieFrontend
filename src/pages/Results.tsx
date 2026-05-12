import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Nav from "@/components/Nav";
import {
  Plane, Hotel, Compass, Sparkles, Loader2, ArrowRight,
  Star, Clock, MapPin, Search, ChevronRight, Wifi,
  Users, Calendar, Zap, Trophy, Filter, SortAsc
} from "lucide-react";
import { getLiveFlights } from "@/lib/flights";
import { searchHotels } from "@/lib/hotels";
import { getAttractions } from "@/lib/attractions";
import { getWeather } from "@/lib/weather";
import { chat } from "@/lib/gemini";

const inr = (n: number) => "₹" + n.toLocaleString("en-IN");
const fmtTime = (iso: string) => { try { return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false }); } catch { return "--:--"; } };
const fmtDate = (iso: string) => { try { return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); } catch { return iso; } };
const nights = (ci: string, co: string) => Math.max(1, Math.round((new Date(co).getTime() - new Date(ci).getTime()) / 86400000));

type Tab = "overview" | "flights" | "hotels" | "things";

export default function ResultsPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const query   = params.get("q") ?? "";
  const intent  = params.get("intent") ?? "full_trip";
  const dest    = params.get("dest") ?? "";
  const origin  = params.get("origin") ?? "DEL";
  const checkIn = params.get("checkIn") ?? "";
  const checkOut= params.get("checkOut") ?? "";
  const adults  = Number(params.get("adults") ?? 2);
  const aiReply = params.get("reply") ?? "";

  const [tab, setTab]         = useState<Tab>("overview");
  const [flights, setFlights] = useState<any[]>([]);
  const [hotels, setHotels]   = useState<any[]>([]);
  const [things, setThings]   = useState<any[]>([]);
  const [weather, setWeather] = useState<any>(null);
  const [aiSummary, setAiSummary] = useState(aiReply);
  const [loadingF, setLoadingF]   = useState(false);
  const [loadingH, setLoadingH]   = useState(false);
  const [loadingT, setLoadingT]   = useState(false);
  const [newQuery, setNewQuery]   = useState("");
  const [sortHotels, setSortHotels] = useState<"price"|"rating">("rating");

  const destCap = dest ? dest.charAt(0).toUpperCase() + dest.slice(1) : "";
  const ci  = checkIn  || (() => { const d = new Date(); d.setDate(d.getDate() + 14); return d.toISOString().split("T")[0]; })();
  const co  = checkOut || (() => { const d = new Date(); d.setDate(d.getDate() + 21); return d.toISOString().split("T")[0]; })();
  const nts = nights(ci, co);

  useEffect(() => {
    if (!dest) return;
    if (intent !== "hotels" && intent !== "attractions") {
      setLoadingF(true);
      getLiveFlights(origin.toUpperCase().slice(0,3), dest.toUpperCase().slice(0,3))
        .then(setFlights).finally(() => setLoadingF(false));
    }
    if (intent !== "flights") {
      setLoadingH(true);
      searchHotels({ destination: dest, checkIn: ci, checkOut: co, adults })
        .then(setHotels).finally(() => setLoadingH(false));
      setLoadingT(true);
      getAttractions(dest).then(setThings).finally(() => setLoadingT(false));
    }
    getWeather(dest).then(setWeather).catch(() => {});
  }, []);

  useEffect(() => {
    if (!aiSummary && query) {
      chat(query).then(r => setAiSummary(r.reply)).catch(() => {});
    }
  }, []);

  const refine = async (q: string) => {
    if (!q.trim()) return;
    const r = await chat(q);
    const p = new URLSearchParams();
    p.set("q", q); p.set("intent", r.intent.type);
    if (r.intent.destination) p.set("dest", r.intent.destination);
    if (r.intent.origin)      p.set("origin", r.intent.origin);
    if (r.intent.checkIn)     p.set("checkIn", r.intent.checkIn);
    if (r.intent.checkOut)    p.set("checkOut", r.intent.checkOut);
    if (r.intent.adults)      p.set("adults", String(r.intent.adults));
    p.set("reply", r.reply);
    navigate(`/results?${p.toString()}`);
  };

  const sortedHotels = [...hotels].sort((a, b) =>
    sortHotels === "price" ? a.pricePerNight - b.pricePerNight : b.rating - a.rating
  );

  const topHotel    = sortedHotels[0];
  const otherHotels = sortedHotels.slice(1);
  const cheapFlight = flights.length ? flights.reduce((a, b) => (a.price ?? 999999) < (b.price ?? 999999) ? a : b) : null;

  const isLoading = loadingF || loadingH || loadingT;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Nav />

      {/* ── Sticky search bar ── */}
      <div className="sticky top-0 z-40 border-b border-white/10 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2 rounded-xl border border-white/10 bg-secondary/50 px-4 py-2.5">
            <Sparkles className="h-4 w-4 text-primary shrink-0" />
            <input value={newQuery} onChange={e => setNewQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && refine(newQuery || query)}
              placeholder={query || "Refine your search..."}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
          </div>
          <button onClick={() => refine(newQuery || query)}
            className="h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Search className="h-3.5 w-3.5" /> Search
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8">

        {/* ── Destination hero header ── */}
        {dest && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-widest text-primary mb-1">
                {origin.toUpperCase()} → {dest.toUpperCase()} · {adults} guest{adults > 1 ? "s" : ""}
              </div>
              <h1 className="font-display text-4xl sm:text-5xl font-light">{destCap}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{fmtDate(ci)} — {fmtDate(co)}</span>
                <span className="text-white/20">·</span>
                <span>{nts} night{nts > 1 ? "s" : ""}</span>
                {weather && <><span className="text-white/20">·</span><span>🌤 {weather.temp ?? weather.temperature ?? "--"}°C</span></>}
              </div>
            </div>

            {/* Price summary pills */}
            <div className="flex gap-2 shrink-0">
              {cheapFlight && (
                <div className="rounded-2xl border border-primary/20 bg-primary/10 px-4 py-2.5 text-center">
                  <div className="text-[10px] uppercase tracking-widest text-primary/70 mb-0.5">Flights from</div>
                  <div className="font-display text-xl text-primary">{inr(cheapFlight.price ?? 0)}</div>
                </div>
              )}
              {topHotel && (
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-2.5 text-center">
                  <div className="text-[10px] uppercase tracking-widest text-amber-400/70 mb-0.5">Hotels from</div>
                  <div className="font-display text-xl text-amber-400">{inr(Math.min(...hotels.map(h => h.pricePerNight ?? 99999)))}</div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── AI Brain card ── */}
        {aiSummary && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="mb-8 rounded-2xl border border-primary/20 bg-primary/5 p-4 flex items-start gap-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-amber grid place-items-center shrink-0 mt-0.5">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] uppercase tracking-widest text-primary mb-1">Promptly AI</div>
              <p className="text-sm leading-relaxed text-foreground"
                dangerouslySetInnerHTML={{ __html: aiSummary.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br/>") }} />
            </div>
          </motion.div>
        )}

        {/* ── Tabs ── */}
        {dest && (
          <div className="flex gap-1 mb-8 border-b border-white/10 pb-0">
            {([
              { key: "overview", label: "Overview",     icon: Sparkles },
              { key: "flights",  label: `Flights (${flights.length})`,  icon: Plane },
              { key: "hotels",   label: `Hotels (${hotels.length})`,    icon: Hotel },
              { key: "things",   label: "Things to do", icon: Compass },
            ] as const).map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setTab(key as Tab)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${tab === key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                <Icon className="h-3.5 w-3.5" />{label}
              </button>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">

          {/* ── OVERVIEW ── */}
          {(!dest || tab === "overview") && (
            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="space-y-10">

              {/* Top pick hotel */}
              {(loadingH || topHotel) && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Trophy className="h-4 w-4 text-amber-400" />
                    <h2 className="font-display text-lg uppercase tracking-widest text-amber-400">Top Pick</h2>
                  </div>
                  {loadingH ? <SkeletonHero /> : topHotel && <TopPickCard hotel={topHotel} nights={nts} />}
                </section>
              )}

              {/* Cheapest flight */}
              {(loadingF || cheapFlight) && (
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display text-lg flex items-center gap-2"><Plane className="h-4 w-4 text-primary" />Best Flight</h2>
                    {flights.length > 1 && <button onClick={() => setTab("flights")} className="text-xs text-primary flex items-center gap-1">+{flights.length - 1} more <ChevronRight className="h-3 w-3" /></button>}
                  </div>
                  {loadingF ? <SkeletonRow /> : cheapFlight && <FlightRow f={cheapFlight} highlight />}
                </section>
              )}

              {/* Other hotels */}
              {(loadingH || otherHotels.length > 0) && (
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display text-lg flex items-center gap-2"><Hotel className="h-4 w-4 text-primary" />More Hotels</h2>
                    {hotels.length > 3 && <button onClick={() => setTab("hotels")} className="text-xs text-primary flex items-center gap-1">See all <ChevronRight className="h-3 w-3" /></button>}
                  </div>
                  {loadingH ? <SkeletonGrid count={2} /> : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {otherHotels.slice(0, 3).map((h, i) => <HotelCard key={h.id} hotel={h} nights={nts} i={i} />)}
                    </div>
                  )}
                </section>
              )}

              {/* Things to do */}
              {(loadingT || things.length > 0) && (
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display text-lg flex items-center gap-2"><Compass className="h-4 w-4 text-primary" />Things to do</h2>
                    {things.length > 4 && <button onClick={() => setTab("things")} className="text-xs text-primary flex items-center gap-1">See all <ChevronRight className="h-3 w-3" /></button>}
                  </div>
                  {loadingT ? <SkeletonGrid count={4} /> : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {things.slice(0, 4).map((a, i) => <AttractionCard key={a.id} a={a} i={i} />)}
                    </div>
                  )}
                </section>
              )}

              {/* No dest fallback */}
              {!dest && (
                <div className="text-center py-20">
                  <div className="text-5xl mb-4">🌍</div>
                  <h2 className="font-display text-2xl mb-2">Where are we heading?</h2>
                  <p className="text-muted-foreground text-sm mb-8">Add a destination and dates to see real-time flights, hotels and activities.</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {["Plan a trip to Bali in May for 2", "Hotels in Dubai next weekend", "Flights from Delhi to Maldives June"].map(s => (
                      <button key={s} onClick={() => refine(s)}
                        className="rounded-full border border-white/10 px-4 py-2 text-sm text-muted-foreground hover:border-primary/40 hover:text-primary transition-all">
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ── FLIGHTS ── */}
          {tab === "flights" && (
            <motion.div key="flights" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-display text-xl">{flights.length} flights to {destCap}</h2>
                <span className="text-xs text-muted-foreground">{fmtDate(ci)}</span>
              </div>
              {loadingF ? <>{[1,2,3].map(i => <SkeletonRow key={i} />)}</> : flights.map((f, i) => <FlightRow key={i} f={f} i={i} />)}
            </motion.div>
          )}

          {/* ── HOTELS ── */}
          {tab === "hotels" && (
            <motion.div key="hotels" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl">{hotels.length} hotels in {destCap}</h2>
                <div className="flex items-center gap-2">
                  <SortAsc className="h-3.5 w-3.5 text-muted-foreground" />
                  <select value={sortHotels} onChange={e => setSortHotels(e.target.value as any)}
                    className="text-xs bg-secondary/50 border border-white/10 rounded-lg px-2 py-1.5 outline-none">
                    <option value="rating">Best rated</option>
                    <option value="price">Lowest price</option>
                  </select>
                </div>
              </div>
              {loadingH ? <SkeletonGrid count={6} /> : (
                <div className="space-y-4">
                  {sortedHotels.map((h, i) => <HotelRow key={h.id} hotel={h} nights={nts} i={i} />)}
                </div>
              )}
            </motion.div>
          )}

          {/* ── THINGS TO DO ── */}
          {tab === "things" && (
            <motion.div key="things" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h2 className="font-display text-xl mb-6">Things to do in {destCap}</h2>
              {loadingT ? <SkeletonGrid count={8} /> : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {things.map((a, i) => <AttractionCardLarge key={a.id} a={a} i={i} />)}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

// ── TOP PICK CARD (hero hotel) ────────────────────────────────
function TopPickCard({ hotel: h, nights: nts }: { hotel: any; nights: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="relative rounded-3xl overflow-hidden border border-amber-500/20 group cursor-pointer">
      <div className="relative h-56 sm:h-72 bg-secondary/50">
        {h.image
          ? <img src={h.image} alt={h.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          : <div className="w-full h-full bg-gradient-to-br from-amber-900/30 to-amber-600/10 flex items-center justify-center"><Hotel className="h-16 w-16 text-white/10" /></div>
        }
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-medium text-black uppercase tracking-widest flex items-center gap-1">
            <Trophy className="h-3 w-3" /> Top Pick
          </span>
          <span className="rounded-full bg-black/50 backdrop-blur px-2.5 py-1 text-xs text-white">{"★".repeat(h.stars)}</span>
        </div>
        <div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur px-3 py-1.5">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span className="text-sm font-medium text-white">{h.rating.toFixed(1)}</span>
          {h.reviewCount > 0 && <span className="text-xs text-white/50">({h.reviewCount.toLocaleString()})</span>}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-5 flex items-end justify-between">
          <div>
            <h3 className="font-display text-2xl text-white mb-1">{h.name}</h3>
            <div className="flex items-center gap-1.5 text-white/70 text-sm">
              <MapPin className="h-3.5 w-3.5" />{h.address || "—"}
            </div>
            {h.amenities?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {h.amenities.slice(0, 4).map((a: string) => (
                  <span key={a} className="rounded-full bg-white/15 backdrop-blur px-2.5 py-0.5 text-[11px] text-white">{a}</span>
                ))}
              </div>
            )}
          </div>
          <div className="text-right shrink-0 ml-4">
            <div className="font-display text-3xl text-white">{inr(h.pricePerNight)}</div>
            <div className="text-xs text-white/50">per night</div>
            <div className="text-sm text-amber-400 mt-0.5">{inr(h.pricePerNight * nts)} total</div>
            <button className="mt-3 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground flex items-center gap-2 hover:opacity-90 transition-opacity">
              Book Now <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── FLIGHT ROW ────────────────────────────────────────────────
function FlightRow({ f, i = 0, highlight = false }: { f: any; i?: number; highlight?: boolean }) {
  return (
    <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
      className={`rounded-2xl p-4 flex items-center justify-between gap-4 group cursor-pointer transition-all hover:border-primary/30 ${highlight ? "border border-primary/20 bg-primary/5" : "glass"}`}>
      <div className="flex items-center gap-3 min-w-0">
        {f.logo
          ? <img src={f.logo} className="h-9 w-9 rounded-xl object-contain bg-white/10 p-1.5 shrink-0" alt="" />
          : <div className="h-9 w-9 rounded-xl bg-primary/15 grid place-items-center shrink-0"><Plane className="h-4 w-4 text-primary" /></div>
        }
        <div>
          <div className="font-medium text-sm">{f.airline}</div>
          <div className="text-xs text-muted-foreground">{f.flightNumber}</div>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-1 justify-center">
        <div className="text-center">
          <div className="font-display text-lg">{fmtTime(f.departure.scheduled)}</div>
          <div className="text-[10px] text-muted-foreground uppercase">{f.departure.iata}</div>
        </div>
        <div className="flex-1 flex flex-col items-center gap-0.5 max-w-[120px]">
          <div className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="h-2.5 w-2.5" />{f.duration}</div>
          <div className="w-full flex items-center"><div className="flex-1 h-px bg-white/15" /><ArrowRight className="h-3 w-3 text-muted-foreground mx-0.5" /><div className="flex-1 h-px bg-white/15" /></div>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${f.stops === "Direct" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>{f.stops}</span>
        </div>
        <div className="text-center">
          <div className="font-display text-lg">{fmtTime(f.arrival.scheduled)}</div>
          <div className="text-[10px] text-muted-foreground uppercase">{f.arrival.iata}</div>
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="font-display text-xl text-primary">{f.price ? inr(f.price) : "—"}</div>
        <div className="text-[10px] text-muted-foreground">per person</div>
        <button className="mt-1.5 rounded-lg bg-primary/15 border border-primary/20 px-3 py-1.5 text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          Book <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </motion.div>
  );
}

// ── HOTEL CARD (grid) ─────────────────────────────────────────
function HotelCard({ hotel: h, nights: nts, i }: { hotel: any; nights: number; i: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
      className="glass rounded-2xl overflow-hidden group cursor-pointer hover:border-white/20 transition-all">
      <div className="relative h-40 bg-secondary/50">
        {h.image
          ? <img src={h.image} alt={h.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          : <div className="w-full h-full flex items-center justify-center"><Hotel className="h-10 w-10 text-white/10" /></div>
        }
        <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/60 backdrop-blur px-2 py-0.5 text-xs text-white">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />{h.rating.toFixed(1)}
        </div>
      </div>
      <div className="p-3">
        <div className="font-medium text-sm truncate mb-0.5">{h.name}</div>
        <div className="text-[10px] text-muted-foreground truncate flex items-center gap-1 mb-2"><MapPin className="h-2.5 w-2.5 shrink-0" />{h.address || "—"}</div>
        <div className="flex items-end justify-between">
          <div>
            <div className="font-display text-base text-primary">{inr(h.pricePerNight)}<span className="text-[10px] text-muted-foreground">/night</span></div>
            <div className="text-[10px] text-muted-foreground">{inr(h.pricePerNight * nts)} · {nts}n</div>
          </div>
          <button className="rounded-lg bg-primary/15 px-2.5 py-1.5 text-[11px] text-primary font-medium hover:bg-primary/25 transition-colors">Book</button>
        </div>
      </div>
    </motion.div>
  );
}

// ── HOTEL ROW (list view) ─────────────────────────────────────
function HotelRow({ hotel: h, nights: nts, i }: { hotel: any; nights: number; i: number }) {
  return (
    <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
      className="glass rounded-2xl overflow-hidden flex group cursor-pointer hover:border-white/20 transition-all">
      <div className="relative w-40 sm:w-52 shrink-0 bg-secondary/50">
        {h.image
          ? <img src={h.image} alt={h.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          : <div className="w-full h-full flex items-center justify-center"><Hotel className="h-8 w-8 text-white/10" /></div>
        }
      </div>
      <div className="flex-1 p-4 flex items-center justify-between gap-4 min-w-0">
        <div className="min-w-0">
          <div className="font-display text-base mb-0.5 truncate">{h.name}</div>
          <div className="flex items-center gap-2 mb-2">
            <span className="flex items-center gap-1 text-xs text-muted-foreground"><Star className="h-3 w-3 fill-amber-400 text-amber-400" />{h.rating.toFixed(1)}</span>
            <span className="text-white/20">·</span>
            <span className="text-xs text-muted-foreground">{"★".repeat(h.stars)}</span>
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1 mb-2 truncate"><MapPin className="h-3 w-3 shrink-0" />{h.address || "—"}</div>
          {h.amenities?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {h.amenities.slice(0, 3).map((a: string) => (
                <span key={a} className="rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] text-muted-foreground flex items-center gap-1"><Wifi className="h-2.5 w-2.5" />{a}</span>
              ))}
            </div>
          )}
        </div>
        <div className="text-right shrink-0">
          <div className="font-display text-xl text-primary">{inr(h.pricePerNight)}</div>
          <div className="text-[10px] text-muted-foreground">per night</div>
          <div className="text-xs text-amber-400 mt-0.5">{inr(h.pricePerNight * nts)} total</div>
          <button className="mt-3 rounded-xl bg-primary px-4 py-2 text-xs font-medium text-primary-foreground flex items-center gap-1.5 hover:opacity-90 transition-opacity">
            Book Now <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── ATTRACTION CARD (small) ───────────────────────────────────
function AttractionCard({ a, i }: { a: any; i: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
      className="glass rounded-2xl overflow-hidden group cursor-pointer hover:border-white/20 transition-all">
      <div className="relative h-28 bg-secondary/40">
        {a.image
          ? <img src={a.image} alt={a.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-900/20 to-transparent"><Compass className="h-8 w-8 text-white/10" /></div>
        }
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-2 left-2 right-2">
          <div className="text-xs font-medium text-white truncate">{a.name}</div>
          <div className={`text-[10px] mt-0.5 ${a.price === "Free" ? "text-emerald-400" : "text-amber-400"}`}>{a.price ?? "Free"}</div>
        </div>
      </div>
    </motion.div>
  );
}

// ── ATTRACTION CARD LARGE ─────────────────────────────────────
function AttractionCardLarge({ a, i }: { a: any; i: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
      className="glass rounded-2xl overflow-hidden group cursor-pointer hover:border-white/20 transition-all">
      <div className="relative h-44 bg-secondary/40">
        {a.image
          ? <img src={a.image} alt={a.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-900/20 to-transparent"><Compass className="h-12 w-12 text-white/10" /></div>
        }
        <div className="absolute top-2 left-2 rounded-full bg-black/50 backdrop-blur px-2.5 py-0.5 text-[10px] text-white capitalize">{a.category}</div>
        {a.rating > 0 && <div className="absolute top-2 right-2 flex items-center gap-0.5 rounded-full bg-black/50 backdrop-blur px-2 py-0.5 text-[10px] text-white"><Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />{a.rating.toFixed(1)}</div>}
      </div>
      <div className="p-3">
        <div className="font-medium text-sm truncate mb-1">{a.name}</div>
        {a.description && <p className="text-[11px] text-muted-foreground line-clamp-2 mb-2">{a.description}</p>}
        <div className="flex items-center justify-between text-xs">
          {a.duration && <span className="flex items-center gap-1 text-muted-foreground"><Clock className="h-3 w-3" />{a.duration}</span>}
          <span className={`font-medium ${a.price === "Free" ? "text-emerald-400" : "text-primary"}`}>{a.price ?? "Free"}</span>
        </div>
      </div>
    </motion.div>
  );
}

// ── Skeletons ─────────────────────────────────────────────────
function SkeletonRow() {
  return <div className="glass rounded-2xl p-4 animate-pulse flex items-center gap-4"><div className="h-9 w-9 rounded-xl bg-white/10" /><div className="flex-1 space-y-2"><div className="h-4 w-32 bg-white/10 rounded" /><div className="h-3 w-20 bg-white/5 rounded" /></div><div className="h-6 w-20 bg-white/10 rounded" /></div>;
}
function SkeletonHero() {
  return <div className="rounded-3xl h-64 bg-white/5 animate-pulse" />;
}
function SkeletonGrid({ count = 3 }: { count?: number }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: count }).map((_, i) => <div key={i} className="glass rounded-2xl overflow-hidden animate-pulse"><div className="h-36 bg-white/5" /><div className="p-3 space-y-2"><div className="h-4 w-3/4 bg-white/10 rounded" /><div className="h-3 w-1/2 bg-white/5 rounded" /></div></div>)}</div>;
}
