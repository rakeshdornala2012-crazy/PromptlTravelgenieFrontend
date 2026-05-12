import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Plane, Hotel, Compass, FileCheck } from "lucide-react";
import { TripOption } from "./data";

type Props = {
  query: string;
  onComplete: (opts: TripOption[]) => void;
};

// ============================================================
//  Trip generation
// ============================================================

type ParsedTrip = {
  destination?: string;
  duration?: number;
};

type DestData = {
  flight: number;
  hotel: number;
  country: string;
  iata: string;
  carrier: string;
};

const BASE_DATA: Record<string, DestData> = {
  goa: { flight: 6000, hotel: 8000, country: "India", iata: "GOI", carrier: "IndiGo" },
  bali: { flight: 25000, hotel: 15000, country: "Indonesia", iata: "DPS", carrier: "Singapore Airlines" },
  manali: { flight: 5000, hotel: 6000, country: "India", iata: "KUU", carrier: "IndiGo" },
  dubai: { flight: 22000, hotel: 12000, country: "UAE", iata: "DXB", carrier: "Emirates" },
  paris: { flight: 55000, hotel: 18000, country: "France", iata: "CDG", carrier: "Air France" },
  tokyo: { flight: 48000, hotel: 14000, country: "Japan", iata: "NRT", carrier: "ANA" },
  london: { flight: 60000, hotel: 16000, country: "UK", iata: "LHR", carrier: "British Airways" },
  maldives: { flight: 28000, hotel: 22000, country: "Maldives", iata: "MLE", carrier: "IndiGo" },
  santorini: { flight: 65000, hotel: 17000, country: "Greece", iata: "JTR", carrier: "Aegean Airlines" },
  kyoto: { flight: 50000, hotel: 13000, country: "Japan", iata: "KIX", carrier: "ANA" },
  lisbon: { flight: 58000, hotel: 14000, country: "Portugal", iata: "LIS", carrier: "TAP Portugal" },
  coorg: { flight: 4500, hotel: 5500, country: "India", iata: "MYQ", carrier: "IndiGo" },
};

const DEFAULT_DATA: DestData = {
  flight: 15000,
  hotel: 10000,
  country: "",
  iata: "BOM",
  carrier: "IndiGo",
};

const titleCase = (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase());

// Parse the user's query string into structured intent.
// Examples:
//   "goa"                    -> { destination: "goa", duration: 3 }
//   "5 days in bali"         -> { destination: "bali", duration: 5 }
//   "weekend trip to dubai"  -> { destination: "dubai", duration: 2 }
function parseQuery(query: string): ParsedTrip {
  const q = (query || "").toString().toLowerCase().trim();
  if (!q) return { destination: "goa", duration: 3 };

  // Find a known destination keyword
  const destKeys = Object.keys(BASE_DATA);
  let destination = destKeys.find((k) => q.includes(k));

  // If query is a single word and matches no key, still pass it through as the destination
  if (!destination) {
    const firstWord = q.split(/\s+/)[0];
    destination = firstWord || "goa";
  }

  // Try to extract a duration like "5 days", "3 nights", "2 day"
  let duration = 3;
  const numMatch = q.match(/(\d+)\s*(day|night)/);
  if (numMatch) {
    duration = parseInt(numMatch[1], 10);
  } else if (q.includes("weekend")) {
    duration = 2;
  } else if (q.includes("week")) {
    duration = 7;
  }

  return { destination, duration };
}

