"use client";

import { Button } from "@/components/ui/button";
import { DialogTrigger } from "@/components/ui/dialog";
import { useAuthenticatedUser } from "@lens-protocol/react";
import { CircleNotch } from "@phosphor-icons/react";
import { ConnectKitButton } from "connectkit";
import { useState } from "react";
import { AccountSelector } from "./account-selector";

interface LoginProps {
  variant?: "default" | "header";
  label?: string;
}

export function Login({ variant = "default", label = "Get Started" }: LoginProps) {
  const [showAccountSelector, setShowAccountSelector] = useState(false);
  const { data: authenticatedUser, loading: authUserLoading } = useAuthenticatedUser();

  // Apply different styles based on variant
  const containerClasses = variant === "header" ? "" : "mb-2 space-y-2 p-2";

  const buttonClasses = variant === "header" ? "" : "w-full";

  return (
    <div className={containerClasses}>
      <ConnectKitButton.Custom>
        {({
          isConnected: isWalletConnected,
          show,
          truncatedAddress,
          ensName,
          chain,
          isConnecting,
        }) => {
          const connectKitDisplayName = ensName ?? truncatedAddress;

          if (!isWalletConnected) {
            return (
              <>
                <Button onClick={show} className={buttonClasses} disabled={isConnecting}>
                  {isConnecting ? (
                    <>
                      <CircleNotch className="mr-2 size-4 animate-spin" weight="bold" />
                      Connecting...
                    </>
                  ) : (
                    label
                  )}
                </Button>
              </>
            );
          }

          if (isWalletConnected && !authenticatedUser) {
            return (
              <AccountSelector
                open={showAccountSelector}
                onOpenChange={setShowAccountSelector}
                trigger={
                  <DialogTrigger asChild>
                    <Button className={buttonClasses} disabled={authUserLoading}>
                      {authUserLoading ? (
                        <>
                          <CircleNotch className="mr-2 size-4 animate-spin" weight="bold" />
                          Connecting...
                        </>
                      ) : (
                        "Sign in with Lens"
                      )}
                    </Button>
                  </DialogTrigger>
                }
              />
            );
          }

          if (isWalletConnected && authenticatedUser) {
            const displayIdentity = connectKitDisplayName ?? "...";
            return (
              <div className={`flex items-center justify-between gap-2 text-sm ${buttonClasses}`}>
                <span className="truncate text-muted-foreground" title={authenticatedUser.address}>
                  Signed in as:{" "}
                  <span className="font-semibold text-primary">{displayIdentity}</span>
                </span>
              </div>
            );
          }

          return (
            <p className="flex items-center text-muted-foreground text-xs">
              <CircleNotch className="mr-2 size-3 animate-spin" weight="bold" />
              Checking status...
            </p>
          );
        }}
      </ConnectKitButton.Custom>
    </div>
  );
}
