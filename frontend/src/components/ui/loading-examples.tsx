"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useState } from "react";

export function LoadingExamples() {
  const [isLoading, setIsLoading] = useState(false);

  const simulateLoading = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>LoadingSpinner Component</CardTitle>
          <CardDescription>A reusable loading spinner with different size variants</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-start gap-8">
            <div className="flex flex-col items-center gap-2">
              <LoadingSpinner size="xs" />
              <span className="text-muted-foreground text-sm">xs</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <LoadingSpinner size="sm" />
              <span className="text-muted-foreground text-sm">sm</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <LoadingSpinner size="md" />
              <span className="text-muted-foreground text-sm">md</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <LoadingSpinner size="lg" />
              <span className="text-muted-foreground text-sm">lg</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <LoadingSpinner size="md" color="text-destructive" />
              <span className="text-muted-foreground text-sm">Custom color</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Button with Loading States</CardTitle>
          <CardDescription>
            Buttons that handle loading states with the LoadingSpinner component
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col gap-2">
              <Button isLoading={isLoading} onClick={simulateLoading}>
                {isLoading ? "Loading..." : "Default Button"}
              </Button>
              <span className="text-muted-foreground text-sm">Default variant</span>
            </div>

            <div className="flex flex-col gap-2">
              <Button variant="secondary" isLoading={isLoading} onClick={simulateLoading}>
                {isLoading ? "Loading..." : "Secondary Button"}
              </Button>
              <span className="text-muted-foreground text-sm">Secondary variant</span>
            </div>

            <div className="flex flex-col gap-2">
              <Button variant="destructive" isLoading={isLoading} onClick={simulateLoading}>
                {isLoading ? "Loading..." : "Destructive Button"}
              </Button>
              <span className="text-muted-foreground text-sm">Destructive variant</span>
            </div>

            <div className="flex flex-col gap-2">
              <Button variant="outline" isLoading={isLoading} onClick={simulateLoading}>
                {isLoading ? "Loading..." : "Outline Button"}
              </Button>
              <span className="text-muted-foreground text-sm">Outline variant</span>
            </div>

            <div className="flex flex-col gap-2">
              <Button size="sm" isLoading={isLoading} spinnerSize="xs" onClick={simulateLoading}>
                {isLoading ? "Loading..." : "Small Button"}
              </Button>
              <span className="text-muted-foreground text-sm">Small size with xs spinner</span>
            </div>

            <div className="flex flex-col gap-2">
              <Button size="lg" isLoading={isLoading} spinnerSize="sm" onClick={simulateLoading}>
                {isLoading ? "Loading..." : "Large Button"}
              </Button>
              <span className="text-muted-foreground text-sm">Large size with sm spinner</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
