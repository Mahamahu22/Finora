"use client";
import React, { useState, useEffect } from "react";
import {
  AppBar, Toolbar, Typography, Button, IconButton,
  Box, Drawer, List, ListItem, ListItemButton,
  ListItemText, GlobalStyles
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useRouter } from "next/navigation";
import { getUser, removeUser } from "../utils/storage"; // ✅ use helpers

const NavBar = () => {
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  const checkLogin = () => {
    const user = getUser();
    setIsLoggedIn(!!user);
  };

  useEffect(() => {
    checkLogin();
    setMounted(true);

    // ✅ Listen to both storage changes & custom event
    const handleChange = () => checkLogin();
    window.addEventListener("storage", handleChange);
    window.addEventListener("userChange", handleChange);

    return () => {
      window.removeEventListener("storage", handleChange);
      window.removeEventListener("userChange", handleChange);
    };
  }, []);

  if (!mounted) return null; // prevent hydration mismatch

  const navItems = isLoggedIn
    ? ["Home", "Dashboard", "Profile", "Logout"]
    : ["Home", "Login"];

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
        removeUser();   // ✅ use helper, triggers userChange
        setIsLoggedIn(false);
        router.push("/loginpage");
        break;
      default:
        break;
    }
  };

  return (
    <>
      <GlobalStyles styles={{ "html, body": { margin: 0, padding: 0, backgroundColor: "#d7ccc8" } }} />

      <AppBar position="fixed" elevation={0} sx={{ backgroundColor: "#4E342E", margin: 0, padding: 0 }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", cursor: "pointer" }}
            onClick={() => router.push("/")}>
            Finora
          </Typography>

          {/* Desktop Nav */}
          <Box sx={{ display: { xs: "none", sm: "flex" }, gap: 2 }}>
            {navItems.map((item) => (
              <Button key={item} color="inherit" onClick={() => handleNavClick(item)}>
                {item}
              </Button>
            ))}
          </Box>

          {/* Mobile Nav */}
          <IconButton edge="end" color="inherit" sx={{ display: { sm: "none" } }}
            onClick={() => setOpen(true)}>
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Toolbar />

      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <List sx={{ width: 200 }}>
          {navItems.map((item) => (
            <ListItem key={item} disablePadding>
              <ListItemButton onClick={() => handleNavClick(item)}>
                <ListItemText primary={item} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
    </>
  );
};

export default NavBar;
