// react
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
// ui
import CoinPriceCard from "./CoinPriceCard";
import ConverterCard from "./ConverterCard";
import HoldingsCard from "./HoldingsCard";
import TokenInfoCard from "./TokenInfoCard";
import { Skeleton } from "@/components/ui/skeleton";
// store
import { useUserStore } from "@/stores/useUserStore";
// utils
import { adaptToPortfolioCoinType, fetchPortfolioCoinData } from "@/lib";
// types
import { CoinDB, DetailedCoin } from "@/types";
import socket from "@/socket/socket";
import CoinDescriptionCard from "./CoinDescriptionCard";
import CoinChartCard from "./CoinChartCard";

interface PortfolioUpdateEvent {
  userId: string;
  portfolio: CoinDB[];
}

export default function CoinPanel() {
  const [isLoading, setIsLoading] = useState(false);
  const [coinData, setCoinData] = useState<DetailedCoin | null>(null);
  const user = useUserStore((state) => state.user);
  const portfolio = useUserStore((state) => state.portfolio);
  const accessToken = useUserStore((state) => state.accessToken);
  const location = useLocation();
  const locationPath = location.pathname.split("/");
  const coinId = locationPath[locationPath.length - 1];

  useEffect(() => {
    const initializeCoinData = async () => {
      setIsLoading(true);
      try {
        const coinInPortfolio = portfolio.detailed.find(({ id }) => id === coinId);

        if (coinInPortfolio) {
          setCoinData(coinInPortfolio);
          return;
        }

        const fetchedData = await fetchPortfolioCoinData([coinId], accessToken);
        if (!fetchedData || fetchedData.length === 0) throw new Error(`No data for ${coinId}`);
        setCoinData(adaptToPortfolioCoinType(fetchedData[0]));
      } catch (err) {
        console.error(`Error fetching coin data for ${coinId}: ${err}`);
      } finally {
        setIsLoading(false);
      }
    };

    initializeCoinData();
  }, [portfolio.detailed, accessToken, coinId]);

  useEffect(() => {
    const handlePortfolioUpdate = ({ userId, portfolio }: PortfolioUpdateEvent) => {
      if (user.userId === userId && coinData) {
        const updatedCoin = portfolio.find((coin) => coin.id === coinData.id);
        if (updatedCoin) {
          setCoinData((prevCoin) => {
            if (!prevCoin) return null;
            return {
              ...prevCoin,
              amount: updatedCoin.amount.toString(),
              totalValue: updatedCoin.amount * prevCoin.info.currentPrice,
            };
          });
        }
      }
    };

    socket.on("portfolioUpdated", handlePortfolioUpdate);
    return () => {
      socket.off("portfolioUpdated", handlePortfolioUpdate);
    };
  }, [user.userId, coinData]);

  if (isLoading || !coinData) {
    return (
      <section className="grid grid-cols-1 sm:grid-cols-1 gap-4 mb-6 p-2">
        <Skeleton className="w-full h-[150px] rounded-xl dark:bg-zinc-400" />
        <Skeleton className="w-full h-[150px] rounded-xl dark:bg-zinc-400" />
        <Skeleton className="w-full h-[300px] rounded-xl dark:bg-zinc-400" />
        <Skeleton className="w-full h-[200px] rounded-xl dark:bg-zinc-400" />
      </section>
    );
  }

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-2">
      {/* Price Card full width */}
      <CoinPriceCard
        coin={coinData}
        className="w-full md:col-span-2"
      />

      {/* Holdings and Converter stacked on small, side-by-side on md */}
      <HoldingsCard
        coin={coinData}
        className="w-full"
      />
      <ConverterCard
        coin={coinData}
        className="w-full"
      />

      {/* Token Info full width */}
      <TokenInfoCard
        coin={coinData}
        className="w-full md:col-span-2"
      />

      {/* Chart and Description full width */}
      {coinData && (
        <CoinChartCard
          symbol={coinData.info.symbol}
          className="w-full md:col-span-2"
        />
      )}

      {coinData.info.description && (
        <CoinDescriptionCard
          description={coinData.info.description}
          className="w-full md:col-span-2"
        />
      )}
    </section>
  );
}