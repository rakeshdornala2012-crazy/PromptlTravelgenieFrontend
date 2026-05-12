// Formatting helpers
export function formatCurrency(amount, currency = "INR") {
  try {
    return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

export function formatDateRange(start, end) {
  if (!start || !end) return "";
  const opts = { day: "numeric", month: "short", year: "numeric" };
  const s = new Date(start).toLocaleDateString("en-GB", opts);
  const e = new Date(end).toLocaleDateString("en-GB", opts);
  return `${s} — ${e}`;
}

export function nightsBetween(start, end) {
  if (!start || !end) return 0;
  const ms = new Date(end) - new Date(start);
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
}
