"use client";

import Link from "next/link";

interface LogoProps {
  className?: string;
  variant?: "full" | "icon" | "sidebar";
}

export function Logo({ className = "", variant = "full" }: LogoProps) {
  const iconSvg = (
    <svg
      width="40"
      height="40"
      viewBox="0 0 410 412"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={variant === "sidebar" ? "h-8 w-8" : "h-10 w-10"}
    >
      <path
        d="M0 205.006C0 91.7845 91.7816 0 205 0C318.218 0 410 91.7845 410 205.006C410 318.228 318.218 410.013 205 410.013C91.7816 410.013 0 318.228 0 205.006Z"
        fill="#CED925"
      />
      <path
        d="M267.881 53.8589C179.036 18.3199 123.347 73.8174 106.609 106.008H224.424C288.398 112.891 280.167 172.966 270.376 196.787L167.246 407.695L227.851 412L332.583 210.308C360.395 121.46 301.037 68.9887 267.881 53.8589Z"
        fill="#161414"
      />
      <path
        d="M97.2541 162.576C93.9578 155.787 98.612 147.826 106.145 147.368L241.545 139.141C250.002 138.627 255.613 147.754 251.337 155.068L175.187 285.326C170.911 292.64 160.205 292.228 156.505 284.606L97.2541 162.576Z"
        fill="#161414"
      />
      <path
        d="M190.524 188.443C195.047 206.37 193.561 220.991 187.204 221.099C180.847 221.208 172.026 206.764 167.502 188.837C162.978 170.91 164.464 156.289 170.822 156.18C177.179 156.071 186 170.516 190.524 188.443Z"
        fill="#CED925"
      />
      <path
        d="M164.12 190.22C166.171 200.061 163.934 207.98 159.124 207.908C154.314 207.836 148.752 199.8 146.702 189.959C144.651 180.118 146.888 172.199 151.698 172.271C156.508 172.343 162.069 180.379 164.12 190.22Z"
        fill="#CED925"
      />
      <path
        d="M206.114 186.282C207.214 190.642 205.145 194.228 201.492 194.29C197.84 194.353 193.987 190.869 192.886 186.508C191.786 182.148 193.855 178.563 197.508 178.501C201.161 178.438 205.014 181.922 206.114 186.282Z"
        fill="#CED925"
      />
    </svg>
  );

  if (variant === "icon") {
    return (
      <Link href="/" className={`${className} flex items-center`}>
        {iconSvg}
      </Link>
    );
  }

  if (variant === "sidebar") {
    return (
      <Link href="/" className={`${className} flex items-center gap-2`}>
        {iconSvg}
        <span className="font-bold text-foreground text-lg">Proof9</span>
      </Link>
    );
  }

  return (
    <Link href="/" className={`${className} flex items-center gap-3`}>
      {iconSvg}
      <span className="font-bold text-foreground text-xl">Proof9</span>
    </Link>
  );
}
