import { useEffect, useState } from "react";

export interface TripActivity {
  name: string;
  day: number;
  lat: number;
  lng: number;
  category: string;
  duration: string;
  price?: number;
}

export interface TripItinerary {
  flight?: { route: string; carrier: string; price: number; fromCode: string; toCode: string };
  hotel?: { name: string; lat: number; lng: number; price: number; pricePerNight: number; area: string };
  activities: TripActivity[];
  transport?: { name: string; price: number }[];
}

export interface SavedTrip {
  id: string;
  destination: string;
  country: string;
  nights: number;
  total: number;
  startDate: string;
  endDate: string;
  status: "upcoming" | "past" | "draft";
  emoji: string;
  bookedAt: string;
  itinerary?: TripItinerary;
}

const STORAGE_KEY = "voya-trips";

export function useTrips() {
  const [trips, setTrips] = useState<SavedTrip[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setTrips(JSON.parse(saved));
      } catch {
        setTrips([]);
      }
    } else {
      // Seed with demo trips including itinerary data for map view
      const demo: SavedTrip[] = [
        {
          id: "demo-1",
          destination: "Bali",
          country: "Indonesia",
          nights: 6,
          total: 52000,
          startDate: "2026-06-12",
          endDate: "2026-06-18",
          status: "upcoming",
          emoji: "🌴",
          bookedAt: new Date().toISOString(),
          itinerary: {
            flight: { route: "DEL → DPS", carrier: "AirAsia", price: 21800, fromCode: "DEL", toCode: "DPS" },
            hotel: { name: "Ubud Jungle Retreat", lat: -8.5069, lng: 115.2625, price: 18400, pricePerNight: 3067, area: "Ubud" },
            activities: [
              { name: "Tanah Lot Temple", day: 1, lat: -8.6211, lng: 115.0868, category: "Sightseeing", duration: "3h", price: 500 },
              { name: "Tegallalang Rice Terraces", day: 1, lat: -8.4312, lng: 115.2790, category: "Sightseeing", duration: "2h", price: 300 },
              { name: "Sacred Monkey Forest", day: 2, lat: -8.5186, lng: 115.2588, category: "Nature", duration: "2h", price: 400 },
              { name: "Local Food Walk", day: 2, lat: -8.5189, lng: 115.2630, category: "Culinary", duration: "3h", price: 2200 },
              { name: "Beach Day Pass", day: 3, lat: -8.7227, lng: 115.1696, category: "Beach", duration: "Full day", price: 1200 },
              { name: "Scuba Diving Experience", day: 3, lat: -8.7498, lng: 115.1736, category: "Adventure", duration: "5h", price: 6500 },
              { name: "Uluwatu Temple", day: 4, lat: -8.8291, lng: 115.0849, category: "Sightseeing", duration: "3h", price: 400 },
              { name: "Sunset Cruise", day: 4, lat: -8.7527, lng: 115.1695, category: "Cruise", duration: "2.5h", price: 2800 },
              { name: "Spa & Wellness Day", day: 5, lat: -8.5100, lng: 115.2610, category: "Wellness", duration: "4h", price: 4500 },
              { name: "Photography Walk", day: 5, lat: -8.5189, lng: 115.2630, category: "Cultural", duration: "2.5h", price: 1500 },
            ],
            transport: [{ name: "Airport Pickup & Drop", price: 2500 }],
          },
        },
        {
          id: "demo-2",
          destination: "Manali",
          country: "India",
          nights: 4,
          total: 21500,
          startDate: "2025-12-22",
          endDate: "2025-12-26",
          status: "past",
          emoji: "🏔️",
          bookedAt: "2025-11-10T00:00:00Z",
          itinerary: {
            flight: { route: "DEL → KUU", carrier: "IndiGo", price: 5500, fromCode: "DEL", toCode: "KUU" },
            hotel: { name: "Manali Grand Resort", lat: 32.2620, lng: 77.1734, price: 8000, pricePerNight: 2000, area: "Mall Road" },
            activities: [
              { name: "Hadimba Temple", day: 1, lat: 32.2434, lng: 77.1680, category: "Sightseeing", duration: "2h", price: 0 },
              { name: "Manali City Sightseeing", day: 1, lat: 32.2432, lng: 77.1892, category: "Sightseeing", duration: "4h", price: 1800 },
              { name: "Solang Valley", day: 2, lat: 32.3154, lng: 77.1571, category: "Adventure", duration: "Full day", price: 2500 },
              { name: "Mountain Trek", day: 3, lat: 32.3212, lng: 77.1736, category: "Adventure", duration: "6h", price: 2800 },
              { name: "Local Food Walk", day: 3, lat: 32.2432, lng: 77.1892, category: "Culinary", duration: "3h", price: 900 },
            ],
            transport: [{ name: "Airport Pickup & Drop", price: 2500 }],
          },
        },
        {
          id: "demo-3",
          destination: "Paris",
          country: "France",
          nights: 5,
          total: 92000,
          startDate: "2026-09-15",
          endDate: "2026-09-20",
          status: "upcoming",
          emoji: "🗼",
          bookedAt: new Date().toISOString(),
          itinerary: {
            flight: { route: "DEL → CDG", carrier: "Air France", price: 42000, fromCode: "DEL", toCode: "CDG" },
            hotel: { name: "Hotel Diva Opera", lat: 48.8698, lng: 2.3412, price: 30000, pricePerNight: 6000, area: "Opera District" },
            activities: [
              { name: "Arc de Triomphe", day: 1, lat: 48.8738, lng: 2.2950, category: "Sightseeing", duration: "2h", price: 1300 },
              { name: "Palais Garnier", day: 1, lat: 48.8720, lng: 2.3316, category: "Sightseeing", duration: "2h", price: 1400 },
              { name: "Basilique du Sacré-Cœur de Montmartre", day: 2, lat: 48.8867, lng: 2.3431, category: "Sightseeing", duration: "2h", price: 0 },
              { name: "Luxembourg Garden", day: 2, lat: 48.8462, lng: 2.3372, category: "Nature", duration: "1.5h", price: 0 },
              { name: "Catacombs of Paris", day: 2, lat: 48.8339, lng: 2.3324, category: "Museum", duration: "1.5h", price: 2900 },
              { name: "Notre-Dame Cathedral of Paris", day: 2, lat: 48.8530, lng: 2.3499, category: "Sightseeing", duration: "1h", price: 0 },
              { name: "Musée d'Orsay", day: 3, lat: 48.8600, lng: 2.3266, category: "Museum", duration: "3h", price: 1600 },
              { name: "Louvre Museum", day: 3, lat: 48.8606, lng: 2.3376, category: "Museum", duration: "4h", price: 1700 },
              { name: "Tour Eiffel", day: 4, lat: 48.8584, lng: 2.2945, category: "Landmark", duration: "3h", price: 2600 },
              { name: "Sunset Cruise", day: 4, lat: 48.8584, lng: 2.2945, category: "Cruise", duration: "2h", price: 3500 },
            ],
            transport: [{ name: "Airport Pickup & Drop", price: 5000 }],
          },
        },
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(demo));
      setTrips(demo);
    }
  }, []);

  const addTrip = (trip: Omit<SavedTrip, "id" | "bookedAt">) => {
    const newTrip: SavedTrip = {
      ...trip,
      id: "trip-" + Date.now(),
      bookedAt: new Date().toISOString(),
    };
    const updated = [newTrip, ...trips];
    setTrips(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newTrip;
  };

  const removeTrip = (id: string) => {
    const updated = trips.filter((t) => t.id !== id);
    setTrips(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return { trips, addTrip, removeTrip };
}
