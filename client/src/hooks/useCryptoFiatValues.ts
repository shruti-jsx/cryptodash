// useCryptoFiatValues.ts



import { API_BASE_URL } from "@/config";
export default function useCryptoFiatValues() {
const getBatchCryptoFiatValues = async (coinIds: string[], fiatCurrency: string) => {
  try {
    const idsParam = coinIds.join(",");
    const res = await fetch(`${API_BASE_URL}/data/simple-price?ids=${idsParam}&vs_currency=${fiatCurrency}`, {
      credentials: "include",
    });

    const json = await res.json();
    console.log(json);
    return json.data || {};
  } catch (err) {
    console.error("Batch price fetch failed:", err);
    return {};
  }
};

 const getSingleCryptoFiatValue = async (coinId: string, fiatCurrency: string) => {
  try {
    const res = await fetch(`${API_BASE_URL}/data/simple-price/${coinId}?vs_currency=${fiatCurrency}`, {
      credentials: "include",
    });

    const json = await res.json();
    console.log(json);
    return json.data?.[coinId]?.[fiatCurrency] || 0;
  } catch (err) {
    console.error("Single price fetch failed:", err);
    return 0;
  }
};

  return { getSingleCryptoFiatValue, getBatchCryptoFiatValues };

}