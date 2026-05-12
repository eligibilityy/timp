"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useTimerStore } from "@/store/timer-store";
import { useSoundSettings } from "@/store/sound-store";
import { useNotificationSettings } from "@/store/notification-store";
import { useUser } from "@/hooks/use-user";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { playSound } from "@/lib/play-sound";
import { select, deselect, success } from "@/.web-kits/crisp";
import { toast } from "sonner";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";

export default function SettingsPage() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <div className="space-y-8 pb-12">
      <PageHeader title="Settings" />
      <ProfileSection userId={user.id} email={user.email ?? ""} />
      <FieldSeparator />
      <TimerSection />
      <FieldSeparator />
      <SoundSection />
      <FieldSeparator />
      <NotificationSection />
      <FieldSeparator />
      <AccountSection />
    </div>
  );
}

function ProfileSection({ userId, email }: { userId: string; email: string }) {
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.from("profiles").select("*").eq("id", userId).single().then(({ data }) => {
      if (data) {
        setDisplayName(data.display_name ?? "");
        setUsername(data.username ?? "");
        setAvatarUrl(data.avatar_url ?? "");
      }
    });
  }, [userId]);

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("profiles").upsert({
      id: userId,
      display_name: displayName || null,
      username: username || null,
      avatar_url: avatarUrl || null,
    });
    setSaving(false);
    if (error) toast("Failed to save profile");
    else { playSound(success); toast("Profile saved"); }
  };

  return (
    <FieldSet>
      <FieldLegend>Profile</FieldLegend>
      <FieldDescription>Your public profile information.</FieldDescription>
      <FieldGroup>
        <Field>
          <FieldLabel>Email</FieldLabel>
          <Input value={email} disabled className="opacity-60" />
        </Field>
        <Field>
          <FieldLabel>Display Name</FieldLabel>
          <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" />
        </Field>
        <Field>
          <FieldLabel>Username</FieldLabel>
          <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" />
        </Field>
        <Field>
          <FieldLabel>Avatar URL</FieldLabel>
          <Input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://..." />
        </Field>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Profile"}
        </Button>
      </FieldGroup>
    </FieldSet>
  );
}

function TimerSection() {
  const { settings, updateSettings } = useTimerStore();

  return (
    <FieldSet>
      <FieldLegend>Timer</FieldLegend>
      <FieldDescription>Configure timer durations in minutes.</FieldDescription>
      <FieldGroup>
        <div className="grid grid-cols-3 gap-2">
          <Field>
            <FieldLabel>Focus</FieldLabel>
            <Input type="number" min={1} value={settings.workDuration / 60} onChange={(e) => updateSettings({ workDuration: Math.max(1, Number(e.target.value)) * 60 })} />
          </Field>
          <Field>
            <FieldLabel>Short Break</FieldLabel>
            <Input type="number" min={1} value={settings.shortBreakDuration / 60} onChange={(e) => updateSettings({ shortBreakDuration: Math.max(1, Number(e.target.value)) * 60 })} />
          </Field>
          <Field>
            <FieldLabel>Long Break</FieldLabel>
            <Input type="number" min={1} value={settings.longBreakDuration / 60} onChange={(e) => updateSettings({ longBreakDuration: Math.max(1, Number(e.target.value)) * 60 })} />
          </Field>
        </div>
        <Field orientation="horizontal" className="w-fit">
          <FieldLabel>Auto-start breaks</FieldLabel>
          <Switch checked={settings.autoStartBreaks} onCheckedChange={(v) => { updateSettings({ autoStartBreaks: v }); playSound(v ? select : deselect); }} />
        </Field>
        <Field orientation="horizontal" className="w-fit">
          <FieldLabel>Auto-start timers</FieldLabel>
          <Switch checked={settings.autoStartTimers} onCheckedChange={(v) => { updateSettings({ autoStartTimers: v }); playSound(v ? select : deselect); }} />
        </Field>
      </FieldGroup>
    </FieldSet>
  );
}

function SoundSection() {
  const soundSettings = useSoundSettings();

  return (
    <FieldSet>
      <FieldLegend>Sound</FieldLegend>
      <FieldGroup>
        <Field orientation="horizontal" className="w-fit">
          <FieldLabel>Enable sounds</FieldLabel>
          <Switch checked={soundSettings.enabled} onCheckedChange={(v) => { soundSettings.setEnabled(v); playSound(v ? select : deselect); }} />
        </Field>
        {soundSettings.enabled && (
          <Field>
            <FieldLabel>Volume — {Math.round(soundSettings.volume * 100)}%</FieldLabel>
            <Slider value={soundSettings.volume} onValueChange={(v) => soundSettings.setVolume(v as number)} min={0} max={1} step={0.05} />
          </Field>
        )}
        <Field>
          <FieldLabel>Alarm Volume — {Math.round(soundSettings.alarmVolume * 100)}%</FieldLabel>
          <Slider value={soundSettings.alarmVolume} onValueChange={(v) => soundSettings.setAlarmVolume(v as number)} min={0} max={1} step={0.05} />
        </Field>
      </FieldGroup>
    </FieldSet>
  );
}

function NotificationSection() {
  const notif = useNotificationSettings();

  return (
    <FieldSet>
      <FieldLegend>Notifications</FieldLegend>
      <FieldGroup>
        <Field orientation="horizontal" className="w-fit">
          <FieldLabel>Enable notifications</FieldLabel>
          <Switch checked={notif.enabled} onCheckedChange={(v) => { notif.setEnabled(v); playSound(v ? select : deselect); }} />
        </Field>
        {notif.enabled && (
          <Field>
            <FieldLabel>Remind me every {notif.reminderMinutes} minutes</FieldLabel>
            <Input type="number" min={1} value={notif.reminderMinutes} onChange={(e) => notif.setReminderMinutes(Math.max(1, Number(e.target.value)))} className="w-20" />
          </Field>
        )}
      </FieldGroup>
    </FieldSet>
  );
}

function AccountSection() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleDelete = async () => {
    if (!confirming) { setConfirming(true); return; }
    toast("Account deletion is not yet implemented. Contact support.");
    setConfirming(false);
  };

  return (
    <FieldSet>
      <FieldLegend>Account</FieldLegend>
      <FieldGroup>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleSignOut}>Sign Out</Button>
          <Button variant="destructive" onClick={handleDelete}>
            {confirming ? "Are you sure?" : "Delete Account"}
          </Button>
        </div>
      </FieldGroup>
    </FieldSet>
  );
}
