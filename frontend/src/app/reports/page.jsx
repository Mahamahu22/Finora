"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Box, Typography, Grid } from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import TableChartIcon from "@mui/icons-material/TableChart";
import IosShareIcon from "@mui/icons-material/IosShare";
import dayjs from "dayjs";
import dynamic from "next/dynamic";
import { useUser } from "../../context/UserContext";

// Recharts dynamic imports
const ResponsiveContainer = dynamic(
  () => import("recharts").then((m) => m.ResponsiveContainer),
  { ssr: false }
);
const BarChart = dynamic(() => import("recharts").then((m) => m.BarChart), {
  ssr: false,
});
const Bar = dynamic(() => import("recharts").then((m) => m.Bar), {
  ssr: false,
});
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), {
  ssr: false,
});
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), {
  ssr: false,
});
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), {
  ssr: false,
});
const Legend = dynamic(() => import("recharts").then((m) => m.Legend), {
  ssr: false,
});
const PieChart = dynamic(() => import("recharts").then((m) => m.PieChart), {
  ssr: false,
});
const Pie = dynamic(() => import("recharts").then((m) => m.Pie), {
  ssr: false,
});
import { Cell } from "recharts";

// Icons
import DashboardIcon from "@mui/icons-material/Dashboard";
import MoneyOffIcon from "@mui/icons-material/MoneyOff";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SettingsIcon from "@mui/icons-material/Settings";

// Helpers
import api from "../../utils/api";
import { removeUser } from "../../utils/storage";

// Components
import Sidebar from "../../components/SideBar";
import Reports from "../../components/Reports.jsx";

// ✅ Your reusable components
import CustomCard from "../../components/common/Card";
import CustomButton from "../../components/common/Button";
import CustomTabs from "../../components/common/Tabs";
import Calendar from "../../components/common/Calendar";
import { CustomAutoTable } from "../../components/common/CustomAutoTable";

// Category colors
const CATEGORY_COLORS = {
  food: "#d99b3dff",
  transport: "#304556ff",
  shopping: "#5f3b65ff",
  bills: "#445b45ff",
  entertainment: "#804d5eff",
  other: "#694336ff",
};

const DEFAULT_CURRENCY = "INR";

