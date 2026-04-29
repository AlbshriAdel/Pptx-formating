"use client";

import { useStore } from "../store";
import { t } from "@/lib/i18n";
import type { Course, Metric } from "@/lib/types";

function debounce<A extends unknown[]>(
  fn: (...args: A) => void,
  ms = 350
): (...args: A) => void {
  let h: ReturnType<typeof setTimeout> | null = null;
  return (...args: A) => {
    if (h) clearTimeout(h);
    h = setTimeout(() => fn(...args), ms);
  };
}

export default function CourseInfo() {
  const { state, setState, saveToast } = useStore();
  const lang = state.course.lang;
  const c = state.course;

  const send = debounce(async (patch: Partial<Course>) => {
    await fetch(`/api/course/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    saveToast(t(lang, "saved"));
  }, 400);

  const update = <K extends keyof Course>(k: K, v: Course[K]) => {
    setState({ ...state, course: { ...c, [k]: v } });
    send({ [k]: v } as Partial<Course>);
  };

  const Field = ({
    label,
    children,
  }: {
    label: string;
    children: React.ReactNode;
  }) => (
    <label className="block">
      <div className="label mb-1">{label}</div>
      {children}
    </label>
  );

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className="h-7 w-7 rounded-md bg-ink text-white grid place-items-center font-bold">
          0
        </div>
        <h2 className="text-xl font-semibold">{t(lang, "course_info")}</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Field label={t(lang, "course_code")}>
          <input
            className="input"
            value={c.code}
            onChange={(e) => update("code", e.target.value)}
          />
        </Field>
        <Field label={t(lang, "course_title_label")}>
          <input
            className="input"
            value={c.title}
            onChange={(e) => update("title", e.target.value)}
          />
        </Field>
        <Field label={t(lang, "instructor")}>
          <input
            className="input"
            value={c.instructor}
            onChange={(e) => update("instructor", e.target.value)}
          />
        </Field>
        <Field label={t(lang, "coordinator")}>
          <input
            className="input"
            value={c.coordinator}
            onChange={(e) => update("coordinator", e.target.value)}
          />
        </Field>
        <Field label={t(lang, "department")}>
          <input
            className="input"
            value={c.department}
            onChange={(e) => update("department", e.target.value)}
          />
        </Field>
        <Field label={t(lang, "semester")}>
          <input
            className="input"
            value={c.semester}
            onChange={(e) => update("semester", e.target.value)}
          />
        </Field>
        <Field label={t(lang, "year")}>
          <input
            className="input"
            type="number"
            value={c.year}
            onChange={(e) => update("year", Number(e.target.value))}
          />
        </Field>
        <Field label={t(lang, "credits")}>
          <input
            className="input"
            type="number"
            value={c.credits}
            onChange={(e) => update("credits", Number(e.target.value))}
          />
        </Field>
        <Field label={t(lang, "target_pct")}>
          <input
            className="input"
            type="number"
            min={0}
            max={100}
            value={c.targetPct}
            onChange={(e) => update("targetPct", Number(e.target.value))}
          />
        </Field>
        <Field label={t(lang, "student_pass_pct")}>
          <input
            className="input"
            type="number"
            min={0}
            max={100}
            value={c.studentPassPct}
            onChange={(e) => update("studentPassPct", Number(e.target.value))}
          />
        </Field>
        <Field label={t(lang, "metric_label")}>
          <select
            className="input"
            value={c.metric}
            onChange={(e) => update("metric", e.target.value as Metric)}
          >
            <option value="mean">{t(lang, "metric_mean")}</option>
            <option value="passRate">{t(lang, "metric_passrate")}</option>
          </select>
        </Field>
      </div>
    </div>
  );
}
