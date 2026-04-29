import { NextRequest, NextResponse } from "next/server";
import { getDb, touch } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest) {
  const body = (await req.json()) as {
    studentId: number;
    assessmentId: number;
    mark: number;
  };
  const db = getDb();
  const courseRow = db
    .prepare(`SELECT course_id AS courseId FROM students WHERE id = ?`)
    .get(body.studentId) as { courseId: number } | undefined;
  if (!courseRow) return NextResponse.json({ error: "Student not found" }, { status: 404 });
  db.prepare(
    `INSERT INTO grades (student_id, assessment_id, mark) VALUES (?, ?, ?)
     ON CONFLICT(student_id, assessment_id) DO UPDATE SET mark = excluded.mark`
  ).run(body.studentId, body.assessmentId, body.mark);
  touch(courseRow.courseId);
  return NextResponse.json({ ok: true });
}
