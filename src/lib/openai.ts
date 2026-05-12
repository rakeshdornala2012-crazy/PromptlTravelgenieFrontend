import OpenAI from "openai";
import { TripOption } from "@/components/planner/data";

const client = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export async function generateTripOptions(query: string, intent: string = "full_trip"): Promise<TripOption[]> {
  let inclusionRules = "";
  if (intent === "hotels") {
    inclusionRules = `
- DO NOT include the "flight", "visa", or "activities" properties. Only include "hotel".
- total must equal hotel price.`;
  } else if (intent === "flights") {
    inclusionRules = `
- DO NOT include the "hotel", "visa", or "activities" properties. Only include "flight".
- total must equal flight price.`;
  } else if (intent === "attractions") {
    inclusionRules = `
- DO NOT include the "flight", "hotel", or "visa" properties. Only include "activities".
- total must equal activities price.`;
  } else {
    inclusionRules = `
- total must equal sum of flight + hotel + activities + visa prices.`;
  }

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `You are a travel planning assistant. Generate exactly 3 trip options based on this query: "${query}"
        
Return ONLY a valid JSON array with exactly 3 objects. No markdown, no explanation, just the JSON array.

Each object must have this exact structure:
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
  "price": {
    "total": 85000,
    "flight": 30000,
    "hotel": 40000,
    "activities": 10000,
    "visa": 5000
  },
  "currency": "INR"
}

Rules:
- ids must be "opt-1", "opt-2", "opt-3"
- prices in INR (Indian Rupees)
- Route always starts with DEL
- Match destination to user's query (beach, mountains, city, etc)
- Respect budget if mentioned in query
- tagColor options: "bg-emerald-500/20 text-emerald-400" or "bg-amber-500/20 text-amber-400" or "bg-blue-500/20 text-blue-400"
${inclusionRules}`,
      },
    ],
  });

  const text = response.choices[0].message.content ?? "";
  const cleaned = text.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned) as TripOption[];
}

export type VoyaMessage = { role: "user" | "assistant"; content: string };

export async function chatWithVoya(
  history: VoyaMessage[],
  userMessage: string
): Promise<string> {
  const response = await client.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 300,
    messages: [
      {
        role: "system",
        content: `You are Voya, a friendly and concise AI travel assistant. You help users plan trips from India (DEL).
Keep responses SHORT (2-3 sentences max) since they will be spoken aloud via text-to-speech.
Speak naturally, like a real travel agent on a call. Never use bullet points or markdown.
When the user describes a trip, confirm key details and ask one clarifying question at a time.
If they say go ahead / plan it / search / find trips, end your response with the exact phrase: [SEARCH: their full query]`,
      },
      ...history,
      { role: "user", content: userMessage },
    ],
  });

  return response.choices[0].message.content ?? "";
}