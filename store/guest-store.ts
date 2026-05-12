import { create } from "zustand";

interface GuestStats {
  sessionCount: number;
  totalMinutes: number;
  addSession: (minutes: number) => void;
}

const STORAGE_KEY = "guest-stats";

function getStored(): { sessionCount: number; totalMinutes: number } {
  if (typeof window === "undefined") return { sessionCount: 0, totalMinutes: 0 };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { sessionCount: 0, totalMinutes: 0, ...JSON.parse(raw) };
  } catch {}
  return { sessionCount: 0, totalMinutes: 0 };
}

export const useGuestStats = create<GuestStats>((set, get) => ({
  ...getStored(),
  addSession: (minutes) => {
    const sessionCount = get().sessionCount + 1;
    const totalMinutes = get().totalMinutes + minutes;
    set({ sessionCount, totalMinutes });
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ sessionCount, totalMinutes }));
  },
}));
