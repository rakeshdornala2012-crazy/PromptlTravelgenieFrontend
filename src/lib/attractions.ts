const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY;

export interface Attraction {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  description: string;
  image: string;
  address: string;
  price?: string;
  duration?: string;
  url?: string;
}

// TripAdvisor location IDs for common destinations
const LOCATION_MAP: Record<string, string> = {
  bali: "304054",
  maldives: "293953",
  phuket: "293949",
  dubai: "295424",
  singapore: "294265",
  tokyo: "298184",
  kyoto: "298946",
  bangkok: "293916",
  london: "186338",
  paris: "187147",
  goa: "303873",
  manali: "310603",
  delhi: "304551",
  mumbai: "304554",
  santorini: "189437",
  lisbon: "189158",
  coorg: "619493",
  seychelles: "294258",
};

export async function getAttractions(destination: string): Promise<Attraction[]> {
  const locationId = LOCATION_MAP[destination.toLowerCase()];

  try {
    // Try TripAdvisor first
    if (locationId) {
      const res = await fetch(
        `https://tripadvisor16.p.rapidapi.com/api/v1/attraction/searchAttraction?locationId=${locationId}&language=en&currency=INR`,
        {
          headers: {
            "x-rapidapi-host": "tripadvisor16.p.rapidapi.com",
            "x-rapidapi-key": RAPIDAPI_KEY,
          },
        }
      );
      const data = await res.json();
      const results = data?.data?.data ?? [];

      if (results.length) {
        return results.slice(0, 12).map((a: any) => ({
          id: String(a.locationId ?? a.id),
          name: a.title ?? a.name ?? "Unknown",
          category: a.primaryType ?? a.subtype?.[0]?.name ?? "Attraction",
          rating: parseFloat(a.rating ?? "0"),
          reviewCount: a.numberOfReviews ?? 0,
          description: a.description ?? "",
          image: a.photos?.[0]?.images?.original?.url ?? a.thumbnail?.photo?.images?.original?.url ?? "",
          address: a.addressObj?.street1 ?? a.locationString ?? destination,
          price: a.price ?? "Free",
          duration: a.duration ?? "2-3 hours",
          url: a.webUrl ?? "",
        }));
      }
    }

    // Fallback: World Tourist Attractions API
    const fallbackRes = await fetch(
      `https://world-tourist-attractions-api.p.rapidapi.com/state`,
      {
        headers: {
          "x-rapidapi-host": "world-tourist-attractions-api.p.rapidapi.com",
          "x-rapidapi-key": RAPIDAPI_KEY,
        },
      }
    );
    const fallbackData = await fallbackRes.json();
    if (Array.isArray(fallbackData) && fallbackData.length) {
      const filtered = fallbackData.filter((a: any) =>
        a.country?.toLowerCase().includes(destination.toLowerCase()) ||
        a.state?.toLowerCase().includes(destination.toLowerCase())
      );
      const source = filtered.length ? filtered : fallbackData.slice(0, 8);
      return source.slice(0, 10).map((a: any) => ({
        id: String(a.id ?? Math.random()),
        name: a.name ?? "Unknown",
        category: a.type ?? "Attraction",
        rating: a.rating ?? 4.0,
        reviewCount: a.reviews ?? 0,
        description: a.description ?? "",
        image: a.image ?? "",
        address: [a.city, a.country].filter(Boolean).join(", "),
        price: "Free",
        duration: "2-3 hours",
      }));
    }

    return getMockAttractions(destination);
  } catch (err) {
    console.error("Attractions fetch failed:", err);
    return getMockAttractions(destination);
  }
}

function getMockAttractions(destination: string): Attraction[] {
  const cap = destination.charAt(0).toUpperCase() + destination.slice(1);
  return [
    { id: "m1", name: `${cap} Old Town`, category: "Sight", rating: 4.8, reviewCount: 3200, description: `The historic heart of ${cap}, filled with cultural heritage and architecture.`, image: "", address: `Old Town, ${cap}`, price: "Free", duration: "2-3 hours" },
    { id: "m2", name: `${cap} National Museum`, category: "Museum", rating: 4.5, reviewCount: 1800, description: `Discover the rich history and culture of ${cap} through fascinating exhibits.`, image: "", address: `Museum Street, ${cap}`, price: "₹500", duration: "2 hours" },
    { id: "m3", name: `${cap} Nature Reserve`, category: "Park", rating: 4.7, reviewCount: 2100, description: `A lush green sanctuary offering a peaceful escape with stunning natural beauty.`, image: "", address: `North ${cap}`, price: "₹200", duration: "3-4 hours" },
    { id: "m4", name: `${cap} Viewpoint`, category: "Viewpoint", rating: 4.9, reviewCount: 4500, description: `Breathtaking panoramic views of ${cap} that you'll never forget.`, image: "", address: `Hilltop, ${cap}`, price: "Free", duration: "1 hour" },
  ];
}
