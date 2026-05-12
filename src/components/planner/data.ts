export type TripOption = {
  id: string;
  tier: "Budget" | "Balanced" | "Premium" | "Luxe";
  destination: string;
  country: string;
  nights: number;
  rating: number;
  flight?: { route: string; carrier: string; stops: string; duration: string; price: number };
  hotel?: { name: string; type: string; price: number };
  activities?: { count: number; sample: string; price: number };
  visa?: { type: string; price: number };
  total: number;
  highlights: string[];
  featured?: boolean;
};

export const MOCK_OPTIONS: TripOption[] = [
  {
    id: "opt-1",
    tier: "Budget",
    destination: "Bali",
    country: "Indonesia",
    nights: 5,
    rating: 4.6,
    flight: { route: "DEL → DPS", carrier: "AirAsia", stops: "1 stop · KUL", duration: "11h 20m", price: 21800 },
    hotel: { name: "Ubud Jungle Retreat", type: "Boutique villa", price: 18400 },
    activities: { count: 3, sample: "Rice terrace + temple tour", price: 4200 },
    visa: { type: "Visa on arrival", price: 1800 },
    total: 46200,
    highlights: ["Beach + jungle", "Wellness focus", "Best Nov–Mar"],
  },
  {
    id: "opt-2",
    tier: "Balanced",
    destination: "Maldives",
    country: "Maldives",
    nights: 5,
    rating: 4.85,
    flight: { route: "DEL → MLE", carrier: "IndiGo", stops: "Direct", duration: "4h 30m", price: 22400 },
    hotel: { name: "Olhuveli Beach Villa", type: "Beach villa · half board", price: 19800 },
    activities: { count: 4, sample: "Snorkel + sunset cruise", price: 4200 },
    visa: { type: "Visa on arrival", price: 1800 },
    total: 48200,
    highlights: ["Direct flight", "Beachfront", "Calm seas Nov"],
    featured: true,
  },
  {
    id: "opt-3",
    tier: "Premium",
    destination: "Phuket",
    country: "Thailand",
    nights: 6,
    rating: 4.7,
    flight: { route: "DEL → HKT", carrier: "Thai Smile", stops: "1 stop · BKK", duration: "9h 45m", price: 28500 },
    hotel: { name: "Kata Rocks Suite", type: "Cliffside suite", price: 42600 },
    activities: { count: 5, sample: "Phi Phi day cruise + spa", price: 6800 },
    visa: { type: "e-Visa · 30 days", price: 2400 },
    total: 80300,
    highlights: ["Cliffside views", "Nightlife", "Island hopping"],
  },
  {
    id: "opt-4",
    tier: "Luxe",
    destination: "Seychelles",
    country: "Seychelles",
    nights: 6,
    rating: 4.95,
    flight: { route: "DEL → SEZ", carrier: "Emirates", stops: "1 stop · DXB", duration: "12h 10m", price: 56200 },
    hotel: { name: "Six Senses Zil Pasyon", type: "Pool villa", price: 84000 },
    activities: { count: 4, sample: "Private island + diving", price: 12400 },
    visa: { type: "Visa-free", price: 0 },
    total: 152600,
    highlights: ["Private island", "World-class diving", "Year-round sun"],
  },
];

export const AGENTS_RUN = [
  { key: "flight", label: "Flight agent", task: "Scanning 1,240 fares across 38 carriers", duration: 1100 },
  { key: "hotel", label: "Hotel agent", task: "Matching stays to vibe and budget", duration: 1400 },
  { key: "activity", label: "Activities agent", task: "Curating experiences from 80+ partners", duration: 900 },
  { key: "visa", label: "Visa agent", task: "Checking entry requirements for IN passport", duration: 700 },
  { key: "food", label: "Food agent", task: "Mapping local dining around your stays", duration: 1000 },
  { key: "climate", label: "Climate agent", task: "Analyzing weather windows in November", duration: 800 },
];
