import type {
  CLO,
  CLOResult,
  CourseState,
  Grade,
  ResultsSummary,
} from "./types";

export function cloMaxMark(clo: CLO): number {
  return clo.assessments.reduce((s, a) => s + (a.maxMark || 0), 0);
}

export function studentCloPct(
  clo: CLO,
  studentId: number,
  grades: Grade[]
): number | null {
  const max = cloMaxMark(clo);
  if (max <= 0) return null;
  const cloAssessmentIds = new Set(clo.assessments.map((a) => a.id));
  const sg = grades.filter(
    (g) => g.studentId === studentId && cloAssessmentIds.has(g.assessmentId)
  );
  if (sg.length === 0) return null;
  const sum = sg.reduce((s, g) => s + (g.mark || 0), 0);
  return (sum / max) * 100;
}

export function computeResults(state: CourseState): ResultsSummary {
  const { course, clos, students, grades } = state;
  const perCLO: CLOResult[] = clos.map((clo) => {
    const max = cloMaxMark(clo);
    const studentPcts = students
      .map((s) => studentCloPct(clo, s.id, grades))
      .filter((v): v is number => v !== null);
    const achievementPct =
      studentPcts.length > 0
        ? studentPcts.reduce((s, v) => s + v, 0) / studentPcts.length
        : 0;
    const studentsAchieved = studentPcts.filter(
      (v) => v >= course.studentPassPct
    ).length;
    const passRatePct =
      studentPcts.length > 0
        ? (studentsAchieved / studentPcts.length) * 100
        : 0;
    return {
      cloId: clo.id,
      number: clo.number,
      code: clo.code,
      kind: clo.kind,
      description: clo.description,
      maxMark: max,
      achievementPct: round1(achievementPct),
      passRatePct: round1(passRatePct),
      studentsAchieved,
      studentsAssessed: studentPcts.length,
    };
  });
  const metricFor = (r: CLOResult) =>
    course.metric === "passRate" ? r.passRatePct : r.achievementPct;
  const metTarget = perCLO.filter((r) => metricFor(r) >= course.targetPct).length;
  const overall =
    perCLO.length > 0
      ? perCLO.reduce((s, r) => s + metricFor(r), 0) / perCLO.length
      : 0;
  return {
    totalCLOs: clos.length,
    metTarget,
    needImprovement: clos.length - metTarget,
    overallPct: round1(overall),
    perCLO,
    studentsCount: students.length,
    targetPct: course.targetPct,
    metric: course.metric,
  };
}

function round1(v: number): number {
  return Math.round(v * 10) / 10;
}

export function grandTotal(clos: CLO[]): number {
  return clos.reduce((s, c) => s + cloMaxMark(c), 0);
}
