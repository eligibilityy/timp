"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { playSound } from "@/lib/play-sound";
import { TagSelector } from "@/components/session/tag-selector";
import { useTimerStore } from "@/store/timer-store";
import { defineSound } from "@web-kits/audio";
import { pageEnter, pageExit, success } from "@/.web-kits/crisp";

export function SessionIntent() {
  const { status, setIntent, start } = useTimerStore();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [tagIds, setTagIds] = useState<string[]>([]);

  const handleBegin = useCallback(() => {
    setIntent(title, tagIds);
    start();
    setOpen(false);
    setTitle("");
    setTagIds([]);
  }, [title, tagIds, setIntent, start]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        defineSound(pageExit)();
        setOpen(false);
      }

      if (e.key === "Enter") {
        defineSound(success)();
        handleBegin();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, handleBegin]);

  if (status !== "idle") return null;

  return (
    <>
      <Button
        size="lg"
        className="text-lg p-6"
        onClick={() => { playSound(pageEnter); setOpen(true); }}
      >
        Start Focus
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-60 flex items-center justify-center backdrop-blur-xl bg-background/70"
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ type: "spring", duration: 0.4, bounce: 0 }}
              className="flex flex-col items-center gap-6 w-full max-w-sm px-6"
            >
              <motion.h2
                initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ type: "spring", duration: 0.5, bounce: 0, delay: 0.05 }}
                className="text-2xl font-medium"
              >
                What are you working on?
              </motion.h2>
              <motion.input
                initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ type: "spring", duration: 0.5, bounce: 0, delay: 0.1 }}
                type="text"
                placeholder="e.g. Studying for Physics Exam"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleBegin()}
                autoFocus
                className="w-full bg-transparent border-b border-border/50 pb-2 text-center text-lg outline-none placeholder:text-muted-foreground/50 focus:border-foreground/30 transition-colors"
              />
              <motion.div
                initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ type: "spring", duration: 0.5, bounce: 0, delay: 0.15 }}
              >
                <TagSelector selected={tagIds} onChange={setTagIds} />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ type: "spring", duration: 0.5, bounce: 0, delay: 0.2 }}
                className="flex flex-col items-center gap-3 w-full pt-2"
              >
                <Button
                  onClick={() => { playSound(success); handleBegin(); }}
                  size="lg"
                  className="w-full"
                >
                  Begin
                </Button>
                <Button
                  onClick={() => { playSound(pageExit); setOpen(false); }}
                  variant="link"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
