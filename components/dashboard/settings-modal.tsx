'use client'

import { useState } from 'react'
import { useTimerStore } from '@/store/timer-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { settings, updateSettings } = useTimerStore()
  const [work, setWork] = useState(settings.workDuration / 60)
  const [shortBreak, setShortBreak] = useState(settings.shortBreakDuration / 60)
  const [longBreak, setLongBreak] = useState(settings.longBreakDuration / 60)
  const [cycles, setCycles] = useState(settings.cyclesBeforeLongBreak)
  const [autoAdvance, setAutoAdvance] = useState(settings.autoAdvance)
  const [sound, setSound] = useState(true)

  const handleSave = () => {
    updateSettings({
      workDuration: work * 60,
      shortBreakDuration: shortBreak * 60,
      longBreakDuration: longBreak * 60,
      cyclesBeforeLongBreak: cycles,
      autoAdvance,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Timer</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Focus (min)</label>
                <Input type="number" min={1} value={work} onChange={(e) => setWork(Number(e.target.value))} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Short break (min)</label>
                <Input type="number" min={1} value={shortBreak} onChange={(e) => setShortBreak(Number(e.target.value))} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Long break (min)</label>
                <Input type="number" min={1} value={longBreak} onChange={(e) => setLongBreak(Number(e.target.value))} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Cycles before long break</label>
                <Input type="number" min={1} value={cycles} onChange={(e) => setCycles(Number(e.target.value))} />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Behavior</p>
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span className="text-sm">Auto-advance</span>
                <Switch checked={autoAdvance} onCheckedChange={setAutoAdvance} />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm">Sound on complete</span>
                <Switch checked={sound} onCheckedChange={setSound} />
              </label>
            </div>
          </div>

          <Button onClick={handleSave} className="w-full">Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
