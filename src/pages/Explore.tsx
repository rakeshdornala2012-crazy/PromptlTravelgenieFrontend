import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Map, LayoutGrid, Search, Star, Compass, TrendingUp, Filter } from "lucide-react";
import Nav from "@/components/Nav";

const DESTINATIONS = [
  {
    id: 1,
    name: "Bali",
    country: "Indonesia",
    vibe: ["Beach", "Wellness"],
    duration: "5-7 nights",
    budget: 50000,
    rating: 4.8,
    tag: "Most Popular",
    tagColor: "bg-amber-500/15 text-amber-300 border-amber-500/25",
    description: "Temples, rice terraces, and legendary sunsets over the Indian Ocean.",
    accentColor: "#F59E0B",
    bgColor: "from-[#2D1B00] via-[#1A0F00] to-[#0D0700]",
    emoji: "🌴",
  },
  {
    id: 2,
    name: "Kyoto",
    country: "Japan",
    vibe: ["City", "Culture"],
    duration: "6-8 nights",
    budget: 90000,
    rating: 4.9,
    tag: "Trending",
    tagColor: "bg-rose-500/15 text-rose-300 border-rose-500/25",
    description: "Ancient temples, bamboo forests, and cherry blossoms in spring.",
    accentColor: "#FB7185",
    bgColor: "from-[#2D0018] via-[#1A000F] to-[#0D0007]",
    emoji: "⛩️",
  },
  {
    id: 3,
    name: "Santorini",
    country: "Greece",
    vibe: ["Beach", "Romantic"],
    duration: "5-7 nights",
    budget: 120000,
    rating: 4.7,
    tag: "Luxury",
    tagColor: "bg-sky-500/15 text-sky-300 border-sky-500/25",
    description: "Whitewashed villas, volcanic beaches, and the world's best sunsets.",
    accentColor: "#38BDF8",
    bgColor: "from-[#001D2D] via-[#000F1A] to-[#00070D]",
    emoji: "🏛️",
  },
  {
    id: 4,
    name: "Manali",
    country: "India",
    vibe: ["Mountains", "Adventure"],
    duration: "4-6 nights",
    budget: 25000,
    rating: 4.6,
    tag: "Budget Pick",
    tagColor: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
    description: "Snow-capped Himalayas, pine forests, and thrilling mountain trails.",
    accentColor: "#34D399",
    bgColor: "from-[#001A0D] via-[#000F07] to-[#000703]",
    emoji: "🏔️",
  },
  {
    id: 5,
    name: "Dubai",
    country: "UAE",
    vibe: ["City", "Luxury"],
    duration: "4-5 nights",
    budget: 80000,
    rating: 4.5,
    tag: "City Break",
    tagColor: "bg-violet-500/15 text-violet-300 border-violet-500/25",
    description: "Futuristic skyline, world-class shopping, and desert adventures.",
    accentColor: "#A78BFA",
    bgColor: "from-[#120029] via-[#0A0018] to-[#05000B]",
    emoji: "🏙️",
  },
  {
    id: 6,
    name: "Maldives",
    country: "Maldives",
    vibe: ["Beach", "Romantic", "Luxury"],
    duration: "5-7 nights",
    budget: 150000,
    rating: 4.9,
    tag: "Promptly Pick",
    tagColor: "bg-cyan-500/15 text-cyan-300 border-cyan-500/25",
    description: "Overwater bungalows, crystal lagoons, and the most vivid reefs on Earth.",
    accentColor: "#22D3EE",
    bgColor: "from-[#001A29] via-[#000F18] to-[#00070D]",
    emoji: "🐠",
  },
  {
    id: 7,
    name: "Lisbon",
    country: "Portugal",
    vibe: ["City", "Culture"],
    duration: "5-7 nights",
    budget: 85000,
    rating: 4.7,
    tag: "Hidden Gem",
    tagColor: "bg-amber-500/15 text-amber-300 border-amber-500/25",
    description: "Cobbled hills, pastel facades, Fado music, and incredible seafood.",
    accentColor: "#FCD34D",
    bgColor: "from-[#1A1200] via-[#0F0A00] to-[#070500]",
    emoji: "🎵",
  },
  {
    id: 8,
    name: "Coorg",
    country: "India",
    vibe: ["Mountains", "Wellness"],
    duration: "3-4 nights",
    budget: 18000,
    rating: 4.5,
    tag: "Weekend Escape",
    tagColor: "bg-green-500/15 text-green-300 border-green-500/25",
    description: "Misty coffee estates, waterfalls, and the Scotland of India.",
    accentColor: "#4ADE80",
    bgColor: "from-[#001A05] via-[#000F03] to-[#000701]",
    emoji: "☕",
  },
  {
    id: 9,
    name: "Tokyo",
    country: "Japan",
    vibe: ["City", "Culture", "Adventure"],
    duration: "7-10 nights",
    budget: 110000,
    rating: 4.9,
    tag: "Must Visit",
    tagColor: "bg-red-500/15 text-red-300 border-red-500/25",
    description: "Neon lights, ramen alleys, ancient shrines, and pop culture paradise.",
    accentColor: "#F87171",
    bgColor: "from-[#2D0000] via-[#1A0000] to-[#0D0000]",
    emoji: "🗼",
  },
];

