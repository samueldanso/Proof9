"use client";

import { ConnectButton } from "@/components/auth/connect";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Loader } from "@/components/ui/loader";
import { CREATOR_IMAGES } from "@/lib/constants";
import { motion } from "framer-motion";
import Image from "next/image";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  // Official Tomo pattern - direct wagmi usage
  const { address, isConnected } = useAccount();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Once client-side rendering is available, check if the user is authenticated
  useEffect(() => {
    if (isClient && isConnected && address) {
      redirect("/discover");
    }
  }, [isClient, isConnected, address]);

  // Show loading state while checking authentication
  if (!isClient) {
    return <Loader />;
  }

  return (
    <AuroraBackground className="min-h-screen">
      <div className="flex min-h-screen flex-col">
        <Header />

        <main className="flex-1 pt-20">
          <motion.div
            initial={{ opacity: 0.0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.3,
              duration: 0.8,
              ease: "easeInOut",
            }}
            className="relative z-10 flex h-full w-full flex-col items-center justify-center px-4"
          >
            {/* Hero section */}
            <div className="flex flex-col items-center text-center">
              {/* Headline */}
              <h1 className="max-w-4xl pt-20 font-bold text-4xl text-foreground tracking-tight md:text-5xl lg:text-6xl">
                Protect, license, and monetize your sound — all in one place
              </h1>

              {/* Subheadline */}
              <p className="mt-10 max-w-2xl text-lg text-muted-foreground">
                Proof9 is a sound rights platform where music creators protect their IP, license it
                for use, monetize their work, and connect with fans —
                <span className="font-bold text-foreground"> built on Story Protocol.</span>
              </p>

              {/* CTA Button */}
              <div className="mt-10 w-full max-w-xs">
                <ConnectButton label="Get Started" />
              </div>
            </div>

            {/* Creator showcase */}
            <div className="mt-16 mb-8 w-full">
              <div className="relative mx-auto flex h-[200px] w-full max-w-4xl flex-col gap-2 overflow-hidden">
                <div className="relative h-[180px] w-full overflow-hidden">
                  <div className="absolute top-0 left-0 z-10 h-full w-32 bg-gradient-to-r from-transparent via-background/20 to-transparent" />
                  <div className="absolute top-0 right-0 z-10 h-full w-32 bg-gradient-to-l from-transparent via-background/20 to-transparent" />
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
                          className="group relative h-[170px] min-w-[170px] flex-shrink-0 overflow-hidden rounded-3xl transition-all duration-300 hover:z-10 hover:scale-110"
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
                          className="group relative h-[170px] min-w-[170px] flex-shrink-0 overflow-hidden rounded-3xl transition-all duration-300 hover:z-10 hover:scale-110"
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
          </motion.div>
        </main>
      </div>
    </AuroraBackground>
  );
}
