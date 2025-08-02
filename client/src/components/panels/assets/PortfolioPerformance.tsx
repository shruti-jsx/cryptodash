import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";
import BasicChart from "@/charts/BasicChart";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchPortfolioValues, sortDataByTimestamp } from "@/lib/portfolioUtils";
import { useUserStore } from "@/stores/useUserStore";

interface ChartPoint {
  timestamp: string; // <-- match expected prop
  value: number;
}

export default function PortfolioPerformance() {
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const userId = useUserStore((state) => state.user?.userId);
  const accessToken = useUserStore((state) => state.accessToken) ?? "";
  const currency = useUserStore((state) => state.currency);
  

  useEffect(() => {
  const loadPortfolioData = async () => {
    if (!userId || !accessToken) {
      console.warn("Missing userId or accessToken");
      setIsLoading(false);
      return;
    }

    try {
      const data = await fetchPortfolioValues(accessToken, currency);
      console.log("Fetched portfolio values:", data);

      if (!data || data.length === 0) {
        console.warn("No portfolio data available.");
        setIsLoading(false);
        return;
      }

      const sorted = sortDataByTimestamp(data);
      setChartData(sorted); // ✅ sorted must contain timestamp + value
    } catch (err) {
      console.error("Failed to fetch portfolio performance:", err);
    } finally {
      setIsLoading(false);
    }
  };

  loadPortfolioData();
}, [userId, accessToken, currency]); // ✅ Add currency here


  return (
    <Card className="border-t-2 border-black p-6 w-full">
      <CardHeader>
        <CardTitle className="mb-4">Portfolio Performance</CardTitle>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <Skeleton className="w-full h-[300px] rounded-lg" />
        ) : chartData.length === 0 ? (
          <p className="text-center text-muted-foreground">No portfolio performance data available.</p>
        ) : (
          <BasicChart data={chartData} />
        )}
      </CardContent>
    </Card>
  );
}
