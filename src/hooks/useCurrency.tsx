import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "./useProfile";

export const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CHF", symbol: "Fr", name: "Swiss Franc" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "MXN", symbol: "MX$", name: "Mexican Peso" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real" },
  { code: "KRW", symbol: "₩", name: "South Korean Won" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar" },
  { code: "NOK", symbol: "kr", name: "Norwegian Krone" },
  { code: "SEK", symbol: "kr", name: "Swedish Krona" },
  { code: "DKK", symbol: "kr", name: "Danish Krone" },
  { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar" },
  { code: "ZAR", symbol: "R", name: "South African Rand" },
  { code: "TRY", symbol: "₺", name: "Turkish Lira" },
  { code: "THB", symbol: "฿", name: "Thai Baht" },
  { code: "TWD", symbol: "NT$", name: "New Taiwan Dollar" },
];

export const useCurrencyRates = () => {
  return useQuery({
    queryKey: ["currency_rates"],
    queryFn: async () => {
      const { data, error } = await supabase.from("currency_rates").select("*");
      if (error) throw error;
      return data as { from_currency: string; to_currency: string; rate: number }[];
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

export const useConvertAmount = () => {
  const { data: rates } = useCurrencyRates();
  const { data: profile } = useProfile();
  const userCurrency = profile?.preferred_currency || "USD";

  return (amount: number, fromCurrency: string): number => {
    if (fromCurrency === userCurrency || !rates) return amount;
    const rate = rates.find(
      (r) => r.from_currency === fromCurrency && r.to_currency === userCurrency
    );
    if (rate) return amount * Number(rate.rate);
    // Try via USD
    const toUsd = rates.find((r) => r.from_currency === fromCurrency && r.to_currency === "USD");
    const fromUsd = rates.find((r) => r.from_currency === "USD" && r.to_currency === userCurrency);
    if (toUsd && fromUsd) return amount * Number(toUsd.rate) * Number(fromUsd.rate);
    return amount;
  };
};

export const getCurrencySymbol = (code: string) =>
  CURRENCIES.find((c) => c.code === code)?.symbol || code;
