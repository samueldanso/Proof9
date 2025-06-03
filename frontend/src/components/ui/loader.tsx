"use client";

import Image from "next/image";

export function Loader() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <div className="animate-pulse">
        <Image src="/icon.svg" alt="Loading..." width={56} height={56} priority />
      </div>
    </div>
  );
}
