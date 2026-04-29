"use client";

import { useStore } from "./store";
import type { Tab } from "./store";
import { t } from "@/lib/i18n";

const ORDER: { id: Tab; key: string; icon: string }[] = [
  { id: "courseInfo", key: "tab_course_info", icon: "📘" },
  { id: "matrix", key: "tab_matrix", icon: "🔠" },
  { id: "grades", key: "tab_grades", icon: "👥" },
  { id: "dashboard", key: "tab_dashboard", icon: "📈" },
  { id: "results", key: "tab_results", icon: "📋" },
  { id: "report", key: "tab_report", icon: "📝" },
];

export default function Tabs() {
  const { tab, setTab, state } = useStore();
  const lang = state.course.lang;
  return (
    <div className="card p-2 no-print" role="tablist">
      <div className="flex flex-wrap gap-2">
        {ORDER.map((o) => (
          <button
            key={o.id}
            role="tab"
            aria-selected={tab === o.id}
            className="tab"
            onClick={() => setTab(o.id)}
          >
            <span aria-hidden>{o.icon}</span>
            <span>{t(lang, o.key)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
