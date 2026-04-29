import { NextRequest, NextResponse } from "next/server";
import { getDb, touch } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cloId = Number(id);
  const body = (await req.json().catch(() => ({}))) as Partial<{
    name: string;
    maxMark: number;
  }>;
  const db = getDb();
  const courseRow = db
    .prepare(`SELECT course_id AS courseId FROM clos WHERE id = ?`)
    .get(cloId) as { courseId: number } | undefined;
  if (!courseRow) return NextResponse.json({ error: "CLO not found" }, { status: 404 });
  const next =
    (db
      .prepare(`SELECT COALESCE(MAX(sort_order), -1) + 1 AS s FROM assessments WHERE clo_id = ?`)
      .get(cloId) as { s: number }).s;
  const r = db
    .prepare(`INSERT INTO assessments (clo_id, name, max_mark, sort_order) VALUES (?, ?, ?, ?)`)
    .run(cloId, body.name ?? "Assessment", body.maxMark ?? 0, next);
  touch(courseRow.courseId);
  return NextResponse.json({ id: r.lastInsertRowid });
}
