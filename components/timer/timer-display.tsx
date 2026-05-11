"use client";

import { useTimerStore, type TimerMode } from "@/store/timer-store";
import { cn } from "@/lib/utils";
import { Calligraph } from "calligraph";

const modeLabels: Record<TimerMode, string> = {
  work: "Focus",
  shortBreak: "Short Break",
  longBreak: "Long Break",
};

const modeColors: Record<TimerMode, string> = {
  work: "text-foreground",
  shortBreak: "text-emerald-500",
  longBreak: "text-blue-500",
};

export function TimerDisplay({ focused = false }: { focused?: boolean }) {
  const { secondsRemaining, mode, currentCycle, settings, status } =
    useTimerStore();

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const time = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  const total = getDuration(mode, settings);
  const progress = total > 0 ? 1 - secondsRemaining / total : 0;
  const radius = 145;
  const size = 320;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div
      className="flex flex-col items-center gap-3 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
      style={{ transform: focused ? "scale(1.15)" : "scale(1)" }}
    >
      <div className="relative flex items-center justify-center">
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-muted/70"
          />
          {status !== "idle" && (
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className={cn(
                "transition-[stroke-dashoffset] duration-1000 ease-linear",
                modeColors[mode],
              )}
            />
          )}
        </svg>
        <div className="absolute flex flex-col items-center">
          <Calligraph
            variant="number"
            stagger={0.05}
            animation="smooth"
            className={cn(
              "text-6xl font-semibold tabular-nums tracking-tight text-center transition-colors mt-2",
              modeColors[mode],
            )}
          >
            {time}
          </Calligraph>
          <span className="mt-1 text-sm text-muted-foreground">
            {modeLabels[mode]}.
          </span>
        </div>
      </div>
      {status !== "idle" && (
        <p className="text-xs text-muted-foreground">Cycle {currentCycle}</p>
      )}
    </div>
  );
}

function getDuration(
  mode: TimerMode,
  settings: {
    workDuration: number;
    shortBreakDuration: number;
    longBreakDuration: number;
  },
) {
  switch (mode) {
    case "work":
      return settings.workDuration;
    case "shortBreak":
      return settings.shortBreakDuration;
    case "longBreak":
      return settings.longBreakDuration;
  }
}
