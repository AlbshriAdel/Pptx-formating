"use client";

export async function exportToPdf(targetId: string, filename = "clo-tracker.pdf") {
  const target = document.getElementById(targetId);
  if (!target) return;
  const mod = await import("html2pdf.js");
  const html2pdf = mod.default;
  await html2pdf()
    .set({
      filename,
      margin: 8,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: "#fbf6ec" },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    })
    .from(target)
    .save();
}
