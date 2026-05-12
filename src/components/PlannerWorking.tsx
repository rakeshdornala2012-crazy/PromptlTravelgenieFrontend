// ============================================================
//  Replace your existing generateTrips function with this one.
//  Leave the rest of PlannerWorking.tsx unchanged.
// ============================================================

type ParsedTrip = {
  destination?: string;
  duration?: number;
  [key: string]: any;
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

// Sensible default if destination isn't in our table
const DEFAULT_DATA: DestData = {
  flight: 15000,
  hotel: 10000,
  country: "",
  iata: "BOM",
  carrier: "IndiGo",
};

// Capitalize first letter of each word
const titleCase = (s: string) =>
  s.replace(/\b\w/g, (c) => c.toUpperCase());

function generateTrips(parsed: ParsedTrip) {
  // 1. Resolve destination FIRST with a real fallback
  const destinationKey = (parsed?.destination || "goa").toString().toLowerCase().trim();
  const nights = parsed?.duration || 3;

  // 2. Look up data with safe fallback — won't crash on unknown destinations
  const data = BASE_DATA[destinationKey] ?? DEFAULT_DATA;

  // 3. Display-friendly versions
  const destinationDisplay = titleCase(destinationKey);
  const destUpper = destinationKey.toUpperCase();

  // 4. Build trips with EVERY field PlannerOptions expects, never undefined
  return [
    {
      id: "1",
      title: `${destUpper} Budget Plan`,
      destination: destinationDisplay,
      country: data.country,
      tier: "Essential",
      featured: false,
      nights,
      rating: 4.2,
      total: data.flight + data.hotel + 2000,
      price: data.flight + data.hotel + 2000,

      flight: {
        route: `HYD → ${data.iata}`,
        carrier: data.carrier,
        stops: "Non-stop",
        price: data.flight,
      },

      hotel: {
        name: "Standard Hotel",
        type: "3-star",
        price: data.hotel,
      },

      activities: {
        count: 3,
        sample: "City tour, sunset cruise",
        price: 2000,
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
      total: data.flight + data.hotel + 7000,
      price: data.flight + data.hotel + 7000,

      flight: {
        route: `HYD → ${data.iata}`,
        carrier: data.carrier === "IndiGo" ? "Air India" : data.carrier,
        stops: "Non-stop",
        price: data.flight + 2000,
      },

      hotel: {
        name: "Luxury Resort",
        type: "5-star",
        price: data.hotel + 4000,
      },

      activities: {
        count: 5,
        sample: "Private tours, fine dining",
        price: 4000,
      },

      visa: {
        type: "Fast Track Visa",
        price: 1000,
      },

      highlights: ["Voya Pick", "Concierge included", "Lounge access"],
    },
  ];
}
