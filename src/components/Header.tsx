"use client";

import { useStore } from "./store";
import { t } from "@/lib/i18n";
import { exportToPdf } from "@/lib/pdf";

export default function Header() {
  const { state, setLang, saveToast } = useStore();
  const lang = state.course.lang;

  const downloadXlsx = () => {
    window.location.href = `/api/course/${state.course.id}/export`;
  };

  const onSave = () => {
    saveToast(t(lang, "saved"));
  };

  const onPrint = async () => {
    try {
      await exportToPdf("print-root", `clo-tracker-${state.course.code || "course"}.pdf`);
    } catch {
      window.print();
    }
  };

  const toggleLang = async () => {
    await setLang(lang === "en" ? "ar" : "en");
  };

  return (
    <div className="grid grid-cols-12 gap-5 print:gap-2">
      <div className="col-span-12 lg:col-span-3 no-print">
        <h1 className="font-display text-5xl font-bold leading-tight text-ink">
          {t(lang, "app_title")}
        </h1>
        <p className="text-sm text-khaki mt-1">{t(lang, "app_subtitle")}</p>
      </div>

      <div className="col-span-12 lg:col-span-9">
        <div className="card p-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-ink grid place-items-center text-white">
                <span className="text-lg">▦</span>
              </div>
              <div>
                <div className="font-semibold text-ink">
                  {t(lang, "header_course_title")}
                </div>
                <div className="text-xs text-khaki">
                  {t(lang, "header_course_subtitle")}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 no-print">
              <button className="btn" onClick={onSave} title={t(lang, "save")}>
                💾 {t(lang, "save")}
              </button>
              <button className="btn" onClick={downloadXlsx}>
                ⬇ {t(lang, "export_excel")}
              </button>
              <button className="btn" onClick={onPrint}>
                🖨 {t(lang, "print_pdf")}
              </button>
              <button className="btn" onClick={toggleLang}>
                🌐 {t(lang, "language_toggle")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
