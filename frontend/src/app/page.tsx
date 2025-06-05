"use client";

import { Login } from "@/components/auth/login";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { Loader } from "@/components/ui/loader";
import { CREATOR_IMAGES } from "@/lib/constants";
import { useTomoAuth } from "@/lib/tomo/use-tomo-auth";
import { motion } from "framer-motion";
import Image from "next/image";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const { user, isConnected, isLoading } = useTomoAuth();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Once client-side rendering is available, check if the user is authenticated
  useEffect(() => {
    if (isClient && !isLoading && isConnected && user) {
      redirect("/discover");
    }
  }, [isClient, user, isConnected, isLoading]);

  // Show loading state while checking authentication
  if (isLoading || !isClient) {
    return <Loader />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 pt-10">
        <div className="mx-auto flex h-full max-w-6xl flex-col justify-between p-4">
          {/* Hero section - Top to bottom layout with reduced spacing */}
          <div className="flex flex-col items-center py-10 pt-16 text-center">
            {/* Headline */}
            <h1 className="max-w-3xl font-bold text-4xl tracking-tighter md:text-5xl lg:text-6xl">
              Protect, license, and monetize your sound — all in one place
            </h1>

            {/* Subheadline - smaller with reduced margin */}
            <p className="mt-4 max-w-2xl text-base text-muted-foreground">
              Proof9 is a sound rights platform where creators protect their IP, license it for use,
              monetize their work, and connect with fans —
              <span className="font-bold">built on Story Protocol.</span>
            </p>

            {/* CTA Button */}
            <div className="mt-8 w-full max-w-xs">
              <Login label="Get Started" />
            </div>
          </div>

          {/* Creator showcase - visually varied arrangement */}
          <div className="mt-0 mb-0 w-full">
            <div className="relative mx-auto flex h-[200px] w-full max-w-4xl flex-col gap-2 overflow-hidden">
              <div className="relative h-[180px] w-full overflow-hidden">
                <div className="absolute top-0 left-0 z-10 h-full w-32 bg-gradient-to-r from-background to-transparent" />
                <div className="absolute top-0 right-0 z-10 h-full w-32 bg-gradient-to-l from-background to-transparent" />
                <div className="absolute top-0 left-0 w-full" style={{ display: "flex" }}>
                  <motion.div
                    className="flex w-full gap-4"
                    animate={{ x: ["-50%", "0%"] }}
                    transition={{
                      x: {
                        repeat: Number.POSITIVE_INFINITY,
                        repeatType: "loop",
                        duration: 40,
                        ease: "linear",
                      },
                    }}
                    style={{ display: "flex", whiteSpace: "nowrap" }}
                  >
                    {CREATOR_IMAGES.map((creator, index) => (
                      <div
                        key={`creator-top-first-${creator.id}-${index}`}
                        className="group relative h-[170px] min-w-[170px] flex-shrink-0 overflow-hidden rounded-3xl shadow-2xl transition-all duration-300 hover:z-10 hover:scale-110"
                      >
                        <Image
                          src={creator.image}
                          alt={creator.alt}
                          fill
                          sizes="170px"
                          className="object-cover"
                          priority={index === 0}
                        />
                      </div>
                    ))}
                    {CREATOR_IMAGES.map((creator, index) => (
                      <div
                        key={`creator-top-second-${creator.id}-${index}`}
                        className="group relative h-[170px] min-w-[170px] flex-shrink-0 overflow-hidden rounded-3xl shadow-2xl transition-all duration-300 hover:z-10 hover:scale-110"
                      >
                        <Image
                          src={creator.image}
                          alt={creator.alt}
                          fill
                          sizes="170px"
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </motion.div>
                </div>
              </div>
            </div>
          </div>

          <Footer />
        </div>
      </main>
    </div>
  );
}
