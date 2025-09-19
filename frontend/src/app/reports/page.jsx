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
import { useTranslation } from "react-i18next";

// Recharts dynamic imports
const ResponsiveContainer = dynamic(
  () => import("recharts").then((m) => m.ResponsiveContainer),
  { ssr: false }
);
const BarChart = dynamic(() => import("recharts").then((m) => m.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then((m) => m.Bar), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });
const Legend = dynamic(() => import("recharts").then((m) => m.Legend), { ssr: false });
const PieChart = dynamic(() => import("recharts").then((m) => m.PieChart), { ssr: false });
const Pie = dynamic(() => import("recharts").then((m) => m.Pie), { ssr: false });
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
import CustomCard from "../../components/common/Card";
import CustomButton from "../../components/common/Button";
import CustomTabs from "../../components/common/Tabs";
import Calendar from "../../components/common/Calendar";

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
  const { user } = useUser();
  const { t, ready } = useTranslation();

  // ✅ Always call hooks first
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState(0);
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [startDate, setStartDate] = useState(dayjs().startOf("month"));
  const [endDate, setEndDate] = useState(dayjs().endOf("month"));
  const [exportScope, setExportScope] = useState("all");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => setMounted(true), []);

  const currencyCode = user?.preferences?.currency ?? DEFAULT_CURRENCY;

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
    if (!mounted || !ready) return; // only fetch after client mount and i18n ready
    fetchMonthly();
    fetchCategory();
  }, [mounted, ready]);

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
          net: typeof r.net !== "undefined" ? r.net : (r.income || 0) - (r.expenses || 0),
        }));
        setMonthlyData(formatted);
      } else setMonthlyData([]);
    } catch (err) {
      if (err?.response?.status === 401) {
        removeUser();
        router.push("/loginpage");
        return;
      }
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
      } else setCategoryData([]);
    } catch (err) {
      setCategoryData([]);
    }
  };

  const buildRowsForExport = (items, scope) =>
    items.map((row) => {
      const guessedType =
        row.type ||
        (scope === "income"
          ? t("income")
          : scope === "expenses"
          ? t("expense")
          : row.source
          ? t("income")
          : t("expense"));
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

  const menuItems = [
    { text: t("dashboard"), icon: <DashboardIcon />, path: "/dashboard" },
    { text: t("income"), icon: <AttachMoneyIcon />, path: "/income" },
    { text: t("expenses"), icon: <MoneyOffIcon />, path: "/expenses" },
    { text: t("reports"), icon: <AssessmentIcon />, path: "/reports" },
    { text: t("settings"), icon: <SettingsIcon />, path: "/settings" },
  ];

  // Export handlers (stubbed)
  const handleExportPDF = (scope) => console.log("Export PDF:", scope);
  const handleExportCSV = (scope) => console.log("Export CSV:", scope);

  // ✅ Conditional render inside JSX
  if (!mounted || !ready) {
    return <Box p={3}>Loading...</Box>;
  }

  return (
    <Box display="flex" minHeight="100vh">
      <Sidebar menuItems={menuItems} pathname={pathname} user={user} onNavigate={router.push} />
      <Box flex={1} p={3}>
        <Typography variant="h5" fontWeight="bold" mb={3}>
          {t("reportsOverview")}
        </Typography>

        <CustomTabs
          value={tab}
          onChange={(v) => setTab(v)}
          tabs={[
            { label: t("monthlyTrends") },
            { label: t("categoryBreakdown") },
            { label: t("exportData") },
          ]}
        />

        <CustomCard sx={{ mb: 3, p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <Calendar
                label={t("startDate(MM/DD/YYYY)")}
                value={startDate}
                onChange={(val) => setStartDate(val || dayjs().startOf("month"))}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Calendar
                label={t("endDate(MM/DD/YYYY)")}
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
                {t("updateReport")}
              </CustomButton>
            </Grid>
          </Grid>
        </CustomCard>

        {/* Monthly Tab */}
        {tab === 0 && (
          <>
            <CustomCard sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ p: 2 }}>
                {t("incomeOverview")}
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="income" fill="#4caf50" name={t("income")} />
                  <Bar dataKey="expenses" fill="#f44336" name={t("expenses")} />
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
                {t("expenseDistributionByCategory")}
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={categoryData} dataKey="total" nameKey="category" outerRadius={120} label>
                    {categoryData.map((entry) => (
                      <Cell
                        key={entry.category}
                        fill={CATEGORY_COLORS[entry.category?.trim().toLowerCase()] || "#BDBDBD"}
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
            <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
              <IosShareIcon /> {t("exportData")}
            </Typography>
            <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Grid item xs={12} sm={4}>
                <select
                  value={exportScope}
                  onChange={(e) => setExportScope(e.target.value)}
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                >
                  <option value="all">{t("all")}</option>
                  <option value="income">{t("income")}</option>
                  <option value="expenses">{t("expenses")}</option>
                </select>
              </Grid>
              <Grid item xs={12} sm={4}>
                <CustomButton
                  variant="danger"
                  startIcon={<PictureAsPdfIcon />}
                  onClick={() => handleExportPDF(exportScope)}
                  disabled={downloading}
                >
                  {t("exportPDF")}
                </CustomButton>
              </Grid>
              <Grid item xs={12} sm={4}>
                <CustomButton
                  variant="primary"
                  startIcon={<TableChartIcon />}
                  onClick={() => handleExportCSV(exportScope)}
                  disabled={downloading}
                >
                  {t("exportCSV")}
                </CustomButton>
              </Grid>
            </Grid>

            <Reports exportScope={exportScope} startDate={startDate} endDate={endDate} formatter={formatter} />
          </CustomCard>
        )}
      </Box>
    </Box>
  );
};

export default Reportspage;
