"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full py-4">
      <div className="mx-auto w-[95vw] max-w-4xl px-3">
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
            href="https://github.com/samueldanso/Proof9"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-muted-foreground text-sm underline transition-colors hover:text-[#ced925]"
          >
            Github
          </Link>
        </div>
      </div>
    </footer>
  );
}
