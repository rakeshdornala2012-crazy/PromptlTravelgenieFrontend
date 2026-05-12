// ─────────────────────────────────────────────────────────────
//  Validate — Intelligent field validation via backend Qwen AI
// ─────────────────────────────────────────────────────────────

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
import { vLog } from "@/components/LoggerOverlay";

export interface FieldValidation {
  value: any;
  status: "ok" | "missing" | "warning";
  suggestion?: string;
}

export interface ValidationResult {
  complete: boolean;
  fields: {
    destination: FieldValidation;
    dates: FieldValidation;
    travelers: FieldValidation;
    budget: FieldValidation;
  };
  missingCount: number;
  aiMessage: string;
}

const EMPTY_RESULT: ValidationResult = {
  complete: false,
  fields: {
    destination: { value: null, status: "missing", suggestion: "Where would you like to go?" },
    dates: { value: null, status: "missing", suggestion: "When are you planning to travel?" },
    travelers: { value: null, status: "missing", suggestion: "How many travelers?" },
    budget: { value: null, status: "missing", suggestion: "What's your budget range?" },
  },
  missingCount: 4,
  aiMessage: "Tell me about your dream trip! ✈️",
};

// Debounce helper
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export async function validateTripInput(input: string): Promise<ValidationResult> {
  if (!input.trim()) return EMPTY_RESULT;

  // Cancel previous pending request
  if (debounceTimer) clearTimeout(debounceTimer);

  return new Promise((resolve) => {
    debounceTimer = setTimeout(async () => {
      try {
        vLog("network", `Validating -> ${input}`);
        const startTime = Date.now();
        const res = await fetch(`${API_URL}/validate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input }),
        });

        if (!res.ok) throw new Error("Validation request failed");

        const data: ValidationResult = await res.json();
        vLog("ai", `Validation complete (${Date.now() - startTime}ms)`, data);
        resolve(data);
      } catch (error) {
        vLog("error", "Validation API fallback", error);
        // Fallback: basic client-side validation
        resolve(clientSideValidate(input));
      }
    }, 600); // 600ms debounce
  });
}

// Synchronous immediate validation (no API call, for instant feedback)
export function clientSideValidate(input: string): ValidationResult {
  const lower = input.toLowerCase();

  const destinations = [
    "bali", "goa", "dubai", "paris", "tokyo", "london", "maldives", "manali",
    "santorini", "lisbon", "singapore", "bangkok", "rome", "barcelona",
    "mumbai", "delhi", "hyderabad", "bangalore", "phuket", "kyoto",
    "seychelles", "new york", "sydney", "amsterdam", "prague", "vienna",
    "switzerland", "sri lanka", "nepal", "bhutan", "thailand", "vietnam",
    "cambodia", "morocco", "egypt", "greece", "turkey", "italy", "spain",
    "france", "germany", "japan", "korea", "australia", "new zealand",
  ];

  const hasDestination = destinations.some((d) => lower.includes(d));
  const hasDates = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december|\d{1,2}\/\d{1,2}|\d{4}|next\s+(week|month|weekend)|tomorrow|this\s+(week|month|weekend))\b/i.test(input);
  const hasBudget = /\b(₹|inr|budget|cheap|luxury|premium|under|lakh|k\b|\d{4,}|affordable|mid.?range|5.?star)\b/i.test(input);
  const hasTravelers = /\b(\d+\s*(people|person|adults?|pax|travelers?|guests?)|solo|couple|family|for\s+\d+|honeymoon|friends)\b/i.test(input);

  const fields = {
    destination: {
      value: hasDestination ? "detected" : null,
      status: (hasDestination ? "ok" : "missing") as "ok" | "missing",
      suggestion: hasDestination ? undefined : "Where would you like to go?",
    },
    dates: {
      value: hasDates ? "detected" : null,
      status: (hasDates ? "ok" : "missing") as "ok" | "missing",
      suggestion: hasDates ? undefined : "When are you planning to travel?",
    },
    travelers: {
      value: hasTravelers ? "detected" : null,
      status: (hasTravelers ? "ok" : "missing") as "ok" | "missing",
      suggestion: hasTravelers ? undefined : "How many people are traveling?",
    },
    budget: {
      value: hasBudget ? "detected" : null,
      status: (hasBudget ? "ok" : "missing") as "ok" | "missing",
      suggestion: hasBudget ? undefined : "What's your budget range?",
    },
  };

  const missingCount = Object.values(fields).filter((f) => f.status !== "ok").length;
  const missingNames = Object.entries(fields)
    .filter(([, f]) => f.status !== "ok")
    .map(([k]) => k);

  let aiMessage = "";
  if (missingCount === 0) {
    aiMessage = "Perfect! All details captured — ready to search! ✨";
  } else if (missingCount === 1) {
    aiMessage = `Almost there! Just add your ${missingNames[0]} to get started.`;
  } else {
    aiMessage = `Great start! Add ${missingNames.slice(0, 2).join(" & ")} for the best results.`;
  }

  return {
    complete: hasDestination && hasDates,
    fields,
    missingCount,
    aiMessage,
  };
}
