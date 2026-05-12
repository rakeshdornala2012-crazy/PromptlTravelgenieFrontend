import { motion } from "framer-motion";
import { MapPin, Globe, Users, Phone, Clock, Car, Languages } from "lucide-react";
import { CountryInfo, VisaInfo } from "@/lib/destination";

interface Props {
  country: CountryInfo | null;
  visa: VisaInfo;
}

const CountryCard = ({ country, visa }: Props) => {
  if (!country) return null;

  const formatPopulation = (n: number) => {
    if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + "B";
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
    if (n >= 1_000) return (n / 1_000).toFixed(0) + "K";
    return n.toString();
  };

  const facts = [
    { icon: MapPin, label: "Capital", value: country.capital },
    { icon: Globe, label: "Region", value: country.region },
    { icon: Users, label: "Population", value: formatPopulation(country.population) },
    {
      icon: Languages,
      label: "Languages",
      value: country.languages.slice(0, 2).join(", "),
    },
    {
      icon: Phone,
      label: "Calling code",
      value: country.callingCode || "—",
    },
    {
      icon: Clock,
      label: "Timezone",
      value: country.timezones[0] ?? "—",
    },
    {
      icon: Car,
      label: "Drives on",
      value: country.drivingSide === "right" ? "Right" : "Left",
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="rounded-3xl border border-white/10 bg-secondary/30 p-6"
    >
      <div className="flex items-start gap-4 pb-4 border-b border-white/5">
        {country.flag && (
          <img
            src={country.flag}
            alt={country.name + " flag"}
            className="h-12 w-16 rounded-md object-cover border border-white/10"
          />
        )}
        <div className="flex-1">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Country
          </div>
          <div className="font-display text-2xl mt-0.5">{country.name}</div>
        </div>
      </div>

      {/* Visa banner */}
      <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3">
        <div className="text-[10px] uppercase tracking-widest text-amber-300/80 mb-0.5">
          Visa for Indian passport
        </div>
        <div className="text-sm font-medium text-amber-200">{visa.required}</div>
        <div className="text-xs text-amber-200/70 mt-0.5">{visa.notes}</div>
      </div>

      {/* Facts grid */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {facts.map((f) => (
          <div
            key={f.label}
            className="flex items-start gap-2.5 rounded-xl bg-secondary/40 p-2.5"
          >
            <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-secondary">
              <f.icon className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {f.label}
              </div>
              <div className="text-xs truncate" title={f.value}>
                {f.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Currency */}
      <div className="mt-3 flex items-center justify-between rounded-2xl bg-primary/10 border border-primary/20 px-4 py-2.5">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-primary/80">
            Local currency
          </div>
          <div className="text-sm font-medium">{country.currency.name}</div>
        </div>
        <div className="font-display text-2xl text-primary">
          {country.currency.symbol} {country.currency.code}
        </div>
      </div>
    </motion.section>
  );
};

export default CountryCard;
