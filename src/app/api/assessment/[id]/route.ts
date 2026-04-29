import { NextRequest, NextResponse } from "next/server";
import { getDb, touch } from "@/lib/db";

export const dynamic = "force-dynamic";

function findCourseId(assessmentId: number): number | null {
  const row = getDb()
    .prepare(
      `SELECT c.course_id AS courseId
       FROM assessments a JOIN clos c ON c.id = a.clo_id
       WHERE a.id = ?`
    )
    .get(assessmentId) as { courseId: number } | undefined;
  return row?.courseId ?? null;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const aid = Number(id);
  const body = (await req.json()) as Record<string, unknown>;
  const allowed: Record<string, string> = {
    name: "name",
    maxMark: "max_mark",
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
  vals.push(aid);
  getDb().prepare(`UPDATE assessments SET ${sets.join(", ")} WHERE id = ?`).run(...vals);
  const c = findCourseId(aid);
  if (c) touch(c);
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const aid = Number(id);
  const c = findCourseId(aid);
  getDb().prepare(`DELETE FROM assessments WHERE id = ?`).run(aid);
  if (c) touch(c);
  return NextResponse.json({ ok: true });
}
