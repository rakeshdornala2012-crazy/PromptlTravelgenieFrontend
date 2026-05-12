import { motion } from "framer-motion";
import { useState } from "react";
import { Landmark, Building2, Trees, Eye, Waves, Building, MapPin } from "lucide-react";
import { Attraction } from "@/lib/destination";

interface Props {
  attractions: Attraction[];
}

const CATEGORY_META: Record<
  Attraction["category"],
  { label: string; icon: typeof Landmark; color: string }
> = {
  sight: { label: "Sights", icon: Landmark, color: "amber" },
  museum: { label: "Museums", icon: Building, color: "purple" },
  park: { label: "Parks", icon: Trees, color: "emerald" },
  religious: { label: "Temples", icon: Building2, color: "rose" },
  viewpoint: { label: "Viewpoints", icon: Eye, color: "sky" },
  beach: { label: "Beaches", icon: Waves, color: "cyan" },
  other: { label: "Other", icon: MapPin, color: "gray" },
};

const COLOR_CLASSES: Record<string, string> = {
  amber: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  purple: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  emerald: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  rose: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  sky: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  cyan: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  gray: "bg-secondary text-muted-foreground border-white/10",
};

const Attractions = ({ attractions }: Props) => {
  const [filter, setFilter] = useState<Attraction["category"] | "all">("all");

  if (attractions.length === 0) {
    return (
      <section className="rounded-3xl border border-dashed border-white/10 p-8 text-center">
        <div className="text-3xl mb-2">🗺️</div>
        <div className="text-sm text-muted-foreground">
          No attractions data available — try another destination
        </div>
      </section>
    );
  }

  // Count by category
  const counts: Record<string, number> = { all: attractions.length };
  attractions.forEach((a) => {
    counts[a.category] = (counts[a.category] || 0) + 1;
  });

  const filtered =
    filter === "all" ? attractions : attractions.filter((a) => a.category === filter);

  const categoriesPresent = (Object.keys(CATEGORY_META) as Attraction["category"][]).filter(
    (c) => counts[c]
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="rounded-3xl border border-white/10 bg-secondary/30 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Top attractions
          </div>
          <div className="font-display text-xl mt-0.5">
            {attractions.length} places to explore
          </div>
        </div>
        <div className="text-[10px] text-muted-foreground">via OpenStreetMap</div>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        <button
          onClick={() => setFilter("all")}
          className={
            "rounded-full px-3 py-1 text-xs transition-all border " +
            (filter === "all"
              ? "bg-primary/20 border-primary/40 text-primary"
              : "border-white/10 text-muted-foreground hover:border-white/20")
          }
        >
          All ({counts.all})
        </button>
        {categoriesPresent.map((cat) => {
          const meta = CATEGORY_META[cat];
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={
                "rounded-full px-3 py-1 text-xs transition-all border " +
                (filter === cat
                  ? "bg-primary/20 border-primary/40 text-primary"
                  : "border-white/10 text-muted-foreground hover:border-white/20")
              }
            >
              {meta.label} ({counts[cat]})
            </button>
          );
        })}
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {filtered.slice(0, 12).map((a, i) => {
          const meta = CATEGORY_META[a.category];
          return (
            <motion.a
              key={a.id}
              href={
                "https://www.openstreetmap.org/?mlat=" + a.lat + "&mlon=" + a.lon + "#map=17/" + a.lat + "/" + a.lon
              }
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ x: 4 }}
              className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-secondary/40 p-3 hover:border-primary/30 hover:bg-secondary/60 transition-all"
            >
              <div
                className={
                  "grid h-9 w-9 shrink-0 place-items-center rounded-xl border " +
                  COLOR_CLASSES[meta.color]
                }
              >
                <meta.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium truncate">{a.name}</div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground capitalize">
                  {a.type.replace(/_/g, " ")}
                </div>
              </div>
              <MapPin className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.a>
          );
        })}
      </div>

      {filtered.length > 12 && (
        <div className="text-center mt-4 text-xs text-muted-foreground">
          Showing 12 of {filtered.length} · click any to view on map
        </div>
      )}
    </motion.section>
  );
};

export default Attractions;
