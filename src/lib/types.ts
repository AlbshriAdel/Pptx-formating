export type CLOKind = "K" | "S" | "V";
export type Lang = "en" | "ar";
export type Metric = "mean" | "passRate";

export interface Course {
  id: number;
  code: string;
  title: string;
  instructor: string;
  coordinator: string;
  department: string;
  semester: string;
  year: number;
  credits: number;
  targetPct: number;
  studentPassPct: number;
  metric: Metric;
  lang: Lang;
}

export interface Assessment {
  id: number;
  cloId: number;
  name: string;
  maxMark: number;
  sortOrder: number;
}

export interface CLO {
  id: number;
  courseId: number;
  number: string;
  kind: CLOKind;
  code: string;
  description: string;
  contactHours: number;
  weightPct: number;
  sortOrder: number;
  assessments: Assessment[];
}

export interface Student {
  id: number;
  courseId: number;
  studentNo: string;
  name: string;
  sortOrder: number;
}

export interface Grade {
  studentId: number;
  assessmentId: number;
  mark: number;
}

export interface TopicNotCovered {
  id: number;
  topic: string;
  reason: string;
  impact: string;
  action: string;
}

export interface ImprovementPlan {
  id: number;
  recommendation: string;
  action: string;
  support: string;
}

export interface ReportState {
  topics: TopicNotCovered[];
  plans: ImprovementPlan[];
  instructorSignature: string;
  coordinatorSignature: string;
}

export interface CourseState {
  course: Course;
  clos: CLO[];
  students: Student[];
  grades: Grade[];
  report: ReportState;
}

export interface CLOResult {
  cloId: number;
  number: string;
  code: string;
  kind: CLOKind;
  description: string;
  maxMark: number;
  achievementPct: number;
  passRatePct: number;
  studentsAchieved: number;
  studentsAssessed: number;
}

export interface ResultsSummary {
  totalCLOs: number;
  metTarget: number;
  needImprovement: number;
  overallPct: number;
  perCLO: CLOResult[];
  studentsCount: number;
  targetPct: number;
  metric: Metric;
}
