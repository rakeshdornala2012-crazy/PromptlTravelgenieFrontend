const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
import { vLog } from "@/components/LoggerOverlay";

export async function fetchTripPlan(query: string) {
  try {
    vLog("network", `Fetching Trip Plan -> ${query}`);
    const startTime = Date.now();
    const res = await fetch(`${API_URL}/plan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    const data = await res.json();
    vLog("network", `Plan received (${Date.now() - startTime}ms)`);
    
    if (typeof data.result === "string") {
      const parsed = JSON.parse(data.result);
      vLog("info", "Parsed plan JSON", parsed);
      return parsed;
    }
    vLog("info", "Parsed plan JSON", data.result);
    return data.result;
  } catch (error) {
    vLog("error", "Plan Fetch Failed", error);
    return null;
  }
}