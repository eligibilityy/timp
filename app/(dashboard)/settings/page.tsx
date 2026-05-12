"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useTimerStore } from "@/store/timer-store";
import { useSoundSettings } from "@/store/sound-store";
import { useNotificationSettings } from "@/store/notification-store";
import { useUser } from "@/hooks/use-user";
import { useFileUpload } from "@/hooks/use-file-upload";
import { PageHeader } from "@/components/dashboard/page-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { playSound } from "@/lib/play-sound";
import { useSound } from "@web-kits/audio/react";
import {
  select,
  deselect,
  success,
  notification,
  tap,
  tabSwitch,
} from "@/.web-kits/crisp";
import { toast } from "sonner";
import { User, Sliders } from "lucide-react";
import { Calligraph } from "calligraph";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import type { SoundDefinition } from "@web-kits/audio";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";

const ALARM_OPTIONS: { key: string; label: string; sound: SoundDefinition }[] =
  [
    { key: "success", label: "Success", sound: success },
    { key: "notification", label: "Notification", sound: notification },
  ];

const EASE = [0, 0.899, 0.45, 1] as const;

export default function SettingsPage() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" />
      <Tabs defaultValue="preferences" orientation="vertical" className="gap-8">
        <TabsList>
          <TabsTrigger onClick={() => playSound(tabSwitch)} value="preferences">
            <Sliders className="size-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger onClick={() => playSound(tabSwitch)} value="profile">
            <User className="size-4" />
            Profile
          </TabsTrigger>
        </TabsList>
        <TabsContent value="preferences">
          <FieldGroup>
            <TimerSection />
            <FieldSeparator />
            <SoundSection />
            <FieldSeparator />
            <NotificationSection />
          </FieldGroup>
        </TabsContent>
        <TabsContent value="profile">
          <FieldGroup>
            <ProfileSection userId={user.id} email={user.email ?? ""} />
            <FieldSeparator />
            <AccountSection />
          </FieldGroup>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TimerSection() {
  const { settings, updateSettings } = useTimerStore();

  return (
    <FieldSet>
      <FieldLegend>Timer</FieldLegend>
      <FieldDescription>Enter your desired times in minutes.</FieldDescription>
      <FieldGroup>
        <div className="grid grid-cols-3 gap-3">
          <Field>
            <FieldLabel htmlFor="workDuration">Focus</FieldLabel>
            <Input
              type="number"
              id="workDuration"
              min={1}
              value={settings.workDuration / 60}
              onChange={(e) =>
                updateSettings({
                  workDuration: Math.max(1, Number(e.target.value)) * 60,
                })
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="shortBreakDuration">Short Break</FieldLabel>
            <Input
              type="number"
              id="shortBreakDuration"
              min={1}
              value={settings.shortBreakDuration / 60}
              onChange={(e) =>
                updateSettings({
                  shortBreakDuration: Math.max(1, Number(e.target.value)) * 60,
                })
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="longBreakDuration">Long Break</FieldLabel>
            <Input
              type="number"
              id="longBreakDuration"
              min={1}
              value={settings.longBreakDuration / 60}
              onChange={(e) =>
                updateSettings({
                  longBreakDuration: Math.max(1, Number(e.target.value)) * 60,
                })
              }
            />
          </Field>
        </div>
        <div className="flex flex-col gap-3">
          <Field orientation="horizontal" className="w-fit">
            <FieldLabel htmlFor="autoStartBreaks">
              Auto-start breaks?
            </FieldLabel>
            <Switch
              id="autoStartBreaks"
              checked={settings.autoStartBreaks}
              onCheckedChange={(v) => {
                updateSettings({ autoStartBreaks: v });
                playSound(v ? select : deselect);
              }}
            />
          </Field>
          <Field orientation="horizontal" className="w-fit">
            <FieldLabel htmlFor="autoStartTimers">
              Auto-start timers?
            </FieldLabel>
            <Switch
              id="autoStartTimers"
              checked={settings.autoStartTimers}
              onCheckedChange={(v) => {
                updateSettings({ autoStartTimers: v });
                playSound(v ? select : deselect);
              }}
            />
          </Field>
        </div>
      </FieldGroup>
    </FieldSet>
  );
}

function SoundSection() {
  const s = useSoundSettings();
  const playTick = useSound(tap);

  return (
    <FieldSet>
      <FieldLegend>Sound</FieldLegend>
      <FieldDescription>
        Enable or disable sound settings, and customize the alarm.
      </FieldDescription>
      <FieldGroup>
        <div className="flex flex-col gap-4">
          <Field orientation="horizontal" className="w-fit">
            <FieldLabel htmlFor="soundEnabled">
              Enable System Sounds?
            </FieldLabel>
            <Switch
              id="soundEnabled"
              checked={s.enabled}
              onCheckedChange={(v) => {
                s.setEnabled(v);
                playSound(v ? select : deselect);
              }}
            />
          </Field>
          <AnimatePresence>
            {s.enabled && (
              <motion.div
                key="sound-volume"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.6, ease: EASE }}
                style={{ overflow: "hidden" }}
              >
                <Field>
                  <FieldLabel className="flex items-center justify-between">
                    <span>Volume</span>
                    <Calligraph
                      variant="number"
                      className="text-muted-foreground"
                    >
                      {`${Math.round(s.volume * 100)}%`}
                    </Calligraph>
                  </FieldLabel>
                  <Slider
                    value={s.volume}
                    onValueChange={(v) => {
                      s.setVolume(v as number);
                      playTick();
                    }}
                    min={0}
                    max={1}
                    step={0.05}
                  />
                </Field>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="flex flex-col gap-4">
          <Field>
            <FieldLabel>Alarm Sound</FieldLabel>
            <ButtonGroup className="w-full">
              {ALARM_OPTIONS.map((opt) => (
                <Button
                  key={opt.key}
                  variant="secondary"
                  onClick={() => {
                    s.setAlarmSound(opt.key);
                    playSound(opt.sound);
                  }}
                  className={cn(
                    "w-1/2 transition-colors",
                    s.alarmSound === opt.key
                      ? "bg-primary text-background hover:bg-muted-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground",
                  )}
                >
                  {opt.label}
                </Button>
              ))}
            </ButtonGroup>
          </Field>
          <Field>
            <FieldLabel className="flex items-center justify-between">
              <span>Alarm Volume</span>
              <Calligraph variant="number" className="text-muted-foreground">
                {`${Math.round(s.alarmVolume * 100)}%`}
              </Calligraph>
            </FieldLabel>
            <Slider
              value={s.alarmVolume}
              onValueChange={(v) => {
                s.setAlarmVolume(v as number);
                playTick();
              }}
              min={0}
              max={1}
              step={0.05}
            />
          </Field>
        </div>
      </FieldGroup>
    </FieldSet>
  );
}

function NotificationSection() {
  const n = useNotificationSettings();

  return (
    <FieldSet>
      <FieldLegend>Notifications</FieldLegend>
      <FieldDescription>Enable or disable notifications.</FieldDescription>
      <FieldGroup>
        <Field orientation="horizontal" className="w-fit">
          <FieldLabel htmlFor="notifEnabled">Enable Notifications?</FieldLabel>
          <Switch
            id="notifEnabled"
            checked={n.enabled}
            onCheckedChange={(v) => {
              n.setEnabled(v);
              playSound(v ? select : deselect);
            }}
          />
        </Field>
        <AnimatePresence initial={false}>
          {n.enabled && (
            <motion.div
              key="notif-reminder"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
              style={{ overflow: "hidden" }}
            >
              <Field>
                <FieldLabel htmlFor="reminderMinutes">Remind me</FieldLabel>
                <div className="flex gap-2 items-start">
                  <ButtonGroup className="w-full">
                    {(["every", "last"] as const).map((mode) => (
                      <Button
                        key={mode}
                        variant="secondary"
                        onClick={() => {
                          n.setReminderMode(mode);
                          playSound(tap);
                        }}
                        className={cn(
                          "w-1/2 capitalize transition-colors",
                          n.reminderMode === mode
                            ? "bg-primary text-background hover:bg-muted-foreground"
                            : "bg-secondary text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {mode}
                      </Button>
                    ))}
                  </ButtonGroup>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      id="reminderMinutes"
                      min={1}
                      value={n.reminderMinutes}
                      onChange={(e) =>
                        n.setReminderMinutes(
                          Math.max(1, Number(e.target.value)),
                        )
                      }
                      className="w-16"
                    />
                    <span className="text-sm text-muted-foreground">min</span>
                  </div>
                </div>
              </Field>
            </motion.div>
          )}
        </AnimatePresence>
      </FieldGroup>
    </FieldSet>
  );
}

function ProfileSection({ userId, email }: { userId: string; email: string }) {
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const [, { openFileDialog, getInputProps }] = useFileUpload({
    accept: "image/*",
    maxSize: 2 * 1024 * 1024,
    onFilesAdded: async (added) => {
      const file = added[0]?.file;
      if (!(file instanceof File)) return;
      const supabase = createClient();
      const path = `${userId}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });
      if (error) {
        toast("Failed to upload avatar");
        return;
      }
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const newUrl = data.publicUrl;
      setAvatarUrl(newUrl);
      await supabase.from("profiles").upsert({
        id: userId,
        avatar_url: newUrl,
      });
      playSound(success);
      toast("Avatar uploaded");
      window.dispatchEvent(new Event("profile-updated"));
    },
  });

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()
      .then(({ data }) => {
        if (data) {
          setDisplayName(data.display_name ?? "");
          setAvatarUrl(data.avatar_url ?? "");
        }
        setLoaded(true);
      });
  }, [userId]);

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("profiles").upsert({
      id: userId,
      display_name: displayName || null,
      avatar_url: avatarUrl || null,
    });
    setSaving(false);
    if (error) toast("Failed to save profile");
    else {
      playSound(success);
      toast("Profile saved");
      window.dispatchEvent(new Event("profile-updated"));
    }
  };

  if (!loaded)
    return (
      <FieldSet>
        <FieldLegend>Profile</FieldLegend>
        <FieldDescription>
          Your public info on the leaderboard.
        </FieldDescription>
        <FieldGroup>
          <div className="flex items-center gap-4">
            <div className="size-14 rounded-full bg-muted animate-pulse shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 rounded bg-muted animate-pulse" />
              <div className="h-3 w-36 rounded bg-muted animate-pulse" />
            </div>
          </div>
          <div className="h-9 w-full rounded-lg bg-muted animate-pulse" />
          <div className="h-8 w-20 rounded-lg bg-muted animate-pulse" />
        </FieldGroup>
      </FieldSet>
    );

  return (
    <FieldSet>
      <FieldLegend>Profile</FieldLegend>
      <FieldDescription>Your public info on the leaderboard.</FieldDescription>
      <FieldGroup>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={openFileDialog}
            className="relative group rounded-full cursor-pointer shrink-0"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt=""
                className="size-14 rounded-full object-cover"
              />
            ) : (
              <div className="size-14 rounded-full bg-muted flex items-center justify-center text-lg font-medium">
                {(displayName?.[0] ?? email[0] ?? "?").toUpperCase()}
              </div>
            )}
            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-[10px] font-medium">Edit</span>
            </div>
          </button>
          <input {...getInputProps()} className="hidden" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {displayName || "No name set"}
            </p>
            <p className="text-xs text-muted-foreground truncate">{email}</p>
          </div>
        </div>
        <Field>
          <FieldLabel htmlFor="displayName">Display Name</FieldLabel>
          <Input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
          />
        </Field>
        <Button
          onClick={handleSave}
          disabled={saving}
          size="sm"
          className="w-fit"
        >
          {saving ? "Saving..." : "Save Profile"}
        </Button>
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

  const handleDelete = () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    toast("Account deletion is not yet available. Contact support.");
    setConfirming(false);
  };

  return (
    <FieldSet>
      <FieldLegend>Account</FieldLegend>
      <FieldDescription>Manage your account.</FieldDescription>
      <FieldGroup>
        <div className="flex gap-3">
          <Button variant="secondary" size="sm" onClick={handleSignOut}>
            Sign Out
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            {confirming ? "Confirm Delete" : "Delete Account"}
          </Button>
        </div>
        {confirming && (
          <p className="text-xs text-destructive">
            Click again to confirm. This action is irreversible.
          </p>
        )}
      </FieldGroup>
    </FieldSet>
  );
}
