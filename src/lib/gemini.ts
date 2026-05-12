// ─────────────────────────────────────────────────────────────
//  Gemini Brain → Qwen Brain (via backend → Ollama)
//  Same exported interface, but routed through local Qwen 2.5
// ─────────────────────────────────────────────────────────────

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
import { vLog } from "@/components/LoggerOverlay";

// ── Types ─────────────────────────────────────────────────────

export type IntentType =
  | "conversational"   // Vague, greeting, general advice → no API
  | "flights"          // Clear flight intent
  | "hotels"           // Clear hotel intent
  | "cars"             // Car rental intent
  | "attractions"      // Sightseeing/activities intent
  | "visa"             // Visa check intent
  | "full_trip"        // Wants everything
  | "weather";         // Weather only

export interface TripIntent {
  type: IntentType;
  destination?: string;
  origin?: string;
  checkIn?: string;       // YYYY-MM-DD
  checkOut?: string;      // YYYY-MM-DD
  adults?: number;
  budget?: string;
  cabinClass?: string;
  passportCountry?: string;
  confidence: number;     // 0-1
}

export interface GeminiMessage {
  role: "user" | "assistant";
  content: string;
}

export interface GeminiResponse {
  reply: string;
  intent: TripIntent;
  suggestedFollowUps: string[];
}

// ── Main exported function ────────────────────────────────────

export async function chat(
  userMessage: string,
  history: GeminiMessage[] = []
): Promise<GeminiResponse> {
  try {
    vLog("ai", `Qwen Ask Mode Request -> ${userMessage}`, { historyCount: history.length });
    const startTime = Date.now();
    const res = await fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: userMessage,
        history: history.map((m) => ({ role: m.role, content: m.content })),
      }),
    });

    if (!res.ok) throw new Error(`Backend error: ${res.status}`);

    const data = await res.json();
    vLog("ai", `Qwen Response (${Date.now() - startTime}ms)`, data);

    return {
      reply: data.reply ?? "Let me help you plan your perfect trip! 🌍",
      intent: {
        type: data.intent?.type ?? "conversational",
        destination: data.intent?.destination ?? undefined,
        origin: data.intent?.origin ?? undefined,
        checkIn: data.intent?.checkIn ?? undefined,
        checkOut: data.intent?.checkOut ?? undefined,
        adults: data.intent?.adults ?? 1,
        budget: data.intent?.budget ?? undefined,
        cabinClass: data.intent?.cabinClass ?? undefined,
        passportCountry: data.intent?.passportCountry ?? undefined,
        confidence: data.intent?.confidence ?? 0.5,
      },
      suggestedFollowUps: data.suggestedFollowUps ?? [],
    };
  } catch (err) {
    console.error("Qwen chat error:", err);
    vLog("error", "Qwen Chat Error", err);
    return {
      reply: "I'm having a moment — could you tell me more about where you'd like to go? 🌏",
      intent: { type: "conversational", confidence: 0 },
      suggestedFollowUps: [
        "Find me flights to Bali",
        "Show hotels in Dubai",
        "Plan a 5-day Maldives trip",
      ],
    };
  }
}

// ── Helper: should we trigger APIs? ──────────────────────────

export function shouldTriggerAPI(intent: TripIntent): boolean {
  return intent.type !== "conversational" && intent.confidence > 0.6;
}

export function getAPITargets(intent: TripIntent): IntentType[] {
  if (intent.type === "full_trip") return ["flights", "hotels", "attractions"];
  if (intent.type === "conversational" || intent.type === "weather") return [];
  return [intent.type];
}
