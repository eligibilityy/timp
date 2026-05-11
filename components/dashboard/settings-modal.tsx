"use client";

import { useState, useRef } from "react";
import { useTimerStore } from "@/store/timer-store";
import { useSoundSettings } from "@/store/sound-store";
import { useNotificationSettings } from "@/store/notification-store";
import { useSound } from "@web-kits/audio/react";
import { tap, success, notification, warning, error } from "@/.web-kits/crisp";
import { SoundButton } from "@/components/ui/sound-button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Play } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { SoundDefinition } from "@web-kits/audio";

const ALARM_OPTIONS: { key: string; label: string; sound: SoundDefinition }[] =
  [
    { key: "success", label: "Success", sound: success },
    { key: "notification", label: "Notification", sound: notification },
    { key: "warning", label: "Warning", sound: warning },
    { key: "error", label: "Error", sound: error },
  ];

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { settings, updateSettings } = useTimerStore();
  const soundSettings = useSoundSettings();
  const notifSettings = useNotificationSettings();

  // Local state for timer settings (commit on save)
  const [work, setWork] = useState(settings.workDuration / 60);
  const [shortBreak, setShortBreak] = useState(
    settings.shortBreakDuration / 60,
  );
  const [longBreak, setLongBreak] = useState(settings.longBreakDuration / 60);
  const [cycles, setCycles] = useState(settings.cyclesBeforeLongBreak);
  const [autoStartBreaks, setAutoStartBreaks] = useState(
    settings.autoStartBreaks,
  );
  const [autoStartTimers, setAutoStartTimers] = useState(
    settings.autoStartTimers,
  );

  // Sound tick for slider
  const playTick = useSound(tap);

  // Alarm preview
  const alarmDef =
    ALARM_OPTIONS.find((o) => o.key === soundSettings.alarmSound)?.sound ??
    success;
  const playAlarmPreview = useSound(alarmDef);

  // Throttle slider tick
  const lastTick = useRef(0);
  const handleVolumeTick = () => {
    const now = Date.now();
    if (now - lastTick.current > 80) {
      playTick();
      lastTick.current = now;
    }
  };

  const handleSave = () => {
    updateSettings({
      workDuration: work * 60,
      shortBreakDuration: shortBreak * 60,
      longBreakDuration: longBreak * 60,
      cyclesBeforeLongBreak: cycles,
      autoStartBreaks,
      autoStartTimers,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto overflow-x-hidden space-y-6 p-2 -m-2">
          {/* Timer */}
          <section className="space-y-3">
            <SectionLabel>Timer</SectionLabel>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Focus (min)">
                <Input
                  type="number"
                  min={1}
                  value={work}
                  onChange={(e) => setWork(Number(e.target.value))}
                />
              </Field>
              <Field label="Short break (min)">
                <Input
                  type="number"
                  min={1}
                  value={shortBreak}
                  onChange={(e) => setShortBreak(Number(e.target.value))}
                />
              </Field>
              <Field label="Long break (min)">
                <Input
                  type="number"
                  min={1}
                  value={longBreak}
                  onChange={(e) => setLongBreak(Number(e.target.value))}
                />
              </Field>
              <Field label="Intervals">
                <Input
                  type="number"
                  min={1}
                  value={cycles}
                  onChange={(e) => setCycles(Number(e.target.value))}
                />
              </Field>
            </div>
            <Row label="Auto-start breaks">
              <Switch
                checked={autoStartBreaks}
                onCheckedChange={setAutoStartBreaks}
              />
            </Row>
            <Row label="Auto-start timers">
              <Switch
                checked={autoStartTimers}
                onCheckedChange={setAutoStartTimers}
              />
            </Row>
          </section>

          {/* Sound */}
          <section className="space-y-3">
            <SectionLabel>Sound</SectionLabel>
            <Row label="UI sounds">
              <Switch
                checked={soundSettings.enabled}
                onCheckedChange={soundSettings.setEnabled}
              />
            </Row>
            {soundSettings.enabled && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Volume</span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {Math.round(soundSettings.volume * 100)}%
                  </span>
                </div>
                <Slider
                  value={soundSettings.volume}
                  onValueChange={(v) => {
                    soundSettings.setVolume(v as number);
                    handleVolumeTick();
                  }}
                  min={0}
                  max={1}
                  step={0.05}
                />
              </div>
            )}
            <div className="space-y-1.5">
              <span className="text-xs text-muted-foreground">Alarm sound</span>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex gap-1 flex-wrap">
                  {ALARM_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => soundSettings.setAlarmSound(opt.key)}
                      className={`rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                        soundSettings.alarmSound === opt.key
                          ? "bg-foreground text-background"
                          : "bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => playAlarmPreview()}
                  className="rounded-lg bg-secondary p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Preview alarm"
                >
                  <Play className="size-3.5" />
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Alarm volume
                </span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {Math.round(soundSettings.alarmVolume * 100)}%
                </span>
              </div>
              <Slider
                value={soundSettings.alarmVolume}
                onValueChange={(v) => {
                  soundSettings.setAlarmVolume(v as number);
                  handleVolumeTick();
                }}
                min={0}
                max={1}
                step={0.05}
              />
            </div>
          </section>

          {/* Notifications */}
          <section className="space-y-3">
            <SectionLabel>Notifications</SectionLabel>
            <Row label="Enable notifications">
              <Switch
                checked={notifSettings.enabled}
                onCheckedChange={notifSettings.setEnabled}
              />
            </Row>
            {notifSettings.enabled && (
              <>
                <div className="space-y-1.5">
                  <span className="text-xs text-muted-foreground">
                    Remind me
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {(["every", "last"] as const).map((mode) => (
                        <button
                          key={mode}
                          onClick={() => notifSettings.setReminderMode(mode)}
                          className={`rounded-lg px-2.5 py-1.5 text-xs capitalize transition-colors ${
                            notifSettings.reminderMode === mode
                              ? "bg-foreground text-background"
                              : "bg-secondary text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                    <Input
                      type="number"
                      min={1}
                      value={notifSettings.reminderMinutes}
                      onChange={(e) =>
                        notifSettings.setReminderMinutes(Number(e.target.value))
                      }
                      className="w-16"
                    />
                    <span className="text-xs text-muted-foreground">min</span>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground/70">
                  {notifSettings.reminderMode === "every"
                    ? `You'll get a notification every ${notifSettings.reminderMinutes} minutes during focus.`
                    : `You'll get a notification in the last ${notifSettings.reminderMinutes} minutes of focus.`}
                </p>
              </>
            )}
          </section>
        </div>
        <SoundButton onClick={handleSave} className="w-full">
          Save
        </SoundButton>
      </DialogContent>
    </Dialog>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
      {children}
    </p>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      {children}
    </label>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}
