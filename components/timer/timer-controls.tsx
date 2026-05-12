"use client";

import { useTimerStore } from "@/store/timer-store";
import { Button } from "@/components/ui/button";
import { playSound } from "@/lib/play-sound";
import { Pause, Play, SkipForward, Square } from "lucide-react";
import { Calligraph } from "calligraph";
import { click, swoosh } from "@/.web-kits/crisp";

export function TimerControls() {
  const { status, pause, resume, skip, stop } = useTimerStore();

  return (
    <div className="flex items-center gap-3 h-10">
      {(status === "running" || status === "paused") && (
        <>
          <Button
            size="lg"
            variant={status === "running" ? "secondary" : undefined}
            onClick={() => { playSound(click); status === "running" ? pause() : resume(); }}
          >
            {status === "running" ? (
              <Pause className="size-4" />
            ) : (
              <Play className="size-4" />
            )}
            <Calligraph variant="text">
              {status === "running" ? "Pause" : "Resume"}
            </Calligraph>
          </Button>
          <Button size="lg" variant="ghost" onClick={() => { playSound(click); skip(); }}>
            <SkipForward className="size-4" />
          </Button>
          <Button
            size="lg"
            variant="destructive"
            onClick={() => { playSound(swoosh); stop(); }}
          >
            <Square className="mr-2 size-3.5" />
            Stop
          </Button>
        </>
      )}
    </div>
  );
}
