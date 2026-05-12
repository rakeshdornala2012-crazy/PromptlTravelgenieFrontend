const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY;

export interface VisaResult {
  passport: string;
  passportName: string;
  destination: string;
  destinationName: string;
  status: "visa_free" | "visa_on_arrival" | "e_visa" | "visa_required" | "not_allowed" | "unknown";
  statusLabel: string;
  duration?: string;
  notes?: string;
  category: "free" | "easy" | "moderate" | "difficult";
}

// Country code to name mapping (common ones)
export const COUNTRIES: Record<string, string> = {
  IN: "India", US: "United States", GB: "United Kingdom", CN: "China",
  AU: "Australia", CA: "Canada", DE: "Germany", FR: "France",
  JP: "Japan", SG: "Singapore", AE: "UAE", TH: "Thailand",
  ID: "Indonesia", MY: "Malaysia", PH: "Philippines", VN: "Vietnam",
  KR: "South Korea", TR: "Turkey", RU: "Russia", BR: "Brazil",
  ZA: "South Africa", NG: "Nigeria", EG: "Egypt", KE: "Kenya",
  MX: "Mexico", AR: "Argentina", IT: "Italy", ES: "Spain",
  NL: "Netherlands", CH: "Switzerland", SE: "Sweden", NO: "Norway",
  NZ: "New Zealand", PT: "Portugal", GR: "Greece", PL: "Poland",
  MV: "Maldives", LK: "Sri Lanka", NP: "Nepal", BD: "Bangladesh",
  PK: "Pakistan", MU: "Mauritius", SC: "Seychelles", MM: "Myanmar",
  KH: "Cambodia", LA: "Laos", BT: "Bhutan", QA: "Qatar",
  SA: "Saudi Arabia", BH: "Bahrain", OM: "Oman", KW: "Kuwait",
  JO: "Jordan", IL: "Israel", MA: "Morocco", TN: "Tunisia",
};

function normalizeStatus(raw: string): VisaResult["status"] {
  const s = raw.toLowerCase().replace(/[-_\s]/g, "");
  if (s.includes("visafree") || s.includes("novic") || s === "free") return "visa_free";
  if (s.includes("arrival") || s.includes("voa")) return "visa_on_arrival";
  if (s.includes("evisa") || s.includes("online") || s.includes("electronic")) return "e_visa";
  if (s.includes("notallowed") || s.includes("ban") || s.includes("refused")) return "not_allowed";
  if (s.includes("required") || s.includes("visa")) return "visa_required";
  return "unknown";
}

function statusToCategory(status: VisaResult["status"]): VisaResult["category"] {
  if (status === "visa_free") return "free";
  if (status === "visa_on_arrival" || status === "e_visa") return "easy";
  if (status === "visa_required") return "moderate";
  if (status === "not_allowed") return "difficult";
  return "moderate";
}

function statusLabel(status: VisaResult["status"]): string {
  return {
    visa_free: "Visa Free",
    visa_on_arrival: "Visa on Arrival",
    e_visa: "e-Visa",
    visa_required: "Visa Required",
    not_allowed: "Entry Not Allowed",
    unknown: "Check Embassy",
  }[status];
}

export async function checkVisa(passportCode: string, destinationCode: string): Promise<VisaResult> {
  const base: Omit<VisaResult, "status" | "statusLabel" | "category"> = {
    passport: passportCode,
    passportName: COUNTRIES[passportCode] ?? passportCode,
    destination: destinationCode,
    destinationName: COUNTRIES[destinationCode] ?? destinationCode,
  };

  try {
    const res = await fetch("https://visa-requirement.p.rapidapi.com/v2/visa/check", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "x-rapidapi-host": "visa-requirement.p.rapidapi.com",
        "x-rapidapi-key": RAPIDAPI_KEY,
      },
      body: new URLSearchParams({ passport: passportCode, destination: destinationCode }),
    });

    const data = await res.json();
    const rawStatus = data?.visa ?? data?.requirement ?? data?.status ?? "unknown";
    const status = normalizeStatus(String(rawStatus));

    return {
      ...base,
      status,
      statusLabel: statusLabel(status),
      category: statusToCategory(status),
      duration: data?.duration ?? data?.stay ?? undefined,
      notes: data?.notes ?? data?.info ?? undefined,
    };
  } catch (err) {
    console.error("Visa check failed:", err);
    return {
      ...base,
      status: "unknown",
      statusLabel: "Check Embassy",
      category: "moderate",
      notes: "Unable to fetch live visa data. Please verify with the official embassy website.",
    };
  }
}

export async function checkMultipleVisa(passport: string, destinations: string[]): Promise<VisaResult[]> {
  return Promise.all(destinations.map((dest) => checkVisa(passport, dest)));
}
