"use client";

import { useStore } from "../store";
import { t } from "@/lib/i18n";
import type { ReportState } from "@/lib/types";

export default function Report() {
  const { state, setState, saveToast } = useStore();
  const lang = state.course.lang;
  const r = state.report;

  const persist = async (next: ReportState) => {
    setState({ ...state, report: next });
    await fetch(`/api/course/${state.course.id}/report`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });
    saveToast(t(lang, "saved"));
  };

  const updateTopics = (rows: ReportState["topics"]) =>
    persist({ ...r, topics: rows });
  const updatePlans = (rows: ReportState["plans"]) =>
    persist({ ...r, plans: rows });

  const addTopic = () =>
    updateTopics([
      ...r.topics,
      { id: Date.now(), topic: "", reason: "", impact: "", action: "" },
    ]);
  const addPlan = () =>
    updatePlans([
      ...r.plans,
      { id: Date.now(), recommendation: "", action: "", support: "" },
    ]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="h-7 w-7 rounded-md bg-ink text-white grid place-items-center font-bold">
          3
        </div>
        <div>
          <h2 className="text-xl font-semibold">{t(lang, "report_title")}</h2>
          <p className="text-sm text-khaki">{t(lang, "report_sub")}</p>
        </div>
      </div>

      <h3 className="font-semibold mb-2">{t(lang, "topics_not_covered")}</h3>
      <div className="overflow-x-auto rounded-xl border border-sand bg-white mb-3">
        <table className="text-sm w-full">
          <thead>
            <tr className="bg-sand/40 text-khaki">
              <th className="px-3 py-2 text-start">{t(lang, "topic")}</th>
              <th className="px-3 py-2 text-start">{t(lang, "reason_not_covering")}</th>
              <th className="px-3 py-2 text-start">{t(lang, "impact")}</th>
              <th className="px-3 py-2 text-start">{t(lang, "compensating_action")}</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {r.topics.map((row, idx) => (
              <tr key={row.id} className="border-t border-sand/60">
                {(["topic", "reason", "impact", "action"] as const).map((k) => (
                  <td key={k} className="px-2 py-1.5">
                    <input
                      className="input"
                      value={row[k]}
                      onChange={(e) =>
                        updateTopics(
                          r.topics.map((x, i) =>
                            i === idx ? { ...x, [k]: e.target.value } : x
                          )
                        )
                      }
                    />
                  </td>
                ))}
                <td className="px-2 py-1.5">
                  <button
                    className="btn !py-1 !px-2 text-xs"
                    onClick={() =>
                      updateTopics(r.topics.filter((_, i) => i !== idx))
                    }
                  >
                    🗑
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="btn mb-6" onClick={addTopic}>
        {t(lang, "add_row")}
      </button>

      <h3 className="font-semibold mb-2">{t(lang, "improvement_plan")}</h3>
      <div className="overflow-x-auto rounded-xl border border-sand bg-white mb-3">
        <table className="text-sm w-full">
          <thead>
            <tr className="bg-sand/40 text-khaki">
              <th className="px-3 py-2 text-start">{t(lang, "recommendations")}</th>
              <th className="px-3 py-2 text-start">{t(lang, "actions")}</th>
              <th className="px-3 py-2 text-start">{t(lang, "needed_support")}</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {r.plans.map((row, idx) => (
              <tr key={row.id} className="border-t border-sand/60">
                {(["recommendation", "action", "support"] as const).map((k) => (
                  <td key={k} className="px-2 py-1.5">
                    <input
                      className="input"
                      value={row[k]}
                      onChange={(e) =>
                        updatePlans(
                          r.plans.map((x, i) =>
                            i === idx ? { ...x, [k]: e.target.value } : x
                          )
                        )
                      }
                    />
                  </td>
                ))}
                <td className="px-2 py-1.5">
                  <button
                    className="btn !py-1 !px-2 text-xs"
                    onClick={() => updatePlans(r.plans.filter((_, i) => i !== idx))}
                  >
                    🗑
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="btn mb-4" onClick={addPlan}>
        {t(lang, "add_row")}
      </button>

      <p className="text-xs text-khaki italic">{t(lang, "improvement_note")}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div>
          <div className="label mb-1">{t(lang, "instructor_signature")}</div>
          <input
            className="input"
            value={r.instructorSignature}
            onChange={(e) =>
              persist({ ...r, instructorSignature: e.target.value })
            }
          />
        </div>
        <div>
          <div className="label mb-1">{t(lang, "coordinator_signature")}</div>
          <input
            className="input"
            value={r.coordinatorSignature}
            onChange={(e) =>
              persist({ ...r, coordinatorSignature: e.target.value })
            }
          />
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-khaki">{t(lang, "designed_by")}</p>
    </div>
  );
}
