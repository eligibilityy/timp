import { defineSound } from "@web-kits/audio";
import type { SoundDefinition } from "@web-kits/audio";

export function playSound(sound: SoundDefinition) {
  defineSound(sound)();
}
