import { useEffect, useState } from "react";
import { MapPin, Globe, Languages, Phone, Clock, Banknote, FileCheck, Car, Users } from "lucide-react";
import { fetchCountry } from "../../lib/exploreApi";

/**
 * CountryWidget
 * Color: gold (matches your existing Indonesia card)
 * Shows: flag, capital, region, currency, languages, calling code, drives-on,
 *        and a highlighted Visa pill for Indian passport holders.
 */
export default function CountryWidget({ destination }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchCountry(destination).then((res) => {
      if (!cancelled) {
        setData(res);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [destination]);

  if (loading) return <SkeletonCard />;
  if (data?.error) return <ErrorCard message="Country details unavailable" />;

  const currency = data.currencies?.[0];

  return (
    <article className="overflow-hidden rounded-3xl border border-[#d4a86a]/20 bg-gradient-to-br from-[#d4a86a]/[0.06] via-black/60 to-black/80 p-6 lg:p-7">
      <header className="mb-5 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {data.flag && (
            <img
              src={data.flag}
              alt={`${data.name} flag`}
              className="h-11 w-16 rounded-md object-cover ring-1 ring-white/10"
            />
          )}
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#d4a86a]/80">Country</p>
            <h3 className="font-serif text-2xl text-white">{data.name}</h3>
            <p className="text-xs text-white/50">{data.subregion ?? data.region}</p>
          </div>
        </div>
      </header>

      {/* Visa highlight */}
      {data.visa && (
        <div className="mb-5 rounded-2xl border border-[#d4a86a]/30 bg-[#d4a86a]/[0.08] p-4">
          <div className="mb-1 flex items-center gap-2">
            <FileCheck className="h-3.5 w-3.5 text-[#d4a86a]" />
            <span className="text-[10px] uppercase tracking-wider text-[#d4a86a]">
              Visa for Indian Passport
            </span>
          </div>
          <p className="font-serif text-lg text-white">{data.visa.type}</p>
          <p className="mt-1 text-xs text-white/60">{data.visa.note}</p>
          {data.visa.fee && (
            <p className="mt-2 text-[11px] text-[#d4a86a]/80">
              Estimated fee: <span className="font-semibold">{data.visa.fee}</span>
            </p>
          )}
        </div>
      )}

      {/* Quick facts grid */}
      <div className="grid grid-cols-2 gap-3">
        <Fact icon={<MapPin className="h-3.5 w-3.5" />} label="Capital" value={data.capital ?? "—"} />
        <Fact icon={<Globe className="h-3.5 w-3.5" />} label="Region" value={data.region ?? "—"} />
        <Fact
          icon={<Users className="h-3.5 w-3.5" />}
          label="Population"
          value={formatPopulation(data.population)}
        />
        <Fact
          icon={<Languages className="h-3.5 w-3.5" />}
          label="Languages"
          value={data.languages?.slice(0, 2).join(", ") ?? "—"}
        />
        <Fact
          icon={<Phone className="h-3.5 w-3.5" />}
          label="Calling Code"
          value={data.callingCode ?? "—"}
        />
        <Fact
          icon={<Clock className="h-3.5 w-3.5" />}
          label="Timezone"
          value={data.timezones?.[0] ?? "—"}
        />
        <Fact
          icon={<Car className="h-3.5 w-3.5" />}
          label="Drives On"
          value={data.drivesOn ? data.drivesOn.charAt(0).toUpperCase() + data.drivesOn.slice(1) : "—"}
        />
        <Fact
          icon={<Banknote className="h-3.5 w-3.5" />}
          label="Currency"
          value={currency ? `${currency.symbol ?? ""} ${currency.code}` : "—"}
          sub={currency?.name}
          accent
        />
      </div>
    </article>
  );
}

function Fact({ icon, label, value, sub, accent = false }) {
  return (
    <div
      className={`rounded-2xl border p-3 ${
        accent
          ? "border-[#d4a86a]/30 bg-[#d4a86a]/[0.06]"
          : "border-white/10 bg-white/[0.02]"
      }`}
    >
      <div className="mb-1 flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-white/40">
        {icon}
        {label}
      </div>
      <p className={`text-sm ${accent ? "font-serif text-lg text-[#d4a86a]" : "text-white"}`}>
        {value}
      </p>
      {sub && <p className="text-[11px] text-white/40">{sub}</p>}
    </div>
  );
}

function formatPopulation(n) {
  if (!n) return "—";
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toString();
}

function SkeletonCard() {
  return <div className="h-[420px] animate-pulse rounded-3xl border border-[#d4a86a]/10 bg-[#d4a86a]/[0.04]" />;
}

function ErrorCard({ message }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 text-sm text-white/50">
      {message}
    </div>
  );
}
