import { motion } from "framer-motion";
import { useRef } from "react";
import { Wallet, X } from "lucide-react";

type Props = {
  value: number; // budget in INR
  onChange: (v: number) => void;
  onClose?: () => void;
};

const MIN = 10000;
const MAX = 500000;

const PRESETS = [
  { label: "Under ₹30K", value: 30000 },
  { label: "₹50K", value: 50000 },
  { label: "₹1L", value: 100000 },
  { label: "₹2L", value: 200000 },
  { label: "₹5L", value: 500000 },
];

const formatBudget = (n: number) => {
  if (n >= 100000) return `₹${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
};

const BudgetSlider = ({ value, onChange, onClose }: Props) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const percent = ((value - MIN) / (MAX - MIN)) * 100;

  const moveToClientX = (clientX: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    // Snap to ₹1000
    const raw = MIN + ratio * (MAX - MIN);
    const snapped = Math.round(raw / 1000) * 1000;
    onChange(snapped);
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
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">Budget</p>
          <motion.p
            key={value}
            initial={{ scale: 0.92 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
            className="mt-0.5 font-display text-3xl text-white"
          >
            Up to {formatBudget(value)}
          </motion.p>
          <p className="text-[11px] text-white/50">per person, all-in</p>
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

      {/* Slider track */}
      <div className="relative px-3 py-6">
        <div
          ref={trackRef}
          onMouseDown={(e) => {
            moveToClientX(e.clientX);
            const onMove = (ev: MouseEvent) => moveToClientX(ev.clientX);
            const onUp = () => {
              window.removeEventListener("mousemove", onMove);
              window.removeEventListener("mouseup", onUp);
            };
            window.addEventListener("mousemove", onMove);
            window.addEventListener("mouseup", onUp);
          }}
          onTouchStart={(e) => {
            const t = e.touches[0];
            moveToClientX(t.clientX);
          }}
          onTouchMove={(e) => {
            const t = e.touches[0];
            moveToClientX(t.clientX);
          }}
          className="relative h-2 cursor-pointer rounded-full bg-white/10"
        >
          {/* Filled track */}
          <motion.div
            className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-300 to-rose-400"
            animate={{ width: `${percent}%` }}
            transition={{ type: "spring", stiffness: 200, damping: 26 }}
          />
          {/* Handle */}
          <motion.div
            className="absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-amber-400 bg-white shadow-lg"
            animate={{ left: `${percent}%` }}
            transition={{ type: "spring", stiffness: 200, damping: 26 }}
          />
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-white/40">
          <span>{formatBudget(MIN)}</span>
          <span>{formatBudget(MAX)}</span>
        </div>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-1.5 border-t border-white/5 pt-4">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => onChange(p.value)}
            className={`rounded-full border px-3 py-1 text-[11px] transition ${
              value === p.value
                ? "border-amber-400/60 bg-amber-400/[0.08] text-amber-200"
                : "border-white/10 bg-white/[0.02] text-white/70 hover:border-amber-400/30 hover:text-white"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
    </motion.div>
  );
};

export const formatBudgetShort = formatBudget;
export default BudgetSlider;
