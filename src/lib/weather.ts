export interface WeatherData {
  temp: number;
  feelsLike: number;
  humidity: number;
  description: string;
  windSpeed: number;
  icon: string;
}

const CITY_COORDS: Record<string, { lat: number; lon: number }> = {
  bali: { lat: -8.3405, lon: 115.0920 },
  kyoto: { lat: 35.0116, lon: 135.7681 },
  santorini: { lat: 36.3932, lon: 25.4615 },
  manali: { lat: 32.2396, lon: 77.1887 },
  dubai: { lat: 25.2048, lon: 55.2708 },
  maldives: { lat: 3.2028, lon: 73.2207 },
  lisbon: { lat: 38.7223, lon: -9.1393 },
  coorg: { lat: 12.3375, lon: 75.8069 },
  tokyo: { lat: 35.6762, lon: 139.6503 },
};

const WMO_DESCRIPTIONS: Record<number, { label: string; icon: string }> = {
  0: { label: "Clear sky", icon: "☀️" },
  1: { label: "Mainly clear", icon: "🌤️" },
  2: { label: "Partly cloudy", icon: "⛅" },
  3: { label: "Overcast", icon: "☁️" },
  45: { label: "Foggy", icon: "🌫️" },
  51: { label: "Light drizzle", icon: "🌦️" },
  61: { label: "Light rain", icon: "🌧️" },
  71: { label: "Light snow", icon: "🌨️" },
  80: { label: "Rain showers", icon: "🌦️" },
  95: { label: "Thunderstorm", icon: "⛈️" },
};

export async function getWeather(destination: string): Promise<WeatherData | null> {
  const key = destination.toLowerCase();
  const coords = CITY_COORDS[key];

  if (!coords) return null;

  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`
    );
    const data = await res.json();
    const current = data.current;
    const wmo = WMO_DESCRIPTIONS[current.weather_code] ?? { label: "Clear", icon: "🌤️" };

    return {
      temp: Math.round(current.temperature_2m),
      feelsLike: Math.round(current.apparent_temperature),
      humidity: current.relative_humidity_2m,
      description: wmo.label,
      windSpeed: Math.round(current.wind_speed_10m),
      icon: wmo.icon,
    };
  } catch (err) {
    console.error("Weather fetch failed:", err);
    return null;
  }
}