const Reportspage = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUser(); // read user from context

  const [tab, setTab] = useState(0);
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [startDate, setStartDate] = useState(dayjs().startOf("month"));
  const [endDate, setEndDate] = useState(dayjs().endOf("month"));
  const [exportScope, setExportScope] = useState("all");
  const [downloading, setDownloading] = useState(false);

  // currency code from user preferences
  const currencyCode = user?.preferences?.currency ?? DEFAULT_CURRENCY;

  // formatter updates when currencyCode changes
  const formatter = useMemo(() => {
    const locale = currencyCode === "INR" ? "en-IN" : undefined;
    const maximumFractionDigits = currencyCode === "INR" ? 0 : 2;
    const nf = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits,
    });
    return (val) => nf.format(Number(val || 0));
  }, [currencyCode]);

  useEffect(() => {
    fetchMonthly();
    fetchCategory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMonthly = async () => {
    try {
      const res = await api.get("/reports/monthly", {
        params: {
          startDate: startDate.format("YYYY-MM-DD"),
          endDate: endDate.format("YYYY-MM-DD"),
        },
      });
      if (res?.data?.status === "success" && Array.isArray(res.data.report)) {
        const formatted = res.data.report.map((r) => ({
          month: new Date(r.year, r.month - 1).toLocaleString("default", {
            month: "long",
            year: "numeric",
          }),
          income: r.income || 0,
          expenses: r.expenses || 0,
          net:
            typeof r.net !== "undefined"
              ? r.net
              : (r.income || 0) - (r.expenses || 0),
        }));
        setMonthlyData(formatted);
      } else {
        setMonthlyData([]);
      }
    } catch (err) {
      if (err?.response?.status === 401) {
        removeUser();
        router.push("/loginpage");
        return;
      }
      console.error("fetchMonthly error:", err);
      setMonthlyData([]);
    }
  };

  const fetchCategory = async () => {
    try {
      const res = await api.get("/reports/category", {
        params: {
          startDate: startDate.format("YYYY-MM-DD"),
          endDate: endDate.format("YYYY-MM-DD"),
        },
      });
      if (res?.data?.status === "success") {
        setCategoryData(res.data.report?.categories || []);
      } else {
        setCategoryData([]);
      }
    } catch (err) {
      console.error("fetchCategory error:", err);
      setCategoryData([]);
    }
  };

  // ---------- Export helpers ----------
  const buildRowsForExport = (items, scope) => {
    return items.map((row) => {
      const guessedType =
        row.type ||
        (scope === "income"
          ? "Income"
          : scope === "expenses"
          ? "Expense"
          : row.source
          ? "Income"
          : "Expense");

      return {
        date: row.date ? dayjs(row.date).format("DD-MM-YYYY") : "-",
        type: guessedType,
        amount: row.amount || 0,
        formattedAmount: formatter(row.amount || 0),
        catOrSource: row.category || row.source || "-",
        note: row.note || "-",
        id: row.id || row._id || "",
      };
    });
  };

  const handleExportPDF = async (scope = exportScope) => {
    try {
      setDownloading(true);
      const res = await api.get("/reports/export", {
        params: {
          scope,
          startDate: startDate.format("YYYY-MM-DD"),
          endDate: endDate.format("YYYY-MM-DD"),
        },
      });

      if (!res?.data || res.data.status !== "success") {
        throw new Error("Failed to fetch export data");
      }

      const items = res.data.data || [];
      // provide formatted amount to CustomAutoTable so PDF shows currency symbol
      const formattedItems = items.map((i) => ({ ...i, amount: formatter(i.amount || 0) }));
      CustomAutoTable(formattedItems, scope, { startDate, endDate }, "report");
    } catch (err) {
      if (err?.response?.status === 401) {
        removeUser();
        router.push("/loginpage");
        return;
      }
      console.error("handleExportPDF error:", err);
      alert("Error exporting PDF. Check console for details.");
    } finally {
      setDownloading(false);
    }
  };

  const handleExportCSV = async (scope = exportScope) => {
  try {
    setDownloading(true);
    const res = await api.get("/reports/export", {
      params: {
        scope,
        startDate: startDate.format("YYYY-MM-DD"),
        endDate: endDate.format("YYYY-MM-DD"),
      },
    });

    if (!res?.data || res.data.status !== "success") {
      throw new Error("Failed to fetch export data");
    }

    const items = res.data.data || [];
    const rows = buildRowsForExport(items, scope);

    // CSV header (remove formatted amount)
    const header = [
      "Date",
      "Type",
      "Note",
      "Category/Source",
      "Amount"
    ];

    const BOM = "\uFEFF";
    const csvLines = [];
    csvLines.push(
      BOM + header.map((h) => `"${h.replace(/"/g, '""')}"`).join(",")
    );

    const parseNumber = (v) => {
      if (v == null || v === "") return 0;
      const cleaned = String(v).replace(/,/g, "").trim();
      const parsed = parseFloat(cleaned);
      return Number.isFinite(parsed) ? parsed : 0;
    };

    rows.forEach((r) => {
      const numericAmount = parseNumber(r.amount);
      const cols = [
        `"\'${r.date ? dayjs(r.date).format("DD-MM-YYYY") : "-"}"`,
        `"${(r.type || "-").replace(/"/g, '""')}"`,
        `"${(r.note || "-").replace(/"/g, '""')}"`,
        `"${(r.catOrSource || "-").replace(/"/g, '""')}"`,
        `"${numericAmount}"`,
      ];
      csvLines.push(cols.join(","));
    });

    // Totals
    const totalIncome = rows
      .filter((r) => String(r.type || "").toLowerCase() === "income")
      .reduce((s, a) => s + parseNumber(a.amount), 0);
    const totalExpense = rows
      .filter((r) => String(r.type || "").toLowerCase() === "expense")
      .reduce((s, a) => s + parseNumber(a.amount), 0);
    const net = totalIncome - totalExpense;

    csvLines.push(`"","","","",""`);
    csvLines.push(`"Total Income","","","", "${totalIncome}"`);
    csvLines.push(`"Total Expense","","","", "${totalExpense}"`);
    csvLines.push(`"Net Balance","","","", "${net}"`);

    const csvString = csvLines.join("\r\n");

    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `report_${scope}_${startDate.format("YYYYMMDD")}_${endDate.format(
        "YYYYMMDD"
      )}.csv`
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    if (err?.response?.status === 401) {
      removeUser();
      router.push("/loginpage");
      return;
    }
    console.error("handleExportCSV error:", err);
    alert("Error exporting CSV. Check console for details.");
  } finally {
    setDownloading(false);
  }
};



  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    { text: "Income", icon: <AttachMoneyIcon />, path: "/income" },
    { text: "Expenses", icon: <MoneyOffIcon />, path: "/expenses" },
    { text: "Reports", icon: <AssessmentIcon />, path: "/reports" },
    { text: "Settings", icon: <SettingsIcon />, path: "/settings" },
  ];

  return (
    <Box display="flex" minHeight="100vh">
      <Sidebar
        menuItems={menuItems}
        pathname={pathname}
        user={user}
        onNavigate={(p) => router.push(p)}
      />
      <Box flex={1} p={3}>
        <Typography variant="h5" fontWeight="bold" mb={3}>
          Reports Overview
        </Typography>

        {/* ✅ Tabs */}
        <CustomTabs
          value={tab}
          onChange={(v) => setTab(v)}
          tabs={[
            { label: "Monthly Trends" },
            { label: "Category Breakdown" },
            { label: "Export Data" },
          ]}
        />

        {/* ✅ Date Filter */}
        <CustomCard sx={{ mb: 3, p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <Calendar
                label="Start Date(MM-DD-YYYY)"
                value={startDate}
                onChange={(val) => setStartDate(val || dayjs().startOf("month"))}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Calendar
                label="End Date(MM-DD-YYYY)"
                value={endDate}
                onChange={(val) => setEndDate(val || dayjs().endOf("month"))}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <CustomButton
                variant="primary"
                onClick={() => {
                  if (tab === 0) fetchMonthly();
                  else if (tab === 1) fetchCategory();
                }}
              >
                Update Report
              </CustomButton>
            </Grid>
          </Grid>
        </CustomCard>

        {/* Monthly Tab */}
        {tab === 0 && (
          <>
            <CustomCard sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ p: 2 }}>
                Income vs Expenses
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="income" fill="#4caf50" name="Income" />
                  <Bar dataKey="expenses" fill="#f44336" name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            </CustomCard>
            <Reports type="monthly" data={monthlyData} formatter={formatter} />
          </>
        )}

        {/* Category Tab */}
        {tab === 1 && (
          <>
            <CustomCard sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ p: 2 }}>
                Expense Distribution by Category
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="total"
                    nameKey="category"
                    outerRadius={120}
                    label
                  >
                    {categoryData.map((entry) => (
                      <Cell
                        key={entry.category}
                        fill={
                          CATEGORY_COLORS[entry.category?.trim().toLowerCase()] ||
                          "#BDBDBD"
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CustomCard>
            <Reports type="category" data={categoryData} formatter={formatter} />
          </>
        )}

        {/* Export Tab */}
        {tab === 2 && (
          <CustomCard sx={{ mb: 3, p: 2 }}>
            <Typography
              variant="h6"
              gutterBottom
              display="flex"
              alignItems="center"
              gap={1}
            >
              <IosShareIcon /> Export Reports
            </Typography>

            <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Grid item xs={12} sm={4}>
                <select
                  value={exportScope}
                  onChange={(e) => setExportScope(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                  }}
                >
                  <option value="all">All</option>
                  <option value="income">Income</option>
                  <option value="expenses">Expenses</option>
                </select>
              </Grid>
              <Grid item xs={12} sm={4}>
                <CustomButton
                  variant="danger"
                  startIcon={<PictureAsPdfIcon />}
                  onClick={() => handleExportPDF(exportScope)}
                  disabled={downloading}
                >
                  Export PDF
                </CustomButton>
              </Grid>

              <Grid item xs={12} sm={4}>
                <CustomButton
                  variant="primary"
                  startIcon={<TableChartIcon />}
                  onClick={() => handleExportCSV(exportScope)}
                  disabled={downloading}
                >
                  Export CSV
                </CustomButton>
              </Grid>
            </Grid>

            <Reports
              exportScope={exportScope}
              startDate={startDate}
              endDate={endDate}
              formatter={formatter}
            />
          </CustomCard>
        )}
      </Box>
    </Box>
  );
};

export default Reportspage;
