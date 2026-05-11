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
import { select } from "@/.web-kits/crisp";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldSeparator,
  FieldSet,
} from "../ui/field";
import { Label } from "../ui/label";

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
  const { sessionTitle, sessionTags, sessionStartedAt, reset } =
    useTimerStore();

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
    <FieldGroup>
      <FieldSet>
        <FieldGroup>
          <Field>
            <Label htmlFor="sessionTitle">Session Title</Label>
            <Input
              id="sessionTitle"
              placeholder="Session title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Field>
          <Field>
            <Label htmlFor="sessionReflection">Reflection</Label>
            <Textarea
              placeholder="Reflect on your session..."
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              rows={5}
            />
          </Field>
          <Field>
            <Label>Focus Score</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <SoundButton
                  key={n}
                  sound={select}
                  variant={focusScore === n ? "default" : "outline"}
                  onClick={() => setFocusScore(n)}
                  className={cn(
                    "size-9 rounded-md border text-sm transition-colors",
                    focusScore === n
                      ? "bg-foreground text-background"
                      : "border-border text-muted-foreground hover:border-foreground/50",
                  )}
                >
                  {n}
                </SoundButton>
              ))}
            </div>
            <FieldDescription>
              Self-evaluate how productive you were during this session.
            </FieldDescription>
          </Field>
        </FieldGroup>
      </FieldSet>
      <FieldSeparator />
      <FieldSet>
        <FieldGroup>
          <Field>
            <Label>Tags</Label>
            <TagSelector selected={tagIds} onChange={setTagIds} />
          </Field>
          <div className="flex pt-2">
            <SoundButton
              onClick={handleSave}
              disabled={saving}
              className="flex-1"
            >
              {saving ? "Saving..." : "Save Reflection"}
            </SoundButton>
            <SoundButton
              variant="link"
              className="text-sm text-muted-foreground hover:text-primary"
              onClick={handleSkip}
            >
              Don&apos;t Save
            </SoundButton>
          </div>
        </FieldGroup>
      </FieldSet>
    </FieldGroup>
  );
}
