"use client";

import { useState } from "react";
import { useStore } from "../store";
import { t } from "@/lib/i18n";
import type { Student } from "@/lib/types";

export default function Grades() {
  const { state, setState, refresh, saveToast } = useStore();
  const lang = state.course.lang;

  const allAssessments = state.clos.flatMap((c) =>
    c.assessments.map((a) => ({ clo: c, a }))
  );

  const addStudent = async () => {
    await fetch(`/api/course/${state.course.id}/student`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    await refresh();
    saveToast(t(lang, "saved"));
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-4 flex-wrap justify-between">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded-md bg-ink text-white grid place-items-center font-bold">
            2
          </div>
          <div>
            <h2 className="text-xl font-semibold">{t(lang, "grades_title")}</h2>
            <p className="text-sm text-khaki">{t(lang, "grades_sub")}</p>
          </div>
        </div>
        <button className="btn" onClick={addStudent}>
          {t(lang, "add_student")}
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-sand bg-white">
        <table className="text-sm w-full">
          <thead>
            <tr className="bg-sand/40 text-khaki">
              <th className="px-3 py-2 text-start sticky start-0 bg-sand/40 z-10">
                {t(lang, "student_no")}
              </th>
              <th className="px-3 py-2 text-start">{t(lang, "student_name")}</th>
              {state.clos.map((c) => (
                <th
                  key={c.id}
                  colSpan={c.assessments.length || 1}
                  className="px-3 py-2 text-center border-s border-sand"
                >
                  <span className="rounded bg-white px-1.5 py-0.5 text-xs me-1 font-mono">
                    {c.number}
                  </span>
                  <span className="font-semibold">{c.code}</span>
                </th>
              ))}
              <th className="px-3 py-2 w-10"></th>
            </tr>
            <tr className="bg-sand/20 text-khaki">
              <th></th>
              <th></th>
              {allAssessments.map(({ clo, a }) => (
                <th key={a.id} className="px-2 py-1 text-xs font-medium">
                  {a.name}
                  <div className="text-[10px] opacity-70">/{a.maxMark}</div>
                </th>
              ))}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {state.students.map((s) => (
              <StudentRow key={s.id} s={s} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StudentRow({ s }: { s: Student }) {
  const { state, setState, refresh, saveToast } = useStore();
  const lang = state.course.lang;
  const allAssessments = state.clos.flatMap((c) => c.assessments);

  const updateStudent = async (patch: Partial<Student>) => {
    setState({
      ...state,
      students: state.students.map((x) =>
        x.id === s.id ? { ...x, ...patch } : x
      ),
    });
    await fetch(`/api/student/${s.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
  };

  const remove = async () => {
    await fetch(`/api/student/${s.id}`, { method: "DELETE" });
    await refresh();
    saveToast(t(lang, "saved"));
  };

  const setMark = async (assessmentId: number, mark: number) => {
    const exists = state.grades.find(
      (g) => g.studentId === s.id && g.assessmentId === assessmentId
    );
    const next = exists
      ? state.grades.map((g) =>
          g.studentId === s.id && g.assessmentId === assessmentId
            ? { ...g, mark }
            : g
        )
      : [...state.grades, { studentId: s.id, assessmentId, mark }];
    setState({ ...state, grades: next });
    await fetch(`/api/grade`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: s.id, assessmentId, mark }),
    });
  };

  return (
    <tr className="border-t border-sand/60">
      <td className="px-3 py-1.5 sticky start-0 bg-white">
        <input
          className="input"
          value={s.studentNo}
          onChange={(e) => updateStudent({ studentNo: e.target.value })}
        />
      </td>
      <td className="px-3 py-1.5">
        <input
          className="input"
          value={s.name}
          onChange={(e) => updateStudent({ name: e.target.value })}
        />
      </td>
      {allAssessments.map((a) => {
        const g = state.grades.find(
          (x) => x.studentId === s.id && x.assessmentId === a.id
        );
        return (
          <td key={a.id} className="px-2 py-1.5">
            <MarkInput
              value={g?.mark ?? 0}
              maxMark={a.maxMark}
              onChange={(v) => setMark(a.id, v)}
            />
          </td>
        );
      })}
      <td className="px-2 py-1.5">
        <button className="btn !py-1 !px-2 text-xs" onClick={remove}>
          🗑
        </button>
      </td>
    </tr>
  );
}

function MarkInput({
  value,
  maxMark,
  onChange,
}: {
  value: number;
  maxMark: number;
  onChange: (v: number) => void;
}) {
  const [v, setV] = useState(String(value));
  return (
    <input
      className="input w-20"
      type="number"
      min={0}
      max={maxMark}
      step={0.5}
      value={v}
      onChange={(e) => setV(e.target.value)}
      onBlur={() => {
        const n = Number(v);
        const clamped = Math.max(0, Math.min(maxMark, isNaN(n) ? 0 : n));
        setV(String(clamped));
        onChange(clamped);
      }}
    />
  );
}
