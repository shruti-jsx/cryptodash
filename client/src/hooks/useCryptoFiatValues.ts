import { useState } from "react";

export default function useCryptoFiatValues() {
  const [priceCache, setPriceCache] = useState<{ [key: string]: { [currency: string]: number } }>({});

  const getCryptoFiatValues = async (coinIds: string[], currency: string) => {
    const prices: { [key: string]: number } = {};

    // filter IDs that are not cached or expired
    const idsToFetch: string[] = coinIds.filter((id) => {
      const entry = priceCache[id];
      if (!entry) return true;
      const isFresh = Date.now() - entry.timestamp < 3600_000; // 1 hour
      return !isFresh || !(currency in entry.value);
    });

    // batch request for all missing IDs
    if (idsToFetch.length > 0) {
      try {
        const url = `https://api.coingecko.com/api/v3/simple/price?ids=${idsToFetch.join(",")}&vs_currencies=${currency}`;
        const res = await fetch(url);
        const data = await res.json();

        const updatedCache = { ...priceCache };

        idsToFetch.forEach((id) => {
          const value = data[id]?.[currency];
          if (value !== undefined) {
            updatedCache[id] = {
              value: {
                ...updatedCache[id]?.value,
                [currency]: value,
              },
              timestamp: Date.now(),
            };
            prices[id] = value;
          }
        });

        setPriceCache(updatedCache);
      } catch (error) {
        console.error("Failed to fetch prices:", error);
      }
    }

    // Return merged cached + new
    coinIds.forEach((id) => {
      const cached = priceCache[id]?.value?.[currency];
      if (cached !== undefined) prices[id] = cached;
    });

    return prices;
  };

  return { getCryptoFiatValues };
}
