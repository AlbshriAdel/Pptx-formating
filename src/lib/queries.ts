import { getDb } from "./db";
import type { CourseState, CLO, Assessment, Student, Grade, ReportState, Course } from "./types";

export function loadCourseState(courseId: number): CourseState | null {
  const db = getDb();
  const courseRow = db
    .prepare(
      `SELECT id, code, title, instructor, coordinator, department, semester, year, credits,
              target_pct AS targetPct, student_pass_pct AS studentPassPct, metric, lang
       FROM courses WHERE id = ?`
    )
    .get(courseId) as Course | undefined;
  if (!courseRow) return null;

  const clos = db
    .prepare(
      `SELECT id, course_id AS courseId, number, kind, code, description,
              contact_hours AS contactHours, weight_pct AS weightPct, sort_order AS sortOrder
       FROM clos WHERE course_id = ? ORDER BY sort_order, id`
    )
    .all(courseId) as Omit<CLO, "assessments">[];

  const assessments = db
    .prepare(
      `SELECT a.id, a.clo_id AS cloId, a.name, a.max_mark AS maxMark, a.sort_order AS sortOrder
       FROM assessments a
       JOIN clos c ON c.id = a.clo_id
       WHERE c.course_id = ?
       ORDER BY a.sort_order, a.id`
    )
    .all(courseId) as Assessment[];

  const closWithAssess: CLO[] = clos.map((c) => ({
    ...c,
    assessments: assessments.filter((a) => a.cloId === c.id),
  }));

  const students = db
    .prepare(
      `SELECT id, course_id AS courseId, student_no AS studentNo, name, sort_order AS sortOrder
       FROM students WHERE course_id = ? ORDER BY sort_order, id`
    )
    .all(courseId) as Student[];

  const grades = db
    .prepare(
      `SELECT g.student_id AS studentId, g.assessment_id AS assessmentId, g.mark
       FROM grades g
       JOIN students s ON s.id = g.student_id
       WHERE s.course_id = ?`
    )
    .all(courseId) as Grade[];

  const topics = db
    .prepare(
      `SELECT id, topic, reason, impact, action FROM topics_not_covered
       WHERE course_id = ? ORDER BY sort_order, id`
    )
    .all(courseId) as ReportState["topics"];

  const plans = db
    .prepare(
      `SELECT id, recommendation, action, support FROM improvement_plans
       WHERE course_id = ? ORDER BY sort_order, id`
    )
    .all(courseId) as ReportState["plans"];

  const sig = db
    .prepare(
      `SELECT instructor_signature AS instructorSignature, coordinator_signature AS coordinatorSignature
       FROM signatures WHERE course_id = ?`
    )
    .get(courseId) as { instructorSignature: string; coordinatorSignature: string } | undefined;

  return {
    course: courseRow,
    clos: closWithAssess,
    students,
    grades,
    report: {
      topics,
      plans,
      instructorSignature: sig?.instructorSignature ?? "",
      coordinatorSignature: sig?.coordinatorSignature ?? "",
    },
  };
}
