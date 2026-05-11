'use client'

import { useSound } from '@web-kits/audio/react'
import type { SoundDefinition } from '@web-kits/audio'

// Hover: subtle tick, almost subliminal
const hoverSound: SoundDefinition = {
  source: { type: 'sine', frequency: 1500, fm: { ratio: 0.5, depth: 60 } },
  envelope: { attack: 0, decay: 0.015, sustain: 0, release: 0.005 },
  gain: 0.06,
}

// Click: short snap with body
const clickSound: SoundDefinition = {
  source: { type: 'sine', frequency: { start: 200, end: 700 }, fm: { ratio: 0.5, depth: 80 } },
  envelope: { attack: 0, decay: 0.06, sustain: 0, release: 0.02 },
  gain: 0.2,
}

// Timer complete: ascending arpeggio (C5-E5-G5-C6)
const completeSound: SoundDefinition = {
  layers: [
    { source: { type: 'sine', frequency: 523 }, envelope: { attack: 0.003, decay: 0.35, sustain: 0.05, release: 0.1 }, gain: 0.15 },
    { source: { type: 'sine', frequency: 659 }, envelope: { attack: 0.003, decay: 0.35, sustain: 0.05, release: 0.1 }, delay: 0.015, gain: 0.13 },
    { source: { type: 'sine', frequency: 784 }, envelope: { attack: 0.003, decay: 0.35, sustain: 0.05, release: 0.1 }, delay: 0.03, gain: 0.12 },
    { source: { type: 'sine', frequency: { start: 1046, end: 1175 } }, envelope: { attack: 0.003, decay: 0.3, sustain: 0.04, release: 0.12 }, delay: 0.045, gain: 0.1 },
  ],
}

// Start: soft rising tone
const startSound: SoundDefinition = {
  source: { type: 'sine', frequency: { start: 400, end: 600 } },
  envelope: { attack: 0.01, decay: 0.15, sustain: 0, release: 0.05 },
  gain: 0.15,
}

export function useAppSounds() {
  return {
    hover: useSound(hoverSound),
    click: useSound(clickSound),
    complete: useSound(completeSound),
    start: useSound(startSound),
  }
}
