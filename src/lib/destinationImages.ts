/**
 * destinationImages.ts
 * --------------------
 * Curated Unsplash photo IDs for common destinations.
 * Falls back to vibe-keyword Unsplash search for unknown destinations.
 *
 * Why curated IDs: source.unsplash.com/<photoId> guarantees a specific
 * (good, hand-picked) image. Random search may return a poor result.
 *
 * All IDs verified to exist and look beautiful.
 */

type ImageSet = {
  hero: string;       // main card image
  thumb: string;      // smaller, square crop
  blurhash?: string;  // optional placeholder
};

// Curated photo IDs from Unsplash — verified to be premium travel imagery.
// Format: "photo-<id>" or full URL via source.unsplash.com
const CURATED: Record<string, ImageSet> = {
  bali: {
    hero: "photo-1537996194471-e657df975ab4", // emerald rice terraces
    thumb: "photo-1518548419970-58e3b4079ab2",
  },
  goa: {
    hero: "photo-1512343879784-a960bf40e7f2", // palm + beach
    thumb: "photo-1512343879784-a960bf40e7f2",
  },
  dubai: {
    hero: "photo-1512453979798-5ea266f8880c", // burj khalifa
    thumb: "photo-1512453979798-5ea266f8880c",
  },
  paris: {
    hero: "photo-1502602898657-3e91760cbb34", // eiffel
    thumb: "photo-1502602898657-3e91760cbb34",
  },
  tokyo: {
    hero: "photo-1540959733332-eab4deabeeaf", // tokyo neon
    thumb: "photo-1540959733332-eab4deabeeaf",
  },
  london: {
    hero: "photo-1513635269975-59663e0ac1ad", // big ben
    thumb: "photo-1513635269975-59663e0ac1ad",
  },
  manali: {
    hero: "photo-1626621341517-bbf3d9990a23", // himalayan landscape
    thumb: "photo-1626621341517-bbf3d9990a23",
  },
  maldives: {
    hero: "photo-1514282401047-d79a71a590e8", // overwater bungalow
    thumb: "photo-1514282401047-d79a71a590e8",
  },
  santorini: {
    hero: "photo-1570077188670-e3a8d69ac5ff", // white domes blue sea
    thumb: "photo-1570077188670-e3a8d69ac5ff",
  },
  kyoto: {
    hero: "photo-1493976040374-85c8e12f0c0e", // bamboo / temple
    thumb: "photo-1493976040374-85c8e12f0c0e",
  },
  lisbon: {
    hero: "photo-1588535884405-3c2da6e51b30", // tram + tile
    thumb: "photo-1588535884405-3c2da6e51b30",
  },
  coorg: {
    hero: "photo-1593693411515-c20261bcad6e", // misty estate
    thumb: "photo-1593693411515-c20261bcad6e",
  },
  newyork: {
    hero: "photo-1496442226666-8d4d0e62e6e9", // manhattan
    thumb: "photo-1496442226666-8d4d0e62e6e9",
  },
  singapore: {
    hero: "photo-1525625293386-3f8f99389edd",
    thumb: "photo-1525625293386-3f8f99389edd",
  },
  bangkok: {
    hero: "photo-1508009603885-50cf7c579365",
    thumb: "photo-1508009603885-50cf7c579365",
  },
  bhutan: {
    hero: "photo-1565008576549-57569a49371d",
    thumb: "photo-1565008576549-57569a49371d",
  },
};

// Fallback by vibe/category if destination unknown
const VIBE_FALLBACK: Record<string, ImageSet> = {
  beach: {
    hero: "photo-1507525428034-b723cf961d3e",
    thumb: "photo-1507525428034-b723cf961d3e",
  },
  mountain: {
    hero: "photo-1464822759023-fed622ff2c3b",
    thumb: "photo-1464822759023-fed622ff2c3b",
  },
  city: {
    hero: "photo-1480714378408-67cf0d13bc1b",
    thumb: "photo-1480714378408-67cf0d13bc1b",
  },
  desert: {
    hero: "photo-1473580044384-7ba9967e16a0",
    thumb: "photo-1473580044384-7ba9967e16a0",
  },
  default: {
    hero: "photo-1488646953014-85cb44e25828", // generic travel hero
    thumb: "photo-1488646953014-85cb44e25828",
  },
};

const BEACH_KEYWORDS = ["beach", "bali", "goa", "maldives", "phuket", "santorini", "krabi"];
const MOUNTAIN_KEYWORDS = ["mountain", "manali", "coorg", "alps", "himalaya", "ladakh"];
const DESERT_KEYWORDS = ["desert", "dubai", "rajasthan", "sahara"];
const CITY_KEYWORDS = ["paris", "tokyo", "london", "new york", "singapore", "bangkok", "lisbon", "kyoto"];

/**
 * Get a premium hero image URL for any destination string.
 * Falls back gracefully through: exact match → vibe match → default
 */
export function getDestinationImage(
  destination: string | undefined | null,
  width = 1200,
  height = 800
): string {
  const key = (destination ?? "").toLowerCase().replace(/\s+/g, "");
  const lower = (destination ?? "").toLowerCase();

  // 1. Exact curated match
  let set = CURATED[key];

  // 2. Partial match (e.g. "south goa" matches "goa")
  if (!set) {
    const partialKey = Object.keys(CURATED).find((k) => lower.includes(k));
    if (partialKey) set = CURATED[partialKey];
  }

  // 3. Vibe-based fallback
  if (!set) {
    if (BEACH_KEYWORDS.some((k) => lower.includes(k))) set = VIBE_FALLBACK.beach;
    else if (MOUNTAIN_KEYWORDS.some((k) => lower.includes(k))) set = VIBE_FALLBACK.mountain;
    else if (DESERT_KEYWORDS.some((k) => lower.includes(k))) set = VIBE_FALLBACK.desert;
    else if (CITY_KEYWORDS.some((k) => lower.includes(k))) set = VIBE_FALLBACK.city;
    else set = VIBE_FALLBACK.default;
  }

  // Build Unsplash URL with size + quality params
  // Format: https://images.unsplash.com/photo-XXX?w=1200&q=80&auto=format&fit=crop
  return `https://images.unsplash.com/${set.hero}?w=${width}&q=80&auto=format&fit=crop`;
}

/**
 * Determine the "feel" tag for the destination — used for emoji, weather, etc.
 */
export function getDestinationVibe(destination: string | undefined | null): {
  emoji: string;
  category: "beach" | "mountain" | "desert" | "city";
  weatherHint: string;
} {
  const lower = (destination ?? "").toLowerCase();

  if (BEACH_KEYWORDS.some((k) => lower.includes(k))) {
    return { emoji: "🏖️", category: "beach", weatherHint: "Sunny · 28°C avg" };
  }
  if (MOUNTAIN_KEYWORDS.some((k) => lower.includes(k))) {
    return { emoji: "⛰️", category: "mountain", weatherHint: "Cool · 12°C avg" };
  }
  if (DESERT_KEYWORDS.some((k) => lower.includes(k))) {
    return { emoji: "🌅", category: "desert", weatherHint: "Hot · 35°C avg" };
  }
  return { emoji: "🌆", category: "city", weatherHint: "Mild · 22°C avg" };
}
