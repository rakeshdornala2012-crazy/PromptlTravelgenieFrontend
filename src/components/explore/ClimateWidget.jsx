import { useEffect, useState } from "react";
import { Cloud, Droplets, Wind, Calendar, Thermometer, Sparkles } from "lucide-react";
import { fetchClimate } from "../../lib/exploreApi";

/**
 * ClimateWidget
 * Color: leafy/fresh green (#78c08a → #4f9468)
 * Shows: current weather, "best time to visit" highlight, 12-month bar chart.
 */
export default function ClimateWidget({ destination }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchClimate(destination).then((res) => {
      if (!cancelled) {
        setData(res);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [destination]);

  if (loading) return <SkeletonCard />;
  if (data?.error) return <ErrorCard message="Climate data unavailable" />;

  const { current, monthly, bestMonths } = data;
  const currentMonth = new Date().toLocaleDateString("en-US", { month: "short" });
  const isInBestWindow = bestMonths.includes(currentMonth);

  // Find max temp/precip for chart scaling
  const maxTemp = Math.max(...monthly.filter((m) => m.tempHigh != null).map((m) => m.tempHigh), 0);
  const maxPrecip = Math.max(...monthly.filter((m) => m.precip != null).map((m) => m.precip), 1);

  return (
    <article className="overflow-hidden rounded-3xl border border-emerald-400/15 bg-gradient-to-br from-emerald-950/40 via-black/60 to-black/80 p-6 lg:p-7">
      <header className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-400/15 text-emerald-300">
            <Cloud className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-300/70">Climate</p>
            <h3 className="font-serif text-2xl text-white">When to visit {destination}</h3>
          </div>
        </div>
      </header>

      {/* Current + verdict */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          icon={<Thermometer className="h-3.5 w-3.5" />}
          label="Right now"
          value={`${Math.round(current.temp)}°C`}
          sub={current.description}
        />
        <Stat
          icon={<Thermometer className="h-3.5 w-3.5" />}
          label="Feels like"
          value={`${Math.round(current.feelsLike)}°C`}
        />
        <Stat
          icon={<Droplets className="h-3.5 w-3.5" />}
          label="Humidity"
          value={`${current.humidity}%`}
        />
        <Stat
          icon={<Wind className="h-3.5 w-3.5" />}
          label="Wind"
          value={`${Math.round(current.wind)} km/h`}
        />
      </div>

      {/* Best time verdict */}
      <div
        className={`mb-6 flex items-center gap-3 rounded-2xl border p-4 ${
          isInBestWindow
            ? "border-emerald-400/30 bg-emerald-400/10"
            : "border-white/10 bg-white/[0.03]"
        }`}
      >
        <div className="grid h-9 w-9 place-items-center rounded-full bg-emerald-400/20 text-emerald-300">
          {isInBestWindow ? <Sparkles className="h-4 w-4" /> : <Calendar className="h-4 w-4" />}
        </div>
        <div className="flex-1">
          <p className="text-xs uppercase tracking-wider text-emerald-300/70">Best time to visit</p>
          <p className="text-sm text-white">
            {bestMonths.length > 0 ? bestMonths.join(" · ") : "Year-round"}
            {isInBestWindow && (
              <span className="ml-2 rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                You're in the window
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Monthly chart */}
      <div>
        <div className="mb-3 flex items-center justify-between text-[10px] uppercase tracking-wider text-white/40">
          <span>Monthly averages</span>
          <span className="flex items-center gap-3">
            <Legend swatch="bg-emerald-400/70" label="High °C" />
            <Legend swatch="bg-sky-400/40" label="Rain mm" />
          </span>
        </div>
        <div className="grid grid-cols-12 gap-1">
          {monthly.map((m) => {
            const isCurrent = m.month === currentMonth;
            const isBest = bestMonths.includes(m.month);
            const tempH = m.tempHigh != null ? (m.tempHigh / Math.max(maxTemp, 1)) * 64 : 0;
            const precipH = m.precip != null ? (m.precip / Math.max(maxPrecip, 1)) * 32 : 0;
            return (
              <div key={m.month} className="flex flex-col items-center gap-1">
                <div className="relative flex h-20 w-full items-end justify-center">
                  {/* Rain bar (behind) */}
                  <div
                    className="absolute bottom-0 w-full rounded-t bg-sky-400/30"
                    style={{ height: `${precipH}px` }}
                    title={`${m.precip} mm`}
                  />
                  {/* Temp bar (front, narrower) */}
                  <div
                    className={`relative w-3 rounded-t transition ${
                      isBest ? "bg-emerald-400" : "bg-emerald-400/60"
                    }`}
                    style={{ height: `${tempH}px` }}
                    title={`${m.tempHigh}°C high / ${m.tempLow}°C low`}
                  />
                </div>
                <span
                  className={`text-[9px] uppercase tracking-wide ${
                    isCurrent ? "font-semibold text-white" : "text-white/40"
                  }`}
                >
                  {m.month.slice(0, 1)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </article>
  );
}

function Stat({ icon, label, value, sub }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3">
      <div className="mb-1 flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-white/40">
        {icon}
        {label}
      </div>
      <p className="font-serif text-xl text-white">{value}</p>
      {sub && <p className="text-[11px] text-white/50">{sub}</p>}
    </div>
  );
}

function Legend({ swatch, label }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-2 w-2 rounded-sm ${swatch}`} />
      {label}
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="h-[420px] animate-pulse rounded-3xl border border-emerald-400/10 bg-emerald-950/20" />
  );
}

function ErrorCard({ message }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 text-sm text-white/50">
      {message}
    </div>
  );
}
