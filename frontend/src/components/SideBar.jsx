"use client";

import React from "react";
import { Drawer, Box, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Avatar } from "@mui/material";

const Sidebar = ({ menuItems, pathname, user, onNavigate }) => (
  <Drawer
    variant="permanent"
    sx={{
      width: 240,
      flexShrink: 0,
      [`& .MuiDrawer-paper`]: {
        width: 240,
        bgcolor: "#6b4226",
        color: "white",
        display: "flex",
        flexDirection: "column",
      },
    }}
  >
    <Box p={2}>
      <Typography variant="h6" fontWeight="bold">FinoraHub</Typography>
    </Box>

    <Box sx={{ flexGrow: 1 }}>
      {menuItems.map((item) => (
        <ListItem key={item.text} disablePadding>
          <ListItemButton
            onClick={() => onNavigate(item.path)}
            sx={{
              width: "100%",
              bgcolor: pathname === item.path ? "#8d6e63" : "transparent",
              "&:hover": { bgcolor: "#a1887f" },
            }}
          >
            <ListItemIcon sx={{ color: "white", minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        </ListItem>
      ))}
    </Box>

    {/* User info */}
    <Box p={2} display="flex" alignItems="center">
      <Avatar sx={{ bgcolor: "#d9b382", mr: 1 }}>{(user?.name || "U")[0]}</Avatar>
      <Box>
        <Typography variant="body2">{user?.name || "User"}</Typography>
        <Typography variant="caption">Premium User</Typography>
      </Box>
    </Box>
  </Drawer>
);

export default Sidebar;
