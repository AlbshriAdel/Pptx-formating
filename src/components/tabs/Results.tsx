"use client";

import { useMemo } from "react";
import { useStore } from "../store";
import { t } from "@/lib/i18n";
import { computeResults } from "@/lib/calc";
import type { Metric } from "@/lib/types";

export default function Results() {
  const { state, setState, saveToast } = useStore();
  const lang = state.course.lang;
  const r = useMemo(() => computeResults(state), [state]);

  const setMetric = async (metric: Metric) => {
    setState({ ...state, course: { ...state.course, metric } });
    await fetch(`/api/course/${state.course.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ metric }),
    });
    saveToast(t(lang, "saved"));
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-4 flex-wrap justify-between">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded-md bg-ink text-white grid place-items-center font-bold">
            4
          </div>
          <div>
            <h2 className="text-xl font-semibold">{t(lang, "results_title")}</h2>
            <p className="text-sm text-khaki">{t(lang, "results_sub")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="label">{t(lang, "metric_label")}</span>
          <select
            className="input w-auto"
            value={state.course.metric}
            onChange={(e) => setMetric(e.target.value as Metric)}
          >
            <option value="mean">{t(lang, "metric_mean")}</option>
            <option value="passRate">{t(lang, "metric_passrate")}</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-sand bg-white">
        <table className="text-sm w-full">
          <thead>
            <tr className="bg-sand/40 text-khaki">
              <th className="px-3 py-2 text-start">{t(lang, "th_clo")}</th>
              <th className="px-3 py-2 text-start">{t(lang, "th_kind")}</th>
              <th className="px-3 py-2 text-start">{t(lang, "th_desc")}</th>
              <th className="px-3 py-2 text-end">{t(lang, "th_max")}</th>
              <th className="px-3 py-2 text-end">{t(lang, "th_achievement")}</th>
              <th className="px-3 py-2 text-end">{t(lang, "th_passrate")}</th>
              <th className="px-3 py-2 text-end">{t(lang, "th_students_achieved")}</th>
              <th className="px-3 py-2 text-start">{t(lang, "th_status")}</th>
            </tr>
          </thead>
          <tbody>
            {r.perCLO.map((c) => {
              const v =
                state.course.metric === "passRate" ? c.passRatePct : c.achievementPct;
              const met = v >= state.course.targetPct;
              return (
                <tr key={c.cloId} className="border-t border-sand/60">
                  <td className="px-3 py-2 font-mono">
                    <span className="me-2">{c.number}</span>
                    <span className="font-bold">{c.code}</span>
                  </td>
                  <td className="px-3 py-2">
                    {c.kind === "K"
                      ? t(lang, "k_label")
                      : c.kind === "S"
                      ? t(lang, "s_label")
                      : t(lang, "v_label")}
                  </td>
                  <td className="px-3 py-2">{c.description}</td>
                  <td className="px-3 py-2 text-end">{c.maxMark}</td>
                  <td className="px-3 py-2 text-end">{c.achievementPct}%</td>
                  <td className="px-3 py-2 text-end">{c.passRatePct}%</td>
                  <td className="px-3 py-2 text-end">
                    {c.studentsAchieved} / {c.studentsAssessed}
                  </td>
                  <td className="px-3 py-2">
                    {met ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-leaf/15 text-leaf px-2 py-0.5 text-xs">
                        {t(lang, "status_met")}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-burnt/15 text-burnt px-2 py-0.5 text-xs">
                        {t(lang, "status_needs")}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
