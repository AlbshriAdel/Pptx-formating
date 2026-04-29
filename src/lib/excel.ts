import * as XLSX from "xlsx";
import type { CourseState, ResultsSummary } from "./types";
import { computeResults } from "./calc";

export function buildWorkbook(state: CourseState): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();
  const { course, clos, students, grades, report } = state;
  const results: ResultsSummary = computeResults(state);

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet([
      ["Field", "Value"],
      ["Course Code", course.code],
      ["Course Title", course.title],
      ["Instructor", course.instructor],
      ["Coordinator", course.coordinator],
      ["Department", course.department],
      ["Semester", course.semester],
      ["Year", course.year],
      ["Credits", course.credits],
      ["Target %", course.targetPct],
      ["Student Pass %", course.studentPassPct],
      ["Metric", course.metric],
      ["Language", course.lang],
    ]),
    "Course"
  );

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet([
      ["#", "Kind", "Code", "Description", "Contact Hours", "Weight %", "Total Max"],
      ...clos.map((c) => [
        c.number,
        c.kind,
        c.code,
        c.description,
        c.contactHours,
        c.weightPct,
        c.assessments.reduce((s, a) => s + a.maxMark, 0),
      ]),
    ]),
    "CLOs"
  );

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet([
      ["CLO #", "CLO Code", "Assessment", "Max Mark"],
      ...clos.flatMap((c) =>
        c.assessments.map((a) => [c.number, c.code, a.name, a.maxMark])
      ),
    ]),
    "Assessments"
  );

  const assessmentColumns = clos.flatMap((c) =>
    c.assessments.map((a) => ({ id: a.id, label: `${c.code} · ${a.name}` }))
  );

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet([
      ["Student #", "Name", ...assessmentColumns.map((a) => a.label)],
      ...students.map((s) => [
        s.studentNo,
        s.name,
        ...assessmentColumns.map(
          (a) => grades.find((g) => g.studentId === s.id && g.assessmentId === a.id)?.mark ?? 0
        ),
      ]),
    ]),
    "Grades"
  );

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet([
      [
        "CLO #",
        "Code",
        "Description",
        "Max",
        "Achievement %",
        "Pass-rate %",
        "Students Achieved",
        "Students Assessed",
        "Status",
      ],
      ...results.perCLO.map((r) => {
        const v = course.metric === "passRate" ? r.passRatePct : r.achievementPct;
        return [
          r.number,
          r.code,
          r.description,
          r.maxMark,
          r.achievementPct,
          r.passRatePct,
          r.studentsAchieved,
          r.studentsAssessed,
          v >= course.targetPct ? "Met" : "Needs Improvement",
        ];
      }),
      [],
      ["Summary"],
      ["Total CLOs", results.totalCLOs],
      ["Met Target", results.metTarget],
      ["Need Improvement", results.needImprovement],
      ["Overall %", results.overallPct],
    ]),
    "Results"
  );

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet([
      ["Topics Not Covered"],
      ["Topic", "Reason", "Impact", "Compensating Action"],
      ...report.topics.map((t) => [t.topic, t.reason, t.impact, t.action]),
      [],
      ["Improvement Plan"],
      ["Recommendation", "Action", "Needed Support"],
      ...report.plans.map((p) => [p.recommendation, p.action, p.support]),
      [],
      ["Instructor Signature", report.instructorSignature],
      ["Coordinator Signature", report.coordinatorSignature],
    ]),
    "Report"
  );

  return wb;
}

export function workbookBuffer(state: CourseState): Buffer {
  const wb = buildWorkbook(state);
  const out = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  return out as Buffer;
}
