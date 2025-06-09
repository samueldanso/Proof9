import React from "react";

interface StepHeaderProps {
  icon: React.ReactNode;
  title: React.ReactNode | string;
  description?: string;
}

export function StepHeader({ icon, title, description }: StepHeaderProps) {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex aspect-square w-14 items-center justify-center rounded-full bg-[#ced925]/10 text-[#ced925] text-[32px]">
        {icon}
      </div>
      <div className="mt-5 flex flex-col items-center gap-2">
        <h1 className="font-semibold text-[24px] text-foreground leading-[32px] tracking-[-0.48px]">
          {title}
        </h1>
        {description && (
          <p className="max-w-[384px] text-center text-muted-foreground leading-[24px]">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
