import React from "react";

interface StepHeaderProps {
  icon: React.ReactNode;
  title: React.ReactNode | string;
  description?: string;
}

export function StepHeader({ icon, title, description }: StepHeaderProps) {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="bg-[#ced925]/10 text-[#ced925] flex aspect-square w-14 items-center justify-center rounded-full text-[32px]">
        {icon}
      </div>
      <div className="mt-5 flex flex-col items-center gap-2">
        <h1 className="font-semibold text-[24px] leading-[32px] tracking-[-0.48px] text-foreground">
          {title}
        </h1>
        {description && (
          <p className="max-w-[384px] text-center leading-[24px] text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