const VIBES = ["All", "Beach", "Mountains", "City", "Culture", "Adventure", "Wellness", "Romantic", "Luxury"];
const BUDGETS = [
  { label: "Any budget", max: Infinity, min: 0 },
  { label: "Under ₹30K", max: 30000, min: 0 },
  { label: "Under ₹60K", max: 60000, min: 0 },
  { label: "Under ₹1L", max: 100000, min: 0 },
  { label: "Luxury", max: Infinity, min: 100000 },
];
const DURATIONS = ["Any", "Weekend (3-4n)", "Short (5-7n)", "Long (8n+)"];

const MAP_PINS = [
  { id: 1, name: "Bali", x: 72, y: 58 },
  { id: 2, name: "Kyoto", x: 78, y: 35 },
  { id: 3, name: "Santorini", x: 48, y: 32 },
  { id: 4, name: "Manali", x: 62, y: 30 },
  { id: 5, name: "Dubai", x: 57, y: 38 },
  { id: 6, name: "Maldives", x: 63, y: 52 },
  { id: 7, name: "Lisbon", x: 43, y: 31 },
  { id: 8, name: "Coorg", x: 63, y: 48 },
  { id: 9, name: "Tokyo", x: 80, y: 32 },
];

const Particles = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    {[...Array(12)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-px h-px rounded-full bg-white/30"
        style={{
          left: `${10 + (i * 8.3) % 90}%`,
          top: `${5 + (i * 13.7) % 80}%`,
        }}
        animate={{
          y: [-20, -80, -20],
          opacity: [0, 0.6, 0],
          scale: [0, 2, 0],
        }}
        transition={{
          duration: 4 + (i % 3),
          delay: i * 0.4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    ))}
  </div>
);

