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

import Sidebar from "../../components/SideBar";
import CustomButton from "../../components/common/Button";
import { useThemeContext } from "../../context/ThemeContext";
import { useUser } from "../../context/UserContext";

const currencyOptions = [
  { code: "INR", label: "₹ INR" },
  { code: "USD", label: "$ USD" },
  { code: "EUR", label: "€ EUR" },
  { code: "GBP", label: "£ GBP" },
];

export default function SettingsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const { mode: themeMode, toggleTheme } = useThemeContext();
  const { user, updatePreferences, changePassword } = useUser();

  const [currency, setCurrency] = useState("INR");

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

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    { text: "Settings", icon: <SettingsIcon />, path: "/settings" },
  ];

  useEffect(() => {
    const prefs = user?.preferences || {};
    if (prefs.currency) setCurrency(prefs.currency);
  }, [user]);

  const handleSave = async () => {
    try {
      setLoading(true);
      const payload = { currency, theme: themeMode };

      const result = await updatePreferences(payload);
      if (result.success) {
        setSnack({
          open: true,
          severity: "success",
          message: "Preferences saved successfully",
        });
      } else {
        throw result.error || new Error("Failed to update preferences");
      }
    } catch (err) {
      console.error(err);
      setSnack({
        open: true,
        severity: "error",
        message: err?.message || "Failed to save preferences",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChangePassword = () => setOpenPwd(true);
  const handleCloseChangePassword = () => {
    setOpenPwd(false);
    setOldPassword("");
    setNewPassword("");
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      setSnack({
        open: true,
        severity: "error",
        message: "Both fields are required",
      });
      return;
    }

    try {
      setLoading(true);
      await changePassword({ oldPassword, newPassword });
      setSnack({
        open: true,
        severity: "success",
        message: "Password updated successfully",
      });
      handleCloseChangePassword();
    } catch (err) {
      console.error(err);
      if (err?.response) {
        const { status, data } = err.response;
        if (status === 400 && data?.error === "incorrect_old_password") {
          setSnack({
            open: true,
            severity: "error",
            message: "Old password is incorrect",
          });
        } else if (status === 400 && data?.error) {
          setSnack({ open: true, severity: "error", message: data.error });
        } else {
          setSnack({
            open: true,
            severity: "error",
            message: "Failed to update password",
          });
        }
      } else {
        setSnack({
          open: true,
          severity: "error",
          message: "Failed to update password",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      display="flex"
      minHeight="100vh"
      sx={{
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
      }}
    >
      <Sidebar
        menuItems={menuItems}
        pathname={pathname}
        onNavigate={(p) => router.push(p)}
      />

      <Box flex={1} p={4}>
        <Typography variant="h4" mb={3}>
          Settings
        </Typography>

        {/* Account Section */}
        <Paper
          sx={{
            mb: 3,
            p: 3,
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap={1}>
              <AccountCircleIcon />
              <Typography fontWeight="700">Account</Typography>
            </Box>
            <Box>
              <CustomButton
                variant="secondary"
                onClick={handleOpenChangePassword}
                sx={{ mr: 1 }}
              >
                Change Password
              </CustomButton>
            </Box>
          </Box>
        </Paper>

        {/* Preferences Section */}
        <Paper
          sx={{
            mb: 3,
            p: 4,
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
          }}
        >
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <SettingsIcon />
            <Typography variant="h6" fontWeight={700}>
              Preferences
            </Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Currency</InputLabel>
                <Select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  {currencyOptions.map((c) => (
                    <MenuItem key={c.code} value={c.code}>
                      {c.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid
              item
              xs={12}
              md={6}
              display="flex"
              alignItems="center"
              justifyContent="flex-end"
            >
              <Typography sx={{ mr: 1 }}>Theme</Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={themeMode === "dark"}
                    onChange={(e) => {
                      const newMode = e.target.checked ? "dark" : "light";
                      toggleTheme(newMode);
                      updatePreferences({ theme: newMode }).catch(console.error);
                    }}
                  />
                }
                label={themeMode === "dark" ? "Dark" : "Light"}
              />
            </Grid>
          </Grid>

          <Box mt={3} display="flex" justifyContent="flex-end">
            <CustomButton onClick={handleSave} disabled={loading}>
              Save Preferences
            </CustomButton>
          </Box>
        </Paper>
      </Box>

      {/* Change Password Dialog */}
      <Dialog open={openPwd} onClose={handleCloseChangePassword}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <OutlinedInput
            type={showOldPassword ? "text" : "password"}
            placeholder="Old Password"
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
            placeholder="New Password"
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
          <CustomButton variant="secondary" onClick={handleCloseChangePassword}>
            Cancel
          </CustomButton>
          <CustomButton onClick={handleChangePassword} disabled={loading}>
            Update
          </CustomButton>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={snack.severity}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
