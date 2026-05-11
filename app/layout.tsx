import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";

const openRunde = localFont({
  src: [
    { path: "../public/fonts/OpenRunde-Regular.woff2", weight: "400" },
    { path: "../public/fonts/OpenRunde-Medium.woff2", weight: "500" },
    { path: "../public/fonts/OpenRunde-Semibold.woff2", weight: "600" },
    { path: "../public/fonts/OpenRunde-Bold.woff2", weight: "700" },
  ],
  variable: "--font-open-runde",
});

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "timp — focus timer",
  description: "A calm focus timer + reflection journal that visually tracks meaningful work over time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full",
        "antialiased",
        openRunde.variable,
        "font-sans",
        inter.variable,
      )}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
