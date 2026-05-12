import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { FileCheck, Search, Loader2, CheckCircle2, XCircle, AlertCircle, Info, Globe, ArrowRight } from "lucide-react";
import { checkVisa, checkMultipleVisa, COUNTRIES, type VisaResult } from "@/lib/visa";

const STATUS_CONFIG = {
  visa_free:       { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/15 border-emerald-500/30", label: "Visa Free" },
  visa_on_arrival: { icon: CheckCircle2, color: "text-amber-400",   bg: "bg-amber-500/15 border-amber-500/30",   label: "Visa on Arrival" },
  e_visa:          { icon: Info,         color: "text-sky-400",     bg: "bg-sky-500/15 border-sky-500/30",       label: "e-Visa" },
  visa_required:   { icon: AlertCircle,  color: "text-orange-400",  bg: "bg-orange-500/15 border-orange-500/30", label: "Visa Required" },
  not_allowed:     { icon: XCircle,      color: "text-red-400",     bg: "bg-red-500/15 border-red-500/30",       label: "Entry Not Allowed" },
  unknown:         { icon: Globe,        color: "text-muted-foreground", bg: "bg-secondary border-white/10",    label: "Check Embassy" },
};

// Popular travel destinations for Indians
const POPULAR_MULTI = ["TH", "ID", "MV", "SG", "AE", "JP", "FR", "GB", "US", "AU"];

export default function VisaChecker() {
  const [passport, setPassport] = useState("IN");
  const [destination, setDestination] = useState("TH");
  const [result, setResult] = useState<VisaResult | null>(null);
  const [multiResults, setMultiResults] = useState<VisaResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"single" | "multi">("single");

  const handleSingleCheck = async () => {
    setLoading(true);
    const r = await checkVisa(passport, destination);
    setResult(r);
    setMultiResults([]);
    setLoading(false);
  };

  const handleMultiCheck = async () => {
    setLoading(true);
    const results = await checkMultipleVisa(passport, POPULAR_MULTI);
    setMultiResults(results);
    setResult(null);
    setLoading(false);
  };

  const countryOptions = Object.entries(COUNTRIES).sort((a, b) => a[1].localeCompare(b[1]));

  return (
    <div className="w-full">
      <div className="glass rounded-3xl p-6 shadow-elegant">
        <div className="flex items-center gap-2 mb-5">
          <div className="h-8 w-8 rounded-xl bg-primary/15 grid place-items-center">
            <FileCheck className="h-4 w-4 text-primary" />
          </div>
          <span className="font-display text-lg">Visa Requirements</span>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-1 rounded-xl border border-white/10 bg-secondary/30 p-1 mb-5 w-fit">
          {(["single", "multi"] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)}
              className={`rounded-lg px-4 py-1.5 text-xs font-medium transition-all capitalize ${mode === m ? "bg-primary/20 text-primary" : "text-muted-foreground"}`}>
              {m === "single" ? "Single Check" : "Multi Destination"}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1.5">Your Passport</label>
            <select value={passport} onChange={(e) => setPassport(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-secondary/50 px-4 py-3 text-sm outline-none appearance-none focus:border-primary/40">
              {countryOptions.map(([code, name]) => (
                <option key={code} value={code}>{name} ({code})</option>
              ))}
            </select>
          </div>
          {mode === "single" && (
            <div>
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1.5">Destination Country</label>
              <select value={destination} onChange={(e) => setDestination(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-secondary/50 px-4 py-3 text-sm outline-none appearance-none focus:border-primary/40">
                {countryOptions.map(([code, name]) => (
                  <option key={code} value={code}>{name} ({code})</option>
                ))}
              </select>
            </div>
          )}
          {mode === "multi" && (
            <div className="flex items-end">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Check visa requirements for <span className="text-foreground">{POPULAR_MULTI.length} top destinations</span> at once.
              </p>
            </div>
          )}
        </div>

        <button onClick={mode === "single" ? handleSingleCheck : handleMultiCheck} disabled={loading}
          className="w-full rounded-xl bg-gradient-amber py-3 font-medium text-sm text-primary-foreground flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          {loading ? "Checking requirements..." : mode === "single" ? "Check Visa" : "Check All Destinations"}
        </button>
      </div>

      {/* Single result */}
      <AnimatePresence>
        {result && !loading && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
            {(() => {
              const cfg = STATUS_CONFIG[result.status];
              const Icon = cfg.icon;
              return (
                <div className={`glass rounded-3xl border p-6 ${cfg.bg}`}>
                  <div className="flex items-start gap-4">
                    <div className={`h-12 w-12 rounded-2xl grid place-items-center shrink-0 ${cfg.bg}`}>
                      <Icon className={`h-6 w-6 ${cfg.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-sm font-medium uppercase tracking-widest ${cfg.color}`}>{cfg.label}</span>
                      </div>
                      <h3 className="font-display text-2xl mb-1">
                        {result.passportName} → {result.destinationName}
                      </h3>
                      {result.duration && (
                        <p className="text-sm text-muted-foreground">Stay up to: <span className="text-foreground">{result.duration}</span></p>
                      )}
                      {result.notes && (
                        <p className="mt-3 text-sm text-muted-foreground border-t border-white/10 pt-3">{result.notes}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">Always verify with the official embassy before travelling.</p>
                    <a href={`https://www.google.com/search?q=visa+requirement+${result.passportName}+to+${result.destinationName}`}
                      target="_blank" rel="noopener noreferrer"
                      className="text-xs text-primary flex items-center gap-1 hover:underline">
                      Verify <ArrowRight className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Multi results */}
      <AnimatePresence>
        {multiResults.length > 0 && !loading && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-lg">Visa status for {COUNTRIES[passport] ?? passport} passport</h3>
              <span className="text-xs text-muted-foreground">{multiResults.length} destinations</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {multiResults.map((r, i) => {
                const cfg = STATUS_CONFIG[r.status];
                const Icon = cfg.icon;
                return (
                  <motion.div key={r.destination} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                    className={`glass rounded-2xl border p-4 flex items-center gap-3 ${cfg.bg}`}>
                    <Icon className={`h-5 w-5 shrink-0 ${cfg.color}`} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{r.destinationName}</div>
                      {r.duration && <div className="text-xs text-muted-foreground">Up to {r.duration}</div>}
                    </div>
                    <span className={`text-[10px] uppercase tracking-widest shrink-0 ${cfg.color}`}>{cfg.label}</span>
                  </motion.div>
                );
              })}
            </div>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Data is indicative only. Always verify with official embassy sources before travel.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading skeleton for multi */}
      {loading && mode === "multi" && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {POPULAR_MULTI.map((_, i) => (
            <div key={i} className="glass rounded-2xl p-4 animate-pulse flex items-center gap-3">
              <div className="h-5 w-5 rounded-full bg-white/10 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-24 bg-white/10 rounded" />
                <div className="h-2.5 w-16 bg-white/5 rounded" />
              </div>
              <div className="h-3 w-16 bg-white/10 rounded" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
