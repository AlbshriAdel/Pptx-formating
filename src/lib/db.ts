import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

let _db: Database.Database | null = null;

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "clo.sqlite");
const SCHEMA_PATH = path.join(process.cwd(), "db", "schema.sql");

export function getDb(): Database.Database {
  if (_db) return _db;
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  const schema = fs.readFileSync(SCHEMA_PATH, "utf8");
  db.exec(schema);
  const count = db.prepare("SELECT COUNT(*) AS n FROM courses").get() as { n: number };
  if (count.n === 0) seed(db);
  _db = db;
  return db;
}

function seed(db: Database.Database) {
  const insertCourse = db.prepare(
    `INSERT INTO courses (id, code, title, instructor, coordinator, department, semester, year, credits, target_pct, student_pass_pct, lang)
     VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, 75, 60, 'en')`
  );
  insertCourse.run(
    "ENG-301",
    "CLO Measurement — NCAAA Standard",
    "Dr. Adel Albshri",
    "Dr. Course Coordinator",
    "English & Translation",
    "Fall",
    2025,
    3
  );

  const insertClo = db.prepare(
    `INSERT INTO clos (course_id, number, kind, code, description, contact_hours, weight_pct, sort_order)
     VALUES (1, ?, ?, ?, ?, 0, 0, ?)`
  );
  const insertAssess = db.prepare(
    `INSERT INTO assessments (clo_id, name, max_mark, sort_order) VALUES (?, ?, ?, ?)`
  );

  const cloSeeds: Array<{
    number: string;
    kind: "K" | "S" | "V";
    code: string;
    description: string;
  }> = [
    { number: "1.1", kind: "K", code: "K2", description: "understand concepts" },
    {
      number: "2.1",
      kind: "S",
      code: "S3",
      description: "Analyze the future of Bilingualism in Arab universities.",
    },
    {
      number: "3.1",
      kind: "V",
      code: "V1",
      description:
        "Adhere to academic integrity in learning and assessment of the course topics.",
    },
  ];

  const assessmentDefaults = [
    { name: "Assignment", maxMark: 5 },
    { name: "Midterm", maxMark: 5 },
    { name: "Presentation", maxMark: 0 },
    { name: "Final Exam", maxMark: 10 },
  ];

  const cloIds: number[] = [];
  cloSeeds.forEach((c, i) => {
    const r = insertClo.run(c.number, c.kind, c.code, c.description, i);
    const cloId = Number(r.lastInsertRowid);
    cloIds.push(cloId);
    assessmentDefaults.forEach((a, j) => {
      insertAssess.run(cloId, a.name, a.maxMark, j);
    });
  });

  const insertStudent = db.prepare(
    `INSERT INTO students (course_id, student_no, name, sort_order) VALUES (1, ?, ?, ?)`
  );
  const studentIds: number[] = [];
  for (let i = 1; i <= 15; i++) {
    const r = insertStudent.run(`S${String(i).padStart(3, "0")}`, `Student ${i}`, i);
    studentIds.push(Number(r.lastInsertRowid));
  }

  const assessmentRows = db
    .prepare(
      `SELECT a.id AS id, a.clo_id AS cloId, a.name AS name, a.max_mark AS maxMark
       FROM assessments a ORDER BY a.clo_id, a.sort_order`
    )
    .all() as Array<{ id: number; cloId: number; name: string; maxMark: number }>;

  const insertGrade = db.prepare(
    `INSERT OR REPLACE INTO grades (student_id, assessment_id, mark) VALUES (?, ?, ?)`
  );

  const cloAchievementTargets: Record<number, number> = {
    [cloIds[0]]: 5,
    [cloIds[1]]: 3,
    [cloIds[2]]: 4,
  };

  for (const cloId of cloIds) {
    const targetPct = cloAchievementTargets[cloId];
    const cloAssessments = assessmentRows.filter((a) => a.cloId === cloId);
    const cloMax = cloAssessments.reduce((s, a) => s + a.maxMark, 0);
    const targetTotalAcrossStudents = (targetPct / 100) * cloMax * studentIds.length;
    let remaining = targetTotalAcrossStudents;

    for (let si = 0; si < studentIds.length; si++) {
      const studentTarget = remaining / (studentIds.length - si);
      remaining -= studentTarget;
      let studentRem = studentTarget;
      const scoringAssessments = cloAssessments.filter((a) => a.maxMark > 0);
      for (let ai = 0; ai < scoringAssessments.length; ai++) {
        const a = scoringAssessments[ai];
        const remAssess = scoringAssessments.length - ai;
        const wantThis = studentRem / remAssess;
        const give = Math.min(a.maxMark, Math.max(0, Math.round(wantThis * 10) / 10));
        studentRem -= give;
        insertGrade.run(studentIds[si], a.id, give);
      }
      for (const a of cloAssessments.filter((x) => x.maxMark === 0)) {
        insertGrade.run(studentIds[si], a.id, 0);
      }
    }
  }

  db.prepare(
    `INSERT INTO signatures (course_id, instructor_signature, coordinator_signature) VALUES (1, '', '')`
  ).run();
}

export function touch(courseId: number) {
  getDb()
    .prepare(`UPDATE courses SET updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
    .run(courseId);
}
