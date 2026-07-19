"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { NetworkGraph } from "@/lib/network-types";

export type VerifyStepId =
  | "open_profile"
  | "check_shared"
  | "confirm_voucher"
  | "draft_ask"
  | "sent_ask";

export const VERIFY_STEPS: {
  id: VerifyStepId;
  label: string;
  hint: string;
}[] = [
  {
    id: "open_profile",
    label: "Open LinkedIn profile",
    hint: "Confirm identity + current role",
  },
  {
    id: "check_shared",
    label: "Check Shared connections",
    hint: "Find a strong L1 who can vouch (keep name private)",
  },
  {
    id: "confirm_voucher",
    label: "Confirm voucher will intro",
    hint: "Upgrade claimed → verified proximity",
  },
  {
    id: "draft_ask",
    label: "Draft specific ask",
    hint: "One activation ask + kill criteria",
  },
  {
    id: "sent_ask",
    label: "Send warm intro request",
    hint: "No Anthropic brand leverage",
  },
];

type NetworkStore = {
  network: NetworkGraph | null;
  selectedTargetId: string | null;
  /** personId → completed verify step ids */
  verifyProgress: Record<string, VerifyStepId[]>;
  hydrate: (network: NetworkGraph) => void;
  selectTarget: (personId: string | null) => void;
  toggleVerifyStep: (personId: string, step: VerifyStepId) => void;
  resetVerifyProgress: (personId: string) => void;
};

export const useNetworkStore = create<NetworkStore>()(
  persist(
    (set, get) => ({
      network: null,
      selectedTargetId: null,
      verifyProgress: {},
      hydrate: (network) => {
        const prev = get().selectedTargetId;
        const stillValid =
          prev != null && network.targets.some((t) => t.personId === prev);
        set({
          network,
          selectedTargetId: stillValid
            ? prev
            : (network.targets[0]?.personId ?? null),
        });
      },
      selectTarget: (personId) => {
        if (get().selectedTargetId === personId) return;
        set({ selectedTargetId: personId });
      },
      toggleVerifyStep: (personId, step) => {
        const current = get().verifyProgress[personId] ?? [];
        const next = current.includes(step)
          ? current.filter((s) => s !== step)
          : [...current, step];
        set({
          verifyProgress: {
            ...get().verifyProgress,
            [personId]: next,
          },
        });
      },
      resetVerifyProgress: (personId) => {
        const { [personId]: _, ...rest } = get().verifyProgress;
        set({ verifyProgress: rest });
      },
    }),
    {
      name: "ecosystem-atlas-network-verify",
      partialize: (s) => ({ verifyProgress: s.verifyProgress }),
    },
  ),
);
