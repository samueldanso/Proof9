"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  className?: string;
  variant?: "full" | "icon";
}

export function Logo({ className = "", variant = "full" }: LogoProps) {
  const { resolvedTheme } = useTheme();

  const getLogoSrc = () => {
    if (variant === "icon") {
      return "/icon.svg";
    }
    return resolvedTheme === "dark" ? "/logo-dark.svg" : "/logo-light.svg";
  };

  const logoSrc = getLogoSrc();

  return (
    <Link href="/" className={className}>
      <Image
        src={logoSrc}
        alt="Believr Logo"
        width={variant === "icon" ? 32 : 114}
        height={variant === "icon" ? 32 : 25.1}
        priority
        className={variant === "icon" ? "h-9 w-9" : "h-7 w-auto"}
      />
    </Link>
  );
}
