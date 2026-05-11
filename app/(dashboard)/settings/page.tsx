'use client'

import { useTimerStore } from '@/store/timer-store'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export default function SettingsPage() {
  const { settings, updateSettings } = useTimerStore()
  const [work, setWork] = useState(settings.workDuration / 60)
  const [shortBreak, setShortBreak] = useState(settings.shortBreakDuration / 60)
  const [longBreak, setLongBreak] = useState(settings.longBreakDuration / 60)
  const [cycles, setCycles] = useState(settings.cyclesBeforeLongBreak)
  const [autoAdvance, setAutoAdvance] = useState(settings.autoAdvance)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    updateSettings({
      workDuration: work * 60,
      shortBreakDuration: shortBreak * 60,
      longBreakDuration: longBreak * 60,
      cyclesBeforeLongBreak: cycles,
      autoAdvance,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>

      <Card>
        <CardContent className="space-y-6 py-6">
          <h2 className="font-medium">Timer</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Work duration (min)</label>
              <Input type="number" min={1} value={work} onChange={(e) => setWork(Number(e.target.value))} />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Short break (min)</label>
              <Input type="number" min={1} value={shortBreak} onChange={(e) => setShortBreak(Number(e.target.value))} />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Long break (min)</label>
              <Input type="number" min={1} value={longBreak} onChange={(e) => setLongBreak(Number(e.target.value))} />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Cycles before long break</label>
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
            <label htmlFor="autoAdvance" className="text-sm">
              Auto-advance to next interval
            </label>
          </div>
          <Button onClick={handleSave}>
            {saved ? 'Saved!' : 'Save settings'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
