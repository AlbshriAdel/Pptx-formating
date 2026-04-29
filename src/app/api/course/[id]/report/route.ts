import { NextRequest, NextResponse } from "next/server";
import { getDb, touch } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const courseId = Number(id);
  const body = (await req.json()) as {
    topics: { topic: string; reason: string; impact: string; action: string }[];
    plans: { recommendation: string; action: string; support: string }[];
    instructorSignature: string;
    coordinatorSignature: string;
  };
  const db = getDb();
  const tx = db.transaction(() => {
    db.prepare(`DELETE FROM topics_not_covered WHERE course_id = ?`).run(courseId);
    const insT = db.prepare(
      `INSERT INTO topics_not_covered (course_id, topic, reason, impact, action, sort_order)
       VALUES (?, ?, ?, ?, ?, ?)`
    );
    body.topics.forEach((t, i) =>
      insT.run(courseId, t.topic, t.reason, t.impact, t.action, i)
    );

    db.prepare(`DELETE FROM improvement_plans WHERE course_id = ?`).run(courseId);
    const insP = db.prepare(
      `INSERT INTO improvement_plans (course_id, recommendation, action, support, sort_order)
       VALUES (?, ?, ?, ?, ?)`
    );
    body.plans.forEach((p, i) =>
      insP.run(courseId, p.recommendation, p.action, p.support, i)
    );

    db.prepare(
      `INSERT INTO signatures (course_id, instructor_signature, coordinator_signature)
       VALUES (?, ?, ?)
       ON CONFLICT(course_id) DO UPDATE SET
         instructor_signature = excluded.instructor_signature,
         coordinator_signature = excluded.coordinator_signature`
    ).run(courseId, body.instructorSignature, body.coordinatorSignature);
  });
  tx();
  touch(courseId);
  return NextResponse.json({ ok: true });
}
