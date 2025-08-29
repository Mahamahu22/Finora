// src/components/Footer.jsx
"use client";
import React from "react";
import { Box, Typography } from "@mui/material";

const Footer = () => {
  return (
    <Box sx={{ backgroundColor: "primary.main", color: "white", py: 3, textAlign: "center" }}>
      <Typography variant="body2">
        © {new Date().getFullYear()} Finora. All rights reserved.
      </Typography>
    </Box>
  );
};

export default Footer;
