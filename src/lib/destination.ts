// ─────────────────────────────────────────────────────────────────
// destination.ts — All 5 free API integrations for destination data
// ─────────────────────────────────────────────────────────────────
//
// APIs used (all free, no key required except Unsplash):
//   1. Open-Meteo       — 7-day weather forecast (no key)
//   2. RestCountries    — country info, visa, currency (no key)
//   3. Wikipedia        — destination summary (no key)
//   4. OpenStreetMap    — attractions via Overpass API (no key)
//   5. Frankfurter      — live currency conversion (no key)
//   6. Unsplash         — destination photos (50 req/hr free, key required)
// ─────────────────────────────────────────────────────────────────

const UNSPLASH_KEY = import.meta.env.VITE_UNSPLASH_KEY;

// ─── Type definitions ───
export interface DayForecast {
  date: string;
  tempMax: number;
  tempMin: number;
  weatherCode: number;
  description: string;
  icon: string;
  precipitation: number;
}

export interface CurrentWeather {
  temp: number;
  feelsLike: number;
  humidity: number;
  description: string;
  windSpeed: number;
  icon: string;
}

export interface CountryInfo {
  name: string;
  capital: string;
  region: string;
  population: number;
  currency: { code: string; name: string; symbol: string };
  languages: string[];
  flag: string;
  timezones: string[];
  drivingSide: string;
  callingCode: string;
}

export interface VisaInfo {
  required: string;
  notes: string;
}

export interface DestinationSummary {
  title: string;
  extract: string;
  thumbnail: string | null;
  url: string;
}

export interface Attraction {
  id: number;
  name: string;
  type: string;
  lat: number;
  lon: number;
  category: "sight" | "museum" | "park" | "religious" | "viewpoint" | "beach" | "other";
}

export interface UnsplashPhoto {
  id: string;
  url: string;
  thumb: string;
  photographer: string;
  photographerUrl: string;
  description: string;
}

export interface DestinationData {
  weather: { current: CurrentWeather | null; forecast: DayForecast[] };
  country: CountryInfo | null;
  summary: DestinationSummary | null;
  attractions: Attraction[];
  photos: UnsplashPhoto[];
}

// ─── City → coordinates + country mapping ───
const DESTINATIONS: Record<
  string,
  { lat: number; lon: number; country: string; countryCode: string }
> = {
  bali: { lat: -8.3405, lon: 115.092, country: "Indonesia", countryCode: "ID" },
  kyoto: { lat: 35.0116, lon: 135.7681, country: "Japan", countryCode: "JP" },
  santorini: { lat: 36.3932, lon: 25.4615, country: "Greece", countryCode: "GR" },
  manali: { lat: 32.2396, lon: 77.1887, country: "India", countryCode: "IN" },
  dubai: { lat: 25.2048, lon: 55.2708, country: "United Arab Emirates", countryCode: "AE" },
  maldives: { lat: 3.2028, lon: 73.2207, country: "Maldives", countryCode: "MV" },
  lisbon: { lat: 38.7223, lon: -9.1393, country: "Portugal", countryCode: "PT" },
  coorg: { lat: 12.3375, lon: 75.8069, country: "India", countryCode: "IN" },
  tokyo: { lat: 35.6762, lon: 139.6503, country: "Japan", countryCode: "JP" },
};

const WMO: Record<number, { label: string; icon: string }> = {
  0: { label: "Clear sky", icon: "☀️" },
  1: { label: "Mainly clear", icon: "🌤️" },
  2: { label: "Partly cloudy", icon: "⛅" },
  3: { label: "Overcast", icon: "☁️" },
  45: { label: "Foggy", icon: "🌫️" },
  48: { label: "Foggy", icon: "🌫️" },
  51: { label: "Light drizzle", icon: "🌦️" },
  53: { label: "Drizzle", icon: "🌦️" },
  55: { label: "Heavy drizzle", icon: "🌧️" },
  61: { label: "Light rain", icon: "🌧️" },
  63: { label: "Rain", icon: "🌧️" },
  65: { label: "Heavy rain", icon: "🌧️" },
  71: { label: "Light snow", icon: "🌨️" },
  73: { label: "Snow", icon: "🌨️" },
  75: { label: "Heavy snow", icon: "❄️" },
  80: { label: "Rain showers", icon: "🌦️" },
  81: { label: "Rain showers", icon: "🌧️" },
  82: { label: "Heavy showers", icon: "⛈️" },
  95: { label: "Thunderstorm", icon: "⛈️" },
  96: { label: "Thunderstorm + hail", icon: "⛈️" },
};

