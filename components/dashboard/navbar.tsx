"use client";

import { useState, useEffect, useRef } from "react";
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
  const [visible, setVisible] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timerStatus !== 'running') {
      setVisible(true);
      return;
    }
    const hide = () => {
      timeoutRef.current = setTimeout(() => setVisible(false), 3000);
    };
    const show = () => {
      setVisible(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      hide();
    };
    hide();
    window.addEventListener('mousemove', show);
    window.addEventListener('touchstart', show);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      window.removeEventListener('mousemove', show);
      window.removeEventListener('touchstart', show);
    };
  }, [timerStatus]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <>
      <nav className={cn(
        "fixed bottom-6 left-1/2 z-50 -translate-x-1/2 transition-opacity duration-300",
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        <div className="flex items-center gap-1 rounded-full border border-border/50 bg-muted-foreground/10 px-2 py-2">
          {links.map(({ href, label, icon: Icon }) => (
            <Tooltip key={href}>
              <TooltipTrigger
                render={<Link href={href} />}
                className={cn(
                  "rounded-full p-2 transition-colors",
                  pathname === href
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                <Icon className="size-5" />
              </TooltipTrigger>
              <TooltipContent>{label}</TooltipContent>
            </Tooltip>
          ))}
          <div className="mx-1 h-4 w-px bg-border/50" />
          <Tooltip>
            <TooltipTrigger
              onClick={() => setSettingsOpen(true)}
              className="rounded-full p-2.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              <Settings className="size-4" />
            </TooltipTrigger>
            <TooltipContent>Settings</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              onClick={toggle}
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
              onClick={handleSignOut}
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
