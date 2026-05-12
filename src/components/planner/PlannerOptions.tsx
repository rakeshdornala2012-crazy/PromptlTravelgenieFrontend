import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowUpRight,
  Plane,
  Hotel,
  Compass,
  FileCheck,
  Sparkles,
  Star,
  MapPin,
  Trophy,
  Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TripOption } from "./data";
import FlightWeatherWidget from "./FlightWeatherWidget";
import { getDestinationImage, getDestinationVibe } from "@/lib/destinationImages";

type Props = {
  query: string;
  options: TripOption[];
  onSelect: (option: TripOption) => void;
  onBack: () => void;
};

const inr = (n: number | undefined | null) =>
  "₹" + (Number(n) || 0).toLocaleString("en-IN");

const IATA_MAP: Record<string, string> = {
  bali: "DPS", goa: "GOI", dubai: "DXB", paris: "CDG",
  tokyo: "NRT", london: "LHR", manali: "KUU", maldives: "MLE",
  santorini: "JTR", lisbon: "LIS", coorg: "MYQ", kyoto: "KIX",
};

const PlannerOptions = ({ query, options, onSelect, onBack }: Props) => {
  const navigate = useNavigate();
  const safeOptions = (options ?? []).filter(Boolean);

  return (
    <div className="relative min-h-screen bg-background pt-28 pb-24">
      {/* Atmospheric backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[500px]"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(212,168,106,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4">
        {/* HEADER — restrained, elegant */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <button
            onClick={onBack}
            className="group inline-flex w-fit items-center gap-1.5 text-[11px] tracking-wide text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3 transition group-hover:-translate-x-0.5" />
            New search
          </button>

          <div className="mt-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/20 bg-amber-400/[0.04] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.22em] text-amber-300">
                <Sparkles className="h-2.5 w-2.5" />
                {safeOptions.length} curated · sorted by best fit
              </div>
              <h1 className="mt-4 font-display text-4xl font-light leading-[1.05] sm:text-5xl lg:text-6xl">
                Voya found{" "}
                <span className="italic text-gradient-amber">
                  {safeOptions.length} {safeOptions.length === 1 ? "trip" : "trips"}
                </span>
                <br />
                that fit you.
              </h1>
              <p className="mt-3 max-w-lg text-sm italic text-muted-foreground/80">
                "{query}"
              </p>
            </div>

            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              Live prices
            </div>
          </div>
        </motion.div>

        {/* EMPTY STATE */}
        {safeOptions.length === 0 ? (
          <div className="mt-20 rounded-3xl border border-border bg-secondary/20 p-12 text-center">
            <p className="font-display text-3xl">No trips found</p>
            <p className="mt-3 text-sm text-muted-foreground">
              Try a different destination or broaden your dates.
            </p>
            <button
              onClick={onBack}
              className="mt-6 rounded-full bg-foreground px-6 py-2.5 text-sm text-background hover:bg-amber-400 hover:text-black transition"
            >
              Try a new search
            </button>
          </div>
        ) : (
          <div className="mt-14 grid grid-cols-1 gap-5 lg:grid-cols-2">
            {safeOptions.map((opt, i) => (
              <PremiumTripCard
                key={opt.id ?? i}
                option={opt}
                index={i}
                onSelect={onSelect}
                onSeeItinerary={() => navigate("/itinerary", { state: { trip: opt } })}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================
//  PREMIUM TRIP CARD
// ============================================================

const PremiumTripCard = ({
  option,
  index,
  onSelect,
  onSeeItinerary,
}: {
  option: TripOption;
  index: number;
  onSelect: (o: TripOption) => void;
  onSeeItinerary: () => void;
}) => {
  // Safe field access
  const destination = option.destination ?? "Unknown";
  const country = option.country ?? "";
  const destKey = destination.toLowerCase();
  const iata = IATA_MAP[destKey] ?? "BOM";
  const tier = option.tier ?? "Standard";
  const nights = option.nights ?? 0;
  const rating = typeof option.rating === "number" ? option.rating : 4.5;
  const total = option.total ?? option.price ?? 0;
  const highlights = option.highlights ?? [];
  const featured = option.featured ?? false;

  // Premium imagery
  const heroImage = getDestinationImage(destination);
  const vibe = getDestinationVibe(destination);

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, delay: 0.1 + index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
      className={`group relative overflow-hidden rounded-3xl border bg-gradient-card transition-all duration-500 ${
        featured
          ? "border-amber-400/30 shadow-[0_30px_80px_-20px_rgba(212,168,106,0.35)]"
          : "border-white/[0.06] hover:border-amber-400/20 hover:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)]"
      }`}
    >
      {/* HERO IMAGE — full bleed top, premium scrim */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <motion.img
          src={heroImage}
          alt={destination}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
          initial={{ scale: 1.05 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
          style={{
            transition: "transform 700ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
        {/* Smoothing on hover */}
        <div
          className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"
          style={{ transform: "scale(1)" }}
        />

        {/* Top scrim */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/70 via-black/20 to-transparent" />
        {/* Bottom scrim */}
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/80 to-transparent" />

        {/* TOP ROW — badges left, rating right */}
        <div className="absolute inset-x-5 top-5 flex items-start justify-between">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] backdrop-blur-md ${
                featured
                  ? "bg-amber-400 text-black shadow-[0_0_20px_rgba(212,168,106,0.6)]"
                  : "bg-white/10 text-white/85 ring-1 ring-white/20"
              }`}
            >
              {featured && <Trophy className="h-2.5 w-2.5" />}
              {tier}
            </span>
            {featured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-amber-300 ring-1 ring-amber-400/30 backdrop-blur-md">
                <Sparkles className="h-2.5 w-2.5" /> Voya Pick
              </span>
            )}
          </div>
          <div className="inline-flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 text-[11px] text-white ring-1 ring-white/15 backdrop-blur-md">
            <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
            <span className="font-medium">{rating}</span>
          </div>
        </div>

        {/* BOTTOM — destination name overlaid on image */}
        <div className="absolute inset-x-5 bottom-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/60">
                {vibe.emoji} {country || vibe.weatherHint}
              </p>
              <h2 className="mt-1 font-display text-4xl leading-none text-white">
                {destination}
              </h2>
              <p className="mt-1.5 text-xs text-white/55">
                {nights} {nights === 1 ? "night" : "nights"} · all inclusive
              </p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-white/45">
                From
              </p>
              <p className="font-display text-3xl leading-none text-white">{inr(total)}</p>
              <p className="mt-1 text-[10px] text-white/45">per person</p>
            </div>
          </div>
        </div>
      </div>

      {/* BODY — breakdown */}
      <div className="p-5">
        {/* Inclusions strip — 4 columns of icons */}
        <div className="grid grid-cols-4 gap-2 border-b border-white/[0.05] pb-4">
          <Inclusion
            icon={Plane}
            label="Flight"
            value={option.flight?.carrier ?? "Direct"}
            sub={option.flight?.stops ?? "Non-stop"}
          />
          <Inclusion
            icon={Hotel}
            label="Stay"
            value={option.hotel?.type ?? "Hotel"}
            sub={option.hotel?.name ? truncate(option.hotel.name, 14) : "—"}
          />
          <Inclusion
            icon={Compass}
            label="Activities"
            value={`${option.activities?.count ?? 0}`}
            sub="experiences"
          />
          <Inclusion
            icon={FileCheck}
            label="Visa"
            value={option.visa?.type ? truncate(option.visa.type, 10) : "Included"}
            sub={option.visa?.price ? inr(option.visa.price) : "Free"}
          />
        </div>

        {/* Highlights */}
        {highlights.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {highlights.slice(0, 4).map((h) => (
              <span
                key={h}
                className="inline-flex items-center gap-1 rounded-full border border-white/[0.06] bg-white/[0.02] px-2.5 py-0.5 text-[10px] text-white/65"
              >
                <Check className="h-2.5 w-2.5 text-emerald-300/80" />
                {h}
              </span>
            ))}
          </div>
        )}

        {/* Live weather + flights widget */}
        {destination !== "Unknown" && (
          <div className="mt-4">
            <FlightWeatherWidget destination={destination} arrIata={iata} />
          </div>
        )}

        {/* CTAs — primary dominates, secondary is ghost */}
        <div className="mt-5 flex items-center gap-2">
          <button
            onClick={onSeeItinerary}
            className="rounded-2xl border border-white/[0.08] bg-transparent px-5 py-3 text-xs font-medium text-white/70 transition hover:border-white/20 hover:bg-white/[0.03] hover:text-white"
          >
            See itinerary
          </button>
          <button
            onClick={() => onSelect(option)}
            className="group/btn relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-2xl py-3 text-xs font-bold uppercase tracking-[0.22em] text-black"
            style={{
              background:
                "linear-gradient(135deg, #f5d27a 0%, #d4a86a 50%, #c98a3a 100%)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.4), 0 12px 30px -10px rgba(212,168,106,0.5)",
            }}
          >
            <span className="relative z-10 inline-flex items-center gap-2">
              Select trip
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
            </span>
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-1000 ease-out group-hover/btn:translate-x-full" />
          </button>
        </div>
      </div>
    </motion.article>
  );
};

// ============================================================
//  HELPERS
// ============================================================

const Inclusion = ({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: any;
  label: string;
  value: string;
  sub: string;
}) => (
  <div className="flex flex-col items-start gap-1">
    <div className="flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-[0.18em] text-white/35">
      <Icon className="h-2.5 w-2.5" strokeWidth={2} />
      {label}
    </div>
    <p className="text-xs font-medium text-white/90">{value}</p>
    <p className="text-[10px] text-white/45">{sub}</p>
  </div>
);

const truncate = (s: string, max: number) =>
  s.length > max ? s.slice(0, max - 1) + "…" : s;

export default PlannerOptions;
