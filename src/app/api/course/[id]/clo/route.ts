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
    number: string;
    kind: string;
    code: string;
    description: string;
  }>;
  const db = getDb();
  const next =
    (db
      .prepare(`SELECT COALESCE(MAX(sort_order), -1) + 1 AS s FROM clos WHERE course_id = ?`)
      .get(courseId) as { s: number }).s;
  const r = db
    .prepare(
      `INSERT INTO clos (course_id, number, kind, code, description, sort_order)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(
      courseId,
      body.number ?? `${next + 1}.1`,
      body.kind ?? "K",
      body.code ?? "",
      body.description ?? "",
      next
    );
  touch(courseId);
  return NextResponse.json({ id: r.lastInsertRowid });
}
