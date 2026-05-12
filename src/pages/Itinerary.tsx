import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plane,
  Hotel,
  Compass,
  Car,
  Bike,
  MapPin,
  Star,
  Clock,
  Check,
  ShoppingBag,
  Sparkles,
  Zap,
  Trophy,
  Calendar,
  ShieldCheck,
  AlertCircle,
  Plus,
  Minus,
  Info,
} from "lucide-react";
import Nav from "@/components/Nav";
import { TripOption } from "@/components/planner/data";
import { useCart, cartItemBuilders } from "@/context/CartContext";
import { useTrips } from "@/hooks/useTrips";
import { getCityCenter } from "@/lib/geocode";

// ============================================================
//  TYPES
// ============================================================

type FlightOption = {
  id: string;
  airline: string;
  flightNumber: string;
  depart: string;
  arrive: string;
  duration: string;
  stops: string;
  price: number;
  fromCode: string;
  toCode: string;
  seatsLeft?: number;
};

type HotelOption = {
  id: string;
  name: string;
  type: "3-star" | "4-star" | "Airbnb";
  pricePerNight: number;
  rating: number;
  reviews: number;
  amenities: string[];
  area: string;
  badge?: "best-value" | "most-popular";
  spotsLeft?: number;
};

type ActivityOption = {
  id: string;
  name: string;
  category: string;
  duration: string;
  price: number;
  rating: number;
  description: string;
  spotsLeft?: number;
  defaultSelected?: boolean;
};

type TransportOption = {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: typeof Car;
  defaultSelected?: boolean;
};

// ============================================================
//  MOCK DATA GENERATORS
//  Adapt to whatever destination/nights/price context comes in
// ============================================================

const inr = (n: number) => "₹" + (Number(n) || 0).toLocaleString("en-IN");

// IATA lookup with fallback
const IATA_MAP: Record<string, string> = {
  bali: "DPS", goa: "GOI", dubai: "DXB", paris: "CDG",
  tokyo: "NRT", london: "LHR", manali: "KUU", maldives: "MLE",
  santorini: "JTR", lisbon: "LIS", coorg: "MYQ", kyoto: "KIX",
};

function buildFlights(destination: string, basePrice: number): FlightOption[] {
  const destCode = IATA_MAP[destination.toLowerCase()] ?? "BOM";
  const cheap = Math.max(2500, Math.round(basePrice * 0.85));
  const standard = Math.round(basePrice);
  const premium = Math.round(basePrice * 1.25);

  return [
    {
      id: "flight_1",
      airline: "IndiGo",
      flightNumber: "6E-101",
      depart: "11:50",
      arrive: "16:20",
      duration: "4h 30m",
      stops: "Non-stop",
      price: cheap,
      fromCode: "DEL",
      toCode: destCode,
      seatsLeft: 4,
    },
    {
      id: "flight_2",
      airline: "Air India",
      flightNumber: "AI-302",
      depart: "08:15",
      arrive: "12:35",
      duration: "4h 20m",
      stops: "Non-stop",
      price: standard,
      fromCode: "DEL",
      toCode: destCode,
    },
    {
      id: "flight_3",
      airline: "Vistara",
      flightNumber: "UK-205",
      depart: "20:30",
      arrive: "00:45",
      duration: "4h 15m",
      stops: "Non-stop",
      price: premium,
      fromCode: "DEL",
      toCode: destCode,
      seatsLeft: 2,
    },
  ];
}

function buildHotels(destination: string, basePrice: number): HotelOption[] {
  const lowest = Math.max(2200, Math.round(basePrice * 0.6));
  const mid = Math.round(basePrice * 1.0);
  const high = Math.round(basePrice * 1.55);

  return [
    {
      id: "hotel_3star",
      name: `${destination} Comfort Inn`,
      type: "3-star",
      pricePerNight: lowest,
      rating: 4.2,
      reviews: 1840,
      amenities: ["Free WiFi", "Breakfast", "Pool"],
      area: "City Center",
      badge: "best-value",
      spotsLeft: 3,
    },
    {
      id: "hotel_4star",
      name: `${destination} Grand Resort`,
      type: "4-star",
      pricePerNight: mid,
      rating: 4.6,
      reviews: 3210,
      amenities: ["Free WiFi", "Breakfast", "Pool", "Spa", "Gym"],
      area: "Beach Road",
      badge: "most-popular",
    },
    {
      id: "hotel_airbnb",
      name: `Boutique Villa in ${destination}`,
      type: "Airbnb",
      pricePerNight: high,
      rating: 4.9,
      reviews: 142,
      amenities: ["Private Pool", "Kitchen", "WiFi", "Garden"],
      area: "Quiet Suburbs",
      spotsLeft: 1,
    },
  ];
}

