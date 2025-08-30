"use client";
import React, { useState } from "react";
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
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useRouter } from "next/navigation";

const NavBar = () => {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // Add "Home" to the nav items
  const navItems = ["Home", "Dashboard", "Profile", "Logout"];

  // Handle navigation click
  const handleNavClick = (item) => {
    setOpen(false); // close drawer if open
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
      case "Logout":
        localStorage.removeItem("user");
        router.push("/loginpage");
        break;
      default:
        break;
    }
  };

  return (
    <>
      {/* Fix body default margin/padding */}
      <GlobalStyles
        styles={{
          "html, body": {
            margin: 0,
            padding: 0,
            backgroundColor: "#d7ccc8", // light brown background
          },
        }}
      />

      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          backgroundColor: "#4E342E", // dark brown navbar
          margin: 0,
          padding: 0,
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", cursor: "pointer" }}
            onClick={() => router.push("/")}
          >
            Finora
          </Typography>

          {/* Desktop navigation buttons */}
          <Box sx={{ display: { xs: "none", sm: "flex" }, gap: 2 }}>
            {navItems.map((item) => (
              <Button
                key={item}
                color="inherit"
                onClick={() => handleNavClick(item)}
              >
                {item}
              </Button>
            ))}
          </Box>

          {/* Mobile hamburger menu */}
          <IconButton
            edge="end"
            color="inherit"
            sx={{ display: { sm: "none" } }}
            onClick={() => setOpen(true)}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Add Toolbar spacer so content is not hidden behind fixed navbar */}
      <Toolbar />

      {/* Mobile Drawer */}
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