function generateTrips(parsed: ParsedTrip): TripOption[] {
  const destinationKey = (parsed?.destination || "goa").toString().toLowerCase().trim();
  const nights = parsed?.duration || 3;

  const data = BASE_DATA[destinationKey] ?? DEFAULT_DATA;

  const destinationDisplay = titleCase(destinationKey);
  const destUpper = destinationKey.toUpperCase();

  // Activity prices scale with nights
  const budgetActivities = Math.round(2000 * (nights / 3));
  const premiumActivities = Math.round(4000 * (nights / 3));
  const budgetHotelTotal = data.hotel * Math.max(1, Math.floor(nights / 3));
  const premiumHotelTotal = (data.hotel + 4000) * Math.max(1, Math.floor(nights / 3));

  const trips: any[] = [
    {
      id: "1",
      title: `${destUpper} Budget Plan`,
      destination: destinationDisplay,
      country: data.country,
      tier: "Essential",
      featured: false,
      nights,
      rating: 4.2,
      total: data.flight + budgetHotelTotal + budgetActivities,
      price: data.flight + budgetHotelTotal + budgetActivities,

      flight: {
        route: `HYD → ${data.iata}`,
        carrier: data.carrier,
        stops: "Non-stop",
        price: data.flight,
      },

      hotel: {
        name: "Standard Hotel",
        type: "3-star",
        price: budgetHotelTotal,
      },

      activities: {
        count: 3,
        sample: "City tour, sunset cruise",
        price: budgetActivities,
      },

      visa: {
        type: "Tourist Visa",
        price: 0,
      },

      highlights: ["Best value", "Free cancellation", "Curated by Voya"],
    },
    {
      id: "2",
      title: `${destUpper} Premium Plan`,
      destination: destinationDisplay,
      country: data.country,
      tier: "Premium",
      featured: true,
      nights,
      rating: 4.7,
      total: data.flight + 2000 + premiumHotelTotal + premiumActivities + 1000,
      price: data.flight + 2000 + premiumHotelTotal + premiumActivities + 1000,

      flight: {
        route: `HYD → ${data.iata}`,
        carrier: data.carrier === "IndiGo" ? "Air India" : data.carrier,
        stops: "Non-stop",
        price: data.flight + 2000,
      },

      hotel: {
        name: "Luxury Resort",
        type: "5-star",
        price: premiumHotelTotal,
      },

      activities: {
        count: 5,
        sample: "Private tours, fine dining",
        price: premiumActivities,
      },

      visa: {
        type: "Fast Track Visa",
        price: 1000,
      },

      highlights: ["Voya Pick", "Concierge included", "Lounge access"],
    },
  ];

  return trips as TripOption[];
}

// ============================================================
//  Component
// ============================================================

const STAGES = [
  { icon: Sparkles, label: "Reading your request" },
  { icon: Plane, label: "Searching live flights" },
  { icon: Hotel, label: "Picking the right hotels" },
  { icon: Compass, label: "Curating activities" },
  { icon: FileCheck, label: "Checking visa & pricing" },
];

const PlannerWorking = ({ query, onComplete }: Props) => {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    // DEBUG — uncomment if you want to inspect the generated trips
    // console.log("🔍 query:", query);
    // console.log("🔍 parsed:", parseQuery(query));
    // console.log("🔍 trips:", generateTrips(parseQuery(query)));

    // Step through the stages for visual effect
    const stageTimers = STAGES.map((_, i) =>
      setTimeout(() => setStageIndex(i), 400 + i * 500)
    );

    // Generate trips and finish after the animation
    const finish = setTimeout(() => {
      const parsed = parseQuery(query);
      const trips = generateTrips(parsed);
      onComplete(trips);
    }, 400 + STAGES.length * 500 + 400);

    return () => {
      stageTimers.forEach(clearTimeout);
      clearTimeout(finish);
    };
  }, [query, onComplete]);

  return (
    <div className="relative min-h-screen bg-background pt-28 pb-20">
      <div className="mx-auto max-w-3xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] text-primary">
            <Sparkles className="h-3 w-3" />
            Voya is thinking
          </div>
          <h1 className="mt-4 font-display text-4xl font-light leading-tight sm:text-5xl">
            Building your <span className="italic text-gradient-amber">perfect trip</span>
          </h1>
          <p className="mt-3 text-sm text-muted-foreground italic">"{query}"</p>
        </motion.div>

        <div className="mt-12 space-y-3">
          {STAGES.map((stage, i) => {
            const Icon = stage.icon;
            const isActive = i === stageIndex;
            const isDone = i < stageIndex;
            return (
              <motion.div
                key={stage.label}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className={`flex items-center gap-4 rounded-2xl border p-4 transition-all ${
                  isActive
                    ? "border-primary/40 bg-primary/[0.04]"
                    : isDone
                      ? "border-border bg-secondary/20"
                      : "border-border/50 bg-secondary/10"
                }`}
              >
                <div
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-colors ${
                    isActive
                      ? "bg-primary/15 text-primary"
                      : isDone
                        ? "bg-secondary text-muted-foreground"
                        : "bg-secondary/50 text-muted-foreground/50"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 text-sm">
                  <span
                    className={
                      isActive
                        ? "text-foreground"
                        : isDone
                          ? "text-muted-foreground"
                          : "text-muted-foreground/50"
                    }
                  >
                    {stage.label}
                  </span>
                </div>
                {isActive && (
                  <span className="flex gap-1">
                    <Dot delay={0} />
                    <Dot delay={0.15} />
                    <Dot delay={0.3} />
                  </span>
                )}
                {isDone && (
                  <svg
                    className="h-4 w-4 text-primary"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const Dot = ({ delay }: { delay: number }) => (
  <motion.span
    className="inline-block h-1.5 w-1.5 rounded-full bg-primary"
    animate={{ opacity: [0.3, 1, 0.3] }}
    transition={{ duration: 1.2, delay, repeat: Infinity }}
  />
);

export default PlannerWorking;
