"use client";

import { AnimatePresence, motion } from "framer-motion";
import { StepProvider, useStep } from "./step-context";
import { ProfileSetup } from "./steps/profile-setup";

// Single step for simplicity - just profile setup
const steps = [ProfileSetup];

const variants = {
  enter: (direction: string) => ({
    x: direction === "forward" ? 120 : -120,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: string) => ({
    x: direction === "forward" ? -120 : 120,
    opacity: 0,
  }),
};

function StepsRenderer() {
  const { stepIndex, direction } = useStep();
  const StepComponent = steps[stepIndex];

  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center bg-background">
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          className="flex h-fit w-[400px] flex-col items-center justify-center gap-6 overflow-visible px-4"
          key={stepIndex}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <StepComponent />
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-6 flex items-center gap-2 text-[13px] leading-[16px] text-muted-foreground">
        <p>© 2025 Proof9</p>
        <p className="font-bold text-muted-foreground/40">·</p>
        <p>Protect, License & Monetize Your Sound</p>
      </div>
    </div>
  );
}

export function Onboarding() {
  return (
    <StepProvider totalSteps={1}>
      <StepsRenderer />
    </StepProvider>
  );
}