// ─── 1. Weather (Open-Meteo) ───
async function fetchWeather(lat: number, lon: number) {
  try {
    const url =
      "https://api.open-meteo.com/v1/forecast" +
      "?latitude=" + lat +
      "&longitude=" + lon +
      "&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m" +
      "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max" +
      "&timezone=auto&forecast_days=7";
    const res = await fetch(url);
    const data = await res.json();

    const current: CurrentWeather = {
      temp: Math.round(data.current.temperature_2m),
      feelsLike: Math.round(data.current.apparent_temperature),
      humidity: data.current.relative_humidity_2m,
      windSpeed: Math.round(data.current.wind_speed_10m),
      ...(WMO[data.current.weather_code] ?? { label: "Clear", icon: "🌤️" }),
      description: WMO[data.current.weather_code]?.label ?? "Clear",
    };

    const forecast: DayForecast[] = data.daily.time.map((date: string, i: number) => {
      const wmo = WMO[data.daily.weather_code[i]] ?? { label: "Clear", icon: "🌤️" };
      return {
        date,
        tempMax: Math.round(data.daily.temperature_2m_max[i]),
        tempMin: Math.round(data.daily.temperature_2m_min[i]),
        weatherCode: data.daily.weather_code[i],
        description: wmo.label,
        icon: wmo.icon,
        precipitation: data.daily.precipitation_probability_max[i] ?? 0,
      };
    });

    return { current, forecast };
  } catch (err) {
    console.error("Weather fetch failed:", err);
    return { current: null, forecast: [] };
  }
}

// ─── 2. Country info (RestCountries) ───
async function fetchCountry(code: string): Promise<CountryInfo | null> {
  try {
    const res = await fetch(
      "https://restcountries.com/v3.1/alpha/" + code +
      "?fields=name,capital,region,population,currencies,languages,flags,timezones,car,idd"
    );
    const arr = await res.json();
    const c = Array.isArray(arr) ? arr[0] : arr;
    if (!c) return null;

    const currencyKey = Object.keys(c.currencies ?? {})[0];
    const currency = c.currencies?.[currencyKey];
    const idd = c.idd ?? {};
    const callingCode = idd.root
      ? idd.root + (idd.suffixes?.[0] ?? "")
      : "";

    return {
      name: c.name?.common ?? code,
      capital: c.capital?.[0] ?? "—",
      region: c.region ?? "—",
      population: c.population ?? 0,
      currency: {
        code: currencyKey ?? "",
        name: currency?.name ?? "",
        symbol: currency?.symbol ?? "",
      },
      languages: Object.values(c.languages ?? {}) as string[],
      flag: c.flags?.svg ?? c.flags?.png ?? "",
      timezones: c.timezones ?? [],
      drivingSide: c.car?.side ?? "—",
      callingCode,
    };
  } catch (err) {
    console.error("Country fetch failed:", err);
    return null;
  }
}

// ─── 3. Wikipedia summary ───
async function fetchWikiSummary(query: string): Promise<DestinationSummary | null> {
  try {
    const res = await fetch(
      "https://en.wikipedia.org/api/rest_v1/page/summary/" + encodeURIComponent(query)
    );
    if (!res.ok) return null;
    const data = await res.json();
    return {
      title: data.title,
      extract: data.extract,
      thumbnail: data.thumbnail?.source ?? null,
      url: data.content_urls?.desktop?.page ?? "",
    };
  } catch (err) {
    console.error("Wikipedia fetch failed:", err);
    return null;
  }
}

// ─── 4. Attractions (OpenStreetMap Overpass) ───
function categorize(tags: Record<string, string>): Attraction["category"] {
  if (tags.tourism === "museum" || tags.amenity === "museum") return "museum";
  if (tags.leisure === "park" || tags.tourism === "park") return "park";
  if (tags.amenity === "place_of_worship" || tags.building === "temple" || tags.building === "church") return "religious";
  if (tags.tourism === "viewpoint") return "viewpoint";
  if (tags.natural === "beach") return "beach";
  if (tags.tourism === "attraction" || tags.historic) return "sight";
  return "other";
}

