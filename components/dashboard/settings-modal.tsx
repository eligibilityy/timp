"use client";

import { useEffect, useRef } from "react";
import { useTimerStore } from "@/store/timer-store";
import { useSoundSettings } from "@/store/sound-store";
import { useNotificationSettings } from "@/store/notification-store";
import { useSound } from "@web-kits/audio/react";
import { defineSound } from "@web-kits/audio";
import {
  tap,
  success,
  notification,
  select,
  deselect,
  collapse,
} from "@/.web-kits/crisp";
import { playSound } from "@/lib/play-sound";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { SoundDefinition } from "@web-kits/audio";
import { Button } from "../ui/button";
import { Calligraph } from "calligraph";
import { AnimatePresence, motion } from "motion/react";
import { ButtonGroup } from "../ui/button-group";

const ALARM_OPTIONS: { key: string; label: string; sound: SoundDefinition }[] =
  [
    { key: "success", label: "Success", sound: success },
    { key: "notification", label: "Notification", sound: notification },
  ];

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) defineSound(collapse)(); onOpenChange(v); }}>
      <DialogContent className="h-[90vh]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <SettingsForm onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function SettingsForm({ onClose }: { onClose: () => void }) {
  const { settings, updateSettings } = useTimerStore();
  const soundSettings = useSoundSettings();
  const notifSettings = useNotificationSettings();

  const playTick = useSound(tap);
  const lastTick = useRef(0);
  const handleVolumeTick = () => {
    const now = Date.now();
    if (now - lastTick.current > 20) {
      playTick();
      lastTick.current = now;
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        defineSound(collapse)();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <div className="overflow-y-auto overflow-x-hidden space-y-8 w-full min-w-0 pb-4 scrollbar-none">
        <FieldGroup>
          <FieldSet>
            <FieldLegend>Timer</FieldLegend>
            <FieldDescription>
              Enter your desired times in minutes.
            </FieldDescription>
            <FieldGroup>
              <div className="grid grid-cols-3 gap-2">
                <Field>
                  <FieldLabel htmlFor="timerDuration">Focus</FieldLabel>
                  <Input
                    type="number"
                    id="timerDuration"
                    min={10}
                    value={settings.workDuration / 60}
                    onChange={(e) =>
                      updateSettings({
                        workDuration: Math.max(1, Number(e.target.value)) * 60,
                      })
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="shortBreakDuration">
                    Short Break
                  </FieldLabel>
                  <Input
                    type="number"
                    id="shortBreakDuration"
                    min={5}
                    value={settings.shortBreakDuration / 60}
                    onChange={(e) =>
                      updateSettings({
                        shortBreakDuration:
                          Math.max(1, Number(e.target.value)) * 60,
                      })
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="longBreakDuration">
                    Long Break
                  </FieldLabel>
                  <Input
                    type="number"
                    id="longBreakDuration"
                    min={10}
                    value={settings.longBreakDuration / 60}
                    onChange={(e) =>
                      updateSettings({
                        longBreakDuration:
                          Math.max(1, Number(e.target.value)) * 60,
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
                    checked={settings.autoStartBreaks}
                    onCheckedChange={(v) => {
                      updateSettings({ autoStartBreaks: v });
                      defineSound(v ? select : deselect)();
                    }}
                    id="autoStartBreaks"
                  />
                </Field>
                <Field orientation="horizontal" className="w-fit">
                  <FieldLabel htmlFor="autoStartTimers">
                    Auto-start timers?
                  </FieldLabel>
                  <Switch
                    checked={settings.autoStartTimers}
                    onCheckedChange={(v) => {
                      updateSettings({ autoStartTimers: v });
                      defineSound(v ? select : deselect)();
                    }}
                    id="autoStartTimers"
                  />
                </Field>
              </div>
            </FieldGroup>
          </FieldSet>
          <FieldSeparator />
          <FieldSet>
            <FieldLegend>Sound</FieldLegend>
            <FieldDescription>
              Enable or disable sound settings, and customize the alarm.
            </FieldDescription>
            <FieldGroup>
              <div className="flex flex-col gap-4">
                <Field orientation="horizontal" className="w-fit">
                  <FieldLabel htmlFor="soundSettings">
                    Enable System Sounds?
                  </FieldLabel>
                  <Switch
                    id="soundSettings"
                    checked={soundSettings.enabled}
                    onCheckedChange={(v) => {
                      soundSettings.setEnabled(v);
                      defineSound(v ? select : deselect)();
                    }}
                  />
                </Field>
                <AnimatePresence>
                  {soundSettings.enabled && (
                    <motion.div
                      layout
                      key="sound-volume"
                      initial={{ height: 0, opacity: 0, visibility: "hidden" }}
                      animate={{
                        height: "auto",
                        opacity: 1,
                        visibility: "visible",
                      }}
                      exit={{ height: 0, opacity: 0, visibility: "hidden" }}
                      transition={{ duration: 0.6, ease: [0, 0.899, 0.45, 1] }}
                    >
                      <Field className="w-full">
                        <FieldLabel
                          htmlFor="soundVolume"
                          className="flex items-center justify-between"
                        >
                          <span>Volume</span>
                          <Calligraph
                            variant="number"
                            className="text-muted-foreground"
                          >
                            {`${Math.round(soundSettings.volume * 100)}%`}
                          </Calligraph>
                        </FieldLabel>
                        <Slider
                          id="soundVolume"
                          value={soundSettings.volume}
                          onValueChange={(v) => {
                            soundSettings.setVolume(v as number);
                            handleVolumeTick();
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
                          soundSettings.setAlarmSound(opt.key);
                          defineSound(opt.sound)();
                        }}
                        className={`transition-colors w-1/2 ${
                          soundSettings.alarmSound === opt.key
                            ? "bg-primary text-background hover:bg-muted-foreground"
                            : "bg-secondary text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {opt.label}
                      </Button>
                    ))}
                  </ButtonGroup>
                </Field>
                <Field className="w-full">
                  <FieldLabel
                    htmlFor="alarmVolume"
                    className="flex items-center justify-between"
                  >
                    <span>Alarm Volume</span>
                    <Calligraph
                      variant="number"
                      className="text-muted-foreground"
                    >
                      {`${Math.round(soundSettings.alarmVolume * 100)}%`}
                    </Calligraph>
                  </FieldLabel>
                  <Slider
                    id="alarmVolume"
                    value={soundSettings.alarmVolume}
                    onValueChange={(v) => {
                      soundSettings.setAlarmVolume(v as number);
                      handleVolumeTick();
                    }}
                    min={0}
                    max={1}
                    step={0.05}
                  />
                </Field>
              </div>
            </FieldGroup>
          </FieldSet>
          <FieldSeparator />
          <FieldSet>
            <FieldLegend>Notifications</FieldLegend>
            <FieldDescription>
              Enable or disable notifications.
            </FieldDescription>
            <FieldGroup>
              <Field orientation="horizontal" className="w-fit">
                <FieldLabel htmlFor="notificationSettings">
                  Enable Notifications?
                </FieldLabel>
                <Switch
                  id="notificationSettings"
                  checked={notifSettings.enabled}
                  onCheckedChange={(v) => {
                    notifSettings.setEnabled(v);
                    defineSound(v ? select : deselect)();
                  }}
                />
              </Field>
              <AnimatePresence initial={false}>
                {notifSettings.enabled && (
                  <motion.div
                    layout
                    key="notif-reminder"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.6, ease: [0, 0.899, 0.45, 1] }}
                    style={{ overflow: "hidden" }}
                  >
                    <Field className="">
                      <FieldLabel htmlFor="reminderMinutes">
                        Remind me
                      </FieldLabel>
                      <div className="flex gap-2 items-start">
                        <ButtonGroup className="w-full">
                          {(["every", "last"] as const).map((mode) => (
                            <Button
                              variant="secondary"
                              key={mode}
                              onClick={() => {
                                playSound(tap);
                                notifSettings.setReminderMode(mode);
                              }}
                              className={`w-1/2 capitalize transition-colors ${
                                notifSettings.reminderMode === mode
                                  ? "bg-primary text-background hover:bg-muted-foreground"
                                  : "bg-secondary text-muted-foreground hover:text-foreground"
                              }`}
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
                            value={notifSettings.reminderMinutes}
                            onChange={(e) =>
                              notifSettings.setReminderMinutes(
                                Math.max(1, Number(e.target.value)),
                              )
                            }
                            className="w-16"
                          />
                          <span>minutes</span>
                        </div>
                      </div>
                    </Field>
                  </motion.div>
                )}
              </AnimatePresence>
            </FieldGroup>
          </FieldSet>
        </FieldGroup>
      </div>
      <DialogFooter>
        <Button onClick={() => { playSound(success); onClose(); }} className="w-full">
          Save
        </Button>
      </DialogFooter>
    </>
  );
}
