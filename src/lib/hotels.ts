const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY;

export interface Hotel {
  id: string;
  name: string;
  type: string;
  rating: number;
  reviewCount: number;
  price: number;
  pricePerNight: number;
  currency: string;
  image: string;
  address: string;
  amenities: string[];
  stars: number;
  url?: string;
}

export interface HotelSearchParams {
  destination: string;
  checkIn: string;   // YYYY-MM-DD
  checkOut: string;  // YYYY-MM-DD
  adults?: number;
  currency?: string;
}

// Destination to Hotels.com region ID mapping
const REGION_MAP: Record<string, string> = {
  bali: "553248635976",
  maldives: "600006416",
  phuket: "180001",
  dubai: "800046",
  singapore: "180026",
  tokyo: "179900",
  kyoto: "179898",
  bangkok: "179898",
  london: "2114",
  paris: "1456",
  goa: "601981",
  manali: "7256271",
  delhi: "1763",
  mumbai: "1755",
  bangalore: "603173",
  hyderabad: "601867",
};

export async function searchHotels(params: HotelSearchParams): Promise<Hotel[]> {
  const regionId = REGION_MAP[params.destination.toLowerCase()];
  if (!regionId) {
    console.warn("No region ID for:", params.destination);
    return getMockHotels(params.destination);
  }

  try {
    // Step 1: get region
    const regionRes = await fetch(
      `https://hotels-com-provider.p.rapidapi.com/v2/regions?query=${encodeURIComponent(params.destination)}&locale=en_IN&domain=IN`,
      {
        headers: {
          "x-rapidapi-host": "hotels-com-provider.p.rapidapi.com",
          "x-rapidapi-key": RAPIDAPI_KEY,
        },
      }
    );
    const regionData = await regionRes.json();
    const region = regionData?.data?.[0];
    if (!region) return getMockHotels(params.destination);

    // Step 2: search properties
    const url = new URL("https://hotels-com-provider.p.rapidapi.com/v2/hotels/search");
    url.searchParams.set("region_id", region.gaiaId ?? regionId);
    url.searchParams.set("locale", "en_IN");
    url.searchParams.set("checkin_date", params.checkIn);
    url.searchParams.set("checkout_date", params.checkOut);
    url.searchParams.set("adults_number", String(params.adults ?? 2));
    url.searchParams.set("domain", "IN");
    url.searchParams.set("sort_order", "REVIEW");
    url.searchParams.set("currency", params.currency ?? "INR");

    const res = await fetch(url.toString(), {
      headers: {
        "x-rapidapi-host": "hotels-com-provider.p.rapidapi.com",
        "x-rapidapi-key": RAPIDAPI_KEY,
      },
    });

    const data = await res.json();
    const properties = data?.data?.body?.searchResults?.results ?? [];

    if (!properties.length) return getMockHotels(params.destination);

    return properties.slice(0, 8).map((p: any) => ({
      id: String(p.id),
      name: p.name ?? "Unknown Hotel",
      type: p.type ?? "Hotel",
      rating: p.guestReviews?.unformattedRating ?? 0,
      reviewCount: p.guestReviews?.total ?? 0,
      price: p.ratePlan?.price?.exactCurrent ?? 0,
      pricePerNight: p.ratePlan?.price?.exactCurrent ?? 0,
      currency: "INR",
      image: p.optimizedThumbUrls?.srpDesktop ?? p.thumbnailUrl ?? "",
      address: [p.address?.streetAddress, p.address?.locality].filter(Boolean).join(", "),
      amenities: p.amenities?.topAmenities?.items?.map((a: any) => a.text) ?? [],
      stars: p.starRating ?? 3,
      url: `https://hotels.com/ho${p.id}`,
    }));
  } catch (err) {
    console.error("Hotel search failed:", err);
    return getMockHotels(params.destination);
  }
}

function getMockHotels(destination: string): Hotel[] {
  const cap = destination.charAt(0).toUpperCase() + destination.slice(1);
  return [
    {
      id: "mock-1",
      name: `${cap} Grand Resort`,
      type: "Resort",
      rating: 4.7,
      reviewCount: 2340,
      price: 8500,
      pricePerNight: 8500,
      currency: "INR",
      image: "",
      address: `Beach Road, ${cap}`,
      amenities: ["Pool", "Spa", "WiFi", "Restaurant", "Gym"],
      stars: 5,
    },
    {
      id: "mock-2",
      name: `The ${cap} Boutique`,
      type: "Boutique Hotel",
      rating: 4.4,
      reviewCount: 980,
      price: 4200,
      pricePerNight: 4200,
      currency: "INR",
      image: "",
      address: `Old Town, ${cap}`,
      amenities: ["WiFi", "Breakfast", "AC", "Room Service"],
      stars: 4,
    },
    {
      id: "mock-3",
      name: `${cap} Heritage Inn`,
      type: "Heritage Hotel",
      rating: 4.2,
      reviewCount: 450,
      price: 2800,
      pricePerNight: 2800,
      currency: "INR",
      image: "",
      address: `City Centre, ${cap}`,
      amenities: ["WiFi", "AC", "Parking"],
      stars: 3,
    },
  ];
}
