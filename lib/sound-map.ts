import * as crisp from "@/.web-kits/crisp";
import type { SoundDefinition } from "@web-kits/audio";

export const SOUND_OPTIONS: { key: string; label: string }[] = [
  { key: "click", label: "Click" },
  { key: "tap", label: "Tap" },
  { key: "pop", label: "Pop" },
  { key: "select", label: "Select" },
  { key: "tabSwitch", label: "Tab Switch" },
  { key: "expand", label: "Expand" },
  { key: "slide", label: "Slide" },
  { key: "swoosh", label: "Swoosh" },
];

const map: Record<string, SoundDefinition> = {
  click: crisp.click,
  tap: crisp.tap,
  pop: crisp.pop,
  select: crisp.select,
  tabSwitch: crisp.tabSwitch,
  expand: crisp.expand,
  slide: crisp.slide,
  swoosh: crisp.swoosh,
};

export function getSoundDef(key: string): SoundDefinition {
  return map[key] ?? crisp.click;
}
