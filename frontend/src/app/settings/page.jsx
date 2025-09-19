"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  OutlinedInput,
  InputAdornment,
  IconButton,
  Snackbar,
  Alert,
  useTheme,
} from "@mui/material";
import { useRouter, usePathname } from "next/navigation";
import SettingsIcon from "@mui/icons-material/Settings";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import TranslateIcon from "@mui/icons-material/Translate";

import Sidebar from "../../components/SideBar";
import CustomButton from "../../components/common/Button";
import { useThemeContext } from "../../context/ThemeContext";
import { useUser } from "../../context/UserContext";

import { useTranslation } from "react-i18next";
import "../../i18n"; // i18n configuration

const currencyOptions = [
  { code: "INR", label: "₹ INR" },
  { code: "USD", label: "$ USD" },
  { code: "EUR", label: "€ EUR" },
  { code: "GBP", label: "£ GBP" },
];

const languageOptions = [
  { code: "en", label: "English" },
  { code: "ta", label: "தமிழ்" },
];

export default function SettingsPage() {
  const { t, i18n, ready } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const { mode: themeMode, toggleTheme } = useThemeContext();
  const { user, updatePreferences, changePassword } = useUser();

  const [mounted, setMounted] = useState(false);
  const [currency, setCurrency] = useState("INR");
  const [language, setLanguage] = useState("en");
  const [openPwd, setOpenPwd] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({
    open: false,
    severity: "success",
    message: "",
  });

  // ✅ prevent hydration mismatch
  useEffect(() => setMounted(true), []);

  // ✅ load language from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("language") || "en";
      setLanguage(savedLang);
    }
  }, []);

  // ✅ sync i18n language
  useEffect(() => {
    if (ready && language && i18n.language !== language) {
      i18n.changeLanguage(language);
      if (typeof window !== "undefined") localStorage.setItem("language", language);
    }
  }, [language, i18n, ready]);

  // ✅ load user preferences
  useEffect(() => {
    if (user?.preferences) {
      if (user.preferences.currency) setCurrency(user.preferences.currency);
      if (user.preferences.language) setLanguage(user.preferences.language);
    }
  }, [user]);

  const menuItems = [
    { text: ready ? t("dashboard") : "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    { text: ready ? t("settings") : "Settings", icon: <SettingsIcon />, path: "/settings" },
  ];

  const handleSave = async () => {
    try {
      setLoading(true);
      const payload = { currency, theme: themeMode, language };
      const result = await updatePreferences(payload);
      setSnack({
        open: true,
        severity: result.success ? "success" : "error",
        message: result.success ? t("savePreferences") : t("Failed to save preferences"),
      });
      if (typeof window !== "undefined") localStorage.setItem("language", language);
    } catch {
      setSnack({ open: true, severity: "error", message: t("Failed to save preferences") });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      setSnack({ open: true, severity: "error", message: t("Both fields are required") });
      return;
    }
    try {
      setLoading(true);
      await changePassword({ oldPassword, newPassword });
      setSnack({ open: true, severity: "success", message: t("Password updated successfully") });
      setOpenPwd(false);
      setOldPassword("");
      setNewPassword("");
    } catch {
      setSnack({ open: true, severity: "error", message: t("Failed to update password") });
    } finally {
      setLoading(false);
    }
  };

  // ✅ prevent rendering before mounted or i18n ready
   useEffect(() => setMounted(true), []);

  if (!mounted || !ready) return <Box sx={{ minHeight: "100vh" }} />;

  return (
    <Box display="flex" minHeight="100vh" sx={{ backgroundColor: theme.palette.background.default, color: theme.palette.text.primary }}>
      <Sidebar menuItems={menuItems} pathname={pathname} onNavigate={(p) => router.push(p)} />

      <Box flex={1} p={4}>
        <Typography variant="h4" mb={3}>{t("settings")}</Typography>

        {/* Account Section */}
        <Paper sx={{ mb: 3, p: 3, backgroundColor: theme.palette.background.paper }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap={1}>
              <AccountCircleIcon />
              <Typography fontWeight="700">{t("account")}</Typography>
            </Box>
            <CustomButton variant="secondary" onClick={() => setOpenPwd(true)} sx={{ mr: 1 }}>
              {t("changePassword")}
            </CustomButton>
          </Box>
        </Paper>

        {/* Preferences Section */}
        <Paper sx={{ mb: 3, p: 4, backgroundColor: theme.palette.background.paper }}>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <SettingsIcon />
            <Typography variant="h6" fontWeight={700}>{t("preferences")}</Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>{t("currency")}</InputLabel>
                <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                  {currencyOptions.map((c) => <MenuItem key={c.code} value={c.code}>{c.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6} display="flex" alignItems="center" justifyContent="flex-end">
              <Typography sx={{ mr: 1 }}>{t("themeLightDark")}</Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={themeMode === "dark"}
                    onChange={() => {
                      const newMode = themeMode === "dark" ? "light" : "dark";
                      toggleTheme(newMode);
                      updatePreferences({ theme: newMode }).catch(console.error);
                    }}
                  />
                }
                label={themeMode === "dark" ? t("Dark") : t("Light")}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Language Section */}
        <Paper sx={{ mb: 3, p: 4, backgroundColor: theme.palette.background.paper }}>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <TranslateIcon />
            <Typography variant="h6" fontWeight={700}>{t("language")}</Typography>
          </Box>

          <FormControl fullWidth>
            <InputLabel>{t("language")}</InputLabel>
            <Select value={language} onChange={(e) => setLanguage(e.target.value)}>
              {languageOptions.map((lang) => <MenuItem key={lang.code} value={lang.code}>{lang.label}</MenuItem>)}
            </Select>
          </FormControl>
        </Paper>

        {/* Save Button */}
        <Box mt={3} display="flex" justifyContent="flex-end">
          <CustomButton onClick={handleSave} disabled={loading}>{t("savePreferences")}</CustomButton>
        </Box>
      </Box>

      {/* Change Password Dialog */}
      <Dialog open={openPwd} onClose={() => setOpenPwd(false)}>
        <DialogTitle>{t("changePassword")}</DialogTitle>
        <DialogContent>
          <OutlinedInput
            type={showOldPassword ? "text" : "password"}
            placeholder={t("Old Password")}
            fullWidth
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            sx={{ my: 1 }}
            endAdornment={
              <InputAdornment position="end">
                <IconButton onClick={() => setShowOldPassword((p) => !p)}>
                  {showOldPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
          />
          <OutlinedInput
            type={showNewPassword ? "text" : "password"}
            placeholder={t("New Password")}
            fullWidth
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            sx={{ my: 1 }}
            endAdornment={
              <InputAdornment position="end">
                <IconButton onClick={() => setShowNewPassword((p) => !p)}>
                  {showNewPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
          />
        </DialogContent>
        <DialogActions>
          <CustomButton variant="secondary" onClick={() => setOpenPwd(false)}>{t("cancel")}</CustomButton>
          <CustomButton onClick={handleChangePassword} disabled={loading}>{t("update")}</CustomButton>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
