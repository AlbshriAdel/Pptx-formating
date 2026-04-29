import { NextRequest, NextResponse } from "next/server";
import { loadCourseState } from "@/lib/queries";
import { workbookBuffer } from "@/lib/excel";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const courseId = Number(id);
  const state = loadCourseState(courseId);
  if (!state) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const buf = workbookBuffer(state);
  const body = new Uint8Array(buf);
  const filename = `clo-tracker-${state.course.code || "course"}.xlsx`;
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(body.byteLength),
    },
  });
}
