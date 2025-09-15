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

const NavBar = () => {
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const theme = useTheme();

  // Check login from localStorage helper
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

  // Avoid hydration mismatch
  if (!mounted) return null;

  const navItems = isLoggedIn ? ["Home", "Dashboard", "Profile", "Logout"] : ["Home", "Login"];

  const handleNavClick = (item) => {
    setOpen(false);
    switch (item) {
      case "Home":
        router.push("/");
        break;
      case "Dashboard":
        router.push("/dashboard");
        break;
      case "Profile":
        router.push("/profile");
        break;
      case "Login":
        router.push("/loginpage");
        break;
      case "Logout":
        removeUser();
        setIsLoggedIn(false);
        router.push("/loginpage");
        break;
      default:
        break;
    }
  };

  // Pick AppBar background:
  // - keep your brown for light mode
  // - use theme.palette.primary.main for dark mode (so it matches Footer)
  const lightAppBarBg = "#4E342E"; // existing brown for light
  const darkAppBarBg = theme.palette.primary?.main ?? "#6289aa"; // primary.main (fallback)
  const appBarBg = theme.palette.mode === "dark" ? darkAppBarBg : lightAppBarBg;

  // Text that contrasts with appBarBg
  const appBarTextColor = theme.palette.getContrastText(appBarBg);

  // Hover tint for buttons
  const hoverBg = alpha(appBarBg, 0.12);

  return (
    <>
      {/* Global font & page background follow theme */}
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
        sx={{
          backgroundColor: appBarBg,
          color: appBarTextColor,
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          {/* Brand */}
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

          {/* Desktop Nav */}
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

          {/* Mobile toggle */}
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

      {/* Spacer so page content isn't covered by fixed AppBar */}
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
