"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="top-center"
      toastOptions={{
        className:
          "!rounded-full !px-4 !py-2 !text-sm !font-medium !shadow-lg !border-0 !bg-secondary !text-foreground",
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
  )
}

export { Toaster }
