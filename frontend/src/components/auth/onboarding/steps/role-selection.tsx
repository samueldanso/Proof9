"use client";

import { Button } from "@/components/ui/button";
import { Heart, Music, Sparkles } from "lucide-react";
import { useStep } from "../step-context";
import { StepHeader } from "../step-header";

export function RoleSelection() {
  const { next } = useStep();

  const handleRoleSelect = (role: "creator" | "fan") => {
    next();
  };

  return (
    <>
      <StepHeader
        icon={<Sparkles />}
        title="Let's get you started"
        description="How would you like to start? You can always become a sound creator later."
      />

      <div className="flex w-full max-w-[400px] flex-col gap-4 px-6">
        {/* Creator Option */}
        <Button
          onClick={() => handleRoleSelect("creator")}
          variant="outline"
          className="group h-auto w-full border-2 border-[#ced925]/30 bg-[#ced925]/5 p-6 text-left transition-all hover:border-[#ced925]/50 hover:bg-[#ced925]/10"
        >
          <div className="flex w-full items-start gap-4">
            <div className="flex size-12 flex-shrink-0 items-center justify-center rounded-full bg-[#ced925]/10 text-[#ced925] transition-colors group-hover:bg-[#ced925]/20">
              <Music className="size-6" />
            </div>
            <div className="min-w-0 flex-1 overflow-hidden text-left">
              <h3 className="break-words font-semibold text-foreground text-lg">
                Become a Creator
              </h3>
              <p className="break-words text-muted-foreground text-sm leading-relaxed">
                Upload your music, protect your IP, license your sound, and earn royalties.
              </p>
            </div>
          </div>
        </Button>

        {/* Fan/Licensee Option */}
        <Button
          onClick={() => handleRoleSelect("fan")}
          variant="outline"
          className="group h-auto w-full border-2 border-muted-foreground/20 p-6 text-left transition-all hover:border-[#ced925]/50 hover:bg-[#ced925]/5"
        >
          <div className="flex w-full items-start gap-4">
            <div className="flex size-12 flex-shrink-0 items-center justify-center rounded-full bg-[#ced925]/10 text-[#ced925] transition-colors group-hover:bg-[#ced925]/20">
              <Heart className="size-6" />
            </div>
            <div className="min-w-0 flex-1 overflow-hidden text-left">
              <h3 className="break-words font-semibold text-foreground text-lg">
                Continue as Licensee/Fan
              </h3>
              <p className="break-words text-muted-foreground text-sm leading-relaxed">
                Discover new sounds, license music for your projects, and support artists.
              </p>
            </div>
          </div>
        </Button>
      </div>
    </>
  );
}
