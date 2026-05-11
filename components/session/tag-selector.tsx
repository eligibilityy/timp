"use client";

import { useEffect, useState } from "react";
import { getTags, createTag } from "@/lib/supabase/sessions";
import { cn } from "@/lib/utils";
import { defineSound } from "@web-kits/audio";
import { deselect, select, success } from "@/.web-kits/crisp";
import { toast } from "sonner";
import { Plus, Check } from "lucide-react";
import type { Tag } from "@/types/database";
import { SoundButton } from "../ui/sound-button";

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
  const [tags, setTags] = useState<Tag[]>([]);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(COLOR_SWATCHES[0]);

  useEffect(() => {
    getTags().then(setTags);
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
      setTags((prev) => [...prev, tag]);
      onChange([...selected, tag.id]);
      defineSound(success)();
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
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <SoundButton
            variant={selected.includes(tag.id) ? "default" : "outline"}
            key={tag.id}
            sound={selected.includes(tag.id) ? deselect : select}
            onClick={() => toggle(tag.id)}
            className={cn(
              "rounded-full border px-3 text-xs transition-colors",
              selected.includes(tag.id)
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground hover:border-foreground/50",
            )}
          >
            {tag.name}
          </SoundButton>
        ))}
        <SoundButton
          size="icon"
          variant="outline"
          onClick={() => setCreating(!creating)}
          className="rounded-full border-dashed! px-2 py-1 text-xs text-muted-foreground hover:border-foreground/50"
        >
          <Plus className="size-3" />
        </SoundButton>
      </div>
      {creating && (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="Tag name"
              autoFocus
              className="flex-1 rounded-full border border-border bg-transparent px-3 py-1 text-xs outline-none focus:border-foreground/50"
            />
            <button
              type="button"
              onClick={handleCreate}
              disabled={!newName.trim()}
              className="rounded-full bg-foreground text-background px-2 py-1 text-xs disabled:opacity-40"
            >
              <Check className="size-3" />
            </button>
          </div>
          <div className="flex gap-1.5">
            {COLOR_SWATCHES.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setNewColor(color)}
                className={cn(
                  "size-5 rounded-full transition-all",
                  newColor === color &&
                    "ring-2 ring-foreground ring-offset-2 ring-offset-background",
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
