import { cn } from "@/lib/utils";

type MoneyValueProps = {
  value: number;
  showSign?: boolean;
  className?: string;
};

export function MoneyValue({ value, showSign = false, className }: MoneyValueProps) {
  const isPositive = value > 0;
  const isNegative = value < 0;
  const formattedValue = Math.abs(value).toFixed(2);
  
  return (
    <span 
      className={cn(
        "font-['proxima-nova',_sans-serif] text-[14px] font-bold tracking-widest",
        {
          "text-green-600 dark:text-green-400": showSign && isPositive,
          "text-red-600 dark:text-red-400": showSign && isNegative,
        },
        className
      )}
    >
      {showSign && isPositive && "+"}
      {isNegative && "-"}
      ₹{formattedValue}
    </span>
  );
} 