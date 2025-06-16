import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle } from "lucide-react";

interface VerificationBadgeProps {
  verified?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  showText?: boolean;
}

export function VerificationBadge({
  verified = false,
  size = "md",
  className,
  showText = false,
}: VerificationBadgeProps) {
  if (!verified) return null;

  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  if (showText) {
    return (
      <Badge
        variant="secondary"
        className={cn(
          "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400",
          textSizeClasses[size],
          className,
        )}
      >
        <CheckCircle className={cn("mr-1", sizeClasses[size])} />
        Verified
      </Badge>
    );
  }

  return <CheckCircle className={cn("fill-current text-blue-500", sizeClasses[size], className)} />;
}
