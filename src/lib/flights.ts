const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY;
const RAPIDAPI_HOST = "sky-scrapper.p.rapidapi.com";

export interface Flight {
  airline: string;
  flightNumber: string;
  departure: { airport: string; iata: string; scheduled: string };
  arrival: { airport: string; iata: string; scheduled: string };
  status: string;
  price?: number;
  duration?: string;
  stops?: string;
  logo?: string;
}

export interface FlightSearchParams {
  originSkyId: string;
  destinationSkyId: string;
  originEntityId: string;
  destinationEntityId: string;
  date: string;
  adults?: number;
  cabinClass?: "economy" | "premium_economy" | "business" | "first";
  currency?: string;
}

export const AIRPORT_MAP: Record<string, { skyId: string; entityId: string; name: string }> = {
  DEL: { skyId: "DELL", entityId: "27536550", name: "Indira Gandhi International" },
  BOM: { skyId: "BOMB", entityId: "27536551", name: "Chhatrapati Shivaji Maharaj International" },
  BLR: { skyId: "BLRE", entityId: "27536552", name: "Kempegowda International" },
  HYD: { skyId: "HYDE", entityId: "27536553", name: "Rajiv Gandhi International" },
  MAA: { skyId: "MAAA", entityId: "27536554", name: "Chennai International" },
  CCU: { skyId: "CCUU", entityId: "27536555", name: "Netaji Subhas Chandra Bose International" },
  GOI: { skyId: "GOII", entityId: "27536556", name: "Goa International" },
  DPS: { skyId: "DPSS", entityId: "27543673", name: "Ngurah Rai International, Bali" },
  MLE: { skyId: "MLEE", entityId: "27539609", name: "Velana International, Maldives" },
  HKT: { skyId: "HKTT", entityId: "27536562", name: "Phuket International" },
  DXB: { skyId: "DXBB", entityId: "27537691", name: "Dubai International" },
  SIN: { skyId: "SING", entityId: "27536559", name: "Changi Airport, Singapore" },
  LHR: { skyId: "LOND", entityId: "27544008", name: "London Heathrow" },
  JFK: { skyId: "NYCA", entityId: "27537542", name: "JFK International, New York" },
  NRT: { skyId: "TYOA", entityId: "27542004", name: "Narita International, Tokyo" },
  CDG: { skyId: "PARI", entityId: "27539733", name: "Charles de Gaulle, Paris" },
  BKK: { skyId: "BKKA", entityId: "27536563", name: "Suvarnabhumi, Bangkok" },
  SEZ: { skyId: "SEZZ", entityId: "27536564", name: "Seychelles International" },
};

export function getAirportInfo(iata: string) {
  return AIRPORT_MAP[iata.toUpperCase()] ?? null;
}

