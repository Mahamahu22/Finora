"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Box, Typography, Grid } from "@mui/material";

// icons
import DashboardIcon from "@mui/icons-material/Dashboard";
import SavingsIcon from "@mui/icons-material/Savings";
import MoneyOffIcon from "@mui/icons-material/MoneyOff";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SettingsIcon from "@mui/icons-material/Settings";

// helpers
import api from "../../utils/api";
import { removeUser } from "../../utils/storage";

// components
import Sidebar from "../../components/SideBar";
import DashboardSummary from "../../components/DashboardSummary";
import Footer from "../../components/Footer"; // import Footer only here

import { useUser } from "../../context/UserContext";

const Dashboard = () => {
  const router = useRouter();
  const pathname = usePathname();

  const { user } = useUser();
  const [report, setReport] = useState({
    totalIncome: 0,
    linkedExpenses: 0,
    generalExpenses: 0,
    balance: 0,
  });

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await api.get("/reports/summary");
        setReport(res.data.report ?? {});
      } catch (err) {
        if (err?.response?.status === 401) {
          removeUser();
          router.push("/loginpage");
          return;
        }
        console.error(err);
      }
    };
    fetchSummary();
  }, [router]);

  const currencyCode = user?.preferences?.currency ?? "INR";

  const formatMoney = useMemo(() => {
    const locale = currencyCode === "INR" ? "en-IN" : undefined;
    const maxFraction = currencyCode === "INR" ? 0 : 2;

    const formatter = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: maxFraction,
    });

    return (value) => formatter.format(value || 0);
  }, [currencyCode]);

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    { text: "Income", icon: <AttachMoneyIcon />, path: "/income" },
    { text: "Expenses", icon: <MoneyOffIcon />, path: "/expenses" },
    { text: "Reports", icon: <AssessmentIcon />, path: "/reports" },
    { text: "Settings", icon: <SettingsIcon />, path: "/settings" },
  ];

  const cards = [
    { icon: <AttachMoneyIcon color="success" fontSize="large" />, title: "Total Income", value: report.totalIncome },
    { icon: <MoneyOffIcon color="error" fontSize="large" />, title: "Linked Expenses", value: report.linkedExpenses },
    { icon: <SavingsIcon color="primary" fontSize="large" />, title: "General Expenses", value: report.generalExpenses },
    { icon: <AssessmentIcon color="secondary" fontSize="large" />, title: "Balance Amount", value: report.balance },
  ];

  return (
    <Box display="flex" flexDirection="column" minHeight="100vh" >
      {/* Main content wrapper */}
      <Box display="flex" flex={1}>
        <Sidebar menuItems={menuItems} pathname={pathname} onNavigate={(p) => router.push(p)} />

        <Box flex={1} p={3}>
          <Typography variant="h5" fontWeight="bold" mb={3}>
            Dashboard Overview
          </Typography>
          <Grid container spacing={3} alignItems="stretch">
            {cards.map((card, idx) => (
              <Grid item xs={12} sm={6} md={3} key={idx} sx={{ display: "flex" }}>
                <DashboardSummary icon={card.icon} title={card.title} value={card.value} format={formatMoney} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>

      {/* Footer only for Dashboard */}
      <Footer />
    </Box>
  );
};

export default Dashboard;
