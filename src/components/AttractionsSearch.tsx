import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Compass, Search, Loader2, Star, Clock, MapPin, ArrowRight, Landmark, Trees, Eye, Waves, Building2, Building } from "lucide-react";
import { getAttractions, type Attraction } from "@/lib/attractions";

const POPULAR_DESTINATIONS = ["Bali", "Dubai", "Tokyo", "Paris", "Singapore", "Santorini", "Kyoto", "Goa", "Lisbon"];

const CATEGORY_ICONS: Record<string, any> = {
  sight: Landmark, museum: Building, park: Trees,
  religious: Building2, viewpoint: Eye, beach: Waves, Attraction: Compass,
};

const CATEGORY_COLORS: Record<string, string> = {
  sight: "bg-amber-500/15 text-amber-300",
  museum: "bg-purple-500/15 text-purple-300",
  park: "bg-emerald-500/15 text-emerald-300",
  religious: "bg-rose-500/15 text-rose-300",
  viewpoint: "bg-sky-500/15 text-sky-300",
  beach: "bg-cyan-500/15 text-cyan-300",
};

export default function AttractionsSearch() {
  const [destination, setDestination] = useState("Bali");
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [filter, setFilter] = useState("All");

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    setFilter("All");
    const results = await getAttractions(destination);
    setAttractions(results);
    setLoading(false);
  };

  const categories = ["All", ...Array.from(new Set(attractions.map(a => a.category)))];
  const filtered = filter === "All" ? attractions : attractions.filter(a => a.category === filter);

  return (
    <div className="w-full">
      <div className="glass rounded-3xl p-6 shadow-elegant">
        <div className="flex items-center gap-2 mb-5">
          <div className="h-8 w-8 rounded-xl bg-primary/15 grid place-items-center">
            <Compass className="h-4 w-4 text-primary" />
          </div>
          <span className="font-display text-lg">Attractions & Sightseeing</span>
        </div>

        <div className="mb-4">
          <label className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1.5">Destination</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Search any destination"
              className="w-full rounded-xl border border-white/10 bg-secondary/50 pl-9 pr-4 py-3 text-sm outline-none focus:border-primary/40 transition-colors"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()} />
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {POPULAR_DESTINATIONS.map((d) => (
            <button key={d} onClick={() => setDestination(d)}
              className={`rounded-full border px-3 py-1 text-[11px] transition-colors ${destination === d ? "border-primary/40 bg-primary/10 text-primary" : "border-white/10 text-muted-foreground hover:border-white/20"}`}>
              {d}
            </button>
          ))}
        </div>

        <button onClick={handleSearch} disabled={loading}
          className="w-full rounded-xl bg-gradient-amber py-3 font-medium text-sm text-primary-foreground flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          {loading ? "Finding attractions..." : `Explore ${destination}`}
        </button>
      </div>

      <AnimatePresence>
        {searched && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-lg">
                {loading ? "Finding gems..." : `${filtered.length} attractions in ${destination}`}
              </h3>
              {!loading && <span className="text-xs text-muted-foreground">via TripAdvisor</span>}
            </div>

            {/* Category filters */}
            {!loading && categories.length > 1 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {categories.map((cat) => (
                  <button key={cat} onClick={() => setFilter(cat)}
                    className={`rounded-full border px-3 py-1 text-[11px] transition-colors capitalize ${filter === cat ? "border-primary/40 bg-primary/10 text-primary" : "border-white/10 text-muted-foreground hover:border-white/20"}`}>
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="glass rounded-2xl overflow-hidden animate-pulse">
                    <div className="h-40 bg-white/5" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 w-3/4 bg-white/10 rounded" />
                      <div className="h-3 w-full bg-white/5 rounded" />
                      <div className="h-3 w-2/3 bg-white/5 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filtered.map((a, i) => {
                  const Icon = CATEGORY_ICONS[a.category] ?? Compass;
                  const colorClass = CATEGORY_COLORS[a.category.toLowerCase()] ?? "bg-secondary text-muted-foreground";
                  return (
                    <motion.div key={a.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                      className="glass rounded-2xl overflow-hidden hover:border-primary/20 transition-colors group cursor-pointer">
                      <div className="relative h-40 bg-secondary/40">
                        {a.image ? (
                          <img src={a.image} alt={a.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-900/20 to-amber-600/5">
                            <Icon className="h-14 w-14 text-white/10" />
                          </div>
                        )}
                        <div className="absolute top-2 left-2">
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-widest ${colorClass}`}>
                            {a.category}
                          </span>
                        </div>
                        {a.rating > 0 && (
                          <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/50 backdrop-blur px-2 py-0.5 text-xs text-white">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            {a.rating.toFixed(1)}
                            {a.reviewCount > 0 && <span className="text-white/60">({(a.reviewCount / 1000).toFixed(1)}k)</span>}
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="font-display text-base mb-1">{a.name}</div>
                        {a.description && (
                          <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">{a.description}</p>
                        )}
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3 text-muted-foreground">
                            {a.duration && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{a.duration}</span>}
                            {a.price && <span className={a.price === "Free" ? "text-emerald-400" : "text-primary"}>{a.price}</span>}
                          </div>
                          {a.url && (
                            <a href={a.url} target="_blank" rel="noopener noreferrer"
                              className="text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              Details <ArrowRight className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {!loading && filtered.length === 0 && attractions.length > 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <div className="text-sm">No attractions in this category</div>
              </div>
            )}

            {!loading && attractions.length === 0 && (
              <div className="text-center py-10 text-muted-foreground">
                <div className="text-3xl mb-2">🗺️</div>
                <div className="text-sm">No attractions found for {destination}</div>
                <div className="text-xs mt-1">Try a more specific destination name</div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
