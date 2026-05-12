import { useMemo, useState } from "react";
import { Sparkles, Trophy, Calendar, Cloud, Compass, Plane, Building2 } from "lucide-react";
import HotelCard from "../components/HotelCard";
import FlightCard from "../components/FlightCard";
import AttractionCard from "../components/AttractionCard";
import ExploreTab from "../components/explore/ExploreTab";
import { formatCurrency, formatDateRange, nightsBetween } from "../lib/format";

/**
 * ResultsPage
 * Mirrors the screenshot structure with one new tab: "Explore".
 *
 * Props expected (or derive from URL params via useSearchParams):
 *   destination: "Dubai"
 *   originCode: "DEL"
 *   destCode: "DUBAI"
 *   guests: 2
 *   checkIn: "2026-05-15"
 *   checkOut: "2026-05-18"
 *   reply: "Dubai is a great choice!"
 *   results: { hotels, flights, attractions }
 *   currency: "INR"
 */
export default function ResultsPage({
  destination = "Dubai",
  originCode = "DEL",
  destCode = "DUBAI",
  guests = 2,
  checkIn = "2026-05-15",
  checkOut = "2026-05-18",
  reply = "Dubai is a great choice!",
  results = SAMPLE_RESULTS,
  currency = "INR",
}) {
  const [tab, setTab] = useState("overview");
  const nights = useMemo(() => nightsBetween(checkIn, checkOut), [checkIn, checkOut]);

  const hotels = results.hotels ?? [];
  const flights = results.flights ?? [];
  const attractions = results.attractions ?? [];
  const topPick = hotels[0];
  const moreHotels = hotels.slice(1);
  const lowestHotel = hotels.reduce(
    (min, h) => (h.pricePerNight < min ? h.pricePerNight : min),
    hotels[0]?.pricePerNight ?? 0
  );

  const tabs = [
    { id: "overview", label: "Overview", icon: Sparkles },
    { id: "flights", label: `Flights (${flights.length})`, icon: Plane },
    { id: "hotels", label: `Hotels (${hotels.length})`, icon: Building2 },
    { id: "things", label: "Things to do", icon: Compass },
    { id: "explore", label: "Explore", icon: Cloud, accent: true }, // NEW
  ];

  return (
    <main className="mx-auto max-w-7xl px-6 py-10 lg:py-14">
      {/* Title block */}
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-[#d4a86a]">
            {originCode} → {destCode} · {guests} GUESTS
          </p>
          <h1 className="mb-3 font-serif text-6xl text-white lg:text-7xl">{destination}</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/60">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" /> {formatDateRange(checkIn, checkOut)}
            </span>
            <span className="opacity-40">·</span>
            <span>{nights} nights</span>
            <span className="opacity-40">·</span>
            <span className="flex items-center gap-1.5">
              <Cloud className="h-3.5 w-3.5" /> 35°C
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-[#d4a86a]/20 bg-[#d4a86a]/[0.06] px-5 py-4 lg:text-right">
          <p className="text-[10px] uppercase tracking-wider text-[#d4a86a]">Hotels From</p>
          <p className="mt-1 font-serif text-3xl text-[#d4a86a]">
            {formatCurrency(lowestHotel, currency)}
          </p>
        </div>
      </div>

      {/* AI banner */}
      <div className="mb-10 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#d4a86a]/15 text-[#d4a86a]">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-[#d4a86a]">Promptly AI</p>
          <p className="text-white">{reply}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-10 border-b border-white/10">
        <nav className="-mb-px flex flex-wrap gap-x-2">
          {tabs.map(({ id, label, icon: Icon, accent }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`relative flex items-center gap-2 px-4 py-3 text-sm transition ${
                  active
                    ? accent
                      ? "text-emerald-300"
                      : "text-[#d4a86a]"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
                {accent && !active && (
                  <span className="ml-0.5 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                )}
                {active && (
                  <span
                    className={`absolute inset-x-3 -bottom-px h-0.5 ${
                      accent ? "bg-emerald-400" : "bg-[#d4a86a]"
                    }`}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Panels */}
      {tab === "overview" && (
        <OverviewPanel
          topPick={topPick}
          moreHotels={moreHotels}
          flights={flights}
          attractions={attractions}
          nights={nights}
          destination={destination}
          guests={guests}
        />
      )}

      {tab === "flights" && (
        <section className="space-y-3">
          <SectionHeader icon={Plane} title="Flights" />
          {flights.length === 0 ? (
            <EmptyPanel label="No flights found for these dates." />
          ) : (
            flights.map((f) => (
              <FlightCard key={f.id} flight={f} destination={destination} pax={guests} />
            ))
          )}
        </section>
      )}

      {tab === "hotels" && (
        <section className="space-y-6">
          {topPick && (
            <>
              <SectionHeader icon={Trophy} title="Top Pick" />
              <HotelCard
                hotel={topPick}
                nights={nights}
                destination={destination}
                variant="topPick"
              />
            </>
          )}
          {moreHotels.length > 0 && (
            <>
              <SectionHeader icon={Building2} title="More Hotels" />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {moreHotels.map((h) => (
                  <HotelCard key={h.id} hotel={h} nights={nights} destination={destination} />
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {tab === "things" && (
        <section className="space-y-4">
          <SectionHeader icon={Compass} title="Things to do" />
          {attractions.length === 0 ? (
            <EmptyPanel label="Activities coming soon for this destination." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {attractions.map((a) => (
                <AttractionCard key={a.id} attraction={a} destination={destination} />
              ))}
            </div>
          )}
        </section>
      )}

      {tab === "explore" && <ExploreTab destination={destination} />}
    </main>
  );
}

function OverviewPanel({ topPick, moreHotels, flights, attractions, nights, destination, guests }) {
  return (
    <div className="space-y-10">
      {topPick && (
        <section>
          <SectionHeader icon={Trophy} title="Top Pick" />
          <HotelCard hotel={topPick} nights={nights} destination={destination} variant="topPick" />
        </section>
      )}

      {moreHotels.length > 0 && (
        <section>
          <SectionHeader icon={Building2} title="More Hotels" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {moreHotels.slice(0, 3).map((h) => (
              <HotelCard key={h.id} hotel={h} nights={nights} destination={destination} />
            ))}
          </div>
        </section>
      )}

      {flights.length > 0 && (
        <section>
          <SectionHeader icon={Plane} title="Flights" />
          <div className="space-y-3">
            {flights.slice(0, 2).map((f) => (
              <FlightCard key={f.id} flight={f} destination={destination} pax={guests} />
            ))}
          </div>
        </section>
      )}

      {attractions.length > 0 && (
        <section>
          <SectionHeader icon={Compass} title="Things to do" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {attractions.slice(0, 3).map((a) => (
              <AttractionCard key={a.id} attraction={a} destination={destination} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function SectionHeader({ icon: Icon, title }) {
  return (
    <div className="mb-4 flex items-center gap-2 text-[#d4a86a]">
      <Icon className="h-4 w-4" />
      <h2 className="font-serif text-2xl">{title}</h2>
    </div>
  );
}

function EmptyPanel({ label }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center text-sm text-white/50">
      {label}
    </div>
  );
}

// ---------- Demo data (replace with your API) ----------
const SAMPLE_RESULTS = {
  hotels: [
    {
      id: "h1",
      name: "Dubai Grand Resort",
      location: "Beach Road, Dubai",
      pricePerNight: 8500,
      currency: "INR",
      amenities: ["Pool", "Spa", "WiFi", "Restaurant"],
      rating: 4.7,
      reviews: 2340,
    },
    {
      id: "h2",
      name: "Marina View Suites",
      location: "Dubai Marina",
      pricePerNight: 6200,
      currency: "INR",
      amenities: ["Pool", "Gym", "WiFi"],
      rating: 4.4,
      reviews: 1820,
    },
    {
      id: "h3",
      name: "Desert Pearl Hotel",
      location: "Downtown Dubai",
      pricePerNight: 4800,
      currency: "INR",
      amenities: ["WiFi", "Breakfast"],
      rating: 4.2,
      reviews: 980,
    },
  ],
  flights: [
    {
      id: "f1",
      from: "DEL",
      to: "DXB",
      airline: "Emirates EK 511",
      price: 18500,
      currency: "INR",
      duration: "3h 45m",
      stops: 0,
      depart: "2026-05-15T09:30",
      arrive: "2026-05-15T12:15",
    },
  ],
  attractions: [
    {
      id: "a1",
      name: "Burj Khalifa: At the Top",
      category: "Landmark",
      duration: "1h 30m",
      price: 4200,
      currency: "INR",
    },
    {
      id: "a2",
      name: "Desert Safari with BBQ",
      category: "Adventure",
      duration: "6h",
      price: 3500,
      currency: "INR",
    },
    {
      id: "a3",
      name: "Dubai Marina Yacht Cruise",
      category: "Cruise",
      duration: "2h",
      price: 2800,
      currency: "INR",
    },
  ],
};