function buildActivities(destination: string): ActivityOption[] {
  const lower = destination.toLowerCase();
  const isBeach = ["bali", "goa", "maldives", "santorini", "phuket"].some((k) => lower.includes(k));
  const isMountain = ["manali", "coorg", "kyoto"].some((k) => lower.includes(k));

  const base: ActivityOption[] = [
    {
      id: "act_sightseeing",
      name: `${destination} City Sightseeing`,
      category: "Sightseeing",
      duration: "4h",
      price: 1800,
      rating: 4.5,
      description: "Guided tour of the top landmarks and hidden gems.",
      defaultSelected: true,
    },
    {
      id: "act_food",
      name: "Local Food Walk",
      category: "Culinary",
      duration: "3h",
      price: 2200,
      rating: 4.7,
      description: "Taste 7+ regional specialties with a local guide.",
      defaultSelected: true,
      spotsLeft: 4,
    },
    {
      id: "act_sunset",
      name: "Sunset Cruise",
      category: "Cruise",
      duration: "2.5h",
      price: 2800,
      rating: 4.8,
      description: "Golden hour on the water with snacks and drinks.",
    },
    {
      id: "act_nightlife",
      name: "Club Night Pass",
      category: "Nightlife",
      duration: "Until late",
      price: 2400,
      rating: 4.3,
      description: "VIP access to the city's top 3 nightclubs.",
    },
    {
      id: "act_spa",
      name: "Spa & Wellness Day",
      category: "Wellness",
      duration: "4h",
      price: 4500,
      rating: 4.9,
      description: "Full body massage, hot stone therapy, herbal bath.",
      spotsLeft: 2,
    },
    {
      id: "act_photography",
      name: "Photography Walk",
      category: "Cultural",
      duration: "2.5h",
      price: 1500,
      rating: 4.6,
      description: "Capture the city's best angles with a pro photographer.",
    },
  ];

  if (isBeach) {
    base.splice(1, 0, {
      id: "act_beach",
      name: "Beach Day Pass",
      category: "Beach",
      duration: "Full day",
      price: 1200,
      rating: 4.8,
      description: "Premium beach club access with loungers, towels, and drinks.",
      defaultSelected: true,
    });
    base.splice(3, 0, {
      id: "act_scuba",
      name: "Scuba Diving Experience",
      category: "Adventure",
      duration: "5h",
      price: 6500,
      rating: 4.9,
      description: "Discover the underwater world with certified instructors.",
      spotsLeft: 3,
    });
  }

  if (isMountain) {
    base.push({
      id: "act_trek",
      name: "Mountain Trek",
      category: "Adventure",
      duration: "6h",
      price: 2800,
      rating: 4.8,
      description: "Guided trek through scenic mountain trails.",
      spotsLeft: 5,
    });
  }

  return base;
}

function buildTransport(): TransportOption[] {
  return [
    {
      id: "tr_pickup",
      name: "Airport Pickup & Drop",
      description: "Private cab both ways, English-speaking driver",
      price: 2500,
      icon: Car,
      defaultSelected: true,
    },
    {
      id: "tr_dailycab",
      name: "Daily Cab Service",
      description: "On-demand cab for your full trip duration",
      price: 4000,
      icon: Car,
    },
    {
      id: "tr_bike",
      name: "Bike Rental",
      description: "Self-drive scooter for the entire stay",
      price: 1800,
      icon: Bike,
    },
  ];
}

// ============================================================
//  COMPONENT
// ============================================================

