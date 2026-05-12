// ─────────────────────────────────────────────────────────────
//  Qwen AI — Trip Genie's LLM layer (via backend → Ollama)
//  Replaces the old openai.ts that called OpenAI directly
// ─────────────────────────────────────────────────────────────

import { TripOption } from "@/components/planner/data";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function generateTripOptions(query: string, intent: string = "full_trip"): Promise<TripOption[]> {
  let inclusionRules = "";
  if (intent === "hotels") {
    inclusionRules = `\n- Only include "hotel". total = hotel price.`;
  } else if (intent === "flights") {
    inclusionRules = `\n- Only include "flight". total = flight price.`;
  } else if (intent === "attractions") {
    inclusionRules = `\n- Only include "activities". total = activities price.`;
  } else {
    inclusionRules = `\n- total must equal sum of flight + hotel + activities + visa prices.`;
  }

  const res = await fetch(`${API_URL}/plan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `Generate exactly 3 trip options for: "${query}"

Each option must have this exact structure:
{
  "id": "opt-1",
  "label": "Budget Escape",
  "tag": "Best Value",
  "tagColor": "bg-emerald-500/20 text-emerald-400",
  "destination": "City, Country",
  "duration": "7 nights",
  "departure": "DEL",
  "airline": "Airline Name",
  "flightClass": "Economy",
  "flight": { "route": "DEL → DXB", "carrier": "Emirates", "stops": "Direct", "duration": "3h 40m", "price": 30000 },
  "hotel": { "name": "Hotel Name", "type": "Resort", "price": 40000 },
  "activities": { "count": 3, "sample": "Desert Safari", "price": 10000 },
  "visa": { "type": "e-Visa", "price": 5000 },
  "total": 85000,
  "highlights": ["highlight 1", "highlight 2", "highlight 3"],
  "price": { "total": 85000, "flight": 30000, "hotel": 40000, "activities": 10000, "visa": 5000 },
  "currency": "INR"
}

Rules: ids = "opt-1","opt-2","opt-3". Prices in INR. Route starts with DEL.
${inclusionRules}`,
    }),
  });

  const data = await res.json();
  const text = typeof data.result === "string" ? data.result : JSON.stringify(data.result);
  const cleaned = text.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(cleaned);

  // Handle both array and object-with-plans responses
  if (Array.isArray(parsed)) return parsed as TripOption[];
  if (parsed.plans && Array.isArray(parsed.plans)) return parsed.plans as TripOption[];
  return [];
}

export type VoyaMessage = { role: "user" | "assistant"; content: string };

export async function chatWithVoya(
  history: VoyaMessage[],
  userMessage: string
): Promise<string> {
  const res = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: `You are Voya, a friendly and concise AI travel assistant. Keep responses SHORT (2-3 sentences max).
Speak naturally, like a real travel agent. Never use bullet points or markdown.
If the user says go ahead / plan it / search, end your response with: [SEARCH: their full query]

User says: ${userMessage}`,
      history: history.map((m) => ({ role: m.role, content: m.content })),
    }),
  });

  const data = await res.json();
  return data.reply ?? "";
}
