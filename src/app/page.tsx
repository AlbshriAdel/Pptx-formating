import { loadCourseState } from "@/lib/queries";
import { getDb } from "@/lib/db";
import App from "@/components/App";

export const dynamic = "force-dynamic";

export default async function Page() {
  getDb();
  const state = loadCourseState(1);
  if (!state) {
    return <div className="p-8">Failed to load course.</div>;
  }
  return <App initialState={state} />;
}
