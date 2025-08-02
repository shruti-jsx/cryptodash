import { useState, useEffect, useMemo } from "react";
import { LegendProps, Pie, PieChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useUserStore } from "@/stores/useUserStore";
import { genRandomHexColor } from "@/lib";
import { formatCurrency } from "@/lib";
import { DetailedCoin, PortfolioType } from "@/types";

const CustomChartLegendContent: React.FC<LegendProps> = ({ payload }) => {
  if (!payload) return null;

  return (
    <div className="flex items-center gap-3 pt-3 sm:justify-center">
      {payload.map((item) => (
        <div key={item.value} className="flex items-center gap-1.5">
          <div
            className="h-2 w-2 shrink-0 rounded-[2px]"
            style={{ backgroundColor: item.color }}
          />
          <span>{item.value}</span>
        </div>
      ))}
    </div>
  );
};

const getChartColor = (index: number): string => {
  if (index < 7) return `hsl(var(--chart-${index + 1}))`;
  return genRandomHexColor();
};

// Generate chart data using currency
const generateChartData = (
  portfolio: PortfolioType,
  currency: "usd" | "inr"
) => {
  if (portfolio.list.length <= 0) {
    return [
      {
        holding: "N/A",
        value: 1,
        fill: getChartColor(0),
      },
    ];
  }

  return portfolio.detailed.map((coin: DetailedCoin, index: number) => ({
    holding: coin.name,
    value: Math.trunc(coin.totalValue), // already currency adjusted
    formatted: formatCurrency(coin.totalValue, currency, 2, 0),
    fill: getChartColor(index),
  }));
};

const generateChartConfig = (
  portfolio: PortfolioType
): ChartConfig => {
  const config: ChartConfig = {
    coins: { label: "Coins" },
  };

  portfolio.detailed.forEach((coin: DetailedCoin, index: number) => {
    config[coin.name.toLowerCase()] = {
      label: coin.name,
      color: getChartColor(index),
    };
  });

  return config;
};

export function CustomPieChart() {
  const portfolio = useUserStore((state) => state.portfolio);
  const currency = useUserStore((state) => state.currency);
  const currentDate = new Date().toDateString();
  const [isLargeDisplay, setIsLargeDisplay] = useState(
    window.innerWidth >= 768
  );

  const chartData = useMemo(
    () => generateChartData(portfolio, currency),
    [portfolio, currency]
  );

  const chartConfig = useMemo(() => generateChartConfig(portfolio), [portfolio]);

  useEffect(() => {
    const handleResize = () => {
      setIsLargeDisplay(window.innerWidth >= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Card className="flex flex-col overflow-auto">
      <CardHeader className="items-center pb-0">
        <CardTitle>Holding Breakdown</CardTitle>
        <CardDescription>
          Measured in {currency.toUpperCase()}{" "}
          {currency === "usd" ? "($)" : "(₹)"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px] pb-0 [&_.recharts-pie-label-text]:fill-foreground min-w-[300px] md:min-w-[450px]"
        >
          <PieChart>
  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
  <Pie
    key={currency} // triggers re-render animation when currency changes
    isAnimationActive={true} // enables animation
    animationDuration={500} // optional: control duration
    data={chartData}
    dataKey="value"
    nameKey="holding"
    label={
      isLargeDisplay
        ? ({ payload, ...props }) => {
            return (
              <text
                x={props.x}
                y={props.y}
                textAnchor={props.textAnchor}
                dominantBaseline={props.dominantBaseline}
                fill="hsla(var(--foreground))"
              >
                {payload.formatted}
              </text>
            );
          }
        : false
    }
    labelLine={isLargeDisplay}
  />
  {!isLargeDisplay && (
    <ChartLegend
      payload={chartData.map((entry, index) => ({
        value:
          chartConfig[entry.holding.toLowerCase()]?.label ||
          entry.holding,
        type: "square",
        id: index.toString(),
        color: entry.fill,
      }))}
      content={<CustomChartLegendContent />}
    />
  )}
</PieChart>

        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="leading-none text-muted-foreground pt-5 text-center">
          Showing total portfolio breakdown as of, {currentDate}.
        </div>
      </CardFooter>
    </Card>
  );
}