const Itinerary = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const cart = useCart();
  const { addTrip } = useTrips();

  // Trip can come from router state OR from cart (fallback)
  const trip = (location.state as { trip?: TripOption })?.trip;

  // Redirect home if no trip data
  useEffect(() => {
    if (!trip) {
      const t = setTimeout(() => navigate("/plan"), 100);
      return () => clearTimeout(t);
    }
  }, [trip, navigate]);

  if (!trip) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <Nav />
        <div className="mx-auto max-w-3xl px-4 pt-32 text-center">
          <p className="text-muted-foreground">No trip selected — redirecting...</p>
        </div>
      </main>
    );
  }

  const destination = trip.destination ?? "Your destination";
  const country = trip.country ?? "";
  const nights = trip.nights ?? 3;

  // Build the catalog of options
  const flights = useMemo(
    () => buildFlights(destination, trip.flight?.price ?? 15000),
    [destination, trip.flight?.price]
  );
  const hotels = useMemo(
    () => buildHotels(destination, trip.hotel?.price ?? 6000),
    [destination, trip.hotel?.price]
  );
  const activities = useMemo(() => buildActivities(destination), [destination]);
  const transport = useMemo(() => buildTransport(), []);

  // Selection state
  const [selectedFlight, setSelectedFlight] = useState<string>(flights[1]?.id ?? flights[0]?.id);
  const [selectedHotel, setSelectedHotel] = useState<string>(hotels[1]?.id ?? hotels[0]?.id);
  const [selectedActivities, setSelectedActivities] = useState<string[]>(
    activities.filter((a) => a.defaultSelected).map((a) => a.id)
  );
  const [selectedTransport, setSelectedTransport] = useState<string[]>(
    transport.filter((t) => t.defaultSelected).map((t) => t.id)
  );

  // Lookups for selected items
  const currentFlight = flights.find((f) => f.id === selectedFlight)!;
  const currentHotel = hotels.find((h) => h.id === selectedHotel)!;
  const currentActivities = activities.filter((a) => selectedActivities.includes(a.id));
  const currentTransport = transport.filter((t) => selectedTransport.includes(t.id));

  // Price calculations
  const flightTotal = currentFlight.price;
  const hotelTotal = currentHotel.pricePerNight * nights;
  const activitiesTotal = currentActivities.reduce((s, a) => s + a.price, 0);
  const transportTotal = currentTransport.reduce((s, t) => s + t.price, 0);
  const grandTotal = flightTotal + hotelTotal + activitiesTotal + transportTotal;

  // Toggles
  const toggleActivity = (id: string) =>
    setSelectedActivities((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  const toggleTransport = (id: string) =>
    setSelectedTransport((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  // Add entire bundle to cart + save trip with itinerary for map view
  const bookEntireTrip = () => {
    // Add flight
    cart.add(
      cartItemBuilders.flight({
        id: `bundle_${currentFlight.id}`,
        from: currentFlight.fromCode,
        to: currentFlight.toCode,
        depart: currentFlight.depart,
        arrive: currentFlight.arrive,
        airline: `${currentFlight.airline} ${currentFlight.flightNumber}`,
        price: currentFlight.price,
        currency: "INR",
        destination,
        pax: 1,
      })
    );
    // Add hotel
    cart.add(
      cartItemBuilders.hotel({
        id: `bundle_${currentHotel.id}`,
        name: currentHotel.name,
        location: currentHotel.area,
        pricePerNight: currentHotel.pricePerNight,
        nights,
        currency: "INR",
        destination,
        amenities: currentHotel.amenities,
        rating: currentHotel.rating,
      })
    );
    // Add activities
    currentActivities.forEach((a) =>
      cart.add(
        cartItemBuilders.attraction({
          id: `bundle_${a.id}`,
          name: a.name,
          price: a.price,
          currency: "INR",
          destination,
          duration: a.duration,
          category: a.category,
        })
      )
    );
    // Add transport
    currentTransport.forEach((t) =>
      cart.add(
        cartItemBuilders.attraction({
          id: `bundle_${t.id}`,
          name: t.name,
          price: t.price,
          currency: "INR",
          destination,
          duration: nights + " days",
          category: "Transport",
        })
      )
    );

    // Save trip with full itinerary for map view
    const cityCenter = getCityCenter(destination);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 14);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + nights);

    const middleDays = Math.max(1, nights - 1);
    const activitiesPerDay = Math.ceil(currentActivities.length / middleDays);

    addTrip({
      destination,
      country: country || destination,
      nights,
      total: grandTotal,
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
      status: "upcoming",
      emoji: "✈️",
      itinerary: {
        flight: currentFlight ? {
          route: `${currentFlight.fromCode} → ${currentFlight.toCode}`,
          carrier: currentFlight.airline,
          price: currentFlight.price,
          fromCode: currentFlight.fromCode,
          toCode: currentFlight.toCode,
        } : undefined,
        hotel: currentHotel ? {
          name: currentHotel.name,
          lat: cityCenter.lat + 0.005,
          lng: cityCenter.lng + 0.003,
          price: hotelTotal,
          pricePerNight: currentHotel.pricePerNight,
          area: currentHotel.area,
        } : undefined,
        activities: currentActivities.map((a, i) => {
          const calculatedDay = activitiesPerDay > 0 ? Math.floor(i / activitiesPerDay) + 1 : 1;
          return {
            name: a.name,
            day: Math.min(calculatedDay, nights),
            lat: cityCenter.lat + (Math.random() - 0.5) * 0.04,
            lng: cityCenter.lng + (Math.random() - 0.5) * 0.04,
            category: a.category,
            duration: a.duration,
            price: a.price,
          };
        }),
        transport: currentTransport.map((t) => ({ name: t.name, price: t.price })),
      },
    });

    // Navigate to cart
    setTimeout(() => navigate("/cart"), 600);
  };

  return (
    <main className="min-h-screen bg-background text-foreground pb-32 lg:pb-12">
      <Nav />

      <div className="mx-auto max-w-7xl px-4 pt-28">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft className="h-3 w-3" /> Back to options
          </button>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] text-primary">
            <Sparkles className="h-3 w-3" /> Customize your trip
          </div>
          <h1 className="mt-3 font-display text-4xl font-light leading-tight sm:text-5xl">
            Your <span className="italic text-gradient-amber">{destination}</span> itinerary
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {country && <>{country} · </>}
            {nights} nights · Mix and match every piece below
          </p>
        </motion.div>

        {/* Two-column layout: content + sticky sidebar */}
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* MAIN CONTENT */}
          <div className="space-y-10">
            {/* FLIGHTS */}
            <Section title="Flights" icon={Plane} count={flights.length}>
              <div className="space-y-3">
                {flights.map((f, i) => {
                  const isSelected = selectedFlight === f.id;
                  const delta = f.price - currentFlight.price;
                  return (
                    <SelectableCard
                      key={f.id}
                      isSelected={isSelected}
                      onClick={() => setSelectedFlight(f.id)}
                      delay={i * 0.05}
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <RadioIndicator selected={isSelected} />
                        <div className="flex flex-1 items-center gap-4">
                          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                            <Plane className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{f.airline}</p>
                            <p className="text-xs text-muted-foreground">{f.flightNumber}</p>
                          </div>
                          <div className="ml-auto flex items-center gap-4 sm:gap-6">
                            <div className="text-center">
                              <p className="font-display text-xl">{f.depart}</p>
                              <p className="text-[10px] text-muted-foreground">{f.fromCode}</p>
                            </div>
                            <div className="hidden flex-col items-center text-[10px] text-muted-foreground sm:flex">
                              <span>{f.duration}</span>
                              <div className="my-1 flex items-center gap-1">
                                <span className="h-px w-8 bg-border" />
                                <Plane className="h-2.5 w-2.5" />
                                <span className="h-px w-8 bg-border" />
                              </div>
                              <span>{f.stops}</span>
                            </div>
                            <div className="text-center">
                              <p className="font-display text-xl">{f.arrive}</p>
                              <p className="text-[10px] text-muted-foreground">{f.toCode}</p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-display text-lg">{inr(f.price)}</p>
                          {!isSelected && delta !== 0 && (
                            <p className={`text-[10px] ${delta > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                              {delta > 0 ? "+" : ""}{inr(delta)}
                            </p>
                          )}
                        </div>
                      </div>
                      {f.seatsLeft && f.seatsLeft <= 5 && (
                        <UrgencyBadge>Only {f.seatsLeft} seats left</UrgencyBadge>
                      )}
                    </SelectableCard>
                  );
                })}
              </div>
            </Section>

            {/* HOTELS */}
            <Section title="Hotels" icon={Hotel} count={hotels.length}>
              <div className="grid gap-3 sm:grid-cols-3">
                {hotels.map((h, i) => {
                  const isSelected = selectedHotel === h.id;
                  return (
                    <SelectableCard
                      key={h.id}
                      isSelected={isSelected}
                      onClick={() => setSelectedHotel(h.id)}
                      delay={i * 0.05}
                      className="flex flex-col"
                    >
                      <div className="flex items-start justify-between">
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                          {h.type}
                        </span>
                        {h.badge && <BadgePill kind={h.badge} />}
                      </div>
                      <h3 className="mt-3 font-display text-lg leading-tight">{h.name}</h3>
                      <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                        <MapPin className="h-3 w-3" /> {h.area}
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-xs">
                        <span className="inline-flex items-center gap-1 text-primary">
                          <Star className="h-3 w-3 fill-primary" /> {h.rating}
                        </span>
                        <span className="text-muted-foreground">({h.reviews.toLocaleString()})</span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1">
                        {h.amenities.slice(0, 3).map((a) => (
                          <span
                            key={a}
                            className="rounded-full border border-border bg-secondary/40 px-2 py-0.5 text-[10px] text-muted-foreground"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                      <div className="mt-auto pt-4">
                        <p className="font-display text-xl">{inr(h.pricePerNight)}</p>
                        <p className="text-[10px] text-muted-foreground">
                          / night · {inr(h.pricePerNight * nights)} total
                        </p>
                      </div>
                      {h.spotsLeft && h.spotsLeft <= 3 && (
                        <UrgencyBadge>Only {h.spotsLeft} rooms left</UrgencyBadge>
                      )}
                    </SelectableCard>
                  );
                })}
              </div>
            </Section>

            {/* ACTIVITIES */}
            <Section title="Activities" icon={Compass} count={activities.length}>
              <p className="-mt-2 mb-4 text-xs text-muted-foreground">
                Pick as many as you like — pricing updates instantly.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {activities.map((a, i) => {
                  const isSelected = selectedActivities.includes(a.id);
                  return (
                    <ToggleableCard
                      key={a.id}
                      isSelected={isSelected}
                      onClick={() => toggleActivity(a.id)}
                      delay={i * 0.04}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                            {a.category}
                          </span>
                          <h3 className="mt-2 font-display text-lg leading-tight">{a.name}</h3>
                          <p className="mt-1 text-xs text-muted-foreground">{a.description}</p>
                          <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {a.duration}
                            </span>
                            <span className="inline-flex items-center gap-1 text-primary">
                              <Star className="h-3 w-3 fill-primary" /> {a.rating}
                            </span>
                          </div>
                        </div>
                        <CheckboxIndicator selected={isSelected} />
                      </div>
                      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                        <p className="font-display text-base">{inr(a.price)}</p>
                        {a.spotsLeft && a.spotsLeft <= 5 && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] text-rose-300">
                            <Zap className="h-2.5 w-2.5" /> {a.spotsLeft} spots left
                          </span>
                        )}
                      </div>
                    </ToggleableCard>
                  );
                })}
              </div>
            </Section>

            {/* TRANSPORT */}
            <Section title="Transport" icon={Car} count={transport.length}>
              <div className="grid gap-3 sm:grid-cols-3">
                {transport.map((t, i) => {
                  const isSelected = selectedTransport.includes(t.id);
                  const Icon = t.icon;
                  return (
                    <ToggleableCard
                      key={t.id}
                      isSelected={isSelected}
                      onClick={() => toggleTransport(t.id)}
                      delay={i * 0.05}
                    >
                      <div className="flex items-start justify-between">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                          <Icon className="h-4 w-4" />
                        </div>
                        <CheckboxIndicator selected={isSelected} />
                      </div>
                      <h3 className="mt-3 font-display text-base leading-tight">{t.name}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">{t.description}</p>
                      <p className="mt-3 font-display text-lg">{inr(t.price)}</p>
                    </ToggleableCard>
                  );
                })}
              </div>
            </Section>

            {/* DAY-WISE TIMELINE */}
            <Section title="Day-by-day" icon={Calendar}>
              <DayTimeline
                nights={nights}
                destination={destination}
                hotel={currentHotel}
                activities={currentActivities}
              />
            </Section>
          </div>

          {/* SIDEBAR — sticky on desktop, fixed bottom on mobile */}
          <PriceSidebar
            destination={destination}
            nights={nights}
            currentFlight={currentFlight}
            currentHotel={currentHotel}
            currentActivities={currentActivities}
            currentTransport={currentTransport}
            flightTotal={flightTotal}
            hotelTotal={hotelTotal}
            activitiesTotal={activitiesTotal}
            transportTotal={transportTotal}
            grandTotal={grandTotal}
            onBookTrip={bookEntireTrip}
          />
        </div>
      </div>
    </main>
  );
};

// ============================================================
//  SUBCOMPONENTS
// ============================================================

const Section = ({
  title,
  icon: Icon,
  count,
  children,
}: {
  title: string;
  icon: any;
  count?: number;
  children: React.ReactNode;
}) => (
  <motion.section
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.1 }}
    transition={{ duration: 0.5 }}
  >
    <div className="mb-4 flex items-center gap-2">
      <div className="grid h-7 w-7 place-items-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <h2 className="font-display text-2xl">{title}</h2>
      {typeof count === "number" && (
        <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
          {count}
        </span>
      )}
    </div>
    {children}
  </motion.section>
);

const SelectableCard = ({
  isSelected,
  onClick,
  children,
  delay = 0,
  className = "",
}: {
  isSelected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) => (
  <motion.button
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    onClick={onClick}
    className={`relative w-full rounded-2xl border bg-gradient-card p-5 text-left transition-all ${
      isSelected
        ? "border-primary/50 shadow-glow"
        : "border-border hover:border-primary/30"
    } ${className}`}
  >
    {children}
  </motion.button>
);

const ToggleableCard = SelectableCard; // same visual pattern, semantically distinct

const RadioIndicator = ({ selected }: { selected: boolean }) => (
  <span
    className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border transition ${
      selected ? "border-primary bg-primary/15" : "border-border"
    }`}
  >
    {selected && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
  </span>
);

const CheckboxIndicator = ({ selected }: { selected: boolean }) => (
  <span
    className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border transition ${
      selected ? "border-primary bg-primary text-primary-foreground" : "border-border"
    }`}
  >
    {selected && <Check className="h-3.5 w-3.5" />}
  </span>
);

const BadgePill = ({ kind }: { kind: "best-value" | "most-popular" }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
      kind === "best-value"
        ? "bg-emerald-500/15 text-emerald-300"
        : "bg-primary/15 text-primary"
    }`}
  >
    {kind === "best-value" ? <Trophy className="h-2.5 w-2.5" /> : <Sparkles className="h-2.5 w-2.5" />}
    {kind === "best-value" ? "Best Value" : "Most Popular"}
  </span>
);

const UrgencyBadge = ({ children }: { children: React.ReactNode }) => (
  <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-2.5 py-1 text-[11px] text-rose-300">
    <Zap className="h-3 w-3" /> {children}
  </div>
);

// ============================================================
//  DAY TIMELINE
// ============================================================

const DayTimeline = ({
  nights,
  destination,
  hotel,
  activities,
}: {
  nights: number;
  destination: string;
  hotel: HotelOption;
  activities: ActivityOption[];
}) => {
  const days = nights + 1; // including arrival + departure days

  const getDayContent = (dayIndex: number) => {
    if (dayIndex === 0) {
      return {
        title: "Arrival",
        items: [
          { time: "Afternoon", text: `Land in ${destination}` },
          { time: "Evening", text: `Check in to ${hotel.name}` },
          { time: "Night", text: "Welcome dinner — explore the neighborhood" },
        ],
      };
    }
    if (dayIndex === days - 1) {
      return {
        title: "Departure",
        items: [
          { time: "Morning", text: "Final breakfast & last-minute shopping" },
          { time: "Afternoon", text: "Hotel checkout" },
          { time: "Evening", text: "Transfer to airport" },
        ],
      };
    }
    // Middle days — distribute activities
    const middleDayCount = Math.max(1, days - 2);
    const activitiesPerDay = Math.ceil(activities.length / middleDayCount);
    const startIdx = (dayIndex - 1) * activitiesPerDay;
    const dayActivities = activities.slice(startIdx, startIdx + activitiesPerDay);
    return {
      title: `Day ${dayIndex + 1}`,
      items: dayActivities.length
        ? dayActivities.map((a, i) => ({
            time: i === 0 ? "Morning" : i === 1 ? "Afternoon" : "Evening",
            text: a.name,
          }))
        : [{ time: "Free day", text: "Explore at your own pace" }],
    };
  };

  return (
    <ol className="relative space-y-5">
      {Array.from({ length: days }).map((_, i) => {
        const day = getDayContent(i);
        return (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="relative pl-12"
          >
            {/* Timeline marker */}
            <div className="absolute left-0 top-0 grid h-9 w-9 place-items-center rounded-full border border-primary/30 bg-primary/10 font-display text-sm text-primary">
              {i + 1}
            </div>
            {/* Connector line */}
            {i < days - 1 && (
              <span className="absolute left-[17px] top-9 h-full w-px bg-border" />
            )}
            <div className="rounded-2xl border border-border bg-gradient-card p-4">
              <p className="text-[10px] uppercase tracking-wider text-primary">
                Day {i + 1} · {day.title}
              </p>
              <ul className="mt-2 space-y-1.5">
                {day.items.map((item, idx) => (
                  <li key={idx} className="flex gap-3 text-sm">
                    <span className="w-20 shrink-0 text-xs text-muted-foreground">
                      {item.time}
                    </span>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
};

// ============================================================
//  PRICE SIDEBAR
// ============================================================

const PriceSidebar = ({
  destination,
  nights,
  currentFlight,
  currentHotel,
  currentActivities,
  currentTransport,
  flightTotal,
  hotelTotal,
  activitiesTotal,
  transportTotal,
  grandTotal,
  onBookTrip,
}: {
  destination: string;
  nights: number;
  currentFlight: FlightOption;
  currentHotel: HotelOption;
  currentActivities: ActivityOption[];
  currentTransport: TransportOption[];
  flightTotal: number;
  hotelTotal: number;
  activitiesTotal: number;
  transportTotal: number;
  grandTotal: number;
  onBookTrip: () => void;
}) => {
  const cart = useCart();

  // Animated total counter
  const [displayTotal, setDisplayTotal] = useState(grandTotal);
  useEffect(() => {
    if (displayTotal === grandTotal) return;
    const start = displayTotal;
    const diff = grandTotal - start;
    const duration = 400;
    const startTime = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayTotal(Math.round(start + diff * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [grandTotal]); // eslint-disable-line react-hooks/exhaustive-deps

  const lineItems = [
    { label: `Flight · ${currentFlight.airline}`, amount: flightTotal },
    {
      label: `${currentHotel.type} · ${nights} nights`,
      amount: hotelTotal,
      sub: `${inr(currentHotel.pricePerNight)} / night`,
    },
    ...currentActivities.map((a) => ({
      label: a.name,
      amount: a.price,
    })),
    ...currentTransport.map((t) => ({
      label: t.name,
      amount: t.price,
    })),
  ];

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block">
        <div className="sticky top-24 rounded-2xl border border-border bg-gradient-card p-5">
          <p className="text-[11px] uppercase tracking-wider text-primary">Trip total</p>
          <motion.p
            key={grandTotal}
            initial={{ scale: 0.96 }}
            animate={{ scale: 1 }}
            className="mt-1 font-display text-4xl"
          >
            {inr(displayTotal)}
          </motion.p>
          <p className="text-xs text-muted-foreground">
            {destination} · {nights} nights · all inclusive
          </p>

          <div className="my-5 h-px bg-border" />

          <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
            <AnimatePresence mode="popLayout">
              {lineItems.map((item, i) => (
                <motion.div
                  key={item.label}
                  layout
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-baseline justify-between gap-2 text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-muted-foreground">{item.label}</p>
                    {item.sub && <p className="text-[10px] text-muted-foreground/60">{item.sub}</p>}
                  </div>
                  <span className="shrink-0 font-medium">{inr(item.amount)}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="my-5 h-px bg-border" />

          <div className="flex items-baseline justify-between">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Final total</span>
            <span className="font-display text-2xl">{inr(grandTotal)}</span>
          </div>

          <button
            onClick={onBookTrip}
            className="mt-4 w-full rounded-2xl bg-foreground py-3 text-sm font-medium text-background transition hover:bg-primary hover:text-primary-foreground"
          >
            Book Entire Trip →
          </button>

          <button
            onClick={() => cart.open()}
            className="mt-2 w-full rounded-2xl border border-border py-2.5 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
          >
            View cart ({cart.itemCount})
          </button>

          <div className="mt-5 space-y-2 text-[11px] text-muted-foreground">
            <p className="flex items-center gap-1.5">
              <ShieldCheck className="h-3 w-3" /> Free cancellation up to 48h
            </p>
            <p className="flex items-center gap-1.5">
              <Check className="h-3 w-3" /> Best price guarantee
            </p>
            <p className="flex items-center gap-1.5">
              <Info className="h-3 w-3" /> Sample pricing — confirm at checkout
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Trip total</p>
            <p className="font-display text-2xl">{inr(displayTotal)}</p>
          </div>
          <button
            onClick={onBookTrip}
            className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:bg-primary"
          >
            Book trip
          </button>
        </div>
      </div>
    </>
  );
};

export default Itinerary;
