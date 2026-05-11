'use client'

import { useSound } from '@web-kits/audio/react'
import {
  tap,
  click,
  hover,
  toggleOn,
  toggleOff,
  success,
  select,
  deselect,
  tabSwitch,
  expand,
  collapse,
} from '@/.web-kits/crisp'

export function useAppSounds() {
  return {
    tap: useSound(tap),
    click: useSound(click),
    hover: useSound(hover),
    toggleOn: useSound(toggleOn),
    toggleOff: useSound(toggleOff),
    success: useSound(success),
    select: useSound(select),
    deselect: useSound(deselect),
    tabSwitch: useSound(tabSwitch),
    expand: useSound(expand),
    collapse: useSound(collapse),
    // Aliases for semantic use
    start: useSound(expand),
    complete: useSound(success),
  }
}
