/**
 * exploreApi.js
 * -------------
 * Three independent fetchers for the Explore tab.
 * Each is resilient: errors return {error} instead of throwing, so widgets
 * can render gracefully even if one source fails.
 */

// ---------- Geocoding (shared) ----------
const geocodeCache = new Map();

export async function geocodeDestination(name) {
  if (geocodeCache.has(name)) return geocodeCache.get(name);
  try {
    const r = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=en&format=json`
    );
    const data = await r.json();
    const hit = data?.results?.[0];
    if (!hit) throw new Error("not found");
    const result = {
      lat: hit.latitude,
      lon: hit.longitude,
      country: hit.country,
      countryCode: hit.country_code, // ISO2 — feed this to REST Countries
      timezone: hit.timezone,
      population: hit.population,
    };
    geocodeCache.set(name, result);
    return result;
  } catch (e) {
    return { error: e.message };
  }
}

// ---------- 1) CLIMATE ----------
// Returns: { current: {...}, monthly: [{month, tempHigh, tempLow, precip}], bestMonths: [...] }
export async function fetchClimate(destination) {
  const geo = await geocodeDestination(destination);
  if (geo.error) return { error: geo.error };

  try {
    // Current weather
    const currentRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${geo.lat}&longitude=${geo.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&temperature_unit=celsius`
    );
    const currentData = await currentRes.json();

    // Monthly normals via climate API (1991-2020 baseline)
    // We approximate by pulling daily temp + precip for past year, then aggregating.
    // This is more reliable than the climate endpoint which often 404s for some coords.
    const yearAgo = new Date();
    yearAgo.setFullYear(yearAgo.getFullYear() - 1);
    const yyyy = yearAgo.toISOString().slice(0, 10);
    const today = new Date().toISOString().slice(0, 10);

    const histRes = await fetch(
      `https://archive-api.open-meteo.com/v1/archive?latitude=${geo.lat}&longitude=${geo.lon}&start_date=${yyyy}&end_date=${today}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&temperature_unit=celsius`
    );
    const histData = await histRes.json();

    const monthly = aggregateMonthly(histData?.daily);
    const bestMonths = pickBestMonths(monthly);

    return {
      current: {
        temp: currentData?.current?.temperature_2m,
        feelsLike: currentData?.current?.apparent_temperature,
        humidity: currentData?.current?.relative_humidity_2m,
        wind: currentData?.current?.wind_speed_10m,
        code: currentData?.current?.weather_code,
        description: weatherCodeToText(currentData?.current?.weather_code),
      },
      monthly,
      bestMonths,
      location: { lat: geo.lat, lon: geo.lon, country: geo.country },
    };
  } catch (e) {
    return { error: e.message };
  }
}

function aggregateMonthly(daily) {
  if (!daily?.time) return [];
  const buckets = Array.from({ length: 12 }, () => ({ highs: [], lows: [], precip: [] }));
  daily.time.forEach((d, i) => {
    const m = new Date(d).getMonth();
    if (daily.temperature_2m_max?.[i] != null) buckets[m].highs.push(daily.temperature_2m_max[i]);
    if (daily.temperature_2m_min?.[i] != null) buckets[m].lows.push(daily.temperature_2m_min[i]);
    if (daily.precipitation_sum?.[i] != null) buckets[m].precip.push(daily.precipitation_sum[i]);
  });
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const avg = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null);
  const sum = (a) => (a.length ? a.reduce((x, y) => x + y, 0) : null);
  return buckets.map((b, i) => ({
    month: monthNames[i],
    tempHigh: avg(b.highs) != null ? Math.round(avg(b.highs)) : null,
    tempLow: avg(b.lows) != null ? Math.round(avg(b.lows)) : null,
    precip: sum(b.precip) != null ? Math.round(sum(b.precip)) : null,
  }));
}

// "Best" = comfortable temps (18-30°C high) and lower precip
function pickBestMonths(monthly) {
  if (!monthly?.length) return [];
  const scored = monthly
    .filter((m) => m.tempHigh != null)
    .map((m) => {
      const tempScore =
        m.tempHigh >= 20 && m.tempHigh <= 30 ? 100 : Math.max(0, 100 - Math.abs(m.tempHigh - 25) * 4);
      const rainPenalty = Math.min(50, (m.precip ?? 0) / 4);
      return { ...m, score: tempScore - rainPenalty };
    })
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, 3).map((m) => m.month);
}

const WEATHER_CODES = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Rime fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Light showers",
  81: "Showers",
  82: "Heavy showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Severe thunderstorm",
};
function weatherCodeToText(code) {
  return WEATHER_CODES[code] ?? "—";
}

