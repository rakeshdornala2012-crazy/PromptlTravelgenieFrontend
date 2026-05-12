import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from "lucide-react";

export type DateRange = {
  start: Date | null;
  end: Date | null;
};

type Props = {
  value: DateRange;
  onChange: (range: DateRange) => void;
  onClose?: () => void;
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

const today = new Date();
today.setHours(0, 0, 0, 0);

const sameDay = (a: Date | null, b: Date | null) => {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

const isBetween = (d: Date, start: Date | null, end: Date | null) => {
  if (!start || !end) return false;
  return d > start && d < end;
};

const formatShort = (d: Date | null) => {
  if (!d) return "—";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

const DatePicker = ({ value, onChange, onClose }: Props) => {
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  const handleSelect = (date: Date) => {
    if (!value.start || (value.start && value.end)) {
      // Start fresh
      onChange({ start: date, end: null });
    } else if (value.start && !value.end) {
      // Set end (or swap if user picked earlier date)
      if (date < value.start) {
        onChange({ start: date, end: value.start });
      } else if (sameDay(date, value.start)) {
        // Click same day twice — treat as single-day range
        onChange({ start: date, end: date });
      } else {
        onChange({ start: value.start, end: date });
      }
    }
  };

  const nextMonth = () => {
    const d = new Date(viewMonth);
    d.setMonth(d.getMonth() + 1);
    setViewMonth(d);
  };
  const prevMonth = () => {
    const d = new Date(viewMonth);
    d.setMonth(d.getMonth() - 1);
    setViewMonth(d);
  };

  const monthRight = useMemo(() => {
    const d = new Date(viewMonth);
    d.setMonth(d.getMonth() + 1);
    return d;
  }, [viewMonth]);

  const nights = useMemo(() => {
    if (!value.start || !value.end) return 0;
    return Math.round((value.end.getTime() - value.start.getTime()) / (1000 * 60 * 60 * 24));
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-3xl border border-white/10 bg-[#0c0c0c]/95 p-5 shadow-2xl backdrop-blur-xl"
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">When</p>
          <p className="mt-0.5 font-display text-lg text-white">
            {value.start ? formatShort(value.start) : "Select start"}
            <span className="mx-2 text-white/30">→</span>
            {value.end ? formatShort(value.end) : value.start ? "Select end" : "—"}
          </p>
          {nights > 0 && (
            <p className="mt-0.5 text-xs text-amber-400">
              {nights} {nights === 1 ? "night" : "nights"}
            </p>
          )}
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

      {/* Nav */}
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="grid h-8 w-8 place-items-center rounded-full text-white/70 hover:bg-white/5 hover:text-white"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex flex-1 items-center justify-around">
          <p className="font-display text-sm text-white">
            {MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
          </p>
          <p className="hidden font-display text-sm text-white sm:block">
            {MONTHS[monthRight.getMonth()]} {monthRight.getFullYear()}
          </p>
        </div>
        <button
          onClick={nextMonth}
          className="grid h-8 w-8 place-items-center rounded-full text-white/70 hover:bg-white/5 hover:text-white"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Months */}
      <div className="grid gap-6 sm:grid-cols-2">
        <MonthGrid
          month={viewMonth}
          value={value}
          hoverDate={hoverDate}
          onSelect={handleSelect}
          onHover={setHoverDate}
        />
        <div className="hidden sm:block">
          <MonthGrid
            month={monthRight}
            value={value}
            hoverDate={hoverDate}
            onSelect={handleSelect}
            onHover={setHoverDate}
          />
        </div>
      </div>

      {/* Quick chips */}
      <div className="mt-4 flex flex-wrap gap-1.5 border-t border-white/5 pt-4">
        {[
          { label: "Weekend", days: 2 },
          { label: "5 days", days: 5 },
          { label: "1 week", days: 7 },
          { label: "10 days", days: 10 },
          { label: "2 weeks", days: 14 },
        ].map((preset) => (
          <button
            key={preset.label}
            onClick={() => {
              const start = new Date();
              start.setDate(start.getDate() + 7); // a week from now
              const end = new Date(start);
              end.setDate(end.getDate() + preset.days);
              onChange({ start, end });
            }}
            className="rounded-full border border-white/10 bg-white/[0.02] px-3 py-1 text-[11px] text-white/70 transition hover:border-amber-400/40 hover:bg-amber-400/[0.06] hover:text-white"
          >
            {preset.label}
          </button>
        ))}
        <button
          onClick={() => onChange({ start: null, end: null })}
          className="ml-auto rounded-full px-3 py-1 text-[11px] text-white/50 hover:text-white"
        >
          Clear
        </button>
      </div>
    </motion.div>
  );
};

// ---------- Month Grid ----------

const MonthGrid = ({
  month,
  value,
  hoverDate,
  onSelect,
  onHover,
}: {
  month: Date;
  value: DateRange;
  hoverDate: Date | null;
  onSelect: (d: Date) => void;
  onHover: (d: Date | null) => void;
}) => {
  const days = useMemo(() => buildMonthDays(month), [month]);

  return (
    <div>
      <div className="mb-2 grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((d, i) => (
          <span key={i} className="text-[10px] font-medium text-white/30">
            {d}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          if (!day) return <span key={i} className="aspect-square" />;

          const isPast = day < today;
          const isStart = sameDay(day, value.start);
          const isEnd = sameDay(day, value.end);
          // Show range visual either to confirmed end or to the date being hovered
          const previewEnd = value.end ?? hoverDate;
          const inRange =
            value.start && previewEnd && isBetween(day, value.start, previewEnd);

          const isToday = sameDay(day, today);

          return (
            <button
              key={i}
              disabled={isPast}
              onClick={() => onSelect(day)}
              onMouseEnter={() => !isPast && onHover(day)}
              onMouseLeave={() => onHover(null)}
              className={`aspect-square rounded-lg text-xs transition ${
                isPast
                  ? "cursor-not-allowed text-white/15"
                  : isStart || isEnd
                    ? "bg-amber-400 font-semibold text-black"
                    : inRange
                      ? "bg-amber-400/15 text-amber-200"
                      : "text-white/80 hover:bg-white/5"
              } ${isToday && !isStart && !isEnd ? "ring-1 ring-white/20" : ""}`}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};

function buildMonthDays(month: Date): (Date | null)[] {
  const year = month.getFullYear();
  const monthIdx = month.getMonth();
  const firstDay = new Date(year, monthIdx, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, monthIdx, d));
  // Pad to 6 rows for visual stability
  while (cells.length < 42) cells.push(null);
  return cells;
}

export default DatePicker;
