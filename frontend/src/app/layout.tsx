import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "@/styles/globals.css";
import { Web3Provider } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
});

export const metadata: Metadata = {
  title: " Proof9 – Protect, License & Monetize Your Sound",
  description:
    "Proof9 is a sound rights platform where creators protect their IP, license it for use, monetize their work, and connect with fans.",
  icons: [{ rel: "icon", url: "/favicon.svg" }],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${plusJakartaSans.variable} font-sans`}
    >
      <body className="min-h-screen bg-background antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <Web3Provider>{children}</Web3Provider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
