"use client";

import Link from "next/link";

interface LogoProps {
  className?: string;
  variant?: "full" | "icon";
}

export function Logo({ className = "", variant = "full" }: LogoProps) {
  if (variant === "icon") {
    return (
      <Link href="/" className={`${className} flex items-center`}>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ced925]">
          <span className="font-bold text-black text-sm">P9</span>
        </div>
      </Link>
    );
  }

  return (
    <Link href="/" className={`${className} flex items-center gap-3`}>
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ced925]">
        <span className="font-bold text-black text-sm">P9</span>
      </div>
      <span className="font-bold text-white text-xl">Proof9</span>
    </Link>
  );
}
