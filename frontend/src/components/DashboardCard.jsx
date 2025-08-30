"use client";

import React from "react";
import { Card, Box, Avatar, Typography } from "@mui/material";

const DashboardCard = ({ icon, title, value, format }) => (
  <Card
    sx={{
      flex: 1,
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      p: 2,
      borderRadius: 2,
      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      transition: "transform 0.18s, box-shadow 0.18s",
      "&:hover": {
        transform: "translateY(-4px)",
        boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
      },
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Avatar sx={{ bgcolor: "transparent", color: "inherit" }}>{icon}</Avatar>
    </Box>
    <Box sx={{ textAlign: "right", ml: 1 }}>
      <Typography variant="subtitle2" color="text.secondary">{title}</Typography>
      <Typography variant="h6" fontWeight="bold">{format(value)}</Typography>
    </Box>
  </Card>
);

export default DashboardCard;
