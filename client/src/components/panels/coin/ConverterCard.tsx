// react
import { useEffect, useState } from "react";
// components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import FiatSelectorDropdown from "@/components/ui/FiatSelectorDropdown";
// hooks
import useCryptoFiatValues from "@/hooks/useCryptoFiatValues";
import { useUserStore } from "@/stores/useUserStore";
// types
import { DetailedCoin } from "@/types";

interface ConverterCardProps {
  coin: DetailedCoin | null;
  className?: string;
}

const fiatList = [
  { id: "gbp", name: "Pound Sterling (GBP)", symbol: "GBP" },
  { id: "usd", name: "Dollars (USD)", symbol: "USD" },
  { id: "eur", name: "Euro (EUR)", symbol: "EUR" },
  { id: "chf", name: "Swiss Franc (CHF)", symbol: "CHF" },
  { id: "cny", name: "Chinese Yuan (CN)", symbol: "CNY" },
  { id: "aed", name: "UAE Dirham (AED)", symbol: "AED" },
  { id: "aud", name: "Australian Dollar (AUD)", symbol: "AUD" },
  { id: "jpy", name: "Japanese Yen (JPY)", symbol: "JPY" },
  { id: "cad", name: "Canadian Dollar (CAD)", symbol: "CAD" },
  { id: "pln", name: "Polish Zloty (PLN)", symbol: "PLN" },
  { id: "rub", name: "Russian Ruble (RUB)", symbol: "RUB" },
  { id: "sek", name: "Swedish Krona (SEK)", symbol: "SEK" },
  { id: "try", name: "Turkish Lira (TRY)", symbol: "TRY" },
  { id: "ars", name: "Argentine Peso (ARS)", symbol: "ARS" },
  { id: "mxn", name: "Mexican Peso (MXN)", symbol: "MXN" },
  { id: "clp", name: "Chilean Peso (CLP)", symbol: "CLP" },
  { id: "thb", name: "Thai Baht (THB)", symbol: "THB" },
  { id: "sgd", name: "Singapore Dollar (SGD)", symbol: "SGD" },
  { id: "inr", name: "Indian Rupee (INR)", symbol: "INR" },
];

export default function ConverterCard({
  coin,
  className = "",
}: ConverterCardProps) {
  const { getCryptoFiatValues } = useCryptoFiatValues(); // ✅ singular function name
  const userCurrency = useUserStore((s) => s.currency); // ✅ globally selected currency (like 'usd')

  const [cryptoAmount, setCryptoAmount] = useState("");
  const [fiatAmount, setFiatAmount] = useState("");
  const [fiatSelection, setFiatSelection] = useState(() => {
    const found = fiatList.find((f) => f.id === userCurrency);
    return found?.name || "Dollars (USD)";
  });

  useEffect(() => {
    const found = fiatList.find((f) => f.id === userCurrency);
    if (found) setFiatSelection(found.name);
  }, [userCurrency]);

  if (!coin || !coin.info) {
    return (
      <Card className="flex flex-col items-center justify-center mb-4 w-full h-[150px] rounded-xl dark:bg-zinc-700">
        <CardTitle className="flex items-center gap-2">Uh oh, error.</CardTitle>
        <CardDescription className="text-center">Try refreshing.</CardDescription>
      </Card>
    );
  }

  const getFiatIdAndPrice = async (fiatName: string) => {
  const fiat = fiatList.find((f) => f.name === fiatName);
  const fiatId = fiat?.id || "usd";
  const priceData = await getCryptoFiatValues(coin.id);
  const price = priceData[fiatId];
  return { fiatId, cryptoCurrentPrice: price };
};


  const cryptoToFiatCalculation = async (
    input: string,
    selectedFiat: string = fiatSelection
  ) => {
    try {
      const { cryptoCurrentPrice } = await getFiatIdAndPrice(selectedFiat);
      setCryptoAmount(input);
      const total = Number(input) * cryptoCurrentPrice;
      setFiatAmount(total.toString());
    } catch (err) {
      console.error("Conversion error:", err);
    }
  };

  const fiatToCryptoCalculation = async (
    input: string,
    selectedFiat: string = fiatSelection
  ) => {
    try {
      const { cryptoCurrentPrice } = await getFiatIdAndPrice(selectedFiat);
      setFiatAmount(input);
      const total = Number(input) / cryptoCurrentPrice;
      setCryptoAmount(total.toString());
    } catch (err) {
      console.error("Conversion error:", err);
    }
  };

  const handleFiatSelectionChange = async (selected: string) => {
    setFiatSelection(selected);
    if (cryptoAmount) {
      await cryptoToFiatCalculation(cryptoAmount, selected);
    }
  };

  return (
    <div className={`flex flex-col items-center min-w-min ${className}`}>
      <Card className="w-full">
        <CardHeader className="p-4">
          <CardTitle className="text-2xl mx-auto">Converter</CardTitle>
        </CardHeader>
        <CardContent className="px-12 pt-0 flex flex-col justify-center">
          <Input
            disabled
            className="text-center bg-zinc-200 font-medium disabled:text-black"
            type="text"
            value={coin.name}
          />
          <Input
            className="my-4 text-center"
            type="number"
            value={cryptoAmount}
            onChange={(e) => {
              const inputValue = e.target.value;
              if (!inputValue) {
                setCryptoAmount("");
                setFiatAmount("");
                return;
              }
              cryptoToFiatCalculation(inputValue);
            }}
            placeholder="Crypto Amount"
          />
          <div className="my-4 flex justify-center">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M17 4v16m0 0l-4-4m4 4l4-4M7 20V4m0 0L3 8m4-4l4 4" />
            </svg>
          </div>
          <Input
            className="my-4 text-center"
            type="number"
            value={fiatAmount}
            onChange={(e) => {
              const inputValue = e.target.value;
              if (!inputValue) {
                setCryptoAmount("");
                setFiatAmount("");
                return;
              }
              fiatToCryptoCalculation(inputValue);
            }}
            placeholder="Fiat Amount"
          />
          <FiatSelectorDropdown
            label="Select a currency"
            items={fiatList}
            value={fiatSelection}
            onChange={handleFiatSelectionChange}
          />
        </CardContent>
      </Card>
    </div>
  );
}
