"use client";

import { useMemo } from "react";
import { useStore } from "../store";
import { t } from "@/lib/i18n";
import { computeResults } from "@/lib/calc";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function Dashboard() {
  const { state } = useStore();
  const lang = state.course.lang;
  const r = useMemo(() => computeResults(state), [state]);

  const labels = r.perCLO.map((c) => `CLO ${c.number}`);
  const values = r.perCLO.map((c) =>
    state.course.metric === "passRate" ? c.passRatePct : c.achievementPct
  );

  const data: ChartData<"bar"> = {
    labels,
    datasets: [
      {
        label: t(lang, "legend_actual"),
        data: values,
        backgroundColor: "#c84b2c",
        borderRadius: 6,
        barThickness: 38,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: "#1c2c50" },
      },
      tooltip: { enabled: true },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          color: "#1c2c50",
          callback: (v) => `${v}%`,
        },
        grid: { color: "rgba(28,44,80,.08)" },
      },
      x: {
        ticks: { color: "#1c2c50" },
        grid: { display: false },
      },
    },
  };

  const targetLine = {
    id: "targetLine",
    afterDraw(chart: ChartJS) {
      const { ctx, chartArea, scales } = chart;
      if (!chartArea) return;
      const y = scales.y.getPixelForValue(state.course.targetPct);
      ctx.save();
      ctx.strokeStyle = "#1c2c50";
      ctx.setLineDash([6, 6]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(chartArea.left, y);
      ctx.lineTo(chartArea.right, y);
      ctx.stroke();
      ctx.fillStyle = "#1c2c50";
      ctx.font = "12px ui-sans-serif, system-ui";
      ctx.fillText(
        `${t(lang, "legend_target")} (${state.course.targetPct}%)`,
        chartArea.right - 110,
        y - 6
      );
      ctx.restore();
    },
  };

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
        <div className="card p-4">
          <div className="text-lg font-semibold">{t(lang, "dashboard_title")}</div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="tile">
            <div className="label">{t(lang, "students_count")}</div>
            <div className="text-2xl font-bold">{r.studentsCount}</div>
          </div>
          <div className="tile">
            <div className="label">{t(lang, "target_pct")}</div>
            <div className="text-2xl font-bold">{r.targetPct}%</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <KPI
          label={t(lang, "total_clos")}
          sub={t(lang, "total_clos_sub")}
          value={r.totalCLOs}
          accent="text-ink"
        />
        <KPI
          label={t(lang, "met_target")}
          sub={t(lang, "met_target_sub", { target: r.targetPct })}
          value={r.metTarget}
          accent="text-leaf"
        />
        <KPI
          label={t(lang, "need_improvement")}
          sub={t(lang, "need_improvement_sub", { target: r.targetPct })}
          value={r.needImprovement}
          accent="text-burnt"
        />
        <KPI
          label={t(lang, "overall")}
          sub={t(lang, "overall_sub")}
          value={`${r.overallPct}%`}
          accent="text-amber-700"
        />
      </div>

      <div className="card p-5">
        <div className="font-semibold">{t(lang, "chart_title")}</div>
        <div className="text-sm text-khaki mb-3">{t(lang, "chart_subtitle")}</div>
        <div className="h-[340px]">
          <Bar data={data} options={options} plugins={[targetLine]} />
        </div>
      </div>
    </div>
  );
}

function KPI({
  label,
  sub,
  value,
  accent,
}: {
  label: string;
  sub: string;
  value: number | string;
  accent: string;
}) {
  return (
    <div className="tile">
      <div className="label">{label}</div>
      <div className={`text-3xl font-bold ${accent}`}>{value}</div>
      <div className="text-xs text-khaki">{sub}</div>
    </div>
  );
}
