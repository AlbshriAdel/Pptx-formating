"use client";

import { useStore } from "./store";
import { t } from "@/lib/i18n";

function Idea() {
  const { state } = useStore();
  const lang = state.course.lang;
  const bullets = [
    "bullet_define",
    "bullet_track",
    "bullet_identify",
    "bullet_plan",
    "bullet_report",
  ];
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2">
        <span className="grid place-items-center h-8 w-8 rounded-full bg-leaf/10 text-leaf">
          💡
        </span>
        <h2 className="text-lg font-semibold text-leaf">{t(lang, "my_idea")}</h2>
      </div>
      <p className="mt-3 text-sm text-ink/80">{t(lang, "my_idea_body")}</p>
      <ul className="mt-4 space-y-2 text-sm">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-2">
            <span className="mt-0.5 grid place-items-center h-5 w-5 rounded-full bg-leaf/15 text-leaf">
              ✓
            </span>
            <span>{t(lang, b)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Takeaways() {
  const { state } = useStore();
  const lang = state.course.lang;
  const items = [
    { icon: "🎯", title: "kt_track", body: "kt_track_body" },
    { icon: "📊", title: "kt_gaps", body: "kt_gaps_body" },
    { icon: "📋", title: "kt_action", body: "kt_action_body" },
    { icon: "📄", title: "kt_report", body: "kt_report_body" },
  ];
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2">
        <span className="text-leaf">★</span>
        <h2 className="text-lg font-semibold text-leaf">{t(lang, "key_takeaways")}</h2>
      </div>
      <div className="mt-3 space-y-3">
        {items.map((i) => (
          <div key={i.title} className="flex items-start gap-3">
            <div className="grid place-items-center h-9 w-9 rounded-full bg-leaf/10 text-leaf">
              <span aria-hidden>{i.icon}</span>
            </div>
            <div>
              <div className="font-semibold text-ink">{t(lang, i.title)}</div>
              <div className="text-sm text-ink/75">{t(lang, i.body)}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-xl border border-leaf/30 bg-leaf/10 p-3 text-sm">
        <div className="flex items-center gap-2 font-semibold text-leaf">
          <span>🏆</span>
          <span>{t(lang, "goal")}</span>
        </div>
        <div className="text-ink/80 mt-1">{t(lang, "goal_sub")}</div>
      </div>
    </div>
  );
}

const SidePanels = { Idea, Takeaways };
export default SidePanels;
