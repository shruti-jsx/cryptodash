import { formatCurrency } from "@/lib";
import { useUserStore } from "@/stores/useUserStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TotalBalanceProps {
  totalBalance: number;
}

export default function TotalBalance({ totalBalance }: TotalBalanceProps) {
  const currency = useUserStore((state) => state.currency);

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap items-baseline justify-between gap-2 sm:gap-0 sm:flex-nowrap">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight">
          {formatCurrency(totalBalance, currency)}
        </span>
        <span className="text-xs text-muted-foreground">Across all assets</span>
      </CardContent>
    </Card>
  );
}
