"use client";

import { useStore } from "../store";
import { t } from "@/lib/i18n";
import type { CLO, Assessment, CLOKind } from "@/lib/types";
import { cloMaxMark, grandTotal } from "@/lib/calc";

const kindStyle: Record<CLOKind, string> = {
  K: "bg-blue-50 border-blue-200 text-blue-900",
  S: "bg-amber-50 border-amber-200 text-amber-900",
  V: "bg-emerald-50 border-emerald-200 text-emerald-900",
};

export default function AssessmentMatrix() {
  const { state, refresh, saveToast } = useStore();
  const lang = state.course.lang;
  const total = grandTotal(state.clos);

  const addClo = async () => {
    const nextNum = `${state.clos.length + 1}.1`;
    const cycle: CLOKind[] = ["K", "S", "V"];
    const kind = cycle[state.clos.length % 3];
    const code = `${kind}${state.clos.length + 1}`;
    await fetch(`/api/course/${state.course.id}/clo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        number: nextNum,
        kind,
        code,
        description: "New CLO",
      }),
    });
    await refresh();
    saveToast(t(lang, "saved"));
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-4 gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded-md bg-ink text-white grid place-items-center font-bold">
            1
          </div>
          <div>
            <h2 className="text-xl font-semibold">{t(lang, "matrix_title")}</h2>
            <p className="text-sm text-khaki">{t(lang, "matrix_sub")}</p>
          </div>
        </div>
        <div className="rounded-xl bg-sand/60 px-4 py-2 text-center">
          <div className="label">{t(lang, "grand_total")}</div>
          <div className="text-2xl font-bold text-burnt">{total}</div>
        </div>
      </div>

      <div className="space-y-4">
        {state.clos.map((c) => (
          <CLOCard key={c.id} clo={c} />
        ))}
      </div>

      <div className="mt-4">
        <button className="btn" onClick={addClo}>
          {t(lang, "add_clo")}
        </button>
      </div>
    </div>
  );
}

function CLOCard({ clo }: { clo: CLO }) {
  const { state, setState, refresh, saveToast } = useStore();
  const lang = state.course.lang;
  const max = cloMaxMark(clo);

  const updateClo = async (patch: Partial<CLO>) => {
    setState({
      ...state,
      clos: state.clos.map((c) => (c.id === clo.id ? { ...c, ...patch } : c)),
    });
    await fetch(`/api/clo/${clo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
  };

  const addAssessment = async () => {
    await fetch(`/api/clo/${clo.id}/assessment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Assessment", maxMark: 0 }),
    });
    await refresh();
    saveToast(t(lang, "saved"));
  };

  const deleteClo = async () => {
    await fetch(`/api/clo/${clo.id}`, { method: "DELETE" });
    await refresh();
    saveToast(t(lang, "saved"));
  };

  return (
    <div className={`rounded-xl border ${kindStyle[clo.kind]} p-4`}>
      <div className="flex items-center gap-3 flex-wrap">
        <span className="rounded-md bg-white/70 border border-current/20 px-2 py-0.5 text-xs font-mono">
          {clo.number}
        </span>
        <input
          className="input max-w-[80px] font-bold text-sm"
          value={clo.code}
          onChange={(e) => updateClo({ code: e.target.value })}
        />
        <input
          className="input flex-1 min-w-[200px]"
          value={clo.description}
          onChange={(e) => updateClo({ description: e.target.value })}
        />
        <div className="flex items-center gap-3 text-xs">
          <span>
            {t(lang, "contact_hours")}:{" "}
            <input
              className="input inline-block w-16 ms-1"
              type="number"
              value={clo.contactHours}
              onChange={(e) => updateClo({ contactHours: Number(e.target.value) })}
            />
          </span>
          <span>
            {t(lang, "weight")}:{" "}
            <input
              className="input inline-block w-16 ms-1"
              type="number"
              value={clo.weightPct}
              onChange={(e) => updateClo({ weightPct: Number(e.target.value) })}
            />
          </span>
          <span className="font-semibold">
            {t(lang, "total_marks")}: {max}
          </span>
          <button className="btn !py-1 !px-2 text-xs" onClick={deleteClo}>
            🗑
          </button>
        </div>
      </div>

      <div className="mt-3 rounded-lg bg-white/70 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-khaki bg-sand/40">
              <th className="px-3 py-2 font-medium">{t(lang, "assessment")}</th>
              <th className="px-3 py-2 font-medium w-32">{t(lang, "max_mark")}</th>
              <th className="px-3 py-2 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {clo.assessments.map((a) => (
              <AssessmentRow key={a.id} a={a} />
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3">
        <button className="btn !text-sm" onClick={addAssessment}>
          {t(lang, "add_assessment")}
        </button>
      </div>
    </div>
  );
}

function AssessmentRow({ a }: { a: Assessment }) {
  const { state, setState, refresh, saveToast } = useStore();
  const lang = state.course.lang;

  const update = async (patch: Partial<Assessment>) => {
    setState({
      ...state,
      clos: state.clos.map((c) =>
        c.id === a.cloId
          ? {
              ...c,
              assessments: c.assessments.map((x) =>
                x.id === a.id ? { ...x, ...patch } : x
              ),
            }
          : c
      ),
    });
    await fetch(`/api/assessment/${a.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
  };

  const remove = async () => {
    await fetch(`/api/assessment/${a.id}`, { method: "DELETE" });
    await refresh();
    saveToast(t(lang, "saved"));
  };

  return (
    <tr className="border-t border-sand/60">
      <td className="px-3 py-2">
        <input
          className="input"
          value={a.name}
          onChange={(e) => update({ name: e.target.value })}
        />
      </td>
      <td className="px-3 py-2">
        <input
          className="input"
          type="number"
          min={0}
          value={a.maxMark}
          onChange={(e) => update({ maxMark: Number(e.target.value) })}
        />
      </td>
      <td className="px-3 py-2">
        <button className="btn !py-1 !px-2 text-xs" onClick={remove} aria-label="delete">
          🗑
        </button>
      </td>
    </tr>
  );
}
