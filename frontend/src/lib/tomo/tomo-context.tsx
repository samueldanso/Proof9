"use client";

import { ReactNode, createContext, useContext } from "react";
import { AuthUser, useTomoAuth } from "./use-tomo-auth";

interface TomoContextType {
  user: AuthUser | undefined;
  isConnected: boolean;
  isLoading: boolean;
  connect: () => void;
  disconnect: () => void;
  signMessage: (message: string) => Promise<string>;
}

const TomoContext = createContext<TomoContextType | undefined>(undefined);

export function TomoProvider({ children }: { children: ReactNode }) {
  const auth = useTomoAuth();

  // Ensure connect is always a function even if undefined from useTomoAuth
  const contextValue: TomoContextType = {
    ...auth,
    connect: auth.connect || (() => console.warn("Connect modal not available")),
  };

  return <TomoContext.Provider value={contextValue}>{children}</TomoContext.Provider>;
}

export function useTomo() {
  const context = useContext(TomoContext);

  if (context === undefined) {
    throw new Error("useTomo must be used within a TomoProvider");
  }

  return context;
}
