"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { SoundButton } from "@/components/ui/sound-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TagSelector } from "@/components/session/tag-selector";
import { createSession } from "@/lib/supabase/sessions";
import { useTimerStore } from "@/store/timer-store";
import { cn } from "@/lib/utils";

export function ReflectionModal() {
  const status = useTimerStore((s) => s.status);
  const open = status === "completed";

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Session Complete</DialogTitle>
          <DialogDescription>What did you accomplish?</DialogDescription>
        </DialogHeader>
        {open && <ReflectionForm />}
      </DialogContent>
    </Dialog>
  );
}

function ReflectionForm() {
  const { sessionTitle, sessionTags, sessionStartedAt, reset } = useTimerStore();

  const [title, setTitle] = useState(sessionTitle);
  const [reflection, setReflection] = useState("");
  const [focusScore, setFocusScore] = useState<number | null>(null);
  const [tagIds, setTagIds] = useState<string[]>(sessionTags);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const endedAt = new Date().toISOString();
    const durationSeconds = sessionStartedAt
      ? Math.round((Date.now() - new Date(sessionStartedAt).getTime()) / 1000)
      : 0;

    try {
      await createSession({
        title: title || null,
        reflection: reflection || null,
        duration_seconds: durationSeconds,
        focus_score: focusScore,
        started_at: sessionStartedAt,
        ended_at: endedAt,
        tagIds,
      });
    } catch (e) {
      console.error("Failed to save session:", e);
    } finally {
      setSaving(false);
      reset();
    }
  };

  const handleSkip = () => {
    reset();
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Session title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <Textarea
        placeholder="Reflect on your session..."
        value={reflection}
        onChange={(e) => setReflection(e.target.value)}
        rows={3}
      />
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">Focus score</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setFocusScore(n)}
              className={cn(
                "size-9 rounded-md border text-sm transition-colors",
                focusScore === n
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:border-foreground/50",
              )}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">Tags</label>
        <TagSelector selected={tagIds} onChange={setTagIds} />
      </div>
      <div className="flex gap-2 pt-2">
        <SoundButton
          onClick={handleSave}
          disabled={saving}
          className="flex-1"
        >
          {saving ? "Saving..." : "Save Reflection"}
        </SoundButton>
        <SoundButton variant="ghost" onClick={handleSkip}>
          Don&apos;t Save
        </SoundButton>
      </div>
    </div>
  );
}
