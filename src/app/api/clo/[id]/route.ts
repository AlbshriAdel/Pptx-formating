import { NextRequest, NextResponse } from "next/server";
import { getDb, touch } from "@/lib/db";

export const dynamic = "force-dynamic";

function findCourseId(cloId: number): number | null {
  const row = getDb()
    .prepare(`SELECT course_id AS courseId FROM clos WHERE id = ?`)
    .get(cloId) as { courseId: number } | undefined;
  return row?.courseId ?? null;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cloId = Number(id);
  const body = (await req.json()) as Record<string, unknown>;
  const allowed: Record<string, string> = {
    number: "number",
    kind: "kind",
    code: "code",
    description: "description",
    contactHours: "contact_hours",
    weightPct: "weight_pct",
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
  vals.push(cloId);
  getDb().prepare(`UPDATE clos SET ${sets.join(", ")} WHERE id = ?`).run(...vals);
  const c = findCourseId(cloId);
  if (c) touch(c);
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cloId = Number(id);
  const c = findCourseId(cloId);
  getDb().prepare(`DELETE FROM clos WHERE id = ?`).run(cloId);
  if (c) touch(c);
  return NextResponse.json({ ok: true });
}
