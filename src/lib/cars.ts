const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY;

export interface CarRental {
  id: string;
  name: string;
  category: string;
  company: string;
  price: number;
  pricePerDay: number;
  currency: string;
  image: string;
  seats: number;
  transmission: string;
  ac: boolean;
  features: string[];
  rating: number;
  reviewCount: number;
}

export interface CarSearchParams {
  latitude: number;
  longitude: number;
  pickUpDate: string;   // YYYY-MM-DD
  dropOffDate: string;  // YYYY-MM-DD
  pickUpTime?: string;  // HH:MM
  dropOffTime?: string; // HH:MM
  driverAge?: number;
  currency?: string;
}

// Destination coordinates
export const DESTINATION_COORDS: Record<string, { lat: number; lon: number }> = {
  bali: { lat: -8.3405, lon: 115.0920 },
  maldives: { lat: 4.1755, lon: 73.5093 },
  phuket: { lat: 7.8804, lon: 98.3923 },
  dubai: { lat: 25.2048, lon: 55.2708 },
  singapore: { lat: 1.3521, lon: 103.8198 },
  tokyo: { lat: 35.6762, lon: 139.6503 },
  kyoto: { lat: 35.0116, lon: 135.7681 },
  bangkok: { lat: 13.7563, lon: 100.5018 },
  london: { lat: 51.5074, lon: -0.1278 },
  paris: { lat: 48.8566, lon: 2.3522 },
  goa: { lat: 15.2993, lon: 74.1240 },
  manali: { lat: 32.2396, lon: 77.1887 },
  delhi: { lat: 28.6139, lon: 77.2090 },
  mumbai: { lat: 19.0760, lon: 72.8777 },
  santorini: { lat: 36.3932, lon: 25.4615 },
  lisbon: { lat: 38.7223, lon: -9.1393 },
  seychelles: { lat: -4.6796, lon: 55.4920 },
};

export async function searchCarRentals(params: CarSearchParams): Promise<CarRental[]> {
  try {
    const url = new URL("https://booking-com15.p.rapidapi.com/api/v1/cars/searchCarRentals");
    url.searchParams.set("pick_up_latitude", String(params.latitude));
    url.searchParams.set("pick_up_longitude", String(params.longitude));
    url.searchParams.set("drop_off_latitude", String(params.latitude));
    url.searchParams.set("drop_off_longitude", String(params.longitude));
    url.searchParams.set("pick_up_time", params.pickUpTime ?? "10:00");
    url.searchParams.set("drop_off_time", params.dropOffTime ?? "10:00");
    url.searchParams.set("driver_age", String(params.driverAge ?? 30));
    url.searchParams.set("currency_code", params.currency ?? "INR");
    url.searchParams.set("from_date", params.pickUpDate);
    url.searchParams.set("to_date", params.dropOffDate);

    const res = await fetch(url.toString(), {
      headers: {
        "x-rapidapi-host": "booking-com15.p.rapidapi.com",
        "x-rapidapi-key": RAPIDAPI_KEY,
      },
    });

    const data = await res.json();
    const vehicles = data?.data?.vehicles ?? data?.vehicles ?? [];

    if (!vehicles.length) return getMockCars();

    return vehicles.slice(0, 8).map((v: any) => ({
      id: String(v.vehicle_id ?? v.id ?? Math.random()),
      name: v.vehicle_info?.name ?? v.name ?? "Car",
      category: v.vehicle_info?.category ?? v.category ?? "Economy",
      company: v.supplier?.name ?? v.company ?? "Local Provider",
      price: v.pricing?.total ?? v.total_price ?? 0,
      pricePerDay: v.pricing?.per_day ?? v.price_per_day ?? 0,
      currency: "INR",
      image: v.vehicle_info?.image_url ?? v.image ?? "",
      seats: v.vehicle_info?.seats ?? v.seats ?? 5,
      transmission: v.vehicle_info?.transmission ?? "Manual",
      ac: v.vehicle_info?.ac ?? true,
      features: v.vehicle_info?.features ?? ["AC", "GPS"],
      rating: v.supplier?.rating ?? 4.0,
      reviewCount: v.supplier?.reviews ?? 0,
    }));
  } catch (err) {
    console.error("Car rental search failed:", err);
    return getMockCars();
  }
}

function getMockCars(): CarRental[] {
  return [
    { id: "c1", name: "Maruti Swift", category: "Economy", company: "Zoomcar", price: 2800, pricePerDay: 2800, currency: "INR", image: "", seats: 5, transmission: "Manual", ac: true, features: ["AC", "GPS", "Insurance"], rating: 4.2, reviewCount: 340 },
    { id: "c2", name: "Honda City", category: "Sedan", company: "Myles", price: 3500, pricePerDay: 3500, currency: "INR", image: "", seats: 5, transmission: "Automatic", ac: true, features: ["AC", "GPS", "Bluetooth", "Insurance"], rating: 4.5, reviewCount: 210 },
    { id: "c3", name: "Toyota Innova", category: "SUV", company: "Self Drive", price: 5200, pricePerDay: 5200, currency: "INR", image: "", seats: 7, transmission: "Manual", ac: true, features: ["AC", "GPS", "7 Seats", "Insurance"], rating: 4.6, reviewCount: 180 },
  ];
}
