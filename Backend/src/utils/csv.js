function toRow(obj) {
  return Object.values(obj).map(v => {
    const s = v == null ? "" : String(v);
    // basic CSV escape
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  }).join(",");
}

function exportCSV(arr) {
  if (!arr || !arr.length) return "id,amount,category,source,note,date,createdAt,updatedAt\n";
  const cols = ["id","amount","category","source","note","date","createdAt","updatedAt"];
  const lines = [cols.join(",")];
  for (const a of arr) {
    const row = {
      id: a.id || "",
      amount: a.amount ?? "",
      category: a.category ?? "",
      source: a.source ?? "",
      note: a.note ?? "",
      date: a.date ? new Date(a.date).toISOString() : "",
      createdAt: a.createdAt ? new Date(a.createdAt).toISOString() : "",
      updatedAt: a.updatedAt ? new Date(a.updatedAt).toISOString() : ""
    };
    lines.push(toRow(row));
  }
  return lines.join("\n");
}

module.exports = { exportCSV };
