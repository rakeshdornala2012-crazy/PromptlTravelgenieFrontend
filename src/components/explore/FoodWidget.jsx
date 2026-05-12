import { useEffect, useState } from "react";
import { UtensilsCrossed, Flame, MapPin } from "lucide-react";
import { fetchFood } from "../../lib/exploreApi";

/**
 * FoodWidget
 * Color: romantic rose/red (#e57373 → #b95757)
 * Shows: must-try dishes (with notes), dining spots (with area + vibe).
 */
export default function FoodWidget({ destination }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchFood(destination).then((res) => {
      if (!cancelled) {
        setData(res);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [destination]);

  if (loading) return <SkeletonCard />;
  if (!data || data?.error) return <ErrorCard message="Food guide unavailable" />;

  return (
    <article className="overflow-hidden rounded-3xl border border-rose-400/15 bg-gradient-to-br from-rose-950/40 via-black/60 to-black/80 p-6 lg:p-7">
      <header className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-rose-400/15 text-rose-300">
            <UtensilsCrossed className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-rose-300/70">Food</p>
            <h3 className="font-serif text-2xl text-white">Taste of {destination}</h3>
          </div>
        </div>
        {!data.isCurated && (
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] uppercase tracking-wider text-white/40">
            General
          </span>
        )}
      </header>

      {/* Must-try dishes */}
      <section className="mb-6">
        <div className="mb-3 flex items-center gap-2">
          <Flame className="h-3.5 w-3.5 text-rose-300" />
          <h4 className="text-[10px] uppercase tracking-[0.18em] text-rose-300/70">Must-try dishes</h4>
        </div>
        <ul className="space-y-2">
          {data.dishes?.map((d, i) => (
            <li
              key={i}
              className="group rounded-2xl border border-white/10 bg-white/[0.02] p-3.5 transition hover:border-rose-400/20 hover:bg-rose-400/[0.04]"
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-rose-400/15 text-[11px] font-semibold text-rose-300">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-serif text-base text-white">{d.name}</p>
                  <p className="text-xs text-white/55">{d.note}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Dining spots */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 text-rose-300" />
          <h4 className="text-[10px] uppercase tracking-[0.18em] text-rose-300/70">Where to eat</h4>
        </div>
        <ul className="grid gap-2 sm:grid-cols-1">
          {data.spots?.map((s, i) => (
            <li
              key={i}
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-3.5 transition hover:border-rose-400/20"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-serif text-base text-white">{s.name}</p>
                  <p className="mt-0.5 text-[11px] uppercase tracking-wider text-rose-300/70">{s.area}</p>
                </div>
              </div>
              <p className="mt-1.5 text-xs text-white/55">{s.vibe}</p>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}

function SkeletonCard() {
  return <div className="h-[420px] animate-pulse rounded-3xl border border-rose-400/10 bg-rose-950/20" />;
}

function ErrorCard({ message }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 text-sm text-white/50">
      {message}
    </div>
  );
}
