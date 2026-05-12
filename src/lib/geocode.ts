// ─────────────────────────────────────────────────────────────
//  Geocode — Free geocoding via Nominatim + localStorage cache
//  Pre-seeded with dummy records for popular destinations
// ─────────────────────────────────────────────────────────────

const CACHE_KEY = "tripgenie-geocache";

export interface LatLng {
  lat: number;
  lng: number;
}

// ── Pre-seeded geocode cache ──────────────────────────────────
// Popular travel spots so the map works instantly without API calls.

const SEED_CACHE: Record<string, LatLng> = {
  // ─ Bali ─
  "hotel diva opera, bali": { lat: -8.6525, lng: 115.1370 },
  "ubud jungle retreat, bali": { lat: -8.5069, lng: 115.2625 },
  "bali comfort inn, bali": { lat: -8.7227, lng: 115.1696 },
  "bali grand resort, bali": { lat: -8.7184, lng: 115.1686 },
  "boutique villa in bali, bali": { lat: -8.5110, lng: 115.2590 },
  "bali city sightseeing, bali": { lat: -8.5069, lng: 115.2625 },
  "local food walk, bali": { lat: -8.5189, lng: 115.2630 },
  "sunset cruise, bali": { lat: -8.7527, lng: 115.1695 },
  "beach day pass, bali": { lat: -8.7227, lng: 115.1696 },
  "scuba diving experience, bali": { lat: -8.7498, lng: 115.1736 },
  "spa & wellness day, bali": { lat: -8.5100, lng: 115.2610 },
  "photography walk, bali": { lat: -8.5189, lng: 115.2630 },
  "club night pass, bali": { lat: -8.7184, lng: 115.1806 },
  "tanah lot temple, bali": { lat: -8.6211, lng: 115.0868 },
  "tegallalang rice terraces, bali": { lat: -8.4312, lng: 115.2790 },
  "uluwatu temple, bali": { lat: -8.8291, lng: 115.0849 },
  "kuta beach, bali": { lat: -8.7184, lng: 115.1686 },
  "sacred monkey forest, bali": { lat: -8.5186, lng: 115.2588 },
  "bali": { lat: -8.4095, lng: 115.1889 },

  // ─ Paris ─
  "arc de triomphe, paris": { lat: 48.8738, lng: 2.2950 },
  "palais garnier, paris": { lat: 48.8720, lng: 2.3316 },
  "tour eiffel, paris": { lat: 48.8584, lng: 2.2945 },
  "basilique du sacré-cœur de montmartre, paris": { lat: 48.8867, lng: 2.3431 },
  "luxembourg garden, paris": { lat: 48.8462, lng: 2.3372 },
  "catacombs of paris, paris": { lat: 48.8339, lng: 2.3324 },
  "notre-dame cathedral of paris, paris": { lat: 48.8530, lng: 2.3499 },
  "musée d'orsay, paris": { lat: 48.8600, lng: 2.3266 },
  "louvre museum, paris": { lat: 48.8606, lng: 2.3376 },
  "paris comfort inn, paris": { lat: 48.8698, lng: 2.3412 },
  "paris grand resort, paris": { lat: 48.8664, lng: 2.3089 },
  "boutique villa in paris, paris": { lat: 48.8530, lng: 2.3470 },
  "paris city sightseeing, paris": { lat: 48.8566, lng: 2.3522 },
  "local food walk, paris": { lat: 48.8530, lng: 2.3499 },
  "sunset cruise, paris": { lat: 48.8584, lng: 2.2945 },
  "paris": { lat: 48.8566, lng: 2.3522 },

  // ─ Dubai ─
  "burj khalifa, dubai": { lat: 25.1972, lng: 55.2744 },
  "dubai mall, dubai": { lat: 25.1985, lng: 55.2796 },
  "palm jumeirah, dubai": { lat: 25.1124, lng: 55.1390 },
  "dubai marina, dubai": { lat: 25.0805, lng: 55.1403 },
  "desert safari, dubai": { lat: 25.0500, lng: 55.4000 },
  "dubai comfort inn, dubai": { lat: 25.2048, lng: 55.2708 },
  "dubai grand resort, dubai": { lat: 25.1414, lng: 55.1850 },
  "boutique villa in dubai, dubai": { lat: 25.1124, lng: 55.1390 },
  "dubai city sightseeing, dubai": { lat: 25.2048, lng: 55.2708 },
  "local food walk, dubai": { lat: 25.2637, lng: 55.2972 },
  "sunset cruise, dubai": { lat: 25.0805, lng: 55.1403 },
  "dubai": { lat: 25.2048, lng: 55.2708 },

  // ─ Maldives ─
  "male city, maldives": { lat: 4.1755, lng: 73.5093 },
  "olhuveli beach villa, maldives": { lat: 3.8834, lng: 73.4332 },
  "maldives comfort inn, maldives": { lat: 4.1755, lng: 73.5093 },
  "maldives grand resort, maldives": { lat: 4.2398, lng: 73.4984 },
  "boutique villa in maldives, maldives": { lat: 3.9426, lng: 73.4090 },
  "snorkeling trip, maldives": { lat: 4.1800, lng: 73.5200 },
  "sunset cruise, maldives": { lat: 4.1700, lng: 73.5100 },
  "maldives city sightseeing, maldives": { lat: 4.1755, lng: 73.5093 },
  "local food walk, maldives": { lat: 4.1755, lng: 73.5093 },
  "maldives": { lat: 3.2028, lng: 73.2207 },

  // ─ Goa ─
  "calangute beach, goa": { lat: 15.5449, lng: 73.7554 },
  "baga beach, goa": { lat: 15.5580, lng: 73.7515 },
  "fort aguada, goa": { lat: 15.4918, lng: 73.7737 },
  "basilica of bom jesus, goa": { lat: 15.5009, lng: 73.9116 },
  "dudhsagar falls, goa": { lat: 15.3144, lng: 74.3143 },
  "goa comfort inn, goa": { lat: 15.4989, lng: 73.8278 },
  "goa grand resort, goa": { lat: 15.5449, lng: 73.7554 },
  "boutique villa in goa, goa": { lat: 15.2710, lng: 73.9707 },
  "goa city sightseeing, goa": { lat: 15.4989, lng: 73.8278 },
  "beach day pass, goa": { lat: 15.5449, lng: 73.7554 },
  "sunset cruise, goa": { lat: 15.3990, lng: 73.8710 },
  "goa": { lat: 15.2993, lng: 74.1240 },

  // ─ Tokyo ─
  "shibuya crossing, tokyo": { lat: 35.6595, lng: 139.7004 },
  "senso-ji temple, tokyo": { lat: 35.7148, lng: 139.7967 },
  "meiji shrine, tokyo": { lat: 35.6764, lng: 139.6993 },
  "tokyo tower, tokyo": { lat: 35.6586, lng: 139.7454 },
  "tsukiji market, tokyo": { lat: 35.6654, lng: 139.7707 },
  "tokyo comfort inn, tokyo": { lat: 35.6812, lng: 139.7671 },
  "tokyo grand resort, tokyo": { lat: 35.6595, lng: 139.7004 },
  "boutique villa in tokyo, tokyo": { lat: 35.6762, lng: 139.6503 },
  "tokyo city sightseeing, tokyo": { lat: 35.6812, lng: 139.7671 },
  "local food walk, tokyo": { lat: 35.6654, lng: 139.7707 },
  "tokyo": { lat: 35.6762, lng: 139.6503 },

  // ─ Manali ─
  "manali comfort inn, manali": { lat: 32.2432, lng: 77.1892 },
  "manali grand resort, manali": { lat: 32.2620, lng: 77.1734 },
  "boutique villa in manali, manali": { lat: 32.2432, lng: 77.1892 },
  "manali city sightseeing, manali": { lat: 32.2432, lng: 77.1892 },
  "mountain trek, manali": { lat: 32.3212, lng: 77.1736 },
  "solang valley, manali": { lat: 32.3154, lng: 77.1571 },
  "hadimba temple, manali": { lat: 32.2434, lng: 77.1680 },
  "manali": { lat: 32.2432, lng: 77.1892 },

  // ─ Santorini ─
  "oia sunset, santorini": { lat: 36.4613, lng: 25.3756 },
  "red beach, santorini": { lat: 36.3495, lng: 25.3940 },
  "santorini comfort inn, santorini": { lat: 36.4166, lng: 25.4321 },
  "santorini grand resort, santorini": { lat: 36.4613, lng: 25.3756 },
  "santorini city sightseeing, santorini": { lat: 36.4166, lng: 25.4321 },
  "santorini": { lat: 36.3932, lng: 25.4615 },

  // ─ London ─
  "big ben, london": { lat: 51.5007, lng: -0.1246 },
  "tower bridge, london": { lat: 51.5055, lng: -0.0754 },
  "london eye, london": { lat: 51.5033, lng: -0.1195 },
  "buckingham palace, london": { lat: 51.5014, lng: -0.1419 },
  "london comfort inn, london": { lat: 51.5074, lng: -0.1278 },
  "london grand resort, london": { lat: 51.5033, lng: -0.1195 },
  "london city sightseeing, london": { lat: 51.5074, lng: -0.1278 },
  "london": { lat: 51.5074, lng: -0.1278 },

  // ─ Singapore ─
  "marina bay sands, singapore": { lat: 1.2834, lng: 103.8607 },
  "gardens by the bay, singapore": { lat: 1.2816, lng: 103.8636 },
  "singapore comfort inn, singapore": { lat: 1.3521, lng: 103.8198 },
  "singapore grand resort, singapore": { lat: 1.2834, lng: 103.8607 },
  "singapore": { lat: 1.3521, lng: 103.8198 },
};

