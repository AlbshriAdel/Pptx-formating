"use client";

import { createContext, useContext } from "react";
import type { CourseState, Lang } from "@/lib/types";

export type Tab =
  | "courseInfo"
  | "matrix"
  | "grades"
  | "dashboard"
  | "results"
  | "report";

export interface StoreActions {
  state: CourseState;
  setState: (s: CourseState) => void;
  refresh: () => Promise<void>;
  saveToast: (msg?: string) => void;
  setLang: (lang: Lang) => Promise<void>;
  tab: Tab;
  setTab: (t: Tab) => void;
}

export const StoreContext = createContext<StoreActions | null>(null);

export function useStore(): StoreActions {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("StoreContext missing");
  return ctx;
}