// ---------- 2) COUNTRY ----------
// Uses REST Countries v3.1 (no key)
export async function fetchCountry(destination) {
  const geo = await geocodeDestination(destination);
  if (geo.error || !geo.countryCode) return { error: geo.error || "no country code" };

  try {
    const r = await fetch(
      `https://restcountries.com/v3.1/alpha/${geo.countryCode}?fields=name,flags,capital,region,subregion,population,languages,currencies,timezones,idd,car,cca2`
    );
    const arr = await r.json();
    const c = Array.isArray(arr) ? arr[0] : arr;
    if (!c) throw new Error("country not found");

    const currencies = c.currencies
      ? Object.entries(c.currencies).map(([code, v]) => ({ code, name: v.name, symbol: v.symbol }))
      : [];
    const languages = c.languages ? Object.values(c.languages) : [];
    const callingCode = c.idd?.root && c.idd?.suffixes?.[0] ? `${c.idd.root}${c.idd.suffixes[0]}` : null;

    return {
      name: c.name?.common,
      official: c.name?.official,
      flag: c.flags?.svg ?? c.flags?.png,
      capital: c.capital?.[0],
      region: c.region,
      subregion: c.subregion,
      population: c.population,
      languages,
      currencies,
      timezones: c.timezones,
      callingCode,
      drivesOn: c.car?.side,
      countryCode: c.cca2,
      // Visa is hard to source for free reliably — keep a manual override layer
      visa: getVisaInfo(c.cca2),
    };
  } catch (e) {
    return { error: e.message };
  }
}

// Lightweight visa hints for common Indian-passport destinations.
// Replace/extend with your own data source as needed.
const VISA_HINTS = {
  AE: { type: "Visa on Arrival", note: "14-day VOA for Indian passport (with US/UK/EU visa or green card). Pre-arranged eVisa otherwise.", fee: "~₹6,500" },
  TH: { type: "Visa on Arrival", note: "15-day VOA available; eVisa pre-application also supported.", fee: "~₹2,000" },
  ID: { type: "Visa on Arrival", note: "30-day VOA available for Indian passport.", fee: "~₹2,800" },
  SG: { type: "eVisa Required", note: "Apply online before travel; usually issued in 1–3 days.", fee: "~₹2,500" },
  MY: { type: "eVisa Required", note: "eVisa or eNTRI online before travel.", fee: "~₹2,800" },
  TR: { type: "eVisa Required", note: "Apply online before travel.", fee: "~₹4,500" },
  LK: { type: "ETA Required", note: "Electronic Travel Authorization online before travel.", fee: "~₹3,000" },
  MV: { type: "Visa on Arrival", note: "30-day free VOA for Indian passport.", fee: "Free" },
  NP: { type: "Visa-Free", note: "No visa needed for Indian passport.", fee: "Free" },
  BT: { type: "Visa-Free", note: "Permit on arrival for Indian passport (SDF applies).", fee: "SDF ₹1,200/day" },
};
function getVisaInfo(cca2) {
  return VISA_HINTS[cca2] || { type: "Check Requirements", note: "Visa requirements vary — verify with official sources before booking.", fee: "—" };
}

