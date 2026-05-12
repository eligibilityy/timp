"use client";

import { useEffect, useRef, useState } from "react";
import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import { useTimerStore } from "@/store/timer-store";
import { useAutoHide } from "@/hooks/use-auto-hide";
import { playSound } from "@/lib/play-sound";
import { click } from "@/.web-kits/crisp";
import { cn } from "@/lib/utils";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";

function Clock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () =>
      setTime(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="text-sm text-muted-foreground tabular-nums">{time}</span>
  );
}

interface PageHeaderProps {
  title: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, children }: PageHeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const titleRef = useRef<HTMLDivElement>(null);
  const timerStatus = useTimerStore((s) => s.status);
  const visible = useAutoHide(timerStatus === "running");

  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div
        className={cn(
          "sticky top-0 z-40 transition-opacity duration-300",
          visible ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        style={{
          borderBottom: scrolled
            ? "0.5px solid oklch(0 0 0 / 0.1)"
            : "0.5px solid transparent",
          transition: "border-color 0.2s, opacity 0.3s",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ opacity: scrolled ? 1 : 0, transition: "opacity 0.2s" }}
        >
          <ProgressiveBlur position="top" height="100%" />
        </div>
        <div className="relative z-10 flex items-center justify-between px-4 py-3">
          <PopoverPrimitive.Root>
            <PopoverPrimitive.Trigger
              onClick={() => playSound(click)}
              className="text-sm font-semibold tracking-tight text-foreground hover:opacity-70 transition-opacity cursor-pointer"
            >
              timp
            </PopoverPrimitive.Trigger>
            <PopoverPrimitive.Portal>
              <PopoverPrimitive.Positioner
                side="bottom"
                align="start"
                sideOffset={8}
              >
                <PopoverPrimitive.Popup className="z-50 w-64 rounded-xl border border-border/50 bg-muted p-4 shadow-lg backdrop-blur-xl data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 origin-(--transform-origin)">
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-medium">timp</p>
                    <p className="text-xs text-muted-foreground">
                      A calm focus timer and reflection journal that visually
                      tracks meaningful work over time.
                    </p>
                    <div className="flex gap-3 pt-1 text-xs text-muted-foreground">
                      <a
                        href="https://yiliya.studio/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-foreground transition-colors"
                      >
                        Portfolio
                      </a>
                      <a
                        href="https://x.com/yiliya_iya"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-foreground transition-colors"
                      >
                        @yiliya_iya
                      </a>
                    </div>
                    <p className="text-[10px] text-muted-foreground/50 pt-1">
                      v0.1.0 · MIT License
                    </p>
                  </div>
                </PopoverPrimitive.Popup>
              </PopoverPrimitive.Positioner>
            </PopoverPrimitive.Portal>
          </PopoverPrimitive.Root>
          <span
            className="absolute left-1/2 -translate-x-1/2 text-sm font-medium"
            style={{ opacity: scrolled ? 1 : 0, transition: "opacity 0.2s" }}
          >
            {title}
          </span>
          <Clock />
        </div>
      </div>
      <div
        ref={titleRef}
        className="space-y-1"
        style={{ opacity: scrolled ? 0 : 1, transition: "opacity 0.2s" }}
      >
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {children}
      </div>
    </>
  );
}
