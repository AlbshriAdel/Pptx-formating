import { NextRequest, NextResponse } from "next/server";
import { getDb, touch } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const courseId = Number(id);
  const body = (await req.json().catch(() => ({}))) as Partial<{
    studentNo: string;
    name: string;
  }>;
  const db = getDb();
  const next =
    (db
      .prepare(`SELECT COALESCE(MAX(sort_order), 0) + 1 AS s FROM students WHERE course_id = ?`)
      .get(courseId) as { s: number }).s;
  const studentNo = body.studentNo ?? `S${String(next).padStart(3, "0")}`;
  const name = body.name ?? `Student ${next}`;
  const r = db
    .prepare(
      `INSERT INTO students (course_id, student_no, name, sort_order) VALUES (?, ?, ?, ?)`
    )
    .run(courseId, studentNo, name, next);
  touch(courseId);
  return NextResponse.json({ id: r.lastInsertRowid });
}
