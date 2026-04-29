"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CourseState, Lang } from "@/lib/types";
import { dirOf, t } from "@/lib/i18n";
import { StoreContext, type Tab } from "./store";
import Header from "./Header";
import Tabs from "./Tabs";
import SidePanels from "./SidePanels";
import CourseInfo from "./tabs/CourseInfo";
import AssessmentMatrix from "./tabs/AssessmentMatrix";
import Grades from "./tabs/Grades";
import Dashboard from "./tabs/Dashboard";
import Results from "./tabs/Results";
import Report from "./tabs/Report";

export default function App({ initialState }: { initialState: CourseState }) {
  const [state, setState] = useState<CourseState>(initialState);
  const [tab, setTab] = useState<Tab>("dashboard");
  const [toast, setToast] = useState<string | null>(null);

  const lang: Lang = state.course.lang;

  useEffect(() => {
    document.documentElement.dir = dirOf(lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const refresh = useCallback(async () => {
    const r = await fetch(`/api/course/${state.course.id}`, { cache: "no-store" });
    if (r.ok) {
      const data = (await r.json()) as CourseState;
      setState(data);
    }
  }, [state.course.id]);

  const saveToast = useCallback((msg?: string) => {
    setToast(msg ?? "Saved");
    setTimeout(() => setToast(null), 1500);
  }, []);

  const setLang = useCallback(
    async (next: Lang) => {
      await fetch(`/api/course/${state.course.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lang: next }),
      });
      setState((s) => ({ ...s, course: { ...s.course, lang: next } }));
    },
    [state.course.id]
  );

  const ctx = useMemo(
    () => ({ state, setState, refresh, saveToast, setLang, tab, setTab }),
    [state, refresh, saveToast, setLang, tab]
  );

  return (
    <StoreContext.Provider value={ctx}>
      <div className="min-h-screen bg-cream text-ink" id="app-root">
        <main className="mx-auto max-w-[1200px] px-4 py-6 print:py-0" id="print-root">
          <Header />

          <div className="grid grid-cols-12 gap-5 mt-5">
            <aside className="col-span-12 lg:col-span-3 space-y-5 no-print">
              <SidePanels.Idea />
            </aside>

            <section className="col-span-12 lg:col-span-9 space-y-5">
              <Tabs />
              <div className="card p-5">
                {tab === "courseInfo" && <CourseInfo />}
                {tab === "matrix" && <AssessmentMatrix />}
                {tab === "grades" && <Grades />}
                {tab === "dashboard" && <Dashboard />}
                {tab === "results" && <Results />}
                {tab === "report" && <Report />}
              </div>
            </section>

            <section className="col-span-12 lg:col-span-8">
              {/* spacer for visual alignment when needed */}
            </section>

            <aside className="col-span-12 lg:col-span-4 no-print">
              <SidePanels.Takeaways />
            </aside>
          </div>

          <footer className="mt-8 rounded-2xl bg-ink text-white px-6 py-4 print:bg-white print:text-ink">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-leaf grid place-items-center text-white font-bold">✓</div>
              <div>
                <div className="font-semibold">{t(lang, "footer_motto")}</div>
                <div className="text-sm opacity-90">{t(lang, "footer_sub")}</div>
              </div>
            </div>
          </footer>
        </main>

        {toast && (
          <div className="fixed bottom-4 inset-x-0 mx-auto w-fit rounded-full bg-ink text-white px-4 py-2 text-sm shadow-card no-print">
            {toast}
          </div>
        )}
      </div>
    </StoreContext.Provider>
  );
}
