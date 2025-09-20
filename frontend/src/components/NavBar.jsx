"use client";

import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  GlobalStyles,
  Avatar,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { alpha } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import { getUser, removeUser } from "../utils/storage";
import { useTranslation } from "react-i18next"; // ✅ Import t

const NavBar = () => {
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation(); // ✅ Hook

  const checkLogin = () => {
    const u = getUser();
    setIsLoggedIn(!!u);
  };

  useEffect(() => {
    checkLogin();
    setMounted(true);

    const handleChange = () => checkLogin();
    window.addEventListener("storage", handleChange);
    window.addEventListener("userChange", handleChange);

    return () => {
      window.removeEventListener("storage", handleChange);
      window.removeEventListener("userChange", handleChange);
    };
  }, []);

  if (!mounted) return null;

  // ✅ Use t() keys here
  const navItems = isLoggedIn
    ? [t("home"), t("dashboard"), t("profile"), t("logout")]
    : [t("home"), t("login")];

  const handleNavClick = (item) => {
    setOpen(false);
    switch (item) {
      case t("home"):
        router.push("/");
        break;
      case t("dashboard"):
        router.push("/dashboard");
        break;
      case t("profile"):
        router.push("/profile");
        break;
      case t("login"):
        router.push("/loginpage");
        break;
      case t("logout"):
        removeUser();
        setIsLoggedIn(false);
        router.push("/loginpage");
        break;
      default:
        break;
    }
  };

  const lightAppBarBg = "#4E342E"
   const darkAppBarBg = theme.palette.primary?.main ?? "#6289aa";
  const appBarBg = theme.palette.mode === "dark" ? darkAppBarBg : lightAppBarBg;
  const appBarTextColor = theme.palette.getContrastText(appBarBg);
  const hoverBg = alpha(appBarBg, 0.12);

  return (
    <>
      <GlobalStyles
        styles={{
          "html, body": {
            margin: 0,
            padding: 0,
            backgroundColor: theme.palette.background.default,
            fontFamily: "'Roboto Serif', serif",
            color: theme.palette.text.primary,
          },
        }}
      />

      <AppBar
        position="fixed"
        elevation={0}
        sx={{ backgroundColor: appBarBg, color: appBarTextColor }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer" }}
            onClick={() => router.push("/")}
          >
            <Avatar
              src="/assets/logo.jpeg"
              alt="Finora Logo"
              sx={{
                width: 50,
                height: 50,
                bgcolor: "transparent",
                border: `1px solid ${alpha(appBarTextColor, 0.12)}`,
              }}
            />
            <Typography variant="h6" sx={{ fontWeight: "bold", fontSize: "1.25rem" }}>
              Finora
            </Typography>
          </Box>

          <Box sx={{ display: { xs: "none", sm: "flex" }, gap: 2 }}>
            {navItems.map((item) => (
              <Button
                key={item}
                onClick={() => handleNavClick(item)}
                sx={{
                  color: appBarTextColor,
                  textTransform: "none",
                  fontSize: "1.5rem",
                  fontWeight: 400,
                  "&:hover": { backgroundColor: hoverBg },
                }}
              >
                {item}
              </Button>
            ))}
          </Box>

          <IconButton
            edge="end"
            aria-label="menu"
            sx={{ display: { sm: "none" }, color: appBarTextColor }}
            onClick={() => setOpen(true)}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Toolbar />

      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <List sx={{ width: 180, bgcolor: theme.palette.background.paper }}>
          {navItems.map((item) => (
            <ListItem key={item} disablePadding>
              <ListItemButton onClick={() => handleNavClick(item)}>
                <ListItemText
                  primary={item}
                  primaryTypographyProps={{
                    fontWeight: "bold",
                    color: theme.palette.text.primary,
                    fontFamily: "'Roboto Serif', serif",
                    fontSize: "1.5rem",
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
    </>
  );
};

export default NavBar;