export async function searchFlights(params: FlightSearchParams): Promise<Flight[]> {
  try {
    const url = new URL(`https://${RAPIDAPI_HOST}/api/v2/flights/searchFlightsComplete`);
    url.searchParams.set("originSkyId", params.originSkyId);
    url.searchParams.set("destinationSkyId", params.destinationSkyId);
    url.searchParams.set("originEntityId", params.originEntityId);
    url.searchParams.set("destinationEntityId", params.destinationEntityId);
    url.searchParams.set("date", params.date);
    url.searchParams.set("adults", String(params.adults ?? 1));
    url.searchParams.set("cabinClass", params.cabinClass ?? "economy");
    url.searchParams.set("currency", params.currency ?? "INR");
    url.searchParams.set("market", "en-IN");
    url.searchParams.set("countryCode", "IN");
    url.searchParams.set("sortBy", "best");

    const res = await fetch(url.toString(), {
      headers: {
        "x-rapidapi-host": RAPIDAPI_HOST,
        "x-rapidapi-key": RAPIDAPI_KEY,
      },
    });

    const data = await res.json();
    const itineraries = data?.data?.itineraries ?? [];

    if (!itineraries.length) return getMockFlights(params.originSkyId, params.destinationSkyId);

    return itineraries.slice(0, 6).map((it: any) => {
      const leg = it.legs?.[0] ?? {};
      const segment = leg.segments?.[0] ?? {};
      const stops = leg.stopCount === 0 ? "Direct" : `${leg.stopCount} stop${leg.stopCount > 1 ? "s" : ""}`;
      const durationH = Math.floor((leg.durationInMinutes ?? 0) / 60);
      const durationM = (leg.durationInMinutes ?? 0) % 60;
      return {
        airline: leg.carriers?.marketing?.[0]?.name ?? "Unknown Airline",
        flightNumber: segment.flightNumber ?? "N/A",
        logo: leg.carriers?.marketing?.[0]?.logoUrl ?? "",
        departure: {
          airport: leg.origin?.name ?? params.originSkyId,
          iata: leg.origin?.displayCode ?? params.originSkyId,
          scheduled: leg.departure ?? "",
        },
        arrival: {
          airport: leg.destination?.name ?? params.destinationSkyId,
          iata: leg.destination?.displayCode ?? params.destinationSkyId,
          scheduled: leg.arrival ?? "",
        },
        status: "scheduled",
        price: it.price?.raw ?? 0,
        duration: `${durationH}h ${durationM}m`,
        stops,
      };
    });
  } catch (err) {
    console.error("Flight search failed:", err);
    return getMockFlights(params.originSkyId, params.destinationSkyId);
  }
}

export async function searchAirport(query: string): Promise<{ skyId: string; entityId: string; name: string; iata: string }[]> {
  try {
    const url = `https://${RAPIDAPI_HOST}/api/v1/flights/searchAirport?query=${encodeURIComponent(query)}&locale=en-US`;
    const res = await fetch(url, {
      headers: { "x-rapidapi-host": RAPIDAPI_HOST, "x-rapidapi-key": RAPIDAPI_KEY },
    });
    const data = await res.json();
    return (data?.data ?? []).slice(0, 5).map((a: any) => ({
      skyId: a.skyId,
      entityId: a.entityId,
      name: a.presentation?.title ?? a.skyId,
      iata: a.skyId,
    }));
  } catch { return []; }
}

function getMockFlights(dep: string, arr: string): Flight[] {
  return [
    {
      airline: "IndiGo", flightNumber: "6E-101", logo: "",
      departure: { airport: "Departure Airport", iata: dep, scheduled: new Date(Date.now() + 86400000).toISOString() },
      arrival: { airport: "Arrival Airport", iata: arr, scheduled: new Date(Date.now() + 86400000 + 16200000).toISOString() },
      status: "scheduled", price: 21800, duration: "4h 30m", stops: "Direct",
    },
    {
      airline: "Air India", flightNumber: "AI-302", logo: "",
      departure: { airport: "Departure Airport", iata: dep, scheduled: new Date(Date.now() + 86400000 + 18000000).toISOString() },
      arrival: { airport: "Arrival Airport", iata: arr, scheduled: new Date(Date.now() + 86400000 + 57600000).toISOString() },
      status: "scheduled", price: 24500, duration: "5h 0m", stops: "1 stop",
    },
    {
      airline: "Vistara", flightNumber: "UK-205", logo: "",
      departure: { airport: "Departure Airport", iata: dep, scheduled: new Date(Date.now() + 86400000 + 75600000).toISOString() },
      arrival: { airport: "Arrival Airport", iata: arr, scheduled: new Date(Date.now() + 86400000 + 97200000).toISOString() },
      status: "scheduled", price: 19200, duration: "6h 0m", stops: "Direct",
    },
  ];
}

export async function getLiveFlights(depIata: string, arrIata: string): Promise<Flight[]> {
  const origin = AIRPORT_MAP[depIata.toUpperCase()];
  const dest = AIRPORT_MAP[arrIata.toUpperCase()];
  if (!origin || !dest) return getMockFlights(depIata, arrIata);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return searchFlights({
    originSkyId: origin.skyId, destinationSkyId: dest.skyId,
    originEntityId: origin.entityId, destinationEntityId: dest.entityId,
    date: tomorrow.toISOString().split("T")[0],
  });
}
