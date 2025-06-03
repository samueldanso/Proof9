"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-background py-4">
      <div className="mx-auto max-w-6xl px-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-base text-muted-foreground">
              <span className="font-semibold">@2025 Believr.fun</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="font-medium text-muted-foreground text-sm">
              Built by{" "}
              <Link
                href="https://twitter.com/samueldans0"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-[#00A8FF]"
              >
                @samueldans0
              </Link>
            </span>

            <Link
              href="https://twitter.com/believrdotfun"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-muted-foreground text-sm transition-colors hover:text-[#00A8FF]"
            >
              X
            </Link>

            <Link
              href="https://github.com/believr-fun"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-muted-foreground text-sm transition-colors hover:text-[#00A8FF]"
            >
              Github
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
