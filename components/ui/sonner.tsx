"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="bottom-right"
      closeButton
      toastOptions={{
        className:
          "!rounded-full !px-5 !py-3 !text-sm !font-medium !shadow-lg !border-0 !bg-neutral-900 !text-foreground !font-[family-name:var(--font-open-runde)]",
      }}
      style={
        {
          "--normal-bg": "var(--secondary)",
          "--normal-text": "var(--foreground)",
          "--normal-border": "transparent",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
