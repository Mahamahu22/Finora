const PDFDocument = require("pdfkit");

function exportPDF(data, scope, filterInfo = {}) {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ margin: 40 });
    const chunks = [];

    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => {
      resolve({
        name: `${scope}_report.pdf`,
        buffer: Buffer.concat(chunks),
      });
    });

    // ===== HEADER =====
    doc.fontSize(20).font("Helvetica-Bold").text("Finora Report", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(14).font("Helvetica").text(`${scope}`, { align: "center" });

    if (filterInfo.range) {
      doc.moveDown(0.2);
      doc.fontSize(10).fillColor("gray")
        .text(`Range: ${filterInfo.range}`, { align: "center" });
    }
    doc.moveDown(1);
    doc.fillColor("black");

    // ===== NO DATA =====
    if (!data.length) {
      doc.fontSize(12).text("No data available.", { align: "center" });
      doc.end();
      return;
    }

    // Helper to render a table
    const renderTable = (items, title, startY = 120) => {
      let y = startY;

      doc.moveDown(1);
      doc.font("Helvetica-Bold").fontSize(13).text(title, 50, y);
      y += 25;

      const colWidths = [40, 100, 120, 100, 160];
      const colX = [50, 90, 190, 310, 410];

      doc.fontSize(12).font("Helvetica-Bold");
      const headers = ["No", "Amount", "Category/Source", "Date", "Note"];
      headers.forEach((h, i) => {
        doc.text(h, colX[i], y, { width: colWidths[i], align: "left" });
      });

      y += 20;
      doc.moveTo(50, y - 5).lineTo(560, y - 5).stroke();

      doc.font("Helvetica").fontSize(10);

      items.forEach((it, idx) => {
        const rowY = y;
        const row = [
          idx + 1,
          it.amount,
          it.category || it.source || "-",
          new Date(it.date).toLocaleDateString(),
          it.note || "-",
        ];

        row.forEach((text, i) => {
          doc.text(String(text), colX[i], rowY, {
            width: colWidths[i],
            align: "left",
          });
        });

        y += 18;
        doc.moveTo(50, y - 2).lineTo(560, y - 2).strokeColor("#e0e0e0").stroke().strokeColor("black");

        if (y > 720) {
          doc.addPage();
          y = 50;
        }
      });

      // summary
      const total = items.reduce((sum, it) => sum + Number(it.amount), 0);
      y += 20;
      doc.font("Helvetica-Bold").fontSize(12);
      doc.text(`Total ${title}: ${total}`, { align: "right" });

      return y + 40; // return next Y position
    };

    // ===== Render content =====
    if (scope === "Combined Report" || scope.toLowerCase().includes("combined")) {
      const incomes = data.filter(d => d.type === "Income");
      const expenses = data.filter(d => d.type === "Expense");

      let y = 120;
      if (incomes.length) y = renderTable(incomes, "Income", y);
      if (expenses.length) y = renderTable(expenses, "Expenses", y);
    } else {
      renderTable(data, scope, 120);
    }

    // ===== FOOTER =====
    const range = filterInfo.range || "N/A";
    const footer = (page, pages) => {
      doc.fontSize(9).fillColor("gray")
        .text(`Generated on ${new Date().toLocaleDateString()} | Range: ${range}`, 50, 760, {
          align: "left",
        });
      doc.text(`Page ${page} of ${pages}`, 0, 760, {
        align: "right",
      });
    };

    const rangeCopy = doc.bufferedPageRange();
    for (let i = 0; i < rangeCopy.count; i++) {
      doc.switchToPage(i);
      footer(i + 1, rangeCopy.count);
    }

    doc.end();
  });
}

module.exports = { exportPDF };
