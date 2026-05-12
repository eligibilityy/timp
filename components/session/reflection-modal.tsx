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
import { useUser } from "@/hooks/use-user";
import { useGuestStats } from "@/store/guest-store";
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
  const { sessionTitle, sessionTags, sessionStartedAt, reset } = useTimerStore();
  const { user } = useUser();
  const addGuestSession = useGuestStats((s) => s.addSession);

  const [title, setTitle] = useState(sessionTitle);
  const [reflection, setReflection] = useState("");
  const [focusScore, setFocusScore] = useState<number | null>(1);
  const [tagIds, setTagIds] = useState<string[]>(sessionTags);
  const [saving, setSaving] = useState(false);
  const [durationMinutes] = useState(() =>
    sessionStartedAt
      ? Math.round((Date.now() - new Date(sessionStartedAt).getTime()) / 60000)
      : 0
  );

  const handleSave = async () => {
    setSaving(true);
    defineSound(notification)();
    const endedAt = new Date().toISOString();

    try {
      await createSession({
        title: title || null,
        reflection: reflection || null,
        duration_seconds: durationMinutes * 60,
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

  const handleDismiss = () => {
    if (!user) addGuestSession(durationMinutes);
    playSound(collapse);
    reset();
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <p className="text-sm text-muted-foreground">
          You focused for <span className="font-medium text-foreground">{durationMinutes} minutes</span>. Nice work!
        </p>
        <div className="w-full space-y-3 opacity-40 pointer-events-none">
          <Input placeholder="Session title" disabled />
          <Textarea placeholder="Reflection..." rows={3} disabled />
        </div>
        <p className="text-xs text-muted-foreground">
          <a href="/login" className="underline hover:text-foreground transition-colors">Sign in</a> to save your sessions and track progress.
        </p>
        <Button onClick={handleDismiss} className="w-full">
          Done
        </Button>
      </div>
    );
  }

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
            <Button onClick={handleSave} disabled={saving} className="flex-1">
              {saving ? "Saving..." : "Save Reflection"}
            </Button>
            <Button
              variant="link"
              className="text-sm text-muted-foreground hover:text-primary"
              onClick={handleDismiss}
            >
              Don&apos;t Save
            </Button>
          </div>
        </FieldGroup>
      </FieldSet>
    </FieldGroup>
  );
}
