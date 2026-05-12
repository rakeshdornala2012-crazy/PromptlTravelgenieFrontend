import { createContext, useContext, useState, ReactNode } from "react";

export type Currency = "INR" | "USD" | "EUR" | "AED";

// Approx rates from INR (Apr 2026 ballpark — adjust as you like)
const RATES: Record<Currency, { rate: number; symbol: string; code: string }> = {
  INR: { rate: 1, symbol: "₹", code: "INR" },
  USD: { rate: 1 / 84, symbol: "$", code: "USD" },
  EUR: { rate: 1 / 91, symbol: "€", code: "EUR" },
  AED: { rate: 1 / 23, symbol: "د.إ", code: "AED" },
};

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  format: (inrAmount: number) => string;
  symbol: string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    const saved = localStorage.getItem("voya-currency");
    return (saved as Currency) || "INR";
  });

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem("voya-currency", c);
  };

  const format = (inrAmount: number) => {
    const { rate, symbol } = RATES[currency];
    const converted = inrAmount * rate;

    if (currency === "INR") {
      return symbol + Math.round(converted).toLocaleString("en-IN");
    }
    return symbol + Math.round(converted).toLocaleString("en-US");
  };

  return (
    <CurrencyContext.Provider
      value={{ currency, setCurrency, format, symbol: RATES[currency].symbol }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
};
