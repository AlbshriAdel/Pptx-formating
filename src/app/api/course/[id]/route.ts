import { NextRequest, NextResponse } from "next/server";
import { getDb, touch } from "@/lib/db";
import { loadCourseState } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const courseId = Number(id);
  const state = loadCourseState(courseId);
  if (!state) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(state);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const courseId = Number(id);
  const body = (await req.json()) as Record<string, unknown>;
  const allowed: Record<string, string> = {
    code: "code",
    title: "title",
    instructor: "instructor",
    coordinator: "coordinator",
    department: "department",
    semester: "semester",
    year: "year",
    credits: "credits",
    targetPct: "target_pct",
    studentPassPct: "student_pass_pct",
    metric: "metric",
    lang: "lang",
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
  vals.push(courseId);
  getDb()
    .prepare(`UPDATE courses SET ${sets.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
    .run(...vals);
  return NextResponse.json({ ok: true });
}
