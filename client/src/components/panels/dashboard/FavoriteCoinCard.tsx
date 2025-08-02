import { useNavigate } from "react-router-dom";
import SparkLineChart from "@/charts/SparkLineChart";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency, roundToTwoDecimalPlaces } from "@/lib";
import { DetailedCoin } from "@/types";
import { useUserStore } from "@/stores/useUserStore";

interface FavoriteCoinCardProps {
  portfolioCoin: DetailedCoin;
}

export default function FavoriteCoinCard({
  portfolioCoin,
}: FavoriteCoinCardProps) {
  const currency = useUserStore((state) => state.currency);
  const navigate = useNavigate();

  const coinPrice = portfolioCoin.info.currentPrice;
  const underTwoDecimals = coinPrice < 0.01;

  const handleClick = () => {
    navigate(`/app/coin/${portfolioCoin.id.toLowerCase()}`, {
      state: { coin: portfolioCoin },
    });
  };

  return (
    <Card onClick={handleClick} className="cursor-pointer hover:shadow-md transition">
      <CardHeader>
        <CardTitle className="z-50">{portfolioCoin.name}</CardTitle>
        <CardDescription className="z-50">
          {portfolioCoin.info.symbol.toUpperCase()}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-between items-center py-0 px-6">
        <p className="flex text-black dark:text-white text-3xl z-50">
          {underTwoDecimals
            ? formatCurrency(coinPrice, currency, 6)
            : formatCurrency(coinPrice, currency, 2)}
        </p>
        <span
          className={
            portfolioCoin.info.price_change_percentage_7d < 0
              ? "flex justify-between text-red-600"
              : "flex justify-between text-green-600"
          }
        >
          {roundToTwoDecimalPlaces(
            portfolioCoin.info.price_change_percentage_7d
          ) + "%"}
        </span>
      </CardContent>
      <CardFooter className="flex justify-center p-0 overflow-hidden">
        <SparkLineChart
          prices={portfolioCoin.info.sparkline}
          width="270px"
          height="100px"
          className="bottom-0 z-0 pointer-events-none"
        />
      </CardFooter>
    </Card>
  );
}
