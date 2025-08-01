import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "../../ui/skeleton";
import { formatCurrency, roundToTwoDecimalPlaces } from "@/lib";
import { useNavigate } from "react-router-dom";
import { AddedCoin } from "@/hooks/useCoinSearch";
import { useUserStore } from "@/stores/useUserStore";
import useCryptoFiatValues from "@/hooks/useCryptoFiatValues";

export interface CoinObject {
  id: string;
  name: string;
  symbol: string;
  image: string;
  market_cap_rank: number;
  current_price: number;
  market_cap: number;
  price_change_percentage_24h: number;
}

interface CryptoListTableProps {
  cryptoList: (CoinObject | AddedCoin)[];
  loading: boolean;
}

export default function CryptoListTable({
  cryptoList,
  loading,
}: CryptoListTableProps) {
  const navigate = useNavigate();
  const currency = useUserStore((state) => state.currency);
  const { getBatchCryptoFiatValues } = useCryptoFiatValues();
  const [priceMap, setPriceMap] = useState<{ [key: string]: number }>({});

  useEffect(() => {
  const fetchPrices = async () => {
    const ids = cryptoList.map((coin) => coin.id);
    if (!ids.length) return;
    const prices = await getBatchCryptoFiatValues(ids, currency);
    setPriceMap(prices);
  };

  fetchPrices();
}, [cryptoList, currency]);


  const handleRowClick = (coinId: string) => {
    navigate(`/app/coin/${coinId}`);
  };

  return (
    <Table className="mt-4">
      <TableHeader>
        <TableRow>
          <TableHead className="w-[25px]">Rank</TableHead>
          <TableHead className="w-[25px]">Icon</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>% (24h)</TableHead>
          <TableHead className="text-right">Market Cap</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {cryptoList.map((coin, i) => {
          const isCoinObject = "current_price" in coin;
          const coinPrice = priceMap[coin.id] ?? (isCoinObject ? coin.current_price : null);

          const marketCap =
            priceMap[coin.id] && isCoinObject
              ? (coin.market_cap / coin.current_price) * priceMap[coin.id]
              : isCoinObject
              ? coin.market_cap
              : null;



          return (
            <TableRow
              key={`${coin.name}${i}`}
              className="cursor-pointer"
              onClick={() => handleRowClick(coin.id)}
            >
              <TableCell>{coin.market_cap_rank || "N/A"}</TableCell>
              <TableCell>
                <img
                  src={"image" in coin ? coin.image : coin.thumb}
                  alt={coin.name}
                  className="w-6 h-6"
                />
              </TableCell>
              <TableCell>{coin.name}</TableCell>
              <TableCell>
                {coinPrice !== null ? formatCurrency(coinPrice, currency) : "N/A"}
              </TableCell>
              <TableCell
                className={
                  isCoinObject && coin.price_change_percentage_24h < 0
                    ? "text-red-600"
                    : "text-green-600"
                }
              >
                {isCoinObject
                  ? `${roundToTwoDecimalPlaces(
                      coin.price_change_percentage_24h
                    )}%`
                  : "N/A"}
              </TableCell>
              <TableCell className="text-right">
                {marketCap !== null
                  ? formatCurrency(marketCap, currency, 2, 0)
                  : "N/A"}
              </TableCell>
            </TableRow>
          );
        })}
        {loading &&
          Array.from({ length: 8 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell colSpan={6} className="text-center">
                <Skeleton className="w-full h-12" />
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
}
