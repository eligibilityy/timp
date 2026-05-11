"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Timer,
  History,
  BarChart3,
  Settings,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { SettingsModal } from "@/components/dashboard/settings-modal";
import { useTimerStore } from "@/store/timer-store";
import { useAutoHide } from "@/hooks/use-auto-hide";
import { useAppSounds } from "@/hooks/use-app-sounds";

const links = [
  { href: "/app", label: "Focus", icon: Timer },
  { href: "/history", label: "History", icon: History },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggle } = useTheme();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const timerStatus = useTimerStore((s) => s.status);
  const visible = useAutoHide(timerStatus === "running");
  const { click } = useAppSounds();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <>
      <nav
        className={cn(
          "fixed bottom-6 left-1/2 z-50 -translate-x-1/2 transition-opacity duration-300",
          visible ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
      >
        <div className="flex items-center gap-1 rounded-full border border-border/50 bg-muted-foreground/20 backdrop-blur-xl px-2 py-2">
          {links.map(({ href, label, icon: Icon }) => (
            <Tooltip key={href}>
              <TooltipTrigger
                render={<Link href={href} />}
                onClick={() => click()}
                className={cn(
                  "rounded-full p-2 transition-colors",
                  pathname === href
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                <Icon className="size-5" />
              </TooltipTrigger>
              <TooltipContent sideOffset={8}>{label}</TooltipContent>
            </Tooltip>
          ))}
          <div className="mx-1 h-4 w-px bg-border/50" />
          <Tooltip>
            <TooltipTrigger
              onClick={() => {
                click();
                setSettingsOpen(true);
              }}
              className="rounded-full p-2.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              <Settings className="size-4" />
            </TooltipTrigger>
            <TooltipContent>Settings</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              onClick={() => {
                click();
                toggle();
              }}
              className="rounded-full p-2.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              {theme === "light" ? (
                <Moon className="size-4" />
              ) : (
                <Sun className="size-4" />
              )}
            </TooltipTrigger>
            <TooltipContent>
              {theme === "light" ? "Dark mode" : "Light mode"}
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              onClick={() => {
                click();
                handleSignOut();
              }}
              className="rounded-full p-2.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              <LogOut className="size-4" />
            </TooltipTrigger>
            <TooltipContent>Sign out</TooltipContent>
          </Tooltip>
        </div>
      </nav>
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
