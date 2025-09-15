"use client";
import React from "react";
import { Box, Typography } from "@mui/material";

const Footer = () => {
  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        backgroundColor: "primary.main",
        color: "white",
        py: 2,
        textAlign: "center",
        // pushes footer down
      }}
    >
      <Typography variant="body2">
        © {new Date().getFullYear()} Finora. All rights reserved.
      </Typography>
    </Box>
  );
};

export default Footer;