// ── Cache helpers ─────────────────────────────────────────────

function getCache(): Record<string, LatLng> {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? { ...SEED_CACHE, ...JSON.parse(raw) } : { ...SEED_CACHE };
  } catch {
    return { ...SEED_CACHE };
  }
}

function setCache(cache: Record<string, LatLng>) {
  // Only store user-added entries (not seed)
  const userEntries: Record<string, LatLng> = {};
  for (const [key, val] of Object.entries(cache)) {
    if (!SEED_CACHE[key]) userEntries[key] = val;
  }
  localStorage.setItem(CACHE_KEY, JSON.stringify(userEntries));
}

// ── Geocode a single query ────────────────────────────────────

export async function geocode(query: string, city: string): Promise<LatLng | null> {
  const cacheKey = `${query}, ${city}`.toLowerCase().trim();
  const cache = getCache();

  // Check cache first
  if (cache[cacheKey]) return cache[cacheKey];

  // Also try just the query without city
  const queryOnly = query.toLowerCase().trim();
  if (cache[queryOnly]) return cache[queryOnly];

  // Also try just city
  const cityOnly = city.toLowerCase().trim();
  if (cache[cityOnly]) return cache[cityOnly];

  // Nominatim API (free, no key needed, 1 req/sec rate limit)
  try {
    const searchStr = encodeURIComponent(`${query}, ${city}`);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${searchStr}&format=json&limit=1`,
      {
        headers: { "User-Agent": "TripGenie/1.0 (travel-planner)" },
      }
    );

    if (!res.ok) return cache[cityOnly] || null;

    const data = await res.json();
    if (data.length > 0) {
      const result: LatLng = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      cache[cacheKey] = result;
      setCache(cache);
      return result;
    }
  } catch {
    // Fallback: return city center if we have it
    return cache[cityOnly] || null;
  }

  return cache[cityOnly] || null;
}

// ── Batch geocode ─────────────────────────────────────────────

export async function geocodeBatch(
  items: { name: string }[],
  city: string
): Promise<Map<string, LatLng>> {
  const results = new Map<string, LatLng>();

  // Process sequentially to respect Nominatim rate limits
  for (const item of items) {
    const result = await geocode(item.name, city);
    if (result) {
      results.set(item.name, result);
    }
    // Small delay to respect Nominatim's 1 req/sec
    await new Promise((r) => setTimeout(r, 150));
  }

  return results;
}

// ── Get city center coordinates ───────────────────────────────

export function getCityCenter(city: string): LatLng {
  const cache = getCache();
  const cityKey = city.toLowerCase().trim();
  return cache[cityKey] || { lat: 20.5937, lng: 78.9629 }; // Default: India center
}