// ---------- 3) FOOD ----------
// Curated must-try dishes per destination keyword. Extend this dictionary
// or swap for an AI/CMS-driven source as your catalog grows.
const FOOD_CURATED = {
  dubai: {
    dishes: [
      { name: "Shawarma", note: "Spit-roasted meat in flatbread — try at Al Mallah." },
      { name: "Al Harees", note: "Slow-cooked wheat & meat porridge, Emirati comfort food." },
      { name: "Luqaimat", note: "Crispy sweet dumplings with date syrup." },
      { name: "Machboos", note: "Spiced rice with meat, the UAE's national dish." },
      { name: "Camel Burger", note: "Found at Local House, Bur Dubai — surprisingly tender." },
    ],
    spots: [
      { name: "Pierchic", area: "Madinat Jumeirah", vibe: "Overwater fine dining" },
      { name: "Ravi Restaurant", area: "Satwa", vibe: "Pakistani street food legend" },
      { name: "Al Ustad Special Kabab", area: "Bur Dubai", vibe: "Iranian classic since 1978" },
    ],
  },
  bali: {
    dishes: [
      { name: "Babi Guling", note: "Balinese roast suckling pig — try at Ibu Oka." },
      { name: "Bebek Betutu", note: "Slow-roasted duck wrapped in banana leaves." },
      { name: "Nasi Campur", note: "Mixed rice plate — the everyman's lunch." },
      { name: "Sate Lilit", note: "Minced fish satay on lemongrass skewers." },
      { name: "Lawar", note: "Spiced vegetable & coconut salad, often with minced pork." },
    ],
    spots: [
      { name: "Locavore", area: "Ubud", vibe: "Acclaimed tasting-menu spot" },
      { name: "Warung Babi Guling Ibu Oka", area: "Ubud", vibe: "Iconic suckling pig" },
      { name: "La Brisa", area: "Canggu", vibe: "Sunset beach club & seafood" },
    ],
  },
  paris: {
    dishes: [
      { name: "Croissant", note: "Best at Du Pain et des Idées or Cédric Grolet." },
      { name: "Steak Frites", note: "Le Relais de l'Entrecôte is the cult choice." },
      { name: "Coq au Vin", note: "Wine-braised chicken — classic bistro fare." },
      { name: "Bouillabaisse", note: "Provençal fish stew, typically with rouille." },
      { name: "Macarons", note: "Pierre Hermé over Ladurée, fight me." },
    ],
    spots: [
      { name: "Le Comptoir du Relais", area: "Saint-Germain", vibe: "Yves Camdeborde bistro" },
      { name: "Septime", area: "11th arr.", vibe: "Modern French, hard reservation" },
      { name: "Breizh Café", area: "Marais", vibe: "Best galettes in the city" },
    ],
  },
  tokyo: {
    dishes: [
      { name: "Sushi Omakase", note: "Chef's choice at the counter — the only way." },
      { name: "Tonkotsu Ramen", note: "Pork-bone broth, life-changing at Ichiran or Afuri." },
      { name: "Tempura", note: "Try Tempura Kondo for Michelin-grade." },
      { name: "Wagyu Yakiniku", note: "DIY grilling at the table — Han no Daidokoro." },
      { name: "Monjayaki", note: "Tokyo's runny-batter cousin to okonomiyaki." },
    ],
    spots: [
      { name: "Sukiyabashi Jiro", area: "Ginza", vibe: "The sushi temple" },
      { name: "Tsuta", area: "Sugamo", vibe: "Michelin-starred ramen" },
      { name: "Kyubey", area: "Ginza", vibe: "Sushi institution since 1935" },
    ],
  },
  london: {
    dishes: [
      { name: "Sunday Roast", note: "Best at The Camberwell Arms or Blacklock." },
      { name: "Fish & Chips", note: "Poppies (Spitalfields) or The Golden Hind." },
      { name: "Full English", note: "Regency Café, Westminster — cash only, worth it." },
      { name: "Pie & Mash", note: "Try F. Cooke for the classic East End version." },
      { name: "Eton Mess", note: "Strawberries, cream, meringue. Summer in a bowl." },
    ],
    spots: [
      { name: "St. JOHN", area: "Smithfield", vibe: "Nose-to-tail British icon" },
      { name: "Dishoom", area: "Multiple", vibe: "Bombay-café atmosphere" },
      { name: "Lyle's", area: "Shoreditch", vibe: "Modern British tasting menu" },
    ],
  },
  newyork: {
    dishes: [
      { name: "NY Pizza Slice", note: "Joe's (Bleecker), Di Fara (Brooklyn), or L'Industrie." },
      { name: "Bagel & Lox", note: "Russ & Daughters — the only correct answer." },
      { name: "Pastrami on Rye", note: "Katz's Delicatessen, since 1888." },
      { name: "Ramen", note: "Ippudo or Totto Ramen — surprisingly NYC institutions." },
      { name: "Cheesecake", note: "Junior's in Brooklyn." },
    ],
    spots: [
      { name: "Le Bernardin", area: "Midtown", vibe: "Three-Michelin seafood" },
      { name: "Peter Luger", area: "Williamsburg", vibe: "The steakhouse, est. 1887" },
      { name: "Eleven Madison Park", area: "Flatiron", vibe: "Plant-based fine dining" },
    ],
  },
};

// Generic fallback — better than empty state
const FOOD_GENERIC = {
  dishes: [
    { name: "Local street food", note: "Walking food tours are the fastest way in." },
    { name: "Regional specialty", note: "Ask any local for their grandmother's favorite dish." },
    { name: "Seasonal produce", note: "Markets reveal the real cuisine." },
  ],
  spots: [
    { name: "Local food market", area: "Central", vibe: "The honest snapshot of a place" },
    { name: "Family-run restaurant", area: "Old town", vibe: "Where flavor lives" },
  ],
};

export async function fetchFood(destination) {
  const key = destination.toLowerCase().replace(/\s+/g, "");
  const data = FOOD_CURATED[key] || FOOD_GENERIC;
  return { destination, ...data, isCurated: !!FOOD_CURATED[key] };
}
