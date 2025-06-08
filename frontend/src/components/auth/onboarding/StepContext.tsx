import { createContext, useCallback, useContext, useState } from "react";

interface StepContextProps {
  stepIndex: number;
  direction: "forward" | "backward";
  next: () => void;
  prev: () => void;
  setStepIndex: (index: number) => void;
  totalSteps: number;
}

const StepContext = createContext<StepContextProps | null>(null);

interface StepProviderProps {
  children: React.ReactNode;
  totalSteps?: number;
}

export const StepProvider = ({
  children,
  totalSteps = 2,
}: StepProviderProps) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");

  const next = useCallback(() => {
    setDirection("forward");
    setStepIndex((prev) => (prev < totalSteps - 1 ? prev + 1 : prev));
  }, [totalSteps]);

  const prev = useCallback(() => {
    setDirection("backward");
    setStepIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const goToStep = useCallback(
    (index: number) => {
      if (index < stepIndex) {
        setDirection("backward");
      } else if (index > stepIndex) {
        setDirection("forward");
      }
      setStepIndex(Math.max(0, Math.min(index, totalSteps - 1)));
    },
    [stepIndex, totalSteps]
  );

  return (
    <StepContext.Provider
      value={{
        stepIndex,
        direction,
        next,
        prev,
        setStepIndex: goToStep,
        totalSteps,
      }}
    >
      {children}
    </StepContext.Provider>
  );
};

export const useStep = () => {
  const context = useContext(StepContext);
  if (!context) throw new Error("useStep must be used within StepProvider");
  return context;
};
