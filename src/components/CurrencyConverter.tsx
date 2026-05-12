import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { convertCurrency } from "@/lib/destination";

interface Props {
  localCurrency: string;
}

const CurrencyConverter = ({ localCurrency }: Props) => {
  const [amount, setAmount] = useState(1000);
  const [converted, setConverted] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [direction, setDirection] = useState<"to-local" | "from-local">("to-local");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const from = direction === "to-local" ? "INR" : localCurrency;
    const to = direction === "to-local" ? localCurrency : "INR";

    convertCurrency(amount, from, to).then((result) => {
      if (!cancelled) {
        setConverted(result);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [amount, direction, localCurrency]);

  if (!localCurrency || localCurrency === "INR") return null;

  const fromCode = direction === "to-local" ? "INR" : localCurrency;
  const toCode = direction === "to-local" ? localCurrency : "INR";

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="rounded-3xl border border-white/10 bg-secondary/30 p-6"
    >
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4">
        Live currency converter
      </div>

      <div className="flex items-center gap-2">
        {/* From */}
        <div className="flex-1">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
            {fromCode}
          </div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value) || 0)}
            className="w-full rounded-2xl border border-white/10 bg-background px-4 py-3 font-display text-xl outline-none focus:border-primary/40 transition-colors tabular-nums"
          />
        </div>

        {/* Swap button */}
        <button
          onClick={() =>
            setDirection(direction === "to-local" ? "from-local" : "to-local")
          }
          className="grid h-10 w-10 mt-5 place-items-center rounded-full border border-white/10 bg-secondary hover:bg-primary/20 hover:border-primary/40 transition-colors"
          aria-label="Swap direction"
        >
          <ArrowLeftRight className="h-4 w-4" />
        </button>

        {/* To */}
        <div className="flex-1">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
            {toCode}
          </div>
          <div className="rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3 font-display text-xl text-primary tabular-nums">
            {loading ? (
              <span className="text-muted-foreground text-sm">Converting...</span>
            ) : converted !== null ? (
              converted.toLocaleString("en-US", { maximumFractionDigits: 2 })
            ) : (
              "—"
            )}
          </div>
        </div>
      </div>

      <div className="text-[10px] text-muted-foreground mt-3 text-right">
        Live rates · powered by Frankfurter
      </div>
    </motion.section>
  );
};

export default CurrencyConverter;