const DestinationCard = ({ dest, index }: { dest: (typeof DESTINATIONS)[0]; index: number }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      <Link
        to={"/destination/" + dest.name.toLowerCase()}
        className={`group relative block overflow-hidden rounded-2xl border transition-all duration-500 ${
          hovered ? "border-white/10 shadow-card" : "border-white/[0.04]"
        }`}
        style={{ background: "#0C0C14" }}
      >
        {/* Gradient bg */}
        <div
          className={`absolute inset-0 bg-gradient-to-b ${dest.bgColor} transition-opacity duration-500 ${
            hovered ? "opacity-80" : "opacity-40"
          }`}
        />

        {/* Accent glow */}
        <motion.div
          className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full blur-[80px]"
          animate={{ opacity: hovered ? 0.2 : 0.05 }}
          transition={{ duration: 0.5 }}
          style={{ background: dest.accentColor }}
        />

        <div className="relative p-5">
          {/* Tag */}
          <div
            className={`mb-5 inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-medium tracking-wide ${dest.tagColor}`}
          >
            {dest.tag}
          </div>

          {/* Emoji */}
          <motion.div
            className="text-4xl mb-4"
            animate={{ scale: hovered ? 1.1 : 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {dest.emoji}
          </motion.div>

          {/* Info */}
          <h3 className="font-display text-2xl leading-tight">{dest.name}</h3>
          <p className="mt-0.5 text-xs text-white/30">{dest.country}</p>
          <p className="mt-3 text-[13px] leading-relaxed text-white/40 line-clamp-2">
            {dest.description}
          </p>

          {/* Meta */}
          <div className="mt-5 flex items-center gap-3">
            <span className="text-sm font-medium" style={{ color: dest.accentColor }}>
              ₹{(dest.budget / 1000).toFixed(0)}K+
            </span>
            <span className="h-1 w-1 rounded-full bg-white/15" />
            <span className="text-xs text-white/30">{dest.duration}</span>
            <span className="h-1 w-1 rounded-full bg-white/15" />
            <span className="flex items-center gap-1 text-xs text-white/30">
              <Star className="h-3 w-3 fill-white/30 stroke-none" />
              {dest.rating}
            </span>
          </div>

          {/* CTA */}
          <motion.div
            className="mt-4 flex items-center gap-1.5 text-xs font-medium"
            animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : -8 }}
            transition={{ duration: 0.3 }}
            style={{ color: dest.accentColor }}
          >
            Explore itinerary <ArrowRight className="h-3 w-3" />
          </motion.div>
        </div>
      </Link>
    </motion.div>
  );
};

