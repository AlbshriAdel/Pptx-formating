import { NextRequest, NextResponse } from "next/server";
import { getDb, touch } from "@/lib/db";

export const dynamic = "force-dynamic";

function findCourseId(studentId: number): number | null {
  const row = getDb()
    .prepare(`SELECT course_id AS courseId FROM students WHERE id = ?`)
    .get(studentId) as { courseId: number } | undefined;
  return row?.courseId ?? null;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sid = Number(id);
  const body = (await req.json()) as Record<string, unknown>;
  const allowed: Record<string, string> = {
    studentNo: "student_no",
    name: "name",
    sortOrder: "sort_order",
  };
  const sets: string[] = [];
  const vals: unknown[] = [];
  for (const [k, col] of Object.entries(allowed)) {
    if (k in body) {
      sets.push(`${col} = ?`);
      vals.push(body[k]);
    }
  }
  if (sets.length === 0) return NextResponse.json({ ok: true });
  vals.push(sid);
  getDb().prepare(`UPDATE students SET ${sets.join(", ")} WHERE id = ?`).run(...vals);
  const c = findCourseId(sid);
  if (c) touch(c);
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sid = Number(id);
  const c = findCourseId(sid);
  getDb().prepare(`DELETE FROM students WHERE id = ?`).run(sid);
  if (c) touch(c);
  return NextResponse.json({ ok: true });
}
