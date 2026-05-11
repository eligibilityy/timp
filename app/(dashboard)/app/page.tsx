"use client";

import { TimerDisplay } from "@/components/timer/timer-display";
import { TimerControls } from "@/components/timer/timer-controls";
import { TimerTicker } from "@/components/timer/timer-ticker";
import { SessionIntent } from "@/components/timer/session-intent";
import { ReflectionModal } from "@/components/session/reflection-modal";
import { useTimerStore } from "@/store/timer-store";
import { useAutoHide } from "@/hooks/use-auto-hide";

export default function DashboardPage() {
  const { status, sessionTitle } = useTimerStore();
  const uiVisible = useAutoHide(status === "running");

  const showTitle = status !== "idle" && status !== "completed" && sessionTitle;
  const showControls = status === "running" || status === "paused";

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        {/* Title - always in DOM when running, fades with visibility */}
        <p
          className="text-sm text-muted-foreground transition-opacity duration-200"
          style={{
            opacity: showTitle && uiVisible ? 1 : 0,
            visibility: showTitle ? "visible" : "hidden",
          }}
        >
          {sessionTitle || "\u00A0"}
        </p>

        <TimerTicker />
        <TimerDisplay focused={status === 'running' && !uiVisible} />
        <SessionIntent />

        {/* Controls - always in DOM when running, fades with visibility */}
        <div
          className="transition-opacity duration-200"
          style={{
            opacity: showControls && uiVisible ? 1 : 0,
            visibility: showControls ? "visible" : "hidden",
          }}
        >
          <TimerControls />
        </div>

        <ReflectionModal />
      </div>
    </div>
  );
}
