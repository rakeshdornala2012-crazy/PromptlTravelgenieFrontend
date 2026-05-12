import { motion } from "framer-motion";
import { Plus, Minus, Users, X } from "lucide-react";

export type People = {
  adults: number;
  children: number;
};

type Props = {
  value: People;
  onChange: (p: People) => void;
  onClose?: () => void;
};

const PeopleSelector = ({ value, onChange, onClose }: Props) => {
  const adjust = (key: keyof People, delta: number) => {
    const next = Math.max(key === "adults" ? 1 : 0, value[key] + delta);
    onChange({ ...value, [key]: Math.min(next, key === "adults" ? 12 : 8) });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-3xl border border-white/10 bg-[#0c0c0c]/95 p-5 shadow-2xl backdrop-blur-xl"
    >
      <div className="mb-5 flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">Travelers</p>
          <p className="mt-0.5 font-display text-lg text-white">
            {summarize(value)}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full text-white/50 hover:bg-white/5 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <Row
        title="Adults"
        sub="13+ years"
        value={value.adults}
        min={1}
        max={12}
        onChange={(d) => adjust("adults", d)}
      />
      <Row
        title="Children"
        sub="2 to 12 years"
        value={value.children}
        min={0}
        max={8}
        onChange={(d) => adjust("children", d)}
      />

      <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-[11px] text-white/50">
        Final pricing depends on traveler count and class.
      </div>
    </motion.div>
  );
};

const Row = ({
  title,
  sub,
  value,
  min,
  max,
  onChange,
}: {
  title: string;
  sub: string;
  value: number;
  min: number;
  max: number;
  onChange: (delta: number) => void;
}) => (
  <div className="flex items-center justify-between border-b border-white/5 py-3 last:border-0">
    <div>
      <p className="text-sm text-white">{title}</p>
      <p className="text-[11px] text-white/45">{sub}</p>
    </div>
    <div className="flex items-center gap-3">
      <button
        onClick={() => onChange(-1)}
        disabled={value <= min}
        aria-label={`Decrease ${title}`}
        className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white/80 transition hover:border-amber-400/50 hover:text-amber-300 disabled:cursor-not-allowed disabled:border-white/5 disabled:text-white/20"
      >
        <Minus className="h-4 w-4" />
      </button>
      <motion.span
        key={value}
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.18 }}
        className="w-6 text-center font-display text-lg text-white"
      >
        {value}
      </motion.span>
      <button
        onClick={() => onChange(1)}
        disabled={value >= max}
        aria-label={`Increase ${title}`}
        className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white/80 transition hover:border-amber-400/50 hover:text-amber-300 disabled:cursor-not-allowed disabled:border-white/5 disabled:text-white/20"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  </div>
);

const summarize = (p: People) => {
  const parts: string[] = [];
  parts.push(`${p.adults} ${p.adults === 1 ? "adult" : "adults"}`);
  if (p.children) parts.push(`${p.children} ${p.children === 1 ? "child" : "children"}`);
  return parts.join(" · ");
};

export const summarizePeople = summarize;
export default PeopleSelector;
