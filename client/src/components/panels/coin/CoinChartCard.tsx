import { useEffect, useRef } from "react";
import { Card, CardTitle, CardContent } from "@/components/ui/card";

interface Props {
  symbol: string;
  className?: string;
}

export default function CoinChartCard({ symbol, className = "" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;

    script.onload = () => {
      if ((window as any).TradingView) {
        new (window as any).TradingView.widget({
          container_id: `tv_chart_container_${symbol}`,
          symbol: `BINANCE:${symbol.toUpperCase()}USDT`,
          interval: "D",
          theme: "dark",
          style: "1",
          locale: "en",
          toolbar_bg: "#131722",
          enable_publishing: false,
          allow_symbol_change: false,
          width: "100%",
          height: 500,
        });
      }
    };

    containerRef.current?.appendChild(script);
  }, [symbol]);

  return (
    <Card className={`border-t-2 border-black p-6 ${className}`}>
      <CardTitle className="mb-6">Price Chart</CardTitle>
      <CardContent>
        <div id={`tv_chart_container_${symbol}`} className="w-full h-[500px]" ref={containerRef} />
      </CardContent>
    </Card>
  );
}
