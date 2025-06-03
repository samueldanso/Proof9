"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "xs" | "sm" | "md" | "lg";
  color?: string;
}

export function LoadingSpinner({
  size = "md",
  color = "text-primary",
  className,
  ...props
}: LoadingSpinnerProps) {
  const sizeClasses = {
    xs: "size-3",
    sm: "size-4",
    md: "size-6",
    lg: "size-12",
  };

  return (
    <div {...props} className={cn("flex items-center justify-center", className)}>
      <Loader2 className={cn("animate-spin", sizeClasses[size], color)} />
    </div>
  );
}
