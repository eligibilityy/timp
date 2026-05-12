"use client";

import { useEffect, useState } from "react";
import { createTag } from "@/lib/supabase/sessions";
import { getCachedTags, invalidateTagsCache } from "@/lib/supabase/tags-cache";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { defineSound } from "@web-kits/audio";
import { deselect, info, select } from "@/.web-kits/crisp";
import { playSound } from "@/lib/play-sound";
import { toast } from "sonner";
import { Plus, Check } from "lucide-react";
import type { Tag } from "@/types/database";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

const COLOR_SWATCHES = [
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#6366f1",
  "#ef4444",
  "#14b8a6",
];

interface TagSelectorProps {
  selected: string[];
  onChange: (ids: string[]) => void;
}

export function TagSelector({ selected, onChange }: TagSelectorProps) {
  const [tags, setTags] = useState<Tag[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(COLOR_SWATCHES[0]);

  useEffect(() => {
    getCachedTags().then(setTags);
  }, []);

  const toggle = (id: string) => {
    onChange(
      selected.includes(id)
        ? selected.filter((t) => t !== id)
        : [...selected, id],
    );
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      const tag = await createTag(newName, newColor);
      invalidateTagsCache();
      setTags((prev) => [...(prev ?? []), tag]);
      onChange([...selected, tag.id]);
      defineSound(info)();
      setCreating(false);
      setNewName("");
      setNewColor(COLOR_SWATCHES[0]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "";
      if (msg.includes("duplicate") || msg.includes("unique")) {
        toast("Tag already exists");
      } else {
        toast("Failed to create tag");
      }
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {tags === null && (
          <>
            <div className="h-7 w-14 animate-pulse rounded-full bg-muted" />
            <div className="h-7 w-18 animate-pulse rounded-full bg-muted" />
            <div className="h-7 w-12 animate-pulse rounded-full bg-muted" />
          </>
        )}
        {tags !== null && tags.length === 0 && !creating && (
          <span className="text-xs text-muted-foreground/60">No tags yet</span>
        )}
        {tags !== null &&
          tags.map((tag, i) => (
            <motion.div
              key={tag.id}
              initial={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{
                type: "spring",
                duration: 0.4,
                bounce: 0,
                delay: i * 0.03,
              }}
            >
              <Button
                variant={selected.includes(tag.id) ? "default" : "outline"}
                onClick={() => {
                  playSound(selected.includes(tag.id) ? deselect : select);
                  toggle(tag.id);
                }}
                className={cn(
                  "rounded-full border px-3 text-xs transition-all",
                  selected.includes(tag.id)
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:border-foreground/50",
                )}
              >
                {tag.name}
              </Button>
            </motion.div>
          ))}
        {tags !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: "spring",
              duration: 0.4,
              bounce: 0,
              delay: tags.length * 0.03,
            }}
          >
            <Button
              size="icon"
              variant="outline"
              onClick={() => {
                playSound(!creating ? select : deselect);
                setCreating(!creating);
              }}
              className="rounded-full border-dashed! px-2 py-1 text-xs text-muted-foreground hover:border-foreground/50"
            >
              <Plus className={`size-3 ${creating ? "rotate-45" : ""}`} />
            </Button>
          </motion.div>
        )}
      </div>
      <AnimatePresence>
        {creating && (
          <motion.div
            initial={{ opacity: 0, height: 0, filter: "blur(4px)" }}
            animate={{ opacity: 1, height: "auto", filter: "blur(0px)" }}
            exit={{ opacity: 0, height: 0, filter: "blur(4px)" }}
            transition={{ type: "spring", duration: 0.4, bounce: 0 }}
          >
            <div className="flex flex-col gap-2 pt-1">
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: "spring",
                  duration: 0.4,
                  bounce: 0,
                  delay: 0.05,
                }}
                className="flex gap-2"
              >
                <Input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  placeholder="Tag name"
                  autoFocus
                  className="flex-1 rounded-full border border-border bg-transparent px-3 py-1 text-xs outline-none focus:border-foreground/50"
                />
                <Button
                  type="button"
                  size="icon"
                  onClick={handleCreate}
                  disabled={!newName.trim()}
                  className="text-xs disabled:opacity-40"
                >
                  <Check className="size-3" />
                </Button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: "spring",
                  duration: 0.4,
                  bounce: 0,
                  delay: 0.1,
                }}
                className="flex gap-1.5"
              >
                {COLOR_SWATCHES.map((color) => (
                  <Button
                    key={color}
                    size="icon-xs"
                    onClick={() => {
                      playSound(select);
                      setNewColor(color);
                    }}
                    className={cn(
                      "size-5 rounded-full transition-all",
                      newColor === color &&
                        "ring-1 ring-foreground ring-offset-2 ring-offset-background ",
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
