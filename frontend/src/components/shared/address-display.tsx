"use client";

import { cn } from "@/lib/utils";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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
    <div className={cn("group flex items-center gap-2", className)}>
      <span
        className="cursor-pointer font-mono text-muted-foreground transition-colors hover:text-foreground"
        title={address}
        onClick={handleCopy}
      >
        {displayAddress}
      </span>

      {showCopyButton && (
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-sm p-1 opacity-0 transition-opacity duration-200 hover:bg-accent group-hover:opacity-100"
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
