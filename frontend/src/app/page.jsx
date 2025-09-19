"use client";

import React, { useState, useEffect } from "react";
import { Container, Grid, Box, Typography, Button } from "@mui/material";
import StatOverview from "../components/StatOverview";
import SavingsIcon from "@mui/icons-material/Savings";
import BarChartIcon from "@mui/icons-material/BarChart";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import SecurityIcon from "@mui/icons-material/Security";
import InsightsIcon from "@mui/icons-material/Insights";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import { useRouter } from "next/navigation";
import Footer from "../components/Footer";
import { useTranslation } from "react-i18next";

const Homepage = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Avoid SSR mismatch

  const features = [
    { title: t("expenses"), desc: t("expensesDesc"), icon: <AccountBalanceWalletIcon fontSize="large" color="primary" /> },
    { title: t("income"), desc: t("incomeDesc"), icon: <SavingsIcon fontSize="large" color="primary" /> },
    { title: t("reports"), desc: t("reportsDesc"), icon: <BarChartIcon fontSize="large" color="primary" /> },
  ];

  const whyFinora = [
    { text: t("focusedOnYou"), icon: <InsightsIcon color="primary" fontSize="large" /> },
    { text: t("clarityControl"), icon: <BarChartIcon color="primary" fontSize="large" /> },
    { text: t("holisticApproach"), icon: <PeopleAltIcon color="primary" fontSize="large" /> },
    { text: t("trustedPartner"), icon: <AccountBalanceWalletIcon color="primary" fontSize="large" /> },
    { text: t("securePrivate"), icon: <SecurityIcon color="primary" fontSize="large" /> },
  ];

  const resources = [
    { title: t("buildBetterHabits"), link: "https://dn790007.ca.archive.org/0/items/atomic-habits-pdfdrive/Atomic%20habits%20%28%20PDFDrive%20%29.pdf", img: "https://m.media-amazon.com/images/I/81wgcld4wxL.jpg" },
    { title: t("liveYourDreams"), link: "https://cdn.bookey.app/files/pdf/book/en/live-your-dreams.pdf", img: "/assets/dreams.jpg" },
    { title: t("businessIdeas"), link: "https://share.google/yRvj5APf2cFpJEoPx", img: "/assets/ideas.jpg" },
    { title: t("managingMoney"), link: "https://files.moneysmart.gov.au/media/rfidt2wm/managing-your-money.pdf", img: "/assets/money.jpg" },
  ];

  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      <Box flex={1}>
        {/* Hero Section */}
        <Box sx={{
          height: "100vh",
          backgroundImage: "url('/assets/hero.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          color: "white",
        }}>
          <Box sx={{ backgroundColor: "rgba(0,0,0,0.6)", p: 4, borderRadius: 3 }}>
            <Typography variant="h2" gutterBottom fontWeight="bold">{t("heroTitle")}</Typography>
            <Typography variant="h5" gutterBottom>{t("heroSubtitle")}</Typography>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              sx={{ mt: 3 }}
              onClick={() => router.push("/registerpage")}
            >
              {t("getStarted")}
            </Button>
          </Box>
        </Box>

        {/* Core Features */}
        <Container sx={{ py: 8 }}>
          <Typography variant="h4" align="center" gutterBottom fontWeight="bold">{t("coreFeatures")}</Typography>
          <Grid container spacing={3} justifyContent="center">
            {features.map((f, i) => (
              <Grid key={i} item xs={12} sm={6} md={4}><StatOverview {...f} /></Grid>
            ))}
          </Grid>
        </Container>

        {/* Why Finora */}
        <Box sx={{ backgroundColor: "#6f4e37", py: 8 }}>
          <Container>
            <Typography variant="h4" align="center" gutterBottom fontWeight="bold">{t("whyFinora")}</Typography>
            <Grid container spacing={3} justifyContent="center">
              {whyFinora.map((f, i) => (
                <Grid key={i} item xs={12} sm={6} md={4}><StatOverview title="" desc={f.text} icon={f.icon} /></Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* Resources */}
        <Container sx={{ py: 8 }}>
          <Typography variant="h4" align="center" gutterBottom fontWeight="bold">{t("exploreResources")}</Typography>
          <Grid container spacing={3} justifyContent="center">
            {resources.map((f, i) => (
              <Grid key={i} item xs={12} sm={6} md={3}><StatOverview {...f} /></Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
};

export default Homepage;
