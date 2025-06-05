"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-background py-4">
      <div className="mx-auto max-w-6xl px-5">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex flex-wrap items-center justify-center gap-2 text-muted-foreground text-sm">
            <span className="font-semibold">@2025 Proof9</span>
            <span className="font-medium">|</span>
            <span className="font-medium text-muted-foreground text-sm">
              Built by{" "}
              <Link
                href="https://twitter.com/samueldans0"
                target="_blank"
                rel="noopener noreferrer"
                className="underline transition-colors hover:text-[#ced925]"
              >
                @samueldans0
              </Link>
            </span>
            <span className="font-medium">|</span>
            <Link
              href="https://github.com/believr-fun"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-muted-foreground text-sm underline transition-colors hover:text-[#ced925]"
            >
              Github
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