async function fetchAttractions(lat: number, lon: number): Promise<Attraction[]> {
  try {
    // Overpass query: grab top attractions within ~15km
    const query = `[out:json][timeout:15];
(
  node["tourism"~"attraction|viewpoint|museum"](around:15000,${lat},${lon});
  node["historic"](around:15000,${lat},${lon});
  node["natural"="beach"](around:15000,${lat},${lon});
  node["leisure"="park"](around:15000,${lat},${lon});
  node["amenity"="place_of_worship"](around:15000,${lat},${lon});
);
out body 50;`;

    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: query,
    });

    if (!res.ok) return [];
    const data = await res.json();

    const attractions: Attraction[] = (data.elements ?? [])
      .filter((el: any) => el.tags?.name)
      .slice(0, 20)
      .map((el: any) => ({
        id: el.id,
        name: el.tags.name,
        type: el.tags.tourism || el.tags.historic || el.tags.amenity || el.tags.leisure || el.tags.natural || "place",
        lat: el.lat,
        lon: el.lon,
        category: categorize(el.tags),
      }));

    return attractions;
  } catch (err) {
    console.error("Attractions fetch failed:", err);
    return [];
  }
}

// ─── 5. Photos (Unsplash) ───
async function fetchPhotos(query: string): Promise<UnsplashPhoto[]> {
  if (!UNSPLASH_KEY) {
    console.warn("Unsplash key missing — set VITE_UNSPLASH_KEY in .env");
    return [];
  }
  try {
    const res = await fetch(
      "https://api.unsplash.com/search/photos?query=" +
        encodeURIComponent(query) +
        "&per_page=8&orientation=landscape",
      { headers: { Authorization: "Client-ID " + UNSPLASH_KEY } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results ?? []).map((p: any) => ({
      id: p.id,
      url: p.urls.regular,
      thumb: p.urls.small,
      photographer: p.user.name,
      photographerUrl: p.user.links.html + "?utm_source=voya&utm_medium=referral",
      description: p.alt_description ?? p.description ?? query,
    }));
  } catch (err) {
    console.error("Unsplash fetch failed:", err);
    return [];
  }
}

// ─── Currency conversion (Frankfurter) ───
export async function convertCurrency(
  amount: number,
  from: string,
  to: string
): Promise<number | null> {
  if (from === to) return amount;
  try {
    const res = await fetch(
      "https://api.frankfurter.app/latest?amount=" + amount + "&from=" + from + "&to=" + to
    );
    const data = await res.json();
    return data.rates?.[to] ?? null;
  } catch (err) {
    console.error("Frankfurter fetch failed:", err);
    return null;
  }
}

// ─── Visa info heuristic (RestCountries doesn't include this directly) ───
// For a real app you'd use a paid visa API. This gives reasonable defaults.
const VISA_RULES: Record<string, VisaInfo> = {
  ID: { required: "Visa on Arrival", notes: "30-day VOA available for Indian passport · ~₹2,800" },
  JP: { required: "eVisa required", notes: "Apply online · single entry · ~₹3,000" },
  GR: { required: "Schengen visa", notes: "Apply 15 days before travel · ~₹7,500" },
  IN: { required: "No visa needed", notes: "Domestic travel within India" },
  AE: { required: "eVisa required", notes: "30-day tourist visa · ~₹6,500" },
  MV: { required: "Visa on Arrival", notes: "Free 30-day stamp on arrival" },
  PT: { required: "Schengen visa", notes: "Apply 15 days before travel · ~₹7,500" },
};

export function getVisaInfo(countryCode: string): VisaInfo {
  return (
    VISA_RULES[countryCode] ?? {
      required: "Check requirements",
      notes: "Visa rules vary — check the embassy website",
    }
  );
}

// ─── Master function: parallel fetch all data ───
export async function getDestinationData(
  destinationKey: string
): Promise<DestinationData & { meta: typeof DESTINATIONS[string] | null }> {
  const meta = DESTINATIONS[destinationKey.toLowerCase()];
  if (!meta) {
    return {
      weather: { current: null, forecast: [] },
      country: null,
      summary: null,
      attractions: [],
      photos: [],
      meta: null,
    };
  }

  const [weather, country, summary, attractions, photos] = await Promise.all([
    fetchWeather(meta.lat, meta.lon),
    fetchCountry(meta.countryCode),
    fetchWikiSummary(destinationKey.charAt(0).toUpperCase() + destinationKey.slice(1)),
    fetchAttractions(meta.lat, meta.lon),
    fetchPhotos(destinationKey + " travel destination"),
  ]);

  return { weather, country, summary, attractions, photos, meta };
}
