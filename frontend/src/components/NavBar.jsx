"use client";
import React, { useState } from "react";
import { AppBar, Toolbar, Typography, Button, IconButton, Box, Drawer, List, ListItem, ListItemButton, ListItemText } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

const NavBar = () => {
  const [open, setOpen] = useState(false);

  const navItems = ["Dashboard", "Profile", "Logout"];

  return (
    <>
      <AppBar position="static" color="primary" elevation={0}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Finora
          </Typography>

          {/* Desktop navigation buttons */}
          <Box sx={{ display: { xs: "none", sm: "flex" }, gap: 2 }}>
            {navItems.map((item) => (
              <Button key={item} color="inherit">{item}</Button>
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

      {/* Mobile Drawer */}
      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <List sx={{ width: 200 }}>
          {navItems.map((text) => (
            <ListItem key={text} disablePadding>
              <ListItemButton onClick={() => setOpen(false)}>
                <ListItemText primary={text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
    </>
  );
};

export default NavBar;
