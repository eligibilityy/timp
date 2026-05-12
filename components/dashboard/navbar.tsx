"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Timer,
  History,
  BarChart3,
  Sun,
  Moon,
  Trophy,
  LogIn,
  Settings,
  LogOut,
  User,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTimerStore } from "@/store/timer-store";
import { useAutoHide } from "@/hooks/use-auto-hide";
import { useUser } from "@/hooks/use-user";
import { playSound } from "@/lib/play-sound";
import { click, expand, toggleOn } from "@/.web-kits/crisp";
import { Separator } from "../ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const links = [
  { href: "/app", label: "Focus", icon: Timer, guestOk: true },
  { href: "/history", label: "History", icon: History, guestOk: false },
  { href: "/analytics", label: "Analytics", icon: BarChart3, guestOk: false },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy, guestOk: false },
];

export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggle } = useTheme();
  const timerStatus = useTimerStore((s) => s.status);
  const visible = useAutoHide(timerStatus === "running");
  const { user } = useUser();
  const [profile, setProfile] = useState<{
    display_name: string | null;
    avatar_url: string | null;
    role: string | null;
  } | null>(null);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    const fetchProfile = () => {
      supabase
        .from("profiles")
        .select("display_name, avatar_url, role")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data) setProfile(data);
        });
    };
    fetchProfile();
    window.addEventListener("profile-updated", fetchProfile);
    return () => window.removeEventListener("profile-updated", fetchProfile);
  }, [user]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;
  const displayName =
    profile?.display_name || user?.user_metadata?.full_name || user?.email;

  return (
    <nav
      className={cn(
        "fixed bottom-6 left-1/2 z-50 -translate-x-1/2 transition-opacity duration-300",
        visible ? "opacity-100" : "opacity-0 pointer-events-none",
      )}
    >
      <div className="flex items-center gap-1 rounded-full border border-neutral-400/10 dark:border-white/10 bg-neutral-200/80 dark:bg-neutral-900/80 backdrop-blur-xl px-2 py-2">
        {links.map(({ href, label, icon: Icon, guestOk }) => {
          const disabled = !guestOk && !user;
          return (
            <Tooltip key={href}>
              {disabled ? (
                <TooltipTrigger
                  className={cn(
                    "rounded-full p-2 transition-colors text-muted-foreground/30 cursor-not-allowed",
                  )}
                >
                  <Icon className="size-5" />
                </TooltipTrigger>
              ) : (
                <TooltipTrigger
                  onClick={() => {
                    playSound(click);
                    router.push(href);
                  }}
                  className={cn(
                    "inline-flex items-center justify-center rounded-full p-2 transition-colors cursor-pointer",
                    pathname === href
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-secondary",
                  )}
                >
                  <Icon className="size-5" />
                </TooltipTrigger>
              )}
              <TooltipContent
                className="select-none pointer-events-none"
                sideOffset={8}
              >
                {disabled ? "Sign in to access" : label}
              </TooltipContent>
            </Tooltip>
          );
        })}
        <Separator
          orientation="vertical"
          className="mx-1 bg-neutral-400/10 dark:bg-white/10"
        />
        <Tooltip>
          <TooltipTrigger
            onClick={() => {
              playSound(toggleOn);
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
          <TooltipContent className="select-none pointer-events-none">
            {theme === "light" ? "Dark mode" : "Light mode"}
          </TooltipContent>
        </Tooltip>
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  onClick={() => playSound(expand)}
                  className="rounded-full cursor-pointer transition-opacity hover:opacity-80 outline-none p-0"
                >
                  <Avatar>
                    <AvatarImage src={avatarUrl} alt={displayName} />
                    <AvatarFallback>
                      {(displayName?.[0] ?? "?").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </button>
              }
            />

            <DropdownMenuContent side="top" align="start" sideOffset={12}>
              <div className="px-4 pt-3 pb-2">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={avatarUrl} alt={displayName} />
                    <AvatarFallback>
                      {(displayName?.[0] ?? "?").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-popover-foreground truncate flex items-center gap-1.5">
                      {displayName}
                      {profile?.role && (
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-primary">
                          {profile.role}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {user?.email}
                    </div>
                  </div>
                </div>
              </div>

              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuItem
                  render={
                    <Link
                      href="/settings"
                      className="flex items-center gap-2.5"
                    >
                      <User className="size-4" />
                      Profile
                    </Link>
                  }
                />
                <DropdownMenuItem
                  render={
                    <Link
                      href="/leaderboard"
                      className="flex items-center gap-2.5"
                    >
                      <Trophy className="size-4" />
                      Leaderboard
                    </Link>
                  }
                />
                <DropdownMenuItem
                  render={
                    <Link
                      href="/settings"
                      className="flex items-center gap-2.5"
                    >
                      <Settings className="size-4" />
                      Settings
                    </Link>
                  }
                />
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
                  <LogOut className="size-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Tooltip>
            <TooltipTrigger
              onClick={() => {
                playSound(click);
                router.push("/login");
              }}
              className="rounded-full p-2.5 text-muted-foreground transition-colors hover:text-foreground inline-flex items-center justify-center cursor-pointer"
            >
              <LogIn className="size-4" />
            </TooltipTrigger>
            <TooltipContent className="select-none pointer-events-none">
              Sign in
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </nav>
  );
}
