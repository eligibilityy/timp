'use client'

import { useState } from 'react'
import { useTimerStore } from '@/store/timer-store'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Work (min)</label>
              <Input type="number" min={1} value={work} onChange={(e) => setWork(Number(e.target.value))} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Short break</label>
              <Input type="number" min={1} value={shortBreak} onChange={(e) => setShortBreak(Number(e.target.value))} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Long break</label>
              <Input type="number" min={1} value={longBreak} onChange={(e) => setLongBreak(Number(e.target.value))} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Cycles</label>
              <Input type="number" min={1} value={cycles} onChange={(e) => setCycles(Number(e.target.value))} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="autoAdvance"
              checked={autoAdvance}
              onChange={(e) => setAutoAdvance(e.target.checked)}
              className="size-4 rounded border"
            />
            <label htmlFor="autoAdvance" className="text-sm">Auto-advance</label>
          </div>
          <Button onClick={handleSave} className="w-full">Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