const Explore = () => {
  const [search, setSearch] = useState("");
  const [activeVibe, setActiveVibe] = useState("All");
  const [activeBudget, setActiveBudget] = useState(0);
  const [activeDuration, setActiveDuration] = useState("Any");
  const [view, setView] = useState<"grid" | "map">("grid");
  const [hoveredPin, setHoveredPin] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const budgetFilter = BUDGETS[activeBudget];

  const filtered = DESTINATIONS.filter((d) => {
    if (search && !d.name.toLowerCase().includes(search.toLowerCase()) && !d.country.toLowerCase().includes(search.toLowerCase())) return false;
    if (activeVibe !== "All" && !d.vibe.includes(activeVibe)) return false;
    if (d.budget < budgetFilter.min || d.budget > budgetFilter.max) return false;
    if (activeDuration === "Weekend (3-4n)" && !d.duration.includes("3-4")) return false;
    if (activeDuration === "Short (5-7n)" && !d.duration.includes("5-7")) return false;
    if (activeDuration === "Long (8n+)" && !d.duration.includes("7-10") && !d.duration.includes("6-8")) return false;
    return true;
  });

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Nav />

      {/* HERO */}
      <section className="relative pt-32 pb-6 px-4 text-center overflow-hidden">
        <Particles />
        <div className="pointer-events-none absolute inset-x-0 top-20 h-80 bg-gradient-amber opacity-[0.04] blur-[140px]" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto max-w-2xl"
        >
          <h1 className="font-display text-5xl sm:text-6xl leading-tight">
            Explore the world
            <br />
            <span className="italic text-gradient-amber">your way</span>
          </h1>
          <p className="mt-4 text-muted-foreground text-sm max-w-md mx-auto">
            Discover destinations curated by Promptly Travel's AI — filtered by vibe, budget, and duration.
          </p>
        </motion.div>
      </section>

      {/* SEARCH + FILTERS */}
      <section className="mx-auto max-w-6xl px-4 pt-8 pb-4">
        {/* Search bar row */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search destinations…"
              className="w-full rounded-xl border border-border bg-card pl-11 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/40 transition-colors"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm transition-colors ${
              showFilters ? "border-primary/30 bg-primary/5 text-primary" : "border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
          </button>
          <div className="flex items-center rounded-xl border border-border bg-card p-1">
            <button
              onClick={() => setView("grid")}
              className={`rounded-lg p-2 transition-colors ${view === "grid" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("map")}
              className={`rounded-lg p-2 transition-colors ${view === "map" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Map className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Expandable filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="rounded-xl border border-border bg-card p-4 mb-4 space-y-4">
                {/* Budget */}
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Budget</p>
                  <div className="flex flex-wrap gap-2">
                    {BUDGETS.map((b, i) => (
                      <button
                        key={b.label}
                        onClick={() => setActiveBudget(i)}
                        className={`rounded-full px-3 py-1.5 text-xs transition-all ${
                          activeBudget === i
                            ? "bg-primary/10 border border-primary/30 text-primary"
                            : "bg-secondary/40 border border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Duration */}
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Duration</p>
                  <div className="flex flex-wrap gap-2">
                    {DURATIONS.map((d) => (
                      <button
                        key={d}
                        onClick={() => setActiveDuration(d)}
                        className={`rounded-full px-3 py-1.5 text-xs transition-all ${
                          activeDuration === d
                            ? "bg-primary/10 border border-primary/30 text-primary"
                            : "bg-secondary/40 border border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Vibe pills */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
          {VIBES.map((v) => {
            const active = activeVibe === v;
            return (
              <button
                key={v}
                onClick={() => setActiveVibe(v)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all border ${
                  active
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-transparent border-border text-muted-foreground hover:text-foreground hover:border-white/10"
                }`}
              >
                {v}
              </button>
            );
          })}
        </div>
      </section>

      {/* Count row */}
      <div className="mx-auto max-w-6xl px-4 pt-4 pb-2 flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground/40">
          {filtered.length} destination{filtered.length !== 1 ? "s" : ""} found
        </p>
        {filtered.length > 0 && (
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/40">
            <TrendingUp className="h-3 w-3" />
            Sorted by popularity
          </div>
        )}
      </div>

      {/* VIEWS */}
      <AnimatePresence mode="wait">
        {view === "grid" ? (
          <motion.section
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="px-4 pb-24"
          >
            <div className="mx-auto max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((dest, i) => (
                <DestinationCard key={dest.id} dest={dest} index={i} />
              ))}
            </div>

            {filtered.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-28"
              >
                <div className="text-5xl mb-4">🌍</div>
                <div className="font-display text-2xl text-muted-foreground/60 mb-2">
                  No destinations found
                </div>
                <div className="text-sm text-muted-foreground/30">
                  Try adjusting your vibe or budget filters
                </div>
              </motion.div>
            )}
          </motion.section>
        ) : (
          <motion.section
            key="map"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="px-4 pb-24"
          >
            <div className="mx-auto max-w-6xl">
              <div
                className="relative rounded-2xl overflow-hidden"
                style={{
                  height: "560px",
                  background: "#0A0A14",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <svg
                  viewBox="0 0 100 60"
                  className="absolute inset-0 w-full h-full"
                  preserveAspectRatio="xMidYMid slice"
                >
                  <rect width="100" height="60" fill="#0A0A14" />
                  {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((x) => (
                    <line key={`v${x}`} x1={x} y1={0} x2={x} y2={60} stroke="rgba(255,255,255,0.02)" strokeWidth="0.2" />
                  ))}
                  {[10, 20, 30, 40, 50].map((y) => (
                    <line key={`h${y}`} x1={0} y1={y} x2={100} y2={y} stroke="rgba(255,255,255,0.02)" strokeWidth="0.2" />
                  ))}
                  <ellipse cx="22" cy="28" rx="11" ry="13" fill="#141420" stroke="rgba(255,255,255,0.04)" strokeWidth="0.3" />
                  <ellipse cx="26" cy="40" rx="7" ry="9" fill="#141420" stroke="rgba(255,255,255,0.04)" strokeWidth="0.3" />
                  <ellipse cx="47" cy="24" rx="17" ry="11" fill="#141420" stroke="rgba(255,255,255,0.04)" strokeWidth="0.3" />
                  <ellipse cx="62" cy="32" rx="16" ry="12" fill="#141420" stroke="rgba(255,255,255,0.04)" strokeWidth="0.3" />
                  <ellipse cx="75" cy="35" rx="11" ry="9" fill="#141420" stroke="rgba(255,255,255,0.04)" strokeWidth="0.3" />
                  <ellipse cx="83" cy="45" rx="6" ry="8" fill="#141420" stroke="rgba(255,255,255,0.04)" strokeWidth="0.3" />
                  <ellipse cx="52" cy="48" rx="5" ry="6" fill="#141420" stroke="rgba(255,255,255,0.04)" strokeWidth="0.3" />
                </svg>

                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(6,6,10,0.6) 100%)" }}
                />

                {MAP_PINS.filter((p) => filtered.find((d) => d.id === p.id)).map((pin) => {
                  const dest = DESTINATIONS.find((d) => d.id === pin.id)!;
                  return (
                    <div
                      key={pin.id}
                      className="absolute"
                      style={{ left: `${pin.x}%`, top: `${pin.y}%`, transform: "translate(-50%, -50%)" }}
                      onMouseEnter={() => setHoveredPin(pin.id)}
                      onMouseLeave={() => setHoveredPin(null)}
                    >
                      <motion.div whileHover={{ scale: 1.25 }} className="relative cursor-pointer">
                        <div
                          className="h-9 w-9 rounded-full flex items-center justify-center text-base shadow-lg"
                          style={{
                            background: `${dest.accentColor}15`,
                            border: `1.5px solid ${dest.accentColor}50`,
                            backdropFilter: "blur(8px)",
                          }}
                        >
                          {dest.emoji}
                        </div>
                        <motion.div
                          className="absolute inset-0 rounded-full"
                          animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                          transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
                          style={{ border: `1px solid ${dest.accentColor}40` }}
                        />
                      </motion.div>

                      <AnimatePresence>
                        {hoveredPin === pin.id && (
                          <motion.div
                            initial={{ opacity: 0, y: 6, scale: 0.92 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 6, scale: 0.92 }}
                            transition={{ duration: 0.2 }}
                            className="absolute bottom-12 left-1/2 -translate-x-1/2 w-48 rounded-xl p-3.5 z-10"
                            style={{
                              background: "rgba(10,10,20,0.95)",
                              border: `1px solid ${dest.accentColor}25`,
                              backdropFilter: "blur(16px)",
                              boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${dest.accentColor}15`,
                            }}
                          >
                            <div className="font-display text-sm text-white">
                              {dest.name}
                            </div>
                            <div className="text-[11px] mt-0.5 text-white/35">
                              {dest.country} · {dest.duration}
                            </div>
                            <div className="mt-2.5 flex items-center justify-between">
                              <span className="text-sm font-medium" style={{ color: dest.accentColor }}>
                                ₹{(dest.budget / 1000).toFixed(0)}K+
                              </span>
                              <Link
                                to={"/destination/" + dest.name.toLowerCase()}
                                className="flex items-center gap-0.5 text-[10px] font-medium hover:opacity-80 transition-opacity"
                                style={{ color: dest.accentColor }}
                              >
                                Explore <ArrowRight className="h-2.5 w-2.5" />
                              </Link>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}

                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-widest text-white/20">
                    Hover pins to explore
                  </span>
                  <span className="text-[10px] text-white/15">
                    {filtered.length} destinations shown
                  </span>
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  );
};

export default Explore;
