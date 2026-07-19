"use client";

import { create } from "zustand";
import type { MissionCase, WorldviewProfile } from "@/lib/mission-types";

type MissionStore = {
  mission: MissionCase | null;
  worldviewId: string | null;
  hydrate: (mission: MissionCase) => void;
  setWorldviewId: (id: string) => void;
};

export const useMissionStore = create<MissionStore>((set, get) => ({
  mission: null,
  worldviewId: null,

  hydrate: (mission) => {
    if (
      get().mission?.meta.generatedAt === mission.meta.generatedAt &&
      get().mission?.nodes.length
    ) return;
    set({ mission, worldviewId: mission.defaultWorldviewId });
  },

  setWorldviewId: (id) => {
    if (get().worldviewId === id) return;
    set({ worldviewId: id });
  },
}));

export function useActiveWorldview(): WorldviewProfile | null {
  const mission = useMissionStore((state) => state.mission);
  const worldviewId = useMissionStore((state) => state.worldviewId);
  if (!mission || !worldviewId) return null;
  return mission.worldviews.find((item) => item.id === worldviewId) ?? mission.worldviews[0] ?? null;
}
