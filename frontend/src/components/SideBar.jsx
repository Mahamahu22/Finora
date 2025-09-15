"use client";

import React, { useEffect, useState } from "react";
import {
  Drawer,
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  IconButton,
  useTheme,
  useMediaQuery,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useUser } from "../context/UserContext";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

const Sidebar = ({ menuItems = [], pathname = "/", onNavigate = () => {} }) => {
  const { user } = useUser();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const unwrapUser = (u) => {
    if (!u) return null;
    if (typeof u === "object") {
      if (u.user && (u.user.name || u.user.email || u.user.id)) return u.user;
      return u;
    }
    return null;
  };

  const actualUser = unwrapUser(user);
  const displayName = mounted
    ? (actualUser?.name ||
       actualUser?.fullName ||
       actualUser?.username ||
       actualUser?.email ||
       "")
    : "";
  const initial = displayName ? displayName.trim().charAt(0).toUpperCase() : "U";

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Roboto', sans-serif",
      }}
    >
      {/* App Title */}
      <Box p={2}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
            fontSize: "1.5rem",
            letterSpacing: "0.5px",
            fontFamily: "'Roboto', sans-serif",
          }}
        >
          FinoraHub
        </Typography>
      </Box>

      <Divider sx={{ bgcolor: "#fff" }} />

      {/* Menu Items */}
      <Box sx={{ flexGrow: 1 }}>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => {
                  onNavigate(item.path);
                  if (isMobile) setMobileOpen(false);
                }}
                sx={{
                  width: "100%",
                  borderRadius: 1,
                  mb: 1,
                  bgcolor: pathname === item.path ? "#8d6e63" : "transparent",
                  "&:hover": { bgcolor: "#a1887f" },
                }}
              >
                <ListItemIcon sx={{ color: "#fff", minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    sx: {
                      color: "#fff",
                      fontSize: 18,
                      fontWeight: "bold",
                      letterSpacing: "0.3px",
                      fontFamily: "'Roboto', sans-serif",
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      <Divider sx={{ bgcolor: "#fff" }} />

      {/* User Section */}
      <Box p={2} display="flex" alignItems="center">
        <Avatar
          sx={{
            bgcolor: "#d9b382",
            color: "#4c3006ff",
            mr: 1,
            fontFamily: "'Roboto', sans-serif",
            fontWeight: "bold",
          }}
        >
          {mounted ? initial : null}
        </Avatar>
        <Box>
          <Typography
            variant="body2"
            sx={{
              color: "#fff",
              fontWeight: "bold",
              fontSize: "0.9rem",
              letterSpacing: "0.2px",
              fontFamily: "'Roboto', sans-serif",
            }}
          >
            {mounted ? displayName || "User" : "User"}
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <>
      {isMobile && !mobileOpen && (
        <IconButton
          onClick={() => setMobileOpen(true)}
          sx={{
            position: "fixed",
            top: 16,
            left: 16,
            zIndex: 1400,
            bgcolor: "#6b4226",
            "&:hover": { bgcolor: "#8d6e63" },
          }}
        >
          <MenuIcon sx={{ color: "#fff" }} />
        </IconButton>
      )}

      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? mobileOpen : true}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: 240,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: 240,
            bgcolor: "#6b4226",
            color: "#fff",
            display: "flex",
            flexDirection: "column",
            fontFamily: "'Roboto', sans-serif",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Sidebar;
