import { Moon, Sun } from "lucide-react";
import { useCurrency, Currency } from "@/lib/currency";
import { useTheme } from "@/lib/theme";

const CURRENCIES: Currency[] = ["INR", "USD", "EUR", "AED"];

const SettingsToggle = () => {
  const { currency, setCurrency } = useCurrency();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      {/* Currency selector */}
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value as Currency)}
        className="rounded-full border border-white/10 bg-secondary/50 px-2.5 py-1 text-xs outline-none cursor-pointer"
      >
        {CURRENCIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        aria-label="Toggle theme"
        className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-secondary/50 hover:bg-secondary transition-colors"
      >
        {theme === "dark" ? (
          <Sun className="h-3.5 w-3.5" />
        ) : (
          <Moon className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );
};

export default SettingsToggle;
