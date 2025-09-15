"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import dayjs from "dayjs";

/**
 * Try to extract a numeric value from a value that might be a number or a formatted string.
 */
function parseNumberFromFormatted(value) {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number" && Number.isFinite(value)) return value;

  const s = String(value).replace(/\u00A0/g, " ").trim(); // normalize NBSP
  let cleaned = s.replace(/,/g, "").replace(/\s+/g, "");
  const m = cleaned.match(/-?\d+(\.\d+)?/);
  if (m) return Number(m[0]);
  cleaned = cleaned.replace(/[^\d.-]/g, "");
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : 0;
}

/** Extract visible prefix/suffix currency markers from a formatted string. */
function extractCurrencyAffixes(example) {
  const result = { prefix: "", suffix: "" };
  if (!example || typeof example !== "string") return result;
  const s = example.replace(/\u00A0/g, " ").trim();

  const pre = s.match(/^\s*([^\d\-\.\s]+)/);
  if (pre) result.prefix = pre[1].trim();

  const suf = s.match(/([^\d\.\s]+)\s*$/);
  if (suf) result.suffix = suf[1].trim();

  return result;
}

/** Decide final display prefix/suffix and format number accordingly. */
function formatTotalsNumber(n, affixes) {
  const { prefix = "", suffix = "" } = affixes || {};
  const affixStr = `${prefix} ${suffix}`.toLowerCase();

  const isINR = /₹|rs\b|inr\b/.test(affixStr);
  if (isINR) {
    // Use "Rs." explicitly for INR and no decimals
    const numStr = Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });
    return `Rs. ${numStr}`;
  }

  // If prefix looks like a known currency symbol (like $ or €) keep it.
  // For other cases (e.g. "AUD" in suffix) we'll keep them as-is and show 2 decimals.
  const formatted = Number(n).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // If prefix exists (symbol before number) return prefix + number + optional suffix.
  if (prefix) return `${prefix}${formatted}${suffix ? " " + suffix : ""}`;
  if (suffix) return `${formatted}${suffix}`;
  return formatted;
}

/**
 * Generate a PDF report with totals using jsPDF and autoTable
 * @param {Array} items - Array of report data. amount may be number OR formatted string.
 * @param {String} scope - "all" | "income" | "expenses"
 * @param {Object} dateRange - { startDate: dayjs, endDate: dayjs }
 * @param {String} filenamePrefix - Prefix for saved file
 */
export const CustomAutoTable = (items, scope, dateRange, filenamePrefix = "report") => {
  // Build rows: keep original amount string when present, also compute numeric value
  const rows = items.map((row) => {
    const guessedType =
      row.type ||
      (scope === "income" ? "Income" : scope === "expenses" ? "Expense" : row.source ? "Income" : "Expense");

    const originalAmount = row.amount ?? row.formattedAmount ?? 0;
    const numericAmount = parseNumberFromFormatted(row.amount ?? row.formattedAmount ?? 0);

    return {
      date: row.date ? dayjs(row.date).format("DD-MM-YYYY") : "-",
      type: guessedType,
      amountRaw: numericAmount,
      amountDisplay: typeof originalAmount === "number" ? originalAmount : String(originalAmount),
      catOrSource: row.category || row.source || "-",
      note: row.note || "-",
    };
  });

  // Calculate totals (numeric)
  let totalIncome = 0;
  let totalExpense = 0;
  rows.forEach((r) => {
    if ((r.type || "").toLowerCase() === "income") totalIncome += Number(r.amountRaw || 0);
    else totalExpense += Number(r.amountRaw || 0);
  });

  // Detect currency affixes from the first row that has a string amount
  const exampleRow = rows.find((r) => typeof r.amountDisplay === "string" && /[^\d\.\-]/.test(r.amountDisplay));
  const affixes = exampleRow ? extractCurrencyAffixes(String(exampleRow.amountDisplay)) : { prefix: "", suffix: "" };

  const doc = new jsPDF("portrait", "pt", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;

  // Title
  doc.setFontSize(14);
  doc.text(`Report (${scope})`, margin, 40);

  // Date Range
  doc.setFontSize(10);
  const fromText = dateRange?.startDate ? dateRange.startDate.format("DD-MM-YYYY") : "-";
  const toText = dateRange?.endDate ? dateRange.endDate.format("DD-MM-YYYY") : "-";
  doc.text(`From: ${fromText}  To: ${toText}`, margin, 60);

  // Totals at top-right (formatted using heuristic)
  const totalsText = [
    `Total Income: ${formatTotalsNumber(totalIncome, affixes)}`,
    `Total Expense: ${formatTotalsNumber(totalExpense, affixes)}`,
    `Net balance: ${formatTotalsNumber(totalIncome - totalExpense, affixes)}`,
  ];

  doc.setFontSize(11);

  // Maximum width for totals block (so it doesn't overflow)
  const maxTotalsWidth = pageWidth - margin * 2; // totals block will be constrained to page width minus margins
  // We'll right-align each line to (pageWidth - margin)
  let yBase = 40; // align with title top-right area
  const lineSpacing = 14;

  totalsText.forEach((text, idx) => {
    // split long text into wrapped lines that fit within maxTotalsWidth
    const wrapped = doc.splitTextToSize(text, maxTotalsWidth);
    // place wrapped lines bottom-to-top relative to this idx (so each totals entry doesn't overlap next)
    wrapped.forEach((line, wIdx) => {
      const drawY = yBase + idx * (lineSpacing * Math.max(1, wrapped.length)) + wIdx * lineSpacing;
      // ensure we don't draw beyond page top area - but top is safe; if drawY is too close to top, move down slightly
      const textWidth = doc.getTextWidth(line);
      doc.text(line, pageWidth - margin - textWidth, drawY);
    });
  });

  // Table
  const head = [["Date", "Type", "Category/Source", "Note", "Amount"]];
  const body = rows.map((r) => [r.date, r.type, r.catOrSource, r.note, r.amountDisplay]);

  autoTable(doc, {
    head,
    body,
    startY: 100,
    margin: { left: margin, right: margin },
    styles: { fontSize: 10, cellPadding: 4 },
    headStyles: { fillColor: [40, 40, 40], textColor: 255, halign: "center" },
    // avoid fixed tiny widths which can push cells off page; allow auto widths but set alignment
    columnStyles: {
      0: { halign: "center" }, // Date
      1: { halign: "center" }, // Type
      2: { halign: "center" },   // Category/Source
      3: { halign: "center" },   // Note
      4: { halign: "center", cellWidth: 80 }, // Amount (right align and reasonable width)
    },
    didDrawPage: function (data) {
      // Optional: we could re-draw totals at each page's header if needed.
    },
  });

  const filename = `${filenamePrefix}_${scope}_${fromText.replace(/-/g, "")}_${toText.replace(/-/g, "")}.pdf`;
  doc.save(filename);
};
