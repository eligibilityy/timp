"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { playSound } from "@/lib/play-sound";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TagSelector } from "@/components/session/tag-selector";
import { createSession } from "@/lib/supabase/sessions";
import { useTimerStore } from "@/store/timer-store";
import { cn } from "@/lib/utils";
import { collapse, notification, select, success } from "@/.web-kits/crisp";
import { defineSound } from "@web-kits/audio";
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
  const [focusScore, setFocusScore] = useState<number | null>(1);
  const [tagIds, setTagIds] = useState<string[]>(sessionTags);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    defineSound(notification)();
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
      defineSound(success)();
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
              placeholder="What did you work on?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <FieldDescription>
              Optional — defaults to &quot;Untitled Session&quot;
            </FieldDescription>
          </Field>
          <Field>
            <Label htmlFor="sessionReflection">Reflection</Label>
            <Textarea
              placeholder="What went well? What was hard?"
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              rows={5}
            />
          </Field>
          <Field>
            <Label>Focus Score</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <Button
                  key={n}
                  variant={focusScore === n ? "default" : "outline"}
                  onClick={() => { playSound(select); setFocusScore(n); }}
                  className={cn(
                    "size-9 rounded-md border text-sm transition-colors",
                    focusScore === n
                      ? "bg-foreground text-background"
                      : "border-border text-muted-foreground hover:border-foreground/50",
                  )}
                >
                  {n}
                </Button>
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
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1"
            >
              {saving ? "Saving..." : "Save Reflection"}
            </Button>
            <Button
              variant="link"
              className="text-sm text-muted-foreground hover:text-primary"
              onClick={() => { playSound(collapse); handleSkip(); }}
            >
              Don&apos;t Save
            </Button>
          </div>
        </FieldGroup>
      </FieldSet>
    </FieldGroup>
  );
}
