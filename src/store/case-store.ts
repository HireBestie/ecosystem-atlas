"use client";

import { create } from "zustand";
import type { WorkedCaseBundle } from "@/lib/case-types";

type CaseStore = {
  bundle: WorkedCaseBundle | null;
  selectedCaseId: string | null;
  hydrate: (bundle: WorkedCaseBundle) => void;
  selectCase: (id: string) => void;
};

export const useCaseStore = create<CaseStore>((set) => ({
  bundle: null,
  selectedCaseId: null,
  hydrate: (bundle) =>
    set({
      bundle,
      selectedCaseId: bundle.cases[0]?.id ?? null,
    }),
  selectCase: (id) => set({ selectedCaseId: id }),
}));

export function useSelectedCase() {
  const bundle = useCaseStore((s) => s.bundle);
  const id = useCaseStore((s) => s.selectedCaseId);
  return bundle?.cases.find((c) => c.id === id) ?? null;
}
