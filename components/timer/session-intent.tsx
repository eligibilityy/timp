"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { TagSelector } from "@/components/session/tag-selector";
import { useTimerStore } from "@/store/timer-store";
import { useAppSounds } from "@/hooks/use-app-sounds";

export function SessionIntent() {
  const { status, setIntent, start } = useTimerStore();
  const { start: playStart } = useAppSounds();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [tagIds, setTagIds] = useState<string[]>([]);

  if (status !== "idle") return null;

  const handleBegin = () => {
    setIntent(title, tagIds);
    start();
    playStart();
    setOpen(false);
    setTitle("");
    setTagIds([]);
  };

  return (
    <>
      <Button size="lg" onClick={() => setOpen(true)}>
        Start Focus
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] flex items-center justify-center backdrop-blur-xl bg-background/70"
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center gap-6 w-full max-w-sm px-6"
            >
              <h2 className="text-2xl font-medium">What are you working on?</h2>
              <input
                type="text"
                placeholder="e.g. Building onboarding UI"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleBegin()}
                autoFocus
                className="w-full bg-transparent border-b border-border/50 pb-2 text-center text-lg outline-none placeholder:text-muted-foreground/50 focus:border-foreground/30 transition-colors"
              />
              <TagSelector selected={tagIds} onChange={setTagIds} />
              <div className="flex flex-col items-center gap-3 w-full pt-2">
                <Button onClick={handleBegin} size="lg" className="w-full">
                  Begin
                </Button>
                <button
                  onClick={() => setOpen(false)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
