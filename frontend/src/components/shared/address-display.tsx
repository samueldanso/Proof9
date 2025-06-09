"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AddressDisplayProps {
  address: string;
  className?: string;
  showCopyButton?: boolean;
  shortened?: boolean;
}

export function AddressDisplay({
  address,
  className,
  showCopyButton = true,
  shortened = true,
}: AddressDisplayProps) {
  const [copied, setCopied] = useState(false);

  const displayAddress = shortened
    ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
    : address;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      toast.success("Address copied to clipboard");

      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy address");
    }
  };

  return (
    <div className={cn("flex items-center gap-2 group", className)}>
      <span
        className="font-mono text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
        title={address}
        onClick={handleCopy}
      >
        {displayAddress}
      </span>

      {showCopyButton && (
        <button
          onClick={handleCopy}
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-accent rounded-sm"
          title="Copy address"
        >
          {copied ? (
            <Check className="h-3 w-3 text-green-500" />
          ) : (
            <Copy className="h-3 w-3 text-muted-foreground hover:text-foreground" />
          )}
        </button>
      )}
    </div>
  );
}
