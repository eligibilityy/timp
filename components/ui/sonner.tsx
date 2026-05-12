"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="bottom-right"
      className="font-(family-name:--font-open-runde)!"
      toastOptions={{
        classNames: {
          toast:
            "!rounded-full !px-5 !py-3 !border !border-border !bg-muted !text-foreground !font-medium !text-sm",
          title: "!text-foreground !font-medium",
          description: "!text-muted-foreground",
          actionButton: "!bg-foreground !text-background",
          cancelButton: "!bg-muted !text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
